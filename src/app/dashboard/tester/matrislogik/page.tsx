'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Play, Info } from 'lucide-react';

export default function MatrislogikLandingPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStartTest = async () => {
    setStarting(true);
    try {
      const response = await fetch('/api/logic/start', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to start test');

      const { sessionToken } = await response.json();
      router.push(`/dashboard/tester/matrislogik/test/${sessionToken}`);
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
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Matrislogik
            </h1>
            <p className="text-gray-600 mt-1">
              Minimal Icon Logic Test
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-6"
      >
        <div className="flex items-start gap-3 mb-6">
          <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om testet
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Detta test mäter din logiska förmåga och mönsterigenkänning genom
                minimalistiska ikonmönster i 3×3-matriser.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>15 frågor</strong> med varierande svårighetsgrad
                </li>
                <li>
                  <strong>6 svarsalternativ</strong> (A-F) per fråga
                </li>
                <li>
                  <strong>~15-20 minuter</strong> rekommenderad tid
                </li>
                <li>
                  <strong>Tangentbordsgenvägar:</strong> A-F, 1-6, eller piltangenter
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Frågetyper du kommer möta:
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Ringar med pinnar (rotation och antal)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>T-former och plussar med punkter</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Symboler (X, O, triangel) med rotation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>Mängdoperationer (union, XOR, differens)</span>
            </div>
          </div>
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
            bg-gradient-to-r from-indigo-600 to-purple-600 text-white
            hover:from-indigo-700 hover:to-purple-700
            transform transition-all duration-200
            ${starting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}
            flex items-center justify-center gap-3
          `}
        >
          <Play className="w-6 h-6" />
          {starting ? 'Startar test...' : 'Starta test'}
        </button>
      </motion.div>
    </div>
  );
}
