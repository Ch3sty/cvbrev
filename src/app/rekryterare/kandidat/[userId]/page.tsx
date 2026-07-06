'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import AddToProjectMenu from '../../components/AddToProjectMenu';
import { InterestStatusBadge } from '../../components/CandidateTable';
import NotesPopover from '../../components/profile/NotesPopover';
import ShareButton from '../../components/profile/ShareButton';
import ProfileSections from '../../components/profile/ProfileSections';
import {
  CTA_GRADIENT,
  type CandidateDetail,
  type InterestStatus,
} from '../../components/types';

const MESSAGE_MAX = 500;

/**
 * Detaljprofilen: beslutsstödsordningen med sticky action-bar. Maskeringen
 * sköts av API:t; sidan renderar bara det som kommer tillbaka.
 */
export default function KandidatDetaljPage() {
  return (
    <Suspense
      fallback={<div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" aria-hidden="true" />}
    >
      <DetailView />
    </Suspense>
  );
}

/** Kontextuell tillbaka-länk: ?from= i första hand, referrer som fallback. */
function useBackTarget(): { href: string; label: string } {
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') ?? null;

  return useMemo(() => {
    const resolve = (path: string): { href: string; label: string } | null => {
      if (!path.startsWith('/rekryterare')) return null;
      if (path.startsWith('/rekryterare/projekt')) return { href: path, label: 'Till projektet' };
      if (path.startsWith('/rekryterare/inbox')) return { href: path, label: 'Till inboxen' };
      if (path.startsWith('/rekryterare/jamfor')) return { href: path, label: 'Till jämförelsen' };
      return { href: path, label: 'Till sökningen' };
    };

    if (from) {
      const target = resolve(from);
      if (target) return target;
    }
    if (typeof document !== 'undefined' && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          const target = resolve(ref.pathname + ref.search);
          if (target) return target;
        }
      } catch {
        // Oparsbar referrer: falla ner till poolen.
      }
    }
    return { href: '/rekryterare', label: 'Till poolen' };
  }, [from]);
}

function DetailView() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const back = useBackTarget();

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [interestStatus, setInterestStatus] = useState<InterestStatus>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/recruiter/candidate/${encodeURIComponent(userId)}`);
      if (res.status === 404) {
        setState('notfound');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        candidate: CandidateDetail;
        interestStatus: InterestStatus;
      };
      setCandidate(data.candidate);
      setInterestStatus(data.interestStatus);
      setState('ready');
    } catch (error) {
      console.error('Kandidatprofil: kunde inte hämta', error);
      setState('error');
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleInterest = async () => {
    if (!userId) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch('/api/recruiter/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateUserId: userId,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 429) {
        setNotice(data?.error ?? 'Du har nått gränsen på 10 intressen per dygn.');
        return;
      }
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setInterestStatus(data?.interest?.status ?? 'pending');
      setMessageOpen(false);
    } catch (error) {
      console.error('Kandidatprofil: kunde inte skicka intresse', error);
      setNotice('Det gick inte att skicka intresset. Försök igen.');
    } finally {
      setSending(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="space-y-5" aria-hidden="true">
        <div className="rounded-3xl bg-orange-50/60 h-14 animate-pulse" />
        <div className="rounded-3xl bg-orange-50/60 h-40 animate-pulse" />
        <div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" />
      </div>
    );
  }

  if (state === 'notfound' || state === 'error' || !candidate) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
        <h1 className="text-base font-bold text-slate-900 mb-1.5">
          {state === 'notfound' ? 'Profilen är inte längre synlig' : 'Något gick fel'}
        </h1>
        <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
          {state === 'notfound'
            ? 'Kandidaten kan ha stängt av sin synlighet. Poolen uppdateras löpande.'
            : 'Vi kunde inte hämta profilen. Ladda om sidan och försök igen.'}
        </p>
        <Link
          href="/rekryterare"
          className="inline-flex items-center gap-1.5 justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: CTA_GRADIENT }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Tillbaka till poolen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Sticky action-bar */}
      <div className="sticky top-16 z-30 -mx-1 px-1">
        <div className="rounded-2xl border border-orange-100 bg-white/95 backdrop-blur px-3 py-2 flex items-center gap-2 flex-wrap shadow-sm">
          <Link
            href={back.href}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 text-[13px] font-bold text-slate-500 hover:text-orange-600 transition-colors mr-auto"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {back.label}
          </Link>

          {userId && <NotesPopover candidateUserId={userId} />}
          {userId && <ShareButton candidateUserId={userId} />}
          {userId && <AddToProjectMenu candidateUserIds={[userId]} />}

          {interestStatus === null ? (
            <button
              type="button"
              onClick={() => setMessageOpen((v) => !v)}
              aria-expanded={messageOpen}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: CTA_GRADIENT }}
            >
              Visa intresse
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${messageOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          ) : (
            <InterestStatusBadge status={interestStatus} />
          )}
        </div>

        {/* Meddelandeytan expanderar under action-baren */}
        {messageOpen && interestStatus === null && (
          <div className="mt-2 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <label className="block">
              <span className="text-[13px] font-bold text-slate-700">
                Meddelande till kandidaten
                <span className="font-normal text-slate-400"> (valfritt)</span>
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                rows={3}
                maxLength={MESSAGE_MAX}
                placeholder="Berätta kort om rollen och varför profilen är intressant. Ett personligt meddelande höjer svarsfrekvensen."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 resize-y"
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[12px] text-slate-400">
                {message.length}/{MESSAGE_MAX} tecken · Kandidaten väljer själv om
                kontakten accepteras. Först då delas namn och e-post.
              </span>
              <button
                type="button"
                onClick={handleInterest}
                disabled={sending}
                className="inline-flex items-center justify-center min-h-[42px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: CTA_GRADIENT }}
              >
                {sending ? 'Skickar…' : 'Skicka intresse'}
              </button>
            </div>
          </div>
        )}
      </div>

      {notice && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {notice}
        </p>
      )}

      {/* Statuspanel för väntande/avböjt (upplåst kontakt visas i heron) */}
      {interestStatus === 'pending' && (
        <p className="text-[12.5px] text-slate-500 bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-3 leading-relaxed">
          Kandidaten har fått ert intresse och svarar när det passar. Namn och
          kontaktuppgifter låses upp om kontakten accepteras.
        </p>
      )}
      {interestStatus === 'declined' && (
        <p className="text-[12.5px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 leading-relaxed">
          Den här kandidaten tackade nej till kontakt. Fler kandidater finns i poolen.
        </p>
      )}

      <ProfileSections candidate={candidate} interestStatus={interestStatus} />
    </div>
  );
}
