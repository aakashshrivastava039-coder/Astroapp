import React from 'react';
import { translations } from '../localization';

interface FooterProps {
  language: string;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
  const T = translations[language] || translations['en'];
  return (
    <footer className="w-full text-center p-4 mt-auto">
      <p className="text-xs text-gray-500">
        {T.footerText}
      </p>
    </footer>
  );
};

export default Footer;
