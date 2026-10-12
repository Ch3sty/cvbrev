/**
 * Tal som ord i löptext ("tre träffar", "tio frågor"), för konstanter som
 * läses ur koden. Över tio skrivs siffran.
 */
const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
const TALORD_ETT = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']

export function talOrd(n: number, neutrum = false): string {
  return (neutrum ? TALORD_ETT : TALORD)[n] ?? String(n)
}

export function storForst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
