/**
 * Mätningen av dokumentet i iframen: sidor, rubrikernas och avsnittens läge.
 *
 * Lägena räknas i "bredder" (andel av dokumentets bredd), så att de inte
 * beror på om webbläsaren redovisar zoomen i iframen eller inte: både
 * dokumentets och rubrikens ruta mäts i samma koordinater och delas med
 * dokumentets bredd. Positionen i pixlar är bredden på arket gånger talet.
 */
import type { Sektion } from '@/lib/cv/mallar/kontrakt'
import { arSektion, sektionForRubrik } from '@/lib/cv/mallval/sektioner'

/** A4 i höjd per bredd (1123 / 794). */
export const A4_KVOT = 1123 / 794

export interface Rubrikruta {
  sektion: Sektion
  text: string
  /** Rubrikens ruta. */
  x: number
  y: number
  b: number
  h: number
  /** Avsnittet under rubriken, till nästa rubrik i samma spalt. */
  avsnitt: { x: number; y: number; b: number; h: number }
}

/** Huvudets fält (namn, titel, kontaktraden), för redigering på arket. */
export type HuvudFalt = 'namn' | 'titel' | 'kontakt'

export interface Faltruta {
  falt: HuvudFalt
  x: number
  y: number
  b: number
  h: number
}

export interface Matning {
  sidor: number
  /** Dokumentets höjd i bredder. */
  hojd: number
  rubriker: Rubrikruta[]
  /** Namn, titel och kontaktrad (data-falt), de som syns. */
  falt: Faltruta[]
  /** Nederkanten på sista innehållet, i bredder (byggarens "+ Fler avsnitt"). */
  botten?: number
}

export function matDokument(doc: Document): Matning {
  const root = doc.documentElement
  const rr = root.getBoundingClientRect()
  const bredd = rr.width || 1
  let botten = 0
  for (const el of Array.from(doc.body?.querySelectorAll('*') ?? [])) {
    const r = (el as HTMLElement).getBoundingClientRect()
    if (r.height > 0 && r.bottom > botten) botten = r.bottom
  }
  const hojd = Math.max(A4_KVOT, (botten - rr.top) / bredd)
  const sidor = Math.max(1, Math.ceil(hojd / A4_KVOT - 0.015))

  // Mallsystemet märker avsnittsrubrikerna med data-sektion; finns märkningen
  // räknas bara den (annars blir jobbtitlar som "Projektledare" rubriker).
  // Äldre HTML utan märkning: bara h2.
  const markta = Array.from(doc.querySelectorAll<HTMLElement>('[data-sektion]'))
  const kandidater = markta.length ? markta : Array.from(doc.querySelectorAll<HTMLElement>('h2'))
  const rubriker: Omit<Rubrikruta, 'avsnitt'>[] = []
  const sedda = new Set<Element>()
  for (const el of kandidater) {
    if (sedda.has(el)) continue
    // [data-sektion] kan sitta på avsnittet; rubriken är då dess första rubrik.
    const attr = el.getAttribute('data-sektion')
    const rubrikEl = attr && !/^H[23]$/.test(el.tagName) ? el.querySelector<HTMLElement>('h2, h3') ?? el : el
    sedda.add(rubrikEl)
    const text = (rubrikEl.textContent ?? '').replace(/\s+/g, ' ').trim()
    const sektion = arSektion(attr) ? attr : sektionForRubrik(text)
    if (!sektion) continue
    const r = rubrikEl.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    rubriker.push({
      sektion,
      text,
      x: (r.left - rr.left) / bredd,
      y: (r.top - rr.top) / bredd,
      b: r.width / bredd,
      h: r.height / bredd,
    })
  }

  const med: Rubrikruta[] = rubriker.map((r, i) => {
    const nasta = rubriker.slice(i + 1).find((n) => Math.abs(n.x - r.x) < 0.06 && n.y > r.y)
    const slut = nasta ? nasta.y : (botten - rr.top) / bredd
    return {
      ...r,
      avsnitt: { x: r.x, y: r.y + r.h, b: Math.max(r.b, 0.2), h: Math.max(0.02, slut - r.y - r.h - 0.008) },
    }
  })

  // Huvudets fält: mallsystemet märker dem med data-falt. En tom titel är
  // dold (display: none) och har ingen ruta; den läggs till via namnet.
  const falt: Faltruta[] = []
  for (const f of ['namn', 'titel', 'kontakt'] as const) {
    const el = doc.querySelector<HTMLElement>(`[data-falt="${f}"]`)
    if (!el) continue
    // Textens egen ruta (inte blockets), så att linjen och pennan hamnar
    // vid texten också i centrerade huvuden.
    let r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    try {
      const omf = doc.createRange()
      omf.selectNodeContents(el)
      const t = omf.getBoundingClientRect()
      if (t.width > 0 && t.height > 0) r = t
    } catch {
      // Blockets ruta duger.
    }
    falt.push({ falt: f, x: (r.left - rr.left) / bredd, y: (r.top - rr.top) / bredd, b: r.width / bredd, h: r.height / bredd })
  }

  return { sidor, hojd, rubriker: med, falt, botten: (botten - rr.top) / bredd }
}

/** Texten i iframen gör sig själv lika bred som arket (samma knep som exempel-API:t). */
export const SKALA_OCH_LAS = `<style>html,body{overflow:hidden!important}</style><script>(function(){function s(){var z=window.innerWidth/794;document.documentElement.style.zoom=String(z)}s();window.addEventListener('resize',s)})()</script>`

export function medSkala(html: string): string {
  return html.includes('</body>') ? html.replace('</body>', `${SKALA_OCH_LAS}</body>`) : html + SKALA_OCH_LAS
}
