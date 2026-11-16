/**
 * /cv-mallar/prova (plan-mallar 3.2 och 5): provsidan. Tar namn, titel,
 * mall, typsnitt och rubriker ur adressen (artikelns "Fortsätt med ditt
 * CV", galleriets miniatyrer, den gamla /cv-mallar/start som 308:ar hit),
 * uppladdningen utan konto och dokumentet. Noindex, follow; robots.ts
 * stänger den också. Efter Google kommer hon tillbaka hit med ?hamta=1 och
 * utkastet hämtas hem.
 */
import type { Metadata } from 'next'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import ProvaProvider from '@/components/cv/Dokument/prova/ProvaKontext'
import Uppladdning from '@/components/cv/Dokument/prova/Uppladdning'
import ProvaArbetsyta from '@/components/cv/Dokument/prova/ProvaArbetsyta'
import { PROVA } from '@/components/cv/Dokument/texter'
import { MALL_KATALOG, MALL_ANTAL, GRATIS_ANTAL } from '@/lib/cv/mallval/katalog'
import { prisInfo } from '@/lib/cv/mallval/pris.server'

export const metadata: Metadata = {
  title: 'Se ditt CV i våra mallar | Jobbcoach.ai',
  description: PROVA.ingress(MALL_ANTAL, GRATIS_ANTAL),
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.jobbcoach.ai/cv-mallar' },
}

export default function ProvaSida() {
  return (
    <PubliktSida>
      <ProvaProvider katalog={MALL_KATALOG} surface="prova" pris={prisInfo()} lasAdress>
        <div id="innehall">
          <Rum rum="cv" yta="vagg" storlek="tat">
            <div className="pub-wrap pub-tva pub-tva-topp">
              <div className="pub-tva-text">
                <p className="pub-kick">{PROVA.ey}</p>
                <h1 className="pub-h1">{PROVA.rubrik}</h1>
                <p className="pub-ingress" style={{ marginTop: 16 }}>
                  {PROVA.ingress(MALL_ANTAL, GRATIS_ANTAL)}
                </p>
              </div>
              <div className="w-full max-w-[520px] justify-self-center">
                <Uppladdning />
              </div>
            </div>
          </Rum>
          <Rum rum="cv" yta="mark" storlek="tat" id="valj-mall">
            <div className="pub-wrap">
              <ProvaArbetsyta />
            </div>
          </Rum>
        </div>
      </ProvaProvider>
    </PubliktSida>
  )
}
