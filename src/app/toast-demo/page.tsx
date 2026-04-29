'use client';

import { useState } from 'react';
import Toast from '@/components/ui/toast/Toast';
import {
  TOAST_ILLUSTRATIONS,
  type ToastScenario,
} from '@/components/ui/toast/illustrations';
import ToastIllustration from '@/components/ui/toast/ToastIllustration';

interface DemoCase {
  scenario: ToastScenario;
  label: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const CASES: DemoCase[] = [
  {
    scenario: 'jobs-found',
    label: 'Jobb hittade',
    message: 'Vi hittade 50 matchande jobb. Utforska träffarna nedan.',
    type: 'success',
  },
  {
    scenario: 'cv-uploaded',
    label: 'CV uppladdat',
    message: 'Tack, vi har sparat ditt CV.',
    type: 'success',
  },
  {
    scenario: 'cv-analyzed',
    label: 'CV-analys klar',
    message: 'Vi är klara med din analys. Dina förbättringar väntar.',
    type: 'success',
  },
  {
    scenario: 'cv-template-generated',
    label: 'CV-mall genererad',
    message: 'Vi har gjort en PDF av ditt CV. Den är nedladdad till din enhet.',
    type: 'success',
  },
  {
    scenario: 'letter-created',
    label: 'Brev skrivet',
    message:
      'Ditt brev är skrivet. Granska gärna och spara om du vill behålla det.',
    type: 'success',
  },
  {
    scenario: 'letter-saved',
    label: 'Brev sparat',
    message: 'Vi har sparat ditt brev. Du hittar det under Mina brev.',
    type: 'success',
  },
  {
    scenario: 'letter-deleted',
    label: 'Brev borttaget',
    message: 'Brevet är borttaget.',
    type: 'success',
  },
  {
    scenario: 'premium-activated',
    label: 'Premium aktiverat',
    message: 'Välkommen till Premium. Nu har du allt upplåst.',
    type: 'success',
  },
  {
    scenario: 'profile-updated',
    label: 'Profil uppdaterad',
    message: 'Vi har uppdaterat din profil.',
    type: 'success',
  },
  {
    scenario: 'account-deleted',
    label: 'Konto raderat',
    message: 'Ditt konto är raderat. Tack för att du använde Jobbcoach.ai.',
    type: 'success',
  },
  {
    scenario: 'onboarding-complete',
    label: 'Onboarding klar',
    message: 'Du är redo att börja söka jobb. Vi har allt vi behöver.',
    type: 'success',
  },
  {
    scenario: 'payment-complete',
    label: 'Betalning klar',
    message:
      'Tack, betalningen är klar. Din 7-dagars gratisperiod har startat.',
    type: 'success',
  },
];

export default function ToastDemoPage() {
  const [active, setActive] = useState<DemoCase | null>(null);

  const trigger = (demo: DemoCase) => {
    // Stäng en eventuell aktiv toast först sa animationen syns ren vid byte
    setActive(null);
    setTimeout(() => setActive(demo), 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 sm:mb-12">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
            Demo
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            Toast-galleri
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Klicka på en knapp för att trigga en toast. Toasten visas
            bottom-center på mobil (under 1024px) och top-right på desktop.
            Auto-stängs efter 4 sekunder.
          </p>
        </header>

        {/* Grid: alla 12 scenarion som triggers */}
        <section className="mb-12">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Trigga en toast
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CASES.map((demo) => (
              <button
                key={demo.scenario}
                onClick={() => trigger(demo)}
                className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:border-orange-300 hover:-translate-y-0.5 transition-all text-left"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <ToastIllustration scenario={demo.scenario} size={56} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {demo.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {demo.scenario}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Static gallery - alla illustrationer i tabell-format */}
        <section className="mb-12">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Alla illustrationer ({Object.keys(TOAST_ILLUSTRATIONS).length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200">
            {Object.keys(TOAST_ILLUSTRATIONS).map((key) => (
              <div
                key={key}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50"
              >
                <ToastIllustration scenario={key} size={80} />
                <span className="text-[11px] font-mono text-slate-600 truncate max-w-full">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Stangd-info */}
        <section className="text-xs text-slate-500 leading-relaxed">
          <p>
            Position: <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-700">bottom-center</code> på
            mobil (&lt; 1024px),{' '}
            <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-700">top-right</code> på desktop.
          </p>
          <p className="mt-1">
            Toasten splittar meddelanden på första punkt + mellanslag i en rubrik
            (bold) + en body (subtil).
          </p>
        </section>
      </div>

      {/* Den faktiska toasten */}
      {active && (
        <Toast
          isVisible={true}
          message={active.message}
          type={active.type}
          scenario={active.scenario}
          onClose={() => setActive(null)}
          duration={4000}
        />
      )}
    </div>
  );
}
