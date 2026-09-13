'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { scheduleIdle } from '@/lib/scheduleIdle';
import Link from 'next/link';
import { IkonKlocka } from '@/components/illustrations/Ikoner';
import { IlluTomNotiser } from '@/components/illustrations/EmptyStateIllustrations';

interface NotificationItem {
  id: string;
  type: string | null;
  title: string | null;
  message: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

/** "för 2 timmar sedan" på svenska, grov men tillräcklig. */
function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  if (Number.isNaN(diff)) return '';
  const min = Math.round(diff / 60000);
  if (min < 1) return 'nyss';
  if (min < 60) return `för ${min} min sedan`;
  const h = Math.round(min / 60);
  if (h < 24) return `för ${h} tim sedan`;
  const d = Math.round(h / 24);
  if (d < 7) return `för ${d} ${d === 1 ? 'dag' : 'dagar'} sedan`;
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/**
 * Notisklocka för dashboardheadern: hämtar användarens notiser, visar oläst-
 * badge och en dropdown. Klick på en notis markerar den läst och navigerar till
 * dess action_url (t.ex. rekryterarintresset till Bli upptäckt).
 */
export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // Tyst: notiser är icke-kritiska.
    }
  }, []);

  useEffect(() => {
    // Notiserna behövs inte för första målningen. Att hämta dem vid mount
    // lade en rundtur i den kritiska vägen på varje inloggad sidladdning.
    const avbryt = scheduleIdle(() => load());

    // Notiser skapas av cronen en gång per dygn och av rekryterarintressen
    // sällan. Att fråga varje minut var alltså 60 anrop i timmen för data som
    // ändras några gånger i veckan. Fem minuter räcker, och en hämtning när
    // fliken får fokus fångar det som hänt medan användaren var borta.
    const t = setInterval(load, 5 * 60 * 1000);

    const onFocus = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  // Stäng vid klick utanför.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnread(0);
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch {
      // Optimistiskt, ladda om vid nästa poll.
    }
  };

  const markOne = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {
      // Optimistiskt.
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="relative inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notiser, ${unread} olästa` : 'Notiser'}
      >
        <IkonKlocka size={22} />
        {/* Diskret prick i stället för sifferbadge: antalet olästa är inte
            en siffra användaren agerar på, bara ett tecken på att något nytt
            finns. Pricken är ink, inte orange: orange betyder position. */}
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ink-1 ring-2 ring-panel"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border border-kant bg-panel shadow-svav motion-safe:animate-thread-drop">
          <div className="flex min-h-[44px] items-center justify-between border-b border-kant px-4">
            <span className="text-sm font-medium text-ink-1">Notiser</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="text-meta font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
              >
                Markera alla lästa
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              // Tomt tillstånd som lovar något konkret i stället för att
              // konstatera en tomhet. Klockan är alltid synlig, så det här är
              // vyn de flesta konton möter tills första uppföljningen faller ut.
              <div className="px-4 py-6 text-center">
                <span className="inline-block text-ink-1" aria-hidden="true">
                  <IlluTomNotiser size={96} />
                </span>
                <p className="mt-2 text-sm leading-[22px] text-ink-2">
                  Här får du veta när en ansökan behöver följas upp och när en
                  rekryterare tittat på din profil.
                </p>
              </div>
            ) : (
              items.map((n) => {
                const inner = (
                  <div
                    className={`flex items-start gap-2.5 border-b border-kant px-4 py-3 transition-colors hover:bg-insunken/60 ${
                      n.read ? '' : 'bg-insunken/40'
                    }`}
                  >
                    <span
                      className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-ink-1'}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      {n.title && (
                        <p className="text-sm font-medium leading-5 text-ink-1">{n.title}</p>
                      )}
                      {n.message && (
                        <p className="mt-0.5 text-meta text-ink-2">{n.message}</p>
                      )}
                      <p className="mt-1 text-meta text-ink-3">{relativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return n.actionUrl ? (
                  <Link
                    key={n.id}
                    href={n.actionUrl}
                    onClick={() => {
                      markOne(n.id);
                      setOpen(false);
                    }}
                    className="block"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markOne(n.id)}
                    className="block w-full text-left"
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
