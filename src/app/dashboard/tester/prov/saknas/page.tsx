/**
 * Målet för proxyns 404-rewrite för /dashboard/tester/prov/[token]
 * (src/proxy.ts). Adressen syns aldrig i webbläsaren: dokumentet behåller sin
 * egen URL och får status 404 från rewriten, men ritas i dashboardens skal.
 */

import ProvSaknasVy from '../ProvSaknasVy'

export const metadata = { title: 'Provet finns inte', robots: { index: false, follow: false } }

export default function ProvSaknasPage() {
  return <ProvSaknasVy />
}
