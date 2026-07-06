'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Check,
  Clock,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import PortalCard from '../../components/PortalCard';
import {
  AVAILABILITY_OPTIONS,
  WORKPLACE_OPTIONS,
  EXTENT_OPTIONS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  labelFor,
  type CandidateDetail,
  type InterestStatus,
} from '../../components/types';

const MESSAGE_MAX = 500;

/**
 * Detaljprofilen: allt rekryteraren får se om kandidaten. Arbetsgivarnamn,
 * namn och e-post maskeras av API:t enligt upplåsningsreglerna — sidan
 * renderar bara det som faktiskt kommer tillbaka.
 */
export default function KandidatDetaljPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [interestStatus, setInterestStatus] = useState<InterestStatus>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
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
        <div className="rounded-3xl bg-orange-50/60 h-36 animate-pulse" />
        <div className="rounded-3xl bg-orange-50/60 h-48 animate-pulse" />
        <div className="rounded-3xl bg-orange-50/60 h-40 animate-pulse" />
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
          style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Tillbaka till poolen
        </Link>
      </div>
    );
  }

  const roleLabel = candidate.role ?? 'Kandidat';
  const displayName = candidate.fullName ?? roleLabel;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const region = candidate.regions[0] ?? null;

  const terms = [
    { label: 'Tillträde', value: labelFor(AVAILABILITY_OPTIONS, candidate.availability) },
    {
      label: 'Arbetsplats',
      value:
        candidate.workplace.map((w) => labelFor(WORKPLACE_OPTIONS, w)).filter(Boolean).join(', ') ||
        null,
    },
    {
      label: 'Omfattning',
      value:
        candidate.extent.map((e) => labelFor(EXTENT_OPTIONS, e)).filter(Boolean).join(', ') || null,
    },
    { label: 'Regioner', value: candidate.regions.join(', ') || null },
    { label: 'Körkort', value: candidate.driversLicense ? 'B-körkort' : null },
  ].filter((t) => t.value);

  return (
    <div className="space-y-5">
      <Link
        href="/rekryterare"
        className="inline-flex items-center gap-1.5 min-h-[44px] text-[13px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Tillbaka till poolen
      </Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-white rounded-3xl border border-orange-100 p-5 sm:p-6 overflow-hidden"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
      >
        <div
          className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">
              {displayName}
            </h1>
            <p className="text-[13px] text-slate-500 truncate">
              {[
                candidate.fullName ? roleLabel : null,
                region,
                candidate.visibility === 'open' ? 'Öppen profil' : 'Anonym profil',
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {candidate.testBadges.map((badge) => (
            <span
              key={badge.family}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45" aria-hidden="true" />
              {badge.label}
            </span>
          ))}
          {candidate.personalityStrengths.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
              {chip}
            </span>
          ))}
          {candidate.skills.map((skill) => (
            <span
              key={skill}
              className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Intressepanel */}
      <PortalCard title="Kontakt" delay={0.05}>
        {notice && (
          <p
            className="mb-3 text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
            role="alert"
          >
            {notice}
          </p>
        )}

        {interestStatus === 'accepted' ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 mb-2">
              <Check className="w-4 h-4" aria-hidden="true" />
              Kandidaten har accepterat kontakt
            </p>
            <div className="space-y-1.5">
              {candidate.fullName && (
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <User className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span className="font-bold">{candidate.fullName}</span>
                </p>
              )}
              {candidate.email && (
                <p className="flex items-center gap-2 text-sm text-slate-800">
                  <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${candidate.email}`}
                    className="font-bold text-emerald-700 hover:underline break-all"
                  >
                    {candidate.email}
                  </a>
                </p>
              )}
            </div>
            <p className="mt-2.5 text-[12px] text-emerald-700/80 leading-relaxed">
              Ta kontakt direkt via mail. Kandidaten vet att uppgifterna delats med er.
            </p>
          </div>
        ) : interestStatus === 'pending' ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-orange-700">
              <Clock className="w-4 h-4" aria-hidden="true" />
              Väntar på svar
            </p>
            <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">
              Kandidaten har fått ert intresse och svarar när det passar. Namn
              och kontaktuppgifter låses upp om kontakten accepteras.
            </p>
          </div>
        ) : interestStatus === 'declined' ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500">
              <X className="w-4 h-4" aria-hidden="true" />
              Kandidaten avböjde
            </p>
            <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">
              Den här kandidaten tackade nej till kontakt. Fler kandidater finns i poolen.
            </p>
          </div>
        ) : (
          <div>
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
                {message.length}/{MESSAGE_MAX} tecken
              </span>
              <button
                type="button"
                onClick={handleInterest}
                disabled={sending}
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)' }}
              >
                {sending ? 'Skickar…' : 'Visa intresse'}
              </button>
            </div>
            <p className="mt-2 text-[12px] text-slate-400 leading-relaxed">
              Kandidaten får ett mail och väljer själv om kontakten accepteras.
              Först då delas namn och e-postadress.
            </p>
          </div>
        )}
      </PortalCard>

      {/* Arbetslivserfarenhet */}
      {candidate.experience.length > 0 && (
        <PortalCard title="Arbetslivserfarenhet" delay={0.1}>
          <div className="space-y-4">
            {candidate.experience.map((exp, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                  aria-hidden="true"
                >
                  <Briefcase className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {exp.position ?? 'Roll'}
                  </p>
                  <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    {exp.company ? (
                      <span>{exp.company}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        Visas efter accepterad kontakt
                      </span>
                    )}
                    {exp.period && <span>· {exp.period}</span>}
                  </p>
                  {exp.description && (
                    <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Utbildning */}
      {candidate.education.length > 0 && (
        <PortalCard title="Utbildning" delay={0.15}>
          <div className="space-y-4">
            {candidate.education.map((edu, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                  aria-hidden="true"
                >
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {edu.degree ?? 'Utbildning'}
                  </p>
                  <p className="text-[12.5px] text-slate-500">
                    {[edu.school, edu.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Verifierade resultat */}
      {candidate.testResults.length > 0 && (
        <PortalCard
          title="Verifierade resultat"
          sub="Slutförda rekryteringstester på Jobbcoach.ai, bästa resultat per nivå."
          delay={0.2}
        >
          <div className="space-y-2">
            {candidate.testResults.map((result) => (
              <div
                key={`${result.family}-${result.level}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/30 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-[13px] font-bold text-slate-800 truncate">
                    {FAMILY_LABELS[result.family]} · {LEVEL_LABELS[result.level]}
                  </span>
                </div>
                <span className="text-[12.5px] font-bold text-orange-800 flex-shrink-0">
                  {result.percentile !== null
                    ? `Topp ${Math.max(1, 100 - result.percentile)} %`
                    : `${result.bestScore}% rätt`}
                </span>
              </div>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Personlighetsstyrkor */}
      {candidate.personalityStrengths.length > 0 && (
        <PortalCard
          title="Personlighetsstyrkor"
          sub="Härledda ur kandidatens personlighetsprofil, delade med kandidatens samtycke."
          delay={0.25}
        >
          <div className="flex flex-wrap gap-1.5">
            {candidate.personalityStrengths.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
                {chip}
              </span>
            ))}
          </div>
        </PortalCard>
      )}

      {/* Villkor */}
      {terms.length > 0 && (
        <PortalCard title="Villkor" delay={0.3}>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {terms.map((term) => (
              <div key={term.label}>
                <dt className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
                  {term.label}
                </dt>
                <dd className="text-[13.5px] font-semibold text-slate-800 mt-0.5">
                  {term.value}
                </dd>
              </div>
            ))}
          </dl>
        </PortalCard>
      )}
    </div>
  );
}
