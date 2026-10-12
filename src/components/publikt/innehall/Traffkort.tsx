/**
 * Träffkortet ur kandidatpoolen (spec-publikt-v2 del B 2.2), statiskt och
 * avidentifierat. Samma uppgifter som träffkortet i rekryterarportalen:
 * senioritet, kandidatens egna ord, arbetsstilen som två spektra, verifierade
 * testresultat, styrkor, kompetenser, vad kandidaten söker och villkoren.
 * Råpoäng och lönespann visas aldrig. Knappen är en span: kortet är en bild
 * av produkten, inte en handling. Serverkomponent.
 */

import type { RumNamn } from '../telefon/Telefon'

export interface Spektrum {
  vanster: string
  hoger: string
  /** 1 till 5, punktens läge på linjen. */
  band: 1 | 2 | 3 | 4 | 5
}

export interface Kandidat {
  roll: string
  region: string
  /** Första faktat betonas: "8 års erfarenhet". */
  fakta?: string[]
  pitch?: string
  tester: string[]
  styrkor: string[]
  kompetenser: string[]
  soker?: string[]
  stil?: { spektra: Spektrum[]; trivsNar?: string }
  villkor: string[]
}

export const BAND_PROCENT: Record<Spektrum['band'], number> = { 1: 10, 2: 30, 3: 50, 4: 70, 5: 90 }

export function SpektrumRad({ s }: { s: Spektrum }) {
  return (
    <div className="if-skala">
      <span>{s.vanster}</span>
      <i aria-hidden="true" style={{ ['--p' as string]: `${BAND_PROCENT[s.band]}%` }} />
      <span>{s.hoger}</span>
    </div>
  )
}

export default function Traffkort({ k, rum = 'neu' }: { k: Kandidat; rum?: RumNamn }) {
  const [forst, ...resten] = k.fakta ?? []
  return (
    <article className={`if-kand pub-rum-${rum}`} aria-label={`Exempel på träffkort: ${k.roll}`}>
      <div className="if-kand-h">
        <i aria-hidden="true">{k.roll.charAt(0).toUpperCase()}</i>
        <div>
          <b>{k.roll}</b>
          <span>{k.region}. Anonym tills kandidaten tackar ja</span>
        </div>
      </div>
      {forst ? (
        <p className="if-kand-fakta">
          <b>{forst}</b>
          {resten.map((f) => `. ${f}`).join('')}
        </p>
      ) : null}
      {k.pitch ? <q>{k.pitch}</q> : null}
      {k.stil ? (
        <div className="if-kand-stil">
          <b>Arbetsstil</b>
          {k.stil.spektra.map((s) => (
            <SpektrumRad key={s.vanster} s={s} />
          ))}
          {k.stil.trivsNar ? <p className="if-kand-trivs">Trivs när {k.stil.trivsNar}</p> : null}
        </div>
      ) : null}
      <ul className="if-pills">
        {k.tester.map((t) => (
          <li key={t} className="if-v pub-rum-tran">
            {t}
          </li>
        ))}
        {[...k.styrkor, ...k.kompetenser].map((t) => (
          <li key={t}>{t}</li>
        ))}
        {k.soker?.length ? (
          <>
            <li className="if-etikett">Söker</li>
            {k.soker.map((t) => (
              <li key={t} className="if-soker">
                {t}
              </li>
            ))}
          </>
        ) : null}
      </ul>
      <div className="if-kand-fot">
        <span>{k.villkor.join('. ')}</span>
        <span className="if-kand-knapp">Visa intresse</span>
      </div>
    </article>
  )
}
