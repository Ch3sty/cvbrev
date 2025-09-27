'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Info, Briefcase, Target } from 'lucide-react';

interface JobDescriptionStepProps {
  jobDescription: string;
  onJobDescriptionChange: (description: string) => void;
}

export default function JobDescriptionStep({
  jobDescription,
  onJobDescriptionChange
}: JobDescriptionStepProps) {
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Detect keywords from job description
  useEffect(() => {
    if (jobDescription.length > 50) {
      // Simple keyword detection (can be enhanced with AI)
      const keywords = jobDescription
        .match(/\b(React|TypeScript|JavaScript|Python|Java|C\+\+|SQL|AWS|Azure|Docker|Kubernetes|Git|Agile|Scrum|Node|Angular|Vue|AI|ML|DevOps|Backend|Frontend|Fullstack)\b/gi)
        ?.filter((v, i, a) => a.indexOf(v) === i) || [];

      setDetectedKeywords(keywords.slice(0, 8)); // Max 8 keywords
    } else {
      setDetectedKeywords([]);
    }
  }, [jobDescription]);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">
              Tips för bästa resultat:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Klistra in hela jobbannonsen för mest exakt matchning</li>
              <li>• Inkludera företagsnamn och position</li>
              <li>• AI kommer analysera kraven och anpassa ditt brev</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <div className="relative">
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Klistra in jobbannonsen här eller beskriv positionen du söker..."
            className={`
              w-full h-64 p-6 pr-32
              border-2 rounded-xl
              transition-all duration-300
              text-gray-900 placeholder-gray-400
              ${isFocused
                ? 'border-pink-500 ring-4 ring-pink-500/10'
                : 'border-gray-300 hover:border-gray-400'
              }
              focus:outline-none
              resize-none
            `}
          />

          {/* Character Counter */}
          <div className="absolute bottom-4 right-4 text-sm text-gray-500">
            {jobDescription.length} tecken
          </div>

          {/* AI Keywords Overlay */}
          <AnimatePresence>
            {detectedKeywords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-medium text-gray-700">AI-detekterade nyckelord</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {detectedKeywords.map((keyword, index) => (
                    <motion.span
                      key={keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full font-medium"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Snabbmallar:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Briefcase, label: 'Allmän ansökan', text: 'Jag söker en position som [roll] hos [företag]...' },
            { icon: Target, label: 'Specifik roll', text: 'Med hänvisning till er annons om [position] på [plattform]...' }
          ].map((template) => (
            <motion.button
              key={template.label}
              onClick={() => onJobDescriptionChange(template.text)}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <template.icon className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{template.label}</p>
                <p className="text-xs text-gray-600 truncate">{template.text}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress Indicator */}
      {jobDescription.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm"
        >
          {jobDescription.length < 50 ? (
            <>
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span className="text-gray-600">Fortsätt skriva för bättre resultat...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-600">Bra! AI har tillräcklig information</span>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}