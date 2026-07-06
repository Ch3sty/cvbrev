'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Check, X, Mail, Phone, Globe, MessageSquare } from 'lucide-react';
import SectionCard from './SectionCard';
import InterestThread from '@/components/interests/InterestThread';

interface RecruiterContact {
  companyName: string;
  contactName: string | null;
  contactRole: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface Interest {
  id: string;
  companyName: string;
  contactName: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt: string | null;
  recruiterContact: RecruiterContact | null;
  messageCount: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

function StatusPill({ status }: { status: Interest['status'] }) {
  if (status === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
        <Check className="w-3 h-3" aria-hidden="true" />
        Accepterad
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
        Avböjd
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold">
      Väntar på svar
    </span>
  );
}

/**
 * Intresseanmälningar från rekryterare. Självhämtande: läser
 * /api/candidate/interests vid mount och låter kandidaten acceptera eller
 * avböja kontakt direkt i kortet (optimistisk uppdatering, rollback vid fel).
 */
export default function InterestsCard() {
  const [interests, setInterests] = useState<Interest[] | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/interests');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setInterests(data.interests ?? []);
      } catch (err) {
        console.error('Error fetching interests:', err);
        if (!cancelled) setInterests([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const respond = useCallback(
    async (interestId: string, action: 'accept' | 'decline') => {
      setResponding(interestId);
      setError(null);

      // Optimistisk uppdatering, med snapshot för rollback.
      const snapshot = interests;
      const newStatus = action === 'accept' ? 'accepted' : 'declined';
      setInterests((prev) =>
        (prev ?? []).map((i) =>
          i.id === interestId
            ? { ...i, status: newStatus, respondedAt: new Date().toISOString() }
            : i
        )
      );

      try {
        const res = await fetch('/api/candidate/interests/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interestId, action }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        console.error('Error responding to interest:', err);
        setInterests(snapshot);
        setError('Det gick inte att spara ditt svar. Försök igen.');
      } finally {
        setResponding(null);
      }
    },
    [interests]
  );

  const hasInterests = (interests?.length ?? 0) > 0;

  return (
    <SectionCard
      id="intressen"
      title="Intresseanmälningar"
      sub="När en rekryterare vill komma i kontakt hamnar det här, och du får ett mail."
      delay={0.35}
    >
      {interests === null ? (
        // Laddskelett
        <div className="animate-pulse space-y-3" aria-hidden="true">
          <div className="h-16 rounded-2xl bg-orange-50/60 border border-orange-100" />
        </div>
      ) : !hasInterests ? (
        // Tom-state, samma som innan
        <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 p-4">
          <span
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm"
            aria-hidden="true"
          >
            0
          </span>
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Inga intressen ännu. Profiler med verifierade testresultat får i snitt
            fler visningar,{' '}
            <Link
              href="/dashboard/tester"
              className="font-bold text-orange-600 hover:text-orange-700"
            >
              gör dagens test
            </Link>{' '}
            för att stärka din.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2" role="alert">
              {error}
            </p>
          )}

          {interests.map((interest) => {
            const isDeclined = interest.status === 'declined';
            const isAccepted = interest.status === 'accepted';
            const isPending = interest.status === 'pending';
            const busy = responding === interest.id;

            return (
              <div
                key={interest.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  isAccepted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : isDeclined
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-orange-200 bg-orange-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${
                        isAccepted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-orange-50 border-orange-200 text-orange-600'
                      }`}
                      aria-hidden="true"
                    >
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {interest.companyName}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        {interest.contactName ? `${interest.contactName} · ` : ''}
                        {formatDate(interest.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={interest.status} />
                </div>

                {interest.message && (
                  <p className="mt-3 text-[13px] text-slate-600 leading-relaxed bg-white/70 border border-slate-100 rounded-xl px-3 py-2">
                    {interest.message}
                  </p>
                )}

                {isPending && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => respond(interest.id, 'accept')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Acceptera kontakt
                      </button>
                      <button
                        type="button"
                        onClick={() => respond(interest.id, 'decline')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        Avböj
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] text-slate-500 leading-relaxed">
                      Om du accepterar delas ditt namn och din e-postadress med
                      rekryteraren så att ni kan ta kontakt. Avböjer du ser
                      rekryteraren bara att du tackat nej.
                    </p>
                  </div>
                )}

                {isAccepted && (
                  <div className="mt-3 space-y-3">
                    <p className="text-[12px] text-emerald-700 leading-relaxed">
                      Kontakt accepterad{interest.respondedAt ? ` ${formatDate(interest.respondedAt)}` : ''}.
                      Ni kan nu ta kontakt.
                    </p>

                    {/* Rekryterarens kontaktkort: speglar att de fått dina uppgifter */}
                    {interest.recruiterContact && (
                      <div className="rounded-xl border border-emerald-100 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 mb-1.5">
                          Din kontakt
                        </p>
                        <p className="text-[13px] font-bold text-slate-900">
                          {interest.recruiterContact.contactName ?? interest.companyName}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {[
                            interest.recruiterContact.contactRole,
                            interest.recruiterContact.contactName
                              ? interest.recruiterContact.companyName
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                          {interest.recruiterContact.email && (
                            <a
                              href={`mailto:${interest.recruiterContact.email}`}
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-orange-700 hover:text-orange-800"
                            >
                              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                              {interest.recruiterContact.email}
                            </a>
                          )}
                          {interest.recruiterContact.phone && (
                            <a
                              href={`tel:${interest.recruiterContact.phone}`}
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 hover:text-slate-800"
                            >
                              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                              {interest.recruiterContact.phone}
                            </a>
                          )}
                          {interest.recruiterContact.website && (
                            <a
                              href={
                                interest.recruiterContact.website.startsWith('http')
                                  ? interest.recruiterContact.website
                                  : `https://${interest.recruiterContact.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-600 hover:text-slate-800"
                            >
                              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                              Webbplats
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meddelandetråd i appen */}
                    {openThread === interest.id ? (
                      <InterestThread interestId={interest.id} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenThread(interest.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-orange-200 bg-white text-orange-700 text-[13px] font-bold hover:bg-orange-50 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                        {interest.messageCount > 0
                          ? `Öppna konversation (${interest.messageCount})`
                          : 'Skriv ett meddelande'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
