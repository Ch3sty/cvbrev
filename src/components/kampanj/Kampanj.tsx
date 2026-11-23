/**
 * Kampanjerna på de publika sidorna (lib/kampanj).
 *
 * Publika sidor CDN-cachas ett dygn, så servern kan inte avgöra vilken
 * kampanj som pågår när besökaren kommer. Varje sida bär därför alla
 * varianter (ordinarie och varje kampanj som inte tagit slut), dolda, och
 * KampanjHuvud väljer i <head> före första målningen. Inget skiftar, och
 * ingen cache behöver rensas vid midnatt.
 *
 * Kampanjmärket (KampanjMarke.tsx, kampanj.css) bär namnet, nedräkningen och
 * slutdatumet. Klockan i <head> räknar ned och väljer om variant när en
 * kampanj når noll (docs/design/spec-kampanjmarke-2026-11-23.md).
 *
 * När sista kampanjen tagit slut renderas inga varianter och ingen stil
 * alls, så en sida som byggs om efter 1 december är som förut.
 */

import './kampanj.css'
import type { ReactNode } from 'react'
import { SALD_PLAN, prisPeriod } from '@/lib/plans/plans'
import { KAMPANJ_ORD, kampanjPrisPeriod, kampanjSkript, kampanjerKvar, type Kampanj } from '@/lib/kampanj/kampanj'
import { KLOCKA_KOD } from '@/lib/kampanj/klocka'
import KampanjMatning from './KampanjMatning'
import { KampanjLiten, KampanjOrd } from './KampanjMarke'

export { KampanjPris, KampanjUr, KampanjLiten, KampanjOrd } from './KampanjMarke'

/** Stil och skript i <head>. Måste stå före allt som bär data-kv. */
export function KampanjHuvud() {
  const kvar = kampanjerKvar(new Date())
  if (kvar.length === 0) return null
  const visa = [
    'html:not([data-kampanj]) [data-kv="ord"]',
    ...kvar.map((k) => `html[data-kampanj="${k.nyckel}"] [data-kv="${k.nyckel}"]`),
  ].join(',')
  const css =
    `[data-kv]{display:none}${visa}{display:revert}` +
    `.pub-pris s{font-size:.42em;font-weight:600;letter-spacing:0;color:var(--vagg-mjuk);margin-left:10px}` +
    `.ib-pris-l s{font-size:.5em;font-weight:600;letter-spacing:0;color:var(--vagg-mjuk);margin-left:8px}`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script dangerouslySetInnerHTML={{ __html: kampanjSkript(new Date()) + KLOCKA_KOD }} />
    </>
  )
}

/**
 * Ordinarie innehåll och en variant per kampanj som är kvar. Utan kampanjer
 * kvar blir det bara det ordinarie, utan omslag. Utan `ord` ritas ingen
 * ordinarie variant alls. `som="div"` för block-innehåll.
 */
export function KampanjVarianter({
  ord,
  kampanj,
  som = 'span',
}: {
  ord?: ReactNode
  kampanj: (k: Kampanj) => ReactNode
  som?: 'span' | 'div'
}) {
  const kvar = kampanjerKvar(new Date())
  if (kvar.length === 0) return <>{ord ?? null}</>
  const Tagg = som
  return (
    <>
      {ord !== undefined ? <Tagg data-kv="ord">{ord}</Tagg> : null}
      {kvar.map((k) => (
        <Tagg key={k.nyckel} data-kv={k.nyckel}>
          {kampanj(k)}
        </Tagg>
      ))}
    </>
  )
}

/**
 * Raden under menyn på publika sidor. Hela raden är länken. Sedan
 * kampanjmärket (2026-11-23) på kampanjens nattbotten med plattan och
 * nedräkningen (km-rad i kampanj.css). Logiken (varianterna, data-kv,
 * mätningen) är densamma.
 */
export function KampanjRadPublik() {
  const kvar = kampanjerKvar(new Date())
  if (kvar.length === 0) return null
  return (
    <>
      {kvar.map((k) => (
        <div key={k.nyckel} data-kv={k.nyckel}>
          <a href="/priser" className={`km-rad km-tema-${k.tema}`} data-kampanj-lank={k.nyckel}>
            <span className="km-rad-in">
              <span className="km-platta km-platta-liten">{k.namn}</span>
              <span className="km-rad-text">
                <span className="km-rad-lang">{k.copy.bannerText}</span>
                <span className="km-rad-kort">{KAMPANJ_ORD.radKort(k)}</span>
              </span>
              <KampanjLiten k={k} utanPlatta enheter={2} />
              <u>{k.copy.bannerLank}</u>
            </span>
          </a>
        </div>
      ))}
      <KampanjMatning />
    </>
  )
}

/**
 * En prisrad i löptext där "149 kr i månaden" följer kampanjen (H2,
 * 2026-11-14): provkorten, verktygskorten och sidokortet i artiklarna.
 * Bara själva priset byts, resten av meningen står som förut, och under en
 * kampanj står kampanjens namn före priset. Text utan priset ritas som den är.
 */
export function MedKampanjPris({ text }: { text: string }) {
  const pris = prisPeriod(SALD_PLAN)
  const i = text.indexOf(pris)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <KampanjVarianter
        ord={pris}
        kampanj={(k) => (
          <>
            <KampanjOrd k={k} />
            {/* Mellanrummet för skärmläsare och textutdrag; synligt står marginalen. */}
            <span className="sr-only"> </span>
            {kampanjPrisPeriod(k)}
          </>
        )}
      />
      {text.slice(i + pris.length)}
    </>
  )
}
