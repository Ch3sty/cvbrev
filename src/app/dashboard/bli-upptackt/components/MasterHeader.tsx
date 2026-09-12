'use client';

import { motion } from 'framer-motion';
import type { Visibility } from './types';

interface MasterHeaderProps {
  visibility: Visibility;
  saving: boolean;
  onToggle: () => void;
}

/**
 * Sidhuvud: eyebrow + rubrik + beskrivning till vänster, masterkortet med
 * switch och statuspill till höger. Switchen styr all synlighet.
 */
export default function MasterHeader({ visibility, saving, onToggle }: MasterHeaderProps) {
  const isOn = visibility !== 'off';
  const pillLabel =
    visibility === 'off'
      ? 'Ej synlig'
      : visibility === 'anonymous'
        ? 'Synlig · anonym'
        : 'Synlig · öppen';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
    >
      <div className="max-w-xl">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 mb-1.5">
          Bli upptäckt
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 mb-2">
          Låt jobben hitta dig
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
          Verifierade rekryterare kan se en kurerad profil, aldrig ditt rå-CV.
          Du styr allt härifrån.
        </p>
      </div>

      {/* Masterkort */}
      <div
        className="flex items-center gap-3 bg-white rounded-xl border border-orange-100 px-4 py-3 self-start"
      >
        <button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Synlig för rekryterare"
          disabled={saving}
          onClick={onToggle}
          className={`relative flex-shrink-0 w-12 h-7 min-w-[48px] rounded-full transition-colors duration-200 touch-manipulation focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-orange-300 focus-visible:outline-offset-2 ${
            isOn ? 'bg-emerald-500' : 'bg-neutral-300'
          } ${saving ? 'opacity-70' : ''}`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
              isOn ? 'left-6' : 'left-1'
            }`}
          />
        </button>
        <div>
          <div className="text-sm font-bold text-neutral-900 leading-tight">
            Synlig för rekryterare
          </div>
          <span
            className={`inline-block mt-1 text-xs font-bold tracking-wide rounded-full px-2.5 py-0.5 ${
              isOn
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {pillLabel}
          </span>
        </div>
      </div>
    </motion.section>
  );
}
