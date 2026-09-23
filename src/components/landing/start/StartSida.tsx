/**
 * Startsidan i linjen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5, och designsystemets sektionsföljd i §12).
 *
 * Hero på mark med IlluScenSallet (520 × 400), en panel med produktscen,
 * sidans enda bläckyta (mediebevisen som rader), tre verktygskort, en lista,
 * prisdelen med PaketKort och frågorna på mark. Inga glödar, inga
 * gradientord, ingen framer-motion. Serverkomponenter utom paketdelen, som
 * återanvänds från prissidan.
 *
 * SEO: h1-texten, title och description är oförändrade (spärrlistan).
 * Länkarna till exempelsidorna och prissidan finns kvar i innehållet.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import InkPanel, { INK_LANK } from '@/components/shell/InkPanel'
import {
  IlluScenBrev,
  IlluScenCv,
  IlluScenMatch,
  IlluScenMatris,
  IlluScenSallet,
} from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'

const KNAPP =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const SEKTION = 'mt-16 lg:mt-[88px]'

const CV = PLAN_BY_KEY.cv_week.amount
const TEST = PLAN_BY_KEY.test_week.amount
const ALLT = PLAN_BY_KEY.all_week.amount
const ALLT_MANAD = PLAN_BY_KEY.all_month.amount

/* ------------------------------------------------------------------ hero */

export function StartHero({ konton }: { konton: number | null }) {
  const bevis = [
    ...(konton ? [{ tal: `${konton}+`, text: 'har skapat konto' }] : []),
    { tal: '1 brev', text: 'om dagen, gratis' },
    { tal: '60 sek', text: 'till första CV-poängen' },
  ]
  return (
    <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14">
      <div>
        <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">
          Bekräftat av SVT, SR, DN och Kollega
        </p>
        <h1 className="mt-2 max-w-[16ch] text-h1-pub text-ink-1 lg:mt-3">
          Därför får du inte svar på dina ansökningar
        </h1>
        <p className="mt-4 max-w-[52ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
          Allt fler rekryterare låter rekryteringssystem sålla kandidater automatiskt, ofta utan att du
          vet om det.{' '}
          <b className="font-semibold text-ink-1">Är ditt CV inte optimerat når det aldrig en människa.</b>{' '}
          Vi ser till att du tar dig förbi.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/register" data-cta="hero-primary" className={KNAPP}>
            Skapa konto gratis
          </Link>
          <a href="#sa-jobbar-vi" className={LANK}>
            Se hur det fungerar
          </a>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-[13px] leading-[18px] text-ink-3">
          {bevis.map((b) => (
            <li key={b.tal}>
              <span className="block font-display text-[28px] font-bold leading-[30px] tracking-[-0.02em] tabular-nums text-ink-1">
                {b.tal}
              </span>
              {b.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-ink-1">
        <IlluScenSallet
          className="h-auto w-full rounded-xl"
          title="Ett CV går genom rekryteringssystemets såll och kommer fram till rekryteraren"
        />
      </div>
    </header>
  )
}

/* ------------------------------------------------ panel: så jobbar vi */

export function StartMatchning() {
  return (
    <section id="sa-jobbar-vi" aria-labelledby="start-matchning" className={`${SEKTION} scroll-mt-24`}>
      <div className="grid items-center gap-6 rounded-xl border border-kant bg-panel p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div>
          <p className="text-steg uppercase text-ink-3">Så jobbar vi</p>
          <h2 id="start-matchning" className="mt-2 text-h2-pub text-ink-1">
            Vi matchar din erfarenhet mot tjänstens krav
          </h2>
          <p className="mt-3 max-w-[56ch] text-base leading-[27px] text-ink-2">
            Klistra in en jobbannons. Vi läser ditt CV, identifierar vad tjänsten kräver och väver in din
            egen erfarenhet i ett brev som faktiskt bevisar att du passar.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/skapa-brev/start" className={KNAPP}>
              Skriv ett brev gratis
            </Link>
            <span className="text-meta text-ink-3">Ett brev om dagen utan att betala</span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[300px] text-ink-1" aria-hidden="true">
          <IlluScenBrev className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------ bläckytan: mediebevisen */

const MEDIER = [
  {
    kalla: 'Kollega',
    rubrik: 'AI-rekrytering klassad som högriskverksamhet',
    text: '40 procent av Teamtailors över 10 000 arbetsgivare har slagit på AI i rekryteringen. EU klassar AI-rekrytering som högriskverksamhet.',
    url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
  },
  {
    kalla: 'SVT Nyheter',
    rubrik: 'Knepen som gör att du inte sorteras bort',
    text: 'Hur sticker du ut när perfekta AI-skrivna CV:n blivit norm?',
    url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
  },
  {
    kalla: 'Sveriges Radio P1',
    rubrik: 'Så tar du dig förbi robotarna',
    text: 'Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
    url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
  },
  {
    kalla: 'Dagens Nyheter',
    rubrik: 'Intervjuad av en robot',
    text: 'AI tar över allt fler steg i rekryteringen hos svenska företag.',
    url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
  },
] as const

export function StartMedia() {
  return (
    <div className={SEKTION}>
      <InkPanel
        eyebrow="Bekräftat av medierna"
        title="Robotarna har redan läst ditt CV."
        text="Sveriges största redaktioner har samma slutsats: rekryteringen har förändrats i grunden. Den första som läser din ansökan är inte en människa."
        secondary={
          <Link href="/priser" data-cta="media-impact-primary" className={INK_LANK}>
            Så hjälper vi dig komma förbi
          </Link>
        }
      >
        <ul className="divide-y divide-ink-1-kant border-y border-ink-1-kant">
          {MEDIER.map((m) => (
            <li key={m.kalla}>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-1 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
              >
                <span className="text-steg uppercase text-ink-1-accent">{m.kalla}</span>
                <span>
                  <span className="block font-display text-[19px] font-bold leading-6 text-white group-hover:underline group-hover:decoration-ink-1-kant group-hover:underline-offset-4">
                    {m.rubrik}
                  </span>
                  <span className="mt-1 block text-sm leading-[22px] text-ink-1-mjuk">{m.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </InkPanel>
    </div>
  )
}

/* ------------------------------------------------ tre verktygskort */

const VERKTYG: readonly { id: string; namn: string; varde: string; text: string; href: string; Scen: (p: { className?: string }) => ReactNode }[] = [
  {
    id: 'analys',
    namn: 'CV-analys',
    varde: 'Vet exakt varför CV:t inte får svar.',
    text: 'Poäng per område, varje fynd med åtgärd och nyckelorden rekryteringssystemen letar efter.',
    href: '/verktyg/cv-analys',
    Scen: IlluScenCv,
  },
  {
    id: 'matchning',
    namn: 'Jobbmatchning',
    varde: 'Jobben du annars hade missat.',
    text: 'Din kompetens matchad mot alla annonser i Platsbanken, med skälen utskrivna.',
    href: '/verktyg/jobbmatchning',
    Scen: IlluScenMatch,
  },
  {
    id: 'tester',
    namn: 'Rekryteringstester',
    varde: 'Känn igen uppgiften innan provdagen.',
    text: 'Logik, verbalt och numeriskt i tre nivåer, med förklaring efter varje fråga.',
    href: '/verktyg/rekryteringstester',
    Scen: IlluScenMatris,
  },
]

export function StartVerktyg() {
  return (
    <section aria-labelledby="start-verktyg" className={SEKTION}>
      <h2 id="start-verktyg" className="text-h2-pub text-ink-1">
        Tre verktyg som gör ansökan starkare
      </h2>
      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-3 lg:gap-5">
        {VERKTYG.map((v) => (
          <Link
            key={v.id}
            href={v.href}
            className="group flex flex-col rounded-xl border border-kant bg-panel p-5 transition-colors duration-[120ms] hover:border-kant-stark sm:p-6"
          >
            <div className="flex h-[120px] items-end text-ink-1" aria-hidden="true">
              <v.Scen className="h-auto max-h-[120px] w-auto" />
            </div>
            <h3 className="mt-4 font-display text-[24px] font-bold leading-7 tracking-[-0.02em] text-ink-1">{v.namn}</h3>
            <p className="mt-2 text-varde text-ink-1">{v.varde}</p>
            <p className="mt-2 text-sm leading-[22px] text-ink-2">{v.text}</p>
            <span className="mt-auto pt-4 text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 group-hover:decoration-ink-1">
              Så fungerar det
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- listan */

const MER = [
  { namn: 'Personligt brev', text: 'Skrivet på annonsen, utifrån ditt CV, i den ton du väljer.', href: '/verktyg/personligt-brev' },
  { namn: 'CV-mallar', text: `${TEMPLATE_COUNT} mallar som rekryteringssystemen läser, ${FREE_TEMPLATE_COUNT} gratis.`, href: '/verktyg/cv-mallar' },
  { namn: 'Jobbcoachen', text: 'Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och ditt CV.', href: '/verktyg/jobbcoachen' },
  { namn: 'LinkedIn-profilen', text: 'Rubrik och sammanfattning som rekryterare hittar när de söker.', href: '/verktyg/linkedin-optimering' },
  { namn: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', href: '/verktyg/bli-upptackt' },
  { namn: 'CV-exempel', text: 'Färdiga CV:n yrke för yrke, att utgå ifrån.', href: '/cv-exempel' },
  { namn: 'Personligt brev-exempel', text: 'Brev som fungerat, yrke för yrke.', href: '/personligt-brev-exempel' },
] as const

export function StartLista() {
  return (
    <section aria-labelledby="start-mer" className={SEKTION}>
      <h2 id="start-mer" className="text-h2-pub text-ink-1">
        Och resten av jobbsöket
      </h2>
      <ul className="mt-6 divide-y divide-kant border-y border-kant">
        {MER.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="group grid gap-1 py-4 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-6">
              <span className="text-base font-semibold text-ink-1 group-hover:underline group-hover:decoration-kant-stark group-hover:underline-offset-4">
                {m.namn}
              </span>
              <span className="text-sm leading-[22px] text-ink-2">{m.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------ frågorna */

export const START_FAQ = [
  {
    q: 'Vad är ATS, och varför ska mitt CV vara anpassat?',
    a: 'ATS (Applicant Tracking System) är de rekryteringssystem de flesta större svenska arbetsgivare använder för att sortera ansökningar automatiskt. Är ditt CV inte läsbart för systemet kan du sorteras bort innan en människa ens öppnar det. Alla våra CV-mallar är byggda för att systemen ska kunna läsa dem.',
  },
  {
    q: 'Hur mycket av jobbet gör ni åt mig?',
    a: 'Vi skriver utkastet utifrån ditt CV och jobbannonsen. Du läser igenom, justerar tonen där det behövs och skickar. Resultatet låter som du, bara mer genomarbetat än om du skrivit varje brev från noll.',
  },
  {
    q: 'Hur snabbt kan jag skapa ett personligt brev?',
    a: 'Runt 60 sekunder från att du klistrar in annonsen till ett färdigt utkast. Du sparar en kvart eller mer per ansökan jämfört med att skriva från grunden.',
  },
  {
    q: 'Är mina uppgifter säkra?',
    a: 'Ja. Vi följer GDPR och all data lagras i EU. Vi säljer aldrig din information vidare, och du kan radera ditt konto med ett klick. Då försvinner allt, även våra kopior.',
  },
  {
    q: 'Vad kostar det, och vad får jag utan att betala?',
    a: `Gratisnivån kräver inget kort: ${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning, en CV-analys med poäng och tyngsta fyndet, ett personligt brev på en annons, ${FREE_TIER_JOB_LIMIT} matchade jobb, ${FREE_CHAT_MESSAGES_PER_ACCOUNT} frågor till Jobbcoachen och grundnivån i varje testtyp. Söker du på allvar väljer du paketet som passar: CV-paketet och Träningspaketet kostar ${CV} respektive ${TEST} kr i veckan, Hela paketet ${ALLT} kr i veckan eller ${ALLT_MANAD} kr i månaden. Ingen bindningstid, och du säger upp i ditt konto.`,
  },
] as const

export function StartFaq() {
  return (
    <section aria-labelledby="start-faq" className={SEKTION}>
      <h2 id="start-faq" className="text-h2-pub text-ink-1">
        Svaren på det du undrar
      </h2>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {START_FAQ.map((item, i) => (
          <details key={item.q} open={i === 0} className="group rounded-xl border border-kant bg-panel px-4 sm:px-5">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
                +
              </span>
              <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
                −
              </span>
            </summary>
            <p className="pb-4 text-sm leading-[22px] text-ink-2">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-2">
        Fler frågor om paketen?{' '}
        <Link href="/priser" className={LANK}>
          Se priserna
        </Link>
      </p>
    </section>
  )
}

