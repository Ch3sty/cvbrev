'use client';

// Snabblogg av en ansökan: två obligatoriska fält plus datum och kanal-chips.
// Målet är under 15 sekunder. Används även i redigeringsläge från detaljvyn.

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  CHANNEL_META,
  type ApplicationChannel,
  type JobApplication,
} from '@/lib/applications/status';
import type { CreateApplicationInput } from '@/hooks/use-applications';
import SheetShell from './SheetShell';

interface QuickLogSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateApplicationInput) => Promise<void>;
  /** Fylls i vid redigering av en befintlig ansökan. */
  initial?: JobApplication | null;
}

const CHANNELS: ApplicationChannel[] = ['ad', 'unsolicited', 'network'];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface CvOption {
  id: string;
  file_name: string | null;
}

export default function QuickLogSheet({ open, onClose, onSubmit, initial }: QuickLogSheetProps) {
  const isEdit = Boolean(initial);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [appliedAt, setAppliedAt] = useState(todayIso());
  const [channel, setChannel] = useState<ApplicationChannel>('ad');
  // Vilket CV som användes. Utan detta går "CV A ger 30 procent svar" inte
  // att räkna, så fältet ligger i huvudformuläret och inte under detaljerna.
  const [cvId, setCvId] = useState<string>('');
  const [cvs, setCvs] = useState<CvOption[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [location, setLocation] = useState('');
  const [jobAdUrl, setJobAdUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setJobTitle(initial?.job_title ?? '');
    setCompany(initial?.company ?? '');
    setAppliedAt(initial?.applied_at ?? todayIso());
    setChannel((initial?.application_channel as ApplicationChannel) ?? 'ad');
    setCvId(initial?.cv_id ?? '');
    setLocation(initial?.location ?? '');
    setJobAdUrl(initial?.job_ad_url ?? '');
    setNotes(initial?.notes ?? '');
    setShowDetails(Boolean(initial?.location || initial?.job_ad_url || initial?.notes));
    setError(null);
    // Autofokus på första fältet så loggningen går snabbt.
    const timer = setTimeout(() => titleRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [open, initial]);

  // CV-listan hämtas först när arket öppnas: ingen anledning att fråga i förväg.
  useEffect(() => {
    if (!open || cvs.length > 0) return;
    let cancelled = false;
    fetch('/api/cv/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        setCvs((json.cvs ?? []) as CvOption[]);
      })
      .catch(() => {
        /* utan lista hoppar vi bara över fältet */
      });
    return () => {
      cancelled = true;
    };
  }, [open, cvs.length]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!jobTitle.trim() || !company.trim() || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        job_title: jobTitle.trim(),
        company: company.trim(),
        applied_at: appliedAt,
        application_channel: channel,
        cv_id: cvId || null,
        location: location.trim() || null,
        job_ad_url: jobAdUrl.trim() || null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1';

  return (
    <SheetShell open={open} onClose={onClose} title={isEdit ? 'Redigera ansökan' : 'Logga ansökan'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ql-title" className="mb-1 block text-sm font-medium text-ink-2">
            Tjänst
          </label>
          <input
            id="ql-title"
            ref={titleRef}
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}

            enterKeyHint="next"

            inputMode="text"

            autoComplete="organization-title"
            placeholder="T.ex. Kundtjänstmedarbetare"
            maxLength={200}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ql-company" className="mb-1 block text-sm font-medium text-ink-2">
            Arbetsgivare
          </label>
          <input
            id="ql-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}

            enterKeyHint="next"

            inputMode="text"

            autoComplete="organization"
            placeholder="T.ex. Volvo Cars"
            maxLength={200}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ql-date" className="mb-1 block text-sm font-medium text-ink-2">
            Datum sökt
          </label>
          <input
            id="ql-date"
            type="date"
            value={appliedAt}
            max={todayIso()}
            onChange={(e) => setAppliedAt(e.target.value)}

            enterKeyHint="next"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1 block text-sm font-medium text-ink-2">Hur sökte du?</div>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setChannel(value)}
                className={`min-h-11 rounded-lg border px-3 text-sm font-medium transition-[border-color,background-color] ${
                  channel === value
                    ? 'border-ink-1 bg-panel text-ink-1 shadow-val'
                    : 'border-kant bg-panel text-ink-2 hover:border-kant-stark'
                }`}
              >
                {CHANNEL_META[value].label}
              </button>
            ))}
          </div>
        </div>

        {cvs.length > 0 && (
          <div>
            <label htmlFor="ql-cv" className="mb-1 block text-sm font-medium text-ink-2">
              Vilket CV skickade du?
            </label>
            <select
              id="ql-cv"
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
              className={inputClass}
            >
              <option value="">Vet inte</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.file_name || 'CV utan namn'}
                </option>
              ))}
            </select>
            {cvs.length > 1 && (
              <p className="mt-1 block text-meta text-ink-3">
                Vi räknar ut vilket av dina CV som ger flest svar.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink-1"
        >
          {showDetails ? (
            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          )}
          Fler detaljer (valfritt)
        </button>

        {showDetails && (
          <div className="space-y-4">
            <div>
              <label htmlFor="ql-location" className="mb-1 block text-sm font-medium text-ink-2">
                Ort
              </label>
              <input
                id="ql-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}

                enterKeyHint="next"

                inputMode="text"

                autoComplete="address-level2"
                placeholder="T.ex. Göteborg"
                maxLength={200}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ql-url" className="mb-1 block text-sm font-medium text-ink-2">
                Länk till annonsen
              </label>
              <input
                id="ql-url"
                type="url"
                value={jobAdUrl}
                onChange={(e) => setJobAdUrl(e.target.value)}

                enterKeyHint="next"

                inputMode="url"

                autoComplete="url"
                placeholder="https://..."
                maxLength={2048}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ql-notes" className="mb-1 block text-sm font-medium text-ink-2">
                Anteckning
              </label>
              <textarea
                id="ql-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}

                enterKeyHint="enter"

                inputMode="text"

                autoComplete="off"
                placeholder="T.ex. kontaktperson, löneanspråk, intryck..."
                maxLength={4000}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-fel-kant bg-fel-mjuk px-3 py-2 text-meta text-fel">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || !jobTitle.trim() || !company.trim()}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
        >
          {isSaving ? 'Sparar…' : isEdit ? 'Spara ändringar' : 'Logga ansökan'}
        </button>
      </form>
    </SheetShell>
  );
}
