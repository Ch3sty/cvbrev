/**
 * /priser, publikt omgång 3 (skissen priser, docs/design/publikt-omgang3/
 * sidor/priser.html, noten noter/priser.md, SEO:s besked avsnitt 4).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs. Hjälten på väggen med
 * prislappen till höger, gratisnivån som fyra kort i det lyfta pappret,
 * funktionerna en och en med instrumenten ur grunden (testramen, CV-arket,
 * brevet, träffen, samtalet, vägen i Sökta tjänster), hjälpredan Kom igång
 * som väg, tabellen rad för rad, frågorna och Premium sist.
 *
 * Texten är sidans egen, flyttad till skissens platser (byggbriefen, Texten).
 * Allt ur PLANS, paket-copy.ts, gratis-copy.ts och priser-data.ts; tal ur
 * konstanterna. Serverrenderad rakt igenom; köpknappen är det enda som
 * behöver JavaScript. Alla FAQ-svar och hela tabellen står i HTML.
 *
 * SEO: h1, title, description och canonical oförändrade. Product och
 * FAQPage ur priser-schema.ts. Baslinjens h2 och h3 står kvar; nya h3 är
 * Sökta tjänster och Inför intervjun (textbeslut B-9, GEM-12).
 */

import type { ReactNode } from 'react'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  O,
  Kort,
  Chip,
  Dorr,
  Bocklista,
  PrisRad,
  PremiumO,
  Faq,
  Knapp,
  TextLank,
  knappKlass,
  Testram,
  CvArk,
  Brevpar,
  Traff,
  Samtal,
  Stig,
  type Farg,
} from '@/components/publikt/v3'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import '@/components/publikt/publikt.css'
import { KampanjVarianter } from '@/components/kampanj/Kampanj'
import { TESTTAL, PROV_MINUTER } from '@/components/publikt/testtal'
import PriserKopKnapp from './components/PriserKopKnapp'
import PriserMatning from './components/PriserMatning'
import {
  COMPARISON,
  JAMFORELSE_KOLUMNER,
  JAMFORELSE_RUBRIK,
  PRISER_FAQ_ITEMS,
  PRISER_FAQ_RUBRIK,
  type ComparisonCell,
} from './components/priser-data'
import { faqSchema, prisSchema } from './components/priser-schema'
import { FORTROENDE, FUNKTIONER, GUIDE, HERO, PAKET_KORT, type FunktionKort } from '@/components/pricing/paket-copy'
import {
  GRATIS_BREVFONSTER,
  GRATIS_CHATTFRAGOR,
  GRATIS_LISTA,
  GRATIS_PASTAENDEN,
  GRUNDNIVAN_ALLA_DAG,
  Ord,
  TESTTYPER_ORD,
  ord,
} from '@/lib/plans/gratis-copy'
import { RUM_NAMN } from '@/lib/rum/copy'
import { BREV_MALL_ANTAL } from '@/components/publikt/brevmallar'
import { GRATISNIVA } from '@/lib/traning/gratisniva'
import { SALD_PLAN, paketMedPris, prisPeriod } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'
import { KATEGORIER as POANG_DELAR } from '@/lib/cv/poang/modell'
import { BANK_VISAT, bankTal } from '@/lib/tester/bankbredd'
import './priser.css'

// Samma 24 timmar som resten av (public). Sidan har ingen besökarspecifik data:
// inloggningen läses i klienten, så CDN:et får behålla svaret.
export const revalidate = 86400

const T = TESTTAL
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const funktion = (id: string): FunktionKort => {
  const f: FunktionKort | undefined = FUNKTIONER.kort.find((k) => k.id === id)
  if (!f) throw new Error(`FUNKTIONER saknar ${id}`)
  return f
}

/** Köpknappens text, med kampanjvarianterna (lib/kampanj). */
const KNAPP = <KampanjVarianter ord={PAKET_KORT.allt.knapp} kampanj={(k) => k.copy.prisKnapp} />
/** Grundens kopparknapp på köpknappen; logiken i PriserKopKnapp är orörd. */
const KOPPAR = knappKlass({})
const KOPPAR_BRED = knappKlass({ bred: true })

/**
 * Raden Gratis och Premium per block. Lydelsen ur nytt-innehall.md
 * (funktioner, "Raden Gratis och Premium"), samma som på /funktioner, med
 * talen ur konstanterna. Inför intervjun har ingen rad där: dess kortrad
 * "Ingår i Premium. Gratis: …" delas i två (delaSub).
 */
const NIVA = {
  tester: {
    gratis: `${stor(GRUNDNIVAN_ALLA_DAG)}, med genomgång. Personlighetstestet med ${GRATIS_PASTAENDEN} påståenden.`,
    premium: 'Avancerad nivå och expertnivå, övningsprov mot klockan, det fördjupade personlighetstestet och hela din testhistorik.',
  },
  brev: {
    gratis: 'Första brevet, sedan ett i veckan, att läsa och kopiera. De två senaste går att ändra. Nedladdning ingår inte.',
    premium: `Personliga brev utan tak, alla ${BREV_MALL_ANTAL} mallar, nedladdning som PDF eller Word och tonen vald åt dig efter annonsen.`,
  },
  analys: {
    gratis: `Läsbarhetspoängen och genomgången i ${ord(POANG_DELAR.length)} delar, för varje CV.`,
    premium: 'Alla Jobbcoachens förslag, nya förslag när du har ändrat och Ersätt mitt nuvarande CV.',
  },
  jobb: {
    gratis: `${Ord(FREE_TIER_JOB_LIMIT)} träffar, med skälen utskrivna.`,
    premium: `De ${JOB_MATCHES_PER_RUN} bästa träffarna, med skälen utskrivna.`,
  },
  sokta: {
    gratis: 'Gratis för alla med konto.',
    premium: 'Uppföljningsmejl till varje sökt tjänst och rapporten att skriva ut.',
  },
  coach: {
    gratis: `${Ord(GRATIS_CHATTFRAGOR)} meddelanden.`,
    premium: 'Fråga så mycket du vill.',
  },
} as const

/** Kortets rad "Ingår i Premium. Gratis: …" delad i en Gratisrad och en Premiumrad. */
function delaSub(sub: string): { gratis: string; premium: string } {
  const ingar = /^(Ingår i [^.]+\.) Gratis: (.*)$/.exec(sub)
  if (ingar) return { gratis: ingar[2].charAt(0).toUpperCase() + ingar[2].slice(1), premium: ingar[1] }
  return { gratis: sub, premium: '' }
}

function Niva({ gratis, premium }: { gratis: ReactNode; premium?: ReactNode }) {
  return (
    <div className="pr-niv">
      <div>
        <Chip typ="gratis">Gratis</Chip>
        <span>{gratis}</span>
      </div>
      {premium ? (
        <div>
          <Chip typ="premium">Premium</Chip>
          <span>{premium}</span>
        </div>
      ) : null}
    </div>
  )
}

function Steg({ steg }: { steg: readonly { rubrik: string; text: string }[] }) {
  return (
    <ol className="pr-steg">
      {steg.map((s) => (
        <li key={s.rubrik}>
          <span>
            <b>{s.rubrik}</b>
            {s.text}
          </span>
        </li>
      ))}
    </ol>
  )
}

/**
 * Stoppets del i Kom igång, ur stegets egen text. Småmärket under stoppet är
 * delens namn i kontot (RUM_NAMN) och styr färgen (nytt-innehall.md, priser:
 * Konto, CV, CV, CV, Jobbsöket, CV, Personliga brev, CV, Jobbsöket,
 * Jobbsöket, Rekryteringstester, Jobbsöket).
 */
function fargForSteg(s: string): Farg {
  if (/^Profilen/.test(s)) return 'neutral'
  if (/^Personligt brev/.test(s)) return 'brev'
  if (/^Rekryteringstesterna/.test(s)) return 'tran'
  if (/jobbmatchningen|Bli upptäckt|Jobbcoachen|^Intervjuprovet/.test(s)) return 'jobb'
  return 'cv'
}

/** Gruppens färg i tabellen, ur gruppnamnet. */
const GRUPP_FARG: Record<string, Farg> = { Rekryteringstester: 'tran', CV: 'cv', 'Personliga brev': 'brev', 'Jobbsöket': 'jobb' }

function Cell({ c, betald, rubrik }: { c: ComparisonCell; betald?: boolean; rubrik: string }) {
  const klass = c.ton === 'nej' ? 'pr-nej' : betald ? 'pr-p' : 'pr-g'
  return (
    <td role="cell" className={`pr-cell ${klass}`} data-k={rubrik}>
      {c.text}
      {c.sub ? <small>{c.sub}</small> : null}
    </td>
  )
}

/** Ikonerna på villkorskorten (skissen), inline och dekorativa. */
const VILLKOR_IKON: Record<string, ReactNode> = {
  uppsagning: <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H9" />,
  stripe: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  moms: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9.5 8h5M9.5 12h5" />,
}

export default function PriserSida() {
  const tester = funktion('rekryteringstester')
  const analys = funktion('cv-analys')
  const brev = funktion('personliga-brev')
  const jobb = funktion('matchade-jobb')
  const sokta = funktion('sokta-tjanster')
  const intervju = funktion('infor-intervjun')
  const coach = funktion('jobbcoachen')

  const intervjuNiva = delaSub(intervju.sub)

  /**
   * Gratisnivån i fyra kort, ett per del (skissen). Varje fakta i den långa
   * meningen (GRATIS_MENING_LANG) står i något av korten, och de sex gamla
   * plattornas tal finns kvar. Talen ur konstanterna.
   */
  const gratisKort: { farg: Farg; namn: string; tal: number; enhet: string; rader: string[] }[] = [
    {
      farg: 'tran',
      namn: RUM_NAMN.tran,
      tal: GRATISNIVA.grundnivaTestPerDag,
      enhet: 'test om dagen',
      rader: [
        `Grundnivån i alla ${TESTTYPER_ORD} testtyperna`,
        'Förklaring efter varje uppgift',
        `Personlighetstestet med ${GRATIS_PASTAENDEN} påståenden`,
      ],
    },
    {
      farg: 'cv',
      namn: RUM_NAMN.cv,
      tal: FREE_TEMPLATE_COUNT,
      enhet: `CV-mallar och ${FREE_CV_EXPORTS === 1 ? 'en nedladdning' : `${ord(FREE_CV_EXPORTS)} nedladdningar`}`,
      rader: [
        `CV-analysens läsbarhetspoäng och genomgång i ${ord(POANG_DELAR.length)} delar, för varje CV`,
        'Jobbcoachens förslag en gång, det tyngsta öppet',
      ],
    },
    {
      farg: 'brev',
      namn: RUM_NAMN.brev,
      tal: FREE_LETTERS_PER_ACCOUNT,
      enhet: `brev ${GRATIS_BREVFONSTER}`,
      rader: ['Första personliga brevet direkt', 'Alla brev sparas, och de två senaste går att ändra', 'Nedladdning ingår inte'],
    },
    {
      farg: 'jobb',
      namn: RUM_NAMN.jobb,
      tal: FREE_TIER_JOB_LIMIT,
      enhet: 'matchade jobb',
      rader: [GRATIS_LISTA[5], `${Ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen`, 'Ett intervjuprov om dagen'],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(prisSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }} />

      <Sida farg="tran" id="innehall" className="pr-sida">
        {/* 1. Hjälten: prislappen till höger */}
        <Hjalte
          id="hjalte"
          etikett={HERO.eyebrow}
          h1={paketMedPris(SALD_PLAN)}
          varde={
            <>
              <b>Rekryteringstester, CV, personliga brev och Jobbsöket med jobbmatchning, sökta tjänster och Jobbcoachen</b>
            </>
          }
          lyft
          bild={
            <div className="pr-lapp">
              <div className="pr-lapp-topp">
                <b>{PAKET_KORT.allt.namn}</b>
                <span>{FORTROENDE[0].rubrik}</span>
              </div>
              <div className="pr-lapp-kropp">
                <PrisRad paPapper className="pr-lapp-pris" />
                <PriserKopKnapp primar etikett={KNAPP} klass={KOPPAR_BRED} />
                <p className="p3-liten pr-lapp-not">
                  <KampanjVarianter ord={PAKET_KORT.allt.fotnot} kampanj={(k) => k.copy.prisFotnot} />
                </p>
                <h2 className="p3-h3 pr-lapp-rubrik">{PAKET_KORT.allt.listEtikett}</h2>
                <Bocklista punkter={PAKET_KORT.allt.ingar} />
              </div>
            </div>
          }
        >
          <p className="p3-text">
            Allt är öppet från första minuten. Ingen bindningstid, du säger upp när du vill. Mindre än en lunch i månaden.
          </p>
          <ul className="pr-delar" aria-label="Alla fyra delarna ingår">
            {(['tran', 'cv', 'brev', 'jobb'] as const).map((farg) => (
              <li key={farg} data-p3-farg={farg}>
                <Dorr ikon={farg} />
                {RUM_NAMN[farg]}
              </li>
            ))}
          </ul>
          <nav className="pr-ankare" aria-label="På sidan">
            <a className="p3-lank" href="#gratis">
              Gratisnivån
            </a>
            <a className="p3-lank" href="#funktioner">
              Så fungerar det
            </a>
            <a className="p3-lank" href="#guide">
              Så guidar vi dig
            </a>
          </nav>
        </Hjalte>

        {/* 2. Gratisnivån: fyra delar, ett huvudtal var */}
        <Lyft id="gratis" etikett="Gratisnivån">
          <div className="pr-gratis-topp">
            <div>
              <p className="p3-ey pr-gratis-ey">Gratisnivån, 0 kr</p>
              <h2 className="p3-h2">Vill du se först?</h2>
              <p className="p3-varde">Det här gör du utan att betala. Inget kort behövs, och kontot ligger kvar så länge du vill.</p>
            </div>
            <div className="p3-knapprad">
              <Knapp href="/register" variant="vit">
                Skapa konto gratis
              </Knapp>
            </div>
          </div>
          <ul className="pr-gratis-rad" aria-label="Gratisnivån">
            {gratisKort.map((k) => (
              <li key={k.farg} className="pr-gt" data-p3-farg={k.farg}>
                <p className="pr-gt-topp">
                  <Dorr ikon={k.farg} />
                  {k.namn}
                </p>
                <p className="pr-gt-tal">
                  {k.tal}
                  <small>{k.enhet}</small>
                </p>
                <ul>
                  {k.rader.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Lyft>

        {/* 3. Funktion för funktion */}
        <Sektion id="funktioner">
          <SektionHuvud rubrik={FUNKTIONER.h2} varde={FUNKTIONER.ingress} />

          {/* Rekryteringstester, störst */}
          <O
            farg="tran"
            etikett="Inför urvalstestet"
            rubrik={tester.rubrik}
            className="pr-full"
            bild={
              <>
                <Testram />
                {/* Kortet efter personlighetstestet (nytt-innehall.md, priser). Frågan finns i produkten: smakprov-tolkning.ts. */}
                <Kort className="pr-intervjukort">
                  <p className="p3-ey">Efter personlighetstestet</p>
                  <p className="pr-intervjukort-rubrik">Frågor rekryteraren lär ställa</p>
                  <p>&quot;När kostade strukturen dig flexibilitet?&quot; Du får frågorna som din profil brukar väcka, med förslag på hur du svarar.</p>
                  <p className="pr-intervjukort-under">Exempel, utifrån hög samvetsgrannhet</p>
                </Kort>
              </>
            }
          >
            <Niva gratis={NIVA.tester.gratis} premium={NIVA.tester.premium} />
            <p>
              {tester.text.replace(/\d+ till \d+ minuter/, `${PROV_MINUTER.min} till ${PROV_MINUTER.max} minuter`)} Personlighetstestet ger
              profilen rekryteraren jämför med, hur den läses mot vanliga kravprofiler och frågorna du lär få på intervjun.
            </p>
            <Steg
              steg={[
                { rubrik: 'Grundnivån', text: 'Visar var du står i varje typ.' },
                { rubrik: 'Träna på avancerad och expertnivå', text: 'I din svagaste typ, med förklaring på varje fråga.' },
                { rubrik: 'Kör övningsprovet när du är redo', text: 'Automatisk inlämning, resultat direkt.' },
                {
                  rubrik: 'Personlighetstestet',
                  text: 'Profilen, kravprofilerna och frågorna rekryteraren lär ställa. Det fördjupade testet ger 30 delfaktorer och din arbetsstil.',
                },
                { rubrik: 'Följ kurvan', text: 'Session för session.' },
              ]}
            />
            {/* Bankbredden i Premium-blocket, aldrig på gratiskortet: där skulle talet läsas som gratis. */}
            <p className="pr-bank">
              <b>{bankTal(BANK_VISAT)}+</b>
              <span>uppgifter. Nivån räknas bara på det du inte sett den senaste månaden.</span>
            </p>
            <p>
              <TextLank href="/verktyg/personlighetstest">{`Gör personlighetstestet, ${T.personlighetProv} påståenden utan konto`}</TextLank>
            </p>
          </O>

          <div className="pr-duo">
            <O farg="cv" etikett="Inför ansökan" rubrik={analys.rubrik}>
              <Niva gratis={NIVA.analys.gratis} premium={NIVA.analys.premium} />
              <p>{analys.text}</p>
              <Steg
                steg={[
                  { rubrik: 'Ladda upp', text: 'Vi läser som en rekryterare gör på sex sekunder.' },
                  {
                    rubrik: 'Poäng per del',
                    text: 'Hur lätt CV:t är att läsa för rekryteraren och rekryteringssystemen (ATS), och vad som saknas i var och en av de sju delarna.',
                  },
                  { rubrik: 'Jobbcoachens förslag', text: 'Nya formuleringar där du tappar poäng. En hämtning ingår gratis.' },
                  { rubrik: 'Rätta och spara', text: 'Se poängen räknas om.' },
                ]}
              />
              <div className="pr-bild">
                <CvArk poang={{ tal: 93, text: 'av 100 i dag' }} />
              </div>
            </O>

            <O farg="brev" etikett="Till varje annons" rubrik={brev.rubrik}>
              <Niva gratis={NIVA.brev.gratis} premium={NIVA.brev.premium} />
              <p>{brev.text}</p>
              <Steg
                steg={[
                  { rubrik: 'Klistra in annonsen', text: 'Eller välj ett matchat jobb.' },
                  { rubrik: 'Välj ton', text: 'Fem toner, från professionell till kreativ. I Premium väljer vi åt dig efter annonsen.' },
                  { rubrik: 'Brevet svarar på kraven', text: 'Det personliga brevet svarar på annonsens krav med exempel ur ditt CV.' },
                  { rubrik: 'Redigera, ladda ner som PDF eller Word, skicka', text: 'Det som står i CV:t vinner.' },
                ]}
              />
              <div className="pr-bild">
                <Brevpar />
              </div>
            </O>
          </div>

          <div className="pr-duo">
            <O farg="jobb" etikett="Jobben du annars missar" rubrik={jobb.rubrik}>
              <Niva gratis={NIVA.jobb.gratis} premium={NIVA.jobb.premium} />
              <p>{jobb.text}</p>
              <div className="pr-bild">
                <Traff />
              </div>
            </O>

            <O farg="jobb" etikett="Hela vägen" rubrik={coach.rubrik}>
              <Niva gratis={NIVA.coach.gratis} premium={NIVA.coach.premium} />
              <p>{coach.text}</p>
              <div className="pr-bild">
                <Samtal yta />
              </div>
            </O>
          </div>

          {/* Sökta tjänster och Inför intervjun bredvid varandra, Jobbsökets två andra flikar (textbeslut B-9, GEM-12, nytt-innehall.md priser) */}
          <div className="pr-duo">
            <O id="sokta-tjanster" farg="jobb" etikett="Gratis för alla med konto" rubrik={sokta.rubrik}>
              <Niva gratis={NIVA.sokta.gratis} premium={NIVA.sokta.premium} />
              <p>{sokta.text}</p>
              <p className="pr-veckomal" aria-hidden="true">
                <i className="pr-k" />
                <i className="pr-k" />
                <i />
                Veckans mål: 2 av 3 sökta
              </p>
              {sokta.lank ? (
                <p>
                  <TextLank href={sokta.lank.href}>{sokta.lank.text}</TextLank>
                </p>
              ) : null}
              <div className="pr-bild pr-stigplats">
                <Stig ariaLabel="Exempel: sökta tjänster, från Ska sökas till Erbjudande" />
              </div>
            </O>

            <O farg="jobb" rubrik={intervju.rubrik}>
              <Niva gratis={intervjuNiva.gratis} premium={intervjuNiva.premium} />
              <p>{intervju.text}</p>
            </O>
          </div>
        </Sektion>

        {/* 4. Hjälpredan Kom igång och villkoren */}
        <Sektion id="guide" botten="ton">
          <div className="pr-tva">
            <div>
              <SektionHuvud etikett="Första kvällen" rubrik={GUIDE.h2}>
                <p className="pr-guide-ingress">{GUIDE.ingress}</p>
              </SektionHuvud>
              <ul className="pr-villkor" aria-label="Villkor">
                {FORTROENDE.map((f) => (
                  <li key={f.key}>
                    <i aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {VILLKOR_IKON[f.key]}
                      </svg>
                    </i>
                    <b>{f.rubrik}</b>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Kort className="pr-kig-kort">
              <p className="p3-ey">{GUIDE.listor.allt.etikett}</p>
              <ol className="pr-kig">
                {GUIDE.listor.allt.steg.map((s) => (
                  <li key={s} data-p3-farg={fargForSteg(s)}>
                    <span>
                      {s}
                      <small>{RUM_NAMN[fargForSteg(s)]}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </Kort>
          </div>
        </Sektion>

        {/* 5. Rad för rad: kvar som tabell i HTML */}
        <Sektion id="tabell" botten="papper">
          <SektionHuvud rubrik={JAMFORELSE_RUBRIK} varde="Gratis till vänster, Premium till höger. Samma ordning som i kontot." />
          <table className="pr-jf" role="table">
            <caption className="sr-only">{JAMFORELSE_KOLUMNER.caption}</caption>
            <thead role="rowgroup">
              <tr className="pr-jf-kol" role="row">
                <th scope="col" role="columnheader" className="pr-jf-tom">
                  <span className="sr-only">{JAMFORELSE_KOLUMNER.funktion}</span>
                </th>
                <th scope="col" role="columnheader" className="pr-g">
                  <b>{JAMFORELSE_KOLUMNER.gratis}</b>
                  <span>0 kr, inget kort</span>
                </th>
                <th scope="col" role="columnheader" className="pr-p">
                  <b>{JAMFORELSE_KOLUMNER.premium}</b>
                  <span>{prisPeriod(SALD_PLAN)}</span>
                </th>
              </tr>
            </thead>
            {COMPARISON.map((grupp) => (
              <tbody key={grupp.title} role="rowgroup" className="pr-jf-grupp" data-p3-farg={GRUPP_FARG[grupp.title] ?? 'neutral'}>
                <tr className="pr-jf-huvud" role="row">
                  <th scope="rowgroup" colSpan={3} role="columnheader">
                    <Dorr ikon={GRUPP_FARG[grupp.title] ?? 'neutral'} />
                    {grupp.title}
                  </th>
                </tr>
                {grupp.rows.map((r) => (
                  <tr key={r.label} className="pr-jf-rad" role="row">
                    <th scope="row" role="rowheader" className="pr-jf-vad">
                      {r.label}
                      {r.sub ? <span>{r.sub}</span> : null}
                    </th>
                    <Cell c={r.free} rubrik={JAMFORELSE_KOLUMNER.gratis} />
                    <Cell c={r.premium} betald rubrik={JAMFORELSE_KOLUMNER.premium} />
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </Sektion>

        {/* 6. Frågorna */}
        <Sektion id="fragor">
          <Faq rubrik={PRISER_FAQ_RUBRIK} fragor={PRISER_FAQ_ITEMS} className="pr-faq" />
        </Sektion>

        {/* 7. Premium sist */}
        <Sektion luft="utan-topp">
          <PremiumO
            rubrikNiva="p"
            rubrik="Allt öppet från första minuten."
            text="Ingen bindningstid. Dagen innan månaden förnyas mejlar vi vad du har gjort, så att du kan säga upp om du är klar."
            uppsagning
            knapp={
              <>
                <PriserKopKnapp cta="secondary" etikett={KNAPP} klass={KOPPAR} />
                <TextLank href="/register">Eller börja gratis</TextLank>
              </>
            }
          />
        </Sektion>
      </Sida>

      <FastKnapprad text={PAKET_KORT.allt.knapp} href="/register" observera="hjalte">
        <PriserKopKnapp cta="secondary" etikett={KNAPP} />
      </FastKnapprad>
      <PriserMatning />
    </>
  )
}

