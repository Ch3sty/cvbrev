/**
 * /verktyg/personligt-brev, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.4, skissen v4 flik #brev).
 *
 * Hjälten på plommon vägg med brevet i telefonen, prova-kortet för ett brev
 * utan konto, Så fungerar det med annonssteget, mallarna som miniatyrer,
 * skrivtipsen med brevet i tre stycken, resultatkorten, fördjupningen,
 * Premium på bläck och frågorna.
 *
 * SEO: h1, metadata och schemat (WebApplication, HowTo, FAQPage) oförändrade.
 * Baslinjens h2 och h3 står kvar med samma text och nivå. Nya h2: "Skriv ett
 * brev utan konto" och "Läs mer om personliga brev". Gratisbrevet enligt
 * koden: första brevet gratis, sedan ett per rullande sju dygn (avsnitt 7).
 * Serverkomponent; klient-JS bara för FastKnapprad.
 */
import Link from 'next/link'
import { BREV_FAQ_ITEMS } from './components/brev-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { LETTER_TEMPLATES } from '@/lib/letters/letter-templates'
import { PREVIEW_PARAGRAPHS } from '@/lib/letters/public-draft-tal'
import { FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'
import PubliktSida from '@/components/publikt/PubliktSida'
import Hjalte from '@/components/publikt/Hjalte'
import Rum from '@/components/publikt/Rum'
import ProvaKort from '@/components/publikt/ProvaKort'
import Steg from '@/components/publikt/Steg'
import Objekt from '@/components/publikt/Objekt'
import LankLista from '@/components/publikt/LankLista'
import Faq from '@/components/publikt/Faq'
import PremiumBlock, { PremiumOrd } from '@/components/publikt/PremiumBlock'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import SvavandeObjekt from '@/components/publikt/SvavandeObjekt'
import MallMiniatyr, { TreStycken } from '@/components/publikt/MallMiniatyr'
import { talOrd } from '@/components/publikt/talord'
import SkarmBrev from '@/components/publikt/telefon/skarmar/SkarmBrev'
import SkarmAnnons from '@/components/publikt/telefon/skarmar/SkarmAnnons'

const REGISTRERA = '/register?borja=brev'
const PREMIUM = paketKort()
const PRIS = prisPeriod(SALD_PLAN)

/** Svensk text per brevmall. Antal och nivå kommer ur registret. */
const MALLTEXT: Record<string, { text: string; branscher: string }> = {
  classic: { text: 'Traditionell svensk standard.', branscher: 'Offentlig sektor, vård, utbildning' },
  minimalist: { text: 'Generösa marginaler och en lugn känsla.', branscher: 'Tech, design, konsult' },
  compact: { text: 'Kontaktuppgifterna på en rad och tät text.', branscher: 'Tech, fintech, moderna bolag' },
  modern: { text: 'Accentstreck och ett tydligt mottagarblock.', branscher: 'Marknadsföring, finans, konsult' },
  executive: { text: 'Sidofält för kontaktuppgifterna.', branscher: 'Bank, juridik, ledning' },
  creative: { text: 'Ett färgat sidhuvud som syns.', branscher: 'Design, reklam, media' },
  traditional: { text: 'Konservativ och med justerad text.', branscher: 'Bank, juridik, försäkring' },
}

const MALLAR = Object.values(LETTER_TEMPLATES)
const MALLANTAL = MALLAR.length
const GRATISMALLAR = MALLAR.filter((m) => m.tier === 'free').length

const SKRIVTIPS = [
  {
    rubrik: 'Använd annonsens egna ord',
    text: 'Står det "stakeholder management" i annonsen, skriv just den frasen och inte din egen variant. Rekryterare letar efter exakta termer när de skummar.',
  },
  {
    rubrik: 'Visa siffror, inte adjektiv',
    text: '"Drev försäljningen från 2 till 12 mkr på två år" säger mer än "duktig på försäljning". Konkreta resultat fastnar.',
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
]

const FORDJUPNING = [
  { href: '/personligt-brev-exempel', rubrik: 'Personligt brev-exempel', text: 'Brev som fungerat, yrke för yrke. Skriv ditt eget från ett av dem.' },
  { href: '/artiklar/hur-skriver-man-ett-personligt-brev', rubrik: 'Hur skriver man ett personligt brev?', text: 'Steg för steg, från annonsen till sista raden.' },
  { href: '/artiklar/bra-personligt-brev', rubrik: 'Bra personligt brev', text: 'Tio kännetecken, med exempel före och efter.' },
  { href: '/artiklar/inleda-personligt-brev', rubrik: 'Inleda ett personligt brev', text: 'Fånga intresset i första meningen utan att låta som alla andra.' },
  { href: '/artiklar/hur-langt-ska-personligt-brev-vara', rubrik: 'Hur långt ska ett personligt brev vara?', text: 'Längden rekryterare faktiskt läser, och vad du stryker.' },
  { href: '/artiklar/personligt-brev-avslutning-exempel', rubrik: 'Avslutningen', text: 'Exempel på ett avslut som leder till ett samtal.' },
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
      'Skräddarsy personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, ATS-optimerat. Export som PDF eller Word.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Första brevet gratis, sedan ett i veckan. Ingen kortuppgift',
    },
    featureList:
      '7 brevmallar, 6 tonaliteter, ATS-optimerat, PDF- och Word-export, sparade brev, jobbannons-matchning, svensk- och engelskspråkigt',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett personligt brev med Jobbcoach.ai',
    description:
      'Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, ladda ner.',
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
          'Sju mallar för olika branscher och sex tonalitetsval, från professionellt till entusiastiskt.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ladda ner som PDF eller Word',
        text:
          'Granska, finjustera om du vill, exportera. Spara brevet i ditt konto för senare.',
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

  return (
    <>
      <RedirectLoggedIn to="/dashboard/skapa-brev" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <PubliktSida>
        <div id="innehall">
          {/* 1. Hjälten: plommon vägg */}
          <Hjalte
            id="hjalte"
            rum="brev"
            yta="vagg"
            vag="mark"
            brodsmulor={[
              { name: 'Hem', href: '/' },
              { name: 'Verktyg', href: '/funktioner' },
              { name: 'Personligt brev', href: '/verktyg/personligt-brev' },
            ]}
            kick="Personligt brev, skrivet mot annonsen"
            h1="Skräddarsy ditt brev till varje annons"
            ingress="Vi läser jobbannonsen och ditt CV, plockar ut nyckelorden som betyder något och skriver ett brev som låter som du. Mall, ton och språk väljer du själv."
            fet="Klart på några minuter."
            primar={{ text: 'Skapa ditt brev gratis', href: REGISTRERA, dataCta: 'hero-primary' }}
            sekundar={{ text: 'Så fungerar det', href: '#sa-funkar-det' }}
            tal={[
              { tal: `${FREE_LETTERS_PER_ACCOUNT} brev`, text: 'gratis, utan kortuppgift' },
              { tal: '4 min', text: 'från annons till brev' },
              { tal: `${MALLANTAL} mallar`, text: 'PDF och Word' },
            ]}
            bildLag
            bild={
              <>
                <SvavandeObjekt objekt="brev" rot={-7} plats={{ left: -4, top: 36 }} bredd={96} mobil={{ left: -6, top: 30, bredd: 80 }} />
                <SvavandeObjekt objekt="match" rot={6} plats={{ right: -8, top: 96 }} bredd={140} mobil={{ right: -10, top: 110, bredd: 116 }} />
                <SvavandeObjekt objekt="bock" plats={{ right: 28, bottom: 54 }} bredd={46} doljPaMobil />
                <SkarmBrev />
              </>
            }
          />

          {/* 2. Prova utan konto */}
          <Rum yta="mark" storlek="tat" id="prova">
            <div className="pub-wrap">
              <ProvaKort
                rum="brev"
                rubrik="Skriv ett brev utan konto"
                text={`Klistra in annonsen och berätta kort om dig. ${PREVIEW_PARAGRAPHS === 1 ? 'Första stycket' : `De ${talOrd(PREVIEW_PARAGRAPHS, true)} första styckena`} ser du direkt, hela brevet när du skapat ett gratiskonto.`}
                punkter={[
                  'Ingen registrering innan du ser hur brevet börjar',
                  'Första brevet gratis, sedan ett nytt i veckan',
                  `Nedladdning som PDF och Word ingår i ${PREMIUM}`,
                ]}
                knapp={{ text: 'Skriv ett brev nu', href: '/skapa-brev/start' }}
                not={
                  <>
                    Vill du se ett färdigt först?{' '}
                    <Link className="pub-lank" href="/personligt-brev-exempel">
                      Brev yrke för yrke
                    </Link>
                  </>
                }
              />
            </div>
          </Rum>

          {/* 3. Så fungerar det, med annonssteget */}
          <Rum yta="panel" id="sa-funkar-det">
            <div className="pub-wrap pub-tva pub-omv">
              <div className="pub-tva-text pub-rum-brev">
                <h2 className="pub-h2">Så fungerar det</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  Fyra steg från tomt papper till färdig ansökan. Du gör valen, vi sätter ihop brevet.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Steg rader={howToSchema.step.map((s) => ({ rubrik: s.name, text: s.text }))} />
                </div>
                <div className="pub-handling">
                  <Link className="pub-knapp" href={REGISTRERA}>
                    Börja skriva nu
                  </Link>
                </div>
              </div>
              <div className="pub-mitt">
                <SkarmAnnons />
              </div>
            </div>
          </Rum>

          {/* 4. Mallarna */}
          <Rum yta="ton" rum="brev" id="mallar">
            <div className="pub-wrap">
              <p className="pub-kick">Mallar</p>
              <h2 className="pub-h2">{`${MALLANTAL} mallar, en för varje bransch`}</h2>
              <p className="pub-ingress" style={{ marginTop: 16 }}>
                Alla mallar går att läsa för rekryteringssystemen svenska arbetsgivare använder. Byt mall utan att skriva om
                brevet. {GRATISMALLAR} av dem är gratis och räcker långt för de flesta ansökningar, resten ingår i {PREMIUM}, {PRIS}.
              </p>
              <div className="pub-mallar">
                {MALLAR.map((m) => (
                  <div className="pub-mall" key={m.id}>
                    <div className="pub-mall-bild">
                      <MallMiniatyr id={m.id} />
                    </div>
                    <h3>{m.name}</h3>
                    <p>
                      {MALLTEXT[m.id] ? `${MALLTEXT[m.id].text} Passar ${MALLTEXT[m.id].branscher.toLowerCase()}.` : m.description}
                    </p>
                    <span className={`pub-tagg ${m.tier === 'free' ? '' : 'pub-tagg-prem'}`.trim()}>
                      {m.tier === 'free' ? 'Gratis' : `Ingår i ${PREMIUM}`}
                    </span>
                  </div>
                ))}
                <Link className="pub-mall pub-mall-mer" href="/personligt-brev-exempel">
                  <span className="pub-mer-tal">{MALLANTAL}</span>
                  <b className="pub-h4">Se mallarna i färdiga brev</b>
                  <p>Exempel yrke för yrke, så ser du hur varje mall bär ett riktigt brev.</p>
                  <span className="pub-lank">Till exemplen</span>
                </Link>
              </div>
            </div>
          </Rum>

          {/* 5. Skrivtips, med brevet i tre stycken */}
          <Rum yta="mark" id="skrivtips">
            <div className="pub-wrap pub-tva pub-tva-topp">
              <div className="pub-tva-text pub-rum-brev">
                <p className="pub-kick">Skrivtips</p>
                <h2 className="pub-h2">Fem regler som höjer svarsfrekvensen</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  Vår tjänst följer dem automatiskt. Skriver du själv vet du nu vad rekryterare faktiskt reagerar på.
                </p>
                <div style={{ marginTop: 28 }}>
                  <Steg rader={SKRIVTIPS} />
                </div>
              </div>
              <div className="pub-kort pub-rum-brev">
                <div className="pub-tre">
                  <TreStycken />
                  <ol aria-label="Brevets tre stycken">
                    <li>
                      <span>
                        <b>Öppningen</b>Visa att du läst annonsen, med deras egna ord.
                      </span>
                    </li>
                    <li>
                      <span>
                        <b>Mitten</b>Varför just du, med en siffra per påstående.
                      </span>
                    </li>
                    <li>
                      <span>
                        <b>Avslutet</b>Ett tydligt nästa steg, inte ett tack.
                      </span>
                    </li>
                  </ol>
                </div>
                <p className="pub-liten pub-kort-fot">En sida, 250 till 350 ord. Det är vad en rekryterare hinner läsa på 30 sekunder.</p>
              </div>
            </div>
          </Rum>

          {/* 6. Resultat */}
          <Rum yta="panel" id="resultat">
            <div className="pub-wrap">
              <p className="pub-kick">Resultat</p>
              <h2 className="pub-h2" style={{ maxWidth: '24ch' }}>
                När brevet svarar mot kraven har rekryteraren en anledning att ringa
              </h2>
              <div className="pub-raster pub-raster-3 pub-rum-brev" style={{ marginTop: 36 }}>
                <div className="pub-kort">
                  <Objekt typ="brev" />
                  <h3 className="pub-h4">Ett brev gratis</h3>
                  <p>Sedan skriver du ett nytt i veckan, utan kortuppgift. Allt du skrivit ligger kvar att läsa och kopiera.</p>
                </div>
                <div className="pub-kort">
                  <Objekt typ="ladda" />
                  <h3 className="pub-h4">PDF och Word</h3>
                  <p>Nedladdningen ingår i {PREMIUM}. Word när annonsen vill ha ett format du kan ändra i.</p>
                </div>
                <div className="pub-kort pub-kort-premium">
                  <Objekt typ="uppat" />
                  <h3 className="pub-h4">{PRIS}</h3>
                  <p>
                    Allt i {PREMIUM}: personliga brev utan tak, alla {talOrd(MALLANTAL)} mallar, PDF och Word. Säg upp när du vill i
                    ditt konto.
                  </p>
                </div>
              </div>
              <div className="pub-handling" style={{ marginTop: 32 }}>
                <Link className="pub-knapp" href={REGISTRERA}>
                  Skriv ditt första brev gratis
                </Link>
              </div>
            </div>
          </Rum>

          {/* 7. Fördjupning */}
          <Rum yta="mark" id="las-mer">
            <div className="pub-wrap">
              <p className="pub-kick">Fördjupning</p>
              <h2 className="pub-h2">Läs mer om personliga brev</h2>
              <p className="pub-ingress" style={{ margin: '16px 0 32px' }}>
                Färdiga exempel att utgå från och guiderna till det som avgör: inledningen, längden och avslutet.
              </p>
              <LankLista rubrikNiva="h3" className="pub-rum-brev" lankar={FORDJUPNING} />
            </div>
          </Rum>

          {/* 8. Premium-avslutet */}
          <PremiumBlock
            kick={
              <>
                Jobbcoach <PremiumOrd />, {PRIS}
              </>
            }
            rubrik="Ditt nästa brev tar tre minuter, inte tre timmar."
            text={`Första brevet är gratis och kräver ingen kortuppgift, sedan skriver du ett nytt i veckan. Personliga brev utan tak, alla mallar och nedladdning som PDF och Word ingår i ${PREMIUM}.`}
            knapp={{ text: 'Skapa ditt brev gratis', href: REGISTRERA }}
            lank={{ text: `Se vad som ingår i ${PREMIUM}`, href: '/priser' }}
          />

          {/* 9. Frågorna */}
          <Rum yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq
                rubrik="Det du undrar om brevverktyget"
                ingress={
                  <>
                    Hittar du inte svaret?{' '}
                    <a className="pub-lank" href="mailto:support@jobbcoach.ai">
                      Hör av dig
                    </a>
                    .
                  </>
                }
                fragor={BREV_FAQ_ITEMS}
              />
            </div>
          </Rum>
        </div>
        <FastKnapprad text="Skapa ditt brev gratis" href={REGISTRERA} observera="hjalte" />
      </PubliktSida>
    </>
  )
}
