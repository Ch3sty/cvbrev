'use client';

/**
 * Profilstatus (docs/plan-inloggat-omdesign.md, avsnitt 5 och 9, våg 3 punkt 24).
 *
 * Kortet hette tidigare profilstyrka och var en underkännandelista: en stor
 * nolla i procent, "Visa alla steg (9 kvar)" och meningen "Kompletta profiler
 * visas först". Två problem med det.
 *
 * Det första är sanning. Rankningslöftena ("kompletta profiler visas först",
 * "fler verifierade resultat lyfter dig i sökresultaten") hade inget stöd i
 * koden: computeProfileStrength räknades i klienten och sparades aldrig, och
 * rekryterarsökningen (src/lib/recruiter/poolSearch.ts) sorterar på relevans
 * med kompletthet enbart som tiebreak. Pitch, villkor och samtycke påverkar
 * sorteringen inte alls. Vi drev alltså testtagande med ett påstående vi inte
 * kunde hålla. Båda meningarna är strukna.
 *
 * Det andra är ton. Den som är arbetslös ska inte mötas av ett betyg på sig
 * själv. Därför: ett nästa steg i taget, inget procenttal, och i stället för
 * en mätare en siffra som faktiskt betyder något för kandidaten, nämligen hur
 * många rekryterare som sett profilen.
 */

import Link from 'next/link';
import SectionCard from './SectionCard';
import { IlluProfilvisningar, IlluNastaSteg } from '@/components/illustrations/BliUpptacktIllustrations';
import { FAMILY_LABELS, type CandidateProfileState, type FamilyKey, type SummaryData } from './types';

interface ProfileStrengthCardProps {
  profile: CandidateProfileState;
  summary: SummaryData | null;
  /**
   * Profilvisningar, hämtade på servern. null när profilen inte är synlig
   * eller när siffran inte gick att läsa. Kortet fetchade förut
   * /api/candidate/views vid mount, vilket blev ett eget auth.getUser()
   * plus en fråga efter att sidan redan renderat.
   */
  views: ViewStats | null;
}

interface Step {
  label: string;
  href: string;
}

interface ViewStats {
  lastWeek: number;
  total: number;
}

/**
 * Stegen i den ordning de faktiskt hjälper kandidaten, inte i poängordning.
 * Returnerar bara det som återstår: klara steg är inte information, de är
 * bara rader att scrolla förbi.
 */
function remainingSteps(profile: CandidateProfileState, summary: SummaryData | null): Step[] {
  const steps: Step[] = [];

  if (!profile.cv_id) {
    steps.push({ label: 'Välj vilket CV som ska driva profilen', href: '/dashboard/profil/cv' });
  }

  if ((summary?.skills?.skills?.length ?? 0) === 0) {
    steps.push({
      label: 'Analysera ditt CV så vi kan hämta dina kompetenser',
      href: '/dashboard/jobbmatchning',
    });
  }

  const termsDone =
    !!profile.availability && profile.regions.length > 0 && profile.workplace.length > 0;
  if (!termsDone) {
    steps.push({ label: 'Ange tillträde, arbetsplats och minst en region', href: '#villkor' });
  }

  if ((profile.pitch ?? '').trim().length === 0) {
    steps.push({ label: 'Skriv din pitch, den visas överst hos rekryterare', href: '#pitch' });
  }

  if (!profile.consent_given_at) {
    steps.push({ label: 'Slå på synligheten och ge ditt samtycke', href: '#' });
  }

  // Testerna beskrivs som det de är: underlag rekryteraren kan lita på. Inte
  // som en placering i en lista vi inte sorterar på.
  const familiesTodo = summary
    ? (Object.keys(FAMILY_LABELS) as FamilyKey[]).filter((k) => !summary.results[k]?.done)
    : [];
  if (familiesTodo.length > 0) {
    const names = familiesTodo.map((k) => FAMILY_LABELS[k].toLowerCase()).join(' och ');
    steps.push({
      label: `Gör ${names}${familiesTodo.length > 1 ? '-testerna' : '-testet'}, resultaten visas som bevis på profilen`,
      href: '/dashboard/tester',
    });
  }

  if (!summary?.personality?.done) {
    steps.push({
      label: 'Gör personlighetstestet och visa dina två främsta styrkor',
      href: '/dashboard/tester',
    });
  }

  if (summary?.personality?.hasAdvancedTest && summary.personality.workStyleReport) {
    if (!(profile.show_full_workstyle && profile.show_personality)) {
      steps.push({
        label: 'Dela din arbetsstilsrapport, den ger rekryteraren mest att gå på',
        href: '#arbetsstilsrapport',
      });
    }
  }

  if ((summary?.personality?.contextTagOptions?.length ?? 0) > 0 && profile.context_tags.length === 0) {
    steps.push({
      label: 'Välj upp till två "Söker mig till"-taggar',
      href: '#kontexttaggar',
    });
  }

  return steps;
}

export default function ProfileStrengthCard({
  profile,
  summary,
  views,
}: ProfileStrengthCardProps) {
  const steps = remainingSteps(profile, summary);
  const next = steps[0] ?? null;
  // Visningar visas bara när profilen är synlig. Att visa "0 visningar" för
  // någon som inte slagit på synligheten vore att rapportera ett utfall av
  // något hon inte gjort. Servern hämtar dem bara i det läget.
  const isVisible = profile.visibility !== 'off';

  return (
    <SectionCard title="Din profil" delay={0.25}>
      {isVisible && <ViewsRow views={views} />}

      {next ? (
        <>
          <NextStep step={next} />
          {steps.length > 1 && (
            <p className="mt-3 text-sm text-neutral-500">
              {steps.length === 2
                ? 'Ett steg till efter det.'
                : `${steps.length - 1} steg till efter det.`}
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
          Profilen är klar. Du behöver inte göra något mer, och du kan ändra
          vad som helst när du vill.
        </p>
      )}
    </SectionCard>
  );
}

/**
 * Visningsraden. Riktig data ur candidate_profile_views, loggad serverside när
 * en godkänd rekryterare öppnar profilen. Kandidaten ser antal, aldrig vem.
 */
function ViewsRow({ views }: { views: ViewStats | null }) {
  if (!views) return null;

  // Noll visningar är inte ett underkännande, det är ett tidsbesked. Vi säger
  // vad som gäller i stället för att skriva ut en nolla utan sammanhang.
  if (views.total === 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4">
        <span className="shrink-0 text-neutral-900" aria-hidden="true">
          <IlluProfilvisningar size={48} />
        </span>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Din profil är sökbar. Rekryterare söker i poolen i omgångar, så det
          kan dröja innan någon tittar. Vi säger till här när det händer.
        </p>
      </div>
    );
  }

  // Veckan först när det hänt något den här veckan, annars totalen. Vi vill
  // aldrig skriva "0 den här veckan" till någon som faktiskt har visningar.
  // "Rekryterare" böjs inte i plural, så ingen räkneordslogik behövs.
  const label =
    views.lastWeek > 0
      ? `${views.lastWeek} rekryterare har sett din profil den här veckan`
      : `${views.total} rekryterare har sett din profil`;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4">
      <span className="shrink-0 text-neutral-900" aria-hidden="true">
        <IlluProfilvisningar size={48} />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold text-neutral-900">{label}</p>
        <p className="text-sm text-neutral-600 leading-relaxed mt-1">
          Du ser antalet, aldrig vem. De hör av sig om de vill gå vidare.
        </p>
      </div>
    </div>
  );
}

/** Ett steg i taget. Ingen lista, ingen räknare över allt som saknas. */
function NextStep({ step }: { step: Step }) {
  const inner = (
    <div className="mt-4 flex items-start gap-3 rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-300">
      <span className="shrink-0 text-neutral-900" aria-hidden="true">
        <IlluNastaSteg size={48} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">Nästa steg</p>
        <p className="text-base font-semibold text-neutral-900 leading-snug mt-0.5">
          {step.label}
        </p>
      </div>
    </div>
  );

  if (step.href === '#') return inner;
  if (step.href.startsWith('#')) return <a href={step.href}>{inner}</a>;
  return <Link href={step.href}>{inner}</Link>;
}
