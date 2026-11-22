/**
 * Hjälten på väggen (kit.css: .vagg .hjalte, skisserna start och cv-analys).
 *
 * Ordning i texten: brödsmulor, chip, etikett, h1 (med valfri etikett inuti,
 * beslut 4), värdemeningen, mer text, knappraden, talbrickorna. Bilden står
 * till höger från 1000 px, under texten i telefonen.
 *
 * lyft: ett lyft kort (<Lyft>) följer direkt och går in över väggens
 * nederkant. Utan lyft blir nederkanten lägre.
 */

import type { ReactNode } from 'react'
import type { Farg } from './farg'
import { Talbrickor, type Talbricka } from './Bitar'

export interface Brodsmula {
  name: string
  href: string
}

/** BreadcrumbList som JSON-LD, samma form som src/components/Breadcrumb.tsx. */
export function brodsmulorSchema(items: readonly Brodsmula[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.jobbcoach.ai${item.href}`,
    })),
  }
}

/** Synliga brödsmulor på väggen. schema skriver BreadcrumbList (av om sidan redan bygger den själv). */
export function Brodsmulor({ items, schema = true }: { items: readonly Brodsmula[]; schema?: boolean }) {
  return (
    <>
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brodsmulorSchema(items)) }} />
      ) : null}
      <nav className="p3-brod" aria-label="Breadcrumb">
        <ol>
          {items.map((item, i) => (
            <li key={item.href + i}>
              {i === items.length - 1 ? <span aria-current="page">{item.name}</span> : <a href={item.href}>{item.name}</a>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export function Hjalte({
  id,
  farg,
  brodsmulor,
  brodsmulorSchema: medSchema = true,
  chip,
  etikett,
  h1,
  h1Etikett,
  h1Mindre,
  varde,
  children,
  knappar,
  brickor,
  bild,
  lyft,
  className = '',
}: {
  id?: string
  /** En annan färg än sidans (sällan). */
  farg?: Farg
  brodsmulor?: readonly Brodsmula[]
  /** false om sidan redan skriver BreadcrumbList själv. */
  brodsmulorSchema?: boolean
  /** Chip ovanför rubriken, till exempel <Chip typ="vagg">Gratis för varje CV</Chip>. */
  chip?: ReactNode
  /** Etiketten ovanför h1 (egen rad, inte en del av rubriken). */
  etikett?: ReactNode
  h1: ReactNode
  /** Etikett INUTI h1 (beslut 4): sökordet står i rubriken, ögat läser löftet. */
  h1Etikett?: ReactNode
  /** Mindre rubrik för långa h1 (36/54 px i stället för 40/66). */
  h1Mindre?: boolean
  /** Värdemeningen. Fet text med <b>. */
  varde?: ReactNode
  /** Mer text under värdemeningen (egna <p className="p3-text">). */
  children?: ReactNode
  /** Innehållet i knappraden: <Knapp pil ...> och <TextLank ...>. */
  knappar?: ReactNode
  brickor?: readonly Talbricka[]
  /** Bilden till höger: CvArk, Testram, Brevpar, egna kort. */
  bild?: ReactNode
  /** Ett <Lyft> följer direkt. */
  lyft?: boolean
  className?: string
}) {
  const klass = ['p3-vagg', 'p3-hjalte', lyft ? '' : 'p3-utan-lyft', className].filter(Boolean).join(' ')
  return (
    <section id={id} className={klass} data-p3-farg={farg}>
      <div className="p3-bredd">
        {brodsmulor?.length ? <Brodsmulor items={brodsmulor} schema={medSchema} /> : null}
        <div className={`p3-hjalte-rad ${bild ? 'p3-med-bild' : ''}`.trim()}>
          <div className="p3-hjalte-text">
            {chip ? <p>{chip}</p> : null}
            {etikett ? <p className="p3-ey">{etikett}</p> : null}
            <h1 className={`p3-h1 ${h1Mindre ? 'p3-h1-mindre' : ''}`.trim()}>
              {h1Etikett ? (
                <>
                  <span className="p3-over">{h1Etikett}</span>{' '}
                </>
              ) : null}
              {h1}
            </h1>
            {varde ? <p className="p3-varde">{varde}</p> : null}
            {children}
            {knappar ? <div className="p3-knapprad">{knappar}</div> : null}
            {brickor?.length ? <Talbrickor brickor={brickor} /> : null}
          </div>
          {bild ? <div className="p3-hjalte-bild">{bild}</div> : null}
        </div>
      </div>
    </section>
  )
}

/**
 * Det lyfta kortet: stort papper som går in över hjältens nederkant. Vyns
 * första handling (provet, uppladdningen). Står direkt efter <Hjalte lyft>.
 */
export function Lyft({ id, children, className = '', etikett }: { id?: string; children: ReactNode; className?: string; etikett?: string }) {
  return (
    <section id={id} className="p3-lyft-sekt" aria-label={etikett}>
      <div className="p3-bredd">
        <div className={`p3-lyft ${className}`.trim()}>{children}</div>
      </div>
    </section>
  )
}
