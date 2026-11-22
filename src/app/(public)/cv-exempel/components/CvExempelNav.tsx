/**
 * /cv-exempel i publikt omgång 3: navets form ur skissen brev-exempelnav,
 * i CV:ts petrol (SEO-beskedet avsnitt 14, "/cv-exempel följer med").
 * Serverkomponent. En egen kopia av CV-grenen i
 * exempel/components/GalleriPageContent.tsx, som brevnavet (P3) också
 * ritar; texten, rubrikerna, frågorna och länkarna är ordagrant dagens.
 * Alla 89 kort står i HTML:en, sökningen döljer bara dem som inte matchar.
 */
import Link from 'next/link'
import { Sida, Hjalte, Lyft, Sektion, SektionHuvud, Kort, Faq, O, Knapp, TextLank, Svav, Situationsrad, CvArk } from '@/components/publikt/v3'
import { mallBild } from '@/lib/cv/mallar/katalog'
import { KATEGORIER } from '@/app/(public)/exempel/components/exempel-data'
import type { GalleriYrke } from '@/app/(public)/exempel/components/GalleriPageContent'
import type { FaqItem } from '@/app/(public)/exempel/components/galleri-faq'
import CvSok from './CvSok'
import { Branscher, YrkesKortLista, normalizeKategori } from './ExempelDelar'
import './exempel-v3.css'

/**
 * Situationsraden (SEO-förslaget K6, 2026-11-14): vanliga länkar till sidor
 * och avsnitt som redan finns, inget klientfilter och inga nya adresser.
 */
const SITUATION_CV = [
  { text: 'Student', href: '/cv-exempel/kategori/student' },
  { text: 'Utan erfarenhet', href: '/artiklar/cv-utan-erfarenhet' },
  { text: 'Karriärbyte', href: '/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte' },
  { text: 'Chef', href: '/cv-exempel/chef' },
] as const

/** De tre mallarna i hjälten, riktiga bilder (dekor, aria-hidden). */
const BUNT = ['bjork', 'koppar', 'linne'] as const

export default function CvExempelNav({ yrken, faqItems }: { yrken: GalleriYrke[]; faqItems: FaqItem[] }) {
  const antal = yrken.length
  const kort = yrken.map((y) => {
    const kat = KATEGORIER.find((k) => k.slug === normalizeKategori(y.kategori))
    return { yrke: y.namn, slug: y.slug, ovan: kat?.namn, text: y.intro }
  })

  return (
    <Sida farg="cv">
      <Hjalte
        id="hjalte"
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Exempel', href: '/exempel' },
          { name: 'CV-exempel', href: '/cv-exempel' },
        ]}
        brodsmulorSchema={false}
        etikett="CV-exempel"
        h1={
          <>
            {`CV-exempel för ${antal} yrken.`} <span>Börja med ditt.</span>
          </>
        }
        h1Mindre
        varde={`Ett CV-exempel är ett färdigt CV för ett visst yrke, skrivet som en riktig ansökan. Vi har ${antal}, från undersköterska till systemutvecklare. Välj ditt yrke eller det som ligger närmast, se hur profilen, erfarenheten och kompetenserna är formulerade och skriv sedan ditt eget med samma upplägg. Att läsa exemplen är gratis och kräver inget konto.`}
        bild={
          <div className="cve-bunt" aria-hidden="true">
            {BUNT.map((id, i) => (
              <span key={id} className={`cve-b${i + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mallBild(id).stor} alt="" width={300} height={424} />
              </span>
            ))}
            <Svav stor={antal} under="yrken, ett färdigt CV var" gungar />
          </div>
        }
        lyft
      >
        <CvSok
          action="/cv-exempel"
          placeholder="Sök ditt yrke, till exempel undersköterska"
          listaId="yrken"
          rubrikId="yrken-rubrik"
          tomId="yrken-tom"
        />
        <Situationsrad lankar={SITUATION_CV} />
      </Hjalte>

      <Lyft etikett="Välj bransch">
        <p className="p3-ey">Välj bransch</p>
        <Branscher yrken={yrken} allaHref="#yrken" />
      </Lyft>

      {/* Alla yrken */}
      <Sektion>
        <SektionHuvud
          etikett="Alla exempel"
          rubrik={`${antal} yrken`}
          rubrikId="yrken-rubrik"
          varde="Inspiration för ditt eget CV. Se färdiga, ATS-optimerade CV-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor, perfekta att utgå från för din egen jobbansökan."
        />
        <YrkesKortLista yrken={kort} id="yrken" />
        <p id="yrken-tom" className="p3-liten cve-tom" hidden>
          Inga yrken matchar sökningen. Prova ett närliggande yrke eller välj en bransch ovan.
        </p>

        <O
          farg="brev"
          className="cve-o"
          rubrikNiva="h2"
          rubrik="Behöver du även personliga brev?"
          varde={`En komplett ansökan kräver båda. Vi har ${antal} personliga brev-exempel inom samma yrken.`}
          knappar={
            <Knapp href="/personligt-brev-exempel" variant="vit">
              Bläddra personliga brev-exempel
            </Knapp>
          }
        />
      </Sektion>

      {/* Guiden om mallar */}
      <Sektion botten="papper">
        <SektionHuvud
          etikett="Guide till exemplen"
          rubrik="Så använder du ett CV-exempel som mall"
          varde="Vad är skillnaden mellan en mall och ett exempel? Hur väljer du rätt? Är de gratis? Här är svaren."
        />
        <div className="cve-guide-rad">
        <div className="cve-guide">
          <Kort>
            <h3 className="p3-h3">Vad är en CV-mall, och vad är skillnaden mot ett exempel?</h3>
            <p>
              En CV-mall är en färdig struktur som du fyller med dina egna uppgifter. Den bestämmer ordningen på sektioner, hur rubriker ser ut och
              vilka delar som ska finnas med. Ett exempel är en ifylld CV-mall för ett specifikt yrke, där du ser hur en riktig person formulerat
              sig.
            </p>
            <p>
              I praktiken används orden ofta synonymt. Våra {antal} yrkesexempel funkar som mallar du kan kopiera strukturen från och anpassa till
              din situation. När någon säger &quot;jag behöver en CV-mall&quot; menar de oftast just det här: en konkret förlaga att utgå från. Vill
              du ha en tom design att fylla i finns alla våra <Link href="/cv-mallar">CV-mallar</Link> på en egen sida.
            </p>
          </Kort>
          <Kort>
            <h3 className="p3-h3">Hur väljer du rätt CV-mall för ditt yrke?</h3>
            <p>
              Börja med din exakta yrkestitel. Är du undersköterska söker du på &quot;undersköterska&quot;. Hittar du ingen exakt träff väljer du
              ett närliggande yrke i samma bransch. En distriktssköterska kan hämta inspiration från sjuksköterska-mallen, en account manager från
              säljare-mallen.
            </p>
            <p>
              Det som faktiskt skiljer en bra CV-mall från en dålig är hur den hanterar tre saker: sammanfattningen längst upp, hur erfarenheter är
              formulerade, och hur kompetenser presenteras. Två yrken med liknande arbetsuppgifter har ofta liknande behov, även om titlarna
              skiljer sig.
            </p>
            <p>
              Du kan också filtrera på <Link href="/cv-exempel/kategori/vard">bransch</Link> för att se alla mallar inom vård, tech, ekonomi,
              service, utbildning eller offentlig sektor.
            </p>
          </Kort>
          <Kort>
            <h3 className="p3-h3">Vad gör en CV-mall ATS-optimerad?</h3>
            <p>
              ATS står för Applicant Tracking System, programmen som de flesta större arbetsgivare använder för att sortera ansökningar. En
              ATS-optimerad CV-mall är byggd så att programmet kan läsa innehållet korrekt och matcha det mot jobbets krav.
            </p>
            <p>
              Konkret betyder det: tydliga rubriker som &quot;Arbetslivserfarenhet&quot; och &quot;Utbildning&quot;, inga komplicerade tabeller
              eller textboxar, ett standardtypsnitt som Garamond eller Calibri, och nyckelorden från jobbannonsen i löpande text. Designade
              CV-mallar med kolumner och grafiska element kan se snygga ut för en människa, men ATS-system läser dem ofta som gröt.
            </p>
            <p>
              Alla våra CV-mallar är skrivna med detta i åtanke. De ser professionella ut, men strukturen är byggd så att både datorn och
              rekryteraren hittar rätt.
            </p>
          </Kort>
          <Kort>
            <h3 className="p3-h3">Är CV-mallar gratis? Kan jag ladda ner dem?</h3>
            <p>
              Alla våra CV-mallar är helt gratis att använda. Du behöver inget konto för att läsa dem och inspireras. Vi tar inte betalt för
              innehållet.
            </p>
            <p>
              För nedladdning gör du så här: bygg ditt eget CV med <Link href="/cv-mallar">vårt CV-verktyg</Link> och ladda ner det som färdig PDF.
              Det är gratis att börja och du kan kopiera strukturen från vilken som helst av våra mallar i galleriet.
            </p>
            <p>
              Om du hellre vill jobba i Word direkt kan du kopiera texten från en mall, klistra in den i ett tomt dokument och anpassa den. Använd
              Garamond eller Calibri 11-12 punkter och spara som PDF innan du skickar.
            </p>
          </Kort>
          <p className="cve-guide-slut">
            Redo att börja? Välj ett exempel som passar ditt yrke.{' '}
            <Link className="p3-lank" href="/cv-exempel#yrken">
              Bläddra alla CV-exempel
            </Link>
          </p>
        </div>
        {/* Arket bredvid guiden på dator (utseendegranskning 2): spalten till höger stod tom. Dekor. */}
        <div className="cve-guide-bild" aria-hidden="true">
          <CvArk />
        </div>
        </div>
      </Sektion>

      {/* Frågorna */}
      <Sektion>
        <Faq
          etikett="Vanliga frågor om CV-exempel"
          rubrik="Det du undrar om CV-exemplen"
          ingress={
            <>
              Hittar du inte svaret? <a href="mailto:support@jobbcoach.ai">Hör av dig</a>.
            </>
          }
          fragor={faqItems}
        />
      </Sektion>

      <Sektion luft="utan-topp">
        <O
          farg="cv"
          rubrikNiva="h2"
          rubrik="Klar att skriva ditt eget CV?"
          varde="Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Det är gratis att börja."
          knappar={
            <>
              <Knapp href="/cv-mallar/prova">Skapa CV gratis</Knapp>
              <TextLank href="/exempel">Alla exempel och mallar</TextLank>
            </>
          }
        />
      </Sektion>
    </Sida>
  )
}
