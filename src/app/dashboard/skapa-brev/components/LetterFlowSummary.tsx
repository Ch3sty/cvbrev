'use client';

/**
 * Steg 5: stämmer allt? Dina val som rader med naken ikon 24, och
 * kontaktuppgifterna till brevhuvudet som en rad med Ändra (2026-10-10:
 * telefon och ort hade egna fält här, som sparades först när brevet
 * skrevs; nu sparas de direkt och syns i brevet som skrivs). Knappen
 * ligger i skalets fot (hidePrimaryAction), kortet bär bara metaraden om tid
 * och kvot.
 */

import KontaktuppgifterRad from '@/components/shell/KontaktuppgifterRad';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import {
  IkonCv,
  IkonAnsokningar,
  IkonMallar,
  IkonProfessionell,
  IkonEntusiastisk,
  IkonKreativ,
  IkonSjalvsaker,
  IkonBalanserad,
  IkonAnalys,
  type IkonProps,
} from '@/components/illustrations/Ikoner';

const TONE_LABELS: Record<string, string> = {
  professional: 'Professionell',
  enthusiastic: 'Entusiastisk',
  creative: 'Kreativ',
  confident: 'Självsäker',
  balanced: 'Balanserad',
  auto: 'Vi väljer ton åt dig',
};

const TONE_ICONS: Record<string, (props: IkonProps) => React.JSX.Element> = {
  professional: IkonProfessionell,
  enthusiastic: IkonEntusiastisk,
  creative: IkonKreativ,
  confident: IkonSjalvsaker,
  balanced: IkonBalanserad,
  auto: IkonAnalys,
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
  hidePrimaryAction,
}: LetterFlowSummaryProps) {
  const template = DOCX_TEMPLATES[templateId as keyof typeof DOCX_TEMPLATES];
  const ToneIcon = TONE_ICONS[tonality] ?? IkonBalanserad;

  const rows = [
    { icon: IkonCv, label: 'CV', value: cvName || 'Inget CV valt', ok: !!cvName },
    {
      icon: IkonAnsokningar,
      label: 'Annons',
      value: jobDescriptionPreview || 'Ingen annons',
      ok: !!jobDescriptionPreview,
    },
    { icon: IkonMallar, label: 'Brevmall', value: template?.name || 'Ingen mall', ok: !!template },
    {
      icon: ToneIcon,
      label: 'Ton och språk',
      value: `${TONE_LABELS[tonality] || tonality} · ${LANG_LABELS[language] || language}`,
      ok: true,
    },
  ];

  return (
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <ul className="divide-y divide-kant">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li key={row.label} className="flex items-center gap-3 py-2.5">
              <Icon size={24} className="shrink-0 text-ink-2" />
              <div className="min-w-0 flex-1">
                <p className="text-meta text-ink-3">{row.label}</p>
                <p className={`truncate text-sm font-medium ${row.ok ? 'text-ink-1' : 'text-ink-3'}`}>
                  {row.value}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* B3: kontaktuppgifterna till brevhuvudet. Raden visar vad brevet
          får, Ändra sparar direkt i profilen och brevet skrivs med dem. */}
      <KontaktuppgifterRad dokument="brev" className="mt-4" />

      {!hidePrimaryAction ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? 'Skriver brevet' : 'Skapa mitt brev'}
        </button>
      ) : null}

      <p className="mt-3 text-meta text-ink-3">
        Tar 10 till 15 sekunder.
        {typeof remainingLetters === 'number' ? ` Du har ${remainingLetters} brev kvar idag.` : ''}
      </p>
    </section>
  );
}
