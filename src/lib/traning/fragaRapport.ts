// src/lib/traning/fragaRapport.ts
// =============================================================================
// Rapportknappen "Något ser fel ut" (tillägget om variation 3.2): orsakerna,
// texterna och kontrollen av det klienten skickar. Ren, så att rutten och
// komponenten delar samma regler.
// =============================================================================

export const RAPPORT_ORSAKER = ['ratt_svar_fel', 'gar_inte_att_lasa', 'annat'] as const;
export type RapportOrsak = (typeof RAPPORT_ORSAKER)[number];
// figurserie: omgång 2 (beställningen A2). Kräver migreringen
// 20261012130000_fraga_rapporter_figurserie.sql; före den sparas rapporten
// med test_kind matris (rutten), id:t fs-... skiljer dem åt.
// deduktiv: omgång 3 (B1). Kräver 20261012160000_deduktiv_test_kind.sql; före
// den sparas rapporten med test_kind matris, id:t dd-... skiljer dem åt.
export const RAPPORT_TEST_KIND = ['matris', 'verbal', 'numerisk', 'figurserie', 'deduktiv'] as const;
export type RapportTestKind = (typeof RAPPORT_TEST_KIND)[number];

/** Högst så många rapporter per konto och dag (svensk tid). */
export const RAPPORT_PER_DAG = 10;
export const RAPPORT_KOMMENTAR_MAX = 200;

export const RAPPORT_COPY = {
  lank: 'Något ser fel ut',
  rubrik: 'Vad ser fel ut?',
  orsak: {
    ratt_svar_fel: 'Rätt svar verkar fel',
    gar_inte_att_lasa: 'Går inte att läsa',
    annat: 'Annat',
  } satisfies Record<RapportOrsak, string>,
  kommentar: 'Berätta gärna mer (frivilligt)',
  skicka: 'Skicka',
  avbryt: 'Avbryt',
  kvitto: 'Tack, vi tittar på frågan.',
  fel: 'Det gick inte att skicka. Försök igen.',
} as const;

export interface FragaRapport {
  q_id: string;
  session_id: string | null;
  test_kind: RapportTestKind;
  bank_version: number | null;
  orsak: RapportOrsak;
  kommentar: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Kroppen som en rapport, eller null när något fält är fel. */
export function lasRapport(k: unknown): FragaRapport | null {
  if (!k || typeof k !== 'object') return null;
  const r = k as Record<string, unknown>;
  if (typeof r.q_id !== 'string' || !r.q_id.trim() || r.q_id.length > 120) return null;
  if (!RAPPORT_ORSAKER.includes(r.orsak as RapportOrsak)) return null;
  const testKind = (r.test_kind ?? 'matris') as RapportTestKind;
  if (!RAPPORT_TEST_KIND.includes(testKind)) return null;
  const session = typeof r.session_id === 'string' && UUID.test(r.session_id) ? r.session_id : null;
  const version = typeof r.bank_version === 'number' && Number.isInteger(r.bank_version) && r.bank_version >= 1 && r.bank_version <= 9 ? r.bank_version : null;
  const kommentar = typeof r.kommentar === 'string' && r.kommentar.trim() ? r.kommentar.trim().slice(0, RAPPORT_KOMMENTAR_MAX) : null;
  return { q_id: r.q_id.trim(), session_id: session, test_kind: testKind, bank_version: version, orsak: r.orsak as RapportOrsak, kommentar };
}
