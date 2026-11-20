'use client'

/**
 * En uppgift i de publika proven, ritad av typens komponent ur
 * sessionsramen (omgång 2 steg C): samma Svarskort, talrad, matris och
 * villkor som i de inloggade testerna, utan facit (lagesregler('publikt')).
 *
 * I artikelns provruta (`rubrik="p"`) blir uppgiftens rubriker p, så att
 * artikelns rubrikträd inte ändras, och uppgiften står kompakt: underlaget
 * (texten eller tabellen) över uppgiften, inga fästa spalter och inga
 * negativa marginaler. På provsidan ritar ramen underlaget i sin egen spalt.
 */

import { RubrikTaggProvider } from '@/components/tests/RubrikTagg'
import type { ProvPost } from './provPost'

export default function ProvUppgiftVy({
  post,
  nr,
  antal,
  vald,
  onValj,
  last = false,
  rubrik = 'h2',
  deltest,
}: {
  post: ProvPost
  nr: number
  antal: number
  vald: number | null
  onValj?: (i: number) => void
  last?: boolean
  /** p i artiklarna: kompakt, med underlaget över uppgiften och utan rubriker. */
  rubrik?: 'h2' | 'p'
  /** I-provets deltest, som rad över uppgiften. */
  deltest?: string | null
}) {
  const Uppgift = post.ritare.Uppgift
  const kompakt = rubrik === 'p'
  const UL = kompakt ? post.ritare.underlag : undefined
  return (
    <RubrikTaggProvider value={rubrik}>
      <div className="flex flex-col gap-3" data-prov-uppgift={post.ritare.kind}>
        {deltest ? <p className="text-[12px] font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">{deltest}</p> : null}
        {UL ? <UL.Ritare u={post.u} /> : null}
        <Uppgift u={post.u} nr={nr} antal={antal} vald={vald} facit={null} onValj={last ? undefined : onValj} last={last} kompakt={kompakt} />
      </div>
    </RubrikTaggProvider>
  )
}
