/**
 * Hela ansökan (spec-publikt-v2 del B 3.3, rad 7): CV-exemplet och brevet
 * för samma yrke och samma person, med länk till syskonsidan. Rubrikerna
 * H3 "CV-exempel" och "Personligt brev" står kvar. Ersätter
 * CompleteApplicationPackage på exempelsidorna; länkarna in i verktygen
 * finns kvar under paret.
 */

import Link from 'next/link'
import { MiniPapper } from './YrkesKort'

export default function AnsokanPar({ yrke, har, slug }: { yrke: string; har: 'cv' | 'brev'; slug: string }) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null
  const yrkeLitet = yrke.toLowerCase()
  const cvKort =
    har === 'cv' ? (
      <div className="pub-kort ib-par-kort pub-rum-cv" key="cv">
        <span className="har">Du är här</span>
        <h3>CV-exempel</h3>
        <p className="pub-liten">{yrke}</p>
        <ul className="pub-bock">
          <li>ATS-optimerad struktur</li>
          <li>Branschspecifika nyckelord</li>
          <li>Kvantifierade resultat</li>
        </ul>
      </div>
    ) : (
      <Link className="pub-kort ib-par-kort ib-par-lank pub-rum-cv" href={`/cv-exempel/${slug}`} key="cv">
        <span className="ib-par-bild">
          <MiniPapper />
        </span>
        <h3>CV-exempel</h3>
        <p className="pub-liten">{yrke}</p>
        <p>Se hur du strukturerar ett ATS-optimerat CV med rätt nyckelord och kvantifierade resultat för {yrkeLitet}.</p>
        <span className="pub-lank">Se CV-exemplet</span>
      </Link>
    )
  const brevKort =
    har === 'brev' ? (
      <div className="pub-kort ib-par-kort pub-rum-brev" key="brev">
        <span className="har">Du är här</span>
        <h3>Personligt brev</h3>
        <p className="pub-liten">{yrke}</p>
        <ul className="pub-bock">
          <li>Engagerande inledning</li>
          <li>Rätt tonalitet och längd</li>
          <li>Stark avslutning</li>
        </ul>
      </div>
    ) : (
      <Link className="pub-kort ib-par-kort ib-par-lank pub-rum-brev" href={`/personligt-brev-exempel/${slug}`} key="brev">
        <span className="ib-par-bild">
          <MiniPapper />
        </span>
        <h3>Personligt brev</h3>
        <p className="pub-liten">{yrke}</p>
        <p>Se hur du skriver ett övertygande personligt brev som kompletterar ditt CV och får dig till intervju.</p>
        <span className="pub-lank">Se det personliga brevet</span>
      </Link>
    )
  return (
    <>
      <div className="ib-par">{har === 'cv' ? [cvKort, brevKort] : [brevKort, cvKort]}</div>
      <p className="ib-par-fot">
        <span>Redo att skapa din egen ansökan?</span>
        <Link className="pub-lank" href="/dashboard/skapa-cv">
          Skapa CV
        </Link>
        <Link className="pub-lank" href="/dashboard/skapa-brev">
          Skapa personligt brev
        </Link>
      </p>
    </>
  )
}
