'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Behåller border-bottom för separation
    <div className="border-b border-navy-700 last:border-b-0 faq-item">
      {/* --- ÄNDRING: Tog bort h2-wrappen runt knappen --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        // --- ÄNDRING: Ökat padding px-4, justerat textstorlek/vikt explicit ---
        className="flex justify-between items-center w-full px-4 py-4 text-left text-base font-medium text-gray-200 hover:text-white focus:outline-none focus-visible:ring focus-visible:ring-pink-500 focus-visible:ring-opacity-75 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex-1 pr-4">{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-pink-500 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px]' : 'max-h-0'
        }`}
      >
        {/* --- ÄNDRING: Ökat padding px-4, satt explicit text-sm --- */}
        {/* --- VIKTIGT: Behåller prose här för att styla svaret, men det är nu isolerat från förälderns prose tack vare not-prose i containern --- */}
        <div className="px-4 pt-2 pb-5 text-sm text-gray-300 prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 faq-answer">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FAQItem;