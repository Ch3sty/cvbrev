"use client";

import React from 'react';

const tonalityOptions = [
  { 
    id: 'professional', 
    label: 'Professionell', 
    description: 'Formell och affärsmässig ton som passar traditionella företag och branscher.',
    icon: '👔' 
  },
  { 
    id: 'enthusiastic', 
    label: 'Entusiastisk', 
    description: 'Energisk och passionerad ton som visar ditt engagemang för rollen.',
    icon: '🔥' 
  },
  { 
    id: 'creative', 
    label: 'Kreativ', 
    description: 'Innovativ och nytänkande ton som passar kreativa roller och startups.',
    icon: '💡' 
  },
  { 
    id: 'confident', 
    label: 'Självsäker', 
    description: 'Säker och bestämd ton som betonar dina styrkor och prestationer.',
    icon: '💪' 
  },
  { 
    id: 'balanced', 
    label: 'Balanserad', 
    description: 'En välbalanserad blandning av professionalism och personlighet.',
    icon: '⚖️' 
  }
];

const TonalitySelector = ({ selectedTonality, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-medium flex items-center">
          Tonalitet
        </h3>
        <span className="text-sm text-gray-400">Välj stil för ditt brev</span>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {tonalityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`relative flex flex-col items-center justify-center py-3 px-1 rounded-lg border transition-all ${
              selectedTonality === option.id
                ? 'border-pink-500 bg-pink-500/10 text-white'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
            }`}
            aria-pressed={selectedTonality === option.id}
          >
            <div className="text-2xl mb-1">{option.icon}</div>
            <div className="text-xs font-medium">{option.label}</div>
            {selectedTonality === option.id && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      
      {selectedTonality && (
        <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
          {tonalityOptions.find(opt => opt.id === selectedTonality)?.description}
        </div>
      )}
    </div>
  );
};

export default TonalitySelector;