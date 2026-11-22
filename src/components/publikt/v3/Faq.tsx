/**
 * Frågor och svar i ny form (kit.css: .faq). details och summary, ingen
 * JavaScript, alla svar i HTML. Samma data som ../Faq (FaqFraga) och samma
 * FAQPage-schema (faqSchema), så att en sida kan byta komponent utan att
 * röra sina frågor. schema är av som standard: sidor som redan bygger
 * FAQPage i page.tsx ska inte få det dubbelt.
 */

import type { ReactNode } from 'react'
import { faqSchema, type FaqFraga } from '../Faq'

export type { FaqFraga }
export { faqSchema }

export function Faq({
  id,
  etikett,
  rubrik,
  rubrikNiva = 'h2',
  ingress,
  fragor,
  forstaOppen = true,
  schema = false,
  efter,
  className = '',
}: {
  id?: string
  etikett?: ReactNode
  /** Utan rubrik ritas bara frågorna (sidan har redan ett sektionshuvud). */
  rubrik?: ReactNode
  rubrikNiva?: 'h2' | 'h3'
  ingress?: ReactNode
  fragor: readonly FaqFraga[]
  forstaOppen?: boolean
  /** Skriv FAQPage-JSON-LD ur samma lista. */
  schema?: boolean
  /** Rad under frågorna, till exempel en knapprad. */
  efter?: ReactNode
  className?: string
}) {
  const Rubrik = rubrikNiva
  return (
    <div id={id} className={className || undefined}>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(fragor)) }} /> : null}
      {rubrik || etikett || ingress ? (
        <div className="p3-sekt-huvud p3-faq-huvud">
          {etikett ? <p className="p3-ey">{etikett}</p> : null}
          {rubrik ? <Rubrik className="p3-h2">{rubrik}</Rubrik> : null}
          {ingress ? <p className="p3-varde">{ingress}</p> : null}
        </div>
      ) : null}
      <div className="p3-faq">
        {fragor.map((f, i) => (
          <details key={f.q} open={forstaOppen && i === 0}>
            <summary>{f.q}</summary>
            <div>
              <p>{f.a}</p>
              {f.lank ? (
                <p>
                  <a className="p3-lank" href={f.lank.href}>
                    {f.lank.text}
                  </a>
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
      {efter ? <div className="p3-faq-efter">{efter}</div> : null}
    </div>
  )
}
