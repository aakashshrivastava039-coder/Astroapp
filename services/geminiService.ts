import { GoogleGenAI, Modality } from "@google/genai";
import { UserData, ChatMessage, Technique, PredictionResponse, LocalizedButtons } from '../types';

// IMPORTANT: For development, we'll initialize the API client here.
// This requires your Gemini API_KEY to be set in your environment variables.
// In a production app, this key should be kept secure on a backend server.
let ai: GoogleGenAI | null = null;
try {
  if(process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.error("API_KEY environment variable not set.");
  }
} catch(e) {
  console.error("Failed to initialize GoogleGenAI. Is the API_KEY set?", e);
}

function getOfflineMessage(language: string): string {
    const messages: { [key: string]: string } = {
        en: "You appear to be offline. Please check your connection to consult the cosmos.",
        hi: "आप ऑफ़लाइन लग रहे हैं। ब्रह्मांड से परामर्श करने के लिए कृपया अपना कनेक्शन जांचें।",
        es: "Parece que estás desconectado. Por favor, comprueba tu conexión para consultar el cosmos.",
        fr: "Vous semblez être hors ligne. Veuillez vérifier votre connexion pour consulter le cosmos.",
        mr: "तुम्ही ऑफलाइन आहात असे दिसते. ब्रह्मांडाचा सल्ला घेण्यासाठी कृपया तुमचे कनेक्शन तपासा.",
        ta: "நீங்கள் ஆஃப்லைனில் இருப்பதாகத் தெரிகிறது. பிரபஞ்சத்தைக் கலந்தாலோசிக்க உங்கள் இணைப்பைச் சரிபார்க்கவும்.",
    };
    return messages[language] || messages['en'];
}

/**
 * Generates a prediction by calling the Gemini API directly from the client.
 * This function streams the response for a faster user experience.
 * @param userData - The user's personal information for the prediction.
 * @param technique - The selected prediction technique.
 * @param chatHistory - The history of the conversation.
 * @param question - The latest question from the user.
 * @param onTextChunk - A callback function that receives text chunks as they are generated.
 * @returns A promise that resolves with the final PredictionResponse containing the full text and button data.
 */
export async function getPredictionStream(
  userData: UserData,
  technique: Technique,
  chatHistory: ChatMessage[],
  question: string,
  onTextChunk: (chunk: string) => void
): Promise<PredictionResponse> {
    if (!ai) {
        return { replyText: "The Oracle is currently unavailable. (API not initialized)" };
    }
    if (!navigator.onLine) {
        return { replyText: getOfflineMessage(userData.language) };
    }
    
    const currentDate = new Date().toLocaleDateString(userData.language, { year: 'numeric', month: 'long', day: 'numeric' });
    const systemInstruction = `You are the Vibe Oracle, a wise and empathetic astrologer.
**User:** ${userData.name}
**Date of Birth:** ${userData.dob}
**Time of Birth:** ${userData.tob}
**Place of Birth:** ${userData.pob}
**Astrological Method:** ${technique.name}
**Language:** ${userData.language}
**Current Date**: ${currentDate}. All predictions MUST be relevant to this date and forward-looking.
Your responses must be rooted in the principles of ${technique.name}. Be conversational, wise, and reassuring.
Format your responses for clarity. Use Markdown for headings (e.g., **Key Insights:**) and bullet points (*).
At the end of your main reply, you can optionally provide a JSON array of 3 short, relevant follow-up questions for the user, enclosed in [SUGGESTIONS]...[/SUGGESTIONS] tags.
You can also optionally provide a JSON object for context-aware action buttons enclosed in [BUTTONS]...[/BUTTONS] tags. The keys are arbitrary, the values are the button labels in the user's language. Example: [BUTTONS]{"explainMore": "Explain this further", "nextStep": "What should I do next?"}[/BUTTONS]
Do not add any other formatting tags.`;

    // The Gemini API expects role/parts format.
    const contents = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: question }] });

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: { systemInstruction },
        });

        let fullResponseText = '';
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullResponseText += chunkText;
                onTextChunk(chunkText);
            }
        }
        
        let responseText = fullResponseText;
        let suggestions: string[] | undefined;
        let buttons: LocalizedButtons | undefined;

        // More robust parsing to handle tags anywhere in the string
        const suggestionsMatch = responseText.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
        if (suggestionsMatch && suggestionsMatch[1]) {
            try { suggestions = JSON.parse(suggestionsMatch[1].trim()); } catch (e) { console.error("Failed to parse suggestion JSON:", e); }
            responseText = responseText.replace(suggestionsMatch[0], ''); // Remove the tag from final text
        }
        
        const buttonsMatch = responseText.match(/\[BUTTONS\](.*?)\[\/BUTTONS\]/s);
        if (buttonsMatch && buttonsMatch[1]) {
            try { buttons = JSON.parse(buttonsMatch[1].trim()); } catch(e) { console.error("Failed to parse button JSON:", e); }
            responseText = responseText.replace(buttonsMatch[0], ''); // Remove the tag from final text
        }

        return { replyText: responseText.trim(), buttons, suggestions };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return { replyText: "I'm having a bit of trouble connecting with the cosmic energies right now. Please try asking again in a moment." };
    }
}

/**
 * SIMULATED: Palmistry prediction remains a client-side mock for now.
 * A real implementation could also use a Cloud Function to process the image.
 */
export async function getPalmistryPredictionStream(
  userData: UserData,
  imageBase64: string,
  onTextChunk: (chunk: string) => void
): Promise<PredictionResponse> {
  // ... existing mock implementation ...
  if (!navigator.onLine) {
    const offlineMessage = getOfflineMessage(userData.language);
    onTextChunk(offlineMessage);
    return { replyText: offlineMessage };
  }
  await new Promise(resolve => setTimeout(resolve, 1500));
  const localizedReplies: { [key: string]: string } = {
    en: `🌟 Greetings, ${userData.name}. I have examined the pathways of your palm. (Mock Palmistry Response)`,
    hi: `🌟 नमस्ते, ${userData.name}। मैंने आपकी हथेली के रास्ते जांच लिए हैं। (मॉक हस्तरेखा प्रतिक्रिया)`,
  };
  const replyText = localizedReplies[userData.language] || localizedReplies['en'];
  // ... rest of mock implementation
  onTextChunk(replyText);
  return { replyText };
}

/**
 * Generates speech from text using the Gemini TTS model.
 */
export async function getSpeech(text: string): Promise<string | null> {
    if (!ai) {
        console.error("Cannot generate speech, API not initialized.");
        return null;
    }
    if (!navigator.onLine) {
        console.error("Cannot generate speech while offline.");
        return null;
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}
