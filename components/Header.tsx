import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { LANGUAGES } from '../constants';

interface HeaderProps {
    currentScreen: 'language' | 'technique' | 'form' | 'chat' | 'palmistry' | 'voiceChat';
    currentLanguage: string;
    onLanguageChange: (langCode: string) => void;
    onLogoClick: () => void;
    onBack: () => void;
    installPrompt: Event | null;
    onInstallClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, currentLanguage, onLanguageChange, onLogoClick, onBack, installPrompt, onInstallClick }) => {
  return (
    <header className="w-full bg-black/30 backdrop-blur-sm p-4 flex justify-between items-center border-b border-indigo-800/50 shadow-lg">
      <div className="flex items-center gap-4">
        {(currentScreen === 'technique' || currentScreen === 'form' || currentScreen === 'palmistry' || currentScreen === 'voiceChat') && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-indigo-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-300" />
            </button>
        )}
        <div 
          className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          onClick={onLogoClick}
        >
          <SparklesIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Vibe Oracle
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {installPrompt && (
            <button
              onClick={onInstallClick}
              className="flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
              aria-label="Install App"
              title="Install App"
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="hidden md:inline">Install App</span>
            </button>
        )}
        {(currentScreen === 'form' || currentScreen === 'chat' || currentScreen === 'palmistry' || currentScreen === 'voiceChat') && (
            <div className="relative">
            <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-indigo-900/50 border border-indigo-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 appearance-none"
            >
                {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {lang.name}
                </option>
                ))}
            </select>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;