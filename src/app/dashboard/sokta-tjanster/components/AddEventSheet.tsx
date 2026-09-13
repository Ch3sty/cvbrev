'use client';

// Lägg till en händelse i en ansökans tidslinje: stora ikon-chips i grid,
// en tryckning väljer, datum förvalt till idag. "Ej svar" loggas aldrig
// manuellt, det är ett beräknat tillstånd.

import { useEffect, useState } from 'react';
import {
  PhoneCall,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  XCircle,
  CircleSlash,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { STATUS_META, type ApplicationEventType } from '@/lib/applications/status';
import SheetShell from './SheetShell';

interface AddEventSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { event_type: ApplicationEventType; occurred_at: string; note: string | null }) => Promise<void>;
  /** Antal redan genomförda intervjuer, för "Intervju 2"-numrering i chipen. */
  completedInterviews: number;
}

const EVENT_OPTIONS: { type: ApplicationEventType; icon: LucideIcon }[] = [
  { type: 'interview_invited', icon: PhoneCall },
  { type: 'interview_completed', icon: Users },
  { type: 'trial_work_completed', icon: Briefcase },
  { type: 'offer_received', icon: Award },
  { type: 'accepted', icon: CheckCircle2 },
  { type: 'declined', icon: CircleSlash },
  { type: 'rejected', icon: XCircle },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddEventSheet({ open, onClose, onSubmit, completedInterviews }: AddEventSheetProps) {
  const [selected, setSelected] = useState<ApplicationEventType | null>(null);
  const [occurredAt, setOccurredAt] = useState(todayIso());
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setOccurredAt(todayIso());
    setNote('');
    setShowNote(false);
    setError(null);
  }, [open]);

  const handleSubmit = async () => {
    if (!selected || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({ event_type: selected, occurred_at: occurredAt, note: note.trim() || null });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  };

  const chipLabel = (type: ApplicationEventType) => {
    if (type === 'interview_completed' && completedInterviews > 0) {
      return `Genomfört intervju ${completedInterviews + 1}`;
    }
    if (type === 'interview_completed') return 'Genomfört intervju';
    return STATUS_META[type].label;
  };

  return (
    <SheetShell open={open} onClose={onClose} title="Lägg till händelse">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {EVENT_OPTIONS.map(({ type, icon: Icon }) => {
            const isActive = selected === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelected(type)}
                className={`flex min-h-[52px] items-center gap-2.5 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-[border-color,background-color] ${
                  isActive
                    ? 'border-ink-1 bg-panel text-ink-1 shadow-val'
                    : 'border-kant bg-panel text-ink-2 hover:border-kant-stark'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 text-ink-2" strokeWidth={1.75} />
                {chipLabel(type)}
              </button>
            );
          })}
        </div>

        <div>
          <label htmlFor="ev-date" className="mb-1 block text-sm font-medium text-ink-2">
            Datum
          </label>
          <input
            id="ev-date"
            type="date"
            value={occurredAt}
            max={todayIso()}
            onChange={(e) => setOccurredAt(e.target.value)}

            enterKeyHint="next"
            className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-base text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink-1"
        >
          {showNote ? (
            <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
          )}
          Anteckning (valfritt)
        </button>

        {showNote && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}

            enterKeyHint="enter"

            inputMode="text"

            autoComplete="off"
            placeholder="T.ex. vem du träffade eller vad som sades..."
            maxLength={2000}
            rows={3}
            className="w-full resize-none rounded-lg border border-kant bg-insunken px-3 py-2 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
          />
        )}

        {error && (
          <div className="rounded-lg border border-fel-kant bg-fel-mjuk px-3 py-2 text-meta text-fel">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || isSaving}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
        >
          {isSaving ? 'Sparar' : 'Spara händelse'}
        </button>
      </div>
    </SheetShell>
  );
}
