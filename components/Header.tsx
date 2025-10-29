import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { LANGUAGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-indigo-700 hover:bg-indigo-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
        aria-label="User menu"
      >
        <UserCircleIcon className="w-6 h-6 text-white" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-indigo-950/80 backdrop-blur-lg border border-indigo-800/70 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-indigo-800/70">
                <p className="text-sm text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-white truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
            >
              <LogoutIcon className="w-5 h-5"/>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


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
  const { isAuthenticated, openAuthModal } = useAuth();
  
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
              className="hidden md:flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
              aria-label="Install App"
              title="Install App"
            >
              <DownloadIcon className="w-5 h-5" />
              <span className="hidden md:inline">Install App</span>
            </button>
        )}
        
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 bg-indigo-700 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
          >
            <UserCircleIcon className="w-5 h-5" />
            <span className="hidden md:inline">Login / Sign Up</span>
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