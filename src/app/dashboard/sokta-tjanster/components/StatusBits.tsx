// Små delade byggstenar för Sökta tjänster: status-pill, progress-dots
// och datumformattering. Hålls i en fil eftersom de alltid används ihop.

import {
  STATUS_META,
  statusProgressStep,
  type ApplicationEventType,
} from '@/lib/applications/status';

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short' }).format(date);
}

export function formatDateLong(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function daysSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}

/**
 * Pillens ton. STATUS_META.pillClass bär den gamla färgskalan (blått,
 * indigo, emerald) och används av delade ytor utanför inloggat läge, så den
 * ligger kvar orörd. Här mappas status i stället till tokens: alla neutrala
 * lägen bär ink, ett avslut bär fel och ett erbjudande bär positiv.
 */
const PILL_TONE: Partial<Record<ApplicationEventType, string>> = {
  offer_received: 'border-kant bg-panel text-positiv',
  accepted: 'border-kant bg-panel text-positiv',
  rejected: 'border-kant bg-panel text-ink-3',
  declined: 'border-kant bg-panel text-ink-3',
  no_response: 'border-kant bg-panel text-ink-3',
};

export function StatusPill({ status }: { status: ApplicationEventType | null }) {
  const meta = STATUS_META[status ?? 'applied'];
  const tone = (status && PILL_TONE[status]) ?? 'border-kant bg-panel text-ink-2';
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-meta font-medium ${tone}`}
    >
      {status === null ? 'Sökt' : meta.label}
    </span>
  );
}

const PROGRESS_LABELS = ['Sökt', 'Svar', 'Intervju', 'Erbjudande'];

/** Fyra dots med förbindelselinjer: Sökt -> Svar -> Intervju -> Erbjudande. */
export function ProgressDots({ status }: { status: ApplicationEventType | null }) {
  const step = statusProgressStep(status);
  return (
    <div className="flex items-center gap-0" aria-label={`Steg ${step + 1} av 4: ${PROGRESS_LABELS[step]}`}>
      {PROGRESS_LABELS.map((label, i) => (
        <div key={label} className="flex items-center">
          {i > 0 && (
            <div className={`h-0.5 w-4 sm:w-6 ${i <= step ? 'bg-ink-2' : 'bg-kant-stark'}`} />
          )}
          <div
            className={`w-2 h-2 rounded-full ${i <= step ? 'bg-ink-1' : 'bg-kant-stark'}`}
            title={label}
          />
        </div>
      ))}
    </div>
  );
}
