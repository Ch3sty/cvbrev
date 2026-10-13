/**
 * Inbäddningsbar Jobbkartan: hjältekartan med tidsreglaget och länsvalet, plus en källrad in till
 * /jobbkartan. Visas i iframe på andra webbplatser, därför noindex. Vyn (län och kvartal) följer
 * med i adressens #vy-, samma format som delningslänken på huvudsidan.
 */
import type { Metadata } from 'next'
import EmbedResizer from '@/components/rakna/EmbedResizer'
import { HjalteTal, JkTillbehor, KartScen, Tidrad } from '@/components/jobbkartan/Hjalte'
import JobbkartanKlient from '@/components/jobbkartan/JobbkartanKlient'
import { FJALL, GEO, OVERSIKT, hamtaAnnonser, rubrik, type JobbkartanData } from '@/lib/jobbkartan/data'
import '@/components/publikt/publikt.css'
import '@/components/jobbkartan/jobbkartan.css'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Jobbkartan: arbetslösa per ledigt jobb, län för län',
  robots: { index: false, follow: true },
}

export default async function JobbkartanInbaddad() {
  const D: JobbkartanData = { ...OVERSIKT, geo: GEO, fjall: FJALL, annonser: await hamtaAnnonser() }
  return (
    <div className="pub-sida">
      <main className="jk jk-badda">
        <EmbedResizer verktyg="jobbkartan" />
        <section className="sek yta-mark">
          <div className="wrap hjalte">
            <div className="hjalte-text">
              <h1 className="h1">{rubrik(D)}</h1>
              <HjalteTal D={D} />
            </div>
            <KartScen D={D} />
            <Tidrad D={D} />
          </div>
          <div className="wrap">
            <p className="kalla-rad">
              Källa: SCB och Arbetsförmedlingen.{' '}
              <a href="https://www.jobbcoach.ai/jobbkartan" target="_blank" rel="noopener">
                Se ditt yrke och din kommun på Jobbkartan hos jobbcoach.ai
              </a>
            </p>
          </div>
        </section>
        <JkTillbehor />
      </main>
      <JobbkartanKlient annonser={D.annonser} />
    </div>
  )
}
