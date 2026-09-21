/**
 * "Senaste dagen med data", per mätvärde.
 *
 * Bakgrunden: knappen "Hämta nu" kunde skriva en rad för i dag där varje tal
 * var null, därför att delstegen inte hann klart. Sidorna tog rad noll ur
 * fallande dagsordning och visade streck på MRR, ARR och aktiva
 * prenumerationer, trots att gårdagens rad låg kvar med riktiga siffror.
 *
 * Rätt fråga är alltså inte "vilken rad är nyast" utan "vilken rad har det
 * tal jag ska visa". Stripe-korten frågar efter mrr_ore, GSC-korten efter
 * gsc_clicks, och en tom rad hoppas över i stället för att ta över sidan.
 *
 * Raderna kommer alltid i fallande dagsordning från hamtaDagligaMetrik, men
 * funktionerna sorterar inte om och antar inget: de letar första raden som
 * bär värdet, i den ordning de fått raderna.
 */

/** Minsta krav på en rad: den har en dag. */
export interface MedDag {
  dag: string;
}

/** Sant när kolumnen faktiskt bär ett tal på raden. */
export function harVarde(rad: MedDag | undefined | null, kolumn: string): boolean {
  if (!rad) return false;
  const v = (rad as unknown as Record<string, unknown>)[kolumn];
  if (v === null || v === undefined) return false;
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * Första raden i listan där kolumnen inte är null.
 *
 * Listan förutsätts fallande, senaste först. Null när ingen rad bär värdet.
 */
export function senasteMedVarde<T extends MedDag>(
  rader: readonly T[],
  kolumn: string
): T | null {
  for (const rad of rader) {
    if (harVarde(rad, kolumn)) return rad;
  }
  return null;
}

/** Bara dagen, för rubriker av typen "senaste dagen med data är 20 sep." */
export function senasteDagMedVarde(
  rader: readonly MedDag[],
  kolumn: string
): string | null {
  return senasteMedVarde(rader, kolumn)?.dag ?? null;
}

/** Kolumnerna som kommer ur Stripe-delsteget. mrr_ore är ledaren. */
export const STRIPE_LEDARE = 'mrr_ore';

/** Kolumnen som avgör om GSC-delsteget gav något den dagen. */
export const GSC_LEDARE = 'gsc_clicks';

/** Kolumnen som avgör om Supabase-delsteget kördes. */
export const SUPABASE_LEDARE = 'new_accounts';

/**
 * Sant när raden är helt tom, alltså när insamlingen skrev en rad utan att
 * något delsteg lyckades. En sådan rad ska aldrig räknas som senaste dagen
 * med data, och collectAdminMetrics ska aldrig skriva den.
 */
export function radArTom(rad: Record<string, unknown>): boolean {
  for (const [nyckel, varde] of Object.entries(rad)) {
    if (nyckel === 'dag' || nyckel === 'uppdaterad') continue;
    if (varde !== null && varde !== undefined) return false;
  }
  return true;
}
