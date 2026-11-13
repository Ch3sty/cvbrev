// src/lib/mobilapp/notis.ts
// Påminnelsen om dagens pass (docs/plan-app.md, avsnitt 2.7, och konceptets
// notisfråga). En notis om dagen vid vald tid, svensk tid. Tiden sparas i
// app_enheter.paminnelse_tid; utskicket görs av edge-funktionen
// supabase/functions/app-paminnelse, som pg_cron anropar varje kvart.

/** Konceptets tre tider. Alla ligger på en kvart, som utskicket körs på. */
export const PAMINNELSE_TIDER = ['07:30', '12:00', '18:30'] as const;
export const PAMINNELSE_STANDARD = '18:30';

/** "HH:MM" på en hel kvart, annars null. Godtar "HH:MM:SS" ur databasen. */
export function rensaTid(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)(?::00)?$/.exec(v.trim());
  if (!m) return null;
  if (Number(m[2]) % 15 !== 0) return null;
  return `${m[1]}:${m[2]}`;
}

export type EnhetKropp = {
  token?: string;
  plattform?: 'android' | 'ios';
  paminnelse_tid?: string;
  aktiv?: boolean;
};

/** Kroppen till POST/PATCH /api/app/enheter. Okända fält tas bort. */
export function validerEnhet(v: unknown, kravToken: boolean): { ok: true; data: EnhetKropp } | { ok: false; fel: string } {
  if (!v || typeof v !== 'object') return { ok: false, fel: 'ogiltig_kropp' };
  const r = v as Record<string, unknown>;
  const data: EnhetKropp = {};
  if (r.token !== undefined) {
    if (typeof r.token !== 'string' || r.token.length < 20 || r.token.length > 4096) return { ok: false, fel: 'ogiltig_token' };
    data.token = r.token;
  } else if (kravToken) return { ok: false, fel: 'token_saknas' };
  if (r.plattform !== undefined) {
    if (r.plattform !== 'android' && r.plattform !== 'ios') return { ok: false, fel: 'ogiltig_plattform' };
    data.plattform = r.plattform;
  }
  if (r.paminnelse_tid !== undefined) {
    const t = rensaTid(r.paminnelse_tid);
    if (!t) return { ok: false, fel: 'ogiltig_tid' };
    data.paminnelse_tid = t;
  }
  if (r.aktiv !== undefined) {
    if (typeof r.aktiv !== 'boolean') return { ok: false, fel: 'ogiltig_aktiv' };
    data.aktiv = r.aktiv;
  }
  if (!kravToken && Object.keys(data).length === 0) return { ok: false, fel: 'inget_att_andra' };
  return { ok: true, data };
}

/** Texten i notisen (uppdraget och konceptet). */
export const NOTIS_TEXT = { titel: 'Dags för dagens pass i Testklar', text: 'Ditt pass för i dag väntar.' };
