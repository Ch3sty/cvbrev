/**
 * Vilken källa de bästa träffarna läses ur: sammanfattningen
 * (job_matching_summaries, liten) eller hela körningen i job_matchings_cache
 * (upp till flera MB jsonb). Ren och utan databas, så att reglerna går att
 * pröva (rättningen efter slutkontrollen 2026-11-21).
 *
 * Två lägen:
 *   - 'liten': Översikt, Dina brev, Målgången och Skriv brev-rutten. Läser
 *     aldrig hela körningen. Finns en sammanfattning för CV:t används den,
 *     omräknad med dagens sökprofil, annars inget.
 *   - 'hel': Matchade jobb och annonsrutten. Får läsa hela körningen, men
 *     bara när ingen sammanfattning duger.
 */

/** Cachen sparas en timme (match-jobs): körningens tid är expires_at minus en timme. */
export const CACHE_TTL_MS = 60 * 60 * 1000
/** Marginal mellan körningens tid och sammanfattningens, för klockor och skrivtid. */
export const MARGINAL_MS = 5 * 60 * 1000
/**
 * En sammanfattning som är så här mycket nyare än körningen i cachen kommer
 * från en senare sökning vars körning inte sparades. Klienten skickar sin
 * sammanfattning sekunder efter att match-jobs sparat, så samma sökning
 * hamnar alltid under gränsen.
 */
export const NYARE_MS = 2 * 60 * 1000

export type Lage = 'liten' | 'hel'

export interface SammanfattningMeta {
  cv_id: string | null
  filter_hash: string
  prefs_nyckel: string
  korning_at: string
}

export interface KallaIndata {
  lage: Lage
  cvId: string
  /** prefsNyckel för dagens sökprofil och CV. */
  nyckel: string
  samm: SammanfattningMeta | null
  /** När körningen i cachen gjordes (ms), null när ingen rad finns. */
  korningTid: number | null
  /** Gick läsningen av körningens tid fel? Då vet vi inte om en körning finns. */
  metaFel?: boolean
}

export type KallaVal =
  /** Sammanfattningen. aktuell = räknad med samma sökprofil och inte äldre än körningen. */
  | { kalla: 'sammanfattning'; aktuell: boolean }
  /** Hela körningen måste läsas (bara i läget 'hel'). */
  | { kalla: 'korning' }
  /** Ingen körning och ingen sammanfattning för CV:t. */
  | { kalla: 'ingen' }
  /** Läsningen gick fel och det finns ingen sammanfattning att visa i stället. */
  | { kalla: 'lasfel' }

/** Finns en sammanfattning för just det här CV:t (och utan filter)? */
export function sammanfattningFor(samm: SammanfattningMeta | null, cvId: string): boolean {
  return !!samm && samm.cv_id === cvId && samm.filter_hash === '' && Number.isFinite(Date.parse(samm.korning_at))
}

/** Är sammanfattningen från en senare sökning än körningen i cachen (sparningen föll)? */
export function sammanfattningNyare(samm: SammanfattningMeta | null, cvId: string, korningTid: number | null): boolean {
  if (!sammanfattningFor(samm, cvId) || korningTid === null) return false
  return Date.parse(samm!.korning_at) > korningTid + NYARE_MS
}

export function valjKalla(x: KallaIndata): KallaVal {
  const forCv = sammanfattningFor(x.samm, x.cvId)
  const korning = x.metaFel ? null : x.korningTid
  const sammTid = forCv ? Date.parse(x.samm!.korning_at) : NaN
  const sammaProfil = forCv && x.samm!.prefs_nyckel === x.nyckel
  const inteAldre = korning === null || sammTid >= korning - MARGINAL_MS

  if (sammaProfil && inteAldre) return { kalla: 'sammanfattning', aktuell: true }

  // Översikt och de andra: aldrig hela körningen. Den sammanfattning som finns
  // gäller, omräknad med dagens sökprofil; annars samma tomma läge som förut.
  if (x.lage === 'liten') return forCv ? { kalla: 'sammanfattning', aktuell: false } : { kalla: 'ingen' }

  // Matchade jobb. Sammanfattningen är nyare än körningen: sökningen som
  // gjordes sist finns bara i den, och en ändrad sökprofil räknas om ur dess
  // annonser, inte ur den äldre körningen.
  if (sammanfattningNyare(x.samm, x.cvId, korning)) return { kalla: 'sammanfattning', aktuell: false }

  // Vi vet inte om en körning finns: visa sammanfattningen om den finns,
  // annars är det ett läsfel, inte "ingen körning".
  if (x.metaFel) return forCv ? { kalla: 'sammanfattning', aktuell: false } : { kalla: 'lasfel' }

  if (korning !== null) return { kalla: 'korning' }

  // Ingen körning i cachen (sparningen föll eller raden är rensad) men en
  // sammanfattning från klientens sökning: den gäller, omräknad.
  return forCv ? { kalla: 'sammanfattning', aktuell: false } : { kalla: 'ingen' }
}

/**
 * När läsningen av hela körningen gick fel (tidsgränsen): visa sammanfattningen
 * för CV:t även om den är räknad med en äldre sökprofil, hellre än ett tomt
 * läge. Finns ingen är det ett läsfel.
 */
export function valjVidLasfel(samm: SammanfattningMeta | null, cvId: string): KallaVal {
  return sammanfattningFor(samm, cvId) ? { kalla: 'sammanfattning', aktuell: false } : { kalla: 'lasfel' }
}

export type PoolVal = 'sammanfattning' | 'korning' | 'ingen'

/**
 * Poolen för klientens filter, "längre bort" och ändrad sökprofil: hela
 * körningen, utom när sammanfattningen är nyare (då är det den sökningen
 * listan visar) eller körningen inte går att läsa.
 */
export function valjPoolKalla(x: { samm: SammanfattningMeta | null; cvId: string; korningTid: number | null; metaFel?: boolean }): PoolVal {
  const forCv = sammanfattningFor(x.samm, x.cvId)
  if (x.metaFel || x.korningTid === null) return forCv ? 'sammanfattning' : 'ingen'
  if (sammanfattningNyare(x.samm, x.cvId, x.korningTid)) return 'sammanfattning'
  return 'korning'
}
