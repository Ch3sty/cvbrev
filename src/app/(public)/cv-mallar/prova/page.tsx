/**
 * /cv-mallar/prova (plan-mallar 3.2 och 5): provsidan. Tar namn, titel,
 * mall, typsnitt och rubriker ur adressen (artikelns "Fortsätt med ditt
 * CV", galleriets miniatyrer, den gamla /cv-mallar/start som 308:ar hit),
 * uppladdningen utan konto och dokumentet. Noindex, follow; robots.ts
 * stänger den också. Efter Google kommer hon tillbaka hit med ?hamta=1 och
 * utkastet hämtas hem.
 *
 * Publikt omgång 3: grundens skal i CV:ts färg, uppladdningen på väggen och
 * arbetsytan i det lyfta kortet. Texten och funktionen som förut.
 */
import type { Metadata } from 'next'
import { Sida, Hjalte, Lyft } from '@/components/publikt/v3'
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
    <Sida farg="cv">
      <ProvaProvider katalog={MALL_KATALOG} surface="prova" pris={prisInfo()} lasAdress>
        <div id="innehall">
          <Hjalte
            etikett={PROVA.ey}
            h1={PROVA.rubrik}
            h1Mindre
            varde={PROVA.ingress(MALL_ANTAL, GRATIS_ANTAL)}
            bild={
              <div style={{ width: '100%', maxWidth: 520, marginInline: 'auto' }}>
                <Uppladdning />
              </div>
            }
            lyft
          />
          <Lyft id="valj-mall">
            <ProvaArbetsyta />
          </Lyft>
        </div>
      </ProvaProvider>
    </Sida>
  )
}
