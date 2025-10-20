// FIX: Removed circular self-import of 'TechniqueId' which conflicts with the local declaration.

export type TechniqueId = 'vedic_astrology' | 'numerology' | 'tarot' | 'palmistry';

export interface Technique {
  id: TechniqueId;
  name: string;
  description: string;
  enabled: boolean;
}

export interface UserData {
  name:string;
  dob: string;
  tob: string;
  pob: string;
  language: string;
}

export interface LocalizedButtons {
  showDetails?: string;
  explainCalculation?: string;
  nextPrediction?: string;
  explainSimply?: string;
  replay?: string;
  speakAgain?: string;
}

export interface PalmistryAnalysis {
    image: string; // base64 data URL
    svgOverlay?: string;
}

export interface PredictionResponse {
  replyText: string;
  buttons?: LocalizedButtons;
  palmistryAnalysis?: PalmistryAnalysis;
  suggestions?: string[];
}


export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  buttons?: LocalizedButtons;
  palmistryAnalysis?: PalmistryAnalysis;
  suggestions?: string[];
}

// Fix: Add missing types for PredictionCard component
export interface Prediction {
  title: string;
  score: number;
  reasoning: string;
}

export interface PredictionResult {
  predictions: Prediction[];
  emotionDetected: string;
  confidence: number;
}

export interface VoiceTranscript {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
}