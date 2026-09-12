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
                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left text-[13px] font-semibold transition-all min-h-[52px] ${
                  isActive
                    ? 'bg-orange-50 border-orange-400 text-orange-700'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-neutral-500'}`}
                  strokeWidth={2.25}
                />
                {chipLabel(type)}
              </button>
            );
          })}
        </div>

        <div>
          <label htmlFor="ev-date" className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
            Datum
          </label>
          <input
            id="ev-date"
            type="date"
            value={occurredAt}
            max={todayIso()}
            onChange={(e) => setOccurredAt(e.target.value)}

            enterKeyHint="next"
            className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl text-base text-neutral-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          {showNote ? (
            <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
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
            className="w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all resize-none"
          />
        )}

        {error && (
          <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || isSaving}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700"
        >
          {isSaving ? 'Sparar…' : 'Spara händelse'}
        </button>
      </div>
    </SheetShell>
  );
}
