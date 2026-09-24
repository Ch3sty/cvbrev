/**
 * Personlighetsprovets tjugo påståenden (docs/design/rod-trad-prov-2026-09-24.html,
 * avsnittet "De tjugo påståendena", och docs/design/rod-trad-prov-spec-2026-09-24.md).
 *
 * Klientsäker. Här står bara texten och skalan, aldrig vilka påståenden som
 * är omvända: den kolumnen lämnar aldrig servern (smakprov-facit.ts) och är
 * en del av det som är låst före kontot.
 *
 * Idnumren ligger i block om fyra per faktor (s-01 till s-04, s-05 till
 * s-08 och så vidare). blandaOrdning använder blocken för regeln att två
 * påståenden ur samma block aldrig står intill varandra. Blocken säger
 * inget texten inte redan säger, och inget om omvändningen.
 */

export type SmakprovId =
  | 's-01' | 's-02' | 's-03' | 's-04' | 's-05'
  | 's-06' | 's-07' | 's-08' | 's-09' | 's-10'
  | 's-11' | 's-12' | 's-13' | 's-14' | 's-15'
  | 's-16' | 's-17' | 's-18' | 's-19' | 's-20'

export type SkalVarde = 1 | 2 | 3 | 4 | 5

export const SMAKPROV_PASTAENDEN: ReadonlyArray<{ id: SmakprovId; text: string }> = [
  { id: 's-01', text: 'Jag gör klart det jag lovat även när ingen följer upp.' },
  { id: 's-02', text: 'Jag börjar helst med det roligaste och tar det tråkiga sist.' },
  { id: 's-03', text: 'Mina listor och mappar är i ordning utan att jag anstränger mig.' },
  { id: 's-04', text: 'Jag tar ofta beslut i stunden i stället för att planera.' },
  { id: 's-05', text: 'Jag tar gärna ordet först på ett möte med nya människor.' },
  { id: 's-06', text: 'En hel dag med kundkontakt tar mer energi än den ger.' },
  { id: 's-07', text: 'Jag lär känna nya kollegor snabbt utan att tänka på det.' },
  { id: 's-08', text: 'Jag arbetar helst i ett rum för mig själv.' },
  { id: 's-09', text: 'Jag testar gärna ett nytt arbetssätt även när det gamla fungerar.' },
  { id: 's-10', text: 'Jag håller mig till det som är beprövat i stället för att experimentera.' },
  { id: 's-11', text: 'Jag läser på om saker som ligger utanför mitt eget område.' },
  { id: 's-12', text: 'Diskussioner om idéer utan tydligt mål tröttar ut mig.' },
  { id: 's-13', text: 'Jag ger hellre efter i en fråga än låter stämningen bli dålig.' },
  { id: 's-14', text: 'Jag säger vad jag tycker även om det sårar.' },
  { id: 's-15', text: 'Jag märker när en kollega har det tungt och frågar hur det är.' },
  { id: 's-16', text: 'Jag utgår från att folk har egna motiv tills de visat annat.' },
  { id: 's-17', text: 'Jag behåller lugnet när planen spricker i sista stund.' },
  { id: 's-18', text: 'Kritik på jobbet ligger kvar i mig flera dagar.' },
  { id: 's-19', text: 'Jag sover dåligt natten före en viktig presentation.' },
  { id: 's-20', text: 'Motgångar rinner av mig ganska fort.' },
]

export const ANTAL_PASTAENDEN = SMAKPROV_PASTAENDEN.length

/** Skalan, 1 till 5, med ordet som skärmläsaren och raden under spåret säger. */
export const SKALA: ReadonlyArray<{ value: SkalVarde; label: string }> = [
  { value: 1, label: 'Stämmer inte alls' },
  { value: 2, label: 'Stämmer dåligt' },
  { value: 3, label: 'Varken eller' },
  { value: 4, label: 'Stämmer ganska bra' },
  { value: 5, label: 'Stämmer helt' },
]

const ID_SET: ReadonlySet<string> = new Set(SMAKPROV_PASTAENDEN.map((p) => p.id))

export function arSmakprovId(v: unknown): v is SmakprovId {
  return typeof v === 'string' && ID_SET.has(v)
}

export function arSkalVarde(v: unknown): v is SkalVarde {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5
}

export function textFor(id: SmakprovId): string {
  return SMAKPROV_PASTAENDEN.find((p) => p.id === id)?.text ?? ''
}

export function skalOrd(v: SkalVarde): string {
  return SKALA[v - 1]?.label ?? ''
}

/** Blocket ett id hör till, 0 till 4. */
export function block(id: SmakprovId): number {
  return Math.floor((Number(id.slice(2)) - 1) / 4)
}

/* ------------------------------------------------------------ ordningen */

// FNV-1a och mulberry32, samma som selectQuestions.v7.ts.
function hashString(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Provets ordning för en token: seedad Fisher–Yates, sedan den första
 * ordningen (i den blandade prioriteten) där två påståenden ur samma block
 * aldrig står intill varandra. Samma token ger alltid samma ordning, så en
 * omladdning mitt i provet fortsätter där man var.
 */
export function blandaOrdning(token: string): SmakprovId[] {
  const blandad = SMAKPROV_PASTAENDEN.map((p) => p.id)
  const rng = mulberry32(hashString(token))
  for (let i = blandad.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[blandad[i], blandad[j]] = [blandad[j], blandad[i]]
  }

  const kvar = new Map<number, number>()
  for (const id of blandad) kvar.set(block(id), (kvar.get(block(id)) ?? 0) + 1)

  const ut: SmakprovId[] = []
  const anvand = new Set<SmakprovId>()

  // Djupet först i den blandade prioriteten. Beskärningen (inget block får
  // ha fler kvar än hälften, avrundat uppåt) gör att sökningen i praktiken
  // aldrig backar mer än ett par steg.
  function sok(forra: number): boolean {
    if (ut.length === blandad.length) return true
    const rest = blandad.length - ut.length
    for (const [, n] of kvar) if (n > Math.ceil(rest / 2)) return false
    for (const id of blandad) {
      if (anvand.has(id)) continue
      const b = block(id)
      if (b === forra) continue
      anvand.add(id)
      ut.push(id)
      kvar.set(b, kvar.get(b)! - 1)
      if (sok(b)) return true
      kvar.set(b, kvar.get(b)! + 1)
      ut.pop()
      anvand.delete(id)
    }
    return false
  }

  return sok(-1) ? ut : blandad
}
