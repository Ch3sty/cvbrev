'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Inbox as InboxIcon, MessageSquare } from 'lucide-react';
import InterestThread from '@/components/interests/InterestThread';
import {
  CTA_GRADIENT,
  formatLongDate,
  type InterestItem,
} from '../components/types';

/**
 * Inbox: alla skickade intressen med kandidatens svar. Accepterade ligger
 * överst, sedan väntande, sist avböjda.
 */
export default function InboxPage() {
  const [interests, setInterests] = useState<InterestItem[] | null>(null);
  const [error, setError] = useState(false);
  const [openThread, setOpenThread] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/recruiter/interests');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { interests: InterestItem[] };
        if (cancelled) return;
        const order = (status: string) =>
          status === 'accepted' ? 0 : status === 'pending' ? 1 : 2;
        setInterests(
          [...data.interests].sort(
            (a, b) =>
              order(a.status) - order(b.status) ||
              Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        );
      } catch {
        if (!cancelled) {
          setInterests([]);
          setError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Inbox</h1>
        <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed max-w-xl">
          Intressen ni skickat och kandidaternas svar. När en kandidat tackar
          ja låses namn och e-post upp på profilen.
        </p>
      </motion.div>

      {error && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          Vi kunde inte hämta din inbox. Ladda om sidan och försök igen.
        </p>
      )}

      {interests === null ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-orange-50/60 h-24 animate-pulse" />
          ))}
        </div>
      ) : interests.length === 0 && !error ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <InboxIcon className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Inga intressen ännu</h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto mb-5">
            Visa intresse för en kandidat i sökningen så dyker svaret upp här.
          </p>
          <Link
            href="/rekryterare"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: CTA_GRADIENT }}
          >
            Sök kandidater
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest, i) => (
            <motion.div
              key={interest.interestId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.25), ease: 'easeOut' }}
              className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5"
              style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.14)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
                  aria-hidden="true"
                >
                  {(interest.card?.role ?? 'K').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-slate-900 leading-tight">
                      {interest.card?.role ?? 'Kandidaten är inte längre synlig'}
                    </span>
                    <StatusBadge status={interest.status} />
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {[
                      interest.card?.regions[0] ?? null,
                      `Skickat ${formatLongDate(interest.createdAt) ?? ''}`,
                      interest.respondedAt
                        ? `Svar ${formatLongDate(interest.respondedAt) ?? ''}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {interest.message && (
                    <p className="mt-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[12.5px] text-slate-600 leading-relaxed italic">
                      &rdquo;{interest.message}&rdquo;
                    </p>
                  )}
                </div>
                {interest.card && (
                  <Link
                    href={`/rekryterare/kandidat/${interest.candidateUserId}?from=${encodeURIComponent('/rekryterare/inbox')}`}
                    className="flex-shrink-0 inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg text-[12.5px] font-bold text-orange-700 hover:bg-orange-50 transition-colors"
                  >
                    Öppna profil
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

              {/* Meddelandetråd: bara när kandidaten accepterat kontakten */}
              {interest.status === 'accepted' && (
                <div className="mt-3 pl-0 sm:pl-[52px]">
                  {openThread === interest.interestId ? (
                    <InterestThread interestId={interest.interestId} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenThread(interest.interestId);
                        // Öppnad = läst: nolla oläst-räknaren lokalt.
                        setInterests((prev) =>
                          (prev ?? []).map((it) =>
                            it.interestId === interest.interestId
                              ? { ...it, unreadCount: 0 }
                              : it
                          )
                        );
                      }}
                      className={`relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[12.5px] font-bold transition-colors ${
                        (interest.unreadCount ?? 0) > 0
                          ? 'border-orange-300 bg-orange-50 text-orange-800'
                          : 'border-orange-200 bg-white text-orange-700 hover:bg-orange-50'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                      {(interest.unreadCount ?? 0) > 0
                        ? `Nytt svar från kandidaten (${interest.unreadCount})`
                        : (interest.messageCount ?? 0) > 0
                          ? `Öppna konversation (${interest.messageCount})`
                          : 'Skriv ett meddelande'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700">
        Accepterad
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500">
        Avböjd
      </span>
    );
  }
  return (
    <span className="inline-flex text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700">
      Väntar
    </span>
  );
}
