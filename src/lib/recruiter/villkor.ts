// src/lib/recruiter/villkor.ts
//
// Villkor för rekryterare (ägarbeslut 2026-11-22). Sidan ligger på
// /for-rekryterare/villkor. Versionen sparas i recruiter_profiles.villkor_version
// tillsammans med tidpunkten i villkor_godkanda_at när rekryteraren kryssar
// i rutan, vid registreringen eller vid första besöket i portalen efteråt.
// Tidpunkten sätts alltid av servern (POST /api/recruiter/villkor).
//
// Delas av servern och klienten: inga serverimporter här.

/** Villkorens version. Läses av registreringen, portalens ruta och servern. */
export const VILLKOR_VERSION = '2026-11-22';

export const VILLKOR_HREF = '/for-rekryterare/villkor';

/**
 * Har rekryteraren godkänt villkoren? Ett godkännande av vilken version som
 * helst räcker (villkoren lovar ett mail före ändringar, inte ett nytt kryss).
 */
export function harGodkantVillkor(row: { villkor_godkanda_at?: string | null } | null | undefined): boolean {
  return Boolean(row?.villkor_godkanda_at);
}
