/**
 * Rubrikuppsättningarna i "Rubriker efter yrke"-arket.
 *
 * TILLFÄLLIGT: rubrikmodellen (src/lib/cv/rubriker.ts, byggagent A) äger
 * UPPSATTNINGAR med namn och rubriker. Tills den finns visas listan här, med
 * samma id som uppsattningForTitel ger. Byts mot A:s lista när den landar.
 */
export interface UppsattningVal {
  id: string
  namn: string
}

export const UPPSATTNINGAR_TILLFALLIGA: readonly UppsattningVal[] = [
  { id: 'standard', namn: 'Standard' },
  { id: 'vard', namn: 'Vård och omsorg' },
  { id: 'skola', namn: 'Skola och förskola' },
  { id: 'it', namn: 'IT och teknik' },
  { id: 'hantverk', namn: 'Bygg och hantverk' },
  { id: 'handel', namn: 'Handel och försäljning' },
  { id: 'ekonomi', namn: 'Ekonomi och finans' },
  { id: 'offentlig', namn: 'Offentlig sektor' },
  { id: 'logistik', namn: 'Lager och transport' },
  { id: 'restaurang', namn: 'Restaurang och hotell' },
]
