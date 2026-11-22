/**
 * Tal som ord i löptext ("tre träffar", "tio frågor"), för konstanter som
 * läses ur koden. Över tio skrivs siffran.
 */
const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
const TALORD_ETT = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']

export function talOrd(n: number, neutrum = false): string {
  return (neutrum ? TALORD_ETT : TALORD)[n] ?? String(n)
}

/** Tal som ord upp till tjugo ("tolv"), annars siffran. talOrd slutar vid tio. */
const TONARE: Record<number, string> = { 11: 'elva', 12: 'tolv', 13: 'tretton', 14: 'fjorton', 15: 'femton', 16: 'sexton', 17: 'sjutton', 18: 'arton', 19: 'nitton', 20: 'tjugo' }
export function talOrdTill20(n: number): string {
  return n <= 10 ? talOrd(n) : TONARE[n] ?? String(n)
}

export function storForst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
