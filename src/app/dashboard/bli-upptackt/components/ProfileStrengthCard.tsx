'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import SectionCard from './SectionCard';
import { FAMILY_LABELS, type CandidateProfileState, type FamilyKey, type SummaryData } from './types';

interface ProfileStrengthCardProps {
  profile: CandidateProfileState;
  summary: SummaryData | null;
}

interface ChecklistItem {
  done: boolean;
  label: string;
  href: string;
}

/**
 * Profilstyrka: 0-100 enligt formeln
 *   + 25  CV valt (cv_id satt)
 *   + 10  samtycke gett (consent_given_at satt)
 *   + 15  villkor ifyllda (availability + minst en region + minst ett arbetsplatsval)
 *   + 10  kompetenser extraherade ur CV:t
 *   + 10  per klar kognitiv testfamilj (max 30)
 *   + 10  personlighetsprofil klar
 */
export function computeProfileStrength(
  profile: CandidateProfileState,
  summary: SummaryData | null
): number {
  let score = 0;
  if (profile.cv_id) score += 25;
  if (profile.consent_given_at) score += 10;
  const termsDone =
    !!profile.availability && profile.regions.length > 0 && profile.workplace.length > 0;
  if (termsDone) score += 15;
  if ((summary?.skills?.skills?.length ?? 0) > 0) score += 10;
  const familiesDone = summary
    ? (Object.keys(summary.results) as FamilyKey[]).filter((k) => summary.results[k].done).length
    : 0;
  score += Math.min(familiesDone, 3) * 10;
  if (summary?.personality?.done) score += 10;
  return Math.min(score, 100);
}

export default function ProfileStrengthCard({ profile, summary }: ProfileStrengthCardProps) {
  const strength = computeProfileStrength(profile, summary);

  const familiesDone = summary
    ? (Object.keys(FAMILY_LABELS) as FamilyKey[]).filter((k) => summary.results[k]?.done)
    : [];
  const familiesTodo = (Object.keys(FAMILY_LABELS) as FamilyKey[]).filter(
    (k) => !familiesDone.includes(k)
  );
  const skillCount = summary?.skills?.skills?.length ?? 0;
  const termsDone =
    !!profile.availability && profile.regions.length > 0 && profile.workplace.length > 0;

  const items: ChecklistItem[] = [
    profile.cv_id
      ? { done: true, label: 'CV valt som driver profilen', href: '#' }
      : { done: false, label: 'Välj vilket CV som ska driva profilen', href: '/dashboard/profil/cv' },
    skillCount > 0
      ? { done: true, label: `CV analyserat, ${skillCount} kompetenser extraherade`, href: '#' }
      : { done: false, label: 'Analysera ditt CV så vi kan hämta dina kompetenser', href: '/dashboard/jobbmatchning' },
    termsDone
      ? { done: true, label: 'Villkor angivna: tillträde, arbetsplats och region', href: '#' }
      : { done: false, label: 'Ange tillträde, arbetsplats och minst en region under Dina villkor', href: '#villkor' },
    profile.consent_given_at
      ? { done: true, label: 'Samtycke gett, profilen kan aktiveras', href: '#' }
      : { done: false, label: 'Slå på synligheten och ge ditt samtycke', href: '#' },
  ];

  if (familiesDone.length > 0) {
    items.push({
      done: true,
      label: `${familiesDone.map((k) => FAMILY_LABELS[k]).join(', ')} verifierade`,
      href: '#',
    });
  }
  if (familiesTodo.length > 0) {
    items.push({
      done: false,
      label: `Gör ${familiesTodo
        .map((k) => FAMILY_LABELS[k].toLowerCase())
        .join(' och ')}${familiesTodo.length > 1 ? '-testerna' : '-testet'}, fler verifierade resultat lyfter dig i sökresultaten`,
      href: '/dashboard/tester',
    });
  }
  items.push(
    summary?.personality?.done
      ? { done: true, label: 'Personlighetsprofil klar', href: '#' }
      : { done: false, label: 'Gör personlighetstestet och visa dina två främsta styrkor', href: '/dashboard/tester' }
  );

  return (
    <SectionCard
      title="Din profilstyrka"
      delay={0.25}
      headerExtra={
        <span className="text-[12.5px] text-slate-500">
          <b className="text-slate-900">{strength} %</b> · kompletta profiler visas först
        </span>
      }
    >
      {/* Mätare */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100} aria-label="Profilstyrka">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
        />
      </div>

      {/* Checklista */}
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5 text-[13px]">
            {item.done ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                <span className="text-slate-600">{item.label}</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" strokeWidth={3} />
                {item.href.startsWith('#') ? (
                  <span className="font-semibold text-orange-900">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="font-semibold text-orange-900 underline decoration-orange-300 underline-offset-2 hover:text-orange-700"
                  >
                    {item.label}
                  </Link>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
