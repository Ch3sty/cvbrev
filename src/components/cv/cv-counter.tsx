// src/components/cv/cv-counter.tsx
'use client'

import React from 'react'
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react'

interface CVCounterProps {
  current: number;
  max: number;
}

const CVCounter: React.FC<CVCounterProps> = ({ current, max }) => {
  // Beräkna procentvärde för progressbaren
  const percentage = (current / max) * 100;
  
  // Bestäm färg baserat på antalet CV
  const getColorClass = () => {
    if (current >= max) return "from-red-500 to-red-600"; // Full
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500"; // Nästan full
    if (current >= max * 0.5) return "from-blue-500 to-purple-500"; // Halvfull
    return "from-green-500 to-emerald-600"; // Gott om plats
  };

  // Bestäm ikon och meddelande baserat på antalet CV
  const getStatusInfo = () => {
    if (current >= max) {
      return { 
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        message: "Maxgräns nådd" 
      };
    }
    if (current >= max * 0.8) {
      return { 
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: `${max - current} ${max - current === 1 ? 'plats' : 'platser'} kvar` 
      };
    }
    return { 
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      message: "Gott om plats" 
    };
  };

  const statusInfo = getStatusInfo();
  
  return (
    <div className="bg-navy-800 rounded-lg p-4 shadow-lg border border-gray-700 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-pink-500 mr-2" />
          <h3 className="font-semibold text-white">CV-utrymme</h3>
        </div>
        <div className="flex items-center">
          {statusInfo.icon}
          <span className="text-xs ml-1 text-gray-300">{statusInfo.message}</span>
        </div>
      </div>
      
      {/* Snygg räknardisplay med rosa gradient */}
      <div className="flex items-center justify-center bg-navy-900 rounded-xl p-4 mb-3">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-navy-950 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="#293548" 
              strokeWidth="2"
            />
            <circle 
              cx="18" cy="18" r="16" 
              fill="none" 
              stroke="url(#pink-gradient)" 
              strokeWidth="2.5" 
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
            <defs>
              <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{current}</span>
          </div>
        </div>
        <div className="ml-5">
          <p className="text-sm text-gray-400">Uppladdade CV</p>
          <p className="text-lg font-bold text-white">
            {current} <span className="text-pink-500">av</span> {max} 
          </p>
        </div>
      </div>
      
      {/* Progressbar */}
      <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{current} CV uppladdade</span>
        <span>{max - current} platser lediga</span>
      </div>
    </div>
  );
};

export default CVCounter;