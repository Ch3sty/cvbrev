'use client';

import { motion } from 'framer-motion';
import { Wand2, Loader2, FileText, Briefcase, Layout, SlidersHorizontal } from 'lucide-react';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

const TONE_LABELS: Record<string, string> = {
  professional: 'Professionell',
  enthusiastic: 'Entusiastisk',
  creative: 'Kreativ',
  confident: 'Självsäker',
  balanced: 'Balanserad',
  auto: 'Smart-anpassad',
};

const LANG_LABELS: Record<string, string> = {
  sv: 'Svenska',
  en: 'English',
};

interface LetterFlowSummaryProps {
  cvName: string | null;
  jobDescriptionPreview: string;
  templateId: string;
  tonality: string;
  language: string;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  /** Antal brev kvar idag (dagskvot, 1/dag för gratisanvändare) */
  remainingLetters?: number | null;
  /** B3: brevhuvudets kontaktuppgifter, förifyllda från profilen */
  phone: string;
  location: string;
  onPhoneChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  /**
   * Döljer kortets egen knapp. I FlowShell ligger den primära handlingen i
   * den sticky foten, och två knappar med samma jobb på samma skärm är precis
   * den otydlighet skalet ska bort med.
   */
  hidePrimaryAction?: boolean;
}

export default function LetterFlowSummary({
  cvName,
  jobDescriptionPreview,
  templateId,
  tonality,
  language,
  canGenerate,
  isGenerating,
  onGenerate,
  remainingLetters,
  phone,
  location,
  onPhoneChange,
  onLocationChange,
  hidePrimaryAction,
}: LetterFlowSummaryProps) {
  const template = DOCX_TEMPLATES[templateId as keyof typeof DOCX_TEMPLATES];

  const summaryRows = [
    {
      icon: FileText,
      label: 'CV',
      value: cvName || '-',
      ok: !!cvName,
    },
    {
      icon: Briefcase,
      label: 'Annons',
      value: jobDescriptionPreview || '-',
      ok: !!jobDescriptionPreview,
    },
    {
      icon: Layout,
      label: 'Brevmall',
      value: template?.name || '-',
      ok: !!template,
    },
    {
      icon: SlidersHorizontal,
      label: 'Ton & språk',
      value: `${TONE_LABELS[tonality] || tonality} · ${LANG_LABELS[language] || language}`,
      ok: true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-orange-200/50 p-5 sm:p-7"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
        Dina val
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mb-1">
        Allt klart för att skriva
      </h3>
      <p className="text-sm text-neutral-600 mb-5">
        Vi sätter ihop brevet baserat på det här. Du kan redigera efteråt.
      </p>

      <ul className="divide-y divide-neutral-100 mb-6">
        {summaryRows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="flex items-center gap-3 py-2.5 text-sm"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  row.ok
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {row.label}
                </div>
                <div
                  className={`truncate font-medium ${
                    row.ok ? 'text-neutral-900' : 'text-neutral-400'
                  }`}
                >
                  {row.value}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* B3: telefon och ort samlas in här i stället för vid registrering.
          Båda är valfria. Brevhuvudet ser proffsigare ut med dem, men inget
          hindrar den som vill hoppa över. */}
      <div className="border-t border-neutral-200 pt-4 mb-6">
        <h4 className="text-base font-semibold text-neutral-900">
          Kontaktuppgifter till brevhuvudet
        </h4>
        <p className="text-sm text-neutral-600 mt-1 mb-4">
          Valfritt. Vi sparar dem på din profil så du slipper fylla i dem nästa gång.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="letter-phone"
              className="block text-sm text-neutral-600 mb-1"
            >
              Telefon
            </label>
            <input
              id="letter-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="070 123 45 67"
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label
              htmlFor="letter-location"
              className="block text-sm text-neutral-600 mb-1"
            >
              Ort
            </label>
            <input
              id="letter-location"
              type="text"
              autoComplete="address-level2"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Stockholm"
              className="w-full h-11 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400"
            />
          </div>
        </div>
      </div>

      {!hidePrimaryAction && (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Skriver brevet
            </>
          ) : (
            'Skapa mitt brev'
          )}
        </button>
      )}
      <div className="text-center text-sm text-neutral-600 mt-3">
        Tar 10 till 15 sekunder.
        {typeof remainingLetters === 'number' && (
          <span className="ml-1">
            Du har {remainingLetters} brev kvar idag.
          </span>
        )}
      </div>
    </motion.section>
  );
}
