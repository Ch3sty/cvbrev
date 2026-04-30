'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { SaveCloudIcon, DownloadCloudIcon, SaveDownloadIcon } from './SaveIcons';

export type SaveChoice = 'save-and-download' | 'download' | 'save';

interface SaveActionSegmentsProps {
  value: SaveChoice | null;
  onChange: (choice: SaveChoice) => void;
  canSave: boolean;
  cvCount: number;
  maxCvs: number;
  disabled?: boolean;
}

const CHOICES: Array<{
  id: SaveChoice;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof SaveCloudIcon;
  needsQuota: boolean;
}> = [
  {
    id: 'save-and-download',
    label: 'Spara och ladda ned',
    shortLabel: 'Spara och ladda ned',
    description: 'Vi sparar i ditt CV-bibliotek och laddar ned PDF samtidigt.',
    icon: SaveDownloadIcon,
    needsQuota: true,
  },
  {
    id: 'download',
    label: 'Ladda ned',
    shortLabel: 'Ladda ned',
    description: 'Vi laddar ned en PDF utan att spara. Du kan ladda upp senare.',
    icon: DownloadCloudIcon,
    needsQuota: false,
  },
  {
    id: 'save',
    label: 'Spara på Jobbcoach',
    shortLabel: 'Spara på Jobbcoach',
    description: 'Vi sparar i ditt CV-bibliotek utan nedladdning.',
    icon: SaveCloudIcon,
    needsQuota: true,
  },
];

export default function SaveActionSegments({
  value,
  onChange,
  canSave,
  cvCount,
  maxCvs,
  disabled = false,
}: SaveActionSegmentsProps) {
  const activeChoice = CHOICES.find((c) => c.id === value);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid rgba(249, 115, 22, 0.22)',
        boxShadow: '0 4px 14px -8px rgba(249, 115, 22, 0.18)',
      }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1">
          Vad ska hända när du klickar?
        </div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900">
          Välj sparastrategi
        </h4>
      </div>

      {/* Segment-bar */}
      <div className="px-3 sm:px-4 pb-3">
        <div
          className="grid grid-cols-3 gap-1 p-1 rounded-xl"
          style={{
            background: 'rgba(255, 247, 237, 0.7)',
            border: '1px solid rgba(249, 115, 22, 0.15)',
          }}
        >
          {CHOICES.map((choice) => {
            const isActive = value === choice.id;
            const isDisabled = disabled || (choice.needsQuota && !canSave);
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => !isDisabled && onChange(choice.id)}
                disabled={isDisabled}
                className="relative px-2 py-2.5 rounded-lg text-center transition-all min-h-[60px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-not-allowed"
                style={
                  isActive
                    ? {
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                        color: 'white',
                        boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.45)',
                      }
                    : {
                        color: isDisabled ? '#94A3B8' : '#9A3412',
                        opacity: isDisabled ? 0.5 : 1,
                      }
                }
                aria-pressed={isActive}
              >
                {/* Lock-badge för disabled */}
                {isDisabled && choice.needsQuota && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center">
                    <Lock className="w-2 h-2 text-white" strokeWidth={3} />
                  </span>
                )}

                <div className="flex flex-col items-center gap-1">
                  <div
                    className={isActive ? 'text-white' : 'text-orange-600'}
                    style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                      isActive ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {choice.shortLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Förklarande text under aktiv */}
      <AnimatePresence mode="wait">
        {activeChoice && (
          <motion.div
            key={activeChoice.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="px-4 sm:px-5 pb-4 -mt-1"
          >
            <div
              className="rounded-xl p-3 flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed"
              style={{
                background:
                  'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
                border: '1px solid rgba(249, 115, 22, 0.18)',
                color: '#7C2D12',
              }}
            >
              <span
                className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              />
              <div className="flex-1 min-w-0">
                <p>{activeChoice.description}</p>
                {activeChoice.needsQuota && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                    {cvCount}/{maxCvs} platser använda
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
