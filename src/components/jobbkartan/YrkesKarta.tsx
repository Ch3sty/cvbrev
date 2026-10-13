/**
 * "Var jobben finns för [yrket]" på yrkessidorna (/cv-exempel/[yrke] och
 * /personligt-brev-exempel/[yrke]), ägarbeslut 2026-10-13 efter konceptet
 * docs/design/koncept-jobbkartan-2026-10-13.html punkt 4.
 *
 * Serverkomponent utan klientkod: kartan är förenklad SVG ritad här, datan läses på servern
 * (src/lib/jobbkartan/yrkesFigur.ts) och stilen står i yrkeskarta.css, inte i jobbkartan.css.
 * Sidor utan säker yrkeskod (yrkesKoppling.ts) får ingenting. Klicket på "Se hela kartan"
 * mäts av TeaserMatare, som ritar inget och bara lyssnar på data-matning.
 */
import Rum from '@/components/publikt/Rum'
import { miniKarta, yrkesFigur } from '@/lib/jobbkartan/yrkesFigur'
import TeaserMatare from './TeaserMatare'
import './yrkeskarta.css'

export default function YrkesKarta({ slug, page }: { slug: string; page: string }) {
  const f = yrkesFigur(slug)
  if (!f) return null
  const karta = miniKarta()
  const versal = f.plural.charAt(0).toUpperCase() + f.plural.slice(1)
  return (
    <Rum rum="jobb" yta="ton" className="yk" aria-labelledby="yk-rubrik">
      <div className="pub-wrap yk-g">
        <div className="yk-huvud">
          <p className="pub-kick">Jobbkartan</p>
          <h2 className="pub-h2" id="yk-rubrik">
            {`Var jobben finns för ${f.plural}`}
          </h2>
        </div>
        <div className="yk-kropp">
          <p className="yk-rad">{`Vanligast i ${f.toppLan}, ${f.toppKvot} gånger landets snitt.`}</p>
          {f.lon ? (
            <p className="yk-tal">
              <b>{`${f.lon.kr} kr`}</b>
              <span>{`medellön i månaden i hela landet ${f.lon.ar}`}</span>
            </p>
          ) : null}
        </div>
        <div className="yk-fotdel">
          <p className="yk-fot">
            {`Färgen visar hur stor del av länets anställda som arbetar som ${f.plural}, jämfört med hela landet. ` +
              `Källa: SCB, yrkesregistret ${f.ar}${f.lon ? ` och lönestrukturstatistiken ${f.lon.ar}` : ''}.`}
          </p>
          <a className="pub-lank yk-lank" href={f.href} data-matning="jobbkartan-teaser">
            Se hela kartan
          </a>
        </div>
        <figure className="yk-figur">
          <svg
            className="yk-karta"
            viewBox={karta.viewBox}
            role="img"
            aria-label={`Karta över länen. ${versal} är vanligast i ${f.toppLan}, ${f.toppKvot} gånger landets snitt.`}
          >
            {karta.lan.map((l) => (
              <path key={l.kod} className={`yk-k${f.steg[l.kod] ?? 0}`} d={l.d} />
            ))}
          </svg>
          <figcaption className="yk-skala">
            <span>Ovanligare</span>
            <span className="yk-ramp" aria-hidden="true">
              <i className="yk-k1" />
              <i className="yk-k2" />
              <i className="yk-k3" />
              <i className="yk-k4" />
              <i className="yk-k5" />
            </span>
            <span>Vanligare</span>
          </figcaption>
        </figure>
      </div>
      <TeaserMatare page={page} />
    </Rum>
  )
}
