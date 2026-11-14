/**
 * Hubbarna /cv-exempel och /personligt-brev-exempel i publikt v2 (spec del B
 * 3.4). Serverkomponent: alla 89 kort ligger i HTML med sin h3, filtret är
 * länkar till kategorisidorna och sökningen är ett GET-formulär som
 * filtrerar korten direkt när JavaScript finns.
 *
 * Rubrikerna är desamma som före: h1, h2 "89 yrken", korsraden till
 * syskonhubben, guiden om mallar (fyra h3), frågorna och slutet.
 */

import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import Faq from '@/components/publikt/Faq'
import Smula from '@/components/publikt/innehall/Smula'
import SlutBand from '@/components/publikt/innehall/SlutBand'
import YrkesKort from '@/components/publikt/innehall/exempel/YrkesKort'
import '@/components/publikt/innehall/exempel/exempel.css'
import { KATEGORIER, type Kategori } from './exempel-data'
import type { FaqItem } from './galleri-faq'
import MallarGuideSection from './MallarGuideSection'
import HubbSok from './HubbSok'

export interface GalleriYrke {
  slug: string
  namn: string
  kategori: string
  intro: string
}

interface GalleriPageContentProps {
  type: 'cv' | 'brev'
  yrken: GalleriYrke[]
  faqItems: FaqItem[]
}

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
const SITUATION_BREV = [
  { text: 'Student', href: '/personligt-brev-exempel/kategori/student' },
  { text: 'Utan erfarenhet', href: '/artiklar/personligt-brev-utan-erfarenhet' },
  { text: 'Karriärbyte', href: '/artiklar/personligt-brev-exempel-situationer#personligt-brev-vid-karriarbyte' },
  { text: 'Chef', href: '/personligt-brev-exempel/chef' },
] as const

/** Galleridatan skriver 'teknik' där kategorierna heter 'tech'. */
function normalizeKategori(input: string): Kategori['slug'] {
  if (input === 'teknik') return 'tech'
  return input as Kategori['slug']
}

/** De tre arken i hjälten: rena streck, ingen text (bilden är aria-hidden). */
function Solfjader({ typ }: { typ: 'cv' | 'brev' }) {
  const ark = (klass: string, n: number) => (
    <div className={`ib-ex-ark ${klass}`} key={klass}>
      <div className="ark-streck">
        <i className="n" />
        <i className="h" />
        {typ === 'cv' ? <i className="k" /> : null}
        {Array.from({ length: n }, (_, i) => (
          <i key={i} style={{ width: `${70 + ((i * 13) % 30)}%` }} />
        ))}
        <i className="k" />
        <i />
        <i style={{ width: '64%' }} />
      </div>
    </div>
  )
  return (
    <div className="ib-solfjader" aria-hidden="true">
      {ark('ib-sf-1', 5)}
      {ark('ib-sf-3', 6)}
      {ark('ib-sf-2', 7)}
    </div>
  )
}

export default function GalleriPageContent({ type, yrken, faqItems }: GalleriPageContentProps) {
  const isCV = type === 'cv'
  const typeLabel = isCV ? 'CV-exempel' : 'Personliga brev-exempel'
  const typeShort = isCV ? 'CV' : 'brev'
  const bas = isCV ? '/cv-exempel' : '/personligt-brev-exempel'
  const annanBas = isCV ? '/personligt-brev-exempel' : '/cv-exempel'
  const otherTypeLabel = isCV ? 'personliga brev' : 'CV'
  const rum = isCV ? 'cv' : 'brev'

  const kategorier = KATEGORIER.map((kat) => ({
    kat,
    antal: yrken.filter((y) => normalizeKategori(y.kategori) === kat.slug).length,
  })).filter((k) => k.antal > 0)

  const kort = yrken.map((y) => {
    const kat = KATEGORIER.find((k) => k.slug === normalizeKategori(y.kategori))
    return { yrke: y.namn, slug: y.slug, kategori: normalizeKategori(y.kategori), kategoriNamn: kat?.namn, text: y.intro }
  })

  return (
    <PubliktSida>
      {/* Hjälten */}
      <Rum rum={rum} yta="vagg" id="hjalte" vag="mark" className="ib-hjalte">
        <div className="pub-wrap ib-hubb-g">
          <div>
            <Smula
              steg={[
                { namn: 'Hem', href: '/' },
                { namn: 'Exempel', href: '/exempel' },
                { namn: typeLabel },
              ]}
            />
            <p className="pub-kick">{isCV ? 'CV-exempel' : 'Personligt brev-exempel'}</p>
            {/* Huvudordsplanen steg 1 och 2 (SEO-förslaget K4 a och K6, 2026-11-14). */}
            <h1 className="ib-h1-stor">
              {isCV ? `CV-exempel för ${yrken.length} yrken.` : `Personligt brev-exempel för ${yrken.length} yrken.`}{' '}
              <span>Börja med ditt.</span>
            </h1>
            <p className="pub-ingress">
              {isCV
                ? `Ett CV-exempel är ett färdigt CV för ett visst yrke, skrivet som en riktig ansökan. Vi har ${yrken.length}, från undersköterska till systemutvecklare. Välj ditt yrke eller det som ligger närmast, se hur profilen, erfarenheten och kompetenserna är formulerade och skriv sedan ditt eget med samma upplägg. Att läsa exemplen är gratis och kräver inget konto.`
                : `Ett exempel på personligt brev är ett färdigt brev för ett visst yrke. Vi har ${yrken.length}, skrivna för svenska rekryterare. Varje brev har en inledning, ett mittparti och en avslutning, och vi förklarar varför styckena fungerar. Låna upplägget, byt ut innehållet mot dina egna erfarenheter och håll brevet till en A4-sida.`}
            </p>
            <HubbSok
              action={bas}
              placeholder={isCV ? 'Sök ditt yrke, till exempel undersköterska' : 'Sök ditt yrke, till exempel lärare'}
              listaId="yrken"
              rubrikId="yrken-rubrik"
              tomId="yrken-tom"
            />
            <nav className="ib-filter ib-situation" aria-label="Välj efter situation">
              <span>Din situation</span>
              {(isCV ? SITUATION_CV : SITUATION_BREV).map((s) => (
                <Link key={s.href} href={s.href}>
                  {s.text}
                </Link>
              ))}
            </nav>
            <nav className="ib-filter" aria-label="Filtrera efter bransch">
              <a className="aktiv" href="#yrken" aria-current="page">
                Alla yrken <em>{yrken.length}</em>
              </a>
              {kategorier.map(({ kat, antal }) => (
                <Link key={kat.slug} href={`${bas}/kategori/${kat.slug}`}>
                  {kat.namn} <em>{antal}</em>
                </Link>
              ))}
            </nav>
          </div>
          <Solfjader typ={type} />
        </div>
      </Rum>

      {/* Alla yrken */}
      <Rum yta="mark">
        <div className="pub-wrap">
          <div className="ib-hubb-rubrik">
            <h2 id="yrken-rubrik">{yrken.length} yrken</h2>
          </div>
          {/* Den tidigare ingressen, flyttad under snabbsvaret (K6). */}
          <p className="pub-liten ib-galleri-ingress">
            {isCV
              ? 'Inspiration för ditt eget CV. Se färdiga, ATS-optimerade CV-exempel inom vård, tech, ekonomi, service, utbildning och offentlig sektor, perfekta att utgå från för din egen jobbansökan.'
              : 'Hitta rätt mall för ditt personliga brev. Färdiga exempel skrivna med rätt ton, struktur och nyckelord för svenska rekryterare som du kan använda som mall för ditt eget brev.'}
          </p>
          <YrkesKort yrken={kort} typ={type} id="yrken" />
          <p id="yrken-tom" className="pub-liten ib-yrke-tom" hidden>
            Inga yrken matchar sökningen. Prova ett närliggande yrke eller välj en bransch ovan.
          </p>

          <div className={`ib-brevrad pub-rum-${isCV ? 'brev' : 'cv'}`}>
            <div>
              <h2>Behöver du även {otherTypeLabel}?</h2>
              <p>
                En komplett ansökan kräver båda. Vi har {yrken.length} {otherTypeLabel}-exempel inom samma yrken.
              </p>
            </div>
            <Link className="pub-lank" href={annanBas}>
              Bläddra {otherTypeLabel}-exempel
            </Link>
          </div>
        </div>
      </Rum>

      {/* Guiden om mallar */}
      <MallarGuideSection type={type} antal={yrken.length} />

      {/* Frågorna */}
      <Rum yta="mark">
        <div className="pub-wrap" style={{ maxWidth: 860 }}>
          <p className="pub-kick">Vanliga frågor om {typeShort}-exempel</p>
          <Faq
            rubrik={`Det du undrar om ${typeShort}-exemplen`}
            ingress={
              <>
                Hittar du inte svaret? <a href="mailto:support@jobbcoach.ai">Hör av dig</a>.
              </>
            }
            fragor={faqItems}
          />
        </div>
      </Rum>

      <SlutBand
        rum={rum}
        rubrik={`Klar att skriva ditt eget ${typeShort}?`}
        text="Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Det är gratis att börja."
        knapp={{ text: `Skapa ${typeShort} gratis`, href: isCV ? '/cv-mallar/start' : '/skapa-brev/start' }}
        lank={{ text: 'Tillbaka till hubben', href: '/exempel' }}
      />
    </PubliktSida>
  )
}
