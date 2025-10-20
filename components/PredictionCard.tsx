
import React, { useState } from 'react';
import { Prediction, PredictionResult } from '../types';

interface PredictionCardProps {
  predictionResult: PredictionResult;
}

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
    const segments = 10;
    const filledSegments = Math.round(value * segments);
  
    return (
      <div className="flex gap-1 w-full">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-grow rounded-full ${
              index < filledSegments ? 'bg-teal-400' : 'bg-gray-600'
            }`}
          ></div>
        ))}
      </div>
    );
};


export const PredictionCard: React.FC<PredictionCardProps> = ({ predictionResult }) => {
    const [isExpanded, setIsExpanded] = useState(false);

  if (!predictionResult || predictionResult.predictions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-indigo-600/50 pt-4">
      <div className="space-y-4">
        {predictionResult.predictions.map((pred, index) => (
            <div key={index} className="bg-black/20 p-3 rounded-lg">
                <p className="font-semibold text-purple-300">{pred.title}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                    <span>Confidence:</span>
                    <ConfidenceBar value={pred.score} />
                    <span>{Math.round(pred.score * 100)}%</span>
                </div>
            </div>
        ))}
      </div>

        <div className="mt-4 text-center">
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm text-purple-300 hover:underline">
                {isExpanded ? 'Hide Details' : 'Explain Calculation'}
            </button>
        </div>

        {isExpanded && (
            <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs space-y-2">
                <p><strong className="text-gray-300">Detected Emotion:</strong> <span className="text-gray-400 capitalize">{predictionResult.emotionDetected}</span></p>
                <p><strong className="text-gray-300">Overall Confidence:</strong> <span className="text-gray-400">{Math.round(predictionResult.confidence * 100)}%</span></p>
                <div className="pt-2 border-t border-indigo-700/50">
                    <p className="text-gray-300 font-semibold mb-1">Reasoning:</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                        {predictionResult.predictions.map((pred, index) => (
                            <li key={index}><strong>{pred.title}:</strong> {pred.reasoning}</li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
    </div>
  );
};
