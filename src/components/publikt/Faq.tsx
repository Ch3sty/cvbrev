/**
 * Frågorna som details och summary, ingen JavaScript. Alla svar står i HTML.
 * Med schema skrivs FAQPage-JSON-LD ur samma lista. På sidor där schemat
 * redan byggs i page.tsx (verktygssidorna, priser) är schema av, så att det
 * inte blir dubbelt.
 */

import type { ReactNode } from 'react'

export interface FaqFraga {
  q: string
  a: string
}

export function faqSchema(fragor: readonly FaqFraga[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fragor.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export default function Faq({
  id,
  rubrik,
  rubrikNiva = 'h2',
  ingress,
  fragor,
  forstaOppen = true,
  schema = false,
  efter,
}: {
  id?: string
  rubrik: string
  rubrikNiva?: 'h2' | 'h3'
  ingress?: ReactNode
  fragor: readonly FaqFraga[]
  forstaOppen?: boolean
  schema?: boolean
  /** Rad under frågorna, till exempel en länk eller köpknappen. */
  efter?: ReactNode
}) {
  const Rubrik = rubrikNiva
  return (
    <div id={id}>
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(fragor)) }} />
      ) : null}
      <Rubrik className="pub-h2">{rubrik}</Rubrik>
      {ingress ? (
        <p className="pub-liten" style={{ marginTop: 10 }}>
          {ingress}
        </p>
      ) : null}
      <div className="pub-faq" style={{ marginTop: 28 }}>
        {fragor.map((f, i) => (
          <details key={f.q} open={forstaOppen && i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      {efter}
    </div>
  )
}
