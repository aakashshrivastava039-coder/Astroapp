import React from 'react';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-indigo-950 rounded-2xl border border-indigo-700 p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Astrological Foundation</h2>
        <p className="text-gray-300 mb-6">
          The Vibe Oracle utilizes an AI model extensively trained on established astrological principles and ancient texts. Our system interprets planetary positions and cosmic alignments to provide insights based on your unique data.
        </p>
        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
        >
          Begin My Reading
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;