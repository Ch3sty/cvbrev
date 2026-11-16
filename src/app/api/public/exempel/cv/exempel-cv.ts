/**
 * Exempel-CV:t och valen ur exempel-API:ts adress, delat av HTML:en
 * (route.ts) och helskärmens sidor (sidor/route.ts), så att båda visar samma CV.
 */
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'
import { SHOWCASE_CV } from '@/lib/cv/showcase-exempel'
import { losMallId } from '@/lib/cv/mallar/alias'
import { FORVALD_MALL_ID } from '@/lib/cv/mallar/katalog'
import { tolkaValUrQuery } from '@/lib/cv/mallar/val'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { uppsattningForTitel } from '@/lib/cv/rubriker'
import { YRKESMALL_LIST } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { buildYrkesmallExempelCV } from '@/app/(public)/cv-mallar/[yrke]/YrkesmallExempelData'

export type ExempelUtfall = { ok: true; mall: string; val: MallVal; cv: CVMetadata } | { ok: false; status: number; text: string }

export function exempelUrAdress(params: URLSearchParams): ExempelUtfall {
  const mall = losMallId(params.get('mall') ?? FORVALD_MALL_ID)
  if (!mall) return { ok: false, status: 404, text: 'Okänd mall' }

  const val = tolkaValUrQuery(params)
  const slug = params.get('yrke')
  let exempel = SHOWCASE_CV as Parameters<typeof convertToCVMetadata>[0]
  if (slug) {
    const yrke = YRKESMALL_LIST.find((y) => y.slug === slug)
    if (!yrke) return { ok: false, status: 404, text: 'Okänt yrke' }
    exempel = buildYrkesmallExempelCV(yrke.namn, yrke.kompetenser)
    if (!val.uppsattning && !val.rubriker) val.uppsattning = uppsattningForTitel(yrke.namn)
  }
  return { ok: true, mall, val, cv: convertToCVMetadata(exempel) }
}
