// src/lib/letters/kravIAnnonsen.ts
//
// Kraven vi läser ut ur en annons, och vilka av dem ett brev nämner.
// Samma ordlista som brevflödets steg 2 visar som "Krav vi läst ut ur
// annonsen", så att brevvyns träffar (spec-rummen våg 4, B1) aldrig säger
// något annat än flödet sa. Ingen AI, ingen gissning: ett krav är träffat
// när ordet står i brevet. Klientsäker.

const KRAV_REGEX =
  /\b(React|TypeScript|JavaScript|Python|Java|C\+\+|SQL|AWS|Azure|Docker|Kubernetes|Git|Agile|Scrum|Node|Angular|Vue|AI|ML|DevOps|Backend|Frontend|Fullstack|UX|UI|Figma|REST|GraphQL|Linux|CI\/CD)\b/gi

/** Högst så många krav visas, som i flödet. */
export const KRAV_MAX = 8

/** Kraven i annonsen, i den form de först står, utan dubletter. */
export function kravIAnnonsen(annons: string | null | undefined): string[] {
  if (!annons || annons.length <= 50) return []
  const traffar = annons.match(KRAV_REGEX) ?? []
  const sett = new Set<string>()
  const ut: string[] = []
  for (const t of traffar) {
    const nyckel = t.toLowerCase()
    if (sett.has(nyckel)) continue
    sett.add(nyckel)
    ut.push(t)
    if (ut.length >= KRAV_MAX) break
  }
  return ut
}

function utanHtml(s: string): string {
  return s.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

/**
 * Svenska former som räknas som samma krav i brevet ("agila team" möter
 * kravet Agile). Bara där ordet faktiskt böjs eller skrivs isär på svenska.
 */
const SVENSKA_FORMER: Record<string, string[]> = {
  agile: ['agil', 'agila', 'agilt'],
  fullstack: ['full stack', 'full-stack'],
}

/** Vilka krav brevet nämner och vilka det inte nämner. */
export function kravTraffar(krav: string[], brev: string | null | undefined): { moter: string[]; saknas: string[] } {
  const text = utanHtml(brev ?? '')
  const moter: string[] = []
  const saknas: string[] = []
  for (const k of krav) {
    const former = [k, ...(SVENSKA_FORMER[k.toLowerCase()] ?? [])]
    const traff = former.some((ord) =>
      new RegExp(`(^|[^\\p{L}\\p{N}])${escape(ord)}(?=$|[^\\p{L}\\p{N}])`, 'iu').test(text)
    )
    ;(traff ? moter : saknas).push(k)
  }
  return { moter, saknas }
}

/** Minsta antal krav för att träffarna ska visas som instrument. */
export const KRAV_MIN_FOR_INSTRUMENT = 3
