import React from 'react';
import { LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  onSelect: (langCode: string) => void;
}

const LanguageCard: React.FC<{ name: string; onSelect: () => void }> = ({ name, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className="w-full text-center p-4 md:p-6 border rounded-xl shadow-lg transition-all duration-300 bg-indigo-950/50 border-indigo-800/70 hover:bg-indigo-900 hover:border-indigo-600 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <h3 className="text-lg md:text-xl font-semibold text-purple-300">{name}</h3>
    </button>
  );
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in py-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          Choose Your Language
        </h2>
        <p className="text-gray-400 text-md md:text-lg">Select the language for your guidance.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {LANGUAGES.map((lang) => (
          <LanguageCard key={lang.code} name={lang.name} onSelect={() => onSelect(lang.code)} />
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;