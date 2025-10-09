'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function TesterPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Kognitiva Tester
            </h1>
            <p className="text-gray-600 mt-1">
              Träna inför rekryteringsprocesser
            </p>
          </div>
        </div>
      </motion.div>

      {/* Future tests placeholder */}
      <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Fler tester kommer snart
        </h3>
        <p className="text-gray-600">
          Vi jobbar på att lägga till kognitiva tester för att hjälpa dig träna inför rekryteringsprocesser.
        </p>
      </div>
    </div>
  );
}
