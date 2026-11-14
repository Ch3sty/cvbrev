/**
 * Kampanjerna på de publika sidorna (lib/kampanj).
 *
 * Publika sidor CDN-cachas ett dygn, så servern kan inte avgöra vilken
 * kampanj som pågår när besökaren kommer. Varje sida bär därför alla
 * varianter (ordinarie och varje kampanj som inte tagit slut), dolda, och
 * KampanjHuvud väljer i <head> före första målningen. Inget skiftar, och
 * ingen cache behöver rensas vid midnatt.
 *
 * När sista kampanjen tagit slut renderas inga varianter och ingen stil
 * alls, så en sida som byggs om efter 1 december är som förut.
 */

import type { ReactNode } from 'react'
import { PLAN_BY_KEY, SALD_PLAN, prisPeriod } from '@/lib/plans/plans'
import { kampanjPrisPeriod, kampanjSkript, kampanjerKvar, type Kampanj } from '@/lib/kampanj/kampanj'
import KampanjMatning from './KampanjMatning'

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
    `.kampanj-rad{display:flex;align-items:center;justify-content:center;gap:6px 14px;flex-wrap:wrap;min-height:44px;padding:9px 16px;font-size:14px;line-height:1.35;text-align:center;text-decoration:none}` +
    `.kampanj-rad b{font-family:var(--font-display),Inter,system-ui,sans-serif;font-weight:800;letter-spacing:.04em;margin-right:6px}` +
    `.kampanj-rad u{font-weight:600;text-underline-offset:3px}` +
    `.kampanj-rad--svart{background:#141210;color:#E9DFD1}.kampanj-rad--svart b{color:#E07A2F}` +
    `.kampanj-rad--indigo{background:#1B2246;color:#DDE1F6}.kampanj-rad--indigo b{color:#93A0EC}` +
    `.kampanj-rad:focus-visible{outline:2px solid #E07A2F;outline-offset:-4px}` +
    `@media (max-width:640px){.kampanj-rad{font-size:13px;padding:8px 14px}.kampanj-rad u{display:none}}` +
    `.pub-pris s{font-size:.42em;font-weight:600;letter-spacing:0;color:var(--vagg-mjuk);margin-left:10px}` +
    `.ib-pris-l s{font-size:.5em;font-weight:600;letter-spacing:0;color:var(--vagg-mjuk);margin-left:8px}`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script dangerouslySetInnerHTML={{ __html: kampanjSkript(new Date()) }} />
    </>
  )
}

/**
 * Ordinarie innehåll och en variant per kampanj som är kvar. Utan kampanjer
 * kvar blir det bara det ordinarie, utan omslag.
 */
export function KampanjVarianter({
  ord,
  kampanj,
}: {
  ord: ReactNode
  kampanj: (k: Kampanj) => ReactNode
}) {
  const kvar = kampanjerKvar(new Date())
  if (kvar.length === 0) return <>{ord}</>
  return (
    <>
      <span data-kv="ord">{ord}</span>
      {kvar.map((k) => (
        <span key={k.nyckel} data-kv={k.nyckel}>
          {kampanj(k)}
        </span>
      ))}
    </>
  )
}

/** Raden under menyn på publika sidor. Hela raden är länken. */
export function KampanjRadPublik() {
  const kvar = kampanjerKvar(new Date())
  if (kvar.length === 0) return null
  return (
    <>
      {kvar.map((k) => (
        <div key={k.nyckel} data-kv={k.nyckel}>
          <a href="/priser" className={`kampanj-rad kampanj-rad--${k.tema}`} data-kampanj-lank={k.nyckel}>
            <span>
              <b>{k.etikett}</b>
              {k.copy.bannerText}
            </span>
            <u>{k.copy.bannerLank}</u>
          </a>
        </div>
      ))}
      <KampanjMatning />
    </>
  )
}

/** Priset på bläck: "99 kr 149 kr / första månaden, sedan ...". */
export function KampanjPris({ k }: { k: Kampanj }) {
  const ord = PLAN_BY_KEY[SALD_PLAN].amount
  return (
    <>
      {k.pris} kr<s>{ord} kr</s>
      <small>första månaden, sedan {ord} kr i månaden. Säg upp när du vill.</small>
    </>
  )
}

/**
 * En prisrad i löptext där "149 kr i månaden" följer kampanjen (H2,
 * 2026-11-14): provkorten, verktygskorten och sidokortet i artiklarna.
 * Bara själva priset byts, resten av meningen står som förut. Text utan
 * priset ritas som den är.
 */
export function MedKampanjPris({ text }: { text: string }) {
  const pris = prisPeriod(SALD_PLAN)
  const i = text.indexOf(pris)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <KampanjVarianter ord={pris} kampanj={(k) => kampanjPrisPeriod(k)} />
      {text.slice(i + pris.length)}
    </>
  )
}
