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
    <div className="bg-navy-900 rounded-lg p-4 border border-gray-700/50"> {/* Anpassade klasser */}
      <div className="flex items-center justify-between mb-3 text-sm"> {/* Anpassade klasser */}
        <div className="flex items-center text-gray-300">
          <FileText className="w-4 h-4 mr-2 text-pink-500" /> {/* Anpassade klasser */}
          CV-utrymme
        </div>
        <div className="flex items-center text-xs text-gray-400"> {/* Anpassade klasser */}
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.message}</span>
        </div>
      </div>

      {/* Snygg räknardisplay */}
      <div className="flex items-center justify-center bg-navy-950 rounded-xl p-3 mb-3"> {/* Anpassade klasser */}
        {/* Cirkel */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-navy-800 shadow-inner"> {/* Anpassade klasser */}
           <svg className="w-full h-full" viewBox="0 0 36 36">
             <circle cx="18" cy="18" r="16" fill="none" stroke="#475569" strokeWidth="2"/> {/* Anpassad stroke */}
              {!isInfinite && ( // Rita bara progress-cirkeln om max inte är oändligt
                <circle cx="18" cy="18" r="16" fill="none" stroke="url(#cv-counter-pink-gradient)" strokeWidth="2.5" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}/>
              )}
             <defs> <linearGradient id="cv-counter-pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%"> <stop offset="0%" stopColor="#ec4899" /> <stop offset="100%" stopColor="#db2777" /> </linearGradient> </defs>
           </svg>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-lg font-bold text-white">{current}</span> {/* Anpassad storlek */}
           </div>
        </div>
         {/* Text bredvid cirkeln */}
         <div className="ml-4 text-center">
           <p className="text-xs text-gray-400 uppercase tracking-wider">Uppladdade CV</p> {/* Anpassad stil */}
           <p className="text-lg font-bold text-white flex items-center justify-center gap-1"> {/* Anpassad storlek */}
             {current} <span className="text-pink-500 text-sm">av</span> {maxDisplayValue} {/* Använder den uppdaterade variabeln */}
           </p>
         </div>
      </div>

       {/* Progressbar (visas endast om inte oändligt) */}
       {!isInfinite && (
         <>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden mb-1"> {/* Anpassad höjd/färg */}
             <div
               className={`h-full ${getColorClass()} transition-all duration-500 ease-out`} // Använder getColorClass för färg
               style={{ width: `${percentage}%` }}
             />
           </div>
           <div className="flex justify-end text-xs text-gray-400"> {/* Flyttad text under bar */}
             <span>{remainingDisplayValue} lediga</span>
           </div>
         </>
       )}
       {/* Visa text om oändligt */}
       {isInfinite && (
           <div className="text-center text-xs text-gray-400 mt-1">
                {remainingDisplayValue} platser lediga
           </div>
       )}

    </div>
  );
};

export default CVCounter;