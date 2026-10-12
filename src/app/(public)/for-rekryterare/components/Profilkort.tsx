/**
 * "Så ser hela profilen ut": den fiktiva redovisningsekonomens detaljprofil
 * som den ser ut i rekryterarportalen (src/app/rekryterare/kandidat/[userId]),
 * statisk och avidentifierad. Sex h3 i samma ordning som baslinjen:
 * Arbetslivserfarenhet, Utbildning och språk, Verifierade resultat,
 * Arbetsstil, Söker mig till och Villkor. Serverkomponent.
 */

import { SpektrumRad, type Spektrum } from '@/components/publikt/innehall/Traffkort'

const ERFARENHET = [
  {
    roll: 'Redovisningsansvarig',
    period: '2022 till nu',
    text: 'Ansvarar för koncernbokslut i ett växande byggbolag. Byggde upp rutinerna för projektredovisning från grunden.',
  },
  {
    roll: 'Redovisningsekonom',
    period: '2019 till 2022',
    text: 'Löpande redovisning, moms och månadsbokslut för tre bolag i en byggkoncern.',
  },
  {
    roll: 'Ekonomiassistent',
    period: '2018 till 2019',
    text: 'Leverantörsreskontra och avstämningar. Första rollen efter examen.',
  },
]

const RESULTAT = [
  { test: 'Matrislogik, expertnivå', niva: 'Topp 10 %', antal: 'av 1 240 testade, ett försök' },
  { test: 'Numeriskt, standardnivå', niva: 'Topp 15 %', antal: 'av 890 testade, ett försök' },
]

const SPEKTRA: Spektrum[] = [
  { vanster: 'Improviserar och anpassar', hoger: 'Planerar och strukturerar', band: 5 },
  { vanster: 'Snabb till beslut', hoger: 'Grundlig före beslut', band: 4 },
  { vanster: 'Får energi av eget fokusarbete', hoger: 'Får energi av samarbete i grupp', band: 2 },
]

const VILLKOR = [
  { namn: 'Tillträde', varde: 'Omgående' },
  { namn: 'Arbetsplats', varde: 'Hybrid' },
  { namn: 'Omfattning', varde: 'Heltid' },
  { namn: 'Körkort', varde: 'B-körkort' },
]

export default function Profilkort() {
  return (
    <div className="if-profil pub-rum-neu">
      <div className="if-profil-topp">
        <div className="if-profil-id">
          <i aria-hidden="true">R</i>
          <div>
            <b>Redovisningsekonom</b>
            <span>Stockholms län, 8 års erfarenhet, civilekonom. Anonym profil</span>
          </div>
        </div>
        <ul className="if-pills">
          <li className="if-v">Matrislogik, topp 10 %</li>
          <li className="if-v">Numeriskt, topp 15 %</li>
          {['Strukturerad', 'Analytisk', 'Koncernbokslut', 'Projektredovisning', 'Moms'].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <blockquote className="if-profil-pitch">
          <p>Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.</p>
          <small>Kandidatens egen pitch</small>
        </blockquote>
      </div>
      <div className="if-profil-g">
        <div>
          <h3>Arbetslivserfarenhet</h3>
          <ul className="if-profil-lista">
            {ERFARENHET.map((e) => (
              <li key={e.roll}>
                <b>{e.roll}</b>
                <span>Visas efter accepterad kontakt, {e.period}</span>
                <p>{e.text}</p>
              </li>
            ))}
          </ul>
          <p className="if-profil-not">
            Arbetsgivarna låses upp när kandidaten tackar ja till kontakt. Skyddet gör att kandidater vågar visa upp sig
            medan de har jobb kvar, och det är därför poolen har profiler du inte hittar någon annanstans.
          </p>

          <h3>Utbildning och språk</h3>
          <p className="if-profil-p">
            <b>Civilekonomexamen, redovisning och finansiering.</b> Handelshögskola i Stockholm, examen 2018.
          </p>
          <p className="if-profil-p">Svenska, modersmål. Engelska, flytande.</p>

          <h3>Söker mig till</h3>
          <ul className="if-pills" style={{ marginTop: 0 }}>
            <li className="if-soker">Analytiskt djuparbete</li>
            <li className="if-soker">Noggrannhet och självständigt ansvar</li>
          </ul>
          <p className="if-profil-not">
            Kandidatens egna ord om var hen trivs, byggda på personlighetstestet. Beskriver trivsel och arbetssätt, aldrig
            lämplighet eller förväntad prestation.
          </p>
        </div>
        <div>
          <h3>Verifierade resultat</h3>
          <p className="if-profil-not" style={{ marginTop: 0, marginBottom: 10 }}>
            Slutförda rekryteringstester på Jobbcoach.ai, bästa resultat per nivå. Verifierat av oss.
          </p>
          <ul className="if-profil-res pub-rum-tran">
            {RESULTAT.map((r) => (
              <li key={r.test}>
                <span>{r.test}</span>
                <b>{r.niva}</b>
                <small>{r.antal}</small>
              </li>
            ))}
          </ul>
          <p className="if-profil-not">
            Strukturerad och Analytisk: personlighetsstyrkor, delade med kandidatens samtycke. Percentilerna jämför
            kandidaten med alla som gjort samma test hos oss. Du behöver inte lita på CV-formuleringar, resultaten kommer
            från riktiga test gjorda på vår plattform.
          </p>

          <h3>Arbetsstil</h3>
          <p className="if-profil-p">
            <b>Strukturerad analytiker.</b> Metodisk problemlösare som gärna tänker nytt, men aldrig slarvigt.
          </p>
          {SPEKTRA.map((s) => (
            <SpektrumRad key={s.vanster} s={s} />
          ))}
          <p className="if-profil-p" style={{ marginTop: 12 }}>
            <b>Trivs när</b> processer är tydliga och kvalitet hinner göras rätt. <b>Utmanas när</b> planer rivs upp
            dagligen utan förklaring.
          </p>
          <p className="if-profil-not">
            Introduktionsguide och en intervjuguide byggd på kandidatens styrkor låses upp när kandidaten tackar ja.
            Rapporten beskriver arbetssätt och trivsel, inte kompetens eller förväntad prestation. Kandidaten ser exakt
            samma rapport som du.
          </p>

          <h3>Villkor</h3>
          <dl className="if-villkor">
            {VILLKOR.map((v) => (
              <div key={v.namn}>
                <dt>{v.namn}</dt>
                <dd>{v.varde}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
