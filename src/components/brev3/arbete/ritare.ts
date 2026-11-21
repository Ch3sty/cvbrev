/**
 * Brevmallens renderare i klienten. Arket ritas på servern vid första
 * målningen; när texten ändras, ett typsnitt väljs eller brevet spelas upp
 * stycke för stycke ritas det om här med samma funktion (renderBrevHtml),
 * utan rundtur och utan AI. Modulen hämtas först när den behövs och laddas
 * i förväg när webbläsaren har tid över.
 */
import type { BrevData, BrevKrav } from '@/lib/letters/brevmall/typer'

type Ritmodul = typeof import('@/lib/letters/brevmall/render')

let lofte: Promise<Ritmodul> | null = null

export function laddaRitare(): Promise<Ritmodul> {
  if (!lofte) {
    lofte = import('@/lib/letters/brevmall/render').catch((e) => {
      lofte = null
      throw e
    })
  }
  return lofte
}

/** Ladda renderaren när webbläsaren har tid över (efter första målningen). */
export function forladdaRitare(): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  const kor = () => void laddaRitare().catch(() => {})
  if (w.requestIdleCallback) w.requestIdleCallback(kor, { timeout: 2500 })
  else setTimeout(kor, 600)
}

export interface RitVal {
  typsnitt?: string | null
  markeringar?: BrevKrav[]
  skriverTill?: number
  aktivtStycke?: number | null
}

export async function ritaBrev(mallId: string, data: BrevData, val: RitVal = {}): Promise<string> {
  const r = await laddaRitare()
  return r.renderBrevHtml(
    mallId,
    data,
    { typsnitt: val.typsnitt ?? null },
    { markeringar: val.markeringar, skriverTill: val.skriverTill, aktivtStycke: val.aktivtStycke ?? null }
  )
}
