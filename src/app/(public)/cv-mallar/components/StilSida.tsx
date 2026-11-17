/**
 * Stilsidorna /cv-mallar/word, /foto och /enkla (SEO-svepet 2026-11-17,
 * docs/plan-seo-cv-kluster-2026-11-17.md, B5). Samma ytor och komponenter som
 * /cv-mallar (P3): hjälten med uppladdningen i ProvaProvider och arbetsytan
 * direkt under, galleriet med mallkortet (Miniatyr) till provsidan, Premium-
 * raden under galleriet (S2), sedan sidans egen text, länkarna och frågorna.
 * Katalogen i providern är filtrerad till sidans mallar, så arbetsytan visar
 * bara mallar med egenskapen. Serverkomponent.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import PubliktSida from '@/components/publikt/PubliktSida'
import Hjalte from '@/components/publikt/Hjalte'
import Rum from '@/components/publikt/Rum'
import Faq, { type FaqFraga } from '@/components/publikt/Faq'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import Uppladdning from '@/components/cv/Dokument/prova/Uppladdning'
import ProvaArbetsyta from '@/components/cv/Dokument/prova/ProvaArbetsyta'
import Miniatyr from '@/components/cv/Dokument/Miniatyr'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { prisInfo } from '@/lib/cv/mallval/pris.server'
import { STIL_SIDOR, stilMallar, type Stil } from '@/lib/seo/cv-kluster'

const BAS = 'https://www.jobbcoach.ai'

export interface StilAvsnitt {
  id: string
  kick: string
  rubrik: string
  innehall: ReactNode
}

export interface StilSidaProps {
  stil: Stil
  kick: string
  ingress: ReactNode
  galleriRubrik: string
  galleriIngress: ReactNode
  /** Premium-raden under galleriet (S2), med priset ur paketMedPris. */
  premiumRad: string
  avsnitt: StilAvsnitt[]
  /** Länkkort längst ner: guiderna och de andra stilsidorna. */
  lankar: { href: string; rubrik: string; text: string }[]
  faqRubrik: string
  faq: FaqFraga[]
  /** Dit inloggade skickas (P5). */
  inloggadTill: string
}

/** BreadcrumbList, ItemList med de visade mallarna och FAQPage (B5). */
export function stilSchema(stil: Stil, faq: readonly FaqFraga[]) {
  const sida = STIL_SIDOR[stil]
  const mallar = stilMallar(stil)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: BAS },
        { '@type': 'ListItem', position: 2, name: 'CV-mallar', item: `${BAS}/cv-mallar` },
        { '@type': 'ListItem', position: 3, name: sida.kort, item: `${BAS}${sida.path}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: sida.h1,
      numberOfItems: mallar.length,
      itemListElement: mallar.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `CV-mallen ${m.namn}`,
        url: `${BAS}/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
}

export default function StilSida(p: StilSidaProps) {
  const sida = STIL_SIDOR[p.stil]
  const mallar = stilMallar(p.stil)
  const ytor = ['panel', 'mark'] as const
  return (
    <>
      <RedirectLoggedIn to={p.inloggadTill} />
      {stilSchema(p.stil, p.faq).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <PubliktSida>
        <ProvaProvider katalog={mallar} surface={`mallsida_${p.stil}`} pris={prisInfo()}>
          <div id="innehall">
            <Hjalte
              id="hjalte"
              rum="cv"
              yta="vagg"
              vag="mark"
              brodsmulor={[
                { name: 'Hem', href: '/' },
                { name: 'CV-mallar', href: '/cv-mallar' },
                { name: sida.kort, href: sida.path },
              ]}
              kick={p.kick}
              h1={sida.h1}
              ingress={p.ingress}
              primar={null}
              bildLag
              bild={<Uppladdning />}
            />

            {/* Resultatet på samma sida, som på /cv-mallar. */}
            <Rum rum="cv" yta="mark" storlek="tat" id="valj-mall">
              <div className="pub-wrap">
                <ProvaArbetsyta />
              </div>
            </Rum>

            <Rum rum="cv" yta="panel" id="mallarna">
              <div className="pub-wrap">
                <h2 className="pub-h2">{p.galleriRubrik}</h2>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  {p.galleriIngress}
                </p>
                <div className="mt-8 grid max-w-[900px] grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                  {mallar.map((m) => {
                    const gratis = m.niva === 'gratis'
                    const href = `/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`
                    return (
                      <div key={m.id} id={`mall-${m.id}`} className="grid scroll-mt-24 content-start gap-2">
                        <Miniatyr mall={m} storlek="rutnat" href={href} under={ARTIKEL.mallrad(gratis, m.word)} />
                        <Link
                          href={href}
                          data-cta-klick={href}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-kant-stark bg-papper px-3 text-center text-sm font-semibold text-ink-1 hover:border-ink-1"
                        >
                          {gratis ? 'Fyll i gratis' : 'Prova med ditt CV'}
                        </Link>
                      </div>
                    )
                  })}
                </div>
                <p className="pub-brod" style={{ marginTop: 28, maxWidth: 760 }} data-premium-rad="">
                  <MedKampanjPris text={p.premiumRad} />{' '}
                  <Link href="/priser" className="pub-lank" data-cta-klick="/priser">
                    Se vad Premium ger
                  </Link>
                </p>
              </div>
            </Rum>

            {p.avsnitt.map((a, i) => (
              <Rum key={a.id} rum="cv" yta={ytor[(i + 1) % 2]} id={a.id}>
                <div className="pub-wrap" style={{ maxWidth: 760 }}>
                  <p className="pub-kick">{a.kick}</p>
                  <h2 className="pub-h2">{a.rubrik}</h2>
                  <div className="pub-brod" style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                    {a.innehall}
                  </div>
                </div>
              </Rum>
            ))}

            <Rum rum="cv" yta={ytor[(p.avsnitt.length + 1) % 2]} id="mer">
              <div className="pub-wrap">
                <p className="pub-kick">Vidare</p>
                <h2 className="pub-h2">Fler mallar och guider</h2>
                <div className="pub-raster pub-raster-2" style={{ marginTop: 28 }}>
                  {p.lankar.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      data-cta-klick={l.href}
                      className="pub-kort block hover:border-ink-1"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <span className="pub-h4 block">{l.rubrik}</span>
                      <span className="mt-2 block text-[15px] text-ink-2">{l.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </Rum>

            <Rum rum="cv" yta={ytor[p.avsnitt.length % 2]} id="fragor">
              <div className="pub-wrap" style={{ maxWidth: 820 }}>
                <Faq rubrik={p.faqRubrik} fragor={p.faq} />
              </div>
            </Rum>
          </div>
        </ProvaProvider>
      </PubliktSida>
    </>
  )
}
