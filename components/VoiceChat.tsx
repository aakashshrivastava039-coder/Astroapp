import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: The 'LiveSession' type is not exported from the '@google/genai' package.
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { VoiceTranscript, UserData, ChatMessage } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';

// IMPORTANT: The API key must be set in the environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface VoiceChatProps {
  userData: UserData;
  language: string;
  techniqueName: string;
  chatHistory: ChatMessage[];
  onEndSession: () => void;
}

const VoiceVisualizer: React.FC<{ 
  status: 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
  statusText: string 
}> = ({ status, statusText }) => {
    const isListening = status === 'listening';
    const isModelSpeaking = status === 'speaking';

    const size = isListening ? 'scale-110' : 'scale-100';
    const userColor = 'from-purple-500 via-purple-600 to-indigo-600';
    const modelColor = 'from-teal-400 via-teal-500 to-cyan-500';
    const idleColor = 'from-indigo-600 via-indigo-700 to-purple-800';
    
    const color = isListening ? userColor : (isModelSpeaking ? modelColor : idleColor);
    
    const animationClass = status === 'connecting' ? 'animate-pulse-connecting' : 'animate-pulse-slow';

    return (
        <div className="relative flex flex-col items-center justify-center w-64 h-64">
            <div className={`absolute w-full h-full bg-gradient-to-br ${color} rounded-full transition-all duration-500 ${size} ${animationClass}`}></div>
            <div className={`absolute w-full h-full bg-gradient-to-br ${color} rounded-full transition-all duration-300 ${size} opacity-50 blur-xl`}></div>
            <div className="relative text-center text-white z-10">
                {isListening || isModelSpeaking ? (
                    isListening ? <MicrophoneIcon className="w-16 h-16" /> : <OracleIcon className="w-16 h-16" />
                ) : (
                    <SparklesIcon className="w-16 h-16 opacity-80" />
                )}
                <p className="mt-4 font-semibold">{statusText}</p>
            </div>
        </div>
    );
};

// Dummy icons for compilation
const OracleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    // FIX: Corrected malformed JSX in the OracleIcon's SVG tag by removing an extra '24"' that was causing a parsing error.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" />
    </svg>
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73z"/>
    </svg>
);

// FIX: Define a local interface for transcription data to include the 'isFinal' property,
// which is expected by the component logic but missing from the library's 'Transcription' type.
interface TranscriptionWithFinal {
  text: string;
  isFinal: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ userData, language, techniqueName, chatHistory, onEndSession }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
    
    // FIX: Changed LiveSession to `any` as it is not an exported type from the SDK.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const nextAudioStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const cleanup = useCallback(() => {
        console.log("Cleaning up resources...");
        // Stop microphone
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        // Disconnect audio nodes
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        // Close audio contexts
        inputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;

        // Stop any playing audio
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();

    }, []);

    const endSessionAndCleanup = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
                console.log("Session closed.");
            } catch (e) {
                console.error("Error closing session:", e);
            } finally {
                sessionPromiseRef.current = null;
            }
        }
        cleanup();
        setStatus('idle');
        onEndSession();
    }, [cleanup, onEndSession]);

    const handleStartSession = useCallback(async () => {
        setStatus('connecting');
        setTranscripts([]);

        const chatHistorySummary = chatHistory
            .slice(-4) // Get last 4 messages
            .map(msg => `${msg.role === 'user' ? userData.name : 'Oracle'}: ${msg.content.substring(0, 200)}...`) // Summarize
            .join('\n');

        const systemInstruction = `You are the Vibe Oracle, a wise and empathetic astrologer. You are now in a live voice conversation with ${userData.name}, continuing a text-based reading.

**CRITICAL CONTEXT:**
- **User:** ${userData.name}
- **Date of Birth:** ${userData.dob}
- **Time of Birth:** ${userData.tob}
- **Place of Birth:** ${userData.pob}
- **Astrological Method:** ${techniqueName}
- **Language:** ${language}

**PREVIOUS CONVERSATION SUMMARY:**
${chatHistorySummary}

**YOUR TASK:**
Engage ${userData.name} in a natural, spoken conversation in ${language}.
1.  **Acknowledge the Shift**: Greet them warmly (e.g., "Greetings again, ${userData.name}. It is good to speak with you directly.") and acknowledge that you're now speaking live to continue their ${techniqueName} reading.
2.  **Maintain Astrological Frame**: ALL your insights MUST be rooted in the principles of ${techniqueName}. Refer back to their birth details and planetary alignments when explaining things. For example, say "Based on your birth time, your Moon is in..." or "Your numerology chart points to...". Do not give generic advice.
3.  **Be Conversational**: Ask them what specific part of the reading they'd like to explore deeper. Be an active listener and respond to their questions with astrological insight.
4.  **Speak Naturally**: Your tone should be reassuring, clear, and wise. Avoid jargon where possible, or explain it simply.`;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setStatus('listening');
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            // FIX: Use a type assertion to access the 'isFinal' property, assuming the library's types are out of sync with the API response.
                            const { text, isFinal } = message.serverContent.inputTranscription as unknown as TranscriptionWithFinal;
                            setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'user' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: text, isFinal }];
                                }
                                return [...prev, { id: crypto.randomUUID(), role: 'user', text, isFinal }];
                            });
                        }
                        if (message.serverContent?.outputTranscription) {
                            setStatus('speaking');
                            // FIX: Use a type assertion to access the 'isFinal' property.
                            const { text, isFinal } = message.serverContent.outputTranscription as unknown as TranscriptionWithFinal;
                             setTranscripts(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.role === 'model' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: text, isFinal }];
                                }
                                return [...prev, { id: crypto.randomUUID(), role: 'model', text, isFinal }];
                            });
                        }

                        if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
                            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                            const outputContext = outputAudioContextRef.current!;
                            const audioBytes = decode(base64Audio);
                            const audioBuffer = await decodeAudioData(audioBytes, outputContext, 24000, 1);

                            const source = outputContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputContext.destination);
                            
                            const nextStartTime = Math.max(nextAudioStartTimeRef.current, outputContext.currentTime);
                            source.start(nextStartTime);
                            
                            nextAudioStartTimeRef.current = nextStartTime + audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                            source.onended = () => {
                                audioSourcesRef.current.delete(source);
                                if (audioSourcesRef.current.size === 0) {
                                    setStatus('listening');
                                }
                            };
                        }
                    },
                    onclose: () => {
                        console.log('Session closed by server.');
                        cleanup();
                        setStatus('idle');
                    },
                    onerror: (e) => {
                        console.error('Session error:', e);
                        setStatus('error');
                        cleanup();
                    }
                }
            });
            await sessionPromiseRef.current;
        } catch (error) {
            console.error("Failed to start voice session:", error);
            setStatus('error');
            cleanup();
        }
    }, [language, userData, techniqueName, chatHistory, cleanup]);

    useEffect(() => {
        handleStartSession();
        // This is the cleanup function that will be called when the component unmounts.
        return () => {
            endSessionAndCleanup();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusText = () => {
        switch (status) {
            case 'connecting': return 'Connecting to the cosmos...';
            case 'listening': return 'Listening...';
            case 'speaking': return 'Oracle is speaking...';
            case 'error': return 'Connection lost.';
            default: return 'Starting session...';
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-gray-900 via-indigo-950 to-black animate-fade-in">
            <div className="flex-grow flex items-center justify-center">
                 <VoiceVisualizer status={status} statusText={getStatusText()} />
            </div>

            <div className="w-full max-w-3xl h-48 overflow-y-auto text-center space-y-2 mb-8">
                {transcripts.map((t) => (
                    <p key={t.id} className={`${t.role === 'user' ? 'text-purple-300' : 'text-teal-300'} ${!t.isFinal ? 'opacity-60' : ''}`}>
                        <span className="font-bold capitalize">{t.role === 'user' ? userData.name : 'Oracle'}: </span>{t.text}
                    </p>
                ))}
            </div>

            <button
                onClick={endSessionAndCleanup}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2"
                aria-label="End Session"
            >
                <StopIcon className="w-6 h-6" />
                End Session
            </button>
        </div>
    );
};

export default VoiceChat;