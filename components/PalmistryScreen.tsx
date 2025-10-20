import React, { useState, useRef, useCallback } from 'react';
import PrivacyConsentModal from './PrivacyConsentModal';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PalmistryScreenProps {
  onImageSubmit: (imageBase64: string) => void;
}

const PalmistryScreen: React.FC<PalmistryScreenProps> = ({ onImageSubmit }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRetake = () => {
    setImagePreview(null);
  };
  
  const handleAnalyze = () => {
    if (imagePreview) {
        setIsLoading(true);
        onImageSubmit(imagePreview);
    }
  };

  if (showConsent) {
    // A simple decline action reloads to reset the flow.
    return <PrivacyConsentModal onAccept={() => setShowConsent(false)} onDecline={() => window.location.reload()} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-indigo-950/40 p-8 rounded-2xl border border-indigo-800/50 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-purple-300">Provide Your Palm Photo</h2>
            <p className="text-gray-400 mt-2">
                Upload a clear photo of your dominant hand for analysis.
            </p>
        </div>

        <div className="aspect-square w-full max-w-md mx-auto bg-indigo-900/50 rounded-lg border-2 border-dashed border-indigo-700 flex items-center justify-center relative overflow-hidden">
            {imagePreview ? (
                <img src={imagePreview} alt="Palm preview" className="object-cover w-full h-full" />
            ) : (
                <div className="text-center text-gray-400">
                    <CameraIcon className="w-16 h-16 mx-auto mb-2 text-indigo-500" />
                    <p>Your palm image will appear here.</p>
                </div>
            )}
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 text-white">
                    <SpinnerIcon className="w-12 h-12 animate-spin text-purple-400"/>
                    <p className="text-lg font-semibold">Analyzing the lines of fate...</p>
                </div>
            )}
        </div>

        {!imagePreview ? (
            <div className="mt-6">
                <div className="text-center p-4 bg-black/20 rounded-lg border border-indigo-800">
                    <h4 className="font-semibold text-purple-300 mb-2">Instructions for a Clear Photo:</h4>
                    <ul className="text-sm text-gray-400 list-disc list-inside text-left space-y-1">
                        <li>Use your dominant hand (the one you write with).</li>
                        <li>Ensure good, even lighting. Avoid strong shadows.</li>
                        <li>Keep your palm flat and fingers slightly apart.</li>
                        <li>Make sure your entire palm is visible in the frame.</li>
                    </ul>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                     <input
                        type="file"
                        accept="image/png, image/jpeg"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button onClick={handleUploadClick} className="flex items-center gap-2 w-full justify-center bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        <UploadIcon className="w-5 h-5"/> Upload Photo from Device
                    </button>
                </div>
            </div>
        ) : (
            <div className="mt-6 flex justify-center gap-4">
                <button onClick={handleRetake} className="w-1/2 bg-gray-700/50 hover:bg-gray-600/70 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    Retake
                </button>
                <button onClick={handleAnalyze} disabled={isLoading} className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <SpinnerIcon className="w-6 h-6 animate-spin" /> : "Analyze Palm"}
                </button>
            </div>
        )}
    </div>
  );
};

export default PalmistryScreen;