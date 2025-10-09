'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Play, Info, Zap } from 'lucide-react';

export default function MatrislogikAvanceradLandingPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStartTest = async () => {
    setStarting(true);
    try {
      const response = await fetch('/api/logicV2/start', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to start test');

      const { sessionToken } = await response.json();
      router.push(`/dashboard/tester/matrislogik-avancerad/test/${sessionToken}`);
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Kunde inte starta testet. Försök igen.');
      setStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Matrislogik
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Avancerad
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Advanced Pattern Recognition Test V2
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border-2 border-purple-200 p-8 mb-6"
      >
        <div className="flex items-start gap-3 mb-6">
          <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om testet
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Detta är den avancerade versionen av matrislogiktestet med nya, mer komplexa
                mönster och transformationer. Perfekt för dig som vill utmana din problemlösningsförmåga.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>15 avancerade frågor</strong> med högre svårighetsgrad
                </li>
                <li>
                  <strong>6 svarsalternativ</strong> (A-F) per fråga
                </li>
                <li>
                  <strong>~20-25 minuter</strong> rekommenderad tid
                </li>
                <li>
                  <strong>Tangentbordsgenvägar:</strong> A-F, 1-6, eller piltangenter
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-purple-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Nya frågetyper i denna version:
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Polygon-progressioner (3-6 sidor)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Speglingar och komplexa rotationer</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Skärningspunkter och positionering</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Form-kombinationer och XOR-operationer</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Villkorlig förändring baserad på tidigare celler</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">•</span>
              <span>Beroende rotationer och analogiregler</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 mt-6 border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>Tips:</strong> Detta test är utformat för att utmana även erfarna testtagare.
            Ta dig tid att identifiera mönstret innan du svarar.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={handleStartTest}
          disabled={starting}
          className={`
            w-full py-4 px-8 rounded-xl font-bold text-lg
            bg-gradient-to-r from-purple-600 to-pink-600 text-white
            hover:from-purple-700 hover:to-pink-700
            transform transition-all duration-200
            ${starting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}
            flex items-center justify-center gap-3
          `}
        >
          <Play className="w-6 h-6" />
          {starting ? 'Startar test...' : 'Starta avancerat test'}
        </button>
      </motion.div>
    </div>
  );
}
