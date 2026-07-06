'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ConsentModalProps {
  open: boolean;
  saving: boolean;
  onConfirm: (showPersonality: boolean) => void;
  onCancel: () => void;
}

const SHOWN_ITEMS = [
  'Yrkesroll och erfarenhetsnivå',
  'Kompetenser från ditt CV',
  'Verifierade testresultat med percentiler',
  'Dina 2 främsta personlighetsstyrkor (valfritt)',
  'Region och tillgänglighet',
];

const HIDDEN_ITEMS = [
  'Ditt rå-CV eller personnummer',
  'Nuvarande arbetsgivare',
  'Kontaktuppgifter',
  'Personlighetstestets råpoäng eller fullständiga profil',
  'Brev, analyser och chatthistorik',
];

/**
 * Samtyckesmodal som öppnas första gången masterreglaget slås på
 * (consent_given_at saknas). Huvudsamtycket är obligatoriskt, det separata
 * personlighetssamtycket är valfritt och styr show_personality.
 */
export default function ConsentModal({ open, saving, onConfirm, onCancel }: ConsentModalProps) {
  const [mainConsent, setMainConsent] = useState(false);
  const [personalityConsent, setPersonalityConsent] = useState(true);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={saving ? undefined : onCancel}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border border-orange-100 p-5 sm:p-7 max-h-[92vh] overflow-y-auto"
            style={{ boxShadow: '0 24px 60px -20px rgba(2, 6, 23, 0.35)' }}
          >
            <h2 id="consent-title" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Bli synlig för rekryterare?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-2 mb-5">
              Vi skapar en kandidatprofil av ditt valda CV. Du ser exakt vad som
              visas, och du kan stänga av när som helst, då försvinner profilen
              direkt.
            </p>

            {/* Visas / visas aldrig */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 mb-2.5">
                  Detta visas
                </div>
                <ul className="space-y-1.5">
                  {SHOWN_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-700 mb-2.5">
                  Detta visas aldrig
                </div>
                <ul className="space-y-1.5">
                  {HIDDEN_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700">
                      <X className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Huvudsamtycke (obligatoriskt) */}
            <label className="flex items-start gap-3 cursor-pointer rounded-xl p-2 -m-2 hover:bg-orange-50/50 transition-colors">
              <input
                type="checkbox"
                checked={mainConsent}
                onChange={(e) => setMainConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
              />
              <span className="text-[13px] text-slate-700 leading-relaxed">
                Jag samtycker till att Jobbcoach.ai visar min kandidatprofil för
                verifierade rekryterare. Jag kan när som helst återkalla
                samtycket, då raderas profilen ur poolen omedelbart.
              </span>
            </label>

            {/* Separat personlighetssamtycke (valfritt) */}
            <label className="flex items-start gap-3 cursor-pointer rounded-xl p-2 -m-2 mt-3 hover:bg-indigo-50/50 transition-colors">
              <input
                type="checkbox"
                checked={personalityConsent}
                onChange={(e) => setPersonalityConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-[13px] text-slate-700 leading-relaxed">
                Visa mina två främsta styrkor från personlighetstestet på
                profilen.{' '}
                <span className="text-slate-400">
                  (Eget samtycke, kan bockas ur utan att synligheten påverkas.)
                </span>
              </span>
            </label>

            {/* Knappar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="min-h-[48px] px-5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors touch-manipulation"
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={() => onConfirm(personalityConsent)}
                disabled={!mainConsent || saving}
                className="min-h-[48px] px-6 rounded-xl text-sm font-bold text-white transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                }}
              >
                {saving ? 'Aktiverar...' : 'Aktivera synlighet'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
