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
 * Profilstyrka: 0-100, normaliserad mot det maximalt UPPNÅELIGA. Vikter:
 *   15  CV valt (cv_id satt)
 *   10  samtycke gett (consent_given_at satt)
 *   10  villkor ifyllda (availability + minst en region + minst ett
 *       arbetsplatsval)
 *   10  kompetenser extraherade ur CV:t
 *   10  per klar kognitiv testfamilj (max 30)
 *    5  personlighetsprofil klar
 *   10  pitch skriven
 *    5  fullständig arbetsstilsrapport delad (nivå 2-samtycket)
 *    5  minst en kontexttagg vald ("Söker mig till")
 *
 * Fullrapporten och kontexttaggarna räknas ENDAST in i nämnaren när de går
 * att påverka (kvalificerad rapport finns resp. minst ett taggförslag) —
 * annars blir 100 % omöjligt trots att checklistan saknar rader att åtgärda.
 * Slutpoängen skalas till 0-100 mot det uppnåeliga maxet.
 */
export function computeProfileStrength(
  profile: CandidateProfileState,
  summary: SummaryData | null
): number {
  let earned = 0;
  let possible = 0;
  const item = (points: number, done: boolean, applicable = true) => {
    if (!applicable) return;
    possible += points;
    if (done) earned += points;
  };

  item(15, !!profile.cv_id);
  item(10, !!profile.consent_given_at);
  const termsDone =
    !!profile.availability && profile.regions.length > 0 && profile.workplace.length > 0;
  item(10, termsDone);
  item(10, (summary?.skills?.skills?.length ?? 0) > 0);
  const familiesDone = summary
    ? (Object.keys(summary.results) as FamilyKey[]).filter((k) => summary.results[k].done).length
    : 0;
  possible += 30;
  earned += Math.min(familiesDone, 3) * 10;
  item(5, Boolean(summary?.personality?.done));
  item(10, (profile.pitch ?? '').trim().length > 0);
  item(
    5,
    profile.show_full_workstyle && profile.show_personality,
    Boolean(summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport)
  );
  item(
    5,
    profile.context_tags.length > 0,
    (summary?.personality?.contextTagOptions?.length ?? 0) > 0
  );

  if (possible === 0) return 0;
  return Math.min(100, Math.round((100 * earned) / possible));
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
  const pitchDone = (profile.pitch ?? '').trim().length > 0;

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
    pitchDone
      ? { done: true, label: 'Pitch skriven, den visas överst hos rekryterare', href: '#' }
      : { done: false, label: 'Skriv din pitch, den visas överst hos rekryterare', href: '#pitch' },
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

  // Fullrapporten: raden visas bara när en kvalificerad rapport finns att dela.
  if (summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport) {
    items.push(
      profile.show_full_workstyle && profile.show_personality
        ? { done: true, label: 'Fullständig arbetsstilsrapport delas med rekryterare', href: '#' }
        : { done: false, label: 'Dela din fullständiga arbetsstilsrapport, den ger rekryteraren mest att gå på', href: '#arbetsstilsrapport' }
    );
  }

  // Kontexttaggarna: raden visas bara när kandidaten har kvalificerade förslag.
  if ((summary?.personality?.contextTagOptions?.length ?? 0) > 0) {
    items.push(
      profile.context_tags.length > 0
        ? { done: true, label: `"Söker mig till" valt: ${profile.context_tags.join(', ')}`, href: '#' }
        : { done: false, label: 'Välj upp till två "Söker mig till"-taggar som din självpresentation', href: '#kontexttaggar' }
    );
  }

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
                {item.href === '#' ? (
                  <span className="font-semibold text-orange-900">{item.label}</span>
                ) : item.href.startsWith('#') ? (
                  <a
                    href={item.href}
                    className="font-semibold text-orange-900 underline decoration-orange-300 underline-offset-2 hover:text-orange-700"
                  >
                    {item.label}
                  </a>
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
