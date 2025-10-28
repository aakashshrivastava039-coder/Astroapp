import React, { useState, useCallback, useEffect } from 'react';
import { Technique, UserData, ChatMessage, PredictionResponse } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import LanguageSelector from './components/LanguageSelector';
import TechniqueSelector from './components/TechniqueSelector';
import UserInfoForm from './components/UserInfoForm';
import ChatWindow from './components/ChatWindow';
import DisclaimerModal from './components/DisclaimerModal';
import PalmistryScreen from './components/PalmistryScreen';
import VoiceChat from './components/VoiceChat';
import { getPredictionStream, getPalmistryPredictionStream } from './services/geminiService';
import { GREETINGS } from './constants';

type Screen = 'language' | 'technique' | 'form' | 'chat' | 'palmistry' | 'voiceChat';

const USER_DATA_KEY = 'vibeOracleUserData';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const [screen, setScreen] = useState<Screen>('language');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    setScreen('technique');
  };

  const handleTechniqueSelect = (technique: Technique) => {
    setSelectedTechnique(technique);
    const storedUserData = localStorage.getItem(USER_DATA_KEY);

    if (storedUserData) {
      try {
        const parsedData: Omit<UserData, 'language'> = JSON.parse(storedUserData);
        // Basic validation to ensure the parsed data has the required fields
        if (parsedData.name && parsedData.dob && parsedData.pob && parsedData.tob) {
            const fullUserData = { ...parsedData, language };
            setUserData(fullUserData);
            setShowDisclaimer(true); // Skip form, go to disclaimer
            return;
        }
      } catch (error) {
          console.error("Failed to parse user data from localStorage:", error);
          // If parsing fails, clear the invalid data and proceed to the form
          localStorage.removeItem(USER_DATA_KEY);
      }
    }
    
    setScreen('form'); // No data or invalid data, show form
  };

  const handleFormSubmit = (data: Omit<UserData, 'language'>) => {
    // Save user-input fields to localStorage, language is session-specific.
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    
    const fullUserData = { ...data, language };
    setUserData(fullUserData);
    setShowDisclaimer(true);
  };
  
  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    if (selectedTechnique?.id === 'palmistry') {
        setScreen('palmistry');
    } else {
        setScreen('chat');
        const greetingFn = GREETINGS[language] || GREETINGS['en'];
        const greetingText = greetingFn(userData?.name || 'Seeker', selectedTechnique?.name || 'Ancient Arts');

        setChatHistory([
          {
            id: crypto.randomUUID(),
            role: 'model',
            content: greetingText
          }
        ]);
    }
  }

  const handlePalmImageSubmit = useCallback(async (imageBase64: string) => {
    if (!userData || !selectedTechnique || isLoading) return;

    setScreen('chat');
    setIsLoading(true);

    const greetingFn = GREETINGS[language] || GREETINGS['en'];
    const greetingText = greetingFn(userData.name, selectedTechnique.name);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `(Here is my palm for analysis)`,
      palmistryAnalysis: { image: imageBase64 },
    };
    
    const modelMessageId = crypto.randomUUID();
    const initialModelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
    };
    
    // Atomically set the entire initial chat history for the palmistry flow
    setChatHistory([
        { id: crypto.randomUUID(), role: 'model', content: greetingText },
        userMessage,
        initialModelMessage
    ]);

    try {
      const finalResponse = await getPalmistryPredictionStream(
        { ...userData, language },
        imageBase64,
        (textChunk) => {
          setChatHistory(prev =>
            prev.map(msg =>
              msg.id === modelMessageId
                ? { ...msg, content: msg.content + textChunk }
                : msg
            )
          );
        }
      );
      
      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === modelMessageId
            ? {
                ...msg,
                content: finalResponse.replyText,
                buttons: finalResponse.buttons,
                palmistryAnalysis: finalResponse.palmistryAnalysis,
                suggestions: finalResponse.suggestions,
              }
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to get palmistry prediction:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: "My apologies, there was an issue analyzing the palm. Please try again.",
      };
      setChatHistory(prev => [...prev.filter(m => m.id !== modelMessageId), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, selectedTechnique, isLoading, language]);


  const handleSendMessage = useCallback(async (message: string) => {
    if (!userData || !selectedTechnique || isLoading) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
    };

    const modelMessageId = crypto.randomUUID();
    const initialModelMessage: ChatMessage = {
        id: modelMessageId,
        role: 'model',
        content: '',
    };
    
    // The history sent to the API should only contain the user's latest message, not the empty model shell.
    const historyForAPI = [...chatHistory, userMessage];

    // Atomically update the UI with both the user's message and the model's empty placeholder.
    setChatHistory(prev => [...prev, userMessage, initialModelMessage]);

    try {
      const finalResponse = await getPredictionStream(
        { ...userData, language },
        selectedTechnique,
        historyForAPI,
        message,
        (textChunk) => {
          setChatHistory(prev =>
            prev.map(msg =>
              msg.id === modelMessageId
                ? { ...msg, content: msg.content + textChunk }
                : msg
            )
          );
        }
      );
      
       setChatHistory(prev =>
            prev.map(msg =>
              msg.id === modelMessageId
                ? { ...msg, content: finalResponse.replyText, buttons: finalResponse.buttons, suggestions: finalResponse.suggestions }
                : msg
            )
          );

    } catch (error) {
      console.error("Failed to get prediction:", error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: "My apologies, a cosmic interference has occurred. Please try again.",
      };
      setChatHistory(prev => [...prev.filter(m => m.id !== modelMessageId), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, selectedTechnique, isLoading, chatHistory, language]);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    if(userData) {
      setUserData(prev => prev ? { ...prev, language: langCode } : null);
    }
  };
  
  const handleStartVoiceFromChat = () => {
    setScreen('voiceChat');
  };

  const handleEndVoiceSession = () => {
    setScreen('chat');
  };

  const resetApp = () => {
    localStorage.removeItem(USER_DATA_KEY);
    setScreen('language');
    setSelectedTechnique(null);
    setUserData(null);
    setChatHistory([]);
    setIsLoading(false);
    setShowDisclaimer(false);
  }

  const handleBack = useCallback(() => {
    if (screen === 'technique') {
      setScreen('language');
    } else if (screen === 'form' || screen === 'palmistry' || screen === 'voiceChat') {
        if (screen === 'voiceChat' && chatHistory.length > 0) {
            setScreen('chat'); // Go back to chat from voice if chat exists
        } else {
            setSelectedTechnique(null);
            setScreen('technique');
        }
    }
  }, [screen, chatHistory.length]);


  const renderScreen = () => {
    switch (screen) {
      case 'language':
        return <LanguageSelector onSelect={handleLanguageSelect} />;
      case 'technique':
        return <TechniqueSelector onSelect={handleTechniqueSelect} language={language} />;
      case 'form':
        return <UserInfoForm technique={selectedTechnique!} onSubmit={handleFormSubmit} language={language} />;
      case 'palmistry':
        return <PalmistryScreen onImageSubmit={handlePalmImageSubmit} language={language} />;
      case 'voiceChat':
        if (!userData || !selectedTechnique) {
          // This should not happen in the normal flow, but as a safeguard:
          console.error("Attempted to start voice chat without user data or technique.");
          setScreen('technique'); // Go back to a safe state
          return null;
        }
        return <VoiceChat 
                  userData={userData}
                  language={language} 
                  techniqueName={selectedTechnique.name}
                  chatHistory={chatHistory}
                  onEndSession={handleEndVoiceSession} 
                />;
      case 'chat':
        return <ChatWindow 
                  messages={chatHistory} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading}
                  techniqueName={selectedTechnique?.name || ''}
                  userName={userData?.name || 'Seeker'}
                  currentLanguage={language}
                  onStartVoiceChat={handleStartVoiceFromChat}
                />;
      default:
        return <LanguageSelector onSelect={handleLanguageSelect} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-gray-200">
      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} language={language} />}
      <Header 
        currentScreen={screen} 
        onLanguageChange={handleLanguageChange} 
        currentLanguage={language}
        onLogoClick={resetApp}
        onBack={handleBack}
        installPrompt={installPrompt}
        onInstallClick={handleInstallClick}
      />
      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 overflow-y-auto">
        {renderScreen()}
      </main>
      <Footer language={language} />
    </div>
  );
}

export default App;