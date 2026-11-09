// src/lib/talserierV1/layout.ts
// =============================================================================
// Måtten för talseriens rad (briefen avsnitt 3 "Mäts", skissens beslut 6).
// Ren fil, får importeras från klienten. Enhetstestet mäter att åtta rutor
// med fyra tecken ryms på 328 px (360 minus två marginaler om 16).
// =============================================================================

export const TALRAD = {
  /** Tillgänglig bredd på en 360-mobil. */
  bredd360: 328,
  /** Tabulära siffror: 15 px på 360, 17 px på Pixel 7 och dator. */
  siffraPx360: 15,
  siffraPx412: 17,
  /** Ungefärlig bredd på en tabulär siffra eller ett minustecken, i em. */
  teckenEm: 0.6,
  /** Inre luft i rutan, per sida. */
  inreLuft: 1,
  /** Luft mellan rutorna. */
  luft: 3,
  /** Rutans bredd på 360 (briefen: högst 38 px). */
  ruta360: 38,
  maxRutor: 8,
  maxTecken: 4,
} as const;

/** Rutans minsta bredd för ett tal med n tecken på 360. */
export const rutbreddFor = (tecken: number, px: number = TALRAD.siffraPx360) => tecken * TALRAD.teckenEm * px + 2 * TALRAD.inreLuft;

/** Talet som det visas: riktigt minustecken (U+2212), inga tusentalsavgränsare. */
export const visaTal = (x: number) => (x < 0 ? `−${-x}` : String(x));
