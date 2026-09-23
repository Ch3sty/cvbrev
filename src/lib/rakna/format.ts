/**
 * Talformat för kalkylatorerna, delningstexterna och OG-bilderna. Samma
 * format överallt så att talet i bilden är exakt talet på sidan.
 */

const heltal = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 })

/** 26912 -> "26 912" med hårt mellanslag, som Intl skriver det. */
export function tal(n: number): string {
  return heltal.format(n)
}

/** 26912 -> "26 912 kr". */
export function kr(n: number): string {
  return `${heltal.format(n)} kr`
}

/** Med tecken: 2100 -> "+2 100 kr", -300 -> "-300 kr". */
export function krTecken(n: number): string {
  return `${n >= 0 ? '+' : ''}${heltal.format(n)} kr`
}

/** 0.2311 -> "23,1" (en decimal, kommatecken). */
export function decimal(n: number, decimaler = 1): string {
  return n.toFixed(decimaler).replace('.', ',')
}

/** Byter Intl:s hårda mellanslag mot vanliga, för text som ska klistras in. */
export function vanligaMellanslag(s: string): string {
  return s.replace(/[  ]/g, ' ')
}
