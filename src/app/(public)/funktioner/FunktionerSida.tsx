/**
 * Funktioner i linjen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5, "Övriga publika ytor"): hero som startsidan, sedan en sektion
 * per funktion i växlande form. Panel med scen till höger, rader direkt på
 * mark, och bläck för det som bara finns i Allt. Åtta ikonkort och åtta
 * piller är borta; ankarlänkarna till sektionerna står kvar som en textrad,
 * eftersom de är sidans egna länkar.
 *
 * Texterna för CV-analysen, breven, testerna, matchningen och coachen är
 * prissidans godkända copy (FUNKTIONER i paket-copy.ts), så funktionen
 * beskrivs likadant på båda sidorna. Serverkomponent.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import {
  IlluScenBrev,
  IlluScenCv,
  IlluScenHero,
  IlluScenLinkedin,
  IlluScenMallar,
  IlluScenMatris,
} from '@/components/illustrations/PriserScener'
import { FUNKTIONER } from '@/components/pricing/paket-copy'
import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/simple-templates'

const KNAPP =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto'
const LANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'
const SEKTION = 'mt-16 scroll-mt-24 lg:mt-[88px]'

const kort = (id: string) => FUNKTIONER.kort.find((k) => k.id === id)!

const ANKARE = [
  { text: 'Personligt brev', href: '#brev' },
  { text: 'CV-analys', href: '#cv-analys' },
  { text: 'Skapa CV och mallar', href: '#cv-skapa-mallar' },
  { text: 'Rekryteringstester', href: '#tester' },
  { text: 'Jobbmatchning', href: '#jobbmatchning' },
  { text: 'Jobbcoachen', href: '#jobbcoachen' },
  { text: 'LinkedIn-profilen', href: '#linkedin' },
] as const

export const FUNKTIONER_FAQ = [
  {
    q: 'Hur skiljer sig era verktyg från ChatGPT?',
    a: 'ChatGPT är ett allmänt språkverktyg utan kunskap om svensk arbetsmarknad, rekryteringssystemen eller hur rekryterare faktiskt sållar ansökningar. Vi är byggda för just det: vi läser ditt CV, matchar mot annonsens krav och formaterar för de system svenska arbetsgivare använder. Du behöver inte skriva någon instruktion för att få ett bra resultat.',
  },
  {
    q: 'Är det säkert att lämna mitt CV till er?',
    a: 'Ja. Vi följer GDPR, all data lagras i EU och vi säljer aldrig din information vidare. Du kan radera ditt konto med ett klick, och då försvinner allt, även våra kopior. Vi använder inte ditt CV för att träna någon modell.',
  },
  {
    q: 'Hur ofta uppdateras jobbmatchningen?',
    a: 'Vi hämtar annonserna från Arbetsförmedlingen och JobTech. Nya annonser kommer med inom timmar efter att de publicerats, och i Allt får du de bästa träffarna varje natt.',
  },
  {
    q: 'Vad händer om jag säger upp mitt paket?',
    a: 'Kontot går tillbaka till gratisnivån när perioden är slut. Allt du skrivit och analyserat finns kvar att läsa och kopiera, men nya uttag följer gratisnivåns gränser. Du kan börja om med ett paket när du vill.',
  },
  {
    q: 'Hur kommer jag igång gratis?',
    a: `Skapa konto, så är gratisnivån igång direkt: ${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning, en CV-analys med poäng och det tyngsta fyndet, ett personligt brev och grundnivån i varje test. Vill du ha mer väljer du spår: CV-veckan, Testveckan eller Allt.`,
  },
] as const

function Funktion({
  id,
  eyebrow,
  rubrik,
  sub,
  text,
  steg,
  scen,
  lankar,
  scenForst,
}: {
  id: string
  eyebrow: string
  rubrik: string
  sub: string
  text: string
  steg?: readonly string[]
  scen: ReactNode
  lankar: { text: string; href: string }[]
  scenForst?: boolean
}) {
  return (
    <section id={id} aria-labelledby={`${id}-rubrik`} className={SEKTION}>
      <div
        className={`grid items-center gap-6 rounded-xl border border-kant bg-panel p-5 sm:p-8 lg:gap-12 ${
          scenForst ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_280px]'
        }`}
      >
        <div className={scenForst ? 'lg:order-2' : ''}>
          <p className="text-steg uppercase text-ink-3">{eyebrow}</p>
          <h2 id={`${id}-rubrik`} className="mt-2 text-h2-pub text-ink-1">
            {rubrik}
          </h2>
          <p className="mt-2 text-meta text-ink-3">{sub}</p>
          <p className="mt-3 max-w-[62ch] text-base leading-[27px] text-ink-2">{text}</p>
          {steg?.length ? (
            <ol className="mt-4 space-y-2">
              {steg.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm leading-[22px] text-ink-2">
                  <span aria-hidden="true" className="w-5 shrink-0 font-display font-extrabold tabular-nums text-ink-1">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-x-6">
            {lankar.map((l) => (
              <Link key={l.href} href={l.href} className={LANK}>
                {l.text}
              </Link>
            ))}
          </div>
        </div>
        <div className={`mx-auto w-full max-w-[280px] text-ink-1 ${scenForst ? 'lg:order-1' : ''}`} aria-hidden="true">
          {scen}
        </div>
      </div>
    </section>
  )
}

export default function FunktionerSida() {
  const analys = kort('cv-analys')
  const brev = kort('personliga-brev')
  const tester = kort('rekryteringstester')
  const match = kort('matchade-jobb')
  const coach = kort('jobbcoachen')

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-16">
      <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14">
        <div>
          <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">Åtta verktyg, en plattform</p>
          <h1 className="mt-2 max-w-[15ch] text-h1-pub text-ink-1 lg:mt-3">Allt du behöver för att landa nästa jobb</h1>
          <p className="mt-4 max-w-[52ch] text-base leading-[27px] text-ink-2 lg:mt-6 lg:text-lg lg:leading-[29px]">
            Personliga brev, CV, jobbmatchning, jobbcoach, rekryteringstester och en LinkedIn-profil som hittas.{' '}
            <b className="font-semibold text-ink-1">Byggt för svensk arbetsmarknad, granskat av rekryterare.</b>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/register" className={KNAPP}>
              Skapa konto gratis
            </Link>
            <Link href="/priser" className={LANK}>
              Se paketen
            </Link>
          </div>
          <nav aria-label="Funktionerna på sidan" className="mt-6">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {ANKARE.map((a) => (
                <li key={a.href}>
                  <a href={a.href} className="inline-flex min-h-11 items-center text-ink-2 underline decoration-kant underline-offset-4 hover:text-ink-1 hover:decoration-ink-1">
                    {a.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="text-ink-1">
          <IlluScenHero className="h-auto w-full rounded-xl" title="Veckan på skrivbordet: CV med poäng, personligt brev och ett matristest" />
        </div>
      </header>

      <Funktion
        id="brev"
        eyebrow="Personligt brev"
        rubrik={brev.rubrik}
        sub={brev.sub}
        text={brev.text}
        steg={brev.steg}
        scen={<IlluScenBrev className="h-auto w-full" />}
        lankar={[
          { text: 'Så fungerar det', href: '/verktyg/personligt-brev' },
          { text: 'Se personligt brev-exempel', href: '/personligt-brev-exempel' },
        ]}
      />

      <Funktion
        id="cv-analys"
        eyebrow="CV-analys"
        rubrik={analys.rubrik}
        sub={analys.sub}
        text={analys.text}
        steg={analys.steg}
        scen={<IlluScenCv className="h-auto w-full" />}
        scenForst
        lankar={[
          { text: 'Så fungerar det', href: '/verktyg/cv-analys' },
          { text: 'Se CV-exempel', href: '/cv-exempel' },
        ]}
      />

      {/* Skapa CV och mallar: rader direkt på mark, för att bryta panelerna. */}
      <section id="cv-skapa-mallar" aria-labelledby="cv-skapa-mallar-rubrik" className={SEKTION}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <div>
            <p className="text-steg uppercase text-ink-3">Skapa CV och CV-mallar</p>
            <h2 id="cv-skapa-mallar-rubrik" className="mt-2 text-h2-pub text-ink-1">
              Ett CV som både systemet och rekryteraren läser
            </h2>
            <ul className="mt-6 grid gap-x-12 md:grid-cols-2">
              {[
                { r: 'Bygg CV:t steg för steg', t: 'Personuppgifter, profil, erfarenhet, utbildning, kompetenser och språk, med exempel för varje del.' },
                { r: `${TEMPLATE_COUNT} mallar, ${FREE_TEMPLATE_COUNT} gratis`, t: 'Ren struktur som rekryteringssystemen tolkar rätt. Byt mall med ett klick, innehållet följer med.' },
                { r: 'Foto och LinkedIn där mallen stöder det', t: 'Välj själv om bilden och profillänken ska med. Standard i Sverige är utan bild.' },
                { r: 'Ladda ner som PDF', t: 'Utan tak i CV-veckan och Allt, en nedladdning på gratisnivån.' },
              ].map((x) => (
                <li key={x.r} className="border-t border-kant py-4">
                  <h3 className="text-base font-semibold text-ink-1">{x.r}</h3>
                  <p className="mt-1 text-sm leading-[22px] text-ink-2">{x.t}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-x-6">
              <Link href="/verktyg/skapa-cv" className={LANK}>
                Skapa CV
              </Link>
              <Link href="/dashboard/cv-mallar" className={LANK}>
                Välj en mall
              </Link>
            </div>
          </div>
          <div className="hidden text-ink-1 lg:block" aria-hidden="true">
            <IlluScenMallar className="h-auto w-full" />
          </div>
        </div>
      </section>

      <Funktion
        id="tester"
        eyebrow="Rekryteringstester"
        rubrik={tester.rubrik}
        sub={tester.sub}
        text={tester.text}
        steg={tester.steg}
        scen={<IlluScenMatris className="h-auto w-full" />}
        lankar={[{ text: 'Så fungerar det', href: '/verktyg/rekryteringstester' }]}
      />

      {/* Det som bara finns i Allt: sidans enda bläckyta. */}
      <div className={SEKTION}>
        <InkPanel
          eyebrow={`Bara i Allt, ${PLAN_BY_KEY.all_week.amount} kr i veckan`}
          title="Jobben hittar dig, och du går förberedd in i intervjun."
          text={`Allt i CV-veckan och Testveckan, plus jobbmatchning, Jobbcoachen utan tak och Bli upptäckt. ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden.`}
          action={
            <Link href="/priser" className={INK_KNAPP}>
              Se paketen
            </Link>
          }
          secondary={
            <Link href="/verktyg/bli-upptackt" className={INK_LANK}>
              Om Bli upptäckt
            </Link>
          }
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div id="jobbmatchning" className="scroll-mt-24 border-t border-ink-1-kant pt-4">
              <h2 className="font-display text-[22px] font-bold leading-7 text-white">{match.rubrik}</h2>
              <p className="mt-1 text-meta text-ink-1-mjuk">{match.sub}</p>
              <p className="mt-2 text-sm leading-[22px] text-ink-1-mjuk">{match.text}</p>
              <Link href="/verktyg/jobbmatchning" className={`mt-2 inline-flex min-h-11 items-center ${INK_LANK}`}>
                Så fungerar jobbmatchningen
              </Link>
            </div>
            <div id="jobbcoachen" className="scroll-mt-24 border-t border-ink-1-kant pt-4">
              <h2 className="font-display text-[22px] font-bold leading-7 text-white">{coach.rubrik}</h2>
              <p className="mt-1 text-meta text-ink-1-mjuk">{coach.sub}</p>
              <p className="mt-2 text-sm leading-[22px] text-ink-1-mjuk">{coach.text}</p>
              <Link href="/verktyg/jobbcoachen" className={`mt-2 inline-flex min-h-11 items-center ${INK_LANK}`}>
                Så fungerar Jobbcoachen
              </Link>
            </div>
          </div>
        </InkPanel>
      </div>

      <Funktion
        id="linkedin"
        eyebrow="LinkedIn-profilen"
        rubrik="Bli hittad på LinkedIn"
        sub="Ingår i CV-veckan och Allt."
        text="Rekryterare söker på kompetenser, inte på titlar. Vi skriver om rubrik och sammanfattning så att du hittas när de söker på det du kan, och visar vilka kompetenser som saknas i profilen."
        scen={<IlluScenLinkedin className="h-auto w-full" />}
        scenForst
        lankar={[{ text: 'Så fungerar det', href: '/verktyg/linkedin-optimering' }]}
      />

      <section aria-labelledby="funktioner-faq" className={SEKTION}>
        <h2 id="funktioner-faq" className="text-h2-pub text-ink-1">
          Vanliga frågor
        </h2>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {FUNKTIONER_FAQ.map((f, i) => (
            <details key={f.q} open={i === 0} className="group rounded-xl border border-kant bg-panel px-4 sm:px-5">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-ink-1 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="shrink-0 text-ink-3 group-open:hidden" aria-hidden="true">
                  +
                </span>
                <span className="hidden shrink-0 text-ink-3 group-open:inline" aria-hidden="true">
                  −
                </span>
              </summary>
              <p className="pb-4 text-sm leading-[22px] text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
