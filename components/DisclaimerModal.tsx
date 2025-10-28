import React from 'react';
import { translations } from '../localization';

interface DisclaimerModalProps {
  onAccept: () => void;
  language: string;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, language }) => {
  const T = translations[language] || translations['en'];
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-indigo-950 rounded-2xl border border-indigo-700 p-8 text-center shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex-grow overflow-y-auto pr-2 -mr-4">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{T.disclaimerTitle}</h2>
          <p className="text-gray-300 mb-6">
            {T.disclaimerBody}
          </p>
        </div>
        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg mt-4 flex-shrink-0"
        >
          {T.disclaimerButton}
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;