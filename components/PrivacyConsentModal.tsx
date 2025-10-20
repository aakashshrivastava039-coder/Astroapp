import React from 'react';

interface PrivacyConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-indigo-950 rounded-2xl border border-indigo-700 p-8 text-center shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">Palmistry Analysis Consent</h2>
        <div className="text-left text-gray-300 mb-6 space-y-3 text-sm">
            <p>To provide a palm reading, we need to analyze a photo of your hand.</p>
            <p><strong>Your Privacy is Important:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Your photo is used solely for generating this one-time reading.</li>
                <li>The image is processed and will not be stored on our servers after the session.</li>
                <li>We will never use your photo for any other purpose or share it with third parties.</li>
            </ul>
             <p className="mt-2">By proceeding, you consent to the temporary upload and analysis of your palm photo for a personalized palmistry reading.</p>
        </div>
        <div className="flex justify-center gap-4">
            <button
              onClick={onDecline}
              className="w-1/2 bg-gray-700/50 hover:bg-gray-600/70 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
            >
              Accept and Proceed
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;