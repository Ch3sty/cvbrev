'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, FolderKanban, Columns3, Inbox } from 'lucide-react';
import { TOUR_STEPS } from './tour/tour-data';
import {
  SceneSearch,
  ScenePeek,
  SceneProfile,
  SceneUnlocked,
  SceneWorkflow,
} from './tour/TourScenes';

const AUTO_ADVANCE_MS = 6000;
const NAV_ICONS = [Search, FolderKanban, Columns3, Inbox];

/**
 * Interaktiv produkttur: portalens vyer som pixeltrogna statiska replikor i
 * ett mockat appfönster. Fem scener med stegnavigering, auto-advance som
 * stannar permanent vid första interaktionen, och full mobil-fallback som
 * staplade kort. Ingen import av portalkod, ingen data, sidan förblir statisk.
 */
export default function ProductTour() {
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance tills besökaren tar över (eller reduced motion).
  useEffect(() => {
    if (interacted || reduce) return;
    timer.current = setInterval(() => {
      setStep((s) => (s + 1) % TOUR_STEPS.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [interacted, reduce]);

  const takeOver = (next: number) => {
    setInteracted(true);
    if (timer.current) clearInterval(timer.current);
    setStep(next);
  };

  const pickSearch = (i: number) => {
    setInteracted(true);
    if (timer.current) clearInterval(timer.current);
    setSearch(i);
  };

  const scene = [
    <SceneSearch key="s" activeSearch={search} onSearch={pickSearch} />,
    <ScenePeek key="p" />,
    <SceneProfile key="pr" />,
    <SceneUnlocked key="u" />,
    <SceneWorkflow key="w" />,
  ][step];

  return (
    <section className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Så här ser det ut på insidan
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Från sökning till anställning
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Det här är inte skärmdumpar. Det är portalen, byggd steg för steg så
            att du ser exakt hur en rekrytering går till hos oss.
          </p>
        </div>

        {/* Desktop: appfönster + stegnavigering */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
          {/* Appfönster */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-24px_rgba(2,6,23,0.35)] overflow-hidden">
            {/* Browser-chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="flex-1 mx-2 rounded-md bg-white border border-slate-200 px-3 py-1 text-[11px] text-slate-400 text-center">
                jobbcoach.ai/rekryterare
              </div>
            </div>
            {/* Portalskal: sidnav + scen */}
            <div className="flex min-h-[380px]">
              <div className="w-14 flex-shrink-0 border-r border-slate-100 bg-slate-50/50 flex flex-col items-center gap-4 py-4">
                {NAV_ICONS.map((Icon, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      i === 0 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.25} />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {scene}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Stegnavigering */}
          <div className="space-y-2">
            {TOUR_STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => takeOver(i)}
                className={`w-full text-left rounded-xl border p-3.5 transition-colors ${
                  i === step
                    ? 'border-orange-300 bg-orange-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                      i === step ? 'text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                    style={i === step ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' } : undefined}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-[13.5px] font-bold ${i === step ? 'text-orange-900' : 'text-slate-700'}`}>
                    {s.title}
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 leading-snug pl-8.5">{s.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mobil: staplade scen-kort med rubriker */}
        <div className="lg:hidden space-y-6">
          {TOUR_STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  {i + 1}
                </span>
                <h3 className="text-[15px] font-bold text-slate-900">{s.title}</h3>
              </div>
              <p className="text-[13px] text-slate-500 leading-snug mb-3 pl-8.5">{s.blurb}</p>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_-16px_rgba(2,6,23,0.3)] overflow-hidden">
                {[
                  <SceneSearch key="s" activeSearch={search} onSearch={pickSearch} />,
                  <ScenePeek key="p" />,
                  <SceneProfile key="pr" />,
                  <SceneUnlocked key="u" />,
                  <SceneWorkflow key="w" />,
                ][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
