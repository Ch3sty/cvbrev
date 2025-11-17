'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, Sparkles } from 'lucide-react';

interface Example {
  question: string;
  answer: string;
  category: string;
}

const EXAMPLES: Example[] = [
  {
    category: 'Lön',
    question: 'Vad är medellönen för en mjukvaruutvecklare i Stockholm?',
    answer: 'Enligt Unionens lönestatistik 2024 ligger medellönen för mjukvaruutvecklare i Stockholm på cirka 45 000-55 000 kr/månad beroende på erfarenhet. Junior-utvecklare (0-2 år): 38 000-43 000 kr. Mid-level (3-5 år): 45 000-52 000 kr. Senior (6+ år): 55 000-70 000 kr.',
  },
  {
    category: 'Arbetsrätt',
    question: 'Hur lång är min uppsägningstid enligt LAS?',
    answer: 'Enligt LAS (Lagen om anställningsskydd) beror uppsägningstiden på hur länge du har varit anställd: 0-2 år: 1 månad. 2-4 år: 2 månader. 4-6 år: 3 månader. 6-8 år: 4 månader. 8-10 år: 5 månader. 10+ år: 6 månader.',
  },
  {
    category: 'CV-tips',
    question: 'Vilka nyckelord ska jag ha i mitt CV för att passera ATS?',
    answer: 'För att passera ATS-system (Applicant Tracking Systems) bör du: Inkludera exakta termer från jobbannonsen. Använd både förkortningar och fullständiga namn (ex: "SEO" och "sökmotoroptimering"). Inkludera relevanta kompetenser i en dedikerad sektion. Använd standardrubrik som "Arbetslivserfarenhet" och "Utbildning".',
  },
];

export default function ExampleConversations() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
            Se exempel-konversationer
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {EXAMPLES.map((example, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-600 mb-1">
                        {example.category}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {example.question}
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 pl-3 border-l-2 border-slate-200">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {example.answer}
                    </p>
                  </div>
                </motion.div>
              ))}

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Alla svar baseras på verifierade källor från Arbetsförmedlingen, fackförbund och SCB
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
