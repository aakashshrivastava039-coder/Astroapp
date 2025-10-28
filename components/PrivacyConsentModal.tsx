import React from 'react';
import { translations } from '../localization';

interface PrivacyConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  language: string;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ onAccept, onDecline, language }) => {
  const T = translations[language] || translations['en'];
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-indigo-950 rounded-2xl border border-indigo-700 p-8 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex-grow overflow-y-auto pr-2 -mr-4 text-center">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{T.consentTitle}</h2>
            <div className="text-left text-gray-300 mb-6 space-y-3 text-sm">
                <p>{T.consentBody1}</p>
                <p><strong>{T.consentBody2}</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>{T.consentLi1}</li>
                    <li>{T.consentLi2}</li>
                    <li>{T.consentLi3}</li>
                </ul>
                <p className="mt-2">{T.consentBody3}</p>
            </div>
        </div>
        <div className="flex justify-center gap-4 mt-4 flex-shrink-0">
            <button
              onClick={onDecline}
              className="w-1/2 bg-gray-700/50 hover:bg-gray-600/70 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {T.consentDecline}
            </button>
            <button
              onClick={onAccept}
              className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
            >
              {T.consentAccept}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;