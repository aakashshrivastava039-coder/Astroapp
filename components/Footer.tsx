import React from 'react';
import { translations } from '../localization';

interface FooterProps {
  language: string;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const T = translations[language] || translations['en'];
  return (
    <footer className="w-full text-center p-4 flex-shrink-100">
      <p className="text-xs text-gray-200">
        {T.footerText}
      </p>
    </footer>
  );
};

export default Footer;
