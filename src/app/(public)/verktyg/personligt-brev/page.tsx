/**
 * /verktyg/personligt-brev, publikt omgång 3 (skissen personligt-brev,
 * noten docs/design/publikt-omgang3/noter/personligt-brev.md, SEO:s besked
 * avsnitt 12).
 *
 * Plommonväggen med brevet och annonsens krav (grundens Brevpar), lyftkortet
 * för ett brev utan konto, stegen som väg med tonblocket, de sju mallarna
 * med brevets egna miniatyrer, reglerna med brevets tre stycken, kravpanelen
 * på en ö, fördjupningen, Premium och frågorna.
 *
 * SEO: h1, metadata och schemat (WebApplication, HowTo, FAQPage) oförändrade.
 * Alla åtta h2 och alla 25 h3 står kvar med samma text och nivå, i samma
 * ordning. Tonblockets rubrik och kravpanelens huvud är stycken. Talen läses
 * ur brevets katalog (src/components/publikt/brevmallar.ts), plans.ts och
 * kvoterna. Serverkomponent, ingen klientkod.
 */
import Link from 'next/link'
import { BREV_FAQ_ITEMS } from './components/brev-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { KampanjVarianter } from '@/components/kampanj/Kampanj'
import { PREVIEW_PARAGRAPHS } from '@/lib/letters/public-draft-tal'
import { FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'
import { storForst, talOrd } from '@/components/publikt/talord'
import AnnonsFalt from './AnnonsFalt'
import {
  BREV_GRATIS_NAMN,
  BREV_MALL_ANTAL,
  BREV_PREMIUM_ANTAL,
  BREV_WORD_ANTAL,
  MINIATYR_BREDD,
  MINIATYR_HOJD,
  SALJ_MALL_IDS,
  brevMallKortFor,
  brevMiniatyrSrc,
  formatMarke,
} from '@/components/publikt/brevmallar'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Chip,
  Nr,
  VagSteg,
  Faq,
  PremiumO,
  Knapp,
  TextLank,
  Ikon,
  Dorr,
  CvArk,
  Brevpar,
  SARA_KONTAKT,
  SARA_DELAR,
} from '@/components/publikt/v3'
import './personligt-brev.css'

const REGISTRERA = '/register?borja=brev'
const PREMIUM = paketKort()
const PRIS = prisPeriod(SALD_PLAN)

/** Mallsektionens sju kort ur brevets katalog (samma mallar som CV:t). */
const MALLAR = brevMallKortFor(SALJ_MALL_IDS)

const SKRIVTIPS = [
  {
    rubrik: 'Använd annonsens egna ord',
    text: 'Står det "stakeholder management" i annonsen, skriv just den frasen och inte din egen variant. Rekryterare letar efter exakta termer när de skummar.',
    // SEO:s besked: efterexemplet på svenska, annonsens ord över Före och Efter (slutbeskedet punkt 49).
    annons: 'intressentdialog',
    fore: 'Van att hantera intressenter',
    efter: 'Ledde intressentdialogen i tre projekt',
  },
  {
    rubrik: 'Visa siffror, inte adjektiv',
    text: '"Drev försäljningen från 2 till 12 mkr på två år" säger mer än "duktig på försäljning". Konkreta resultat fastnar.',
    fore: 'Duktig på försäljning',
    efter: 'Drev försäljningen från 2 till 12 mkr på två år',
  },
  {
    rubrik: 'Håll brevet under en sida',
    text: '250 till 350 ord räcker. Rekryteraren lägger runt 30 sekunder per ansökan, och korta brev blir lästa i högre grad än långa.',
  },
  {
    rubrik: 'Matcha företagets ton',
    text: 'En konsultbyrå behöver en annan ton än ett nystartat bolag. Läs deras webbplats: skriver de formellt eller lättsamt? Lägg dig nära det.',
  },
  {
    rubrik: 'Skriv tre stycken',
    text: 'Öppna med att visa att du läst annonsen. Förklara i mitten varför just du. Avsluta med ett tydligt nästa steg. Fler stycken gör brevet otydligt.',
  },
] as const

const FORDJUPNING = [
  { href: '/personligt-brev-exempel', rubrik: 'Personligt brev-exempel', text: 'Brev att utgå från, yrke för yrke. Skriv ditt eget från ett av dem.' },
  { href: '/artiklar/hur-skriver-man-ett-personligt-brev', rubrik: 'Hur skriver man ett personligt brev?', text: 'Steg för steg, från annonsen till sista raden.' },
  { href: '/artiklar/bra-personligt-brev', rubrik: 'Bra personligt brev', text: 'Tio kännetecken, med exempel före och efter.' },
  { href: '/artiklar/inleda-personligt-brev', rubrik: 'Inleda ett personligt brev', text: 'Fånga intresset i första meningen utan att låta som alla andra.' },
  { href: '/artiklar/hur-langt-ska-personligt-brev-vara', rubrik: 'Hur långt ska ett personligt brev vara?', text: 'Längden rekryterare faktiskt läser, och vad du stryker.' },
  { href: '/artiklar/personligt-brev-avslutning-exempel', rubrik: 'Avslutningen', text: 'Exempel på ett avslut som leder till ett samtal.' },
]

/**
 * Brevrummets fem toner (namn och underrad som i kontot). Meningarna är
 * statiska exempel, märkta Exempel på sidan: de visar hur tonen skiljer sig,
 * inte exakt vad brevmotorn skriver (SEO:s besked).
 */
const TONER = [
  { namn: 'Balanserad', rad: 'Saklig men varm', mening: 'När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år.' },
  { namn: 'Professionell', rad: 'Saklig och formell', mening: 'Jag söker tjänsten som projektledare. De senaste tre åren har jag lett byggprojekt med fullt budgetansvar.' },
  { namn: 'Självsäker', rad: 'Leder med resultat', mening: 'Jag tog en ombyggnad i mål inom budget och två veckor före plan. Det gör jag gärna om hos er.' },
  { namn: 'Entusiastisk', rad: 'Varm, energisk', mening: 'Upphandling och tidplan i samma roll: er annons beskriver det jag tycker är roligast i yrket.' },
  { namn: 'Kreativ', rad: 'Vågar sticka ut', mening: 'Fyra upphandlingar, en ombyggnad, två veckor till godo. Så ser mina tre senaste år ut.' },
]

/**
 * Annonsens sju krav i hjälten och kravpanelen (skissen och nytt-innehall.md,
 * hjälten och resultatet): kort namn på annonslappen, panelens namn och
 * citatet ur hjältens brev, ord för ord. Arbetsgivaren är påhittad (grundens
 * Nordhaga Bygg), inga projekt på riktiga bolag. Det sjunde saknas.
 */
const KRAV_SJU: readonly { lapp: string; panel: string; citat: string | null }[] = [
  { lapp: 'Projektledning, bygg', panel: 'Projektledning, bygg', citat: 'mina senaste tre år, där jag ledde en ombyggnad' },
  { lapp: 'Upphandling, LOU', panel: 'Offentlig upphandling, LOU', citat: 'Jag har drivit fyra sådana, från förfrågningsunderlag till tilldelning' },
  { lapp: 'Budgetansvar', panel: 'Budgetansvar', citat: 'inom budget och två veckor före plan' },
  { lapp: 'AMA', panel: 'AMA', citat: 'Beskrivningarna skrev jag enligt AMA' },
  { lapp: 'Tidplan', panel: 'Tidplan', citat: 'två veckor före plan' },
  { lapp: 'Entreprenadjuridik', panel: 'Entreprenadjuridik', citat: 'AB 04 och ABT 06 har jag arbetat med i varje kontrakt' },
  { lapp: 'PMP-certifiering', panel: 'PMP-certifiering', citat: null },
]
const KRAV_SVAR = KRAV_SJU.filter((k) => k.citat).length

/** Kravets nummer i brevet, samma som på annonslappen (aria-hidden: bilden har sin aria-label). */
function Kn({ n }: { n: number }) {
  return (
    <i className="pb-kn" aria-hidden="true">
      {n}
    </i>
  )
}

/** Hjältens brev: kraven utmärkta med sina nummer i texten. */
const HJALTE_STYCKEN = [
  'Hej,',
  <>
    När ni söker en <Kn n={1} />
    <mark>projektledare för byggprojekt</mark> som håller ihop upphandling och <Kn n={5} />
    <mark>tidplan</mark> känner jag igen mina senaste tre år, där jag ledde en ombyggnad <Kn n={3} />
    <mark>inom budget och två veckor före plan</mark>.
  </>,
  <>
    Ni skriver att rollen kräver vana vid <Kn n={2} />
    <mark>offentlig upphandling enligt LOU</mark>. Jag har drivit fyra sådana, från förfrågningsunderlag till tilldelning.
  </>,
  <>
    Beskrivningarna skrev jag enligt <Kn n={4} />
    <mark>AMA</mark>, och <Kn n={6} />
    <mark>entreprenadjuridiken</mark> i AB 04 och ABT 06 har jag arbetat med i varje kontrakt.
  </>,
]

export default function PersonligtBrevSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai Personligt brev-verktyg',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    description:
      `Skräddarsy personliga brev som matchar jobbannonsen. ${BREV_MALL_ANTAL} mallar, samma som till ditt CV, och fem toner plus automatiskt tonval i ${PREMIUM}. Läsbart för rekryteringssystem (ATS). Nedladdning som PDF, och som Word i ${BREV_WORD_ANTAL} av mallarna, ingår i ${PREMIUM}.`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Första personliga brevet gratis, sedan ett var sjunde dag. Ingen kortuppgift',
    },
    featureList:
      `${BREV_MALL_ANTAL} brevmallar som matchar CV-mallarna, 5 toner plus automatiskt tonval, läsbart för rekryteringssystem (ATS), PDF i alla mallar och Word i ${BREV_WORD_ANTAL}, brev som sparas av sig själva, matchning mot jobbannonsen, svenska och engelska`,
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett personligt brev med Jobbcoach.ai',
    description:
      'Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, kopiera eller ladda ner.',
    totalTime: 'PT4M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Välj ditt CV',
        text:
          'Ladda upp eller välj ett CV du redan sparat. Vår tjänst plockar ut din erfarenhet och dina styrkor.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Klistra in jobbannonsen',
        text:
          'Vi läser annonsen, identifierar nyckelkraven och matchar dem mot din bakgrund.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Välj mall och ton',
        text:
          `${BREV_MALL_ANTAL} mallar, samma som till ditt CV, och fem toner, från professionell till entusiastisk. Mallen byter du när du vill, utan att skriva om brevet. I Premium kan vi också välja tonen åt dig utifrån annonsen.`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Kopiera eller ladda ner brevet',
        text:
          `Brevet sparas av sig självt i ditt konto. Kopiera texten direkt, eller ladda ner det med ${PREMIUM}: PDF i alla mallar, Word i ${BREV_WORD_ANTAL} av dem.`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BREV_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Stegens bilder (aria-hidden i VagSteg): CV:t, kraven, tre mallar, knapparna.
  const stegBilder = [
    <div className="pb-steg-cv" key="cv">
      <CvArk liten luta={false} nalar={false} vald={0} delar={[SARA_DELAR[0]]} />
      <p>
        <small>Brevet bygger på</small>
        <b>Sara Lindström, projektledare</b>
        <u>Byt CV</u>
      </p>
    </div>,
    <div className="pb-steg-krav" key="krav">
      <i className="pb-l pb-l-ton" />
      <i className="pb-l" />
      <i className="pb-l pb-l-k" />
      <span>
        <em>LOU</em>
        <em>Budgetansvar</em>
        <em>Tidplan</em>
        <em>{`+${KRAV_SJU.length - 3} krav`}</em>
      </span>
    </div>,
    <div className="pb-steg-mallar" key="mallar">
      {(['linne', 'koppar', 'granit'] as const).map((id, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={id} className={i === 0 ? 'pb-vald' : undefined} src={brevMiniatyrSrc(id)} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
      ))}
    </div>,
    <div className="pb-steg-knappar" key="knappar">
      <span>
        <em>Kopiera text</em>
        <em>Word</em>
      </span>
      <em className="pb-koppar">Ladda ner PDF</em>
      <small>Läs och kopiera ingår gratis.</small>
    </div>,
  ]

  return (
    <>
      <RedirectLoggedIn to="/dashboard/skapa-brev" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="brev" id="innehall" className="pb">
        {/* 1. Hjälten: plommonväggen med brevet och annonsens krav */}
        <Hjalte
          id="hjalte"
          // Baslinjen har ingen BreadcrumbList här; schemat ändras bara med SEO:s ja.
          brodsmulorSchema={false}
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Personligt brev', href: '/verktyg/personligt-brev' },
          ]}
          etikett="Personligt brev, skrivet mot annonsen"
          h1="Skräddarsy ditt brev till varje annons"
          varde={
            <>
              Vi läser jobbannonsen och ditt CV, plockar ut kraven som betyder något och skriver ett brev som låter som du. Mall, ton och språk
              väljer du själv. <b>Klart på några minuter.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="/skapa-brev/start" pil data-cta="hero-primary">
                Skriv ett brev nu
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: `${FREE_LETTERS_PER_ACCOUNT} brev`, text: 'gratis, utan kortuppgift' },
            { tal: '4 min', text: 'från annons till brev' },
            { tal: `${BREV_MALL_ANTAL}`, text: 'mallar, samma som till ditt CV' },
          ]}
          bild={
            <div className="pb-kravbild">
              <Brevpar
                annonsTitel="Projektledare, Nordhaga Bygg"
                krav={KRAV_SJU.map((k) => ({ text: k.lapp, uppfyllt: !!k.citat }))}
                stycken={HJALTE_STYCKEN}
                ariaLabel={`Exempel: Sara Lindströms personliga brev med annonsens krav utmärkta. ${storForst(talOrd(KRAV_SVAR, true))} av ${talOrd(KRAV_SJU.length, true)} krav har fått svar.`}
              />
            </div>
          }
          lyft
        />

        {/* 2. Prova utan konto: lyftkortet */}
        <Lyft id="prova" etikett="Skriv ett brev utan konto">
          <div className="pb-prova">
            <div>
              <p className="p3-ey">Prova utan konto</p>
              <h2 className="p3-h2">Skriv ett brev utan konto</h2>
              <p className="p3-varde">
                {`Klistra in annonsen och berätta kort om dig. ${PREVIEW_PARAGRAPHS === 1 ? 'Första stycket' : `De ${talOrd(PREVIEW_PARAGRAPHS, true)} första styckena`} ser du direkt, hela brevet när du skapat ett gratiskonto.`}
              </p>
              {/* Annonsfältet är ett riktigt fält (beslut 6): annonsen följer med in i startflödet via fliken, aldrig adressen. Knappen är samma länk som förut. */}
              <AnnonsFalt under={<p className="p3-liten">Har du ingen annons? Börja med tjänsten och arbetsgivaren.</p>}>
                <Knapp href="/skapa-brev/start" pil data-cta="prova-annons">
                  Skriv ett brev nu
                </Knapp>
              </AnnonsFalt>
            </div>
            <div>
              <p className="p3-ey">Så mycket är gratis</p>
              <ul className="pb-gratis">
                <li>
                  <span className="pb-ikon">
                    <Ikon namn="bock" />
                  </span>
                  <span>
                    <b>Ingen registrering innan du ser hur brevet börjar</b>
                    <small>Första stycket står på arket direkt.</small>
                  </span>
                </li>
                <li>
                  <span className="pb-ikon">
                    <Ikon namn="bock" />
                  </span>
                  <span>
                    <b>Första personliga brevet gratis, sedan ett var sjunde dag</b>
                    <small>Utan kortuppgift. Allt du skrivit ligger kvar, och de två senaste breven går att ändra.</small>
                  </span>
                </li>
                <li>
                  <span className="pb-ikon">
                    <Ikon namn="las" />
                  </span>
                  <span>
                    <b>{`Nedladdning som PDF och Word ingår i ${PREMIUM}`}</b>
                    <small>Att läsa och kopiera texten är gratis.</small>
                  </span>
                </li>
              </ul>
              <p className="p3-liten pb-prova-not">
                Vill du se ett färdigt först?{' '}
                <Link className="p3-lank" href="/personligt-brev-exempel">
                  Brev yrke för yrke
                </Link>
              </p>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det: stegen som väg och tonerna */}
        <Sektion id="sa-funkar-det" botten="golv">
          <SektionHuvud
            etikett="Från annons till ansökan"
            rubrik="Så fungerar det"
            varde="Fyra steg från tomt papper till färdig ansökan. CV, annons, mall och ton väljer du på en och samma skärm, och allt går att ändra efteråt."
          />
          <VagSteg steg={howToSchema.step.map((s, i) => ({ rubrik: s.name, text: s.text, bild: stegBilder[i], koppar: i === 3 }))} />

          <div className="pb-toner">
            <div className="pb-toner-huvud">
              <div>
                <p className="p3-ey">Tonen</p>
                <p className="pb-toner-rubrik">Fem toner. Samma erfarenhet, olika röst.</p>
                <p className="p3-text">
                  Exempel på hur Saras första mening kan låta i var och en av dem. I kontot väljer du ton innan brevet skrivs. Byter du efteråt skriver vi om brevet i den nya tonen.
                </p>
              </div>
              <span className="pb-sprak" aria-label="Språk: svenska och engelska">
                <span>Svenska</span>
                <span>English</span>
              </span>
            </div>
            <ul className="pb-ton-lista">
              {TONER.map((t, i) => (
                <li key={t.namn} className={i === 0 ? 'pb-ton-vald' : undefined}>
                  <b>{t.namn}</b>
                  <small>{t.rad}</small>
                  <span className="pb-ton-exempel">
                    <Chip>Exempel</Chip>
                    <q>{t.mening}</q>
                  </span>
                </li>
              ))}
            </ul>
            <p className="pb-ton-auto">
              <Chip typ="premium">Premium</Chip>
              <b>Vi väljer ton åt dig</b>
              <span>Vi läser annonsens språk och bransch och skriver i den ton arbetsgivaren själv använder.</span>
            </p>
          </div>
          <div className="p3-knapprad pb-luft">
            <Knapp href={REGISTRERA}>Börja skriva nu</Knapp>
          </div>
        </Sektion>

        {/* 4. Mallarna */}
        <Sektion id="mallar" botten="ton">
          <div className="pb-mallar-huvud">
            <SektionHuvud
              etikett="Mallar"
              rubrik={`${BREV_MALL_ANTAL} mallar för personliga brev`}
              varde={
                <>
                  Brevet skrivs i samma mallar som ditt CV, så att ansökan hänger ihop. Du provar alla med ditt eget brev och byter utan att skriva om
                  något. <b>{BREV_GRATIS_NAMN} är gratis</b>, de övriga {BREV_PREMIUM_ANTAL} ingår i {PREMIUM}, {PRIS}.
                </>
              }
            />
            <div className="pb-paret" aria-hidden="true">
              <div className="pb-paret-cv">
                <span className="pb-paret-chip">Ditt CV</span>
                <CvArk liten luta={false} nalar={false} vald={0} />
              </div>
              <div className="pb-paret-brev">
                <div className="p3-ark p3-brevark">
                  <div className="p3-ark-namn">Sara Lindström</div>
                  <span className="p3-ark-kontakt">{SARA_KONTAKT}</span>
                  <div className="p3-ark-rubrik">Ansökan: projektledare</div>
                  <p className="p3-ark-stycke">Hej,</p>
                  <p className="p3-ark-stycke">När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år.</p>
                  <i className="p3-l" />
                  <i className="p3-l p3-m" />
                  <i className="p3-l p3-k" />
                </div>
                <span className="pb-paret-chip pb-koppar">Ditt brev</span>
              </div>
            </div>
          </div>
          <ul className="pb-mallar">
            {MALLAR.map((m) => {
              const gratis = m.niva === 'gratis'
              return (
                <li className="pb-mall" key={m.id}>
                  <span className="pb-mall-bild">
                    {/* Brevets egen miniatyr, ritad av brevmotorn (scripts/brevmallar-miniatyrer.ts). */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brevMiniatyrSrc(m.id)} alt={`Personligt brev i mallen ${m.namn}`} width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                  </span>
                  <h3>{m.namn}</h3>
                  <p>{m.kort}.</p>
                  <p className="pb-mall-rad">
                    <Chip typ={gratis ? 'gratis' : 'premium'}>{gratis ? 'Gratis' : PREMIUM}</Chip>
                    <span>{formatMarke(m.word)}</span>
                  </p>
                </li>
              )
            })}
            <li className="pb-mall pb-mall-mer">
              <Link href="/cv-mallar">
                <span className="pb-mer-bilder" aria-hidden="true">
                  {(['linne', 'bjork', 'kalksten', 'fasad'] as const).map((id) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={id} src={brevMiniatyrSrc(id)} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                  ))}
                </span>
                <span className="pb-mer-tal">{BREV_MALL_ANTAL}</span>
                <b>Alla mallarna</b>
                <span className="pb-mer-text">{`Brev och CV i samma mall. Se alla ${BREV_MALL_ANTAL} bland CV-mallarna.`}</span>
                <span className="p3-lank">Till mallarna</span>
              </Link>
            </li>
          </ul>
          <p className="pb-luft">
            <Link className="p3-lank" href="/personligt-brev-exempel">
              Se ett färdigt brev för ditt yrke
            </Link>
          </p>
        </Sektion>

        {/* 5. Skrivtips: brevets tre stycken och de fem reglerna */}
        <Sektion id="skrivtips" botten="papper">
          <SektionHuvud
            etikett="Skrivtips"
            rubrik="Fem regler som höjer svarsfrekvensen"
            varde="Vår tjänst följer dem automatiskt. Skriver du själv vet du nu vad rekryterare faktiskt reagerar på."
          />
          <div className="pb-regler">
            <div className="pb-tre" data-p3-farg="brev">
              <p className="p3-ey">Brevets tre stycken</p>
              <ol className="pb-tre-ark" aria-label="Brevets tre stycken">
                <li>
                  <Nr typ="vagg">1</Nr>
                  <span>
                    <b>Öppningen</b>Visa att du läst annonsen, med deras egna ord.
                    <em>&quot;När ni söker en projektledare som håller ihop upphandling och tidplan ...&quot;</em>
                  </span>
                </li>
                <li>
                  <Nr typ="vagg">2</Nr>
                  <span>
                    <b>Mitten</b>Varför just du, med en siffra per påstående.
                    <em>&quot;... där jag ledde en ombyggnad inom budget och två veckor före plan.&quot;</em>
                  </span>
                </li>
                <li>
                  <Nr typ="vagg">3</Nr>
                  <span>
                    <b>Avslutet</b>Ett tydligt nästa steg, inte ett tack.
                    <em>&quot;Jag berättar gärna mer om hur jag skulle lägga upp de första nittio dagarna.&quot;</em>
                  </span>
                </li>
              </ol>
              <div className="pb-skala" aria-hidden="true">
                <span>för kort</span>
                <b>250 till 350 ord</b>
                <span>för långt</span>
              </div>
              <p className="pb-tre-fot">En sida, 250 till 350 ord. Det är vad en rekryterare hinner läsa på 30 sekunder.</p>
            </div>
            <ol className="pb-regel-lista">
              {SKRIVTIPS.map((r, i) => (
                <li key={r.rubrik} className="pb-regel">
                  <Nr>{i + 1}</Nr>
                  <div>
                    <h3 className="p3-h3">{r.rubrik}</h3>
                    <p>{r.text}</p>
                    {'fore' in r ? (
                      <p className="pb-fe">
                        {'annons' in r ? <span className="pb-fe-annons">I annonsen: {r.annons}</span> : null}
                        <s>{r.fore}</s>
                        <b>{r.efter}</b>
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Sektion>

        {/* 6. Resultat: kravpanelen på en ö */}
        <Sektion id="resultat" botten="golv">
          <div className="p3-o pb-resultat">
            <div className="pb-resultat-rad">
              <div className="pb-resultat-text">
                <div className="p3-o-huvud">
                  <Dorr ikon="brev" />
                  <p className="p3-ey">Resultat</p>
                </div>
                <h2 className="p3-h2">När brevet svarar mot kraven har rekryteraren en anledning att ringa</h2>
                <p className="p3-varde">
                  Varje krav i annonsen får en siffra, och du ser i brevet var det besvaras.{' '}
                  <b>Saknas ett krav lägger du till en mening om det när brevet är klart.</b>
                </p>
              </div>
              <div className="pb-krav" role="img" aria-label="Exempel: kraven i annonsen och var Saras brev svarar på dem">
                <p className="pb-krav-huvud">
                  <b>Kraven i annonsen</b>
                  <span>{`${KRAV_SVAR} av ${KRAV_SJU.length} har fått svar i brevet`}</span>
                </p>
                <ol>
                  {KRAV_SJU.map((k, i) =>
                    k.citat ? (
                      <li key={k.panel}>
                        <i>{i + 1}</i>
                        <span>
                          <b>{k.panel}</b>
                          <q>&quot;{k.citat}&quot;</q>
                        </span>
                      </li>
                    ) : null
                  )}
                </ol>
                {KRAV_SJU.map((k, i) => (k.citat ? null : { k, nr: i + 1 })).filter((x): x is { k: (typeof KRAV_SJU)[number]; nr: number } => x !== null).map(({ k, nr }) => (
                  <div className="pb-krav-saknas" key={k.panel}>
                    <p>
                      <i>{nr}</i>
                      <span>
                        <b>{k.panel}</b>
                        <small>Står i annonsen men inte i brevet.</small>
                      </span>
                    </p>
                    <span className="pb-krav-falt">En mening med ett exempel ur ditt CV räcker.</span>
                    <span className="pb-krav-knapp">Lägg till i brevet</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pb-resultat-kort">
              <div className="p3-kort">
                <h3 className="p3-h3">Ett brev gratis</h3>
                <p>
                  <Chip typ="gratis">utan kortuppgift</Chip>
                </p>
                <p>Sedan skriver du ett nytt i veckan, utan kortuppgift. Allt du skrivit ligger kvar att läsa och kopiera, och de två senaste går att ändra.</p>
              </div>
              <div className="p3-kort">
                <h3 className="p3-h3">PDF och Word</h3>
                <p>
                  <Chip typ="premium">Premium</Chip>
                </p>
                <p>Nedladdningen ingår i {PREMIUM}. Word när annonsen vill ha ett format du kan ändra i.</p>
              </div>
              <div className="pb-kort-mork">
                <h3 className="p3-h3">{PRIS}</h3>
                <p>
                  Allt i {PREMIUM}: personliga brev utan tak, alla {BREV_MALL_ANTAL} mallar, PDF och Word. Säg upp när du vill i ditt konto.
                </p>
              </div>
            </div>
            <div className="p3-knapprad pb-luft">
              <Knapp href={REGISTRERA}>Skriv ditt första brev gratis</Knapp>
            </div>
          </div>
        </Sektion>

        {/* 7. Fördjupning: exempelnavet och artiklarna */}
        <Sektion id="las-mer" botten="golv" luft="utan-topp">
          <SektionHuvud
            etikett="Fördjupning"
            rubrik="Läs mer om personliga brev"
            varde="Färdiga exempel att utgå från och guiderna till det som avgör: inledningen, längden och avslutet."
          />
          <div className="pb-fordjup">
            <Link className="pb-navkort" href={FORDJUPNING[0].href}>
              <span className="pb-navkort-ark" aria-hidden="true">
                {(['bjork', 'linne', 'koppar'] as const).map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={id} src={brevMiniatyrSrc(id)} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                ))}
              </span>
              <span className="pb-navkort-tal">{BREV_GALLERI.length}</span>
              <h3 className="p3-h3">{FORDJUPNING[0].rubrik}</h3>
              <span className="pb-navkort-text">{FORDJUPNING[0].text}</span>
              <span className="p3-lank">Se alla yrken</span>
            </Link>
            <ul className="pb-artiklar">
              {FORDJUPNING.slice(1).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="p3-lankbricka">
                    <Dorr ikon="brev" />
                    <h3>{l.rubrik}</h3>
                    <span>{l.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Sektion>

        {/* 8. Premium */}
        <Sektion botten="golv" luft="tat">
          <PremiumO
            etikett={
              // Priset följer kampanjen som biljetten under (kampanjmärket 2026-11-23).
              <>
                {/* Under en kampanj bär biljetten bredvid priset: etiketten säger då bara
                    paketets namn, annars stod priset två gånger med märket mitt i versalraden. */}
                <KampanjVarianter ord={`${paketNamn(SALD_PLAN)}, ${PRIS}`} kampanj={() => paketNamn(SALD_PLAN)} />
              </>
            }
            rubrik="Ditt nästa brev tar tre minuter, inte tre timmar."
            text={`Första brevet är gratis och kräver ingen kortuppgift, sedan ett var sjunde dag. Personliga brev utan tak, alla mallar och nedladdning som PDF och Word ingår i ${PREMIUM}.`}
            uppsagning
            knapp={
              <>
                <Knapp href={REGISTRERA}>Skapa ditt brev gratis</Knapp>
                <TextLank href="/priser">{`Se vad som ingår i ${PREMIUM}`}</TextLank>
              </>
            }
            punkter={[
              'Personliga brev utan tak, med tonen vald åt dig',
              `Alla ${BREV_MALL_ANTAL} mallar, PDF i alla och Word i ${BREV_WORD_ANTAL}`,
              'Rekryteringstester, CV-analysens alla förslag och jobbmatchning',
            ]}
          />
        </Sektion>

        {/* 9. Frågorna */}
        <Sektion id="fragor" botten="ton">
          <Faq
            rubrik="Det du undrar om brevverktyget"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <a className="p3-lank" href="mailto:support@jobbcoach.ai">
                  Hör av dig
                </a>
                .
              </>
            }
            fragor={BREV_FAQ_ITEMS}
          />
        </Sektion>
      </Sida>
    </>
  )
}
