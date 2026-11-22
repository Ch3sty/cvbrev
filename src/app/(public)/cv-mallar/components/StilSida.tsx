/**
 * Stilsidorna /cv-mallar/word, /foto och /enkla (SEO-svepet 2026-11-17,
 * docs/plan-seo-cv-kluster-2026-11-17.md, B5), i publikt omgång 3 med
 * samma form som /cv-mallar där delarna delas (skissen cv-mallar): hjälten
 * med mallväggen, uppladdningen och arbetsytan i det lyfta kortet,
 * mallkortet i rutnätet till provsidan och Premiumremsan, sedan sidans egen
 * text, länkarna och frågorna i grundens skal. Katalogen i providern är
 * filtrerad till sidans mallar. Texten är sidornas egen, ordagrant.
 * Serverkomponent.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Sida, Hjalte, Sektion, SektionHuvud, Rutnat, Faq, Knapp, TextLank, Dorr, type FaqFraga } from '@/components/publikt/v3'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import { ARTIKEL } from '@/components/cv/Dokument/texter'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { prisInfo } from '@/lib/cv/mallval/pris.server'
import { STIL_SIDOR, stilMallar, type Stil } from '@/lib/seo/cv-kluster'
import { MallKortet, Mallvagg, ProvaLyft } from './MallDelar'
import './mallar-v3.css'

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
  // Gratismallarna först i mallväggen, sedan katalogens ordning.
  const vagg = [...mallar.filter((m) => m.niva === 'gratis'), ...mallar.filter((m) => m.niva !== 'gratis')].slice(0, 8)
  const bottnar = ['golv', 'ton'] as const
  return (
    <>
      <RedirectLoggedIn to={p.inloggadTill} />
      {stilSchema(p.stil, p.faq).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Sida farg="cv">
        <ProvaProvider katalog={mallar} surface={`mallsida_${p.stil}`} pris={prisInfo()}>
          <div id="innehall">
            <Hjalte
              id="hjalte"
              brodsmulor={[
                { name: 'Hem', href: '/' },
                { name: 'CV-mallar', href: '/cv-mallar' },
                { name: sida.kort, href: sida.path },
              ]}
              brodsmulorSchema={false}
              etikett={p.kick}
              h1={sida.h1}
              h1Mindre
              varde={p.ingress}
              knappar={
                <>
                  <Knapp href="#ladda-upp" pil>
                    Ladda upp ditt CV
                  </Knapp>
                  <TextLank href="#mallarna">Se alla {mallar.length} mallar</TextLank>
                </>
              }
              bild={<Mallvagg mallar={vagg} etikett={`${vagg.length} av de ${mallar.length} mallarna`} />}
              lyft
            />

            {/* Resultatet på samma sida, som på /cv-mallar. */}
            <ProvaLyft etikett="Se ditt eget CV i mallarna" />

            <Sektion id="mallarna">
              <SektionHuvud rubrik={p.galleriRubrik} varde={p.galleriIngress} />
              <ul className="cvm-mallnat cvm-stilnat">
                {mallar.map((m) => {
                  const gratis = m.niva === 'gratis'
                  const href = `/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`
                  return (
                    <li key={m.id} id={`mall-${m.id}`}>
                      <MallKortet mall={m} href={href} under={ARTIKEL.mallrad(gratis, m.word)} />
                      <Link href={href} data-cta-klick={href} className="cvm-mall-knapp">
                        {gratis ? 'Fyll i gratis' : 'Prova med ditt CV'}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="p3-premium cvm-prem" data-premium-rad="">
                <div className="cvm-prem-rad">
                  <p style={{ fontSize: 16.5 }}>
                    <MedKampanjPris text={p.premiumRad} />
                  </p>
                  <Link href="/priser" className="p3-lank" data-cta-klick="/priser">
                    Se vad Premium ger
                  </Link>
                </div>
              </div>
            </Sektion>

            {p.avsnitt.map((a, i) => (
              <Sektion key={a.id} botten={bottnar[(i + 1) % 2]} id={a.id}>
                <div className="cvm-avsnitt">
                  <SektionHuvud etikett={a.kick} rubrik={a.rubrik} />
                  <div className="cvm-avsnitt-text">{a.innehall}</div>
                </div>
              </Sektion>
            ))}

            <Sektion botten={bottnar[(p.avsnitt.length + 1) % 2]} id="mer">
              <SektionHuvud etikett="Vidare" rubrik="Fler mallar och guider" />
              <Rutnat kolumner={2}>
                {p.lankar.map((l) => (
                  <Link key={l.href} href={l.href} data-cta-klick={l.href} className="p3-lankbricka">
                    <Dorr ikon="cv" />
                    <b>{l.rubrik}</b>
                    <span>{l.text}</span>
                  </Link>
                ))}
              </Rutnat>
            </Sektion>

            <Sektion botten={bottnar[p.avsnitt.length % 2]} id="fragor">
              <Faq rubrik={p.faqRubrik} fragor={p.faq} />
            </Sektion>
          </div>
        </ProvaProvider>
      </Sida>
    </>
  )
}
