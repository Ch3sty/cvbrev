'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { formatLongDate } from '../types';

/**
 * Dela till hiring manager: POST /api/recruiter/share skapar en tokeniserad
 * länk (14 dagar) med exakt samma maskering som rekryteraren själv ser.
 * Länken visas i en popover med kopieringsknapp.
 */
export default function ShareButton({ candidateUserId }: { candidateUserId: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    setCopied(false);
    if (next) setRevoked(false);
    if (next && !url && !creating) {
      setCreating(true);
      setError(null);
      try {
        const res = await fetch('/api/recruiter/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        });
        const data = (await res.json().catch(() => null)) as {
          url?: string;
          expiresAt?: string;
          error?: string;
        } | null;
        if (!res.ok || !data?.url) {
          setError(data?.error ?? 'Kunde inte skapa delningslänken.');
          return;
        }
        setUrl(data.url);
        setExpiresAt(data.expiresAt ?? null);
      } catch {
        setError('Kunde inte skapa delningslänken.');
      } finally {
        setCreating(false);
      }
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallet utan clipboard-behörighet: fältet är markerbart.
    }
  };

  const revoke = async () => {
    setRevoking(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateUserId }),
      });
      if (!res.ok) {
        setError('Kunde inte återkalla länken.');
        return;
      }
      // Länken är död: nolla så en ny kan skapas vid behov.
      setUrl(null);
      setExpiresAt(null);
      setRevoked(true);
    } catch {
      setError('Kunde inte återkalla länken.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-[13px] font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
      >
        <Share2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
        Dela
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Dela profilen"
          className="absolute right-0 top-full mt-1.5 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg p-3 z-50"
        >
          <p className="text-[12.5px] font-bold text-slate-800 mb-1">
            Länk till hiring manager
          </p>
          <p className="text-[11.5px] text-slate-400 leading-relaxed mb-2.5">
            Mottagaren ser exakt det du ser här, med samma maskering. Ingen
            inloggning krävs.
          </p>

          {creating ? (
            <p className="text-[12.5px] text-slate-400">Skapar länk…</p>
          ) : error ? (
            <p className="text-[12px] text-red-600">{error}</p>
          ) : url ? (
            <>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 min-h-[36px] px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[12px] text-slate-700"
                  aria-label="Delningslänk"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                  aria-label="Kopiera länken"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                {expiresAt && (
                  <p className="text-[11px] text-slate-400">
                    Slutar gälla {formatLongDate(expiresAt) ?? 'om 14 dagar'}.
                  </p>
                )}
                <button
                  type="button"
                  onClick={revoke}
                  disabled={revoking}
                  className="flex-shrink-0 text-[11.5px] font-bold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {revoking ? 'Återkallar…' : 'Återkalla länken'}
                </button>
              </div>
            </>
          ) : revoked ? (
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Länken är återkallad och fungerar inte längre. Öppna panelen igen
              för att skapa en ny.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
