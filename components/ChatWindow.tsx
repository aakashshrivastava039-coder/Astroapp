import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { OracleIcon } from './icons/OracleIcon';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { SpeakerPlayIcon } from './icons/SpeakerPlayIcon';
import { SpeakerStopIcon } from './icons/SpeakerStopIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { getSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { LOADING_MESSAGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';


const RenderMessageContent = React.memo(({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm prose-invert text-gray-300 max-w-none">
      {content.split('\n').map((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
          const cleanLine = line.trim().substring(2);
          const parts = cleanLine.split('**');
          return (
            <div key={index} className="flex items-start">
              <span className="mr-2 mt-1">•</span>
              <span>
                {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
              </span>
            </div>
          );
        }
        if (/^(🌟|🔮|✨|💫|\*\*सार:\*\*|\*\*मुख्य बातें:\*\*|\*\*सलाह:\*\*)/.test(line)) {
            const parts = line.split('**');
            return (
                <h3 key={index} className="flex items-center gap-2 text-xl font-bold text-purple-300 my-3">
                    {parts.map((part, i) => (i % 2 === 1 ? <span key={i}>{part}</span> : part))}
                </h3>
            );
        }
        const parts = line.split('**');
        return (
          <p key={index}>
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </p>
        );
      })}
    </div>
  );
});


interface MessageProps {
  message: ChatMessage;
  onPlayAudio: (messageId: string, text: string) => void;
  isPlaying: boolean;
  stopAudio: () => void;
  isSpeechLoading: boolean;
  onButtonClick: (buttonText: string) => void;
  isLoading?: boolean;
  loadingText?: string;
}

const Message: React.FC<MessageProps> = ({ message, onPlayAudio, isPlaying, stopAudio, isSpeechLoading, onButtonClick, isLoading, loadingText }) => {
    const isUser = message.role === 'user';
    const showLoadingIndicator = !isUser && isLoading && !message.content;

    const handlePlayClick = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            onPlayAudio(message.id, message.content);
        }
    };

    const [showOverlay, setShowOverlay] = useState(false);

    return (
        <div className={`flex gap-4 items-start ${isUser ? 'justify-end' : ''}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">
                    <OracleIcon className="w-5 h-5 text-white" />
                </div>
            )}
            <div className={`max-w-xl p-4 rounded-xl break-words ${isUser ? 'bg-purple-800/80 rounded-br-none' : 'bg-indigo-950/70 rounded-bl-none'}`}>
                 {showLoadingIndicator ? (
                    <div className="flex items-center gap-2 text-gray-400">
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        <span>{loadingText}</span>
                    </div>
                 ) : message.palmistryAnalysis?.image ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <img src={message.palmistryAnalysis.image} alt="Palm analysis" className="rounded-lg max-w-xs" />
                            {message.palmistryAnalysis.svgOverlay && showOverlay && (
                                <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: message.palmistryAnalysis.svgOverlay }} />
                            )}
                        </div>
                        {message.palmistryAnalysis.svgOverlay && (
                             <button onClick={() => setShowOverlay(!showOverlay)} className="text-xs bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-full transition-colors w-full">
                                {showOverlay ? 'Hide Overlays' : 'Show Overlays'}
                            </button>
                        )}
                        <RenderMessageContent content={message.content} />
                    </div>
                 ) : (
                    <RenderMessageContent content={message.content} />
                 )}

                 {message.buttons && (
                     <div className="mt-4 flex flex-wrap gap-2 border-t border-indigo-700/50 pt-3">
                         {Object.values(message.buttons).map((buttonText, index) => (
                           buttonText && <button key={index} onClick={() => onButtonClick(buttonText)} className="text-xs bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded-full transition-colors">{buttonText}</button>
                         ))}
                     </div>
                 )}
            </div>
            {!isUser && message.content && (
                 <button onClick={handlePlayClick} disabled={isSpeechLoading} className="self-center p-2 rounded-full hover:bg-indigo-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-wait" aria-label={isPlaying ? "Stop audio" : "Play audio"}>
                    {isSpeechLoading ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : (isPlaying ? <SpeakerStopIcon className="w-5 h-5" /> : <SpeakerPlayIcon className="w-5 h-5" />)}
                </button>
            )}
            {isUser && (
                 <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
};

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  techniqueName: string;
  userName: string;
  currentLanguage: string;
  onStartVoiceChat: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, currentLanguage, onStartVoiceChat }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isSpeechLoadingForId, setIsSpeechLoadingForId] = useState<string | null>(null);
  
  const [loadingText, setLoadingText] = useState('');
  const loadingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const messagesForLang = LOADING_MESSAGES[currentLanguage] || LOADING_MESSAGES['en'];
      let messageIndex = 0;
      setLoadingText(messagesForLang[messageIndex]);

      loadingIntervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % messagesForLang.length;
        setLoadingText(messagesForLang[messageIndex]);
      }, 2500);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading, currentLanguage]);

  useEffect(() => {
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    };
    initAudioContext();
    
    return () => {
        audioSourceRef.current?.stop();
        audioContextRef.current?.close();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setPlayingMessageId(null);
  }, []);

  const playAudio = useCallback(async (messageId: string, text: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    stopAudio();
    setIsSpeechLoadingForId(messageId);
    
    try {
      const base64Audio = await getSpeech(text);
      if (base64Audio && audioContext) {
        setPlayingMessageId(messageId);
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          if (playingMessageId === messageId) {
            setPlayingMessageId(null);
            audioSourceRef.current = null;
          }
        };
        source.start();
        audioSourceRef.current = source;
      }
    } catch (error) {
        console.error("Error playing audio:", error);
    } finally {
        setIsSpeechLoadingForId(null);
    }
  }, [stopAudio, playingMessageId]);

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = !isLoading && lastMessage?.role === 'model' && lastMessage.suggestions && lastMessage.suggestions.length > 0;
  const showSaveChatPrompt = !isAuthenticated && messages.length > 1 && !isLoading;

  const placeholderText = currentLanguage === 'hi' ? 'एक प्रश्न पूछें...' : 'Ask a question...';

  return (
    <div className="w-full max-w-4xl h-full flex flex-col bg-indigo-950/40 border border-indigo-800/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in relative">
      <div id="messages" className="flex-grow p-6 space-y-6 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 #1e1b4b' }}>
        {messages.map((msg, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <Message 
              key={msg.id} 
              message={msg}
              onPlayAudio={playAudio}
              isPlaying={playingMessageId === msg.id}
              stopAudio={stopAudio}
              isSpeechLoading={isSpeechLoadingForId === msg.id}
              onButtonClick={handleSuggestionClick}
              isLoading={isLoading && isLastMessage}
              loadingText={loadingText}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

       {showSaveChatPrompt && (
        <div className="p-4 border-t border-indigo-800/50 bg-indigo-950/60 text-center">
            <button
                onClick={openAuthModal}
                className="inline-flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                <BookmarkIcon className="w-5 h-5"/>
                Save this conversation
            </button>
        </div>
      )}

       {showSuggestions && (
        <div className="p-4 border-t border-indigo-800/50">
            <div className="flex flex-wrap justify-center gap-2">
            {lastMessage.suggestions!.map((suggestion, index) => (
                <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm bg-indigo-900/70 border border-indigo-700 hover:bg-indigo-800/90 px-4 py-2 rounded-full transition-colors"
                >
                {suggestion}
                </button>
            ))}
            </div>
        </div>
      )}
      <div className="p-4 bg-black/30 border-t border-indigo-800/50">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderText}
            disabled={isLoading}
            className="flex-grow bg-indigo-900 border-0 rounded-xl py-2.5 px-4 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-teal-500 text-white p-2.5 rounded-full hover:bg-teal-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 flex-shrink-0"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
