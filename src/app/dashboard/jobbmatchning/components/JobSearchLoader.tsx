'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Search,
  Target,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface JobSearchLoaderProps {
  isSearching: boolean;
  jobsFound: boolean | null;
  error: string | null;
}

const STAGES = [
  {
    icon: FileSearch,
    label: 'Läser ditt CV',
    body: 'Identifierar yrkesroller och kompetenser',
  },
  {
    icon: Search,
    label: 'Söker jobb',
    body: 'Hämtar tusentals annonser i realtid',
  },
  {
    icon: Target,
    label: 'Matchar mot din profil',
    body: 'Räknar relevans per annons',
  },
  {
    icon: ListOrdered,
    label: 'Rangordnar resultat',
    body: 'De bästa träffarna sätts först',
  },
  {
    icon: CheckCircle2,
    label: 'Förbereder vy',
    body: 'Snart är vi klara',
  },
];

const STAGE_DURATION_MS = 2000;

export default function JobSearchLoader({
  isSearching,
  jobsFound,
  error,
}: JobSearchLoaderProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (error || jobsFound) {
      setStage(STAGES.length - 1);
      return;
    }
    if (!isSearching) return;

    const timer = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, STAGE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isSearching, jobsFound, error]);

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 flex items-start gap-4 max-w-2xl mx-auto">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Något gick fel
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((stage + 1) / STAGES.length) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7 md:p-8"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <DotPatternBg />

      <div className="relative grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center">
        {/* Custom SVG-illustration */}
        <div className="flex justify-center md:justify-start">
          <ScanIllustration stage={stage} />
        </div>

        {/* Pipeline */}
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
            Vi söker åt dig
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            {STAGES[stage].label}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {STAGES[stage].body}
          </p>

          {/* Pipeline-steg, horisontellt pa desktop */}
          <div className="hidden md:block">
            <PipelineHorizontal currentStage={stage} />
          </div>

          {/* Vertikal pipeline pa mobil */}
          <div className="md:hidden">
            <PipelineVertical currentStage={stage} />
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #F97316, #DC2626)',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span className="tabular-nums font-semibold text-orange-700">
                {progressPercent}%
              </span>
              <span>Tar ofta 5–10 sekunder</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Horisontell pipeline med 5 steg (desktop).
 * Aktivt steg: gradient-cirkel + pulserande ring + label.
 * Klara steg: emerald check.
 * Kommande steg: tom slate-cirkel.
 */
function PipelineHorizontal({ currentStage }: { currentStage: number }) {
  return (
    <div
      className="grid items-start gap-2"
      style={{ gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))` }}
    >
      {STAGES.map((stageDef, i) => (
        <PipelineNode
          key={i}
          icon={stageDef.icon}
          label={stageDef.label}
          state={
            i < currentStage ? 'done' : i === currentStage ? 'active' : 'pending'
          }
          showConnector={i < STAGES.length - 1}
          activeStageIndex={currentStage}
          index={i}
        />
      ))}
    </div>
  );
}

/**
 * Vertikal pipeline (mobil) med streckad linje mellan stegen.
 */
function PipelineVertical({ currentStage }: { currentStage: number }) {
  return (
    <ul className="space-y-2.5">
      {STAGES.map((stageDef, i) => {
        const Icon = stageDef.icon;
        const state =
          i < currentStage ? 'done' : i === currentStage ? 'active' : 'pending';
        return (
          <li key={i} className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              {state === 'active' && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
              <div
                className="relative w-8 h-8 rounded-full flex items-center justify-center"
                style={
                  state === 'done'
                    ? {
                        background:
                          'linear-gradient(135deg, #10B981, #059669)',
                      }
                    : state === 'active'
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                        boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.45)',
                      }
                    : { background: '#F1F5F9' }
                }
              >
                {state === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${
                      state === 'active' ? 'text-white' : 'text-slate-400'
                    }`}
                    strokeWidth={2.25}
                  />
                )}
              </div>
            </div>
            <span
              className={`text-sm ${
                state === 'pending'
                  ? 'text-slate-400'
                  : state === 'active'
                  ? 'font-semibold text-slate-900'
                  : 'text-slate-700'
              }`}
            >
              {stageDef.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PipelineNode({
  icon: Icon,
  label,
  state,
  showConnector,
  activeStageIndex,
  index,
}: {
  icon: typeof Search;
  label: string;
  state: 'done' | 'active' | 'pending';
  showConnector: boolean;
  activeStageIndex: number;
  index: number;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative">
        {state === 'active' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
          style={
            state === 'done'
              ? {
                  background:
                    'linear-gradient(135deg, #10B981, #059669)',
                }
              : state === 'active'
              ? {
                  background:
                    'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.5)',
                }
              : { background: '#F1F5F9' }
          }
        >
          {state === 'done' ? (
            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          ) : (
            <Icon
              className={`w-5 h-5 ${
                state === 'active' ? 'text-white' : 'text-slate-400'
              }`}
              strokeWidth={2.25}
            />
          )}
        </div>
      </div>
      <p
        className={`mt-2 text-[11px] leading-tight max-w-[80px] ${
          state === 'pending'
            ? 'text-slate-400'
            : state === 'active'
            ? 'font-semibold text-slate-900'
            : 'text-slate-600'
        }`}
      >
        {label}
      </p>

      {/* Connector-linje till nasta nod */}
      {showConnector && (
        <div
          className="absolute top-5 -translate-y-1/2 pointer-events-none"
          style={{ left: 'calc(50% + 22px)', right: 'calc(-50% + 22px)' }}
          aria-hidden="true"
        >
          <div
            className="h-0.5 w-full rounded-full transition-colors"
            style={{
              background:
                index < activeStageIndex
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : '#E2E8F0',
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Custom SVG-illustration: ett dokument med skann-linje och jobbkort
 * som svaver in fran sidan ("absorberas" in mot dokumentet).
 */
function ScanIllustration({ stage }: { stage: number }) {
  // Visa tre flygande jobbkort. De faller in en i taget baserat pa stage.
  const visibleJobs = Math.min(stage + 1, 3);

  return (
    <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px]">
      {/* Pulserande ringar */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(249, 115, 22, 0.12), transparent 65%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-4 rounded-full border-2 border-orange-200"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Centralt CV-dokument */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{
            width: 110,
            height: 144,
            boxShadow:
              '0 18px 36px -12px rgba(220, 38, 38, 0.25), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            className="h-1.5 w-full"
            style={{
              background:
                'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
          />
          <div className="px-3 pt-3 pb-2 flex flex-col gap-1.5">
            <div className="h-2 w-3/4 rounded-full bg-slate-300" />
            <div className="h-1.5 w-1/2 rounded-full bg-slate-200" />
          </div>
          <div className="px-3 mt-1 flex flex-col gap-1">
            {['w-full', 'w-5/6', 'w-full', 'w-2/3', 'w-5/6'].map((w, i) => (
              <div key={i} className={`h-1 ${w} rounded-full bg-slate-100`} />
            ))}
          </div>

          {/* Skann-linje */}
          <motion.div
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.85) 50%, transparent 100%)',
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.7)',
            }}
            animate={{ top: ['12%', '88%', '12%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Jobbkort som svaver in fran hoger */}
      <AnimatePresence>
        {[0, 1, 2].slice(0, visibleJobs).map((i) => (
          <motion.div
            key={`job-${i}`}
            className="absolute"
            style={{
              top: `${20 + i * 30}%`,
              right: -8,
              width: 56,
              height: 36,
            }}
            initial={{ opacity: 0, x: 30, scale: 0.7 }}
            animate={{
              opacity: [0, 1, 1, 0.5],
              x: [30, -8, -8, -30],
              scale: [0.7, 1, 1, 0.6],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            <div
              className="w-full h-full rounded-lg bg-white border border-orange-200 p-1.5 flex flex-col gap-1"
              style={{ boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.2)' }}
            >
              <div className="h-1 w-3/4 rounded-full bg-orange-200" />
              <div className="h-1 w-1/2 rounded-full bg-slate-200" />
              <div className="h-1 w-2/3 rounded-full bg-slate-100" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      aria-hidden="true"
    >
      <pattern
        id="job-search-loader-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect
        width="100%"
        height="100%"
        fill="url(#job-search-loader-dots)"
        opacity="0.4"
      />
    </svg>
  );
}
