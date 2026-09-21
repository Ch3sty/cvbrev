/**
 * Datalagret bakom Oversikt (docs/plan-admin.md avsnitt 4.1).
 *
 * Allt som star pa /admin kommer harifran, och harifran kommer ingenting som
 * inte redan ligger i en Supabase-tabell. Stripe, GSC och PostHog ror vi inte:
 * de samlas in av cronen och skrivs till admin_daily_metrics. Ett enda
 * Stripe-anrop i kritiska vagen gor LCP under 1,5 sekunder omojligt, och en
 * HogQL-fraga per sidladdning spranger PostHogs kvot.
 *
 * Tva avsiktliga val i hela filen:
 *
 * 1. Null ar inte noll. En dag utan GSC-svar har null i sina gsc-kolumner, och
 *    ett delta mot null ar inget delta alls, inte minus hundra procent. Alla
 *    jamforelser returnerar null nar nagon av sidorna saknas.
 * 2. Jamforelsen gors alltid mot bade i gar och samma dag forra veckan, vilket
 *    ar agarens tva fragor: "mer an i gar" och "mer an forra veckan". Samma dag
 *    forra veckan, inte medelvardet, sa att veckodagsmonstret inte forvirrar.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  hamtaDagligaMetrik,
  ADMIN_METRICS_TAG,
  ADMIN_CACHE_SEKUNDER,
} from '@/lib/admin/metrics';
import { dagStr, type DagligaMetrik } from '@/lib/admin/collect';
import {
  senasteDagMedVarde,
  STRIPE_LEDARE,
  GSC_LEDARE,
  SUPABASE_LEDARE,
} from '@/lib/admin/senasteMedData';

/** Talkolumnerna i admin_daily_metrics som Oversikt jamfor over tid. */
export type MetrikNyckel = Exclude<keyof DagligaMetrik, 'dag'>;

/**
 * Ett tal med sina tva jamforelser.
 *
 * varde ar null nar dagen saknar matningen, till exempel GSC-dagarna som
 * annu inte kommit fran Google. Da ar bada deltana ocksa null.
 */
export interface Tal {
  varde: number | null;
  /** Skillnad mot i gar i absoluta tal, null nar nagon av dagarna saknas. */
  motIgar: number | null;
  /** Skillnad mot samma veckodag forra veckan. */
  motForraVeckan: number | null;
}

/**
 * En sjudagarssumma med sin jamforelse mot de sju dagarna innan.
 *
 * Skilt fran Tal, som jamfor en enskild dag mot i gar och mot samma veckodag
 * forra veckan. Anvandningstalen ar for sma per dag for att en dagsjamforelse
 * ska saga nagot: en dag med tva brev och en med ett ar inte ett ras.
 */
export interface Veckotal {
  varde: number;
  /** varde minus samma summa for de sju dagarna dessforinnan. */
  delta: number;
}

export interface SeriePunkt {
  dag: string;
  /** MRR i kronor, avrundat. Null nar dagen saknar matning. */
  mrr: number | null;
  /** Nya betalande samma dag. */
  nyaBetalande: number | null;
}

export interface OversiktData {
  /** Dagen talen galler, YYYY-MM-DD i svensk tid. */
  dag: string;
  /** Senaste dag med GSC-siffror, eller null om ingen av de 30 har det. */
  senasteGscDag: string | null;
  /** Senaste dag med Stripe-siffror. Intäktskorten står på den dagen. */
  senasteStripeDag: string | null;

  /** Fraga 1: tjanar vi mer pengar? */
  intakter: {
    mrrOre: Tal;
    nyaBetalande: Tal;
    nyaBetalande7: number;
    aktivaPren: Tal;
    trialPren: Tal;
    misslyckade: Tal;
    churnade7: number;
  };

  /** Fraga 2: kommer folk in? */
  trafik: {
    gscKlick: Tal;
    gscVisningar: Tal;
    gscPosition: Tal;
    nyaKonton: Tal;
    nyaKonton7: number;
  };

  /** Fraga 3: vad gor de? */
  anvandning: {
    aktiva: Tal;
    aktiva7: number;
    handelser7: number;
    profiler: number;
    /**
     * De fyra anvandningstalen ur sanningskallorna, sjudagarssumma med delta
     * mot veckan innan. De ersatter aktiveringstalen, som byggde pa
     * first_cv_uploaded_at och first_letter_created_at och var satta pa tva
     * konton av trehundra.
     */
    cvUppladdade7: Veckotal;
    brevSkapade7: Veckotal;
    testerSlutforda7: Veckotal;
    mallarNedladdade7: Veckotal;
  };

  /** Fraga 4: fungerar mejlen? */
  mejl: {
    skickade7: number;
    oppnade7: number;
    /** Oppnandegrad i procent, null nar inget skickats. */
    oppnandegrad: number | null;
    skickadeForra7: number;
  };

  /** Fraga 5: fungerar systemet? */
  drift: {
    fel24: number;
    fel7: number;
    senasteFel: { kalla: string; meddelande: string; nar: string } | null;
    aiKostnad7: number | null;
    /** Timmar sedan admin_daily_metrics senast skrevs. Null om tabellen ar tom. */
    timmarSedanInsamling: number | null;
  };

  /** 30 dagar, aldst forst, for diagrammet. */
  serie: SeriePunkt[];
}

// ---------------------------------------------------------------------------
// Sma raknare
// ---------------------------------------------------------------------------

export function nummer(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

/** Skillnad mellan tva matningar. Saknas nagon av dem finns inget delta. */
export function delta(nu: number | null, da: number | null): number | null {
  if (nu === null || da === null) return null;
  return nu - da;
}

/**
 * Bygger ett Tal ur tre dagsrader.
 *
 * rader ar indexerad pa dag, sa att en lucka i tabellen ger undefined och
 * darmed null, i stallet for att rad nummer sju rakas vara nagot annat datum
 * an "for sju dagar sedan".
 */
export function tal(
  rader: Map<string, DagligaMetrik>,
  dag: string,
  igar: string,
  forraVeckan: string,
  nyckel: MetrikNyckel
): Tal {
  const varde = nummer(rader.get(dag)?.[nyckel]);
  return {
    varde,
    motIgar: delta(varde, nummer(rader.get(igar)?.[nyckel])),
    motForraVeckan: delta(varde, nummer(rader.get(forraVeckan)?.[nyckel])),
  };
}

/** Summerar en kolumn over ett antal dagar bakat, luckor hoppas over. */
export function summa(
  rader: DagligaMetrik[],
  nyckel: MetrikNyckel,
  antalDagar: number,
  hoppaOver = 0
): number {
  let s = 0;
  for (const rad of rader.slice(hoppaOver, hoppaOver + antalDagar)) {
    s += nummer(rad[nyckel]) ?? 0;
  }
  return s;
}

/**
 * Sjudagarssumman och dess delta mot veckan innan, ur en kolumn.
 *
 * Luckor raknas som noll i summan, vilket ar ratt har: de fyra
 * anvandningskolumnerna skrivs av samma delsteg som new_accounts, sa en lucka
 * betyder att dagen aldrig samlades in och inte att matningen fattas.
 */
export function veckotal(
  rader: DagligaMetrik[],
  nyckel: MetrikNyckel
): Veckotal {
  const nu = summa(rader, nyckel, 7);
  return { varde: nu, delta: nu - summa(rader, nyckel, 7, 7) };
}

/** Flyttar ett YYYY-MM-DD ett antal dagar bakat. */
export function dagBakat(dag: string, antal: number): string {
  const d = new Date(`${dag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - antal);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// De aggregat som inte ligger i admin_daily_metrics
// ---------------------------------------------------------------------------

interface Sidoaggregat {
  fel24: number;
  fel7: number;
  senasteFel: { kalla: string; meddelande: string; nar: string } | null;
  handelser7: number;
  aktiva7: number;
  profiler: number;
}

/**
 * Fyra sma raknefragor mot Supabase, cachade 15 minuter.
 *
 * De gar inte att lasa ur admin_daily_metrics: felen ar en egen tabell, och
 * aktiveringstalen ar ett bestand och inte en dagssiffra. Alla fyra ar
 * head-raekningar eller sma urval, alltsa inga radhamtningar som vaxer med
 * anvandarantalet.
 */
const hamtaSidoaggregat = unstable_cache(
  async (): Promise<Sidoaggregat> => {
    const admin = getSupabaseAdmin() as any;
    const dygn = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const vecka = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const tomt: Sidoaggregat = {
      fel24: 0,
      fel7: 0,
      senasteFel: null,
      handelser7: 0,
      aktiva7: 0,
      profiler: 0,
    };

    try {
      const [fel24Res, fel7Res, senasteRes, aktivitetRes, radRes] =
        await Promise.all([
          admin
            .from('admin_error_log')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', dygn),
          admin
            .from('admin_error_log')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', vecka),
          admin
            .from('admin_error_log')
            .select('kalla, meddelande, created_at')
            .order('created_at', { ascending: false })
            .limit(1),
          // user_id behovs for unika aktiva, sa den har hamtar rader. Sju dagar
          // ligger pa nagra tusen och ar en indexerad rangefraga.
          admin
            .from('user_activities')
            .select('user_id')
            .gte('created_at', vecka)
            .limit(20000),
          // Bara antalet konton behovs. Tidigare hamtade den har fragan en
          // rad per konto for att rakna aktiveringskolumnerna, som var satta
          // pa tva konton av trehundra. Talen kommer nu ur sanningskallorna
          // via admin_daily_metrics, sa det racker med en head-raekning.
          admin
            .from('admin_user_rows')
            .select('id', { count: 'exact', head: true }),
        ]);

      const unika = new Set<string>();
      for (const rad of (aktivitetRes.data ?? []) as Array<{
        user_id: string | null;
      }>) {
        if (rad.user_id) unika.add(rad.user_id);
      }

      const senaste = ((senasteRes.data ?? []) as Array<{
        kalla: string;
        meddelande: string;
        created_at: string;
      }>)[0];

      return {
        fel24: fel24Res.count ?? 0,
        fel7: fel7Res.count ?? 0,
        senasteFel: senaste
          ? {
              kalla: senaste.kalla,
              meddelande: senaste.meddelande,
              nar: senaste.created_at,
            }
          : null,
        handelser7: (aktivitetRes.data ?? []).length,
        aktiva7: unika.size,
        profiler: radRes.count ?? 0,
      };
    } catch (fel) {
      console.error('[admin/oversikt] sidoaggregaten gick inte att lasa:', fel);
      return tomt;
    }
  },
  ['admin-oversikt-sidoaggregat'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

// ---------------------------------------------------------------------------
// Sammanstallningen
// ---------------------------------------------------------------------------

/**
 * Allt Oversikt behover, i ett anrop.
 *
 * Lasningen ar tva cachade anrop som gar parallellt: dagsraderna och
 * sidoaggregaten. Bada har samma cachetagg, sa knappen "Hamta nu" pa Intakter
 * rensar bada.
 */
export async function hamtaOversikt(): Promise<OversiktData> {
  const [rader, sido] = await Promise.all([
    hamtaDagligaMetrik(30),
    hamtaSidoaggregat(),
  ]);

  const index = new Map<string, DagligaMetrik>();
  for (const rad of rader) index.set(String(rad.dag), rad);

  // Dagen vi visar ar senaste raden med data, inte senaste raden i tabellen
  // och inte dagens datum.
  //
  // Skillnaden ar inte akademisk. "Hamta nu" kunde skriva en rad for i dag
  // dar varje tal var null, darfor att delstegen inte hann klart, och da tog
  // den raden over sidan och alla kort visade streck fast garsdagens siffror
  // lag kvar. Sidans ram utgar darfor fran senaste raden som bar Supabase-
  // talen, och varje kortgrupp valjer i sin tur den senaste dag dar just dess
  // kalla svarade: Stripe-korten mrr_ore, GSC-korten gsc_clicks.
  const ramDag =
    senasteDagMedVarde(rader, SUPABASE_LEDARE) ??
    senasteDagMedVarde(rader, STRIPE_LEDARE) ??
    (rader.length ? String(rader[0].dag) : dagStr());
  const dag = String(ramDag);
  const igar = dagBakat(dag, 1);
  const forraVeckan = dagBakat(dag, 7);

  const t = (nyckel: MetrikNyckel) => tal(index, dag, igar, forraVeckan, nyckel);

  /**
   * Ett Tal for en kolumn vars kalla kan ligga efter. Ankaret ar senaste dag
   * dar ledarkolumnen har ett varde, sa en tom dagsrad langst upp inte gor
   * hela kortet till ett streck.
   */
  const tMed = (ledare: string, nyckel: MetrikNyckel): Tal => {
    const ankare = senasteDagMedVarde(rader, ledare);
    if (!ankare) return { varde: null, motIgar: null, motForraVeckan: null };
    return tal(index, ankare, dagBakat(ankare, 1), dagBakat(ankare, 7), nyckel);
  };

  const tStripe = (nyckel: MetrikNyckel) => tMed(STRIPE_LEDARE, nyckel);
  const tGsc = (nyckel: MetrikNyckel) => tMed(GSC_LEDARE, nyckel);

  const senasteGscDag = senasteDagMedVarde(rader, GSC_LEDARE);
  const senasteStripeDag = senasteDagMedVarde(rader, STRIPE_LEDARE);

  const skickade7 = summa(rader, 'emails_sent', 7);
  const oppnade7 = summa(rader, 'emails_opened', 7);

  const aiKostnad7 = rader
    .slice(0, 7)
    .some((r) => nummer(r.ai_cost_sek) !== null)
    ? Math.round(summa(rader, 'ai_cost_sek', 7) * 100) / 100
    : null;

  const senastUppdaterad = (rader[0] as { uppdaterad?: string } | undefined)
    ?.uppdaterad;

  return {
    dag,
    senasteGscDag: senasteGscDag ? String(senasteGscDag) : null,
    senasteStripeDag: senasteStripeDag ? String(senasteStripeDag) : null,

    intakter: {
      mrrOre: tStripe('mrr_ore'),
      nyaBetalande: tStripe('new_paying'),
      nyaBetalande7: summa(rader, 'new_paying', 7),
      aktivaPren: tStripe('active_subs'),
      trialPren: tStripe('trialing_subs'),
      misslyckade: tStripe('failed_payments'),
      churnade7: summa(rader, 'churned', 7),
    },

    trafik: {
      gscKlick: tGsc('gsc_clicks'),
      gscVisningar: tGsc('gsc_impressions'),
      gscPosition: tGsc('gsc_position'),
      nyaKonton: t('new_accounts'),
      nyaKonton7: summa(rader, 'new_accounts', 7),
    },

    anvandning: {
      aktiva: t('active_users'),
      aktiva7: sido.aktiva7,
      handelser7: sido.handelser7,
      profiler: sido.profiler,
      cvUppladdade7: veckotal(rader, 'cv_uploaded'),
      brevSkapade7: veckotal(rader, 'letters_created'),
      testerSlutforda7: veckotal(rader, 'tests_completed'),
      mallarNedladdade7: veckotal(rader, 'templates_downloaded'),
    },

    mejl: {
      skickade7,
      oppnade7,
      oppnandegrad:
        skickade7 > 0 ? Math.round((oppnade7 / skickade7) * 1000) / 10 : null,
      skickadeForra7: summa(rader, 'emails_sent', 7, 7),
    },

    drift: {
      fel24: sido.fel24,
      fel7: sido.fel7,
      senasteFel: sido.senasteFel,
      aiKostnad7,
      timmarSedanInsamling: senastUppdaterad
        ? Math.max(
            0,
            Math.round(
              (Date.now() - new Date(senastUppdaterad).getTime()) / 3600000
            )
          )
        : null,
    },

    // Diagrammet vill ha aldst forst; tabellasningen ger senaste forst.
    serie: rader
      .slice()
      .reverse()
      .map((rad) => {
        const ore = nummer(rad.mrr_ore);
        return {
          dag: String(rad.dag),
          mrr: ore === null ? null : Math.round(ore / 100),
          nyaBetalande: nummer(rad.new_paying),
        };
      }),
  };
}
