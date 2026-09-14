/**
 * Datalagret för Drift (docs/plan-admin.md avsnitt 4.7).
 *
 * Fråga 5: fungerar systemet? Sidan är den enda i adminen där färskhet går
 * före cache, så fönstret är fem minuter och inte femton.
 *
 * Ligger i sidans egen mapp, eftersom våg 1 äger src/lib/admin/ och våg 2
 * inte får röra den.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Fem minuter. Drift är undantaget från adminens 15-minuterscache. */
export const DRIFT_CACHE_SEKUNDER = 5 * 60;

/**
 * Ett hängande jobb är processing äldre än fem minuter.
 *
 * Planens tabell i avsnitt 4.7 säger tio minuter och uppdragstexten säger
 * fem. Fem gäller: en CV-analys som inte är klar på fem minuter är död, och
 * en gräns som larmar för tidigt är billigare än en som larmar för sent.
 */
export const HANGANDE_MINUTER = 5;

export interface Felrad {
  rutt: string;
  kalla: string;
  antal: number;
  senaste: string;
  meddelande: string;
}

export interface HangandeJobb {
  id: string;
  startad: string;
  minuter: number;
  namn: string | null;
}

export interface KostnadsRad {
  funktion: string;
  anrop: number;
  sek: number;
  senast: string | null;
}

export interface MejlKoRad {
  id: string;
  typ: string;
  forsok: number;
  fel: string | null;
  skickasEfter: string | null;
}

export interface DriftData {
  /** Fel per rutt senaste dygnet. */
  fel: Felrad[];
  felTotalt: number;
  hangande: HangandeJobb[];
  /** Antal misslyckade cv_analysis_jobs senaste dygnet. */
  misslyckadeJobb: number;
  kvottraffar: number;
  kvotSenast: string | null;
  betalvaggstraffar: number | null;
  betalvaggNot: string;
  tokenRevoked: number | null;
  tokenRevokedNot: string;
  aiKostnad: KostnadsRad[];
  aiKostnadTotalSek: number;
  aiKostnadNot: string;
  mejlKo: MejlKoRad[];
  cron: CronStatus;
  hamtad: string;
}

export interface CronStatus {
  /** Senaste gången insamlingen skrev en rad i admin_daily_metrics. */
  senasteInsamling: string | null;
  /** Senaste dagen som har en rad. */
  senasteDag: string | null;
  /** Timmar sedan insamlingen. Null när den aldrig körts. */
  timmarSedan: number | null;
}

function minuterSedan(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

/**
 * Hämtar Drift-sidans hela underlag.
 *
 * Varje delfråga fångar sitt eget fel och ger ett tomt svar i stället för
 * att fälla sidan. En driftsida som själv går sönder när något går sönder är
 * värdelös precis när den behövs.
 */
export const hamtaDriftData = unstable_cache(
  async (): Promise<DriftData> => {
    const admin = getSupabaseAdmin() as any;

    const dygn = new Date(Date.now() - 24 * 3600_000).toISOString();
    const hangGrans = new Date(
      Date.now() - HANGANDE_MINUTER * 60_000
    ).toISOString();

    const [
      felSvar,
      jobbSvar,
      misslyckadeSvar,
      kvotSvar,
      kostnadSvar,
      mejlSvar,
      cronSvar,
    ] = await Promise.all([
      sakert(() =>
        admin
          .from('admin_error_log')
          .select('kalla, rutt, meddelande, antal, created_at')
          .gte('created_at', dygn)
          .order('created_at', { ascending: false })
          .limit(500)
      ),
      sakert(() =>
        admin
          .from('cv_analysis_jobs')
          .select('id, created_at, updated_at, display_name')
          .eq('status', 'processing')
          .lt('created_at', hangGrans)
          .order('created_at', { ascending: true })
          .limit(50)
      ),
      sakert(() =>
        admin
          .from('cv_analysis_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'failed')
          .gte('created_at', dygn)
      ),
      sakert(() =>
        admin
          .from('user_activities')
          .select('created_at')
          .eq('activity_type', 'quota_wall_hit')
          .gte('created_at', dygn)
          .order('created_at', { ascending: false })
          .limit(500)
      ),
      sakert(() =>
        admin
          .from('ai_usage_costs')
          .select('feature_name, cost_sek, created_at')
          .gte('created_at', dygn)
          .limit(5000)
      ),
      sakert(() =>
        admin
          .from('email_schedule')
          .select('id, email_type, attempts, last_error, send_after')
          .gt('attempts', 0)
          .is('sent_at', null)
          .order('send_after', { ascending: false })
          .limit(25)
      ),
      sakert(() =>
        admin
          .from('admin_daily_metrics')
          .select('dag, uppdaterad')
          .order('dag', { ascending: false })
          .limit(1)
      ),
    ]);

    // Fel per rutt. Rader utan rutt samlas under "okänd rutt": våg 1:s
    // loggaAdminFel skriver alltid rutt null, så cronens egna fel hamnar där.
    const perRutt = new Map<string, Felrad>();
    let felTotalt = 0;
    for (const r of (felSvar?.data ?? []) as Array<{
      kalla: string;
      rutt: string | null;
      meddelande: string;
      antal: number | null;
      created_at: string;
    }>) {
      const nyckel = r.rutt ?? `${r.kalla} (okänd rutt)`;
      const antal = r.antal ?? 1;
      felTotalt += antal;
      const fanns = perRutt.get(nyckel);
      if (fanns) {
        fanns.antal += antal;
        if (r.created_at > fanns.senaste) {
          fanns.senaste = r.created_at;
          fanns.meddelande = r.meddelande;
        }
      } else {
        perRutt.set(nyckel, {
          rutt: nyckel,
          kalla: r.kalla,
          antal,
          senaste: r.created_at,
          meddelande: r.meddelande,
        });
      }
    }

    const hangande: HangandeJobb[] = (
      (jobbSvar?.data ?? []) as Array<{
        id: string;
        created_at: string;
        display_name: string | null;
      }>
    ).map((j) => ({
      id: j.id,
      startad: j.created_at,
      minuter: minuterSedan(j.created_at),
      namn: j.display_name,
    }));

    const kvotrader = (kvotSvar?.data ?? []) as Array<{ created_at: string }>;

    // AI-kostnad per funktion. ai_usage_costs skrivs skarpt: cv_analysis hade
    // 122 rader och 47,14 kr vid granskningen 2026-09-14.
    const perFunktion = new Map<string, KostnadsRad>();
    let totalSek = 0;
    for (const k of (kostnadSvar?.data ?? []) as Array<{
      feature_name: string | null;
      cost_sek: number | string | null;
      created_at: string;
    }>) {
      const namn = k.feature_name ?? 'okänd';
      const sek = Number(k.cost_sek) || 0;
      totalSek += sek;
      const fanns = perFunktion.get(namn);
      if (fanns) {
        fanns.anrop += 1;
        fanns.sek += sek;
        if (!fanns.senast || k.created_at > fanns.senast) {
          fanns.senast = k.created_at;
        }
      } else {
        perFunktion.set(namn, {
          funktion: namn,
          anrop: 1,
          sek,
          senast: k.created_at,
        });
      }
    }

    const cronRad = ((cronSvar?.data ?? []) as Array<{
      dag: string;
      uppdaterad: string;
    }>)[0];

    return {
      fel: Array.from(perRutt.values()).sort((a, b) => b.antal - a.antal),
      felTotalt,
      hangande,
      misslyckadeJobb: misslyckadeSvar?.count ?? 0,
      kvottraffar: kvotrader.length,
      kvotSenast: kvotrader[0]?.created_at ?? null,

      // Betalväggsträffar mäts i PostHog, och en HogQL-fråga per sidladdning
      // är förbjuden enligt planens avsnitt 8.
      //
      // paywall_shown hade noll rader vid granskningen 2026-09-14, vilket såg
      // ut som en trasig mätning. Det var det inte: händelsen gick live samma
      // dag (commit 6e4e1c85), så det fanns ingen historik att hitta. Klienten
      // är verifierad i produktion i våg 4, se noten nedan.
      betalvaggstraffar: null,
      betalvaggNot:
        'paywall_shown ligger i PostHog och läses inte per sidladdning. Händelsen gick live 2026-09-14 och har därför nästan ingen historik. Spårningen är verifierad i produktion: ett QA-konto gav match_page_viewed med rätt distinct_id inom en minut, så klienten, kön och EU-värden fungerar. Talet är lågt för att betalväggen är nyinstrumenterad, inte för att mätningen är trasig.',

      tokenRevoked: null,
      tokenRevokedNot:
        'Supabase auth-loggar är nåbara via logg-API:t, men exponerar bara action login: token_revoked finns inte som eget fält i strömmen och går inte att räkna. Egen loggning saknas också, ordet förekommer bara i kommentarer i supabase-klienterna. Mäts inte förrän middleware skriver en rad i admin_error_log med kalla auth.',

      aiKostnad: Array.from(perFunktion.values()).sort((a, b) => b.sek - a.sek),
      aiKostnadTotalSek: totalSek,
      aiKostnadNot:
        'Mäts i ai_usage_costs per funktion, anrop och kostnad i kronor. Gemini sedan 2026-06-12.',

      mejlKo: (
        (mejlSvar?.data ?? []) as Array<{
          id: string;
          email_type: string;
          attempts: number;
          last_error: string | null;
          send_after: string | null;
        }>
      ).map((m) => ({
        id: m.id,
        typ: m.email_type,
        forsok: m.attempts,
        fel: m.last_error,
        skickasEfter: m.send_after,
      })),

      cron: {
        senasteInsamling: cronRad?.uppdaterad ?? null,
        senasteDag: cronRad?.dag ?? null,
        timmarSedan: cronRad?.uppdaterad
          ? Math.floor(
              (Date.now() - new Date(cronRad.uppdaterad).getTime()) / 3600_000
            )
          : null,
      },

      hamtad: new Date().toISOString(),
    };
  },
  ['admin-drift'],
  { revalidate: DRIFT_CACHE_SEKUNDER, tags: ['admin-drift'] }
);

/**
 * Svaret en Supabase-fråga ger oss här. Klienten är otypad (as any), så
 * generisk inferens ger {} och varje .data-läsning blir ett typfel. Formen
 * skrivs därför ut en gång.
 */
interface Frageresultat {
  data?: unknown;
  count?: number | null;
  error?: unknown;
}

/** Kör en fråga och sväljer felet. Returnerar null i stället för att kasta. */
async function sakert(
  fn: () => PromiseLike<unknown>
): Promise<Frageresultat | null> {
  try {
    return (await fn()) as Frageresultat;
  } catch (err) {
    console.error('[admin/drift] fråga misslyckades:', err);
    return null;
  }
}
