'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Briefcase, Brain, Key, FileCheck, MapPin } from 'lucide-react';

export default function MatchExplanation() {
  const [isExpanded, setIsExpanded] = useState(false);

  const factors = [
    {
      icon: MapPin,
      title: 'Geografisk matchning',
      points: 25,
      description: 'Distans till arbetsplatsen eller distansarbete',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Briefcase,
      title: 'Yrkestitelmatchning',
      points: 20,
      description: 'Exakta roller + närliggande yrken (t.ex. butikschef → restaurangchef)',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileCheck,
      title: 'Erfarenhetsbaserad matchning',
      points: 20,
      description: 'Nyckelord från dina rollbeskrivningar (ledarskap, budgetansvar etc.)',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Brain,
      title: 'AI-identifierade kompetenser',
      points: 15,
      description: 'Kompetenser från CV-analysen',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Key,
      title: 'Keywords & ATS-termer',
      points: 20,
      description: 'Nyckelord och branschspecifika termer från analysen',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Så fungerar matchningen</h3>
            <p className="text-sm text-gray-600">Klicka för att se hur vi beräknar relevansen</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Vi använder avancerad AI-analys och multi-query sökning för att hitta både exakt matchande och närliggande roller.
                  Varje jobb får en relevanspoäng (0-100) baserad på 5 viktade faktorer:
                </p>
              </div>

              <div className="space-y-3">
                {factors.map((factor, index) => (
                  <motion.div
                    key={factor.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`p-2 bg-gradient-to-br ${factor.color} rounded-lg shrink-0`}>
                      <factor.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{factor.title}</h4>
                        <span className="text-sm font-bold text-gray-700">{factor.points}p</span>
                      </div>
                      <p className="text-xs text-gray-600">{factor.description}</p>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.points}%` }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                          className={`h-full bg-gradient-to-r ${factor.color}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Tips:</strong> Jobb med 70%+ matchning anses vara högt relevanta för din profil.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
