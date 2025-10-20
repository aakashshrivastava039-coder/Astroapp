import React from 'react';
import { Technique } from '../types';
import { TECHNIQUES } from '../constants';

interface TechniqueSelectorProps {
  onSelect: (technique: Technique) => void;
}

const TechniqueCard: React.FC<{ technique: Technique; onSelect: () => void }> = ({ technique, onSelect }) => {
  const cardClasses = technique.enabled
    ? 'bg-indigo-950/50 border-indigo-800/70 hover:bg-indigo-900 hover:border-indigo-600 cursor-pointer transform hover:-translate-y-1'
    : 'bg-gray-800/50 border-gray-700/70 cursor-not-allowed opacity-50';

  return (
    <div
      onClick={technique.enabled ? onSelect : undefined}
      className={`p-6 border rounded-xl shadow-lg transition-all duration-300 ${cardClasses}`}
    >
      <h3 className="text-xl font-semibold text-purple-300">{technique.name}</h3>
      <p className="mt-2 text-sm text-gray-400">{technique.description}</p>
    </div>
  );
};

const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          Choose Your Path to Insight
        </h2>
        <p className="text-gray-400">Select a method to begin your journey of discovery.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TECHNIQUES.map((tech) => (
          <TechniqueCard key={tech.id} technique={tech} onSelect={() => onSelect(tech)} />
        ))}
      </div>
    </div>
  );
};

export default TechniqueSelector;