/**
 * Datalagret for /admin/innehall (docs/plan-admin.md avsnitt 4.8).
 *
 * Fyra flikar, fyra frageuppsattningar. Tva regler haller genom hela filen:
 *
 * 1. **Aldrig dokumenttext.** Varken cv_texts.cv_text, letters.content eller
 *    letters.cv_text far lamna servern i en lista. Listan visar metadata:
 *    vem, nar, vilket foretag, hur lang texten ar. Dokumentet oppnas pa
 *    begaran, och den knappen finns inte i den har vagen.
 * 2. **Alltid serverpaginerat.** range() med ett fast sidsteg och count
 *    'exact', aldrig en full tabell som filtreras i webblasaren. 171 CV och
 *    242 brev ryms i minnet i dag, vilket ar precis den sortens siffra som
 *    goemmer buggen tills volymen vaxer.
 *
 * Allt lases med service role. Vyn admin_candidate_pool har revoke pa anon
 * och authenticated sedan vag 1, sa en anvandarklient far noll rader utan
 * felmeddelande.
 *
 * Undantagna konton (agarens adminkonto och testkontona) raknas aldrig.
 * Vyerna (admin_candidate_pool) utesluter dem redan; varje fraga som laser en
 * tabell direkt lagger uteslut() pa user_id. Alla user_id-kolumner som lases
 * har ar not null, sa ingen nullbar variant behovs.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SIMPLE_TEMPLATES, TEMPLATE_COUNT } from '@/lib/cv/simple-templates';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { uteslut } from '@/lib/admin/undantag';

/** Rader per sida i alla fyra flikarna. */
export const SIDSTORLEK = 25;

/** Flikarna, i ordningen de star i gransssnittet. */
export const FLIKAR = [
  { nyckel: 'cv', etikett: 'CV' },
  { nyckel: 'brev', etikett: 'Brev' },
  { nyckel: 'mallar', etikett: 'Mallar' },
  { nyckel: 'kandidater', etikett: 'Kandidatpool' },
  { nyckel: 'rekryterare', etikett: 'Rekryterare' },
] as const;

export type FlikNyckel = (typeof FLIKAR)[number]['nyckel'];

export function arFlik(varde: unknown): varde is FlikNyckel {
  return FLIKAR.some((f) => f.nyckel === varde);
}

/** Perioderna i antalsraden ovanfor varje lista. */
export const PERIODER = [
  { nyckel: '7', etikett: '7 dagar' },
  { nyckel: '30', etikett: '30 dagar' },
  { nyckel: '90', etikett: '90 dagar' },
] as const;

export interface Antal {
  totalt: number;
  period7: number;
  period30: number;
  period90: number;
}

function sedan(dagar: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dagar);
  return d.toISOString();
}

/** Kolumnen ar alltid created_at i de har tabellerna. */
async function antalPerPeriod(tabell: string): Promise<Antal> {
  const admin = getSupabaseAdmin() as any;
  const u = await hamtaUndantagCachad();

  const rakna = async (fran?: string): Promise<number> => {
    let q = uteslut(admin.from(tabell).select('id', { count: 'exact', head: true }), 'user_id', u);
    if (fran) q = q.gte('created_at', fran);
    const { count, error } = await q;
    if (error) {
      console.error(`[admin/innehall] kunde inte rakna ${tabell}:`, error);
      return 0;
    }
    return count ?? 0;
  };

  const [totalt, period7, period30, period90] = await Promise.all([
    rakna(),
    rakna(sedan(7)),
    rakna(sedan(30)),
    rakna(sedan(90)),
  ]);

  return { totalt, period7, period30, period90 };
}

// ---------------------------------------------------------------------------
// E-postuppslag
// ---------------------------------------------------------------------------

/**
 * E-post per user_id for en sidas rader. En fraga for hela sidan, inte en per
 * rad: 25 rader skulle annars bli 25 rundturer.
 */
async function epostFor(userIds: string[]): Promise<Map<string, string | null>> {
  const unika = Array.from(new Set(userIds.filter(Boolean)));
  if (!unika.length) return new Map();

  const admin = getSupabaseAdmin() as any;
  const { data, error } = await admin.from('profiles').select('id, email').in('id', unika);
  if (error) {
    console.error('[admin/innehall] kunde inte lasa e-post:', error);
    return new Map();
  }
  return new Map((data ?? []).map((p: { id: string; email: string | null }) => [p.id, p.email]));
}

// ---------------------------------------------------------------------------
// Flik: CV
// ---------------------------------------------------------------------------

export interface CvRad {
  id: string;
  epost: string | null;
  filnamn: string | null;
  tecken: number | null;
  strukturerat: boolean;
  extraheringMisslyckades: boolean;
  skapad: string;
}

export interface Sida<T> {
  rader: T[];
  totalt: number;
  sida: number;
  sidor: number;
}

function sidor(totalt: number): number {
  return Math.max(1, Math.ceil(totalt / SIDSTORLEK));
}

/**
 * CV-listan.
 *
 * `cv_text` valjs aldrig. Langden hade varit trevlig att visa, men den kraver
 * antingen att texten hamtas hit (och da ligger den i svaret) eller en
 * databasfunktion. Vi visar i stallet om texten gick att extrahera och om det
 * finns strukturerad data, vilket ar det som faktiskt sager nagot om raden.
 */
export async function hamtaCv(sida: number, sok: string): Promise<Sida<CvRad>> {
  const admin = getSupabaseAdmin() as any;
  const fran = (sida - 1) * SIDSTORLEK;

  const u = await hamtaUndantagCachad();

  let q = admin
    .from('cv_texts')
    .select('id, user_id, file_name, structured_data, text_extraction_failed, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(fran, fran + SIDSTORLEK - 1);

  q = uteslut(q, 'user_id', u);
  if (sok) q = q.ilike('file_name', `%${sok}%`);

  const { data, count, error } = await q;
  if (error) {
    console.error('[admin/innehall] cv_texts:', error);
    return { rader: [], totalt: 0, sida, sidor: 1 };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    file_name: string | null;
    structured_data: unknown;
    text_extraction_failed: boolean | null;
    created_at: string;
  }>;

  const epost = await epostFor(rows.map((r) => r.user_id));

  return {
    rader: rows.map((r) => ({
      id: r.id,
      epost: epost.get(r.user_id) ?? null,
      filnamn: r.file_name,
      tecken: null,
      strukturerat: r.structured_data != null,
      extraheringMisslyckades: r.text_extraction_failed === true,
      skapad: r.created_at,
    })),
    totalt: count ?? 0,
    sida,
    sidor: sidor(count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Flik: brev
// ---------------------------------------------------------------------------

export interface BrevRad {
  id: string;
  epost: string | null;
  foretag: string | null;
  tjanst: string | null;
  tonalitet: string | null;
  sprak: string | null;
  sparat: boolean;
  skapad: string;
}

/**
 * Brevlistan.
 *
 * `content`, `cv_text` och `job_description` valjs aldrig. Foretag och tjanst
 * ar metadata som anvandaren sjalv fyllt i formularfalt och ar det enda som
 * behovs for att hitta ratt rad.
 */
export async function hamtaBrev(sida: number, sok: string): Promise<Sida<BrevRad>> {
  const admin = getSupabaseAdmin() as any;
  const fran = (sida - 1) * SIDSTORLEK;

  const u = await hamtaUndantagCachad();

  let q = admin
    .from('letters')
    .select('id, user_id, company, job_title, tonality, language, is_saved, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(fran, fran + SIDSTORLEK - 1);

  q = uteslut(q, 'user_id', u);
  if (sok) q = q.or(`company.ilike.%${sok}%,job_title.ilike.%${sok}%`);

  const { data, count, error } = await q;
  if (error) {
    console.error('[admin/innehall] letters:', error);
    return { rader: [], totalt: 0, sida, sidor: 1 };
  }

  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    company: string | null;
    job_title: string | null;
    tonality: string | null;
    language: string | null;
    is_saved: boolean | null;
    created_at: string;
  }>;

  const epost = await epostFor(rows.map((r) => r.user_id));

  return {
    rader: rows.map((r) => ({
      id: r.id,
      epost: epost.get(r.user_id) ?? null,
      foretag: r.company,
      tjanst: r.job_title,
      tonalitet: r.tonality,
      sprak: r.language,
      sparat: r.is_saved === true,
      skapad: r.created_at,
    })),
    totalt: count ?? 0,
    sida,
    sidor: sidor(count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Flik: mallar
// ---------------------------------------------------------------------------

export interface MallRad {
  id: string;
  namn: string;
  kategori: string;
  niva: 'free' | 'premium';
  atsSaker: boolean;
  nedladdningar: number;
  brev: number;
}

export interface MallOversikt {
  rader: MallRad[];
  totalt: number;
  gratis: number;
  premium: number;
  nedladdningarTotalt: number;
  okandaMallar: string[];
}

/**
 * Mallanvandningen.
 *
 * Registret ar sanningen om vilka mallar som finns: TEMPLATE_COUNT i
 * src/lib/cv/simple-templates.ts. Anvandningen kommer ur
 * formatted_cv_downloads.template_id for CV och letters.template_id for brev.
 *
 * En mall som finns i registret men saknar nedladdningar far noll, inte en
 * saknad rad: "anvands inte" ar svaret pa fragan, inte franvaron av svar.
 * Ett template_id i tabellen som inte finns i registret listas separat som
 * okand mall, eftersom det betyder att en mall tagits bort under fotterna pa
 * historiken.
 */
export async function hamtaMallar(): Promise<MallOversikt> {
  const admin = getSupabaseAdmin() as any;

  const u = await hamtaUndantagCachad();

  const [ned, brev] = await Promise.all([
    uteslut(admin.from('formatted_cv_downloads').select('template_id'), 'user_id', u),
    uteslut(
      admin.from('letters').select('template_id').not('template_id', 'is', null),
      'user_id',
      u
    ),
  ]);

  if (ned.error) console.error('[admin/innehall] formatted_cv_downloads:', ned.error);
  if (brev.error) console.error('[admin/innehall] letters.template_id:', brev.error);

  const nedPer = new Map<string, number>();
  for (const r of (ned.data ?? []) as Array<{ template_id: string | null }>) {
    if (!r.template_id) continue;
    nedPer.set(r.template_id, (nedPer.get(r.template_id) ?? 0) + 1);
  }

  const brevPer = new Map<string, number>();
  for (const r of (brev.data ?? []) as Array<{ template_id: string | null }>) {
    if (!r.template_id) continue;
    brevPer.set(r.template_id, (brevPer.get(r.template_id) ?? 0) + 1);
  }

  const kanda = new Set(SIMPLE_TEMPLATES.map((t) => t.id));

  const rader: MallRad[] = SIMPLE_TEMPLATES.map((t) => ({
    id: t.id,
    namn: t.name,
    kategori: t.category,
    niva: t.tier,
    atsSaker: t.features?.atsSafe === true,
    nedladdningar: nedPer.get(t.id) ?? 0,
    brev: brevPer.get(t.id) ?? 0,
  })).sort((a, b) => b.nedladdningar + b.brev - (a.nedladdningar + a.brev));

  const okanda = Array.from(new Set([...nedPer.keys(), ...brevPer.keys()])).filter(
    (id) => !kanda.has(id)
  );

  return {
    rader,
    totalt: TEMPLATE_COUNT,
    gratis: SIMPLE_TEMPLATES.filter((t) => t.tier === 'free').length,
    premium: SIMPLE_TEMPLATES.filter((t) => t.tier === 'premium').length,
    nedladdningarTotalt: Array.from(nedPer.values()).reduce((a, b) => a + b, 0),
    okandaMallar: okanda,
  };
}

// ---------------------------------------------------------------------------
// Flik: kandidatpool
// ---------------------------------------------------------------------------

export interface KandidatRad {
  userId: string;
  epost: string | null;
  namn: string | null;
  synlighet: string | null;
  tillganglighet: string | null;
  regioner: string[];
  anstallningsformer: string[];
  korkort: boolean;
  intressenTotalt: number;
  intressenVantande: number;
  intressenAccepterade: number;
  senasteIntresse: string | null;
  samtycke: string | null;
  skapad: string | null;
}

/**
 * Kandidatpoolen ur vyn admin_candidate_pool.
 *
 * Lonespannet (salary_min, salary_max) lases medvetet inte hit. Enligt
 * projektbeslutet om "Bli upptackt" gar lonespann aldrig ut, och adminlistan
 * behover det inte for att svara pa hur poolen mar. Pitchen lases inte heller:
 * den ar kandidatens egen text och hor hemma i kandidatens vy, inte i en lista.
 */
export async function hamtaKandidater(sida: number, sok: string): Promise<Sida<KandidatRad>> {
  const admin = getSupabaseAdmin() as any;
  const fran = (sida - 1) * SIDSTORLEK;

  let q = admin
    .from('admin_candidate_pool')
    .select(
      'user_id, email, full_name, visibility, availability, regions, employment_types, drivers_license, intressen_totalt, intressen_vantande, intressen_accepterade, senaste_intresse, consent_given_at, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false, nullsFirst: false })
    .range(fran, fran + SIDSTORLEK - 1);

  if (sok) q = q.or(`email.ilike.%${sok}%,full_name.ilike.%${sok}%`);

  const { data, count, error } = await q;
  if (error) {
    console.error('[admin/innehall] admin_candidate_pool:', error);
    return { rader: [], totalt: 0, sida, sidor: 1 };
  }

  const rows = (data ?? []) as Array<Record<string, any>>;

  return {
    rader: rows.map((r) => ({
      userId: r.user_id,
      epost: r.email ?? null,
      namn: r.full_name ?? null,
      synlighet: r.visibility ?? null,
      tillganglighet: r.availability ?? null,
      regioner: Array.isArray(r.regions) ? r.regions : [],
      anstallningsformer: Array.isArray(r.employment_types) ? r.employment_types : [],
      korkort: r.drivers_license === true,
      intressenTotalt: Number(r.intressen_totalt ?? 0),
      intressenVantande: Number(r.intressen_vantande ?? 0),
      intressenAccepterade: Number(r.intressen_accepterade ?? 0),
      senasteIntresse: r.senaste_intresse ?? null,
      samtycke: r.consent_given_at ?? null,
      skapad: r.created_at ?? null,
    })),
    totalt: count ?? 0,
    sida,
    sidor: sidor(count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Flik: rekryterare
// ---------------------------------------------------------------------------

export interface RekryterareRad {
  userId: string;
  foretag: string | null;
  orgnummer: string | null;
  kontaktnamn: string | null;
  kontaktroll: string | null;
  kontaktEpost: string | null;
  epost: string | null;
  telefon: string | null;
  webbplats: string | null;
  roller: string | null;
  status: 'pending' | 'approved' | 'rejected';
  beslutat: string | null;
  skapad: string;
}

export interface RekryterareOversikt {
  rader: RekryterareRad[];
  vantande: number;
  godkanda: number;
  avslagna: number;
}

/**
 * Rekryterarna, vantande forst.
 *
 * Samma sortering och samma falt som den gamla recruiters-rutten, sa att
 * godkannandefloedet ser likadant ut. Listan ar liten (en rad i dag, och en
 * ansokan ar en manuell handelse) och pagineras darfor inte: hela poangen ar
 * att se alla vantande samtidigt.
 */
export async function hamtaRekryterare(): Promise<RekryterareOversikt> {
  const admin = getSupabaseAdmin() as any;

  const u = await hamtaUndantagCachad();

  const { data, error } = await uteslut(
    admin
      .from('recruiter_profiles')
      .select(
        'user_id, company_name, org_number, contact_name, contact_role, contact_email, phone, website, recruiting_roles, status, approved_at, created_at'
      )
      .order('created_at', { ascending: false }),
    'user_id',
    u
  );

  if (error) {
    console.error('[admin/innehall] recruiter_profiles:', error);
    return { rader: [], vantande: 0, godkanda: 0, avslagna: 0 };
  }

  const rows = (data ?? []) as Array<Record<string, any>>;
  const epost = await epostFor(rows.map((r) => r.user_id));

  const rader: RekryterareRad[] = rows
    .map((r) => ({
      userId: r.user_id,
      foretag: r.company_name ?? null,
      orgnummer: r.org_number ?? null,
      kontaktnamn: r.contact_name ?? null,
      kontaktroll: r.contact_role ?? null,
      kontaktEpost: r.contact_email ?? null,
      epost: epost.get(r.user_id) ?? null,
      telefon: r.phone ?? null,
      webbplats: r.website ?? null,
      roller: r.recruiting_roles ?? null,
      status: (r.status ?? 'pending') as RekryterareRad['status'],
      beslutat: r.approved_at ?? null,
      skapad: r.created_at,
    }))
    .sort((a, b) => {
      const av = a.status === 'pending' ? 0 : 1;
      const bv = b.status === 'pending' ? 0 : 1;
      if (av !== bv) return av - bv;
      return new Date(b.skapad).getTime() - new Date(a.skapad).getTime();
    });

  return {
    rader,
    vantande: rader.filter((r) => r.status === 'pending').length,
    godkanda: rader.filter((r) => r.status === 'approved').length,
    avslagna: rader.filter((r) => r.status === 'rejected').length,
  };
}

// ---------------------------------------------------------------------------
// Antalen per flik
// ---------------------------------------------------------------------------

export async function hamtaCvAntal(): Promise<Antal> {
  return antalPerPeriod('cv_texts');
}

export async function hamtaBrevAntal(): Promise<Antal> {
  return antalPerPeriod('letters');
}
