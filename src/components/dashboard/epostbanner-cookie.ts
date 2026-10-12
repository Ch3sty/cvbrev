/**
 * Avfärdandet av e-postraden lever i en cookie, inte i localStorage, så att
 * servern vet det redan vid första målningen och aldrig skickar en rad som
 * ska vara stängd (beslut-banners-2026-10-12, avsnitt 1). Delas mellan
 * dashboard-layouten (läser) och raden själv (skriver).
 */
export const EPOSTBANNER_AVFARDAD_COOKIE = 'jc_email_banner_dismissed';

/** Ett dygn, som förut. */
export const EPOSTBANNER_AVFARDAD_SEKUNDER = 24 * 60 * 60;
