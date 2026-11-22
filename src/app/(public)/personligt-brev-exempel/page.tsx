/**
 * /personligt-brev-exempel, galleriet med personligt brev-exempel per yrke,
 * i publikt omgång 3 (skissen brev-exempelnav, SEO:s besked 14).
 * SEO: ItemList + BreadcrumbList + FAQPage JSON-LD + metadata som förut.
 *
 * Serverkomponent. Alla 89 kort står i serverns HTML med yrket som h3 och
 * sin rad. Sökfältet är ett GET-formulär (HubbSok): utan JavaScript står
 * alla kort kvar, med JavaScript döljer sökningen de som inte matchar.
 *
 * Rubrikerna är desamma som före: h1, h2 "89 yrken", "Behöver du även CV?",
 * guiden (h2 och fyra h3), frågorna och slutet. CV-galleriet ritas
 * fortfarande av GalleriPageContent.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { BREV_GALLERI_FAQ, type FaqItem } from '@/app/(public)/exempel/components/galleri-faq'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'
import HubbSok from '@/app/(public)/exempel/components/HubbSok'
import { paketKort } from '@/lib/plans/plans'
import { Sida, Hjalte, Sektion, SektionHuvud, Faq, Knapp, TextLank, Chip, Brevpar, O } from '@/components/publikt/v3'
import BrevYrkesKort from '@/components/publikt/innehall/exempel/BrevYrkesKort'
import { BranschBrickor, NavBild, normaliseraKategori } from '@/components/publikt/innehall/exempel/BrevNav'
import { MINIATYR_BREDD, MINIATYR_HOJD, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import '@/components/publikt/publikt.css'
import '@/components/publikt/innehall/exempel/brev-exempel.css'

const ANTAL_BREV = BREV_GALLERI.length
// Huvudordsplanen steg 1 (SEO-förslaget K4 a, 2026-11-14): galleriet tar
// exempelorden, mallordet ägs av artikeln personligt-brev-mall-gratis.
const TITEL = `Personligt brev exempel: ${ANTAL_BREV} färdiga brev för svenska yrken`
const BESKRIVNING = `Personligt brev exempel för ${ANTAL_BREV} yrken, skrivna för svenska rekryterare. Se inledning, koppling till annonsen och avslutning, och använd brevet som mall.`

/** Situationsraden (SEO-förslaget K6, 2026-11-14): länkar till sidor och avsnitt som redan finns. */
const SITUATION = [
  { text: 'Student', href: '/personligt-brev-exempel/kategori/student' },
  { text: 'Utan erfarenhet', href: '/artiklar/personligt-brev-utan-erfarenhet' },
  { text: 'Karriärbyte', href: '/artiklar/personligt-brev-exempel-situationer#personligt-brev-vid-karriarbyte' },
  { text: 'Chef', href: '/personligt-brev-exempel/chef' },
] as const

/**
 * Frågorna. SEO:s besked 14 (JA MED ÄNDRING, LD_UNDANTAG FAQPage): sista
 * meningen i svaret om samma brev för flera jobb utan "dubblar dina chanser".
 * Synligt svar och FAQPage läser samma lista.
 */
const FRAGOR: FaqItem[] = BREV_GALLERI_FAQ.map((f) => ({
  ...f,
  a: f.a.replace(
    'Det tar bara några minuter extra och dubblar dina chanser.',
    'Det tar bara några minuter extra, och rekryteraren ser att brevet gäller just den tjänsten.',
  ),
}))

export function generateMetadata(): Metadata {
  return {
    title: TITEL,
    description: BESKRIVNING,
    keywords: 'personligt brev exempel, exempel på personligt brev, personligt brev exempel yrke, jobbansökan exempel',
    openGraph: {
      title: TITEL,
      description: BESKRIVNING,
      type: 'website',
      locale: 'sv_SE',
      url: 'https://www.jobbcoach.ai/personligt-brev-exempel',
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: TITEL,
      description: BESKRIVNING,
    },
    alternates: {
      canonical: 'https://www.jobbcoach.ai/personligt-brev-exempel',
    },
    robots: { index: true, follow: true },
  }
}

export default function PersonligtBrevExempelGalleri() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Personligt brev-exempel för svenska yrken',
    description: `${ANTAL_BREV} exempel på personligt brev för yrken i ${KATEGORIER.length} kategorier.`,
    numberOfItems: BREV_GALLERI.length,
    itemListElement: BREV_GALLERI.map((y, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Personligt brev-exempel: ${y.namn}`,
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/${y.slug}`,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://www.jobbcoach.ai' },
      { '@type': 'ListItem', position: 2, name: 'Exempel', item: 'https://www.jobbcoach.ai/exempel' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Personligt brev-exempel',
        item: 'https://www.jobbcoach.ai/personligt-brev-exempel',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FRAGOR.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const antal = BREV_GALLERI.length
  const kort = BREV_GALLERI.map((y) => {
    const kat = KATEGORIER.find((k) => k.slug === normaliseraKategori(y.kategori))
    return { yrke: y.namn, slug: y.slug, kategori: normaliseraKategori(y.kategori), kategoriNamn: kat?.namn, text: y.intro }
  })
  const PREMIUM = paketKort()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="brev" className="bx bx-nav">
        {/* Hjälten: tre brev, sökfältet och situationsraden */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Exempel', href: '/exempel' },
            { name: 'Personliga brev-exempel', href: '/personligt-brev-exempel' },
          ]}
          brodsmulorSchema={false}
          etikett="Personligt brev-exempel"
          h1={
            <>
              {`Personligt brev-exempel för ${antal} yrken.`} <span className="bx-h1-koppar">Börja med ditt.</span>
            </>
          }
          varde={`Ett exempel på personligt brev är ett färdigt brev för ett visst yrke. Vi har ${antal}, skrivna för svenska rekryterare. Varje brev har en inledning, ett mittparti och en avslutning, och vi förklarar varför styckena fungerar. Låna upplägget, byt ut innehållet mot dina egna erfarenheter och håll brevet till en A4-sida.`}
          bild={<NavBild antal={antal} lappar={['Undersköterska', 'Lärare', 'Projektledare']} />}
          lyft
        >
          <div className="bx-sok">
            <HubbSok
              action="/personligt-brev-exempel"
              placeholder="Sök ditt yrke, till exempel lärare"
              listaId="yrken"
              rubrikId="yrken-rubrik"
              tomId="yrken-tom"
            />
          </div>
          <nav className="bx-situation" aria-label="Välj efter situation">
            <span>Din situation</span>
            {SITUATION.map((s) => (
              <Link key={s.href} href={s.href}>
                {s.text}
              </Link>
            ))}
          </nav>
        </Hjalte>

        {/* Branscherna: lyftkortet, största först */}
        <BranschBrickor yrken={BREV_GALLERI} allaHref="#yrken" />

        {/* Alla yrken */}
        <Sektion botten="golv">
          <SektionHuvud
            etikett="Alla exempel"
            rubrik={`${antal} yrken`}
            rubrikId="yrken-rubrik"
            varde="Hitta rätt mall för ditt personliga brev. Färdiga exempel skrivna med rätt ton, struktur och nyckelord för svenska rekryterare som du kan använda som mall för ditt eget brev."
          />
          <BrevYrkesKort yrken={kort} id="yrken" />
          <p id="yrken-tom" className="p3-liten bx-tom" hidden>
            Inga yrken matchar sökningen. Prova ett närliggande yrke eller välj en bransch ovan.
          </p>

          {/* Behöver du även CV? som ö i CV:ts petrol */}
          <div className="bx-cv-o">
            <O
              farg="cv"
              rubrikNiva="h2"
              rubrik="Behöver du även CV?"
              knappar={
                <Knapp href="/cv-exempel" variant="vit">
                  Bläddra CV-exempel
                </Knapp>
              }
            >
              <p>En komplett ansökan kräver båda. Vi har {antal} CV-exempel inom samma yrken.</p>
            </O>
          </div>
        </Sektion>

        {/* Guiden om mallar och exempel */}
        <Sektion botten="papper">
          <div className="bx-guide2">
            <div className="bx-guide2-huvud">
              <SektionHuvud
                etikett="Guide till exemplen"
                rubrik="Så använder du ett exempel på personligt brev som mall"
                varde="Vad är skillnaden mellan en mall och ett exempel? Hur väljer du rätt? Är de gratis? Här är svaren."
              />
              <div className="bx-mallbild" aria-hidden="true">
                <p className="p3-ey">Mall och exempel</p>
                <div className="bx-mallbild-par">
                  <div className="bx-mallbild-tom">
                    <span>Inledning</span>
                    <span>Huvuddel</span>
                    <span>Avslutning</span>
                    <b>Mallen</b>
                    <small>En tom struktur. Du fyller den själv.</small>
                  </div>
                  <div className="bx-mallbild-fylld">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brevMiniatyrSrc('linne')} alt="" width={MINIATYR_BREDD} height={MINIATYR_HOJD} loading="lazy" decoding="async" />
                    <b>Exemplet</b>
                    <small>Samma struktur, ifylld för ett yrke.</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="bx-guide2-kort">
              <article className="bx-kort bx-guide-kort">
                <div>
                  <h3 className="p3-h3">Vad är en mall för personligt brev, och vad är skillnaden mot ett exempel?</h3>
                  <p>
                    En mall för personligt brev är en färdig struktur som du fyller med dina egna uppgifter. Den bestämmer ordningen på sektioner,
                    hur rubriker ser ut och vilka delar som ska finnas med. Ett exempel är en ifylld mall för personligt brev för en specifik roll,
                    där du ser hur en riktig person formulerat sig.
                  </p>
                  <p>
                    I praktiken används orden ofta synonymt. Våra {antal} yrkesexempel funkar som mallar du kan kopiera strukturen från och anpassa
                    till din situation. När någon säger &quot;jag behöver en mall för personligt brev&quot; menar de oftast just det här: en
                    konkret förlaga att utgå från. Letar du efter en tom mall har vi gått igenom vilka som fungerar i{' '}
                    <Link className="p3-lank-inline" href="/artiklar/personligt-brev-mall-gratis">
                      Personligt brev mall gratis
                    </Link>
                    .
                  </p>
                </div>
              </article>
              <article className="bx-kort bx-guide-kort">
                <div>
                  <h3 className="p3-h3">Hur väljer du rätt mall för personligt brev för ditt yrke?</h3>
                  <p>
                    Börja med din exakta yrkestitel. Är du undersköterska söker du på &quot;undersköterska&quot;. Hittar du ingen exakt träff
                    väljer du ett närliggande yrke i samma bransch. En distriktssköterska kan hämta inspiration från sjuksköterska-mallen, en
                    account manager från säljare-mallen.
                  </p>
                  <p>
                    Det som faktiskt skiljer en bra mall för personligt brev från en dålig är hur den hanterar tre saker: inledningen, kopplingen
                    till annonsens krav, och avslutningen. Två yrken med liknande arbetsuppgifter har ofta liknande behov, även om titlarna
                    skiljer sig.
                  </p>
                  <p className="bx-delmarken" aria-hidden="true">
                    <Chip>1 Inledningen</Chip>
                    <Chip>2 Kopplingen till annonsens krav</Chip>
                    <Chip>3 Avslutningen</Chip>
                  </p>
                  <p>
                    Du kan också filtrera på{' '}
                    <Link className="p3-lank-inline" href="/personligt-brev-exempel/kategori/vard">
                      bransch
                    </Link>{' '}
                    för att se alla mallar inom vård, tech, ekonomi, service, utbildning eller offentlig sektor.
                  </p>
                </div>
              </article>
              <article className="bx-kort bx-guide-kort">
                <div>
                  <h3 className="p3-h3">Vad gör en mall för personligt brev bra?</h3>
                  <p>
                    En bra mall är inte ett färdigskrivet brev du kopierar. Det är en struktur som visar dig var olika delar ska gå: inledning som
                    fångar intresset, en huvuddel som kopplar din erfarenhet till annonsens krav, och en avslutning som gör nästa steg tydligt.
                  </p>
                  <p>
                    Det som skiljer våra mallar för personligt brev från standardmallarna du hittar i Word är att de är yrkesspecifika. En mall för
                    ett personligt brev till sjuksköterska är skriven med vårdens ton och nyckelord, inte med generiska fraser som passar lika bra
                    till en projektledarroll.
                  </p>
                  <p>
                    Använd mallen som ram. Byt ut detaljerna mot dina egna erfarenheter och dina egna siffror. Ett brev som ser ut som en kopia av
                    en mall sticker aldrig ut.
                  </p>
                </div>
              </article>
              <article className="bx-kort bx-guide-kort">
                <div>
                  <h3 className="p3-h3">Är mallar för personligt brev gratis? Kan jag ladda ner dem?</h3>
                  {/* SEO:s besked 14: skissens lydelse, med orden gratis, mall och ladda ner kvar. Nedladdning kräver Premium. */}
                  <p>
                    Alla {antal} exempel är gratis att läsa och låna upplägget från, och varje exempel fungerar som mall. Du behöver inget konto för
                    det, och vi tar inte betalt för innehållet.
                  </p>
                  <ul className="bx-gratisrader">
                    <li>
                      <Chip typ="gratis">Gratis</Chip> Läsa alla {antal} exempel, utan konto
                    </li>
                    <li>
                      <Chip typ="gratis">Gratis</Chip> Skriva ditt första brev och kopiera texten
                    </li>
                    <li>
                      <Chip typ="premium">{PREMIUM}</Chip> Ladda ner brevet som PDF eller Word
                    </li>
                  </ul>
                  <p>
                    Vill du ha ditt eget brev som fil skriver du det i{' '}
                    <Link className="p3-lank-inline" href="/verktyg/personligt-brev">
                      vårt brevverktyg
                    </Link>
                    . Första brevet är gratis, sedan ett var sjunde dag, och texten kopierar du fritt. Nedladdning som PDF eller Word ingår i {PREMIUM}.
                  </p>
                  <p>
                    Om du hellre vill jobba i Word direkt kan du kopiera texten från en mall, klistra in den i ett tomt dokument och anpassa den.
                    Använd Garamond eller Calibri 11-12 punkter och spara som PDF innan du skickar.
                  </p>
                </div>
              </article>
            </div>
            <p className="bx-guide-slut">
              <span>Redo att börja? Välj ett exempel som passar ditt yrke.</span>
              <Link className="p3-lank" href="/personligt-brev-exempel#yrken">
                Bläddra alla personligt brev-exempel
              </Link>
            </p>
          </div>
        </Sektion>

        {/* Frågorna */}
        <Sektion botten="golv">
          <Faq
            etikett="Vanliga frågor om brev-exempel"
            rubrik="Det du undrar om brev-exemplen"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <a className="p3-lank-inline" href="mailto:support@jobbcoach.ai">
                  Hör av dig
                </a>
                .
              </>
            }
            fragor={FRAGOR}
          />
        </Sektion>

        {/* Slutet: plommonön med brevet */}
        <Sektion botten="golv" luft="utan-topp">
          <O
            farg="brev"
            rubrikNiva="h2"
            rubrik="Klar att skriva ditt eget brev?"
            bild={<Brevpar />}
            knappar={
              <>
                <Knapp href="/skapa-brev/start">Skapa brev gratis</Knapp>
                <TextLank href="/exempel">Alla exempel och mallar</TextLank>
              </>
            }
          >
            <p>Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Det är gratis att börja.</p>
          </O>
        </Sektion>
      </Sida>
    </>
  )
}
