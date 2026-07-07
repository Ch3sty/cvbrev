'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

/**
 * Genväg till meddelande-hubben, högt upp på Bli upptäckt. När du väntar på
 * svar är det första du vill åt. Self-fetchar antal väntande + olästa så texten
 * stämmer. Renderar ingenting när det inte finns några intressen alls.
 */
export default function MessagesShortcut() {
  const [pending, setPending] = useState(0);
  const [unread, setUnread] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/interests');
        if (!res.ok) return;
        const data = await res.json();
        const interests = (data.interests ?? []) as Array<{
          status: string;
          unreadCount?: number;
        }>;
        if (cancelled) return;
        setTotal(interests.length);
        setPending(interests.filter((i) => i.status === 'pending').length);
        setUnread(interests.reduce((s, i) => s + (i.unreadCount ?? 0), 0));
      } catch {
        // Icke-kritiskt.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (total === 0) return null;

  const badge = pending + unread;
  const parts: string[] = [];
  if (pending > 0) parts.push(`${pending} väntar på ditt svar`);
  if (unread > 0) parts.push(`${unread} ${unread === 1 ? 'oläst konversation' : 'olästa konversationer'}`);
  const line = parts.length > 0 ? parts.join(', ') : 'Öppna dina konversationer med rekryterare';

  return (
    <Link
      href="/dashboard/meddelanden"
      className="flex items-center gap-3.5 rounded-2xl border border-orange-100 bg-white p-4 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <span
        className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
        aria-hidden="true"
      >
        <MessageSquare className="w-5 h-5" strokeWidth={2.25} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-red-600 border-2 border-white text-[11px] font-black flex items-center justify-center shadow">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-bold text-slate-900">Dina meddelanden</div>
        <p className="text-[12.5px] text-slate-500 truncate">{line}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-orange-600 flex-shrink-0" strokeWidth={2.5} aria-hidden="true" />
    </Link>
  );
}
