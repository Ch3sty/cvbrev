/**
 * Så fungerar Jobbcoach: en genomgång av de sex verktygen.
 *
 * Sidhuvud enligt sidmallen, sedan en panel per verktyg med rubrik, en
 * mening och vad det ger, och en textlänk in i verktyget. Vyns enda
 * primärknapp ligger sist: ladda upp CV, för det är där allt börjar.
 */
'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import PageHeader from '@/components/shell/PageHeader';
import { PLAN_BY_KEY } from '@/lib/plans/plans';
import {
  IkonCv,
  IkonAnalys,
  IkonBrev,
  IkonLank,
  IkonMatchning,
  IkonMallar,
  type IkonProps,
} from '@/components/illustrations/Ikoner';

interface Feature {
  id: number;
  icon: (props: IkonProps) => React.ReactElement;
  title: string;
  description: string;
  benefits: string[];
  href: string;
  cta: string;
}

const features: Feature[] = [
  {
    id: 1,
    icon: IkonCv,
    title: 'Ladda upp ditt CV',
    description:
      'Grunden för allt du gör här. Ladda upp ditt CV så plockar vi fram din erfarenhet, dina kompetenser och din utbildning.',
    benefits: [
      'Vi läser av arbetslivserfarenhet och roller',
      'Identifierar dina kompetenser och färdigheter',
      'Sparar kontaktuppgifter till dina brev',
      'Premium: obegränsat antal CV:n',
    ],
    href: '/dashboard/profil/cv',
    cta: 'Ladda upp CV',
  },
  {
    id: 2,
    icon: IkonAnalys,
    title: 'Analysera ditt CV',
    description:
      'Konkreta tips på vad du kan förbättra. Vi går igenom styrkor, svagheter och ger förslag som gör skillnad.',
    benefits: [
      'Styrkor och förbättringsområden i din presentation',
      'Kompetenser som kan formuleras tydligare',
      'Hur rekryteringssystem (ATS) läser ditt CV',
      'Exempel: "Ökade försäljningen med 35 procent" i stället för "Ansvarade för försäljning"',
    ],
    href: '/dashboard/cv-analys',
    cta: 'Analysera CV',
  },
  {
    id: 3,
    icon: IkonBrev,
    title: 'Skapa personliga brev',
    description:
      'Klistra in en jobbannons, välj tonalitet och få ett färdigt personligt brev på under 30 sekunder.',
    benefits: [
      'Vi analyserar annonsen och hittar nyckelorden',
      'Lyfter fram din relevanta erfarenhet',
      'Sex stilar, från professionell till kreativ',
      'Formulerat för rekryteringssystemens gallring',
    ],
    href: '/dashboard/skapa-brev',
    cta: 'Skapa brev',
  },
  {
    id: 4,
    icon: IkonLank,
    title: 'Optimera din LinkedIn',
    description:
      'Tydligare texter, bättre nyckelord och högre synlighet för rekryterare som söker på LinkedIn.',
    benefits: [
      'Formuleringar som sticker ut',
      'Rätt nyckelord för din bransch och roll',
      'Anpassat för LinkedIns sökning',
      `Ingår i ${PLAN_BY_KEY.cv_week.name} och ${PLAN_BY_KEY.all_week.name}`,
    ],
    href: '/dashboard/linkedin-optimizer',
    cta: 'Optimera LinkedIn',
  },
  {
    id: 5,
    icon: IkonMatchning,
    title: 'Hitta matchande jobb',
    description:
      'Vi söker bland tusentals lediga tjänster och visar vilka som passar din profil bäst.',
    benefits: [
      'Matchning mot Arbetsförmedlingens databas',
      'Förstår synonymer: "Frontend Developer" och "React Developer" är samma sak',
      'Rankas 0 till 100 procent utifrån din profil',
      'Skapa ett personligt brev direkt från träffen',
    ],
    href: '/dashboard/jobbmatchning',
    cta: 'Sök jobb',
  },
  {
    id: 6,
    icon: IkonMallar,
    title: 'Välj en professionell mall',
    description:
      'Exportera ditt CV i över tio designer, alla läsbara för rekryteringssystem, på skärm och i utskrift.',
    benefits: [
      'Läsbara för rekryteringssystem',
      'Branschanpassade, rätt stil för din sektor',
      'Premium-mallar: Platinum Executive, Nordic Professional, Creative Edge',
      'Olika mallar för olika typer av roller',
    ],
    href: '/dashboard/cv-mallar',
    cta: 'Välj mall',
  },
];

const LINK =
  'inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:text-ink-2';

export default function IntroduktionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        title="Så fungerar Jobbcoach"
        description="Sex verktyg som hjälper dig skapa bättre ansökningar, snabbare. Börja med ditt CV, sedan tar vi det därifrån."
      />

      <section aria-label="Verktygen" className="space-y-4">
        <h2 className="text-sm font-medium text-ink-3">Verktygen</h2>
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </section>

      <section
        aria-label="Kom igång"
        className="rounded-xl border border-kant-stark bg-panel p-4 sm:p-5"
      >
        <h2 className="text-kort text-ink-1">Redo att komma igång?</h2>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">
          Börja med att ladda upp ditt CV. Det tar en halv minut.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href="/dashboard/profil/cv"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover sm:w-auto"
          >
            Ladda upp CV
          </Link>
          <Link href="/dashboard" className={LINK}>
            Tillbaka till översikten
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
          <Icon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-kort text-ink-1">{feature.title}</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{feature.description}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 border-t border-kant pt-4">
        {feature.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm leading-[22px] text-ink-2">
            <Check
              className="mt-[3px] h-4 w-4 shrink-0 text-ink-3"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <Link href={feature.href} className={`${LINK} mt-2`}>
        {feature.cta}
      </Link>
    </article>
  );
}
