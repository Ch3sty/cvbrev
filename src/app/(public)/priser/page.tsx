/**
 * /priser (spec-rummen 17.3 och 17.4, copy-premium avsnitt 3).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs. Ordningen är argumentet:
 * hero med namnet och priset, kortet med vad som ingår och köpknappen,
 * gratisraden, funktionerna en och en, hjälpredan, förtroendekorten,
 * tabellen gratis mot Premium och frågorna.
 *
 * Serverrenderad rakt igenom. Köpknappen är det enda som behöver
 * JavaScript; den ser likadan ut för in- och utloggade, så inget flyttar
 * sig. Kortet, tabellen, alla FAQ-svar och förtroendekorten står i HTML.
 * Trådens utseende: sidan är publik och har inget rum.
 *
 * SEO: Product med AggregateOffer och FAQPage. Bara säljbara planer
 * (SALJBARA_PLANER), så schemat och kortet läser samma rad i PLANS. Inga
 * betyg och inga citat (ägarens beslut).
 */

import PriserHero from './components/PriserHero'
import PriserPaket from './components/PriserPaket'
import PriserGratis from './components/PriserGratis'
import PriserFunktioner from './components/PriserFunktioner'
import PriserGuide from './components/PriserGuide'
import PriserFortroende from './components/PriserFortroende'
import PriserJamforelse from './components/PriserJamforelse'
import PriserFAQ from './components/PriserFAQ'
import PriserMatning from './components/PriserMatning'
import { faqSchema, prisSchema } from './components/priser-schema'

// Samma dygn som resten av (public). Sidan har ingen besökarspecifik data:
// inloggningen läses i klienten, så CDN:et får behålla svaret.
export const revalidate = 86400

export default function PriserSida() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(prisSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
      />

      <main className="min-h-screen bg-mark">
        <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-[72px] lg:pt-16">
          <PriserHero />
          <PriserPaket />
          <PriserGratis />
          <PriserFunktioner />
          <PriserGuide />
          <PriserFortroende />
          <PriserJamforelse />
          <PriserFAQ />
        </div>
      </main>

      <PriserMatning />
    </>
  )
}
