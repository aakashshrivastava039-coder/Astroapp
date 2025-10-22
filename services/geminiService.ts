// FIX: Removed reference to vite client types as it's no longer needed after switching to process.env.
import { GoogleGenAI, Modality } from "@google/genai";
import { UserData, ChatMessage, Technique, PredictionResponse, LocalizedButtons } from '../types';

// IMPORTANT: The API key must be set in the environment variables.
// FIX: Switched from Vite-specific `import.meta.env.VITE_API_KEY` to `process.env.API_KEY` to align with coding guidelines and resolve TypeScript errors.
const API_KEY = process.env.API_KEY;

// Lazy initialization of the AI client to prevent app crash on startup
function getAiClient() {
  if (!API_KEY) {
    // FIX: Updated error message to reflect the change to `API_KEY`.
    console.error("API_KEY environment variable not set.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
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
 * Generates a prediction using the Gemini API based on user data, chat history, and chosen technique.
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
    if (!navigator.onLine) {
        return { replyText: getOfflineMessage(userData.language) };
    }
    
    const ai = getAiClient();
    if (!ai) {
        return { replyText: "The connection to the cosmic oracle is not configured. Please ensure the API Key is set correctly." };
    }

    const currentDate = new Date().toLocaleDateString(userData.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const systemInstruction = `You are the Vibe Oracle, a wise, empathetic, and modern cosmic guide. Your purpose is to provide guidance that is not only astrologically sound but also deeply resonant and emotionally intelligent. You speak with a poetic yet clear voice, making ancient wisdom accessible and connectable. You must connect on an emotional level, validating the user's feelings before offering insight. Speak as a trusted mentor.

### 📜 Core Persona
- **Tone**: Warm, deeply empathetic, and insightful. You are a confidant who truly *hears* what the user is asking, both spoken and unspoken.
- **Style**: Blend mystical, poetic language with crisp, practical, and empowering advice.
- **Goal**: Make the user feel seen, understood, validated, and inspired with clear, actionable guidance.

### 🗓️ Current Date Context
- **CRITICAL**: The current date is **${currentDate}**.
- All your predictions and timelines MUST be future-facing and relevant from this date forward. Do not provide timelines that are in the past (e.g., do not mention 2024 if the current year is 2025).

### 🌎 Language and Localization
- You MUST respond fully in the user's chosen language: ${userData.language}.
- **Acknowledge the context**: The user, ${userData.name}, is seeking insight through the lens of ${technique.name}. Weave this context into your response naturally.

### 💡 Astrological Depth & Timelines
- **Be Specific**: Your predictions should be detailed and concrete. Instead of "good things are coming," say "your communication skills will be highlighted, making it a good time for important conversations."
- **Incorporate Timelines**: Whenever possible, ground your predictions in time. Use phrases like "in the coming 2-3 weeks," "around the next full moon," or "as Mars transits your 5th house," or "this energy will be most potent until the end of the month." This provides tangible context. Base these timelines on the principles of ${technique.name}.

### 📝 Response Structure (${userData.language})

- **For Hindi ('hi')**:
    - **Style**: Use simple, modern, conversational Hindi. Use the polite "आप" form.
    - **Greeting**: Start with a warm, personal greeting like \`नमस्ते, ${userData.name}!\`
    - **Cosmic Connection**: Briefly acknowledge their question with deep empathy.
    - **मुख्य अंतर्दृष्टि (Key Insight)**: A 1-2 sentence summary of the core message, delivered with warmth.
    - **सितारों के संकेत (Signs from the Stars)**: 2-3 **detailed and specific** bullet points. Each point should be crisp and clear.
    - **समय-सीमा (Timeline)**: A short paragraph explaining the potential timing for these events or influences.
    - **आपका मार्ग (Your Path)**: 1-2 lines of clear, actionable advice.
    - **Closing**: End with a gentle, open-ended question like \`क्या आप इस बारे में और जानना चाहेंगे?\`

- **For all other languages**:
    - **Greeting**: Start with a warm, personal greeting like \`🌟 Greetings, ${userData.name}.\`
    - **Emotional Connection**: Acknowledge their question and validate its emotional weight. (e.g., "I can feel the uncertainty in your question about your career, and that's completely understandable...")
    - **🔮 Whispers from the Cosmos**: A 2-3 line poetic summary of the core insight.
    - **✨ What the Universe Reveals**: 2-3 **detailed and crisp** bullet points. Be specific and avoid vagueness.
    - **⏳ Cosmic Timing**: A short paragraph about the potential timelines for these energies. (e.g., "This planetary alignment suggests a window of opportunity opening in the next few weeks, peaking around...")
    - **💫 Your Guiding Light**: 1-2 lines of empowering, actionable spiritual guidance.

### ⚙️ CRITICAL: Output Format
Your entire response must be a single block of markdown text. At the VERY END, you MUST append the following data blocks without any extra formatting.

1.  **[BUTTONS]**: On a new line, add \`[BUTTONS]\` followed by a single line of valid JSON.
    - **Hindi**: \`{"showDetails": "गहराई से बताएं", "explainSimply": "सरल शब्दों में", "nextPrediction": "अगला सवाल"}\`
    - **Other Languages**: \`{"showDetails": "Tell me more", "explainCalculation": "Explain the basis", "nextPrediction": "Next question"}\`
    - *Localize the button text to ${userData.language}.*

2.  **[SUGGESTIONS]**: On a new line, add \`[SUGGESTIONS]\` followed by a single line of valid JSON array.
    - The array should contain 2-3 short, insightful follow-up questions that anticipate the user's next thought, now including timeline-related questions.
    - *Localize the suggestions to ${userData.language}.*

### 🪄 Final Directive
> Embrace your persona as a modern oracle. Connect deeply with ${userData.name}. Provide a response that is both mystically beautiful and practically helpful, strictly following the language and formatting rules, and incorporating specific details and timelines.
> User's data for context: DOB: ${userData.dob}, TOB: ${userData.tob}, POB: ${userData.pob}.
`;
    
  const userPrompt = `
    Conversation History:
    ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    
    My New Question: "${question}"
    
    Based on all the information provided, please generate your response in the user's language: ${userData.language}.
    `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [{role: 'user', parts: [{text: userPrompt}]}],
      config: {
        // FIX: systemInstruction should be a string, not a Content object.
        systemInstruction: systemInstruction,
      },
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

    // Use string splitting for more robust parsing, handling cases where delimiters are not separated by newlines.
    // Process suggestions first, as they are expected to be at the end.
    if (responseText.includes('[SUGGESTIONS]')) {
        const parts = responseText.split('[SUGGESTIONS]');
        responseText = parts[0];
        const suggestionJson = parts[1].trim();
        try {
            suggestions = JSON.parse(suggestionJson);
        } catch (e) {
            console.error("Failed to parse suggestion JSON:", e, "JSON string:", suggestionJson);
        }
    }
    
    // Process buttons from the remaining text.
    if (responseText.includes('[BUTTONS]')) {
        const parts = responseText.split('[BUTTONS]');
        responseText = parts[0];
        const buttonJson = parts[1].trim();
        try {
            buttons = JSON.parse(buttonJson);
        } catch(e) {
            console.error("Failed to parse button JSON:", e, "JSON string:", buttonJson);
        }
    }

    return { replyText: responseText.trim(), buttons, suggestions };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       return { replyText: "It seems there is an issue with the API configuration. Please ensure the API key is valid. For now, let's focus on the positive energies around you." };
    }
    return { replyText: "I'm having a bit of trouble connecting with the cosmic energies right now. Please try asking again in a moment." };
  }
}

/**
 * SIMULATED: Generates a palmistry prediction.
 * In a real app, this would involve uploading the image and calling a vision model.
 * Here, we simulate the response for frontend development.
 * @param userData The user's data.
 * @param imageBase64 The base64 encoded image of the user's palm.
 * @param onTextChunk A callback for streaming text chunks.
 * @returns A promise resolving to the final PredictionResponse.
 */
export async function getPalmistryPredictionStream(
  userData: UserData,
  imageBase64: string,
  onTextChunk: (chunk: string) => void
): Promise<PredictionResponse> {
  if (!navigator.onLine) {
    const offlineMessage = getOfflineMessage(userData.language);
    onTextChunk(offlineMessage); // Stream the message to the UI
    return { replyText: offlineMessage };
  }
  
  // Simulate network and processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const localizedReplies: { [key: string]: string } = {
    en: `🌟 Greetings, ${userData.name}. I have examined the pathways of your palm.
    
🔮 **Palmistry Insight:**
Your hand reveals a story of strong will and deep emotional currents. The lines are clear, suggesting a life of purpose and meaningful connections.

✨ **Key Findings:**
*   **Life Line:** Long and well-defined, indicating vitality and resilience. You possess a strong constitution for life's journey.
*   **Heart Line:** A gentle curve running high across your palm suggests a person who is generous with their affection and values harmony in relationships.
*   **Head Line:** Clear and straight, this points to a logical mind, capable of focused thought and decisive action.

💫 **Guidance:**
Trust in your resilience. Your heart knows the way, and your mind can build the path.`,
    hi: `🌟 नमस्ते, ${userData.name}। मैंने आपकी हथेली के रास्ते जांच लिए हैं।

🔮 **हस्तरेखा ज्योतिष अंतर्दृष्टि:**
आपका हाथ एक मजबूत इच्छाशक्ति और गहरी भावनात्मक धाराओं की कहानी बताता है। रेखाएं स्पष्ट हैं, जो उद्देश्यपूर्ण और सार्थक संबंधों से भरे जीवन का सुझाव देती हैं।

✨ **मुख्य निष्कर्ष:**
*   **जीवन रेखा:** लंबी और अच्छी तरह से परिभाषित, जो जीवन शक्ति और लचीलेपन का संकेत देती है। आपके पास जीवन की यात्रा के लिए एक मजबूत संविधान है।
*   **हृदय रेखा:** आपकी हथेली पर ऊंची चलने वाली एक कोमल वक्रता यह बताती है कि आप एक ऐसे व्यक्ति हैं जो अपने स्नेह में उदार हैं और रिश्तों में सद्भाव को महत्व देते हैं।
*   **मस्तिष्क रेखा:** स्पष्ट और सीधी, यह एक तार्किक दिमाग की ओर इशारा करती है, जो केंद्रित विचार और निर्णायक कार्रवाई करने में सक्षम है।

💫 **मार्गदर्शन:**
अपने लचीलेपन पर विश्वास करें। आपका दिल रास्ता जानता है, और आपका दिमाग रास्ता बना सकता है।`,
  };

  const localizedButtons: { [key: string]: any } = {
      en: { "showDetails": "Show Details", "explainCalculation": "Explain Markings", "nextPrediction": "Ask a Question" },
      hi: { "showDetails": "विवरण दिखाएँ", "explainCalculation": "चिह्नों को समझाएँ", "nextPrediction": "प्रश्न पूछें" },
  };

   const localizedSuggestions: { [key: string]: string[] } = {
    en: ["Tell me more about my life line.", "What does my heart line mean for my relationships?", "Can you explain the head line?"],
    hi: ["मेरी जीवन रेखा के बारे में और बताएं।", "मेरे रिश्तों के लिए मेरी हृदय रेखा का क्या मतलब है?", "क्या आप मस्तिष्क रेखा समझा सकते हैं?"],
  };

  const replyText = localizedReplies[userData.language] || localizedReplies['en'];
  const buttons = localizedButtons[userData.language] || localizedButtons['en'];
  const suggestions = localizedSuggestions[userData.language] || localizedSuggestions['en'];

  // Simulate streaming
  const words = replyText.split(' ');
  for (let i = 0; i < words.length; i++) {
    onTextChunk(words[i] + (i === words.length - 1 ? '' : ' '));
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  
  // Sample SVG overlay to simulate line detection
  const svgOverlay = `<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; position:absolute; top:0; left:0; pointer-events:none;">
    <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"></feGaussianBlur>
            <feMerge>
                <feMergeNode in="coloredBlur"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
        </filter>
    </defs>
    <!-- Heart Line -->
    <path d="M 50,150 Q 200,100 350,150" stroke="#FF69B4" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glow)" />
    <!-- Head Line -->
    <path d="M 40,220 Q 180,240 360,230" stroke="#87CEEB" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glow)" />
    <!-- Life Line -->
    <path d="M 120,250 C 80,350 150,550 250,580" stroke="#90EE90" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glow)" />
  </svg>`;


  return {
    replyText,
    buttons,
    suggestions,
    palmistryAnalysis: {
      image: imageBase64,
      svgOverlay: svgOverlay,
    },
  };
}

/**
 * Generates speech from text using the Gemini API.
 * In a real app, this would use a text-to-speech model.
 * @param text The text to convert to speech.
 * @returns A promise that resolves with the base64 encoded audio data.
 */
export async function getSpeech(text: string): Promise<string | null> {
    if (!navigator.onLine) {
        console.error("Cannot generate speech while offline.");
        return null;
    }
    
    const ai = getAiClient();
    if (!ai) {
      console.error("AI Client not available for speech generation.");
      return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
// FIX: responseModalities should be an array of Modality enum, not string.
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