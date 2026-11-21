/**
 * Märken för "Skriv om kortare" (F5). Användaren kan ha skrivit in sitt
 * telefonnummer, sin e-post, en länk eller sitt namn i utkastet. Till AI:n går
 * texten maskad (maskForModel), men varje uppgift får ett eget numrerat märke,
 * till exempel [TELEFON 1], så att den kan sättas tillbaka ordagrant i den
 * kortade texten.
 *
 * Regler:
 * - maskForModel är sista grinden: den märkta texten måste gå igenom den
 *   oförändrad, annars skickas ingenting.
 * - Går något inte att återställa entydigt (den hårdare andra omgången, en
 *   uppgift som inte går att avgränsa, hakparenteser som användaren själv har
 *   skrivit) blir svaret null och rutten svarar 502 med orört utkast.
 * - Utan uppgifter i texten blir det inga märken, och allt går som förut
 *   (valideraAiMejl).
 *
 * Ren och utan nätverk.
 */
import { PLACEHOLDERS, maskForModel, type MaskOptions } from '@/lib/privacy/pii'
import { raknaOrdITexten } from './datum'
import { tvattaText } from './uppfoljning'

export interface Mark {
  /** Märket som AI:n ser, till exempel "[TELEFON 1]". */
  mark: string
  /** Det användaren skrev, ordagrant. Går aldrig till AI:n. */
  varde: string
}

export interface MarktText {
  /** Styckena med märken i stället för uppgifterna (det som går till AI:n). */
  stycken: string[]
  /** Tom när texten saknar uppgifter. */
  marken: Mark[]
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const PLATSHALLARE: readonly string[] = Object.values(PLACEHOLDERS)
const PLATSHALLARE_RE = new RegExp(`(${PLATSHALLARE.map(escapeRegExp).join('|')})`)

/** "[TELEFON]" och 2 blir "[TELEFON 2]". */
const markFor = (platshallare: string, nr: number) => `${platshallare.slice(0, -1)} ${nr}]`

/**
 * Hittar vad varje platshållare i den maskade texten ersatte i originalet.
 * Null när det inte går att avgöra entydigt.
 */
function avgransa(original: string, maskad: string): Array<{ platshallare: string; varde: string }> | null {
  // split med fångande grupp: jämna index är löptext, udda är platshållare.
  const delar = maskad.split(PLATSHALLARE_RE)
  const monster = (grupp: string) =>
    new RegExp(`^${delar.map((d, i) => (i % 2 === 0 ? escapeRegExp(d) : grupp)).join('')}$`, 's')
  const snal = original.match(monster('(.+?)'))
  const girig = original.match(monster('(.+)'))
  if (!snal || !girig) return null
  const ut: Array<{ platshallare: string; varde: string }> = []
  for (let i = 1; i < snal.length; i++) {
    // Olika svar med snål och girig gruppering: avgränsningen är inte entydig.
    if (snal[i] !== girig[i]) return null
    ut.push({ platshallare: delar[2 * i - 1], varde: snal[i] })
  }
  return ut
}

/**
 * Maskar styckena och numrerar uppgifterna. Samma uppgift får samma märke
 * varje gång den förekommer; två olika telefonnummer blir [TELEFON 1] och
 * [TELEFON 2].
 */
export function maskaMedMarken(stycken: readonly string[], opts: MaskOptions): MarktText | null {
  const maskade = stycken.map((s) => ({ s, m: maskForModel(s, opts) }))
  if (maskade.some(({ m }) => m.usedSecondPass)) return null
  if (maskade.every(({ s, m }) => m.text === s)) return { stycken: [...stycken], marken: [] }
  // Egna hakparenteser i texten går inte att skilja från märkena.
  if (stycken.some((s) => /[[\]]/.test(s))) return null

  const marken: Mark[] = []
  const nyckel = new Map<string, string>()
  const perSlag = new Map<string, number>()
  const ut: string[] = []

  for (const { s, m } of maskade) {
    if (m.text === s) {
      ut.push(s)
      continue
    }
    const fynd = avgransa(s, m.text)
    if (!fynd) return null
    const delar = m.text.split(PLATSHALLARE_RE)
    let text = ''
    for (let i = 0; i < delar.length; i++) {
      if (i % 2 === 0) {
        text += delar[i]
        continue
      }
      const { platshallare, varde } = fynd[(i - 1) / 2]
      // Uppgiften ensam ska maskas till samma platshållare, annars är
      // avgränsningen fel (till exempel en punkt som hamnat i fel del).
      if (maskForModel(varde, opts).text !== platshallare) return null
      const k = `${platshallare}\u0000${varde}`
      let mark = nyckel.get(k)
      if (!mark) {
        const nr = (perSlag.get(platshallare) ?? 0) + 1
        perSlag.set(platshallare, nr)
        mark = markFor(platshallare, nr)
        nyckel.set(k, mark)
        marken.push({ mark, varde })
      }
      text += mark
    }
    ut.push(text)
  }

  // Sista grinden: den märkta texten ska gå igenom maskForModel oförändrad.
  for (const t of ut) {
    const kontroll = maskForModel(t, opts)
    if (kontroll.usedSecondPass || kontroll.text !== t) return null
  }
  return { stycken: ut, marken }
}

/**
 * Ämnesraden som går till AI:n tillsammans med märkta stycken. Den används
 * bara som sammanhang (utkastets egen ämnesrad står kvar), så uppgifter i den
 * tas bort i stället för att märkas: en omärkt [TELEFON] bredvid [TELEFON 1]
 * skulle annars kunna hamna i svaret och fälla det. Även detta går genom
 * maskForModel en gång till och måste komma ut oförändrat.
 */
export function amneMedMarken(amne: string, opts: MaskOptions): string {
  const m = maskForModel(amne, opts)
  const utan = m.text
    .split(new RegExp(PLATSHALLARE_RE.source, 'g'))
    .filter((_, i) => i % 2 === 0)
    .join(' ')
    .replace(/[[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const kontroll = maskForModel(utan, opts)
  return kontroll.usedSecondPass || kontroll.text !== utan ? '' : utan
}

/** Tvättar som tvattaText men låter hakparenteserna stå (märkena prövas efteråt). */
function tvattaMedMarken(s: string): string {
  return s
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/,\s*,/g, ',')
    .trim()
}

const FORBJUDET = /[[\]@]|https?:\/\/|\bwww\./i

/**
 * Validerar AI:ns kortade mejl när märken skickades, och sätter tillbaka
 * uppgifterna. Null när något märke saknas, när det finns andra
 * hakparenteser, @ eller länkar, eller när den återställda texten är för lång.
 * Ämnesraden prövas som i valideraAiMejl (den används inte, utkastets egen står kvar).
 */
export function valideraMejlMedMarken(
  raw: unknown,
  maxOrd: number,
  marken: readonly Mark[]
): { subject: string; stycken: string[] } | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as { amne?: unknown; stycken?: unknown }
  if (typeof r.amne !== 'string' || !Array.isArray(r.stycken)) return null
  const subject = tvattaText(r.amne).replace(/[.\s]+$/, '').slice(0, 200)
  if (!subject || FORBJUDET.test(subject)) return null
  const stycken = r.stycken
    .filter((s): s is string => typeof s === 'string')
    .map(tvattaMedMarken)
    .filter((s) => s.length > 0)
  if (stycken.length < 2 || stycken.length > 4) return null

  const helt = stycken.join('\n')
  if (marken.some(({ mark }) => !helt.includes(mark))) return null
  let utanMarken = helt
  for (const { mark } of marken) utanMarken = utanMarken.split(mark).join(' ')
  if (FORBJUDET.test(utanMarken)) return null

  const aterstallda = stycken.map((s) => aterstallMarken(s, marken))
  if (raknaOrdITexten(aterstallda.join(' ')) > maxOrd) return null
  return { subject, stycken: aterstallda }
}

/** Sätter tillbaka uppgifterna i stället för märkena. */
export function aterstallMarken(text: string, marken: readonly Mark[]): string {
  let ut = text
  for (const { mark, varde } of marken) ut = ut.split(mark).join(varde)
  return ut
}
