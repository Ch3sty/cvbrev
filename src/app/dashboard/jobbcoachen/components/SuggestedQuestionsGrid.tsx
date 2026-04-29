'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  MessageSquare,
  TrendingUp,
  Scale,
  Lightbulb,
  Globe,
  Search,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SuggestedQuestion {
  question: string;
  category: string;
  categoryId: string;
  Icon: typeof FileText;
}

const QUESTIONS: SuggestedQuestion[] = [
  // CV-tips
  { question: 'Vilka nyckelord ska jag inkludera för att passera ATS-system?', category: 'CV-tips', categoryId: 'cv-tips', Icon: FileText },
  { question: 'Hur långt ska mitt CV vara och vad ska jag ta med?', category: 'CV-tips', categoryId: 'cv-tips', Icon: FileText },
  { question: 'Ska jag inkludera en profilbild på mitt svenska CV?', category: 'CV-tips', categoryId: 'cv-tips', Icon: FileText },
  // Intervju
  { question: 'Hur svarar jag på "Berätta om en gång du misslyckades"?', category: 'Intervju', categoryId: 'intervju', Icon: MessageSquare },
  { question: 'Vilka frågor ska jag ställa till arbetsgivaren i slutet av intervjun?', category: 'Intervju', categoryId: 'intervju', Icon: MessageSquare },
  { question: 'Hur förbereder jag mig bäst för en videointervju?', category: 'Intervju', categoryId: 'intervju', Icon: MessageSquare },
  // Lön
  { question: 'Vad är marknadsmässig lön för systemutvecklare med 5 års erfarenhet?', category: 'Lön', categoryId: 'lon', Icon: TrendingUp },
  { question: 'Hur förhandlar jag om högre lön vid jobberbjudande?', category: 'Lön', categoryId: 'lon', Icon: TrendingUp },
  { question: 'När är rätt tid att begära lönerevision på befintligt jobb?', category: 'Lön', categoryId: 'lon', Icon: TrendingUp },
  // Arbetsrätt
  { question: 'Hur påverkar LAS min uppsägningstid om jag jobbat i 3 år?', category: 'Arbetsrätt', categoryId: 'arbetsratt', Icon: Scale },
  { question: 'Vad innebär turordningsregler vid uppsägning och hur fungerar de?', category: 'Arbetsrätt', categoryId: 'arbetsratt', Icon: Scale },
  { question: 'Kan arbetsgivaren säga upp mig under provanställning?', category: 'Arbetsrätt', categoryId: 'arbetsratt', Icon: Scale },
  // Karriär
  { question: 'Vilka steg behöver jag ta för att byta från lärare till UX-designer?', category: 'Karriär', categoryId: 'karriar', Icon: Lightbulb },
  { question: 'Hur vet jag om det är rätt tid att söka ny tjänst?', category: 'Karriär', categoryId: 'karriar', Icon: Lightbulb },
  { question: 'Vilka kompetenser är mest efterfrågade på arbetsmarknaden 2026?', category: 'Karriär', categoryId: 'karriar', Icon: Lightbulb },
  // Nyanlända
  { question: 'Kan jag få etableringsstöd från Arbetsförmedlingen som nyutexaminerad?', category: 'Nyanlända', categoryId: 'nyanlanda', Icon: Globe },
  { question: 'Hur validerar jag min utländska examen i Sverige?', category: 'Nyanlända', categoryId: 'nyanlanda', Icon: Globe },
  { question: 'Vilka rättigheter har jag som arbetssökande med arbetstillstånd?', category: 'Nyanlända', categoryId: 'nyanlanda', Icon: Globe },
  // Jobbsök
  { question: 'Hur hittar jag dolda jobbannonser som inte publiceras öppet?', category: 'Jobbsök', categoryId: 'jobbsok', Icon: Search },
  { question: 'Ska jag skicka spontanansökningar eller bara svara på annonser?', category: 'Jobbsök', categoryId: 'jobbsok', Icon: Search },
  { question: 'Hur optimerar jag min LinkedIn-profil för rekryterare?', category: 'Jobbsök', categoryId: 'jobbsok', Icon: Search },
  // Nätverk
  { question: 'Hur bygger jag ett professionellt nätverk på LinkedIn från scratch?', category: 'Nätverk', categoryId: 'natverk', Icon: UserPlus },
  { question: 'Hur följer jag upp efter networking-events på ett professionellt sätt?', category: 'Nätverk', categoryId: 'natverk', Icon: UserPlus },
  { question: 'Hur ber jag om ett informellt möte utan att verka påstridig?', category: 'Nätverk', categoryId: 'natverk', Icon: UserPlus },
];

interface SuggestedQuestionsGridProps {
  category: string | null;
  onAskQuestion: (question: string) => void;
}

const INITIAL_COUNT = 4;

export default function SuggestedQuestionsGrid({
  category,
  onAskQuestion,
}: SuggestedQuestionsGridProps) {
  const [expanded, setExpanded] = useState(false);

  const filtered = category
    ? QUESTIONS.filter((q) => q.categoryId === category)
    : QUESTIONS;

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hiddenCount = filtered.length - INITIAL_COUNT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      className="space-y-3"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
        Exempel-frågor
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid sm:grid-cols-2 gap-3">
          {visible.map((q, i) => (
            <motion.button
              key={`${q.categoryId}-${q.question.slice(0, 30)}`}
              type="button"
              onClick={() => onAskQuestion(q.question)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full text-left bg-white rounded-2xl border border-slate-200 hover:border-orange-300 transition-all overflow-hidden p-4 sm:p-5 focus:outline-none"
              style={{
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
                style={{ boxShadow: '0 12px 28px -8px rgba(249, 115, 22, 0.22)' }}
              />

              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <q.Icon className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-600 mb-1">
                    {q.category}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatePresence>

      {hiddenCount > 0 && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-orange-300 text-sm font-semibold text-slate-700 transition-colors min-h-[40px]"
          >
            {expanded ? (
              <>
                Visa färre
                <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
              </>
            ) : (
              <>
                Visa {hiddenCount} fler exempel
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Inga exempel-frågor i denna kategori. Skriv din egen fråga nedan.
        </div>
      )}
    </motion.section>
  );
}
