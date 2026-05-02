'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Check,
  PenLine,
  FileText,
  MessageSquare,
  Layout,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';

const STEPS = [
  { label: 'CV-val', icon: FileText },
  { label: 'Annons', icon: MessageSquare },
  { label: 'Mall', icon: Layout },
  { label: 'Tonalitet', icon: SlidersHorizontal },
  { label: 'Skapa', icon: Wand2 },
];

const TONALITIES = [
  { label: 'Professionell', premium: false },
  { label: 'Entusiastisk', premium: false },
  { label: 'Kreativ', premium: false },
  { label: 'Självsäker', premium: false },
  { label: 'Balanserad', premium: false },
];

const SAMPLE_LETTER = `Hej Spotify!

Som projektledare på Klarna har jag de senaste fyra åren lett agila team genom CI/CD-implementationer i AWS och drivit en omfattande migration till Kubernetes.`;

const HIGHLIGHTS = [
  'Klistra in jobbannonsen, vi gör resten',
  'Sex tonaliteter, inklusive Smart-anpassad',
  'Färdigt brev på under 60 sekunder',
  'Export till Word eller PDF, redo att skicka',
];

export default function PersonligtBrevSection() {
  const [typed, setTyped] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 2;
      if (index >= SAMPLE_LETTER.length) {
        setTyped(SAMPLE_LETTER);
        clearInterval(interval);
      } else {
        setTyped(SAMPLE_LETTER.slice(0, index));
      }
    }, 22);
    return () => clearInterval(interval);
  }, [hasStarted]);

  return (
    <section
      id="brev"
      className="relative py-16 sm:py-20 lg:py-28 scroll-mt-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <PenLine className="w-3.5 h-3.5" strokeWidth={2.5} />
              Personligt brev
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-4">
              Brev som matchar annonsen,{' '}
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                }}
              >
                från ditt CV
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Vi läser ditt CV, identifierar vad tjänsten kräver och väver in
              din egen erfarenhet i ett brev som bevisar matchningen. Du läser
              igenom, justerar tonen och skickar.
            </p>

            <ul className="space-y-2.5 mb-7">
              {HIGHLIGHTS.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  {h}
                </li>
              ))}
            </ul>

            <Link
              href="/personligt-brev-exempel"
              className="inline-flex items-center gap-1.5 text-orange-700 hover:text-orange-800 font-bold text-sm group"
            >
              Bläddra exempelbiblioteket
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>

          {/* Höger: realistisk wizard-mockup */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px', amount: 0.3 }}
            onViewportEnter={() => setHasStarted(true)}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
              style={{
                boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-orange-100 bg-orange-50/40 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  }}
                >
                  <PenLine className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Skapa personligt brev
                  </p>
                  <p className="text-[11px] text-slate-500">Steg 4 av 5</p>
                </div>
              </div>

              {/* Progress-stegen */}
              <div className="px-5 sm:px-6 pt-5 pb-3">
                <div className="flex items-center justify-between gap-1">
                  {STEPS.map((step, i) => {
                    const done = i < 3;
                    const active = i === 3;
                    return (
                      <div
                        key={step.label}
                        className="flex flex-col items-center flex-1 min-w-0"
                      >
                        <div
                          className={`relative w-9 h-9 rounded-full flex items-center justify-center mb-1.5 ${
                            active ? 'ring-4 ring-orange-100' : ''
                          }`}
                          style={
                            done
                              ? {
                                  background:
                                    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  boxShadow:
                                    '0 4px 10px -3px rgba(16, 185, 129, 0.4)',
                                }
                              : active
                              ? {
                                  background:
                                    'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                                  boxShadow:
                                    '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                                }
                              : {
                                  background: '#F1F5F9',
                                }
                          }
                        >
                          {done ? (
                            <Check
                              className="w-4 h-4 text-white"
                              strokeWidth={3}
                            />
                          ) : (
                            <step.icon
                              className={`w-4 h-4 ${
                                active ? 'text-white' : 'text-slate-400'
                              }`}
                              strokeWidth={2.2}
                            />
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold leading-none truncate w-full text-center ${
                            done
                              ? 'text-emerald-700'
                              : active
                              ? 'text-orange-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress-bar under */}
                <div className="mt-4 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '70%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #F97316 0%, #DC2626 100%)',
                    }}
                  />
                </div>
              </div>

              {/* Innehåll: tonalitets-väljare */}
              <div className="px-5 sm:px-6 pb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">
                  Välj tonalitet
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {TONALITIES.map((t, i) => (
                    <span
                      key={t.label}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        i === 0
                          ? 'bg-orange-50 text-orange-700 border-orange-300'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {t.label}
                    </span>
                  ))}
                  {/* Smart-anpassad — premium */}
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
                      boxShadow:
                        '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    Smart-anpassad
                    <span className="text-[9px] opacity-90 uppercase tracking-wider">
                      Premium
                    </span>
                  </span>
                </div>

                {/* Brev-preview med typing */}
                <div className="bg-orange-50/40 rounded-xl border border-orange-100 p-4 min-h-[140px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Preview
                  </p>
                  <p
                    className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line"
                    aria-live="polite"
                  >
                    {typed}
                    {typed.length < SAMPLE_LETTER.length && hasStarted && (
                      <span
                        className="inline-block w-0.5 h-3.5 ml-0.5 bg-orange-500 align-middle animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
