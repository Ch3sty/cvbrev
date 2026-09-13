'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Sheet from '@/components/shell/Sheet';

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
 * Samtycket som öppnas första gången synligheten slås på (consent_given_at
 * saknas). Huvudsamtycket är obligatoriskt, nivå 1 styr show_personality och
 * nivå 2 styr show_full_workstyle. Nivåerna är bundna: stängs nivå 1 av
 * stängs nivå 2 av.
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
    <Sheet
      open={open}
      onClose={saving ? () => {} : onCancel}
      title="Bli synlig för rekryterare?"
      description="Vi skapar en kandidatprofil av ditt valda CV. Du ser exakt vad som visas, och stänger du av försvinner profilen direkt."
      size="lg"
      footer={
        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              onConfirm(personalityConsent, personalityConsent && fullWorkstyleConsent)
            }
            disabled={!mainConsent || saving}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
          >
            {saving ? 'Aktiverar' : 'Aktivera synlighet'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:no-underline disabled:opacity-40"
          >
            Avbryt
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <section className="rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
          <h3 className="mb-2 text-sm font-medium text-ink-1">Det här visas</h3>
          <ul className="space-y-1.5">
            {SHOWN_ITEMS.map((item) => (
              <li key={item} className="text-meta leading-snug text-ink-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-kant bg-insunken p-4 shadow-insunken">
          <h3 className="mb-2 text-sm font-medium text-ink-1">Det här visas aldrig</h3>
          <ul className="space-y-1.5">
            {HIDDEN_ITEMS.map((item) => (
              <li key={item} className="text-meta leading-snug text-ink-2">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Huvudsamtycke (obligatoriskt) */}
      <ConsentRow
        checked={mainConsent}
        onToggle={() => setMainConsent((v) => !v)}
        required
      >
        Jag samtycker till att Jobbcoach.ai visar min kandidatprofil för
        verifierade rekryterare. Jag kan när som helst återkalla samtycket, då
        raderas profilen ur poolen omedelbart.
      </ConsentRow>

      {/* Separat personlighetssamtycke (nivå 1, valfritt) */}
      <ConsentRow checked={personalityConsent} onToggle={togglePersonality}>
        Visa mina främsta styrkor och min arbetsstil från personlighetstestet på
        profilen.{' '}
        <span className="font-normal text-ink-3">
          Eget samtycke, kan bockas ur utan att synligheten påverkas.
        </span>
      </ConsentRow>

      {/* Fördjupat rapportsamtycke (nivå 2, endast avancerat test) */}
      {hasAdvancedTest && (
        <ConsentRow
          checked={fullWorkstyleConsent}
          onToggle={() => setFullWorkstyleConsent((v) => !v)}
          disabled={!personalityConsent}
        >
          Visa min fullständiga arbetsstilsrapport för rekryterare: hur jag
          arbetar, samarbetar och drivs, med spektrum i ord (aldrig siffror).{' '}
          <span className="font-normal text-ink-3">
            Onboarding och intervjuguide låses upp för rekryteraren först när du
            tackar ja till kontakt.
            {!personalityConsent && ' Kräver att personlighetsstyrkor visas.'}
          </span>
        </ConsentRow>
      )}

      <p className="mt-4 text-meta text-ink-3">
        Samtycket sparas med tidpunkt och version. Rekryterare verifieras innan
        de får se kandidatpoolen.
      </p>
    </Sheet>
  );
}

/* Samtyckesrad som valbart kort: hela ytan klickbar, valt läge som kant i ink. */
function ConsentRow({
  checked,
  onToggle,
  required,
  disabled,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className={`mt-3 flex w-full items-start gap-3 rounded-lg border bg-panel p-3.5 text-left transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'border-ink-1 shadow-val' : 'border-kant'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-[120ms] ${
          checked ? 'border-ink-1 bg-ink-1' : 'border-kant-stark bg-insunken'
        }`}
        aria-hidden="true"
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />}
      </span>
      <span className="text-sm font-medium leading-[22px] text-ink-2">
        {children}
        {required && !checked && (
          <span className="mt-1 block text-meta font-normal text-accent-ink">
            Krävs för att aktivera synligheten
          </span>
        )}
      </span>
    </button>
  );
}
