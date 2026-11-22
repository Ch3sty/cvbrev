/**
 * /verktyg/jobbmatchning, publikt omgång 3 (skissen jobbmatchning,
 * docs/design/publikt-omgang3/sidor/jobbmatchning.html).
 *
 * Hjälten är Matchade jobb som i kontot, lyftet visar tre öppna av de 25
 * bästa träffarna, stegen som väg, datapunkterna bredvid Saras CV, skälen
 * med grenarna på en ö, kedjan träff, sparad, sökt, Premium och frågorna.
 *
 * SEO (seo-besked-skisser.md avsnitt 17): h1, titel, description, alla sju
 * H2 och alla H3 står, också "Uppdaterat varje dag" (textbeslut B-11).
 * Steg 1 heter "Välj eller ladda upp ditt CV" (JM-1). Schemat
 * (WebApplication, HowTo, FAQPage) byggs ur samma listor som syns.
 * Serverkomponent; klient-JS bara för FastKnapprad.
 */
import { JOBBMATCHNING_FAQ_ITEMS } from './components/jobbmatchning-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { NO_RESPONSE_NUDGE_DAYS } from '@/lib/applications/status'
import { BREV_MALL_ANTAL } from '@/components/publikt/brevmallar'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import CvProvaJobb from './components/CvProvaJobb'
import { storForst, talOrd } from '@/components/publikt/talord'
import type { Farg } from '@/components/publikt/v3'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Kort,
  Rutnat,
  Nr,
  VagSteg,
  Faq,
  LankBricka,
  O,
  PremiumO,
  Bocklista,
  Knapp,
  Knapprad,
  TextLank,
  Ikon,
  CvArk,
  SARA_DELAR,
  type ArkDel,
  MatchadeJobb,
  Matchgrad,
} from '@/components/publikt/v3'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '@/components/publikt/publikt.css'
import './jobbmatchning.css'

const REGISTRERA = '/register?borja=jobb'
const SOKTA_TJANSTER = '/verktyg/sokta-tjanster'
const PREMIUM = paketKort()
const TRAFFAR = talOrd(FREE_TIER_JOB_LIMIT)

const DATAPUNKTER: { rubrik: string; text: string; ur: string }[] = [
  { rubrik: 'Yrkesroller', text: 'Vi översätter dina tidigare titlar till JobTech Taxonomy, den officiella svenska yrkesklassificeringen. Så vet vi att "frontend-utvecklare" och "webbutvecklare" är närliggande roller.', ur: 'projektledare, biträdande projektledare' },
  { rubrik: 'Kompetenser', text: 'Tekniska och mjuka kompetenser ur ditt CV, från enskilda program till hela erfarenhetsområden. Vi ställer dem mot kraven i varje annons.', ur: 'projektledning, LOU, budgetansvar, AMA' },
  { rubrik: 'Utbildning', text: 'Examensnivå och inriktning. Vissa tjänster kräver en viss utbildning, andra ser den som meriterande. Vi räknar med båda.', ur: 'civilingenjör, industriell ekonomi' },
  { rubrik: 'Plats', text: 'Vi vet var du bor och sorterar bort jobb som ligger orimligt långt bort. Du väljer själv om du vill se jobb nära dig eller i hela Sverige.', ur: 'Göteborg' },
  { rubrik: 'Språk', text: 'Vilka språk du kan och på vilken nivå. Det avgör internationella roller och tjänster där svenska är ett krav.', ur: 'svenska, engelska' },
  { rubrik: 'Erfarenhetsnivå', text: 'År i branschen och senioritet. Vi matchar inte en junior mot en chefsroll, och inte en senior mot en traineetjänst.', ur: 'åtta år, två roller' },
]

/** Saras ark med nålarna per datapunkt (samma nummer som korten bredvid). */
const JM_ARK: ArkDel[] = [
  { ...SARA_DELAR[0], nal: null },
  {
    rubrik: 'Arbetslivserfarenhet',
    nal: [1, 6],
    rader: [
      { text: 'Projektledare, Nordanvind Energi', tid: '2021 till nu' },
      { text: 'Biträdande projektledare, Halda Logistik', tid: '2018 till 2021' },
    ],
  },
  { ...SARA_DELAR[2], nal: 2 },
  { ...SARA_DELAR[3], nal: 3 },
  { ...SARA_DELAR[4], nal: 5 },
]

/** Små bilder till skälen, aria-hidden. Samma ordning som VAD_DU_FAR. */
const SKAL_BILDER = [
  <svg key="1" viewBox="0 0 84 48" fill="none">
    <path d="M14 24h18M32 24c10 0 8-14 22-14M32 24h22M32 24c10 0 8 14 22 14" stroke="var(--kant-stark)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 6" />
    <rect x="2" y="15" width="18" height="18" rx="6" fill="var(--ton-ink)" />
    <rect x="56" y="2" width="16" height="16" rx="5" fill="var(--koppar)" />
    <rect x="66" y="16" width="16" height="16" rx="5" fill="var(--ton)" stroke="var(--ton-ink)" strokeWidth="2" />
    <rect x="56" y="30" width="16" height="16" rx="5" fill="var(--ton)" stroke="var(--ton-ink)" strokeWidth="2" />
  </svg>,
  <>
    <Matchgrad varde={72} liten />
    <small>av 100</small>
  </>,
  <svg key="3" viewBox="0 0 84 48" fill="none">
    <rect x="30" y="4" width="34" height="40" rx="6" fill="var(--ton)" stroke="var(--kant-stark)" strokeWidth="2" transform="rotate(10 47 24)" />
    <rect x="24" y="4" width="34" height="40" rx="6" fill="var(--ton)" stroke="var(--kant-stark)" strokeWidth="2" transform="rotate(-8 41 24)" />
    <rect x="27" y="4" width="34" height="40" rx="6" fill="var(--papper)" stroke="var(--ton-ink)" strokeWidth="2" />
    <path d="M34 15h20M34 23h20M34 31h12" stroke="var(--ton-ink)" strokeWidth="3" strokeLinecap="round" />
  </svg>,
  <span key="4" className="jm-vx">
    <i className="jm-pa">Nära dig</i>
    <i>Hela Sverige</i>
  </span>,
  <>
    <i className="jm-prick" />
    <i className="jm-prick" />
    <i className="jm-prick" />
    <small>per dygn</small>
  </>,
  <svg key="6" viewBox="0 0 84 48" fill="none">
    <rect x="8" y="4" width="72" height="11" rx="5.5" fill="var(--koppar)" />
    <rect x="8" y="19" width="56" height="11" rx="5.5" fill="var(--ton-ink)" />
    <rect x="8" y="34" width="40" height="11" rx="5.5" fill="var(--kant-stark)" />
  </svg>,
]

const VAD_DU_FAR = [
  { rubrik: 'Roller du inte tänkt på själv', text: 'Det är lätt att stirra sig blind på sin titel. Vi vet att en undersköterska också passar som stödassistent, vårdbiträde och boendestödjare, och visar tjänster du aldrig hade hittat med samma sökord som förra gången.' },
  { rubrik: 'Matchning i procent per annons', text: 'Varje jobb får ett tal mellan 0 och 100 som visar hur väl ditt CV svarar mot kraven. Du ser direkt var du har störst chans.' },
  { rubrik: 'Tusentals lediga jobb', text: 'Hela Arbetsförmedlingens annonsbas, Sveriges största samling lediga tjänster, från offentlig sektor till privata bolag.' },
  { rubrik: 'Avstånd du väljer själv', text: 'Se jobben nära dig, eller hela Sverige med ett klick. Du bestämmer om du vill pendla eller hålla dig nära hemmet.' },
  { rubrik: 'Uppdaterat varje dag', text: 'Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste, och annonser som tagits bort följer inte med i nästa sökning.' },
  { rubrik: 'Bäst träff överst', text: 'Toppmatchningarna hamnar först. Du slipper bläddra igenom hundratals annonser för att hitta de få som passar.' },
]

const GRENAR = [
  { roll: 'Stödassistent', var: 'Region Västra Götaland, Mölndal', procent: 91 },
  { roll: 'Vårdbiträde, hemtjänst', var: 'Göteborgs stad', procent: 86 },
  { roll: 'Boendestödjare', var: 'Attendo, Partille', procent: 82 },
]

const VIDARE: { href: string; rubrik: string; text: string; farg: Farg }[] = [
  { href: '/verktyg/rekryteringstester', rubrik: 'Rekryteringstester', text: 'Kallad till test efter ansökan? Träna först.', farg: 'tran' },
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev från träffen', text: 'Ett klick från ett matchat jobb till ett brev som svarar på just den annonsen.', farg: 'brev' },
  { href: SOKTA_TJANSTER, rubrik: 'Sökta tjänster', text: 'Spara annonsen till Ska sökas, logga den du har sökt och se när det är dags att följa upp.', farg: 'jobb' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', farg: 'jobb' },
  { href: '/cv-exempel', rubrik: 'CV-exempel', text: 'Färdiga CV:n yrke för yrke, om du inte har ett eget än.', farg: 'cv' },
  { href: '/artiklar/ai-jobbmatchning', rubrik: 'Så fungerar AI-jobbmatchning', text: 'Vad som händer när jobben hittar dig i stället för tvärtom.', farg: 'jobb' },
  { href: '/artiklar/byta-karriar-jobbsokande-guide', rubrik: 'Byta karriär', text: 'Guiden för den som ska söka utanför sin gamla titel.', farg: 'jobb' },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor och avtal inför jobbet du hittade.', farg: 'neutral' },
]

export default function JobbmatchningSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai jobbmatchning',
    url: 'https://www.jobbcoach.ai/verktyg/jobbmatchning',
    description:
      'Hitta jobb som matchar ditt CV automatiskt. Vi söker bland tusentals lediga tjänster i Sverige från Arbetsförmedlingen och ger dig matchning i procent per annons.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '3 fulla träffar med skälen gratis, ingen kortuppgift',
    },
    featureList:
      'Tusentals lediga jobb från Arbetsförmedlingen, matchning i procent per annons, distans-filter, nya annonser tre gånger per dygn, sortering på relevans, alla branscher i Sverige',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så hittar du jobb med Jobbcoach.ai jobbmatchning',
    description:
      'Fyra steg från uppladdat CV till sorterade jobbmatchningar: välj eller ladda upp CV, vi extraherar yrkesdata, vi söker tusentals annonser, du får jobben sorterade efter relevans.',
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj eller ladda upp ditt CV',
        text: 'Ladda upp ett CV eller använd det du redan har sparat. Ditt senaste CV läses in av sig självt, och du byter under Byt CV.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi extraherar yrkesdata',
        text: 'Vi läser ut yrkesroller, kompetenser, utbildning, plats och språk automatiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Vi söker tusentals annonser',
        text: 'Vi hämtar annonserna ur Arbetsförmedlingens öppna API, i hela Sverige.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Du får jobben sorterade',
        text: 'Varje annons får matchning i procent. Toppmatchningarna hamnar överst.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBMATCHNING_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Stegens bilder ur kontot, aria-hidden i VagSteg. Exempel.
  const stegBilder = [
    <div key="1" className="jm-minicv">
      <b>
        Ditt CV <u>Byt CV</u>
      </b>
      <span>Sara Lindström, projektledare</span>
      <small>3 roller, 14 kompetenser, 2 utbildningar</small>
    </div>,
    <div key="2" className="jm-mini-rad">
      <span className="jm-mini-chip">Projektledare</span>
      <span className="jm-mini-chip">LOU</span>
      <span className="jm-mini-chip">Göteborg</span>
      <span className="jm-mini-chip">Civilingenjör</span>
    </div>,
    <div key="3">
      <div className="jm-mini-rad">
        <span className="jm-mini-chip jm-m">Hitta jobb som passar</span>
      </div>
      <span className="jm-mini-not">
        Senast sökt för 2 timmar sedan. <u>Sök igen</u>
      </span>
    </div>,
    <div key="4" className="jm-mini-rad" style={{ gap: 10 }}>
      <Matchgrad varde={91} />
      <Matchgrad varde={86} liten />
      <Matchgrad varde={82} liten />
    </div>,
  ]

  return (
    <>
      <RedirectLoggedIn to="/dashboard/jobbmatchning" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="jobb" id="innehall">
        {/* 1. Hjälten: Matchade jobb som i kontot */}
        <Hjalte
          id="hjalte"
          // Baslinjen har ingen BreadcrumbList här; schemat ändras bara med SEO:s ja.
          brodsmulorSchema={false}
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
          ]}
          etikett="Jobbmatchning, fler dörrar än din titel"
          h1="Hitta jobb som matchar ditt CV automatiskt"
          varde={
            <>
              Ladda upp ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen.{' '}
              <b>Vi matchar dig också mot roller du inte tänkt på själv, så du får fler dörrar att knacka på än om du sökt på din titel.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="#prova" pil data-cta="hero-primary">
                Hitta jobb gratis
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: `${FREE_TIER_JOB_LIMIT} träffar`, text: 'gratis, med skälen' },
            { tal: '3 gånger', text: 'per dygn hämtas nya annonser' },
            { tal: 'Hela Sverige', text: 'alla branscher', ord: true },
          ]}
          bild={<MatchadeJobb />}
          lyft
        />

        {/* 2. Tre träffar gratis */}
        <Lyft id="prova">
          <div className="jm-tva">
            <div>
              <p className="p3-ey">Prova utan kort</p>
              <h2 className="p3-h2" style={{ marginTop: 10 }}>
                {`${storForst(TRAFFAR)} träffar gratis, med skälen`}
              </h2>
              <p className="p3-varde" style={{ marginTop: 12 }}>
                {`Ladda upp ditt CV, så ser du dina ${TRAFFAR} bästa träffar och varför de passar. Inget kort, ingen bindning.`}
              </p>
              <Bocklista
                paPapper
                className="jm-mt"
                punkter={[
                  'Varför rollen passar och vilka av dina kompetenser annonsen frågar efter, per träff',
                  'Nya annonser in tre gånger per dygn, borttagna ut',
                  `De ${JOB_MATCHES_PER_RUN} bästa träffarna ingår i ${PREMIUM}`,
                ]}
              />
              {/* Inga genvägar: CV:t läggs in här och följer med in i kontot (CvProvaJobb). */}
              <div className="jm-mt">
                <CvProvaJobb />
              </div>
              <Knapprad className="jm-mt">
                <span className="p3-liten">
                  Inget CV än? <TextLank href="/cv-exempel">Se CV-exempel först</TextLank> eller{' '}
                  <TextLank href={REGISTRERA}>skapa kontot och bygg ett där</TextLank>
                </span>
              </Knapprad>
            </div>
            <div>
              <div
                className="jm-tjugofem"
                role="img"
                aria-label={`Exempel: av de ${JOB_MATCHES_PER_RUN} bästa träffarna är ${TRAFFAR} öppna på gratisnivån`}
              >
                {[91, 86, 82].slice(0, FREE_TIER_JOB_LIMIT).map((p) => (
                  <span key={p} className="jm-oppen">
                    <Matchgrad varde={p} />
                  </span>
                ))}
                {Array.from({ length: Math.max(0, JOB_MATCHES_PER_RUN - FREE_TIER_JOB_LIMIT) }, (_, i) => (
                  <span key={`las-${i}`}>
                    <Ikon namn="las" />
                  </span>
                ))}
              </div>
              <div className="jm-tjugofem-rad" aria-hidden="true">
                <span>
                  <i />
                  {FREE_TIER_JOB_LIMIT} öppna träffar, gratis
                </span>
                <span>
                  <i />
                  {JOB_MATCHES_PER_RUN - FREE_TIER_JOB_LIMIT} till i {PREMIUM}
                </span>
              </div>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud rubrik="Så fungerar det" varde="Fyra steg från uppladdat CV till en lista sorterad efter hur väl du passar." />
          <VagSteg steg={howToSchema.step.map((s, i) => ({ rubrik: s.name, text: s.text, bild: stegBilder[i], koppar: i === 3 }))} />
          <Knapprad className="jm-mt-stor">
            <Knapp href={REGISTRERA} variant="vit">
              Hitta jobb nu
            </Knapp>
          </Knapprad>
        </Sektion>

        {/* 4. Sex datapunkter */}
        <Sektion botten="ton" id="datapunkter">
          <SektionHuvud
            etikett="Vad vi läser ut"
            rubrik="Sex datapunkter ur ditt CV"
            varde="Du fyller inte i något för hand. Vi hämtar allt matchningen behöver direkt ur ditt CV, och sedan gör AI jobbet: den läser varje annons och jämför kraven med det du faktiskt kan."
          />
          <div className="jm-dp">
            <div className="jm-dp-ark">
              {/* Nålarna följer korten: Plats på kontaktraden, Yrkesroller och Erfarenhetsnivå i erfarenheten. */}
              <CvArk
                namnNal={4}
                delar={JM_ARK}
                vald={0}
                ariaLabel="Exempel: Sara Lindströms CV med de sex datapunkterna utmärkta, som de läses ur CV:t"
              />
            </div>
            <div className="jm-dp-lista">
              {DATAPUNKTER.map((d, i) => (
                <Kort key={d.rubrik} className="jm-dprad">
                  <Nr>{i + 1}</Nr>
                  <h3 className="p3-h3">{d.rubrik}</h3>
                  <p>{d.text}</p>
                  <span className="jm-ur">Exempel ur Saras CV: {d.ur}</span>
                </Kort>
              ))}
            </div>
          </div>
        </Sektion>

        {/* 5. Sex skäl, med grenarna */}
        <Sektion id="skal">
          <O
            farg="jobb"
            ikon="jobb"
            etikett="Vad du får"
            rubrik="Sex skäl att låta oss söka åt dig"
            rubrikNiva="h2"
            varde="Vi söker bredare än du hinner själv och visar tjänster du faktiskt har chans att få."
            bild={
              <div className="jm-gren">
                <div role="img" aria-label="Exempel: titeln undersköterska ger träffar som stödassistent, vårdbiträde och boendestödjare" style={{ display: 'grid', gap: 10 }}>
                  <span className="jm-gren-rot">
                    Undersköterska <small>titeln i CV:t</small>
                  </span>
                  {GRENAR.map((g) => (
                    <div className="jm-gren-gren" key={g.roll}>
                      <div>
                        <b>{g.roll}</b>
                        <small>{g.var}</small>
                      </div>
                      <Matchgrad varde={g.procent} />
                    </div>
                  ))}
                </div>
                <p className="p3-liten jm-gren-not">Exempel på träffar för en undersköterska. Ingen av de tre annonserna innehåller ordet undersköterska.</p>
              </div>
            }
          />
          <Rutnat kolumner={3} className="jm-skal">
            {VAD_DU_FAR.map((s, i) => (
              <Kort key={s.rubrik}>
                <div className="jm-skal-topp">
                  <Nr>{i + 1}</Nr>
                  <span className="jm-skal-bild" aria-hidden="true">
                    {SKAL_BILDER[i]}
                  </span>
                </div>
                <h3 className="p3-h3">{s.rubrik}</h3>
                <p>{s.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 6. Från träff till ansökan */}
        <Sektion botten="ton" id="las-mer">
          <SektionHuvud
            etikett="Nästa steg"
            rubrik="Från träff till ansökan"
            varde="Jobbmatchningen hänger ihop med resten av kontot. Från en träff skriver du brevet, sparar annonsen till Ska sökas med sista ansökningsdag eller markerar den som sökt, och följer den sedan under Sökta tjänster. Rekryterare kan dessutom hitta dig åt andra hållet."
          />
          <div className="jm-kedja" role="group" aria-label="Exempel: en träff som sparas till Ska sökas och sedan markeras som sökt">
            <div className="jm-lank-k">
              <span className="jm-var">Matchade jobb</span>
              <div className="jm-sak">
                <Matchgrad varde={91} liten />
                <div>
                  <b>Projektledare, bygg</b>
                  <small>Nordhaga Bygg, Göteborg</small>
                </div>
              </div>
              <span className="jm-pill">Sista ansökningsdag 28 nov</span>
              <p>Träffen visar matchgraden, skälen och sista ansökningsdag. Med Skriv brev får du ett personligt brev på just den annonsen.</p>
            </div>
            <span className="jm-steg-k" aria-hidden="true">
              Spara till Ska sökas <Ikon namn="pil" />
            </span>
            <div className="jm-lank-k">
              <span className="jm-var">Ska sökas</span>
              <div className="jm-sak">
                <span className="jm-br jm-tom" aria-hidden="true">
                  NB
                </span>
                <div>
                  <b>Projektledare, bygg</b>
                  <small>Sparad annons</small>
                </div>
              </div>
              <span className="jm-pill">Sista dag lördag 28 nov, 6 dagar kvar</span>
              <p>Annonsen ligger kvar med sin sista ansökningsdag, och vi säger till när dagen närmar sig.</p>
            </div>
            <span className="jm-steg-k" aria-hidden="true">
              Markera som sökt <Ikon namn="pil" />
            </span>
            <div className="jm-lank-k">
              <span className="jm-var">Sökta tjänster</span>
              <div className="jm-sak">
                <span className="jm-br" aria-hidden="true">
                  NB
                </span>
                <div>
                  <b>Projektledare, bygg</b>
                  <small>Sökt 24 november</small>
                </div>
              </div>
              <span className="jm-pill jm-ton">Väntar svar</span>
              <p>{`Nu räknar vi dagarna. Har du inte hört något på ${talOrd(NO_RESPONSE_NUDGE_DAYS)} dagar föreslår vi ett uppföljningsmejl.`}</p>
              <TextLank href={SOKTA_TJANSTER}>Håll koll på dina sökta jobb</TextLank>
            </div>
          </div>
          <Rutnat kolumner={4}>
            {VIDARE.map((l) => (
              <LankBricka key={l.href} href={l.href} rubrik={l.rubrik} text={l.text} farg={l.farg} />
            ))}
          </Rutnat>
        </Sektion>

        {/* 7. Premium-avslutet */}
        <Sektion>
          <PremiumO
            etikett={`${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}`}
            rubrik="Hitta ditt nästa jobb automatiskt."
            text={`Ladda upp ditt CV och se dina ${FREE_TIER_JOB_LIMIT} bästa träffar med skälen utskrivna, utan kortuppgift. De ${JOB_MATCHES_PER_RUN} bästa träffarna ingår i ${PREMIUM}, utan bindningstid. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste.`}
            knapp={
              <>
                <Knapp href={REGISTRERA}>Hitta jobb gratis</Knapp>
                <TextLank href="/cv-exempel">Se CV-exempel först</TextLank>
              </>
            }
            punkter={[
              `De ${JOB_MATCHES_PER_RUN} bästa träffarna, med skälen för var och en`,
              `Personliga brev från träffen, i ${BREV_MALL_ANTAL} mallar`,
              'Uppföljningsmejl till varje sökt tjänst och månadsrapporten att skriva ut',
              'Rekryteringstester i tre nivåer och Jobbcoachen så mycket du vill',
            ]}
          />
        </Sektion>

        {/* 8. Frågorna */}
        <Sektion id="fragor" luft="utan-topp">
          <Faq
            rubrik="Vanliga frågor om att söka jobb"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <a className="p3-lank" href="mailto:support@jobbcoach.ai">
                  Hör av dig
                </a>
                .
              </>
            }
            fragor={JOBBMATCHNING_FAQ_ITEMS}
            efter={
              <Knapp href={REGISTRERA} pil>
                Hitta jobb gratis
              </Knapp>
            }
          />
        </Sektion>
      </Sida>
      <FastKnapprad text="Hitta jobb gratis" href="#prova" observera="hjalte" />
    </>
  )
}
