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
    'w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all';

  return (
    <SheetShell open={open} onClose={onClose} title={isEdit ? 'Redigera ansökan' : 'Logga ansökan'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ql-title" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
          <label htmlFor="ql-company" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
          <label htmlFor="ql-date" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
          <div className="text-[13px] font-semibold text-neutral-700 mb-1.5">Hur sökte du?</div>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setChannel(value)}
                className={`px-3.5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all min-h-[44px] ${
                  channel === value
                    ? 'bg-orange-50 border-orange-400 text-orange-700'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {CHANNEL_META[value].label}
              </button>
            ))}
          </div>
        </div>

        {cvs.length > 0 && (
          <div>
            <label htmlFor="ql-cv" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
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
              <p className="mt-1.5 text-xs text-neutral-500">
                Vi räknar ut vilket av dina CV som ger flest svar.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
          )}
          Fler detaljer (valfritt)
        </button>

        {showDetails && (
          <div className="space-y-4">
            <div>
              <label htmlFor="ql-location" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
              <label htmlFor="ql-url" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
              <label htmlFor="ql-notes" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
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
          <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || !jobTitle.trim() || !company.trim()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700"
        >
          {isSaving ? 'Sparar…' : isEdit ? 'Spara ändringar' : 'Logga ansökan'}
        </button>
      </form>
    </SheetShell>
  );
}
