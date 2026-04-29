'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanText,
  KeyRound,
  Target,
  PenLine,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface LetterPipelineLoaderProps {
  isGenerating: boolean;
  isDone: boolean;
  error: string | null;
}

const STAGES = [
  {
    icon: ScanText,
    label: 'Analyserar ditt CV',
    body: 'Vi läser igenom din erfarenhet och dina styrkor',
  },
  {
    icon: KeyRound,
    label: 'Plockar nyckelord',
    body: 'Vi extraherar det viktigaste från annonsen',
  },
  {
    icon: Target,
    label: 'Matchar mot kraven',
    body: 'Vi knyter din profil till tjänstens behov',
  },
  {
    icon: PenLine,
    label: 'Skriver ditt brev',
    body: 'Vi formulerar varje stycke med rätt ton',
  },
  {
    icon: ShieldCheck,
    label: 'Optimerar för ATS',
    body: 'Sista finputsen så brevet passerar systemen',
  },
];

const STAGE_DURATION_MS = 2200;

export default function LetterPipelineLoader({
  isGenerating,
  isDone,
  error,
}: LetterPipelineLoaderProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (error || isDone) {
      setStage(STAGES.length - 1);
      return;
    }
    if (!isGenerating) return;

    const timer = setInterval(() => {
      setStage((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, STAGE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isGenerating, isDone, error]);

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-8 flex items-start gap-4">
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

  const progressPercent = isDone
    ? 100
    : Math.round(((stage + 1) / STAGES.length) * 100);

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
        <div className="flex justify-center md:justify-start">
          <WritingIllustration stage={stage} />
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
            Vi skriver åt dig
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-1">
            {STAGES[stage].label}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {STAGES[stage].body}
          </p>

          <div className="hidden md:block">
            <PipelineHorizontal currentStage={stage} />
          </div>

          <div className="md:hidden">
            <PipelineVertical currentStage={stage} />
          </div>

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
              <span>Tar 10–15 sekunder</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

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
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
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
  icon: typeof Target;
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
 * Custom illustration: ett brev som skrivs.
 * Pulserande ringar bakom, dokument framme, penna som rör sig + skann-linje,
 * och sparkles som flyger ut nar brevet "matas".
 */
function WritingIllustration({ stage }: { stage: number }) {
  const visibleSparkles = Math.min(stage + 1, 3);

  return (
    <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px]">
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

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{
            width: 118,
            height: 152,
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
            <div className="h-2 w-2/3 rounded-full bg-slate-300" />
          </div>
          <div className="px-3 mt-1 flex flex-col gap-1.5">
            {['w-full', 'w-5/6', 'w-full', 'w-2/3', 'w-5/6', 'w-3/4', 'w-full'].map(
              (w, i) => (
                <motion.div
                  key={i}
                  className={`h-1 ${w} rounded-full bg-slate-200`}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{
                    scaleX: i <= stage + 2 ? 1 : 0.3,
                  }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                />
              )
            )}
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
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Penna som rör sig längs brevet */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 32,
          height: 32,
          top: '38%',
          left: '54%',
        }}
        animate={{
          y: [0, 8, 16, 8, 0],
          x: [0, 6, 0, -6, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 32 32" fill="none">
          <g transform="rotate(35 16 16)">
            <rect x="14.5" y="2" width="3" height="20" rx="1.5" fill="url(#pen-grad)" />
            <polygon points="13.5,22 16,28 18.5,22" fill="#1E293B" />
            <rect x="14.5" y="-1" width="3" height="3" fill="#FB923C" />
          </g>
          <defs>
            <linearGradient id="pen-grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Sparkles som flyger ut */}
      <AnimatePresence>
        {[0, 1, 2].slice(0, visibleSparkles).map((i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${15 + i * 22}%`,
              right: -2,
              width: 14,
              height: 14,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 0.7, 0],
              scale: [0.5, 1.2, 1, 0.5],
              x: [0, 8, 16, 24],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          >
            <svg viewBox="0 0 14 14" fill="none">
              <path
                d="M7 0 L8.5 5 L13 6.5 L8.5 8 L7 13 L5.5 8 L1 6.5 L5.5 5 Z"
                fill="url(#sparkle-grad)"
              />
              <defs>
                <linearGradient id="sparkle-grad" x1="0" y1="0" x2="14" y2="14">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#BE185D" />
                </linearGradient>
              </defs>
            </svg>
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
        id="letter-pipeline-dots"
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
        fill="url(#letter-pipeline-dots)"
        opacity="0.4"
      />
    </svg>
  );
}
