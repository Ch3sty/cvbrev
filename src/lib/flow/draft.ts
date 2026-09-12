/**
 * Utkastlagring för flerstegsflöden
 * (docs/plan-inloggat-omdesign.md, avsnitt 6).
 *
 * Utan det här tappar skapa-brev, skapa-cv, cv-analys och linkedin allt vid
 * minsta avbrott, eftersom hela flödet bara ligger i useState. Ett inkommande
 * samtal räckte. På mobil är det inte ett kantfall utan vardagen.
 *
 * Kollisionsregeln är lika viktig som sparandet: skriver ett nytt flöde tyst
 * över ett halvfärdigt har vi bytt ett tappat flöde mot ett raderat flöde.
 * Därför bär nyckeln en version, utkastet en tidsstämpel, och användaren får
 * välja mellan Fortsätt och Börja om vid återkomst.
 */

/** Utkast äldre än så här kastas vid läsning. */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export interface FlowDraft<T> {
  /** Schemaversion. Höjs när stegdatan ändrar form, gamla utkast kastas då. */
  version: number
  /** Sparad millisekundstämpel, styr sjudagarsrensningen. */
  savedAt: number
  /** Steget användaren stod på. */
  step: number
  data: T
}

const PREFIX = 'flow:'

function keyFor(name: string, version: number): string {
  return `${PREFIX}${name}:v${version}`
}

/** Sant när localStorage finns och är skrivbar (privat läge kan kasta). */
function storageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const probe = `${PREFIX}probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Sparar ett utkast. Anropas vid stegbyte och vid visibilitychange, aldrig
 * på varje tangenttryckning: det skulle skriva till disk i varje keystroke
 * och göra inmatningen hackig på svagare telefoner.
 */
export function saveDraft<T>(
  name: string,
  version: number,
  step: number,
  data: T
): void {
  if (!storageAvailable()) return
  try {
    const draft: FlowDraft<T> = { version, savedAt: Date.now(), step, data }
    window.localStorage.setItem(keyFor(name, version), JSON.stringify(draft))
  } catch {
    // Full kvot eller privat läge. Flödet fungerar ändå, det tål bara inte
    // ett avbrott, vilket är exakt läget vi hade före den här filen.
  }
}

/**
 * Läser ett utkast. Returnerar null när inget finns, när det är för gammalt
 * eller när formen inte stämmer. Gamla och trasiga utkast städas samtidigt,
 * så en användare aldrig fastnar på ett utkast som inte går att läsa.
 */
export function loadDraft<T>(name: string, version: number): FlowDraft<T> | null {
  if (!storageAvailable()) return null
  const key = keyFor(name, version)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<FlowDraft<T>>
    const validShape =
      parsed &&
      typeof parsed.savedAt === 'number' &&
      typeof parsed.step === 'number' &&
      parsed.version === version &&
      parsed.data !== undefined

    if (!validShape) {
      window.localStorage.removeItem(key)
      return null
    }
    if (Date.now() - (parsed.savedAt as number) > DRAFT_MAX_AGE_MS) {
      window.localStorage.removeItem(key)
      return null
    }

    return parsed as FlowDraft<T>
  } catch {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Går inte att städa heller. Utkastet ignoreras ändå av kontrollen ovan.
    }
    return null
  }
}

/** Tar bort ett utkast. Anropas när flödet slutförts eller användaren valt Börja om. */
export function clearDraft(name: string, version: number): void {
  if (!storageAvailable()) return
  try {
    window.localStorage.removeItem(keyFor(name, version))
  } catch {
    // Utan städning löser sjudagarsregeln det i stället.
  }
}

/**
 * Rensar utkast som passerat sin livslängd, oavsett flöde och version.
 * Körs när ett flöde monteras så att gamla versioner inte ligger kvar och
 * äter kvot i all evighet.
 */
export function purgeExpiredDrafts(now: number = Date.now()): void {
  if (!storageAvailable()) return
  try {
    const doomed: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key || !key.startsWith(PREFIX)) continue
      try {
        const raw = window.localStorage.getItem(key)
        if (!raw) continue
        const parsed = JSON.parse(raw) as Partial<FlowDraft<unknown>>
        if (
          typeof parsed?.savedAt !== 'number' ||
          now - parsed.savedAt > DRAFT_MAX_AGE_MS
        ) {
          doomed.push(key)
        }
      } catch {
        doomed.push(key)
      }
    }
    doomed.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Rensningen är en hygienåtgärd, inte en förutsättning.
  }
}

/** Kort svensk beskrivning av hur gammalt ett utkast är, för återkomstvalet. */
export function describeAge(savedAt: number, now: number = Date.now()): string {
  const minutes = Math.floor((now - savedAt) / 60000)
  if (minutes < 1) return 'nyss'
  if (minutes < 60) return `${minutes} minuter sedan`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? 'en timme sedan' : `${hours} timmar sedan`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'i går' : `${days} dagar sedan`
}
