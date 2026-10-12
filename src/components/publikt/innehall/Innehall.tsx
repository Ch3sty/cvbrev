/**
 * Innehållsförteckningen (spec-publikt-v2 del B 3.1, rad 2): i sidokolumnen
 * från 1024 px, som dragspel överst i texten på mobil. Länkarna i
 * sidokolumnen bär data-toc, så att ArtikelKlient markerar avsnittet man
 * läser (toc-aktiv). Utan skript står första avsnittet markerat.
 */

import type { Heading } from '@/lib/extractHeadings'

export default function Innehall({ headings, variant }: { headings: readonly Heading[]; variant: 'sido' | 'mobil' }) {
  if (!headings.length) return null
  if (variant === 'mobil') {
    return (
      <details className="ib-toc-m">
        <summary>Innehåll i guiden</summary>
        <ol>
          {headings.map((h) => (
            <li key={h.id}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ol>
      </details>
    )
  }
  return (
    <nav data-toc aria-label="Innehåll">
      <p className="ib-sidorub">Innehåll</p>
      <div className="ib-toc">
        {headings.map((h, i) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            aria-current={i === 0 ? 'location' : undefined}
            className={i === 0 ? 'toc-aktiv' : undefined}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  )
}
