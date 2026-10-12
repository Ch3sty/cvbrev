/**
 * /verktyg/rekryteringstester, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.3, skissen v4 flik #tester).
 *
 * Hjälten på indigo vägg med expertfrågan i telefonen, prova-kortet först i
 * mobilordningen, Så fungerar det med resultatvyn, färdigheterna, testtyperna
 * med tal ur testConfig, personligheten på plommon vägg med två telefoner,
 * förberedelserna, guiderna, Premium på bläck och frågorna.
 *
 * SEO: h1, metadata och alla h2/h3 i baslinjen (bilaga A) står kvar med samma
 * text och nivå. Schemat (WebApplication, HowTo, FAQPage) är oförändrat utom
 * FAQ-svaren om verbalt och numeriskt, som nu läser testConfig (ägarens beslut 1).
 * Serverkomponent; klient-JS bara för FastKnapprad och prova-kortets mätning.
 */
import Link from 'next/link'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { REKRYTERINGSTESTER_FAQ_ITEMS } from './components/rekryteringstester-faq-data'
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import PubliktSida from '@/components/publikt/PubliktSida'
import Hjalte from '@/components/publikt/Hjalte'
import Rum from '@/components/publikt/Rum'
import ProvaKort from '@/components/publikt/ProvaKort'
import Steg from '@/components/publikt/Steg'
import Objekt, { type ObjektTyp } from '@/components/publikt/Objekt'
import LankLista from '@/components/publikt/LankLista'
import Faq from '@/components/publikt/Faq'
import PremiumBlock, { PremiumOrd } from '@/components/publikt/PremiumBlock'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import MattLank from '@/components/publikt/MattLank'
import SvavandeObjekt from '@/components/publikt/SvavandeObjekt'
import { MatrisBricka } from '@/components/publikt/MatrisExpert'
import { TESTTAL } from '@/components/publikt/testtal'
import SkarmMatris from '@/components/publikt/telefon/skarmar/SkarmMatris'
import SkarmNivakoll from '@/components/publikt/telefon/skarmar/SkarmNivakoll'
import SkarmPersonlighet from '@/components/publikt/telefon/skarmar/SkarmPersonlighet'
import SkarmIntervjufragor from '@/components/publikt/telefon/skarmar/SkarmIntervjufragor'

const PROVA = '/verktyg/rekryteringstester/prova'
const PREMIUM = paketKort()
const PRIS = prisPeriod(SALD_PLAN)
const T = TESTTAL

const STEG = [
  { rubrik: 'Välj test', text: 'Plocka matrislogik, verbalt eller numeriskt. Med ett gratiskonto gör du en nivåkoll med genomgång och ett första träningspass.' },
  { rubrik: 'Lös frågorna i din takt', text: 'Timern räknar uppåt så att du ser tempot, men ingenting bryter mitt i en fråga. Markera ditt svar och gå vidare.' },
  { rubrik: 'Se resultat och tid direkt', text: 'När du svarat klart ser du andel rätt, antal korrekta svar, total tid och snittid per fråga. Du väntar inte på något.' },
  { rubrik: 'Se vad du missade', text: 'Fråga för fråga jämför du ditt svar med facit. Du ser vilka mönster du missade och vet vad du ska träna mer på.' },
]

const FARDIGHETER: { rubrik: string; text: string; objekt: ObjektTyp }[] = [
  { objekt: 'monster', rubrik: 'Mönsterigenkänning', text: 'Hitta progressioner, rotationer och mängdoperationer i abstrakta former. Det är den förmåga matrislogik mäter, och den blir tydligt bättre med repetition.' },
  { objekt: 'logik', rubrik: 'Logiskt tänkande', text: 'Dra slutsatser från regler du själv har hittat. Rekryteringstester belönar den som tänker steg för steg, inte den som chansar.' },
  { objekt: 'lasning', rubrik: 'Läsförståelse', text: 'Plocka ut vad texten faktiskt säger, inte vad du tror att den säger. Där går gränsen mellan rätt och fel i verbalt resonemang.' },
  { objekt: 'kritiskt', rubrik: 'Kritiskt tänkande', text: 'Skilj på vad ett påstående bevisar och vad det bara antyder. Testerna har ofta tre svarsalternativ, sant, falskt och går inte att avgöra, just för att fånga förhastade slutsatser.' },
  { objekt: 'rakna', rubrik: 'Snabbräkning', text: 'Räkna procent, kvoter och skillnader i huvudet eller på papper. Du behöver ingen avancerad matematik, men du måste hinna räkna utan att tappa precisionen.' },
  { objekt: 'tabell', rubrik: 'Tabelltolkning', text: 'Hitta rätt cell snabbt i en tabell med fem rader och fyra kolumner. Den som läser av tabellen smart får mer tid över till själva räknandet.' },
]

const TESTTYPER: {
  rubrik: string
  text: string
  bild: 'matris' | 'verbal' | 'numerisk'
  fakta: { niva: string; text: string }[]
}[] = [
  {
    rubrik: 'Matrislogik',
    bild: 'matris',
    text: 'Hitta mönstret i en 3×3-matris med abstrakta former. Tränar mönsterigenkänning och logiskt tänkande i samma format som SHL Inductive Reasoning och Cut-e Scales.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.matrisGrund.fragor} frågor, cirka ${T.matrisGrund.minuter} minuter` },
      { niva: 'Avancerad nivå', text: `${T.matrisAvancerad.fragor} frågor, cirka ${T.matrisAvancerad.minuter} minuter` },
    ],
  },
  {
    rubrik: 'Verbalt resonemang',
    bild: 'verbal',
    text: 'Läs en kort text och avgör om ett påstående är sant, falskt eller inte går att avgöra. Tränar läsförståelse och kritiskt tänkande utan att förkunskaper spelar in.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.verbalGrund.fragor} påståenden, cirka ${T.verbalGrund.minuter} minuter` },
      { niva: 'Avancerad nivå', text: `${T.verbalAvancerad.fragor} påståenden, cirka ${T.verbalAvancerad.minuter} minuter` },
    ],
  },
  {
    rubrik: 'Numeriskt resonemang',
    bild: 'numerisk',
    text: 'Tolka tabeller och diagram med ekonomiska siffror och svara på frågor om procent och beräkningar. Tränar tabelltolkning och snabbräkning under tidspress.',
    fakta: [
      { niva: 'Grundnivå', text: `${T.numeriskGrund.fragor} frågor, cirka ${T.numeriskGrund.minuter} minuter` },
      { niva: 'Avancerad nivå', text: `${T.numeriskAvancerad.fragor} frågor, cirka ${T.numeriskAvancerad.minuter} minuter` },
    ],
  },
]

/** De fem dimensionerna i baslinjens ordning och namn, med exempelprofilens nivå. */
const BIG_FIVE = [
  { rubrik: 'Noggrannhet', text: 'Struktur och disciplin. Heter samvetsgrannhet i testet.', andel: 88, niva: 'Hög' },
  { rubrik: 'Extraversion', text: 'Social energi och initiativ. Heter utåtriktning i testet.', andel: 26, niva: 'Låg' },
  { rubrik: 'Känslostabilitet', text: 'Stresstålighet och lugn. Heter stabilitet i testet.', andel: 72, niva: 'Hög' },
  { rubrik: 'Vänlighet', text: 'Samarbete och tillit.', andel: 58, niva: 'Mitt emellan' },
  { rubrik: 'Öppenhet', text: 'Kreativitet och nyfikenhet.', andel: 52, niva: 'Mitt emellan' },
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

const GUIDER = [
  { rubrik: 'Logiska tester', text: 'Testtyperna, leverantörerna du möter i Sverige och vad forskningen säger om att öva.', href: '/artiklar/logiska-tester' },
  { rubrik: 'Matrislogik', text: 'Regeltyperna bakom matriserna och lösta exempel steg för steg.', href: '/artiklar/matrislogik-test-guide' },
  { rubrik: 'Numeriska test', text: 'Tabelläsning, procent och huvudräkning som håller under tidspress.', href: '/artiklar/numeriskt-test-guide' },
  { rubrik: 'Verbala test', text: 'Sant, falskt eller går ej att avgöra, och fällan som fäller flest.', href: '/artiklar/verbalt-test-guide' },
  { rubrik: 'Rotationstest', text: 'Spatial förmåga, att vrida figurer i huvudet. Vanligt i tekniska roller och ingenjörsyrken.', href: '/artiklar/rotation-test-guide' },
  { rubrik: 'Personlighetstest', text: 'Femfaktormodellen, vad dimensionerna betyder för olika roller och varför ärlighet lönar sig.', href: '/artiklar/personlighetstest-jobb-guide' },
  { rubrik: 'Deduktiva och induktiva test', text: 'Regel till slutsats eller exempel till regel. Sex lösta uppgifter och vilka tester Aon och SHL använder.', href: '/artiklar/deduktivt-induktivt-test' },
  { rubrik: 'Alva Labs logiktest', text: 'Tjugo adaptiva matrisuppgifter med två minuter var, och hur skalan 1 till 10 ska läsas.', href: '/artiklar/alva-labs-logiktest' },
  { rubrik: 'MAP från Assessio', text: 'Personlighetstestet med 200 påståenden: vad de fem faktorerna mäter och vad arbetsgivaren ser.', href: '/artiklar/map-test-personlighetstest' },
]

/** Bilderna på testtypskorten: matrisbrickan, en textpassage, en tabell. */
function TyppBild({ typ }: { typ: 'matris' | 'verbal' | 'numerisk' }) {
  if (typ === 'matris') return <MatrisBricka className="pub-mini-matris" bredd={140} />
  if (typ === 'verbal') {
    return (
      <svg viewBox="0 0 220 120" fill="none" aria-hidden="true" focusable="false">
        <rect x="8" y="8" width="204" height="104" rx="12" fill="var(--panel)" stroke="var(--ink-1)" strokeWidth="2" />
        <path d="M24 30h140M24 44h170M24 58h120" stroke="var(--ink-1)" strokeWidth="2" strokeLinecap="round" />
        <rect x="24" y="76" width="52" height="22" rx="11" fill="var(--positiv-mjuk)" />
        <rect x="84" y="76" width="52" height="22" rx="11" fill="var(--insunken)" />
        <rect x="144" y="76" width="52" height="22" rx="11" fill="var(--koppar-mjuk)" stroke="var(--koppar)" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 220 120" fill="none" aria-hidden="true" focusable="false">
      <rect x="8" y="8" width="204" height="104" rx="12" fill="var(--panel)" stroke="var(--ink-1)" strokeWidth="2" />
      <path d="M8 36h204M8 62h204M8 88h204M72 8v104M142 8v104" stroke="var(--kant-stark)" strokeWidth="1.5" />
      <rect x="143" y="63" width="68" height="24" fill="var(--koppar)" opacity=".85" />
      <path d="M22 24h36M86 24h40M156 24h40" stroke="var(--ink-1)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function RekryteringstesterSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Rekryteringstester',
    url: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
    description:
      'Träna på rekryteringstester och bygg din personlighetsprofil innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang, numeriskt resonemang och Big Five-baserad personlighetsanalys.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Fem frågor utan konto, en nivåkoll och ett första träningspass med gratiskonto, utan kortuppgift',
    },
    featureList:
      'Matrislogik 3x3-grid, verbalt resonemang med sant/falskt/går ej att avgöra, numeriskt resonemang med tabeller och procent, Big Five-baserad personlighetsprofil med 50 eller 120 frågor, score och tid direkt efter varje pass, fråga-för-fråga-genomgång med rätt svar, obegränsat antal försök med ' + paketNamn(SALD_PLAN),
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så tränar du på rekryteringstester med Jobbcoach.ai',
    description:
      'Fyra steg från val av test till färdig rapport: välj test, lös frågor i din takt, få score och tid direkt, se vad du missade.',
    totalTime: 'PT20M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj test',
        text:
          'Plocka matrislogik, verbalt resonemang eller numeriskt resonemang. Fem frågor provar du utan konto.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Lös frågor i din takt',
        text:
          'Markera ditt svar och gå till nästa fråga. Timern räknar tempot men avbryter aldrig.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Få score och tid direkt',
        text:
          'När du svarat klart visas procent korrekta, total tid och snitt-tid per fråga.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Se vad du missade',
        text:
          'Fråga för fråga ser du ditt svar mot facit och förstår vilka mönster du kan träna mer på.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REKRYTERINGSTESTER_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <RedirectLoggedIn to="/dashboard/tester" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PubliktSida>
        <main>
          {/* 1. Hjälten: indigo vägg, expertfrågan i telefonen */}
          <Hjalte
            id="hjalte"
            rum="tran"
            yta="vagg"
            vag="mark"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Verktyg', href: '/funktioner' },
              { name: 'Rekryteringstester', href: '/verktyg/rekryteringstester' },
            ]}
            kick="Rekryteringstester, kom förberedd till provet"
            h1="Träna på rekryteringstester innan arbetsgivaren testar dig"
            ingress="Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder."
            fet="Fem frågor gratis här och en nivåkoll gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje pass."
            primar={{ text: 'Starta gratis test', href: PROVA, dataCta: 'hero-primary' }}
            sekundar={{ text: 'Se alla tester', href: '#testtyper' }}
            tal={[
              { tal: '1 nivåkoll', text: 'och första passet gratis med konto' },
              { tal: `${T.matrisGrund.minuter} min`, text: 'per pass' },
              { tal: '5 frågor', text: 'att prova utan konto' },
            ]}
            bildLag
            bild={
              <>
                <SvavandeObjekt objekt="matris" rot={-8} plats={{ left: -10, top: 40 }} bredd={104} mobil={{ left: -6, top: 30, bredd: 84 }} />
                <SvavandeObjekt objekt="lista" rot={7} plats={{ right: -6, top: 90 }} bredd={120} mobil={{ right: -8, top: 120, bredd: 100 }} />
                <SvavandeObjekt objekt="klocka" rot={-4} plats={{ right: 30, bottom: 50 }} bredd={92} doljPaMobil />
                <SkarmMatris />
              </>
            }
          />

          {/* 2. Prova utan konto: först i mobilordningen */}
          <Rum yta="mark" storlek="tat" id="prova">
            <div className="pub-wrap">
              <ProvaKort
                rum="tran"
                rubrik="Gör ett prov direkt, utan konto"
                text="Du behöver inte registrera dig för att se var du står. Fem frågor tar ett par minuter."
                punkter={['Fem matrislogikfrågor', 'Samma frågebank som i det skarpa testet', 'Resultat direkt, ingen tidtagning']}
                knapp={{ text: 'Prova fem frågor', href: PROVA }}
                not="Ingen inloggning, inget kort"
                knappElement={
                  <MattLank
                    href={PROVA}
                    className="pub-knapp"
                    dataCta="rekryteringstester-prova"
                    handelse="article_cta_clicked"
                    egenskaper={{ cluster: 'test', position: 'hero', target: PROVA }}
                  >
                    Prova fem frågor
                  </MattLank>
                }
              />
            </div>
          </Rum>

          {/* 3. Så fungerar det, med resultatvyn */}
          <Rum yta="panel" id="sa-funkar-det">
            <div className="pub-wrap pub-tva pub-omv">
              <div className="pub-tva-text pub-rum-tran">
                <h2 className="pub-h2">Så fungerar det</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  Från första frågan till färdig rapport. Ingen registrering innan du provar, du börjar inom 30 sekunder.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Steg rader={STEG} />
                </div>
                <div className="pub-handling">
                  <Link className="pub-knapp" href={PROVA}>
                    Starta gratis test
                  </Link>
                </div>
              </div>
              <div className="pub-mitt">
                <SkarmNivakoll />
              </div>
            </div>
          </Rum>

          {/* 4. Sex färdigheter */}
          <Rum yta="ton" rum="tran">
            <div className="pub-wrap">
              <p className="pub-kick">Vad du tränar på</p>
              <h2 className="pub-h2">Sex färdigheter som avgör testet</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 36px' }}>
                Det här är vad arbetsgivaren faktiskt mäter. Träna upp dem innan du sätter dig framför det skarpa testet.
              </p>
              <div className="pub-raster pub-raster-3">
                {FARDIGHETER.map((f) => (
                  <div className="pub-kort" key={f.rubrik}>
                    <Objekt typ={f.objekt} />
                    <h3 className="pub-h4">{f.rubrik}</h3>
                    <p>{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Rum>

          {/* 5. Tre testtyper, tal ur testConfig */}
          <Rum yta="mark" id="testtyper">
            <div className="pub-wrap">
              <p className="pub-kick">Kognitiva tester</p>
              <h2 className="pub-h2">Tre testtyper, alla gratis att börja</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 36px' }}>
                Med ett gratiskonto gör du en nivåkoll med full genomgång och ett första träningspass samma dag, och resultatet är
                ditt. Att träna vidare, med avancerad nivå, expertnivå och övningsprov mot klockan, ingår i {PREMIUM}, {PRIS}. Säg
                upp när du vill.
              </p>
              <div className="pub-raster pub-raster-3 pub-rum-tran">
                {TESTTYPER.map((t) => (
                  <div className="pub-kort pub-typ-kort" key={t.rubrik}>
                    <div className={`pub-typ-bild ${t.bild === 'matris' ? 'pub-typ-bild-matris' : ''}`.trim()} aria-hidden="true">
                      <TyppBild typ={t.bild} />
                    </div>
                    <h3 className="pub-h4">{t.rubrik}</h3>
                    <p>{t.text}</p>
                    <ul className="pub-typ-fakta">
                      {t.fakta.map((f) => (
                        <li key={f.niva}>
                          <b>{f.niva}</b>
                          <span>{f.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pub-handling" style={{ marginTop: 32 }}>
                <Link className="pub-knapp" href={PROVA}>
                  Starta gratis test
                </Link>
              </div>
            </div>
          </Rum>

          {/* 6. Personligheten: plommon vägg, två telefoner */}
          <Rum yta="vagg" rum="brev" storlek="stor" id="personlighet">
            <div className="pub-wrap pub-tva">
              <div className="pub-tva-text">
                <p className="pub-kick">Personlighetsprofil</p>
                <h2 className="pub-h2">Ta reda på vad rekryteraren ser i dig</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  De flesta arbetsgivare utgår från Big Five när de mäter personlighet i rekrytering. Bygg din egen profil och se var
                  du hamnar på de fem dimensionerna. Det finns inga rätta svar, och resultatet kan du använda inför intervjun.
                </p>
                <p className="pub-brod" style={{ marginTop: 14 }}>
                  Resultatet är mer än fem staplar. Du ser vad rekryteraren lägger märke till först, hur profilen läses mot sex
                  vanliga kravprofiler, vilka frågor du lär få på intervjun och hur du kan svara. Varje dimension får sina styrkor,
                  det att vara medveten om och var du kommer till din rätt i arbetslivet.
                </p>
                <ul className="pub-nivaer" aria-label="Tre nivåer av personlighetstestet">
                  <li>
                    <b>{T.personlighetProv}</b>
                    <div>
                      <strong>Provet, utan konto</strong>
                      <span>Påståenden på två minuter. Profilen direkt, med en rad per dimension om hur rekryteraren läser den.</span>
                    </div>
                  </li>
                  <li>
                    <b>{T.personlighetGrund.fragor}</b>
                    <div>
                      <strong>Hela testet, gratis med konto</strong>
                      <span>Påståenden på {T.personlighetGrund.minuter} minuter. Kravprofilerna, styrkorna och det du kan säga på intervjun.</span>
                    </div>
                  </li>
                  <li>
                    <b>{T.personlighetFordjupad.fragor}</b>
                    <div>
                      <strong>Fördjupade testet, i {PREMIUM}</strong>
                      <span>
                        Påståenden på {T.personlighetFordjupad.minuter} minuter, 30 delfaktorer. Din arbetsstil och frågorna
                        rekryteraren får som intervjuguide, att öva på.
                      </span>
                    </div>
                  </li>
                </ul>
                <div className="pub-handling">
                  <Link className="pub-knapp" href="/verktyg/personlighetstest">
                    Gör provet utan konto
                  </Link>
                  <span className="pub-liten">Tjugo påståenden, två minuter. Hela testet gratis med konto.</span>
                </div>
              </div>
              <div className="pub-duo">
                <SkarmPersonlighet />
                <SkarmIntervjufragor />
              </div>
            </div>
            <div className="pub-wrap">
              <ul className="pub-dim5" aria-label="De fem dimensionerna i Big Five">
                {BIG_FIVE.map((d) => (
                  <li key={d.rubrik}>
                    <h3>{d.rubrik}</h3>
                    <p>{d.text}</p>
                    <div className="pub-dim-m" aria-hidden="true">
                      <i style={{ width: `${d.andel}%` }} />
                    </div>
                    <small aria-hidden="true">{d.niva}</small>
                  </li>
                ))}
              </ul>
            </div>
          </Rum>

          {/* 7. Vad som ingår */}
          <Rum yta="panel">
            <div className="pub-wrap">
              <p className="pub-kick">Vad som ingår</p>
              <h2 className="pub-h2">Träning som syns på resultatet</h2>
              <div className="pub-raster pub-raster-3 pub-rum-tran" style={{ marginTop: 36 }}>
                <div className="pub-kort">
                  <Objekt typ="prova" />
                  <h3 className="pub-h4">Gratis att prova</h3>
                  <p>Fem frågor med facit här, utan konto. Med kontot en nivåkoll och ett första träningspass. Ingen kortuppgift.</p>
                </div>
                <div className="pub-kort">
                  <Objekt typ="rapport" />
                  <h3 className="pub-h4">Rapport efter varje pass</h3>
                  <p>Resultat, tid och en genomgång fråga för fråga med rätt svar.</p>
                </div>
                <div className="pub-kort pub-kort-premium">
                  <Objekt typ="uppat" />
                  <h3 className="pub-h4">{PREMIUM} tar bort taket</h3>
                  <p>
                    Alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och hela din resultathistorik, {PRIS}.
                  </p>
                </div>
              </div>
            </div>
          </Rum>

          {/* 8. Förbered dig */}
          <Rum yta="ton" rum="tran" id="forbered-dig">
            <div className="pub-wrap">
              <p className="pub-kick">Inför testdagen</p>
              <h2 className="pub-h2" style={{ maxWidth: '20ch' }}>
                Så förbereder du dig inför ett rekryteringstest
              </h2>
              <p className="pub-ingress" style={{ margin: '16px 0 36px' }}>
                Test har blivit standard. Enligt en TRR-undersökning bland tjänstemän som nyligen bytt jobb ökade andelen som fått
                göra test från 58 procent 2019 till 67 procent 2022, och tidningen Ingenjören rapporterar att två till tre timmars
                övning kan höja resultatet med upp till 20 procent. Så lägger du de timmarna rätt.
              </p>
              <Steg rader={FORBEREDELSE} kolumner={2} />
            </div>
          </Rum>

          {/* 9. Guiderna, synliga utan klick */}
          <Rum yta="mark" id="guider">
            <div className="pub-wrap">
              <p className="pub-kick">Fördjupning</p>
              <h2 className="pub-h2">Guider per testtyp</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 32px' }}>
                Vill du förstå ett test på djupet innan du övar har vi en guide till varje testtyp, med exempel och de vanligaste
                fällorna.
              </p>
              <LankLista rubrikNiva="h3" className="pub-rum-tran" lankar={GUIDER.map((g) => ({ href: g.href, rubrik: g.rubrik, text: g.text }))} />
            </div>
          </Rum>

          {/* 10. Premium-avslutet */}
          <PremiumBlock
            kick={
              <>
                Jobbcoach <PremiumOrd />, {PRIS}
              </>
            }
            rubrik="Träna nu. Kom förberedd sen."
            text={`Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Alla nivåer, övningsprov och din historik ingår i ${PREMIUM}.`}
            knapp={{ text: 'Starta gratis test', href: PROVA }}
            lank={{ text: 'Se hur det fungerar', href: '#sa-funkar-det' }}
          />

          {/* 11. Frågorna */}
          <Rum yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq
                rubrik="Vanliga frågor om rekryteringstester"
                ingress={
                  <>
                    Hittar du inte svaret?{' '}
                    <a className="pub-lank" href="mailto:support@jobbcoach.ai">
                      Hör av dig
                    </a>
                    .
                  </>
                }
                fragor={REKRYTERINGSTESTER_FAQ_ITEMS}
              />
            </div>
          </Rum>
        </main>
        <FastKnapprad text="Starta gratis test" href={PROVA} observera="hjalte" />
      </PubliktSida>
    </>
  )
}
