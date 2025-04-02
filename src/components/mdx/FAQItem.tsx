'use client'; // Denna komponent behöver vara en Client Component för useState

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid'; // Installera: npm install @heroicons/react

interface FAQItemProps {
  question: string; // Vi skickar frågan som en prop
  children: React.ReactNode; // Svaret blir children, kan innehålla MDX-element
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-navy-600 rounded-lg overflow-hidden bg-navy-800/30 faq-item">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-5 py-4 text-left font-semibold text-white hover:bg-navy-700/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-75"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-pink-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-5 pt-2 pb-4 text-gray-300 prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 faq-answer">
          {/* Children (svaret) renderas här */}
          {children}
        </div>
      )}
    </div>
  );
};

export default FAQItem;