import React from 'react';
import { Technique } from '../types';
import { localizedTechniques, translations } from '../localization';

interface TechniqueSelectorProps {
  onSelect: (technique: Technique) => void;
  language: string;
}

const TechniqueCard: React.FC<{ technique: Technique; onSelect: () => void }> = ({ technique, onSelect }) => {
  const cardClasses = technique.enabled
    ? 'bg-indigo-950/50 border-indigo-800/70 hover:bg-indigo-900 hover:border-indigo-600 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/20'
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

const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({ onSelect, language }) => {
  const T = translations[language] || translations['en'];
  const techniques = localizedTechniques[language] || localizedTechniques['en'];

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in py-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
          {T.choosePathTitle}
        </h2>
        <p className="text-gray-400 text-md md:text-lg">{T.choosePathSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techniques.map((tech) => (
          <TechniqueCard key={tech.id} technique={tech} onSelect={() => onSelect(tech)} />
        ))}
      </div>
    </div>
  );
};

export default TechniqueSelector;