'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';
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
    load();

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
        onClick={() => setOpen((v) => !v)}
        className="relative touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-orange-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all"
        aria-label={unread > 0 ? `Notiser, ${unread} olästa` : 'Notiser'}
      >
        <Bell className="w-[18px] h-[18px] text-neutral-600" strokeWidth={2.25} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-xs font-semibold flex items-center justify-center"
            style={{ background: '#EA580C' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-24px)] bg-white rounded-xl border border-orange-100 shadow-[0_16px_40px_-16px_rgba(2,6,23,0.3)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
            <span className="text-[13px] font-bold text-neutral-900">Notiser</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-800"
              >
                <Check className="w-3 h-3" strokeWidth={3} />
                Markera alla lästa
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              // Tomt tillstånd som lovar något konkret i stället för att
              // konstatera en tomhet. Klockan är alltid synlig (enighets-
              // protokollet), så det här är vyn de flesta konton möter tills
              // första uppföljningen faller ut.
              <div className="px-4 py-8 text-center">
                <span className="inline-block text-neutral-900" aria-hidden="true">
                  <IlluTomNotiser size={96} />
                </span>
                <p className="text-sm text-neutral-600 leading-relaxed mt-3">
                  Här får du veta när en ansökan behöver följas upp och när en
                  rekryterare tittat på din profil.
                </p>
              </div>
            ) : (
              items.map((n) => {
                const inner = (
                  <div
                    className={`flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-orange-50/40 ${
                      n.read ? '' : 'bg-orange-50/30'
                    }`}
                  >
                    {!n.read && (
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#EA580C' }}
                        aria-hidden="true"
                      />
                    )}
                    <div className={`min-w-0 flex-1 ${n.read ? 'pl-4' : ''}`}>
                      {n.title && (
                        <p className="text-xs font-bold text-neutral-900 leading-snug">
                          {n.title}
                        </p>
                      )}
                      {n.message && (
                        <p className="text-xs text-neutral-500 leading-snug mt-0.5">
                          {n.message}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 mt-1">{relativeTime(n.createdAt)}</p>
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
