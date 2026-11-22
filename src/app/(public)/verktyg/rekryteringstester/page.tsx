/**
 * /verktyg/rekryteringstester i publikt omgång 3 (skissen rekryteringstester,
 * docs/design/publikt-omgang3/sidor/rekryteringstester.html, noten
 * noter/rekryteringstester.md, SEO:s besked avsnitt 10).
 *
 * Byggd med grundens komponenter (src/components/publikt/v3). Uppgifterna i
 * ramarna är hämtade ur bankerna i koden (id står vid varje konstant), utom
 * hjältens och matriskortets uppgift, som är grundens kontrollräknade förval.
 * Personlighetsplattan räknas ur tolkningens riktiga funktioner
 * (src/lib/personlighet/smakprov-tolkning.ts) med en fast exempelprofil.
 *
 * SEO: h1, metadata och alla H2 och H3 står kvar med samma text och nivå, utom
 * H3 "Lös uppgifterna i din takt" (RUBRIK_BYTT). Schemat (WebApplication,
 * HowTo, FAQPage, VideoObject) byggs ur samma listor som det synliga.
 * "Fråga" blir "uppgift" där sidan talar om våra egna tester (beskedet,
 * LD_UNDANTAG för WebApplication, HowTo och FAQPage).
 *
 * Serverkomponent. Klient-JS bara för typvalets mätning (ProvVal),
 * produktfilmen och de mätta länkarna (MattLank), som i dag.
 */
import type { ReactNode } from 'react'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { MYNDIGHETER_SLUG, faqMedMyndigheter } from './components/rekryteringstester-faq-data'
import ProvVal from './components/ProvVal'
import { getPostBySlug } from '@/lib/blog'
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Kort,
  Rutnat,
  Chip,
  Nr,
  Faq,
  PremiumO,
  Bocklista,
  Knapp,
  Knapprad,
  TextLank,
  Svav,
  Testram,
  Dorr,
  Ikon,
  knappKlass,
  type TestSvar,
} from '@/components/publikt/v3'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import MattLank from '@/components/publikt/MattLank'
import { TESTTAL } from '@/components/publikt/testtal'
import { ANTAL_TESTTYPER, GRATIS_TESTRAD_PROV, GRUNDNIVAN_ALLA_DAG, TESTTYPER_ORD } from '@/lib/plans/gratis-copy'
import Bankbredd from '@/components/publikt/Bankbredd'
import Produktfilm from '@/components/publikt/Produktfilm'
import { TESTGLYFER, type TestTyp } from '@/components/illustrations/TestGlyfer'
import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { SpatialFigur } from '@/lib/spatialV1/types'
import { FigurV7 } from '@/lib/logicTestV7/layered.v7'
import type { V7Cell } from '@/lib/logicTestV7/types.v7'
import { provAntal, type ProvTyp } from '@/lib/tests/prov-typer'
import type { MittTest } from '@/lib/traning/mittTest'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import { bandFor } from '@/lib/personalityTest/insights'
import {
  KRAVPROFILER,
  bandOrd,
  faktorUtfall,
  kravUtfall,
  profilMening,
  segment,
  visadPoang,
  type Faktor,
} from '@/lib/personlighet/smakprov-tolkning'
import '@/components/publikt/publikt.css'
import './rekryteringstester.css'

const PROVA = '/verktyg/rekryteringstester/prova'
const PREMIUM = paketKort()
// Priset i löptext följer kampanjen (Black Week) via MedKampanjPris: sidan
// CDN-cachas, så båda varianterna ritas och KampanjHuvud väljer i webbläsaren.
const PRIS = prisPeriod(SALD_PLAN)
const T = TESTTAL
const PROV_N = provAntal('matris')
/** Gratisraden för provet, ur gratis-copy.ts (säger "uppgifter" sedan P5a). */
const PROV_RAD = GRATIS_TESTRAD_PROV

/* ------------------------------------------------------------------ */
/* Uppgifterna ur bankerna                                             */
/* ------------------------------------------------------------------ */

/** src/lib/talserierV1/bankGrund.json, ts-g-arit-01. Följer genom steg 2 till 4. */
const TALSERIE = {
  visade: [26, 31, 36, 41, 46],
  svar: [49, 50, 51, 52, 56],
  ratt: 2,
  /** Det exemplet väljer i steg 2 (fel), och misstaget banken skriver för det. */
  valt: 1,
  regel: 'Varje tal är 5 mer än det förra.',
  misstag: 'Du tog steget +4, men steget är +5 hela vägen.',
}

/** talserierV1/bankGrund.json, ts-g-vaxel-01 (testtypens kort). */
const TALSERIE_KORT = { visade: [21, 30, 26, 35, 31, 40], svar: [36, 44, 45, 49, 62], ratt: 0 }

/** verbalTestV2/questionBank.json, v2-p10-aging-population: de två första meningarna och första påståendet (sant). */
const VERBAL = {
  text: 'Många industriländer står inför en demografisk utmaning med åldrande befolkningar. I Japan är över 28 procent av befolkningen över 65 år, och andelen förväntas öka ytterligare.',
  pastaende: 'Över en fjärdedel av Japans befolkning är över 65 år.',
}

/** numericalTestV2/questionBank.json, numv2-p01 och fråga numv2-p01-q02. */
const NUMERISK = {
  rubrik: 'Omsättning per månad (MSEK)',
  data: [
    ['Jan', '12,5'],
    ['Feb', '14'],
    ['Mar', '15,8'],
    ['Apr', '17,6'],
    ['Maj', '19,5'],
    ['Jun', '21,5'],
  ],
  fraga: 'Bolaget hävdar ”över 70% tillväxt sedan januari”. Är det korrekt?',
  svar: ['Ja, exakt 72%', 'Nej, bara 56%', 'Ja, hela 95%', 'Nej, 41%'],
  ratt: 0,
}

/** deduktivV1/bankGrund.json, dd-g-d1-01. */
const DEDUKTIV = {
  villkor: ['Alla som arbetar natt får tillägg.', 'Alla som får tillägg får lönebeskedet i två delar.', 'Ingen i receptionen får lönebeskedet i två delar.'],
  fraga: 'Vad måste gälla?',
  svar: [
    'Ingen i receptionen arbetar natt.',
    'Alla som får lönebeskedet i två delar arbetar natt.',
    'Någon i receptionen får tillägg.',
    'Några som får tillägg arbetar inte natt.',
  ],
  ratt: 0,
}

/** figurserierV1/bankGrund.json, fs-g-vrid-01 ("Pilen vrids 45 grader medurs i varje steg"). */
const FIGURSERIE: { rad: V7Cell[]; svar: V7Cell[]; ratt: number } = {
  rad: ([315, 0, 45, 90, 135] as const).map((angle): V7Cell => ({ kind: 'vector', angle, length: 'short', head: 'filled' })),
  svar: [
    { kind: 'vector', angle: 270, length: 'short', head: 'filled' },
    { kind: 'vector', angle: 180, length: 'short', head: 'filled' },
    { kind: 'vector', angle: 0, length: 'long', head: 'filled' },
    { kind: 'vector', angle: 135, length: 'short', head: 'open' },
    { kind: 'vector', angle: 90, length: 'short', head: 'open' },
    { kind: 'vector', angle: 225, length: 'short', head: 'open' },
  ],
  ratt: 1,
}

/** spatialV1/bankGrund.json, sp-g-a-01. */
const SPATIAL: { fraga: string; referens: SpatialFigur; svar: SpatialFigur[]; ratt: number } = {
  fraga: 'Vilken figur är samma som den första, bara vriden?',
  referens: { kind: 'brick', n: 3, cells: [[0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0]] },
  svar: [
    { kind: 'brick', n: 3, cells: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 2]] },
    { kind: 'brick', n: 3, cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 1], [2, 2]] },
    { kind: 'brick', n: 3, cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]] },
    { kind: 'brick', n: 3, cells: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1]] },
  ] as SpatialFigur[],
  ratt: 1,
}

/** ordforradV1/bankGrund.json, of-g-s-01 (synonym). */
const ORD = { ord: 'snabb', typ: 'Synonym till', svar: ['stark', 'trygg', 'enkel', 'kvick', 'bister'], ratt: 3 }

const textSvar = (lista: readonly (string | number)[], vald: number): TestSvar[] =>
  lista.map((s, i) => ({ text: String(s), tillstand: i === vald ? 'vald' : undefined }))

/** Talraden på brädet: talen i brickorna och luckan sist (grundens Testram, P5a). */
const talBrade = (tal: readonly number[]) => [...tal, null]

/* ------------------------------------------------------------------ */
/* Sidans listor                                                       */
/* ------------------------------------------------------------------ */

const STEG = [
  { rubrik: 'Välj test', text: `Välj bland ${TESTTYPER_ORD} testtyper, från matrislogik till talserier. Grundnivån i varje typ är gratis med konto, med genomgång efteråt.` },
  { rubrik: 'Lös uppgifterna i din takt', text: 'Klockan visar provets tid, och stapeln har en bit per uppgift. Ingenting bryter mitt i en uppgift: markera ditt svar, gå vidare med Nästa och lämna in när du är klar.' },
  { rubrik: 'Se resultat och tid direkt', text: 'När du har lämnat in ser du antal rätt, tiden mot provets tid och var missarna sitter, uppgift för uppgift. Du väntar inte på något.' },
  { rubrik: 'Se vad du missade', text: 'Uppgift för uppgift jämför du ditt svar med facit. Du ser vilka mönster du missade och vet vad du ska träna mer på.' },
]

type FardBild = 'pilar' | 'kedja' | 'text' | 'tre' | 'rakna' | 'tabell'

const FARDIGHETER: { rubrik: string; text: string; bild: FardBild }[] = [
  { bild: 'pilar', rubrik: 'Mönsterigenkänning', text: 'Hitta progressioner, rotationer och mängdoperationer i abstrakta former. Det är den förmåga matrislogik mäter, och den blir tydligt bättre med repetition.' },
  { bild: 'kedja', rubrik: 'Logiskt tänkande', text: 'Dra slutsatser från regler du själv har hittat. Rekryteringstester belönar den som tänker steg för steg, inte den som chansar.' },
  { bild: 'text', rubrik: 'Läsförståelse', text: 'Plocka ut vad texten faktiskt säger, inte vad du tror att den säger. Där går gränsen mellan rätt och fel i verbalt resonemang.' },
  { bild: 'tre', rubrik: 'Kritiskt tänkande', text: 'Skilj på vad ett påstående bevisar och vad det bara antyder. Testerna har ofta tre svarsalternativ, sant, falskt och går inte att avgöra, just för att fånga förhastade slutsatser.' },
  { bild: 'rakna', rubrik: 'Snabbräkning', text: 'Räkna procent, kvoter och skillnader i huvudet eller på papper. Du behöver ingen avancerad matematik, men du måste hinna räkna utan att tappa precisionen.' },
  { bild: 'tabell', rubrik: 'Tabelltolkning', text: 'Hitta rätt cell snabbt i en tabell med fem rader och fyra kolumner. Den som läser av tabellen smart får mer tid över till själva räknandet.' },
]

function FardighetBild({ bild }: { bild: FardBild }) {
  if (bild === 'pilar') {
    return (
      <>
        {[0, 90, 180].map((v) => (
          <span key={v} className="rt-fb-bricka">
            <svg viewBox="0 0 40 40">
              <path d="M20 32V9M11 17l9-9 9 9" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${v} 20 20)`} />
            </svg>
          </span>
        ))}
        <span className="rt-fb-bricka rt-fb-lucka">?</span>
      </>
    )
  }
  if (bild === 'kedja') {
    return (
      <>
        <span className="rt-fb-led">Om A så B</span>
        <span className="rt-fb-pil">→</span>
        <span className="rt-fb-led">A gäller</span>
        <span className="rt-fb-pil">→</span>
        <span className="rt-fb-led rt-fb-svar">B</span>
      </>
    )
  }
  if (bild === 'text') {
    return (
      <span className="rt-fb-text">
        <i />
        <i className="rt-m" />
        <i />
        <i className="rt-k" />
      </span>
    )
  }
  if (bild === 'tre') {
    return (
      <span className="rt-fb-tre">
        <span>Sant</span>
        <span>Falskt</span>
        <span className="rt-v">Går inte att avgöra</span>
      </span>
    )
  }
  if (bild === 'rakna') {
    return (
      <span className="rt-fb-rakna">
        48 → 60 <em>+25 %</em>
      </span>
    )
  }
  return (
    <span className="rt-fb-tab">
      {Array.from({ length: 20 }, (_, i) => (
        <i key={i} className={i < 4 ? 'rt-h' : i === 10 ? 'rt-t' : undefined} />
      ))}
    </span>
  )
}

const TESTTYPER: {
  rubrik: string
  text: string
  glyf: TestTyp
  fakta: { niva: string; text: string; gratis: boolean }[]
  uppgift: ReactNode
}[] = [
  {
    rubrik: 'Matrislogik',
    glyf: 'matris',
    text: 'Hitta mönstret i en 3×3-matris: abstrakta former, grupper av tecken, streckfigurer och klockor. Tränar mönsterigenkänning och logiskt tänkande i samma format som SHL Inductive Reasoning och Cut-e Scales.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.matrisGrund.fragor} frågor, cirka ${T.matrisGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.matrisAvancerad.fragor} frågor, cirka ${T.matrisAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: <Testram uppgift={1} av={T.matrisGrund.fragor} tid={null} knapp={null} className="rt-liten" />,
  },
  {
    rubrik: 'Verbalt resonemang',
    glyf: 'verbalt',
    text: 'Läs en kort text och avgör om ett påstående är sant, falskt eller inte går att avgöra. Tränar läsförståelse och kritiskt tänkande utan att förkunskaper spelar in.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.verbalGrund.fragor} påståenden, cirka ${T.verbalGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.verbalAvancerad.fragor} påståenden, cirka ${T.verbalAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Verbalt resonemang"
        uppgift={1}
        av={T.verbalGrund.fragor}
        tid={null}
        knapp={null}
        brade={null}
        stycke={VERBAL.text}
        fraga={`”${VERBAL.pastaende}”`}
        svar={textSvar(['Sant', 'Falskt', 'Går inte att avgöra'], 0)}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Numeriskt resonemang',
    glyf: 'numeriskt',
    text: 'Tolka tabeller och diagram med ekonomiska siffror och svara på frågor om procent och beräkningar. Tränar tabelltolkning och snabbräkning under tidspress.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.numeriskGrund.fragor} frågor, cirka ${T.numeriskGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.numeriskAvancerad.fragor} frågor, cirka ${T.numeriskAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Numeriskt resonemang"
        uppgift={1}
        av={T.numeriskGrund.fragor}
        tid={null}
        knapp={null}
        brade={null}
        stycke={
          <div className="rt-tabell">
            <em>{NUMERISK.rubrik}</em>
            <table>
              <tbody>
                <tr>
                  {NUMERISK.data.map(([m]) => (
                    <th key={m} scope="col">
                      {m}
                    </th>
                  ))}
                </tr>
                <tr>
                  {NUMERISK.data.map(([m, v]) => (
                    <td key={m}>{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        }
        fraga={NUMERISK.fraga}
        svar={textSvar(NUMERISK.svar, NUMERISK.ratt)}
        svarKolumner={2}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Figurserier',
    glyf: 'figurer',
    text: 'En rad figurer som följer en regel, och du väljer nästa. Pilar, former och klockor med två visare. Induktiv logik i samma format som Aon scales ix och SHL Inductive Reasoning.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.figurGrund.fragor} frågor, cirka ${T.figurGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad och expert', text: `I ${PREMIUM}`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Figurserier"
        uppgift={1}
        av={T.figurGrund.fragor}
        tid={null}
        knapp={null}
        brade={[...FIGURSERIE.rad.map((c, i) => <FigurV7 key={i} cell={c} />), null]}
        bradeKolumner={FIGURSERIE.rad.length + 1}
        fraga="Vilken figur kommer härnäst?"
        svar={FIGURSERIE.svar.map((c, i) => ({ figur: <FigurV7 cell={c} />, tillstand: i === FIGURSERIE.ratt ? ('vald' as const) : undefined }))}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Deduktiv slutledning',
    glyf: 'deduktiv',
    text: 'Villkor i text och en fråga om vad som måste gälla, eller vad som inte kan stämma. Om och så, alla och några, sanningssägare och lögnare, tabellpussel och ordningsuppgifter. Övningsprovet har samma antal uppgifter och samma tid som SHL Verify deduktiv.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.deduktivGrund.fragor} uppgifter, cirka ${T.deduktivGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad och expert', text: `I ${PREMIUM}`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Deduktiv slutledning"
        uppgift={1}
        av={T.deduktivGrund.fragor}
        tid={null}
        knapp={null}
        brade={null}
        stycke={
          <ol className="rt-villkor">
            {DEDUKTIV.villkor.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ol>
        }
        fraga={DEDUKTIV.fraga}
        svar={textSvar(DEDUKTIV.svar, DEDUKTIV.ratt)}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Talserier',
    glyf: 'talserier',
    text: 'En rad tal och en eller två luckor sist. Ett av deltesterna i I-provet, och vanligt i logiktest vid rekrytering.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.talserieGrund.fragor} talserier, cirka ${T.talserieGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.talserieAvancerad.fragor} talserier med två luckor, ${T.talserieAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Talserier"
        uppgift={1}
        av={T.talserieGrund.fragor}
        tid={null}
        knapp={null}
        brade={talBrade(TALSERIE_KORT.visade)}
        bradeKolumner={TALSERIE_KORT.visade.length + 1}
        fraga="Vilket tal kommer härnäst?"
        svar={textSvar(TALSERIE_KORT.svar, TALSERIE_KORT.ratt)}
        svarKolumner={3}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Spatial förmåga',
    glyf: 'spatial',
    text: 'Rumsuppfattning: vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber sedda från olika håll. Tre av de sex deltesterna i I-provet bygger på förmågan.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.spatialGrund.fragor} uppgifter, cirka ${T.spatialGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.spatialAvancerad.fragor} uppgifter, cirka ${T.spatialAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Spatial förmåga"
        uppgift={1}
        av={T.spatialGrund.fragor}
        tid={null}
        knapp={null}
        brade={null}
        referens={<SpatialSvg fig={SPATIAL.referens} />}
        fraga={SPATIAL.fraga}
        svar={SPATIAL.svar.map((fig, i) => ({ figur: <SpatialSvg fig={fig} />, tillstand: i === SPATIAL.ratt ? ('vald' as const) : undefined }))}
        className="rt-liten"
      />
    ),
  },
  {
    rubrik: 'Ordförråd',
    glyf: 'ordforrad',
    text: 'Ett ord i versaler och fem alternativ: synonymer och motsatsord, som i I-provets två orddeltester.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.ordGrund.fragor} ord, cirka ${T.ordGrund.minuter} minuter`, gratis: true },
      { niva: 'Avancerad nivå', text: `${T.ordAvancerad.fragor} ord, cirka ${T.ordAvancerad.minuter} minuter`, gratis: false },
    ],
    uppgift: (
      <Testram
        test="Ordförråd"
        uppgift={1}
        av={T.ordGrund.fragor}
        tid={null}
        knapp={null}
        brade={null}
        styckeFritt
        stycke={
          <div className="rt-ordkort">
            <small>{ORD.typ}</small>
            <b>{ORD.ord.toUpperCase()}</b>
          </div>
        }
        fraga={null}
        svar={textSvar(ORD.svar, ORD.ratt)}
        svarKolumner={2}
        className="rt-liten"
      />
    ),
  },
]

/**
 * Inför testet (SEO-planen U15, förslaget K5, 2026-11-14): tre guider från
 * inbjudan till resultatet. Ett kort visas bara när artikeln finns i bygget.
 */
const INFOR_TESTET = [
  {
    slug: 'logiktest-tips',
    rubrik: 'Tips inför testet',
    text: 'Vad forskningen säger om övning, en plan för veckan före och sju saker att komma ihåg på testdagen.',
    variant: 'tips',
  },
  {
    slug: 'stanine-testresultat',
    rubrik: 'Så läser du resultatet',
    text: 'Stanine 4, C 6 eller 7 av 10? Vi går igenom stanineskalan steg för steg, hur den förhåller sig till percentil och C-skala och vad 4 på I-provet betyder.',
    variant: 'resultat',
  },
  {
    slug: MYNDIGHETER_SLUG,
    rubrik: 'Tester hos myndigheter',
    text: 'Vad nio statliga myndigheter själva skriver om sina tester, från Skatteverket till Säkerhetspolisen, och hur du förbereder dig när du inte vet vilket test det är.',
    variant: 'myndigheter',
  },
] as const

/** Samma läsning som artikelsidan (lib/blog), så att samma filer följer med bygget. */
function artikelFinns(slug: string): boolean {
  try {
    return getPostBySlug(slug) !== null
  } catch {
    return false
  }
}

function provHref(typ: ProvTyp, mitt: MittTest): string {
  return `${PROVA}?typ=${typ}&mitt_test=${mitt}`
}

/**
 * Vilket test ska du göra? Den publika motsvarigheten till valet Mitt test i
 * kontot. Provlänken bär ?typ= och ?mitt_test=, som följer med till kontot
 * (provkalla.ts). bestar: testtyperna inbjudan består av, som märken.
 */
const VAL: {
  val: MittTest
  rubrik: string
  text: string
  bestar: { glyf?: TestTyp; text: string }[]
  artikel: { text: string; href: string }
  prov: { text: string; href: string }
}[] = [
  { val: 'iprov', rubrik: 'Polisen eller Försvarsmakten', bestar: [{ glyf: 'ordforrad', text: 'Ord' }, { glyf: 'talserier', text: 'Tal' }, { glyf: 'spatial', text: 'Rumsuppfattning' }], text: 'I-provet vid mönstringen och i polisens prövning: sex deltester i ord, tal och rumsuppfattning.', artikel: { text: 'Så fungerar I-provet', href: '/artiklar/i-prov' }, prov: { text: 'Prova sex uppgifter ur I-provet', href: provHref('iprov', 'iprov') } },
  { val: 'matrigma', rubrik: 'Matrigma', bestar: [{ glyf: 'matris', text: 'Matriser' }], text: 'Assessios matristest, det vanligaste enskilda logiktestet i svensk rekrytering.', artikel: { text: 'Så fungerar Matrigma', href: '/artiklar/matrigma-test' }, prov: { text: 'Prova fem matrisuppgifter', href: provHref('matris', 'matrigma') } },
  { val: 'alva', rubrik: 'Alva Labs', bestar: [{ glyf: 'matris', text: 'Matriser' }, { text: 'Adaptivt' }], text: 'Adaptivt logiktest med matriser, vanligt i tech och tjänsteföretag.', artikel: { text: 'Så fungerar Alvas logiktest', href: '/artiklar/alva-labs-logiktest' }, prov: { text: 'Prova fem matrisuppgifter', href: provHref('matris', 'alva') } },
  { val: 'shl', rubrik: 'SHL', bestar: [{ glyf: 'deduktiv', text: 'Deduktivt' }, { glyf: 'figurer', text: 'Induktivt' }, { glyf: 'numeriskt', text: 'Numeriskt' }], text: 'Verify med deduktiva, induktiva och numeriska uppgifter, ofta i större koncerner.', artikel: { text: 'Deduktivt och induktivt test', href: '/artiklar/deduktivt-induktivt-test' }, prov: { text: 'Prova fem deduktiva uppgifter', href: provHref('deduktiv', 'shl') } },
  { val: 'aon', rubrik: 'Aon', bestar: [{ glyf: 'figurer', text: 'Figurserier' }, { text: '5 till 12 min' }], text: 'Korta moduler på fem till tolv minuter, tidigare cut-e.', artikel: { text: 'Så fungerar Aon-testet', href: '/artiklar/aon-cut-e-test' }, prov: { text: 'Prova fem figurserier', href: provHref('figurserie', 'aon') } },
  { val: 'lokforare', rubrik: 'Lokförare', bestar: [{ glyf: 'figurer', text: 'Figurserier' }, { glyf: 'deduktiv', text: 'Deduktivt' }, { glyf: 'numeriskt', text: 'Siffror' }, { glyf: 'ordforrad', text: 'Ord' }], text: 'Vi har figurserier, deduktivt, siffror och ord i Aons tempo, men inte koncentration, reaktion eller navigering.', artikel: { text: 'Testet för lokförare', href: '/artiklar/aon-cut-e-test#testet-for-lokforare' }, prov: { text: 'Prova fem figurserier', href: provHref('figurserie', 'lokforare') } },
  { val: 'annat', rubrik: 'Annat eller vet inte', bestar: [{ text: 'Översikten' }], text: 'Vet du inte vilket test som väntar? Börja med översikten och fråga rekryteraren.', artikel: { text: 'Arbetspsykologiska tester', href: '/artiklar/arbetspsykologiska-tester' }, prov: { text: 'Prova fem matrisuppgifter', href: provHref('matris', 'annat') } },
  { val: 'personlighet', rubrik: 'Personlighet', bestar: [{ glyf: 'personlighet', text: 'Fem faktorer' }], text: 'Big Five i MAP, Alva och NEO. Inga rätta svar, men det går att förbereda sig.', artikel: { text: 'Personlighetstest vid rekrytering', href: '/artiklar/personlighetstest-jobb-guide' }, prov: { text: 'Gör personlighetsprovet', href: '/verktyg/personlighetstest' } },
]

/**
 * Exempelprofilen på plattan: samma nivåer som sidan visade i dag (88, 26,
 * 72, 58, 52), läst genom tolkningens egna funktioner. Inga råpoäng visas.
 */
const EXEMPEL_PROFIL: BigFiveScores = { conscientiousness: 88, extraversion: 26, neuroticism: 28, agreeableness: 58, openness: 52 }

/** De fem dimensionerna i baslinjens ordning och namn. */
const BIG_FIVE: { rubrik: string; text: string; faktor: Faktor }[] = [
  { rubrik: 'Noggrannhet', text: 'Struktur och disciplin. Heter samvetsgrannhet i testet.', faktor: 'conscientiousness' },
  { rubrik: 'Extraversion', text: 'Social energi och initiativ. Heter utåtriktning i testet.', faktor: 'extraversion' },
  { rubrik: 'Känslostabilitet', text: 'Stresstålighet och lugn. Heter stabilitet i testet.', faktor: 'stability' },
  { rubrik: 'Vänlighet', text: 'Samarbete och tillit.', faktor: 'agreeableness' },
  { rubrik: 'Öppenhet', text: 'Kreativitet och nyfikenhet.', faktor: 'openness' },
]

// Förberedelserna och guidelänkarna flyttades hit från /artiklar/rekryteringstester-guide
// när artikeln slogs ihop med verktygssidan (301, 2026-09-23).
const FORBEREDELSE = [
  { rubrik: 'Öva på rätt testtyp', text: 'Ska du göra ett matristest, öva på matriser och inte på siffror. Det du tränar bort är ovanan vid formatet, grundförmågan höjer du sällan dramatiskt. Vet du inte vilket test som väntar, fråga rekryteraren innan du börjar öva.' },
  { rubrik: 'Träna under tidspress', text: 'Stressen är ofta en avsiktlig del av testet, för att likna verkliga arbetsförhållanden. Att öva i lugn och ro ger en falsk trygghet. Sätt en timer.' },
  { rubrik: 'Välj tillfälle och miljö', text: 'Oftast har du några dagar på dig. Gör testet när du är som skarpast, sitt ostört och stäng av notiserna på mobil och dator.' },
  { rubrik: 'Svara ärligt på personlighetsdelen', text: 'Personlighetstest har ofta en inbyggd indikator som flaggar inkonsekventa eller misstänkt perfekta svar. Testet mäter passning, inte kvalitet, och den som svarar sig in i fel roll vinner en arbetsplats där den trivs sämre.' },
  { rubrik: 'Reda ut frågorna i förväg', text: 'Vilken testtyp gäller, hur lång tid har du, krävs dator och stabil uppkoppling, och får du återkoppling efteråt? Den som frågar kommer till testet förberedd, inte överrumplad.' },
  { rubrik: 'Räkna med att det känns svårt', text: 'Ett bra test ska vara utmanande. Att du inte hinner med varenda fråga är ofta inbyggt i designen, inte ett tecken på att du misslyckats.' },
]

const GUIDER: { rubrik: string; text: string; href: string; glyf?: TestTyp }[] = [
  { rubrik: 'Logiska tester', text: 'Testtyperna, leverantörerna du möter i Sverige och vad forskningen säger om att öva.', href: '/artiklar/logiska-tester' },
  { rubrik: 'Matrislogik', glyf: 'matris', text: 'Regeltyperna bakom matriserna och lösta exempel steg för steg.', href: '/artiklar/matrislogik-test-guide' },
  { rubrik: 'Numeriska test', glyf: 'numeriskt', text: 'Tabelläsning, procent och huvudräkning som håller under tidspress.', href: '/artiklar/numeriskt-test-guide' },
  { rubrik: 'Verbala test', glyf: 'verbalt', text: 'Sant, falskt eller går ej att avgöra, och fällan som fäller flest.', href: '/artiklar/verbalt-test-guide' },
  { rubrik: 'I-provet', text: 'Mönstringen och polisens prövning: de sex deltesterna, kraven och en löst uppgift per deltest.', href: '/artiklar/i-prov' },
  { rubrik: 'Spatial förmåga', glyf: 'spatial', text: 'Rumsuppfattning: vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber, med lösta uppgifter.', href: '/artiklar/rotation-test-guide' },
  { rubrik: 'Talserier', glyf: 'talserier', text: 'Åtta regeltyper, differensraden och tjugo talserier med lösning.', href: '/artiklar/talserier' },
  { rubrik: 'Ordförståelse test', glyf: 'ordforrad', text: 'Synonymer och motsatsord, fällorna bland alternativen och tjugo ord med facit.', href: '/artiklar/ordforstaelse-test' },
  { rubrik: 'Personlighetstest', glyf: 'personlighet', text: 'Femfaktormodellen, vad dimensionerna betyder för olika roller och varför ärlighet lönar sig.', href: '/artiklar/personlighetstest-jobb-guide' },
  { rubrik: 'Deduktiva och induktiva test', glyf: 'deduktiv', text: 'Regel till slutsats eller exempel till regel. Fem deduktiva format med lösning och vilka tester Aon och SHL använder.', href: '/artiklar/deduktivt-induktivt-test' },
  { rubrik: 'Alva Labs logiktest', glyf: 'matris', text: 'Tjugo adaptiva matrisuppgifter med två minuter var, och hur skalan 1 till 10 ska läsas.', href: '/artiklar/alva-labs-logiktest' },
  { rubrik: 'MAP från Assessio', glyf: 'personlighet', text: 'Personlighetstestet med 200 påståenden: vad de fem faktorerna mäter och vad arbetsgivaren ser.', href: '/artiklar/map-test-personlighetstest' },
]

/** Glyfen för en testtyp, i ett eget spann (Nio-glyferna, inga egna ikoner). */
function Glyf({ typ, size = 22 }: { typ: TestTyp; size?: number }) {
  const G = TESTGLYFER[typ]
  return <G size={size} />
}

const PROV_GLYF: Partial<Record<ProvTyp, TestTyp>> = {
  matris: 'matris',
  figurserie: 'figurer',
  deduktiv: 'deduktiv',
  verbal: 'verbalt',
  numerisk: 'numeriskt',
  talserie: 'talserier',
  spatial: 'spatial',
  ordforrad: 'ordforrad',
}

/** Bocken och krysset i resultatbilderna (testets egna rätt- och felfärger). */
function Marke({ ratt }: { ratt: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={ratt ? 'rt-m-ratt' : 'rt-m-fel'}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d={ratt ? 'M7.2 12.4l3.2 3.2 6.4-7' : 'M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6'} stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RekryteringstesterSida() {
  const inforTestet = INFOR_TESTET.filter((g) => artikelFinns(g.slug))
  const fragor = faqMedMyndigheter(artikelFinns(MYNDIGHETER_SLUG))

  // Exempelprofilen genom tolkningen.
  const utfall = faktorUtfall(EXEMPEL_PROFIL)
  const utslag = utfall.filter((u) => u.band !== 'mid').slice(0, 2)
  const kravprofiler = ['Ledarskap och projektledning', 'Ekonomi och administration']
    .map((n) => KRAVPROFILER.find((k) => k.namn === n))
    .filter((k): k is (typeof KRAVPROFILER)[number] => Boolean(k))

  // Steg 3 och 4: talserien i ett nivåtest på grundnivån, uppgift 9 fel.
  const avTal = T.talserieGrund.fragor
  const felUppgifter = [4, 9, 13]

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Rekryteringstester',
    url: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
    description:
      'Träna på rekryteringstester och bygg din personlighetsprofil innan arbetsgivaren testar dig. Matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang, talserier, spatial förmåga, ordförråd, ett övningsprov inför I-provet och Big Five-baserad personlighetsanalys.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Fem uppgifter utan konto, ett grundnivåtest om dagen i alla testtyper med gratiskonto, utan kortuppgift',
    },
    featureList:
      `Matrislogik i rutnät om tre gånger tre med former, teckengrupper, streckfigurer och klockor, figurserier med pilar, former och klockor med två visare, deduktiv slutledning med villkorskedjor, syllogismer, sanningssägare och lögnare, tabellpussel och ordningsuppgifter samt övningsprov i SHL:s antal uppgifter och tid, verbalt resonemang med sant, falskt eller går inte att avgöra, numeriskt resonemang med tabeller och procent, talserier med en eller två luckor, spatial förmåga med vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber, ordförråd med synonymer och motsatsord, övningsprov inför I-provet med de sex deltesterna i provets ordning, personlighetsprofil enligt Big Five med ${T.personlighetGrund.fragor} eller ${T.personlighetFordjupad.fragor} påståenden, resultat och tid direkt efter varje test, genomgång uppgift för uppgift med rätt svar, träning utan tak med ${paketNamn(SALD_PLAN)}`,
  }

  // Stegens namn är de synliga h3:orna och texten deras brödtext.
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så tränar du på rekryteringstester med Jobbcoach.ai',
    description:
      'Fyra steg från val av test till färdig rapport: välj test, lös uppgifterna i din takt, se resultat och tid direkt och se vad du missade.',
    totalTime: 'PT' + T.matrisGrund.minuter + 'M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: STEG.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.rubrik,
      text: s.text,
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fragor.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Produktfilmen i Så fungerar det (ägarens beslut 2026-10-13). uploadDate är
  // första publiceringen och ändras aldrig i efterhand.
  const videoSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Så tränar du på rekryteringstester hos Jobbcoach.ai',
    description:
      'Tjugo sekunder om hur träningen ser ut: logiktest, verbalt resonemang och numeriskt test i samma format som det riktiga testet, resultatet med din nivå direkt, regeln bakom varje fråga, nivåkurvan fram till provdagen och övningsprovet mot klockan.',
    thumbnailUrl: ['https://www.jobbcoach.ai/videos/tester-v3-169-affisch.webp'],
    uploadDate: '2026-10-14T09:00:00+02:00',
    duration: 'PT20S',
    inLanguage: 'sv',
    contentUrl: 'https://www.jobbcoach.ai/videos/tester-v3-169.mp4',
    transcript:
      'Kallad till ett rekryteringstest? Logiktest. Samma format som det riktiga testet. Verbalt resonemang. Numeriskt test. Rätt, fel och nivå direkt. Och regeln bakom varje fråga. Din nivå fram till provdagen. Och övningsprov mot klockan. Träna nu. Kom förberedd sen. Starta gratis test.',
    publisher: { '@type': 'Organization', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai' },
  }

  return (
    <>
      <RedirectLoggedIn to="/dashboard/tester" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />

      <Sida farg="tran" id="innehall" className="rt-sida">
        {/* 1. Hjälten: uppgiften i ramen, resultatet och förklaringen svävar över */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Rekryteringstester', href: '/verktyg/rekryteringstester' },
          ]}
          etikett="Rekryteringstester, kom förberedd till provet"
          h1="Träna på rekryteringstester innan arbetsgivaren testar dig"
          varde={
            <>
              Matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang i samma format som SHL, Aon och Assessio
              använder, och talserier, spatial förmåga och ordförråd inför I-provet.{' '}
              <b>Fem uppgifter gratis här, {GRUNDNIVAN_ALLA_DAG}, gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje test.</b>
            </>
          }
          knappar={
            <>
              <Knapp href={PROVA} pil data-cta="hero-primary">
                Starta gratis test
              </Knapp>
              <TextLank href="#testtyper">Se alla tester</TextLank>
            </>
          }
          brickor={[
            { tal: String(ANTAL_TESTTYPER), text: 'testtyper, grundnivån gratis, ett test om dagen' },
            { tal: `${T.matrisGrund.minuter} min`, text: 'per test' },
            { tal: String(PROV_N), text: 'uppgifter att prova utan konto' },
          ]}
          bild={
            <div className="rt-hbild">
              <div aria-hidden="true">
                <Svav className="rt-res" stor={`12 av ${T.matrisGrund.fragor}`} under="rätt på grundnivån" gungar />
              </div>
              <Testram uppgift={9} av={T.matrisGrund.fragor} />
              <div aria-hidden="true">
                <Svav className="rt-regel" gungar sen>
                  <em>Förklaringen</em>
                  <b>Tecknet inuti är detsamma längs hela raden. Formen står en gång per rad.</b>
                </Svav>
              </div>
            </div>
          }
          lyft
        />

        {/* 2. Provet utan konto: typvalet startar provet med vald typ */}
        <Lyft id="prova" etikett="Prova utan konto">
          <div className="rt-prov">
            <div>
              <p className="p3-ey">Prova utan konto</p>
              <h2 className="p3-h2">Gör ett prov direkt, utan konto</h2>
              <p className="p3-varde">Du behöver inte registrera dig för att se var du står. Fem uppgifter tar ett par minuter.</p>
              <ProvVal
                action={PROVA}
                ikoner={Object.fromEntries(Object.entries(PROV_GLYF).map(([k, g]) => [k, <Glyf key={k} typ={g as TestTyp} />]))}
                knapp={
                  <Knapp som="knapp" type="submit" pil data-cta="rekryteringstester-prova">
                    Starta provet
                  </Knapp>
                }
                not="Ingen inloggning, inget kort"
              />
            </div>
            <div className="rt-provres">
              <div role="img" aria-label="Exempel: resultatet efter provet, 3 av 5 rätt och förklaringen till en av uppgifterna">
                <p className="p3-ey">Det här ser du efteråt</p>
                <p className="rt-provres-tal">
                  3 av {PROV_N}
                  <small>rätt</small>
                </p>
                <div className="rt-fem">
                  {[true, false, true, true, false].map((r, i) => (
                    <span key={i}>
                      <Marke ratt={r} />
                      {i + 1}
                    </span>
                  ))}
                </div>
                <div className="p3-tdom p3-fel rt-oppet">
                  <div className="p3-tdom-rad">
                    <Marke ratt={false} />
                    Din första miss, uppgift 2
                  </div>
                  <div className="p3-tdom-kropp">
                    <em>Regeln</em>
                    <b>Tecknet inuti är detsamma längs hela raden. Formen står en gång per rad.</b>
                    <p>Du valde B. Rätt svar är C.</p>
                  </div>
                </div>
                <p className="rt-las">
                  <Ikon namn="las" />
                  Förklaringen till uppgift 5 väntar i ett gratiskonto.
                </p>
              </div>
              <Bocklista
                punkter={['Samma typ av uppgifter som i de skarpa testen', 'Resultatet direkt, utan klocka', 'Rätt svar och regeln bakom en av uppgifterna']}
              />
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det: filmen och de fyra skärmarna */}
        <Sektion id="sa-funkar-det">
          <div className="rt-topprad">
            <SektionHuvud
              etikett="Från första uppgiften till genomgången"
              rubrik="Så fungerar det"
              varde="Från första uppgiften till färdig rapport. Ingen registrering innan du provar, du börjar inom 30 sekunder. Alla tester går till på samma sätt: en startskärm som säger vad som gäller, uppgifterna med klocka och framstegsstapel, och ett resultat där varje uppgift går att öppna."
            >
              <Knapprad>
                <Knapp href={PROVA} variant="vit">
                  Starta gratis test
                </Knapp>
              </Knapprad>
            </SektionHuvud>
            <div className="rt-film">
              <Produktfilm page="/verktyg/rekryteringstester" position="sa_fungerar" knappHref={PROVA} />
            </div>
          </div>

          <ol className="rt-skarmar">
            <li className="rt-skarm">
              <div className="rt-skarm-text">
                <Nr>1</Nr>
                <h3 className="p3-h3">{STEG[0].rubrik}</h3>
                <p>{STEG[0].text}</p>
              </div>
              <div className="rt-skarm-yta" role="img" aria-label="Exempel: startskärmen före ett test i talserier">
                <div className="rt-skv">
                  <p className="rt-skv-topp">
                    <i>
                      <Ikon namn="tillbaka" />
                    </i>
                    Nivåtest
                  </p>
                  <p className="rt-skv-ey">Talserier</p>
                  <p className="rt-skv-h">Talserier, grundnivå</p>
                  <ul className="rt-skv-regler">
                    <li>
                      <i>{avTal}</i>
                      <span>
                        {avTal} uppgifter. Provets tid är {T.talserieGrund.minuter} minuter, klockan stoppar dig inte.
                        <small>Tiden över syns i resultatet.</small>
                      </span>
                    </li>
                    <li>
                      <i>
                        <Ikon namn="bock" />
                      </i>
                      <span>
                        Rätt svar efteråt, med genomgång.
                        <small>Du kan gå tillbaka och ändra svar tills du lämnar in.</small>
                      </span>
                    </li>
                    <li>
                      <i>
                        <Ikon namn="upp" />
                      </i>
                      <span>Resultatet syns i Din utveckling.</span>
                    </li>
                  </ul>
                </div>
                <div className="rt-skv-kort">
                  <Knapp som="bild" bred>
                    Starta testet
                  </Knapp>
                  <small>Ett grundnivåtest om dagen ingår gratis, valfri testtyp.</small>
                </div>
              </div>
            </li>

            <li className="rt-skarm">
              <div className="rt-skarm-text">
                <Nr>2</Nr>
                <h3 className="p3-h3">{STEG[1].rubrik}</h3>
                <p>{STEG[1].text}</p>
              </div>
              <div className="rt-skarm-yta">
                <Testram
                  test="Talserier"
                  niva="Nivåtest, grundnivå"
                  uppgift={9}
                  av={avTal}
                  tid="5:26"
                  brade={talBrade(TALSERIE.visade)}
                  bradeKolumner={TALSERIE.visade.length + 1}
                  fraga="Vilket tal kommer härnäst?"
                  svar={textSvar(TALSERIE.svar, TALSERIE.valt)}
                  svarKolumner={3}
                  className="rt-liten"
                />
              </div>
            </li>

            <li className="rt-skarm">
              <div className="rt-skarm-text">
                <Nr>3</Nr>
                <h3 className="p3-h3">{STEG[2].rubrik}</h3>
                <p>{STEG[2].text}</p>
              </div>
              <div className="rt-skarm-yta" role="img" aria-label={`Exempel: resultatet, 12 av ${avTal} rätt i talserier`}>
                <div className="rt-skv">
                  <p className="rt-skv-topp">
                    <i>
                      <Ikon namn="x" />
                    </i>
                    Talserier, grundnivå
                  </p>
                  <p className="rt-skv-ey">Nivåtestet klart</p>
                  <p className="rt-skv-h rt-skv-stor">12 av {avTal} rätt</p>
                  <div className="rt-skv-stat">
                    <div>
                      <b>10:48</b>
                      <span>inom provets tid, {T.talserieGrund.minuter} minuter</span>
                    </div>
                    <div>
                      <b>43 s</b>
                      <span>per uppgift</span>
                    </div>
                  </div>
                  <div className="rt-skv-panel">
                    <b>Uppgifterna</b>
                    <div className="p3-tbitar rt-bitar">
                      {Array.from({ length: avTal }, (_, i) => (
                        <i key={i} className={felUppgifter.includes(i + 1) ? 'p3-f' : 'p3-r'} />
                      ))}
                    </div>
                    <div className="rt-skv-miss">
                      <i>9</i>
                      <div>
                        <b>Det du missade: uppgift 9</b>
                        <span>{TALSERIE.regel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li className="rt-skarm">
              <div className="rt-skarm-text">
                <Nr typ="koppar">4</Nr>
                <h3 className="p3-h3">{STEG[3].rubrik}</h3>
                <p>{STEG[3].text}</p>
              </div>
              <div className="rt-skarm-yta" role="img" aria-label="Exempel: uppgiftslistan med förklaringen till en miss">
                <div className="rt-lista">
                  <p className="rt-lista-huvud">
                    {avTal} uppgifter, tre fel
                    <span>
                      <i>Alla</i>
                      <i className="rt-pa">Bara fel</i>
                    </span>
                  </p>
                  <p className="rt-lrad">
                    <b>4</b>
                    <Marke ratt={false} />
                    <span>A, rätt D</span>
                    <small>58 s</small>
                  </p>
                  <p className="rt-lrad rt-oppen">
                    <b>9</b>
                    <Marke ratt={false} />
                    <span>
                      {'ABCDE'[TALSERIE.valt]}, rätt {'ABCDE'[TALSERIE.ratt]}
                    </span>
                    <small>52 s</small>
                  </p>
                  <div className="p3-tdom p3-fel">
                    <div className="p3-tdom-rad">
                      <Marke ratt={false} />
                      Inte den här
                    </div>
                    <div className="p3-tdom-kropp">
                      <em>Förklaringen</em>
                      <b>{TALSERIE.regel}</b>
                      <p>
                        {TALSERIE.visade.join(', ')}, och nästa tal är {TALSERIE.svar[TALSERIE.ratt]}.
                      </p>
                      <em>Ditt misstag</em>
                      <p>{TALSERIE.misstag}</p>
                    </div>
                  </div>
                  <p className="rt-lrad">
                    <b>13</b>
                    <Marke ratt={false} />
                    <span>D, rätt A</span>
                    <small>71 s</small>
                  </p>
                </div>
              </div>
            </li>
          </ol>
        </Sektion>

        {/* 4. Sex färdigheter */}
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Vad du tränar på"
            rubrik="Sex färdigheter som avgör testet"
            varde="Det här är vad arbetsgivaren faktiskt mäter. Träna upp dem innan du sätter dig framför det skarpa testet."
          />
          <Rutnat kolumner={3} className="rt-fard">
            {FARDIGHETER.map((f) => (
              <Kort key={f.rubrik}>
                <div className="rt-fbild" aria-hidden="true">
                  <FardighetBild bild={f.bild} />
                </div>
                <h3 className="p3-h3">{f.rubrik}</h3>
                <p>{f.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 5. Åtta testtyper med en riktig uppgift var */}
        <Sektion id="testtyper">
          <SektionHuvud
            etikett="Kognitiva tester"
            rubrik="Åtta testtyper, alla gratis att börja"
            varde={
              <>
                Med ett gratiskonto gör du ett grundnivåtest om dagen, i vilken av de åtta testtyperna du vill, med full genomgång efteråt.
                Resultatet är ditt. Grundnivån visar var du står i varje typ. Att träna vidare på din nivå, med avancerad nivå, expertnivå
                och övningsprov mot klockan, ingår i <b>{PREMIUM}, <MedKampanjPris text={PRIS} /></b>. Säg upp när du vill.
              </>
            }
          />
          <ul className="rt-nivaer" aria-label="Tre nivåer">
            {[
              { namn: 'Grundnivå', text: 'Ett test om dagen, valfri testtyp', steg: 1, gratis: true },
              { namn: 'Avancerad nivå', text: 'Svårare uppgifter, samma format', steg: 2, gratis: false },
              { namn: 'Expertnivå', text: 'Och övningsprov mot klockan', steg: 3, gratis: false },
            ].map((n) => (
              <li key={n.namn}>
                <span className="rt-trappa" aria-hidden="true">
                  {[1, 2, 3].map((s) => (
                    <i key={s} className={s <= n.steg ? 'rt-pa' : undefined} style={{ height: s * 10 }} />
                  ))}
                </span>
                <span>
                  <b>{n.namn}</b>
                  <span>{n.text}</span>
                </span>
                <Chip typ={n.gratis ? 'gratis' : 'premium'}>{n.gratis ? 'Gratis' : 'Premium'}</Chip>
              </li>
            ))}
          </ul>
          <div className="rt-typer">
            {TESTTYPER.map((t) => (
              <article className="rt-typ" key={t.rubrik}>
                <div className="rt-typ-yta">{t.uppgift}</div>
                <div className="rt-typ-text">
                  <h3 className="p3-h3">
                    <span className="p3-dorr" aria-hidden="true">
                      <Glyf typ={t.glyf} size={22} />
                    </span>
                    {t.rubrik}
                  </h3>
                  <p>{t.text}</p>
                  <ul className="rt-typ-niva">
                    {t.fakta.map((f) => (
                      <li key={f.niva}>
                        <Chip typ={f.gratis ? 'gratis' : 'premium'}>{f.niva}</Chip>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <Knapprad className="rt-mt">
            <Knapp href={PROVA} pil>
              Starta gratis test
            </Knapp>
          </Knapprad>
        </Sektion>

        {/* 5b. Vilket test ska du göra? De åtta valen i Mitt test, publikt (SEO-planen U2). */}
        <Sektion id="vilket-test" botten="papper">
          <SektionHuvud
            etikett="Mitt test är …"
            rubrik="Vilket test ska du göra?"
            varde="Välj testet i inbjudan eller prövningen du ska göra. Varje val har en guide till formatet och en väg in i övningen."
          />
          <div className="rt-inbj">
            {VAL.map((v) => (
              <article key={v.rubrik}>
                <h3 className="p3-h3">{v.rubrik}</h3>
                <p className="rt-bestar" aria-hidden="true">
                  {v.bestar.map((b) => (
                    <span key={b.text}>
                      {b.glyf ? <Glyf typ={b.glyf} size={16} /> : null}
                      {b.text}
                    </span>
                  ))}
                </p>
                <p>{v.text}</p>
                <div className="rt-gor">
                  <MattLank
                    className="p3-lank"
                    href={v.artikel.href}
                    handelse="article_cta_clicked"
                    egenskaper={{ cluster: 'test', position: 'inline', variant: `hub-val-artikel-${v.val}`, target: v.artikel.href }}
                  >
                    {v.artikel.text}
                  </MattLank>
                  <MattLank
                    className={knappKlass({ variant: 'vit', liten: true, className: 'rt-provknapp' })}
                    href={v.prov.href}
                    handelse="article_cta_clicked"
                    egenskaper={{ cluster: 'test', position: 'inline', variant: `hub-val-prov-${v.val}`, target: v.prov.href }}
                  >
                    {v.prov.text}
                  </MattLank>
                </div>
              </article>
            ))}
          </div>
        </Sektion>

        {/* 6. Personligheten: ön med profilen, kravprofilerna och intervjufrågorna */}
        <Sektion id="personlighet">
          <article className="p3-o p3-med-bild rt-pers">
            <div className="p3-o-rad">
              <div className="p3-o-text">
                <div className="p3-o-huvud">
                  <Dorr ikon="tran" />
                  <p className="p3-ey">Personlighetsprofil</p>
                </div>
                <h2 className="p3-h2">Ta reda på vad rekryteraren ser i dig</h2>
                <p className="p3-varde">
                  De flesta arbetsgivare utgår från Big Five när de mäter personlighet i rekrytering. Bygg din egen profil och se var du
                  hamnar på de fem dimensionerna. Det finns inga rätta svar, och resultatet kan du använda inför intervjun.
                </p>
                <p>
                  Resultatet är mer än fem staplar. Du ser vad rekryteraren lägger märke till först, hur profilen läses mot sex vanliga
                  kravprofiler, vilka frågor du lär få på intervjun och hur du kan svara. Varje dimension får sina styrkor, det att vara
                  medveten om och var du kommer till din rätt i arbetslivet.
                </p>
                <ul className="rt-tretest" aria-label="Tre nivåer av personlighetstestet">
                  <li>
                    <b>{T.personlighetProv}</b>
                    <div>
                      <strong>Provet, utan konto</strong>
                      Påståenden på två minuter. Profilen direkt, med en rad per dimension om hur rekryteraren läser den.
                    </div>
                  </li>
                  <li>
                    <b>{T.personlighetGrund.fragor}</b>
                    <div>
                      <strong>Hela testet, gratis med konto</strong>
                      Påståenden på {T.personlighetGrund.minuter} minuter. Kravprofilerna, styrkorna och det du kan säga på intervjun.
                    </div>
                  </li>
                  <li>
                    <b>{T.personlighetFordjupad.fragor}</b>
                    <div>
                      <strong>Fördjupade testet, i {PREMIUM}</strong>
                      Påståenden på {T.personlighetFordjupad.minuter} minuter, 30 delfaktorer. Din arbetsstil och frågorna rekryteraren får
                      som intervjuguide, att öva på.
                    </div>
                  </li>
                </ul>
                <div className="p3-knapprad">
                  <Knapp href="/verktyg/personlighetstest">Gör provet utan konto</Knapp>
                  <span className="p3-liten">Tjugo påståenden, två minuter. Hela testet gratis med konto.</span>
                </div>
              </div>
              <div className="p3-o-bild">
                <div className="rt-profil">
                  <p className="rt-profil-ey">Din profil, exempel</p>
                  <p className="rt-profil-mening">{profilMening(EXEMPEL_PROFIL)}</p>
                  <ul aria-label="De fem dimensionerna i Big Five">
                    {BIG_FIVE.map((d) => {
                      const p = visadPoang(EXEMPEL_PROFIL, d.faktor)
                      const seg = segment(p)
                      return (
                        <li key={d.rubrik} className="rt-faktor">
                          <div>
                            <h3>{d.rubrik}</h3>
                            <p>{d.text}</p>
                          </div>
                          <span className="p3-chip" aria-hidden="true">
                            {bandOrd(bandFor(p))}
                          </span>
                          <span className="rt-skala" aria-hidden="true">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i key={s} className={s < seg ? 'rt-pa' : s === seg ? 'rt-nu' : undefined} />
                            ))}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="rt-lasmot">
              <div className="rt-papper">
                <p className="rt-papper-ey">Så läses profilen mot kravprofiler, exempel</p>
                {kravprofiler.map((k) => {
                  const ut = kravUtfall(EXEMPEL_PROFIL, k)
                  return (
                    <div className="rt-kravrad" key={k.namn}>
                      <b>{k.namn}</b>
                      <Chip typ={ut === 'Passar profilen' ? 'gratis' : 'koppar'}>{ut}</Chip>
                      <small>Väger tungt: {k.vagerTungt}.</small>
                    </div>
                  )
                })}
              </div>
              <div className="rt-papper">
                <p className="rt-papper-ey">Frågor rekryteraren lär ställa, exempel</p>
                {utslag.map((u) => (
                  <div className="rt-ifraga" key={u.key}>
                    <b>{u.lasning}</b>
                    {/* Intervjurådet hör till tolkningen i gratiskontot, som på personlighetstestet (P5a). */}
                    <span>Så kan du svara: rådet står i tolkningen när du har sparat profilen med ett gratiskonto.</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </Sektion>

        {/* 7. Vad som ingår */}
        <Sektion luft="utan-topp">
          <SektionHuvud etikett="Vad som ingår" rubrik="Träning som syns på resultatet" />
          <div className="rt-tva">
            <div className="rt-kurvkort">
              <div aria-hidden="true">
                <p className="p3-ey">Din utveckling, exempel</p>
                <p className="rt-kurv-rad">Nivån i talserier över tre veckor</p>
                <svg viewBox="0 0 400 150" fill="none" className="rt-kurva">
                  <path d="M0 130h400M0 90h400M0 50h400" className="rt-kurva-linje" strokeWidth="1.5" />
                  <path d="M10 118C60 116 70 100 110 96s50-6 90-22 60-10 90-26 60-14 100-22V150H10z" className="rt-kurva-yta" />
                  <path d="M10 118C60 116 70 100 110 96s50-6 90-22 60-10 90-26 60-14 100-22" className="rt-kurva-streck" strokeWidth="3.5" strokeLinecap="round" />
                  {[
                    [10, 118],
                    [110, 96],
                    [200, 74],
                    [290, 48],
                  ].map(([x, y]) => (
                    <circle key={x} cx={x} cy={y} r="6" className="rt-kurva-punkt" strokeWidth="3" />
                  ))}
                  <circle cx="390" cy="26" r="9" className="rt-kurva-nu" strokeWidth="3" />
                </svg>
              </div>
              <Bankbredd form="rad" yta="vagg" text="Nivån räknas bara på uppgifter du inte sett den senaste månaden." />
            </div>
            <div className="rt-trekort">
              <Kort>
                <h3 className="p3-h3">Gratis att prova</h3>
                <p>Fem uppgifter här, utan konto, med resultatet direkt. Med kontot gör du {GRUNDNIVAN_ALLA_DAG}, gratis. Ingen kortuppgift.</p>
              </Kort>
              <Kort>
                <h3 className="p3-h3">Rapport efter varje test</h3>
                <p>Resultat, tid och en genomgång uppgift för uppgift med rätt svar.</p>
              </Kort>
              <Kort ton>
                <h3 className="p3-h3">{PREMIUM} tar bort taket</h3>
                <p>
                  Alla nivåer, träning på din nivå utan tak, övningsprov mot klockan, det fördjupade personlighetstestet och hela din historik,{' '}
                  <MedKampanjPris text={PRIS} />.
                </p>
                <p>
                  <TextLank href="/priser">Se vad som ingår i {PREMIUM}</TextLank>
                </p>
              </Kort>
            </div>
          </div>
        </Sektion>

        {/* 8. Förbered dig: TRR-talen som staplar, råden som kort */}
        <Sektion botten="ton" id="forbered-dig">
          <SektionHuvud
            etikett="Inför testdagen"
            rubrik="Så förbereder du dig inför ett rekryteringstest"
            varde="Test har blivit standard. Enligt en TRR-undersökning bland tjänstemän som nyligen bytt jobb ökade andelen som fått göra test från 58 procent 2019 till 67 procent 2022, och tidningen Ingenjören rapporterar att två till tre timmars övning kan höja resultatet med upp till 20 procent. Så lägger du de timmarna rätt."
          />
          <div className="rt-forb">
            <div className="rt-statkort">
              <p className="p3-ey">Andel som fått göra test</p>
              <div className="rt-staplar" role="img" aria-label="58 procent 2019 och 67 procent 2022">
                <div>
                  <i style={{ height: 116 }}>58 %</i>
                  <span>2019</span>
                </div>
                <div>
                  <i className="rt-nu" style={{ height: 134 }}>
                    67 %
                  </i>
                  <span>2022</span>
                </div>
              </div>
              <p className="p3-liten">TRR-undersökning bland tjänstemän som nyligen bytt jobb.</p>
              <div className="rt-tjugo" aria-hidden="true">
                <b>Upp till 20 %</b>
                <span>Så mycket kan två till tre timmars övning höja resultatet, enligt tidningen Ingenjören.</span>
              </div>
            </div>
            <ol className="rt-tips">
              {FORBEREDELSE.map((f, i) => (
                <li key={f.rubrik}>
                  <Nr>{i + 1}</Nr>
                  <h3 className="p3-h3">{f.rubrik}</h3>
                  <p>{f.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Sektion>

        {/* 8b. Inför testet: tre guider, bara de som finns i bygget (U15). */}
        {inforTestet.length ? (
          <Sektion id="infor-testet">
            <SektionHuvud
              etikett={inforTestet.length === 1 ? 'En guide' : inforTestet.length === 2 ? 'Två guider' : 'Tre guider'}
              rubrik="Inför testet"
              varde={
                <>
                  Vet du vilket test som väntar, eller står det bara ”test” i inbjudan?{' '}
                  {inforTestet.length === 3 ? 'De här tre guiderna' : 'Guiderna här'} tar dig från inbjudan till resultatet.
                </>
              }
            />
            <Rutnat kolumner={3} className="rt-guide3">
              {inforTestet.map((g) => (
                <Kort key={g.slug}>
                  <div className="rt-gbild" aria-hidden="true">
                    {g.variant === 'tips' ? (
                      <span className="rt-vecka">
                        {['mån', 'tis', 'ons', 'tor', 'fre', 'lör'].map((d, i) => (
                          <i key={d} className={i < 3 ? 'rt-ok' : undefined}>
                            {d}
                          </i>
                        ))}
                        <i className="rt-dag">test</i>
                      </span>
                    ) : g.variant === 'resultat' ? (
                      <span className="rt-stanine">
                        {[22, 36, 60, 84, 100, 84, 60, 36, 22].map((h, i) => (
                          <i key={i} className={i === 3 ? 'rt-nu' : undefined} style={{ height: `${h}%` }}>
                            {i + 1}
                          </i>
                        ))}
                      </span>
                    ) : (
                      <span className="rt-mynd">
                        {['Skatteverket', 'Kronofogden', 'Försäkringskassan', 'Säkerhetspolisen', 'Tullverket', '+4'].map((m) => (
                          <span key={m}>{m}</span>
                        ))}
                      </span>
                    )}
                  </div>
                  <h3 className="p3-h3">{g.rubrik}</h3>
                  <p>{g.text}</p>
                  <p>
                    <MattLank
                      className="p3-lank"
                      href={`/artiklar/${g.slug}`}
                      handelse="article_cta_clicked"
                      egenskaper={{ cluster: 'test', position: 'inline', variant: `hub-infor-${g.variant}`, target: `/artiklar/${g.slug}` }}
                    >
                      {g.rubrik}
                    </MattLank>
                  </p>
                </Kort>
              ))}
            </Rutnat>
            {/* Vägen tillbaka till provet, mätt för sig (säljgranskningen 14 nov). */}
            <Knapprad className="rt-mt">
              <MattLank
                className={knappKlass({ variant: 'vit' })}
                href={PROVA}
                handelse="article_cta_clicked"
                egenskaper={{ cluster: 'test', position: 'inline', variant: 'hub-infor-prov', target: PROVA }}
              >
                Prova fem uppgifter utan konto
              </MattLank>
            </Knapprad>
          </Sektion>
        ) : null}

        {/* 9. Guiderna, synliga utan klick */}
        <Sektion id="guider" botten="papper">
          <SektionHuvud
            etikett="Fördjupning"
            rubrik="Guider per testtyp"
            varde="Vill du förstå ett test på djupet innan du övar har vi en guide till varje testtyp, med exempel och de vanligaste fällorna."
          />
          <Rutnat kolumner={3}>
            {GUIDER.map((g) => (
              <a key={g.href} href={g.href} className="p3-lankbricka rt-guide">
                <span className="p3-dorr" aria-hidden="true">
                  {g.glyf ? <Glyf typ={g.glyf} size={22} /> : <Ikon namn="tran" />}
                </span>
                <h3>{g.rubrik}</h3>
                <span>{g.text}</span>
              </a>
            ))}
          </Rutnat>
        </Sektion>

        {/* 10. Premium-avslutet */}
        <Sektion>
          <PremiumO
            etikett={
              <>
                {paketNamn(SALD_PLAN)}, <MedKampanjPris text={PRIS} />
              </>
            }
            rubrik="Träna nu. Kom förberedd sen."
            text={`${PROV_RAD} Avancerad och expertnivå, övningsprov mot klockan och din utveckling över tid ingår i ${PREMIUM}.`}
            uppsagning
            knapp={{ text: 'Starta gratis test', href: PROVA }}
            punkter={[
              'Avancerad nivå och expertnivå',
              'Övningsprov mot klockan, i provens format',
              `Det fördjupade personlighetstestet, ${T.personlighetFordjupad.fragor} påståenden`,
              'Din utveckling över tid och hela historiken',
            ]}
          >
            <p className="rt-premlank">
              <TextLank href="#sa-funkar-det">Se hur det fungerar</TextLank>
            </p>
          </PremiumO>
        </Sektion>

        {/* 11. Frågorna */}
        <Sektion id="fragor" luft="utan-topp">
          <Faq
            rubrik="Vanliga frågor om rekryteringstester"
            ingress={
              <>
                Hittar du inte svaret? <a className="p3-lank" href="mailto:support@jobbcoach.ai">Hör av dig</a>.
              </>
            }
            fragor={fragor}
            efter={
              <Knapp href={PROVA} pil>
                Starta gratis test
              </Knapp>
            }
          />
        </Sektion>
      </Sida>
    </>
  )
}
