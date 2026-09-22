/**
 * Prissidans hjälte (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Ingen gradient, ingen heroillustration. Rubriken är sidans bild, och det
 * enda som får ligga mellan ingressen och korten är spårväljaren.
 * Serverkomponent, så rubriken målas i första svaret.
 */

import { PR_H1, PR_INGRESS } from '@/components/pricing/paket-copy'

export default function PriserHero() {
  return (
    <header className="mx-auto max-w-[720px] text-center">
      <h1 className="text-h1 text-ink-1 sm:text-[32px] sm:leading-9">{PR_H1}</h1>
      <p className="mt-3 text-sm leading-[22px] text-ink-2">{PR_INGRESS}</p>
    </header>
  )
}
