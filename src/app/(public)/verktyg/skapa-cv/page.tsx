/**
 * /verktyg/skapa-cv i publikt omgång 3 (skissen skapa-cv,
 * docs/design/publikt-omgang3/sidor/skapa-cv.html), byggd med grundens
 * komponenter (src/components/publikt/v3). SEO-svepet 2026-11-17
 * (docs/plan-seo-cv-kluster-2026-11-17.md, B1): texten, löftena, stegen och
 * schemat beskriver nya byggaren "Direkt på arket". h1 står kvar
 * (rankingsignal). SEO:s besked på skisserna avsnitt 7.
 */
import Link from 'next/link'
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
  VagSteg,
  Faq,
  O,
  PremiumO,
  Knapp,
  Knapprad,
  TextLank,
  ByggarArk,
  Svav,
  Ikon,
  MallMiniatyr,
} from '@/components/publikt/v3'
import { SKAPA_CV_FAQ_ITEMS } from './components/skapa-cv-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { paketKort } from '@/lib/plans/plans'
import { TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT, WORD_TEMPLATE_COUNT_ORD, talSomOrd } from '@/lib/cv/template-antal'
import { FORVALD_MALL_ID, MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import { FREE_CV_BYGG_AI_PER_ACCOUNT, PAID_CV_BYGG_AI_PER_DAY } from '@/lib/quota/quotaService'
import { TITEL_MAX } from './startval'
import './skapa-cv.css'

const versal = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/** Förslagen från Jobbcoachen, talen ur kvoterna (sälj S4: alltid "på ditt konto"). */
const FORSLAG_GRATIS = versal(talSomOrd(FREE_CV_BYGG_AI_PER_ACCOUNT))

type Funktion = { rubrik: string; text: string; bild?: 'las' | 'sparat' | 'fran' | 'tel' }

/** De fyra som står som numrerad lista bredvid arket på plattan. */
const FUNKTIONER_PLATTA: Funktion[] = [
  {
    rubrik: 'Arket är byggaren',
    text: 'Du skriver direkt i mallen. Tryck på ett avsnitt, fyll i och se raden landa där den ska stå. Grå exempeltext visar vad som brukar stå där och följer inte med i filen.',
  },
  {
    rubrik: 'Jobbcoachen skriver punkterna',
    text: `Tryck på Skriv punkter åt mig så föreslår Jobbcoachen punkter utifrån yrket och det du skrivit. Du väljer, ändrar eller hoppar över. ${FORSLAG_GRATIS} förslag ingår gratis på ditt konto. I Premium får du ${PAID_CV_BYGG_AI_PER_DAY} per dygn.`,
  },
  {
    rubrik: 'Rubriker som följer yrket',
    text: 'Skriv vilket jobb du söker så får avsnitten rubriker för din bransch, till exempel Klinisk erfarenhet i vården. Du kan också skriva en egen rubrik.',
  },
  {
    rubrik: `Ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna`,
    text: `Alla mallar laddas ner som PDF. Välj en av de ${WORD_TEMPLATE_COUNT_ORD} Word-mallarna när du vill ändra i filen själv, eller när annonsen ber om ett format som går att redigera. I gratismallarna kostar Word-filen inget, i de övriga ingår den i ${paketKort()}.`,
  },
]

/** De fyra som kort med var sin liten bild under plattan. */
const FUNKTIONER_KORT: Funktion[] = [
  {
    rubrik: 'Mallar som rekryteringssystemen kan läsa',
    text: 'Alla mallar är byggda för systemen svenska arbetsgivare sorterar ansökningar med. Rena rubriker, läsbar struktur och ingen formatering som förvirrar maskinen.',
    bild: 'las',
  },
  {
    // Lagringsundantaget (ägarens besked 2026-11-17): beskriver hur nya
    // byggaren sparar, inget annat (ByggareClient.tsx, sparaServer).
    rubrik: 'Utkastet väntar på dig',
    text: 'CV:t sparas i ditt konto när du sparat första avsnittet, och sedan efter varje avsnitt. Du fortsätter där du slutade under Ditt CV, på vilken enhet som helst.',
    bild: 'sparat',
  },
  {
    rubrik: 'Börja från ett CV du redan har',
    text: 'Ladda upp ditt gamla CV, eller en PDF av din LinkedIn-profil, så läser vi ut roller, utbildning och kompetenser åt dig. Du slipper skriva allt en gång till.',
    bild: 'fran',
  },
  {
    rubrik: 'Fungerar lika bra i mobilen',
    text: 'Hela byggaren är gjord för mobilen först. Bygg hela CV:t i telefonen, och när du sparat det öppnar du det på datorn för att ladda ner.',
    bild: 'tel',
  },
]

/** De tre första i katalogen (gratismallarna först), med mallens korta rad och stil. */
const UTVALDA = MALL_KATALOG.slice(0, 3)
/** Sju miniatyrer till i raden under, och talen ur katalogen. */
const FLER = MALL_KATALOG.slice(3, 10)
const FOTO_ANTAL = MALL_KATALOG.filter((m) => m.foto).length

/** Förvalsmallen (Linne) som stillbild av arket (P6). */
const FORVALD = getMallKort(FORVALD_MALL_ID)!
const PROVA_HREF = `/cv-mallar/prova?mall=${FORVALD.id}`

const STEG = [
  {
    name: 'Skriv vilket jobb du söker',
    text: 'Yrkestiteln styr rubrikerna, den grå exempeltexten och Jobbcoachens förslag, så att CV:t talar branschens språk från början.',
  },
  {
    name: 'Ladda upp ett CV eller skriv från början',
    text: 'Har du ett CV i PDF eller Word, eller en PDF av din LinkedIn-profil, fyller vi i avsnitten åt dig. Annars börjar du på ett tomt ark.',
  },
  {
    name: 'Fyll i direkt på arket',
    text: 'Tryck på ett avsnitt och skriv. När du kommer till ett jobb trycker du på Skriv punkter åt mig så föreslår Jobbcoachen punkterna.',
  },
  {
    name: 'Välj mall och ladda ner',
    text: `Byt mall, färg och typsnitt utan att något försvinner, och ladda ner som PDF, eller som Word i de ${WORD_TEMPLATE_COUNT} Word-mallarna.`,
  },
]

/** Stegens små bilder (aria-hidden i VagSteg). */
function StegBild({ nr }: { nr: number }) {
  if (nr === 0) {
    return (
      <div className="skc-b">
        <div className="skc-b-titel">
          <b>Projektledare</b>
          <span>
            <i>Arbetslivserfarenhet</i>
            <i>Projekt</i>
            <i>Certifieringar</i>
          </span>
        </div>
      </div>
    )
  }
  if (nr === 1) {
    return (
      <div className="skc-b">
        <div className="skc-b-tva">
          <span>
            <Ikon namn="upp" />
            Ladda upp
          </span>
          <span>
            <Ikon namn="cv" />
            Tomt ark
          </span>
        </div>
      </div>
    )
  }
  if (nr === 2) {
    return (
      <div className="skc-b">
        <div className="skc-b-ark">
          <i />
          <i />
          <i style={{ width: '80%' }} />
          <div>
            <i />
            <i className="skc-m" />
            <i style={{ width: '60%' }} />
          </div>
          <i />
          <i style={{ width: '70%' }} />
        </div>
      </div>
    )
  }
  return (
    <div className="skc-b">
      <div className="skc-b-mallar">
        {['bjork', 'linne', 'koppar'].map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={id} src={`/mallar/v2/${id}-liten.webp`} alt="" width={112} height={158} loading="lazy" decoding="async" />
        ))}
      </div>
    </div>
  )
}

function FunktionBild({ bild }: { bild: Funktion['bild'] }) {
  return (
    <div className="skc-ebild" aria-hidden="true">
      {bild === 'las' ? (
        <div className="skc-las">
          <i />
          <i />
          <i />
          <i style={{ width: '70%' }} />
          <i />
          <i style={{ width: '55%' }} />
        </div>
      ) : bild === 'sparat' ? (
        <div className="skc-sparat">
          <span>
            <i className="skc-pa" />
            <i className="skc-pa" />
            <i className="skc-pa" />
            <i />
            <i />
          </span>
          Sparat, 3 av 5 avsnitt
        </div>
      ) : bild === 'fran' ? (
        <div className="skc-fran">
          <b>PDF</b>
          <Ikon namn="pil" />
          <b>{FORVALD.namn}</b>
        </div>
      ) : (
        <div className="skc-tel">
          <b />
          <i />
        </div>
      )}
    </div>
  )
}

export default function SkapaCvSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-byggare',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    description: `Skapa CV gratis online med vår CV-byggare. Skriv direkt på arket i en färdig mall eller ladda upp ett CV du har, låt Jobbcoachen föreslå punkterna och ladda ner som PDF, eller Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna. Helt på svenska.`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Skapa CV helt gratis, ingen kortuppgift',
    },
    featureList: `CV-byggare direkt på arket, rubriker som följer yrket, förslag på punkter från Jobbcoachen, ATS-säkra mallar, PDF-nedladdning, Word i ${WORD_TEMPLATE_COUNT_ORD} av mallarna, uppladdning av befintligt CV, mobilanpassad`,
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så skapar du ett CV med Jobbcoach.ai',
    description: 'Fyra steg från yrkestitel till färdig fil: skriv vilket jobb du söker, ladda upp eller börja från början, fyll i direkt på arket och ladda ner.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: STEG.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SKAPA_CV_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <Sida farg="cv">
      <RedirectLoggedIn to="/dashboard/skapa-cv" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div id="innehall">
        {/* 1. Hjälten: arket som det ser ut i byggaren */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Skapa CV', href: '/verktyg/skapa-cv' },
          ]}
          etikett="Skapa CV, direkt på arket"
          h1="Skapa ditt CV gratis på minuter"
          varde={
            <>
              Skriv direkt på arket i den mall du valt, eller ladda upp ett CV du har så fyller vi i avsnitten. Jobbcoachen föreslår punkterna och du laddar ner som PDF, eller Word i{' '}
              {WORD_TEMPLATE_COUNT_ORD} av mallarna. <b>Gratis att börja och helt på svenska.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="/register?borja=cv" pil>
                Bygg mitt CV gratis
              </Knapp>
              <TextLank href="/cv-mallar#ladda-upp">Ladda upp ditt CV</TextLank>
            </>
          }
          brickor={[
            { tal: 'På arket', text: 'du ser CV:t i mallen medan du skriver', ord: true },
            { tal: String(FREE_CV_BYGG_AI_PER_ACCOUNT), text: 'förslag på punkter, gratis' },
            { tal: String(TEMPLATE_COUNT), text: `mallar, ${FREE_TEMPLATE_COUNT} gratis` },
          ]}
          bild={
            <div className="skc-cvb" role="img" aria-label={`Exempel: Sara Lindströms CV på arket i mallen ${FORVALD.namn}, med Jobbcoachens förslag på punkter`}>
              <span className="p3-chip p3-chip-koppar skc-mallchip">Mallen {FORVALD.namn}, gratis</span>
              <ByggarArk ariaLabel={`Exempel: Sara Lindströms CV i mallen ${FORVALD.namn} medan hon skriver`} />
              <Svav className="skc-forslag" gungar sen>
                <em>
                  <Ikon namn="cv" />
                  Jobbcoachen föreslår
                </em>
                <ul>
                  <li className="skc-v">
                    <i />
                    Drev fyra upphandlingar enligt LOU
                  </li>
                  <li>
                    <i />
                    Ansvarade för budget och tidplan
                  </li>
                  <li>
                    <i />
                    Höll ihop tidplan och underentreprenörer
                  </li>
                </ul>
                <small>Du väljer, ändrar eller hoppar över.</small>
              </Svav>
            </div>
          }
          lyft
        />

        {/* 2. Startbladet i lyftkortet (ingen ny H2, SEO avsnitt 7). Ett riktigt
            formulär: titeln och valet går genom registreringen in i byggaren
            (startval.ts, start/route.ts). Fungerar utan JavaScript. */}
        <Lyft etikett="Börja här">
          <div className="skc-start" id="demo">
            <form className="skc-start-text" action="/verktyg/skapa-cv/start" method="get">
              <p className="p3-ey">Börja här</p>
              <label className="p3-h2 skc-fraga" htmlFor="skc-yrke">
                Vilket jobb söker du?
              </label>
              <p className="p3-varde" id="skc-yrke-hjalp">Yrkestiteln styr rubrikerna, den grå exempeltexten och Jobbcoachens förslag.</p>
              <input
                id="skc-yrke"
                className="skc-falt"
                type="text"
                name="yrke"
                maxLength={TITEL_MAX}
                placeholder="Till exempel projektledare"
                autoComplete="organization-title"
                enterKeyHint="go"
                aria-describedby="skc-yrke-hjalp"
              />
              <fieldset className="skc-ingangar">
                <legend className="sr-only">Hur vill du börja?</legend>
                <label>
                  <input type="radio" name="start" value="ladda" defaultChecked />
                  <i>
                    <Ikon namn="upp" />
                  </i>
                  <b>Ladda upp ett CV du har</b>
                  <span>PDF, Word eller en PDF av din LinkedIn-profil.</span>
                </label>
                <label>
                  <input type="radio" name="start" value="skriv" />
                  <i>
                    <Ikon namn="cv" />
                  </i>
                  <b>Skriv från början</b>
                  <span>Du börjar på ett tomt ark i {FORVALD.namn}.</span>
                </label>
              </fieldset>
              <Knapprad>
                <Knapp som="knapp" type="submit" pil data-cta="skapa-cv-startblad">
                  Bygg mitt CV gratis
                </Knapp>
                <span className="p3-liten">Gratis att börja, ingen kortuppgift.</span>
              </Knapprad>
            </form>
            <div className="skc-linne">
              <Link href={PROVA_HREF} data-cta-klick={PROVA_HREF} className="skc-linne-bild">
                <MallMiniatyr id={FORVALD.id} storlek="stor" namn={false} chip={false} />
              </Link>
              <div className="skc-linne-mer">
                <div className="skc-chips">
                  <Chip>{FORVALD.namn}</Chip>
                  <Chip typ="gratis">{ARTIKEL.mallrad(true, FORVALD.word)}</Chip>
                </div>
                <p className="skc-linne-rubrik">Så ser arket ut</p>
                <p className="skc-linne-text">
                  I byggaren skriver du direkt på arket i den mall du valt, här{' '}
                  <Link className="p3-lank" href={PROVA_HREF}>
                    {FORVALD.namn}
                  </Link>
                  . Tryck på ett avsnitt och fyll i. Grå exempeltext visar vad som brukar stå där och följer inte med i filen.
                </p>
                {/* Namnet går till provsidan, som läser ?namn= (ProvaKontext) och visar arket i mallen. */}
                <form className="skc-namnfalt" action="/cv-mallar/prova" method="get">
                  <input type="hidden" name="mall" value={FORVALD.id} />
                  <label className="sr-only" htmlFor="skc-namn">
                    Ditt namn
                  </label>
                  <input id="skc-namn" type="text" name="namn" maxLength={80} placeholder="Ditt namn" autoComplete="name" />
                  <button type="submit">Prova {FORVALD.namn} med ditt namn</button>
                </form>
              </div>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det, stegen som väg med bild (HowTo ur samma lista) */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud etikett="Fyra steg" rubrik="Så fungerar det" varde="Du skriver, vi sätter ihop. Inga krångliga Word-mallar att kämpa med." />
          <VagSteg steg={STEG.map((s, i) => ({ rubrik: s.name, text: s.text, bild: <StegBild nr={i} />, koppar: i === STEG.length - 1 }))} />
          <Knapprad className="skc-efter">
            <Knapp href="/register?borja=cv" variant="vit">
              Skapa mitt CV gratis
            </Knapp>
          </Knapprad>
        </Sektion>

        {/* 4. Det här gör CV-byggandet enkelt: plattan med arket, fyra kort under */}
        <Sektion luft="utan-topp" id="vad-du-far">
          <O
            farg="cv"
            etikett="Vad du får"
            rubrik="Det här gör CV-byggandet enkelt"
            rubrikNiva="h2"
            varde="Byggaren tar bort friktionen. Du lägger tiden på innehållet, vi sköter resten."
            bild={
              <div className="skc-enkelt-bild" aria-hidden="true">
                {/* Grundens byggarark (P5a): nålarna 1 till 4 är plattans fyra punkter. */}
                <ByggarArk nalar verktygsrad={{ farger: FORVALD.accenter, nal: 4 }} />
              </div>
            }
          >
            <ul className="skc-enkelt">
              {FUNKTIONER_PLATTA.map((f, i) => (
                <li key={f.rubrik}>
                  <Nr typ="koppar">{i + 1}</Nr>
                  <h3 className="p3-h3">{f.rubrik}</h3>
                  <p>{f.text}</p>
                </li>
              ))}
            </ul>
          </O>
          <Rutnat kolumner={4} className="skc-fyra">
            {FUNKTIONER_KORT.map((f) => (
              <Kort key={f.rubrik}>
                <FunktionBild bild={f.bild} />
                <h3 className="p3-h3">{f.rubrik}</h3>
                <p>{f.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 5. Mallar som passar din bransch */}
        <Sektion botten="ton" id="mallar">
          <SektionHuvud
            etikett="Mallar att välja på"
            rubrik="Mallar som passar din bransch"
            varde={`${TEMPLATE_COUNT} mallar som passar alla yrken, med rubriker för din bransch, ${FREE_TEMPLATE_COUNT} av dem gratis. Byt mall efteråt utan att förlora det du fyllt i.`}
          />
          <Rutnat kolumner={3}>
            {UTVALDA.map((m) => (
              <Kort key={m.id} className="skc-mallkort">
                <MallMiniatyr id={m.id} namn={false} chip={false} href={`/cv-mallar/prova?mall=${m.id}`} />
                <div>
                  <h3 className="p3-h3">{m.namn}</h3>
                  <div className="skc-chips" style={{ marginTop: 8 }}>
                    <Chip typ={m.niva === 'gratis' ? 'gratis' : 'premium'}>{m.niva === 'gratis' ? 'Gratis' : 'Premium'}</Chip>
                    {m.word ? <Chip>Word</Chip> : null}
                    {m.foto ? <Chip>Foto</Chip> : null}
                  </div>
                  <p>
                    <b>{m.kort}.</b> {m.stil}.
                  </p>
                </div>
              </Kort>
            ))}
          </Rutnat>
          <div className="skc-fler">
            <div className="skc-fler-rad" aria-hidden="true">
              {FLER.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.bild.liten} alt="" width={112} height={158} loading="lazy" decoding="async" />
              ))}
            </div>
            <p>
              {TEMPLATE_COUNT - UTVALDA.length} mallar till
              <span>
                {WORD_TEMPLATE_COUNT} finns också som Word, {FOTO_ANTAL} har plats för foto.
              </span>
            </p>
            <Knapp href="/cv-mallar" variant="vit">
              Se alla mallar
            </Knapp>
          </div>
        </Sektion>

        {/* 6. Gör skillnad i varje ansökan: tre tal */}
        <Sektion id="resultat">
          <div className="p3-vagg skc-skillnad">
            <SektionHuvud etikett="Resultat" rubrik="Gör skillnad i varje ansökan" />
            <div className="skc-tretal">
              <div>
                <b>1 fil</b>
                <h3 className="p3-h3">Ladda upp ditt gamla CV och börja där det slutade</h3>
                <p>Vi fyller i avsnitten åt dig, och du lägger tiden på att göra dem bättre.</p>
              </div>
              <div>
                <b>0 kr</b>
                <h3 className="p3-h3">Gratis att börja</h3>
                <p>Ingen kortuppgift och inga dolda avgifter.</p>
              </div>
              <div>
                <b>Alla {TEMPLATE_COUNT}</b>
                <h3 className="p3-h3">Läsbart för systemen i alla mallar</h3>
                <p>Ansökan sorteras inte bort på vägen för att maskinen inte kunde läsa den.</p>
              </div>
            </div>
            <Knapprad className="skc-efter">
              <Knapp href="/register?borja=cv">Skapa ditt CV gratis</Knapp>
            </Knapprad>
          </div>
        </Sektion>

        {/* 7. Premium */}
        <Sektion luft="utan-topp" id="premium">
          <PremiumO
            rubrik="Skapa ditt CV gratis på minuter."
            text={`Skriv direkt på arket, låt Jobbcoachen föreslå punkterna och ladda ner i en mall som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla ${TEMPLATE_COUNT} mallar, Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar, CV-analysens alla förslag och nedladdning utan tak ingår i ${paketKort()}.`}
            uppsagning
            knapp={
              <>
                <Knapp href="/register?borja=cv">Bygg mitt CV gratis</Knapp>
                <TextLank href="/cv-exempel">Se CV-exempel först</TextLank>
              </>
            }
            punkter={[
              `Alla ${TEMPLATE_COUNT} mallar`,
              `Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar`,
              'CV-analysens alla förslag',
              'Nedladdning utan tak',
              `Jobbcoachens förslag på punkter, ${PAID_CV_BYGG_AI_PER_DAY} per dygn`,
            ]}
          />
        </Sektion>

        {/* 8. Frågorna */}
        <Sektion luft="utan-topp" id="fragor">
          <Faq
            rubrik="Vanliga frågor om att skapa CV"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <a href="mailto:support@jobbcoach.ai" className="p3-lank">
                  Hör av dig
                </a>
                .
              </>
            }
            fragor={SKAPA_CV_FAQ_ITEMS}
            efter={
              <Knapprad>
                <Knapp href="/register?borja=cv" pil>
                  Bygg mitt CV gratis
                </Knapp>
              </Knapprad>
            }
          />
        </Sektion>
      </div>
    </Sida>
  )
}
