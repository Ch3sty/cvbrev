// src/components/cv/cv-counter.tsx
// UPPDATERAD: Visar ∞-ikon istället för "Infinity" när max är oändligt.

'use client'

import React from 'react';
// Importera nödvändiga ikoner + InfinityIcon
import { FileText, AlertTriangle, CheckCircle, Infinity as InfinityIcon } from 'lucide-react';

interface CVCounterProps {
  current: number;
  max: number; // Kan nu vara Infinity
}

const CVCounter: React.FC<CVCounterProps> = ({ current, max }) => {
  // Kolla om maxgränsen är oändlig
  const isInfinite = !isFinite(max);

  // Beräkna procentvärde för progressbaren (sätt till 0 om oändligt eller max är 0)
  const percentage = isInfinite || max === 0 ? 0 : Math.min(100, (current / max) * 100);

  // Bestäm färg baserat på antalet CV
  const getColorClass = () => {
    if (isInfinite) return "from-green-500 to-emerald-600"; // Alltid gott om plats vid oändligt
    if (current >= max) return "from-red-500 to-red-600"; // Full
    if (current >= max * 0.8) return "from-yellow-500 to-orange-500"; // Nästan full
    if (current >= max * 0.5) return "from-blue-500 to-purple-500"; // Halvfull
    return "from-green-500 to-emerald-600"; // Gott om plats
  };

  // Bestäm ikon och meddelande baserat på antalet CV
  const getStatusInfo = () => {
    if (isInfinite) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        message: "Obegränsat utrymme"
      };
    }
    if (current >= max) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        message: "Maxgräns nådd"
      };
    }
    // Visa bara "X platser kvar" om det inte är oändligt och inte fullt
    if (current >= max * 0.8) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        message: `${max - current} ${max - current === 1 ? 'plats' : 'platser'} kvar`
      };
    }
    // Default för icke-oändligt och ej nära/fullt
    return {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      message: "Gott om plats"
    };
  };

  const statusInfo = getStatusInfo();

  // *** ÄNDRING HÄR: Skapa variabel för att visa antingen nummer eller ikon ***
  const maxDisplayValue = isInfinite
    ? <InfinityIcon className="w-5 h-5 text-pink-500 inline-block" /> // Använd ikonen
    : max; // Använd siffran annars

  // *** ÄNDRING HÄR: Skapa variabel för återstående platser ***
  const remainingDisplayValue = isInfinite
    ? "Obegränsat antal" // Text för oändligt
    : `${max - current} ${max - current === 1 ? 'plats' : 'platser'}`; // Text med antal annars

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center text-gray-700 font-medium">
          <FileText className="w-4 h-4 mr-2 text-pink-600" />
          CV-utrymme
        </div>
        <div className="flex items-center text-xs text-gray-600">
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.message}</span>
        </div>
      </div>

      {/* Snygg räknardisplay */}
      <div className="flex items-center justify-center bg-white rounded-xl p-3 mb-3 border border-gray-200">
        {/* Cirkel */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 shadow-inner">
           <svg className="w-full h-full" viewBox="0 0 36 36">
             <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
              {!isInfinite && ( // Rita bara progress-cirkeln om max inte är oändligt
                <circle cx="18" cy="18" r="16" fill="none" stroke="url(#cv-counter-pink-gradient)" strokeWidth="2.5" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}/>
              )}
             <defs> <linearGradient id="cv-counter-pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="#ec4899" /> <stop offset="100%" stopColor="#db2777" /> </linearGradient> </defs>
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-lg font-bold text-gray-900">{current}</span>
           </div>
        </div>
         {/* Text bredvid cirkeln */}
         <div className="ml-4 text-center">
           <p className="text-xs text-gray-500 uppercase tracking-wider">Uppladdade CV</p>
           <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
             {current} <span className="text-pink-600 text-sm">av</span> {maxDisplayValue}
           </p>
         </div>
      </div>

       {/* Progressbar (visas endast om inte oändligt) */}
       {!isInfinite && (
         <>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
             <div
               className={`h-full bg-gradient-to-r ${getColorClass()} transition-all duration-500 ease-out`}
               style={{ width: `${percentage}%` }}
             />
           </div>
           <div className="flex justify-end text-xs text-gray-600">
             <span>{remainingDisplayValue} lediga</span>
           </div>
         </>
       )}
       {/* Visa text om oändligt */}
       {isInfinite && (
           <div className="text-center text-xs text-gray-600 mt-1">
                {remainingDisplayValue} platser lediga
           </div>
       )}

    </div>
  );
};

export default CVCounter;