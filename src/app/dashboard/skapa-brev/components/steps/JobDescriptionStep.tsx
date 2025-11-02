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
              Så här hjälper vi dig skapa det perfekta personliga brevet:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Klistra in hela jobbannonsen – ju mer information, desto bättre matchning</li>
              <li>• Vi analyserar företagets krav och ton, sedan matchar vi det mot din unika kompetens</li>
              <li>• Vårt system extraherar nyckelord och anpassar formuleringar för maximal effekt</li>
              <li>• Vi optimerar brevet för både rekryterare och ATS-system</li>
              <li>• Resultatet: Ett unikt, skräddarsytt brev som verkligen sticker ut</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span className="font-medium">Tips:</span> Inkludera företagsnamn, position och alla krav från annonsen för bästa resultat
              </p>
            </div>
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
            placeholder="Klistra in hela jobbannonsen här...&#10;&#10;Vi läser mellan raderna och hjälper dig skapa ett personligt brev som matchar både företagets krav och din erfarenhet perfekt."
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

          {/* Keywords Overlay */}
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
                  <span className="text-xs font-medium text-gray-700">Upptäckta nyckelkompetenser</span>
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
              <span className="text-gray-600">Fortsätt skriva – ju mer information, desto bättre resultat...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-600">Perfekt! Vi har tillräcklig information för att hjälpa dig skapa ditt brev</span>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
