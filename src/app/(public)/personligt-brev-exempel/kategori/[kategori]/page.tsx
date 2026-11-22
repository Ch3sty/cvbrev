/**
 * /personligt-brev-exempel/kategori/[kategori], tio sidor, i publikt omgång 3.
 * Beslut 7 i byggbriefen: kategorisidorna följer navets skiss
 * (brev-exempelnav), med branschen vald. Serverkomponent (förut en
 * klientkomponent med framer-motion, KategoriPageContent, som CV-sidorna
 * fortfarande använder).
 *
 * SEO (besked 14): title, description, canonical, H1, H2 "{n} yrken inom
 * {bransch}", "Behöver du även CV?", "Hittade du inte ditt yrke?" och
 * schemat står. Vårdens ingress säger antalet ur datan i stället för
 * "20+ yrken" (LD_UNDANTAG CollectionPage), synligt och i schemat.
 */
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KATEGORIER, type KategoriSlug } from '@/app/(public)/exempel/components/exempel-data'
import { BREV_YRKEN } from '@/app/(public)/exempel/components/yrken-data'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { Sida, Hjalte, Sektion, SektionHuvud, Knapp, TextLank, Brevpar, O, Chip } from '@/components/publikt/v3'
import BrevYrkesKort from '@/components/publikt/innehall/exempel/BrevYrkesKort'
import { BranschBrickor } from '@/components/publikt/innehall/exempel/BrevNav'
import '@/components/publikt/innehall/exempel/brev-exempel.css'

interface PageProps {
  params: Promise<{ kategori: string }>
}

/** Ingressen med antalet ur datan (vården sa "20+ yrken", brevnavet har 17). */
function ingress(text: string, antal: number): string {
  return text.replace(/\b20\+ yrken\b/, `${antal} yrken`)
}

export async function generateStaticParams() {
  return KATEGORIER.map((k) => ({ kategori: k.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { kategori: slug } = await params
  const kat = KATEGORIER.find((k) => k.slug === slug)
  if (!kat) return {}

  const yrkenIDennaTyp = kat.yrken.filter((y) => BREV_YRKEN[y]).length

  return {
    title: `Personligt brev-exempel ${kat.namn.toLowerCase()} (${yrkenIDennaTyp} yrken) | Jobbcoach.ai`,
    description: `Professionella personliga brev inom ${kat.namn.toLowerCase()}. ${kat.kortBeskrivning}. Skrivna med svenska rekryterare och ATS-system i åtanke.`,
    keywords: `personligt brev exempel ${kat.namn.toLowerCase()}, personligt brev mall ${kat.namn.toLowerCase()}, ansökningsbrev ${kat.namn.toLowerCase()}`,
    openGraph: {
      title: `Personligt brev-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
      type: 'website',
      locale: 'sv_SE',
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
      siteName: 'Jobbcoach.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Personligt brev-exempel för ${kat.namn} | Jobbcoach.ai`,
      description: kat.kortBeskrivning,
    },
    alternates: {
      canonical: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
    },
  }
}

export default async function BrevKategoriSida({ params }: PageProps) {
  const { kategori: slug } = await params
  const kat = KATEGORIER.find((k) => k.slug === (slug as KategoriSlug))
  if (!kat) notFound()

  const yrkenIDennaTyp = kat.yrken.filter((y) => BREV_YRKEN[y])
  const text = ingress(kat.introIngress, yrkenIDennaTyp.length)
  const katLitet = kat.namn.toLowerCase()

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Personligt brev-exempel för ${kat.namn}`,
    description: text,
    url: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
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
      {
        '@type': 'ListItem',
        position: 4,
        name: kat.namn,
        item: `https://www.jobbcoach.ai/personligt-brev-exempel/kategori/${slug}`,
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Personligt brev-exempel för ${kat.namn}`,
    numberOfItems: yrkenIDennaTyp.length,
    itemListElement: yrkenIDennaTyp.map((yrkesSlug, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: `Personligt brev-exempel: ${BREV_YRKEN[yrkesSlug]}`,
      url: `https://www.jobbcoach.ai/personligt-brev-exempel/${yrkesSlug}`,
    })),
  }

  // Korten ur navet: yrket som h3, "Personligt brev-exempel" som etikett (som förut) och navets rad.
  const kort = yrkenIDennaTyp.map((y) => ({
    yrke: BREV_YRKEN[y],
    slug: y,
    kategoriNamn: 'Personligt brev-exempel',
    text: BREV_GALLERI.find((g) => g.slug === y)?.intro ?? 'Se brevexempel',
  }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <Sida farg="brev" className="bx bx-nav">
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Exempel', href: '/exempel' },
            { name: 'Personligt brev-exempel', href: '/personligt-brev-exempel' },
            { name: kat.namn, href: `/personligt-brev-exempel/kategori/${slug}` },
          ]}
          brodsmulorSchema={false}
          chip={<Chip typ="vagg">{`Personligt brev-exempel · ${kat.namn}`}</Chip>}
          h1={
            <>
              Personligt brev-exempel för <span className="bx-h1-koppar">{katLitet}</span>
            </>
          }
          varde={text}
          lyft
        />

        <BranschBrickor yrken={BREV_GALLERI} vald={kat.slug} allaHref="/personligt-brev-exempel" uppmaning="Byt till en annan." />

        <Sektion botten="golv">
          <SektionHuvud rubrik={`${yrkenIDennaTyp.length} yrken inom ${katLitet}`}>
            <p>
              <TextLank href="/personligt-brev-exempel">Se alla personligt brev-exempel</TextLank>
            </p>
          </SektionHuvud>
          <BrevYrkesKort yrken={kort} />

          <div className="bx-cv-o">
            <O
              farg="cv"
              rubrikNiva="h2"
              rubrik="Behöver du även CV?"
              knappar={
                <Knapp href={`/cv-exempel/kategori/${kat.slug}`} variant="vit">
                  {`Se CV-exempel för ${katLitet}`}
                </Knapp>
              }
            >
              <p>
                Vi har {kat.yrken.length} CV-exempel inom {katLitet}.
              </p>
            </O>
          </div>
        </Sektion>

        <Sektion botten="golv" luft="utan-topp">
          <O
            farg="brev"
            rubrikNiva="h2"
            rubrik="Hittade du inte ditt yrke?"
            bild={<Brevpar />}
            knappar={
              <>
                <Knapp href="/personligt-brev-exempel">Alla personligt brev-exempel</Knapp>
                <TextLank href="/exempel">Alla exempel och mallar</TextLank>
              </>
            }
          >
            <p>Bläddra i hela biblioteket eller välj en annan bransch bland alla exempel.</p>
          </O>
        </Sektion>
      </Sida>
    </>
  )
}
