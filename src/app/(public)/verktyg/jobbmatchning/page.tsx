/**
 * /verktyg/jobbmatchning, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.5, skissen v4 flik #matchning).
 *
 * Hjälten på skog vägg med matchningarna i telefonen, tre träffar gratis,
 * Så fungerar det med aktiveringen, de sex datapunkterna, de sex skälen med
 * grenarna, från träff till ansökan, Premium på bläck och frågorna.
 *
 * SEO: h1, metadata och schemat (WebApplication, HowTo, FAQPage) oförändrade
 * utom FAQ-svaren som läser FREE_TIER_JOB_LIMIT och JOB_MATCHES_PER_RUN.
 * Baslinjens h2 och h3 står kvar. Nya h2: "Tre träffar gratis, med skälen"
 * och "Från träff till ansökan". Radien: rubriken "Avstånd du väljer själv"
 * står kvar, texten säger nära dig eller i hela Sverige (ägarens beslut 4).
 * Serverkomponent; klient-JS bara för FastKnapprad.
 */
import Link from 'next/link'
import { JOBBMATCHNING_FAQ_ITEMS } from './components/jobbmatchning-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import PubliktSida from '@/components/publikt/PubliktSida'
import Hjalte from '@/components/publikt/Hjalte'
import Rum from '@/components/publikt/Rum'
import ProvaKort from '@/components/publikt/ProvaKort'
import Steg from '@/components/publikt/Steg'
import Objekt, { type ObjektTyp } from '@/components/publikt/Objekt'
import LankLista, { type LankRad } from '@/components/publikt/LankLista'
import Faq from '@/components/publikt/Faq'
import PremiumBlock, { PremiumOrd } from '@/components/publikt/PremiumBlock'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import SvavandeObjekt from '@/components/publikt/SvavandeObjekt'
import { storForst, talOrd } from '@/components/publikt/talord'
import SkarmMatchning from '@/components/publikt/telefon/skarmar/SkarmMatchning'
import SkarmAktivera, { DATAPUNKTER as DATAPUNKT_NAMN } from '@/components/publikt/telefon/skarmar/SkarmAktivera'

const REGISTRERA = '/register?borja=jobb'
const PREMIUM = paketKort()
const TRAFFAR = talOrd(FREE_TIER_JOB_LIMIT)

const DATAPUNKTER: { rubrik: (typeof DATAPUNKT_NAMN)[number]; text: string; objekt: ObjektTyp }[] = [
  { objekt: 'yrke', rubrik: 'Yrkesroller', text: 'Vi översätter dina tidigare titlar till JobTech Taxonomy, den officiella svenska yrkesklassificeringen. Så vet vi att "frontend-utvecklare" och "webbutvecklare" är närliggande roller.' },
  { objekt: 'kompetens', rubrik: 'Kompetenser', text: 'Tekniska och mjuka kompetenser ur ditt CV, från enskilda program till hela erfarenhetsområden. Vi ställer dem mot kraven i varje annons.' },
  { objekt: 'utbildning', rubrik: 'Utbildning', text: 'Examensnivå och inriktning. Vissa tjänster kräver en viss utbildning, andra ser den som meriterande. Vi räknar med båda.' },
  { objekt: 'plats', rubrik: 'Plats', text: 'Vi vet var du bor och sorterar bort jobb som ligger orimligt långt bort. Du väljer själv om du vill se jobb nära dig eller i hela Sverige.' },
  { objekt: 'sprak', rubrik: 'Språk', text: 'Vilka språk du kan och på vilken nivå. Det avgör internationella roller och tjänster där svenska är ett krav.' },
  { objekt: 'erfarenhet', rubrik: 'Erfarenhetsnivå', text: 'År i branschen och senioritet. Vi matchar inte en junior mot en chefsroll, och inte en senior mot en traineetjänst.' },
]

const VAD_DU_FAR = [
  { rubrik: 'Roller du inte tänkt på själv', text: 'Det är lätt att stirra sig blind på sin titel. Vi vet att en undersköterska också passar som stödassistent, vårdbiträde och boendestödjare, och visar tjänster du aldrig hade hittat med samma sökord som förra gången.' },
  { rubrik: 'Matchning i procent per annons', text: 'Varje jobb får ett tal mellan 0 och 100 som visar hur väl ditt CV svarar mot kraven. Du ser direkt var du har störst chans.' },
  { rubrik: 'Tusentals lediga jobb', text: 'Hela Arbetsförmedlingens annonsbas, Sveriges största samling lediga tjänster, från offentlig sektor till privata bolag.' },
  { rubrik: 'Avstånd du väljer själv', text: 'Se jobben nära dig, eller hela Sverige med ett klick. Du bestämmer om du vill pendla eller hålla dig nära hemmet.' },
  { rubrik: 'Uppdaterat varje dag', text: 'Nya jobb syns i din lista inom timmar efter att de publicerats. Tillsatta tjänster försvinner av sig själva.' },
  { rubrik: 'Bäst träff överst', text: 'Toppmatchningarna hamnar först. Du slipper bläddra igenom hundratals annonser för att hitta de få som passar.' },
]

const GRENAR = [
  { roll: 'Stödassistent', var: 'Region Västra Götaland, Mölndal', procent: 91 },
  { roll: 'Vårdbiträde, hemtjänst', var: 'Göteborgs stad', procent: 86 },
  { roll: 'Boendestödjare', var: 'Attendo, Partille', procent: 82 },
]

const VIDARE: LankRad[] = [
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev från träffen', text: 'Ett klick från ett matchat jobb till ett brev som svarar på just den annonsen.', objekt: 'brev', rum: 'brev' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', objekt: 'upptackt', rum: 'jobb' },
  { href: '/cv-exempel', rubrik: 'CV-exempel', text: 'Färdiga CV:n yrke för yrke, om du inte har ett att aktivera än.', objekt: 'exempel', rum: 'cv' },
  { href: '/artiklar/ai-jobbmatchning', rubrik: 'Så fungerar AI-jobbmatchning', text: 'Vad som händer när jobben hittar dig i stället för tvärtom.', objekt: 'match', rum: 'jobb' },
  { href: '/artiklar/byta-karriar-jobbsokande-guide', rubrik: 'Byta karriär', text: 'Guiden för den som ska söka utanför sin gamla titel.', objekt: 'yrke', rum: 'jobb' },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor och avtal inför jobbet du hittade.', objekt: 'chat', rum: 'neu' },
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
      'Tusentals lediga jobb från Arbetsförmedlingen, matchning i procent per annons, distans-filter, daglig uppdatering, sortering på relevans, alla branscher i Sverige',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så hittar du jobb med Jobbcoach.ai jobbmatchning',
    description:
      'Fyra steg från aktiverat CV till sorterade jobbmatchningar: aktivera CV, vi extraherar yrkesdata, vi söker tusentals annonser, du får jobben sorterade efter relevans.',
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
        name: 'Aktivera ditt CV',
        text: 'Ladda upp ett CV eller välj ett du redan sparat. Aktivering tar några sekunder.',
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
        text: 'Vi söker direkt mot Arbetsförmedlingens öppna API i hela Sverige.',
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

  return (
    <>
      <RedirectLoggedIn to="/dashboard/jobbmatchning" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PubliktSida>
        <div id="innehall">
          {/* 1. Hjälten: skog vägg */}
          <Hjalte
            id="hjalte"
            rum="jobb"
            yta="vagg"
            vag="mark"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Verktyg', href: '/funktioner' },
              { name: 'Jobbmatchning', href: '/verktyg/jobbmatchning' },
            ]}
            kick="Jobbmatchning, fler dörrar än din titel"
            h1="Hitta jobb som matchar ditt CV automatiskt"
            ingress="Aktivera ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen."
            fet="Vi matchar dig också mot roller du inte tänkt på själv, så du får fler dörrar att knacka på än om du sökt på din titel."
            primar={{ text: 'Hitta jobb gratis', href: REGISTRERA, dataCta: 'hero-primary' }}
            sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
            tal={[
              { tal: `${FREE_TIER_JOB_LIMIT} träffar`, text: 'gratis, med skälen' },
              { tal: 'Dagligen', text: 'nya annonser in, tillsatta ut' },
              { tal: 'Hela Sverige', text: 'alla branscher' },
            ]}
            bildLag
            bild={
              <>
                <SvavandeObjekt objekt="cv" rot={-8} plats={{ left: -6, top: 40 }} bredd={100} mobil={{ left: -8, top: 30, bredd: 82 }} />
                <SvavandeObjekt objekt="match" rot={6} plats={{ right: -10, top: 110 }} bredd={146} mobil={{ right: -12, top: 120, bredd: 118 }} />
                <SvavandeObjekt objekt="plats" rot={-4} plats={{ left: 14, bottom: 60 }} bredd={88} doljPaMobil />
                <SkarmMatchning />
              </>
            }
          />

          {/* 2. Tre träffar gratis */}
          <Rum yta="mark" storlek="tat" id="prova">
            <div className="pub-wrap">
              <ProvaKort
                rum="jobb"
                rubrik={`${storForst(TRAFFAR)} träffar gratis, med skälen`}
                text={`Aktivera ditt CV, så ser du dina ${TRAFFAR} bästa träffar och exakt varför de passar. Inget kort, ingen bindning.`}
                punkter={[
                  'Vilka krav du täcker och vad som saknas, per träff',
                  'Nya annonser in varje dag, tillsatta ut',
                  `Alla ${JOB_MATCHES_PER_RUN} träffar varje natt ingår i ${PREMIUM}`,
                ]}
                knapp={{ text: 'Hitta jobb gratis', href: REGISTRERA }}
                not={
                  <>
                    Inget CV än?{' '}
                    <Link className="pub-lank" href="/cv-exempel">
                      Se CV-exempel först
                    </Link>
                  </>
                }
              />
            </div>
          </Rum>

          {/* 3. Så fungerar det, med aktiveringen */}
          <Rum yta="panel" id="sa-funkar-det">
            <div className="pub-wrap pub-tva pub-omv">
              <div className="pub-tva-text pub-rum-jobb">
                <h2 className="pub-h2">Så fungerar det</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  Fyra steg från aktiverat CV till en lista sorterad efter hur väl du passar.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Steg rader={howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text }))} />
                </div>
                <div className="pub-handling">
                  <Link className="pub-knapp" href={REGISTRERA}>
                    Hitta jobb nu
                  </Link>
                </div>
              </div>
              <div className="pub-mitt">
                <SkarmAktivera />
              </div>
            </div>
          </Rum>

          {/* 4. Sex datapunkter */}
          <Rum yta="ton" rum="jobb" id="datapunkter">
            <div className="pub-wrap">
              <p className="pub-kick">Vad vi läser ut</p>
              <h2 className="pub-h2">Sex datapunkter ur ditt CV</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 36px' }}>
                Du fyller inte i något för hand. Vi hämtar allt matchningen behöver direkt ur ditt CV, och sedan gör AI jobbet: den läser varje annons och jämför kraven med det du faktiskt kan.
              </p>
              <div className="pub-raster pub-raster-3">
                {DATAPUNKTER.map((d) => (
                  <div className="pub-kort" key={d.rubrik}>
                    <Objekt typ={d.objekt} />
                    <h3 className="pub-h4">{d.rubrik}</h3>
                    <p>{d.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Rum>

          {/* 5. Sex skäl, med grenarna */}
          <Rum yta="mark" id="skal">
            <div className="pub-wrap pub-tva pub-tva-topp">
              <div className="pub-tva-text pub-rum-jobb">
                <p className="pub-kick">Vad du får</p>
                <h2 className="pub-h2">Sex skäl att låta oss söka åt dig</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  Vi söker bredare än du hinner själv och visar tjänster du faktiskt har chans att få.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Steg rader={VAD_DU_FAR} />
                </div>
              </div>
              <div className="pub-grenar pub-rum-jobb">
                <div className="pub-gren" style={{ gridTemplateColumns: '1fr', paddingTop: 0 }}>
                  <span className="pub-rot">
                    Undersköterska <small>titeln i CV:t</small>
                  </span>
                </div>
                {GRENAR.map((g) => (
                  <div className="pub-gren" key={g.roll}>
                    <Objekt typ="yrke" storlek={34} />
                    <div>
                      <b>{g.roll}</b>
                      <span>{g.var}</span>
                    </div>
                    <em>
                      {g.procent}
                      <small>%</small>
                    </em>
                  </div>
                ))}
                <p className="pub-liten">
                  Exempel på träffar för en undersköterska. Ingen av de tre annonserna innehåller ordet undersköterska.
                </p>
              </div>
            </div>
          </Rum>

          {/* 6. Från träff till ansökan */}
          <Rum yta="panel" id="las-mer">
            <div className="pub-wrap">
              <p className="pub-kick">Nästa steg</p>
              <h2 className="pub-h2">Från träff till ansökan</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 32px' }}>
                Jobbmatchningen hänger ihop med resten av kontot: brevet skrivs från träffen, och rekryterare kan hitta dig åt
                andra hållet.
              </p>
              <LankLista lankar={VIDARE} />
            </div>
          </Rum>

          {/* 7. Premium-avslutet */}
          <PremiumBlock
            kick={
              <>
                Jobbcoach <PremiumOrd />, {prisPeriod(SALD_PLAN)}
              </>
            }
            rubrik="Hitta ditt nästa jobb automatiskt."
            text={`Aktivera ditt CV och se dina ${FREE_TIER_JOB_LIMIT} bästa träffar med skälen utskrivna, utan kortuppgift. Alla träffar, varje dag, ingår i ${PREMIUM}, utan bindningstid.`}
            knapp={{ text: 'Hitta jobb gratis', href: REGISTRERA }}
            lank={{ text: 'Se CV-exempel först', href: '/cv-exempel' }}
          />

          {/* 8. Frågorna */}
          <Rum yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq
                rubrik="Vanliga frågor om att söka jobb"
                ingress={
                  <>
                    Hittar du inte svaret?{' '}
                    <a className="pub-lank" href="mailto:support@jobbcoach.ai">
                      Hör av dig
                    </a>
                    .
                  </>
                }
                fragor={JOBBMATCHNING_FAQ_ITEMS}
              />
            </div>
          </Rum>
        </div>
        <FastKnapprad text="Hitta jobb gratis" href={REGISTRERA} observera="hjalte" />
      </PubliktSida>
    </>
  )
}
