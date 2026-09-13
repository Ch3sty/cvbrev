'use client';

/**
 * Steg 5: stämmer allt? Dina val som rader med naken ikon 24, och de
 * valfria kontaktuppgifterna till brevhuvudet som insunkna fält. Knappen
 * ligger i skalets fot (hidePrimaryAction), kortet bär bara metaraden om tid
 * och kvot.
 */

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
  auto: 'Smart-anpassad',
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

const FIELD =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken transition-colors placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

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

      {/* B3: telefon och ort samlas in här i stället för vid registrering.
          Båda är valfria. */}
      <div className="mt-4 border-t border-kant pt-4">
        <h3 className="text-kort text-ink-1">Kontaktuppgifter till brevhuvudet</h3>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Valfritt. Vi sparar dem på din profil så du slipper fylla i dem nästa gång.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="letter-phone" className="mb-1 block text-sm text-ink-2">
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
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="letter-location" className="mb-1 block text-sm text-ink-2">
              Ort
            </label>
            <input
              id="letter-location"
              type="text"
              autoComplete="address-level2"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Stockholm"
              className={FIELD}
            />
          </div>
        </div>
      </div>

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
