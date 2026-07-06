'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, StickyNote } from 'lucide-react';
import { formatLongDate } from '../types';

/**
 * Privat anteckning per (rekryterare, kandidat): popover mot notes-API:t.
 * Tom sträng raderar anteckningen.
 */
export default function NotesPopover({ candidateUserId }: { candidateUserId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [hasNote, setHasNote] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/recruiter/notes?candidateUserId=${encodeURIComponent(candidateUserId)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          note: { note: string; updatedAt: string } | null;
        };
        if (cancelled) return;
        setNote(data.note?.note ?? '');
        setUpdatedAt(data.note?.updatedAt ?? null);
        setHasNote(Boolean(data.note?.note));
      } catch {
        // Anteckningen är en bekvämlighet, tyst vid fel.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidateUserId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateUserId, note }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHasNote(Boolean(note.trim()));
      setUpdatedAt(new Date().toISOString());
      setOpen(false);
    } catch {
      setError('Kunde inte spara anteckningen. Försök igen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-[13px] font-bold border transition-colors ${
          hasNote
            ? 'text-orange-800 border-orange-300 bg-orange-50 hover:bg-orange-100'
            : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
        }`}
      >
        <StickyNote
          className={`w-4 h-4 ${hasNote ? 'text-orange-500' : 'text-slate-400'}`}
          aria-hidden="true"
        />
        Anteckning
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Privat anteckning"
          className="absolute right-0 top-full mt-1.5 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg p-3 z-50"
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            disabled={!loaded}
            placeholder="Skriv en privat anteckning om kandidaten. Bara du ser den."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 resize-y"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 truncate">
              {updatedAt ? `Uppdaterad ${formatLongDate(updatedAt) ?? ''}` : 'Privat för dig'}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={saving || !loaded}
              className="flex-shrink-0 min-h-[36px] px-4 rounded-xl text-[12.5px] font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Sparar…' : 'Spara'}
            </button>
          </div>
          {error && <p className="mt-1.5 text-[11.5px] text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
