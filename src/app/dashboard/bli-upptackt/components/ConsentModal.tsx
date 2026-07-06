'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Radar, ShieldCheck } from 'lucide-react';

interface ConsentModalProps {
  open: boolean;
  saving: boolean;
  /**
   * Nivå 2-samtycket (fullständiga arbetsstilsrapporten) visas bara när
   * användaren har gjort det fördjupade testet och en rapport finns.
   */
  hasAdvancedTest: boolean;
  onConfirm: (showPersonality: boolean, showFullWorkstyle: boolean) => void;
  onCancel: () => void;
}

const SHOWN_ITEMS = [
  'Yrkesroll och erfarenhetsnivå',
  'Kompetenser från ditt CV',
  'Verifierade testresultat med percentiler',
  'Personlighetsstyrkor och arbetsstil (valfritt)',
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
 * personlighetssamtycket (nivå 1) styr show_personality och det fördjupade
 * rapportsamtycket (nivå 2) styr show_full_workstyle. Nivå 2 utan nivå 1 är
 * meningslöst, så nivåerna är bundna: stängs nivå 1 av stängs nivå 2 av.
 */
export default function ConsentModal({
  open,
  saving,
  hasAdvancedTest,
  onConfirm,
  onCancel,
}: ConsentModalProps) {
  const [mainConsent, setMainConsent] = useState(false);
  const [personalityConsent, setPersonalityConsent] = useState(true);
  const [fullWorkstyleConsent, setFullWorkstyleConsent] = useState(false);

  const togglePersonality = () => {
    setPersonalityConsent((v) => {
      // Bind nivåerna: av på nivå 1 drar med sig nivå 2.
      if (v) setFullWorkstyleConsent(false);
      return !v;
    });
  };

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
            className="relative w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto"
            style={{ boxShadow: '0 24px 60px -16px rgba(220, 38, 38, 0.4)' }}
          >
            {/* Gradient-strip */}
            <div
              className="absolute top-0 inset-x-0 h-1"
              style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
            />

            <div className="p-5 sm:p-7">
              {/* Ikonhuvud */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  <Radar className="w-6 h-6" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
                    Bli upptäckt
                  </div>
                  <h2 id="consent-title" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                    Bli synlig för rekryterare?
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1.5">
                    Vi skapar en kandidatprofil av ditt valda CV. Du ser exakt vad
                    som visas, och du kan stänga av när som helst, då försvinner
                    profilen direkt.
                  </p>
                </div>
              </div>

              {/* Visas / visas aldrig */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 mb-3">
                    <span className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3.5} />
                    </span>
                    Detta visas
                  </div>
                  <ul className="space-y-2">
                    {SHOWN_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-rose-50/70 border border-rose-200/80 p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-700 mb-3">
                    <span className="w-4 h-4 rounded-md bg-rose-600 text-white flex items-center justify-center">
                      <X className="w-3 h-3" strokeWidth={3.5} />
                    </span>
                    Detta visas aldrig
                  </div>
                  <ul className="space-y-2">
                    {HIDDEN_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                        <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Huvudsamtycke (obligatoriskt) */}
              <ConsentRow
                checked={mainConsent}
                onToggle={() => setMainConsent((v) => !v)}
                tone="orange"
                required
              >
                Jag samtycker till att Jobbcoach.ai visar min kandidatprofil för
                verifierade rekryterare. Jag kan när som helst återkalla
                samtycket, då raderas profilen ur poolen omedelbart.
              </ConsentRow>

              {/* Separat personlighetssamtycke (nivå 1, valfritt) */}
              <ConsentRow
                checked={personalityConsent}
                onToggle={togglePersonality}
                tone="indigo"
              >
                Visa mina främsta styrkor och min arbetsstil från
                personlighetstestet på profilen.{' '}
                <span className="text-slate-400 font-normal">
                  Eget samtycke, kan bockas ur utan att synligheten påverkas.
                </span>
              </ConsentRow>

              {/* Fördjupat rapportsamtycke (nivå 2, endast avancerat test) */}
              {hasAdvancedTest && (
                <ConsentRow
                  checked={fullWorkstyleConsent}
                  onToggle={() => setFullWorkstyleConsent((v) => !v)}
                  tone="indigo"
                  disabled={!personalityConsent}
                >
                  Visa min fullständiga arbetsstilsrapport för rekryterare: hur
                  jag arbetar, samarbetar och drivs, med spektrum i ord (aldrig
                  siffror).{' '}
                  <span className="text-slate-400 font-normal">
                    Onboarding och intervjuguide låses upp för rekryteraren
                    först när du tackar ja till kontakt.
                    {!personalityConsent && ' Kräver att personlighetsstyrkor visas.'}
                  </span>
                </ConsentRow>
              )}

              {/* Trygghetsrad */}
              <div className="flex items-center gap-2 mt-4 text-[12px] text-slate-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-slate-300" strokeWidth={2.25} />
                Samtycket sparas med tidpunkt och version. Rekryterare verifieras
                innan de får se kandidatpoolen.
              </div>

              {/* Knappar */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="min-h-[48px] px-5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-700 transition-colors touch-manipulation"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onConfirm(personalityConsent, personalityConsent && fullWorkstyleConsent)
                  }
                  disabled={!mainConsent || saving}
                  className="min-h-[48px] px-6 rounded-xl text-sm font-bold text-white transition-all touch-manipulation enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed"
                  style={
                    !mainConsent || saving
                      ? { background: '#CBD5E1' }
                      : {
                          background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                          boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                        }
                  }
                >
                  {saving ? 'Aktiverar…' : 'Aktivera synlighet'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Samtyckesrad som markerat kort: hela ytan klickbar, tydligt vald-läge. */
function ConsentRow({
  checked,
  onToggle,
  tone,
  required,
  disabled,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  tone: 'orange' | 'indigo';
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const toneStyles = {
    orange: {
      selected: 'border-orange-300 bg-orange-50/60',
      box: 'linear-gradient(135deg, #F97316, #DC2626)',
      ring: 'focus-visible:outline-orange-400',
    },
    indigo: {
      selected: 'border-indigo-300 bg-indigo-50/60',
      box: 'linear-gradient(135deg, #6366F1, #4F46E5)',
      ring: 'focus-visible:outline-indigo-400',
    },
  }[tone];

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={`w-full text-left flex items-start gap-3 rounded-2xl border-[1.5px] p-3.5 mt-3 transition-colors touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneStyles.ring} ${
        disabled
          ? 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
          : checked
            ? toneStyles.selected
            : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span
        className="w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border-[1.5px] transition-colors"
        style={
          checked
            ? { background: toneStyles.box, borderColor: 'transparent' }
            : { background: '#fff', borderColor: '#CBD5E1' }
        }
        aria-hidden="true"
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3.5} />}
      </span>
      <span className="text-[13px] text-slate-700 leading-relaxed font-medium">
        {children}
        {required && !checked && (
          <span className="block text-[11.5px] text-orange-700 font-semibold mt-1">
            Krävs för att aktivera synligheten
          </span>
        )}
      </span>
    </button>
  );
}
