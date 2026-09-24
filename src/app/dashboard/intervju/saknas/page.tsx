/**
 * Målet för proxyns 404-rewrite (src/proxy.ts, intervjuKontroll). Adressen
 * syns aldrig i webbläsaren: dokumentet behåller sin egen URL och får
 * status 404 från rewriten, men ritas inuti dashboardens skal.
 */

import SaknasVy from '../components/SaknasVy'

export const metadata = { title: 'Provet finns inte', robots: { index: false, follow: false } }

export default function IntervjuSaknasPage() {
  return <SaknasVy />
}
