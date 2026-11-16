/**
 * Typsnitten inbäddade i mallens HTML inför PDF:en (server).
 *
 * Renderaren pekar på /fonts/cv/<fil>.woff2. I PDF-kedjan laddas HTML:en
 * med setContent (about:blank), där en relativ url inte når något, och
 * lambdan ska aldrig hämta typsnitt över nätet. Varje url byts därför mot
 * filens innehåll som data-url, läst från public/fonts/cv (som följer med i
 * serverless-paketet via outputFileTracingIncludes i next.config.ts).
 *
 * Latin-ext-filerna tas bara med när texten har sådana tecken, så att
 * HTML:en hålls liten.
 */
import fs from 'fs'
import path from 'path'
import { TYPSNITT_URL } from './typsnitt-filer'

const CACHE = new Map<string, string>()

function mapp(): string {
  return path.join(process.cwd(), 'public', 'fonts', 'cv')
}

function dataUrl(fil: string): string | null {
  const finns = CACHE.get(fil)
  if (finns) return finns
  try {
    const url = `data:font/woff2;base64,${fs.readFileSync(path.join(mapp(), fil)).toString('base64')}`
    CACHE.set(fil, url)
    return url
  } catch {
    return null
  }
}

/** Tecken utanför latin (U+0100 till U+024F, U+1E00 till U+1EFF) i dokumentets text. */
function harLatinExt(html: string): boolean {
  const text = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')
  return /[Ā-ɏḀ-ỿ]/.test(text)
}

/** HTML:en med typsnitten inbäddade. Okända filer lämnas som url. */
export function baddaInTypsnitt(html: string): string {
  if (!html.includes(TYPSNITT_URL)) return html
  const ext = harLatinExt(html)
  const re = new RegExp(`@font-face\\{[^}]*url\\(${TYPSNITT_URL.replace(/\//g, '\\/')}([^)]+)\\)[^}]*\\}`, 'g')
  return html.replace(re, (regel, fil: string) => {
    if (!ext && fil.includes('-latin-ext-')) return ''
    const data = dataUrl(fil)
    return data ? regel.replace(`${TYPSNITT_URL}${fil}`, data) : regel
  })
}
