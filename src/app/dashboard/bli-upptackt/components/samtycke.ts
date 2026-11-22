// Samtyckets version och frågan om sökbara styrkor (ägarbeslut 2026-11-22).
// Delas av servern (getPageData) och klienten (BliUpptacktClient).

/**
 * Samtyckets version. v1 gavs före 2026-11-22, då raden om styrkor bara sa
 * "visa". v2 är raden som också säger att rekryterare kan söka på dem.
 * Sparas i candidate_profiles.consent_version tillsammans med
 * consent_given_at.
 */
export const SAMTYCKE_VERSION = 'v2';

/**
 * Svaret på frågan till dem som visade styrkor med samtycke v1. Raden i
 * user_ui_preferences: value = { svar: 'fortsatt' | 'sluta', svarat_at: ISO,
 * fraga: '2026-11-22', kalla: 'rutan' | 'kortet' }. 'kortet' betyder att
 * kandidaten slog på styrkorna i kortet med den nya texten, och då ställs
 * frågan inte. Finns raden visas rutan aldrig igen.
 */
export const STYRKOR_FRAGA_KEY = 'bli_upptackt_styrkor_sokbara';
export const STYRKOR_FRAGA_DATUM = '2026-11-22';

export type StyrkorSvar = 'fortsatt' | 'sluta';
