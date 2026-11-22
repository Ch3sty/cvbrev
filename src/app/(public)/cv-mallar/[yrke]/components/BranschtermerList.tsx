/**
 * Termer, system och lagar på yrkesmallsidan, i publikt omgång 3: en
 * details per grupp, den första öppen. Alla termer står i HTML:en från
 * början (SEO-beskedet, villkor 3). Rubrikerna (h3) som förut.
 * Serverkomponent, ingen JavaScript.
 */

interface Term {
  term: string
  forklaring: string
}

interface Grupp {
  kategori: string
  termer: Term[]
}

export default function BranschtermerList({ grupper }: { grupper: Grupp[] }) {
  return (
    <div className="p3-faq cvy-termer">
      {grupper.map((g, idx) => (
        <details key={idx} open={idx === 0}>
          <summary>
            <span className="cvy-term-nr">{String(idx + 1).padStart(2, '0')}</span>
            <h3 className="cvy-term-rubrik">{g.kategori}</h3>
            <span className="cvy-term-antal">({g.termer.length} termer)</span>
          </summary>
          <div>
            <dl className="cvy-term-lista">
              {g.termer.map((t, tIdx) => (
                <div key={tIdx}>
                  <dt>{t.term}</dt>
                  <dd>{t.forklaring}</dd>
                </div>
              ))}
            </dl>
          </div>
        </details>
      ))}
    </div>
  )
}
