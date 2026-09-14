/**
 * Datalagret for Trafik (planens avsnitt 4.3).
 *
 * All lasning gar mot admin_daily_metrics och admin_gsc_daily med service
 * role. Ingen GSC-fraga sker i kritiska vagen: cronen hamtar, sidan laser
 * tabellen. En sida som pratar med Search Console per sidladdning klarar
 * aldrig LCP under 1,5 sekunder.
 *
 * Tva saker ar sarskilt lakta att fa fel:
 *
 * 1. GSC ligger cirka tva dagar efter. De tva senaste raderna i
 *    admin_daily_metrics har null i gsc-kolumnerna, och det ar normalt.
 *    Sidan visar "senast med data" i stallet for att anta att i gar finns.
 *    Null ritas aldrig som noll: ett noll ser ut som ett ras.
 *
 * 2. PostgREST returnerar numeric som strang. ctr och position maste
 *    tvattas genom tal() innan de rors, annars blir 0.0086 strangen
 *    "0.0086" och en jamforelse mot ett tal blir tyst fel.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_CACHE_SEKUNDER, ADMIN_METRICS_TAG } from '@/lib/admin/metrics';

/** GSC:s fordrojning i dagar. Anges i granssnittet, aldrig bara i koden. */
export const GSC_FORDROJNING_DAGAR = 2;

/** Hur manga rader toppsidor och toppord som visas. Planen sager 50. */
export const TOPP_ANTAL = 50;

/** Jamforelsefonstret: senaste 28 dagarna mot de 28 innan. */
export const PERIOD_DAGAR = 28;

/** Tappregler ur planen: position samre an tre steg, eller klick ner 30 %. */
export const TAPP_POSITION_STEG = 3;
export const TAPP_KLICK_ANDEL = 0.3;

export interface TrafikDagsrad {
  dag: string;
  klick: number | null;
  visningar: number | null;
  ctr: number | null;
  position: number | null;
}

export interface TrafikRad {
  nyckel: string;
  klick: number;
  visningar: number;
  ctr: number | null;
  position: number | null;
  /** Foregaende periods varden, null nar raden ar ny. */
  klickFore: number | null;
  positionFore: number | null;
  /** Klickforandring i procent, null nar det inte gar att rakna. */
  klickDelta: number | null;
  /** Positionsforandring i steg. Negativt ar battre, alltsa hogre upp. */
  positionDelta: number | null;
}

export interface TrafikData {
  /** Dagsserien, stigande, aldst forst, for diagrammen. */
  serie: TrafikDagsrad[];
  /** Senaste dagen med gsc-data, eller null om ingen finns. */
  senastMedData: string | null;
  /** Summor for de senaste PERIOD_DAGAR dagarna med data. */
  period: { klick: number; visningar: number; ctr: number | null; position: number | null };
  /** Samma summor for perioden innan, for delta. */
  foregaende: { klick: number; visningar: number; ctr: number | null; position: number | null };
  toppsidor: TrafikRad[];
  toppord: TrafikRad[];
  tappare: TrafikRad[];
  /** Periodgranserna, for att kunna skriva ut dem i granssnittet. */
  granser: { start: string; slut: string; foreStart: string; foreSlut: string };
}

interface GscRad {
  dag: string;
  dimension: string;
  nyckel: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | string | null;
  position: number | string | null;
}

/** PostgREST ger numeric som strang. Allt som ska raknas pa gar genom den har. */
function tal(varde: number | string | null | undefined): number | null {
  if (varde === null || varde === undefined) return null;
  const n = typeof varde === 'number' ? varde : Number(varde);
  return Number.isFinite(n) ? n : null;
}

function datumStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dagarBakat(antal: number, fran: Date = new Date()): string {
  const d = new Date(fran);
  d.setUTCDate(d.getUTCDate() - antal);
  return datumStr(d);
}

interface Hop {
  klick: number;
  visningar: number;
  /** Viktad positionssumma, alltsa position gange visningar. */
  positionVikt: number;
  positionVisningar: number;
}

function nyHop(): Hop {
  return { klick: 0, visningar: 0, positionVikt: 0, positionVisningar: 0 };
}

function lagg(hop: Hop, rad: GscRad): void {
  const klick = tal(rad.clicks) ?? 0;
  const visningar = tal(rad.impressions) ?? 0;
  const position = tal(rad.position);

  hop.klick += klick;
  hop.visningar += visningar;

  // Snittpositionen viktas med visningar. Ett rakt medelvarde over rader
  // later en sida med tre visningar pa plats 90 dra ner snittet lika mycket
  // som en med tusen visningar pa plats 5, vilket ar fel bild.
  if (position !== null && visningar > 0) {
    hop.positionVikt += position * visningar;
    hop.positionVisningar += visningar;
  }
}

function snittposition(hop: Hop): number | null {
  if (hop.positionVisningar <= 0) return null;
  return hop.positionVikt / hop.positionVisningar;
}

function ctr(hop: Hop): number | null {
  if (hop.visningar <= 0) return null;
  return hop.klick / hop.visningar;
}

/**
 * Bygger topplistan for en dimension genom att jamfora tva perioder.
 *
 * Sorteringen sker pa klick i den senaste perioden, fallande, och lika manga
 * klick brytes pa visningar. Rader som bara finns i den foregaende perioden
 * tas med: en sida som tappat alla sina klick ar precis den sortens rad
 * sidan ska visa.
 */
function byggRader(
  rader: GscRad[],
  dimension: string,
  granser: TrafikData['granser']
): TrafikRad[] {
  const nu = new Map<string, Hop>();
  const fore = new Map<string, Hop>();

  for (const rad of rader) {
    if (rad.dimension !== dimension) continue;

    const iNu = rad.dag >= granser.start && rad.dag <= granser.slut;
    const iFore = rad.dag >= granser.foreStart && rad.dag <= granser.foreSlut;
    if (!iNu && !iFore) continue;

    const karta = iNu ? nu : fore;
    let hop = karta.get(rad.nyckel);
    if (!hop) {
      hop = nyHop();
      karta.set(rad.nyckel, hop);
    }
    lagg(hop, rad);
  }

  const nycklar = new Set<string>([...nu.keys(), ...fore.keys()]);
  const ut: TrafikRad[] = [];

  for (const nyckel of nycklar) {
    const h = nu.get(nyckel) ?? nyHop();
    const f = fore.get(nyckel);

    const klickFore = f ? f.klick : null;
    const positionFore = f ? snittposition(f) : null;
    const position = snittposition(h);

    // Delta i procent kraver ett tal att dela med. En rad utan klick i
    // foregaende period far null, inte oandligheten.
    const klickDelta =
      klickFore !== null && klickFore > 0
        ? (h.klick - klickFore) / klickFore
        : null;

    const positionDelta =
      position !== null && positionFore !== null ? position - positionFore : null;

    ut.push({
      nyckel,
      klick: h.klick,
      visningar: h.visningar,
      ctr: ctr(h),
      position,
      klickFore,
      positionFore,
      klickDelta,
      positionDelta,
    });
  }

  ut.sort((a, b) => b.klick - a.klick || b.visningar - a.visningar);
  return ut;
}

/**
 * Sidor som tappar: position samre an TAPP_POSITION_STEG, eller klick ner
 * mer an TAPP_KLICK_ANDEL. Kraver att raden fanns i foregaende period, annars
 * gar det inte att tappa nagot.
 *
 * Bara rader med nagon volym alls i foregaende perioden tas med. En sida som
 * gick fran ett klick till noll ar brus, inte ett tapp.
 */
function byggTappare(rader: TrafikRad[]): TrafikRad[] {
  return rader
    .filter((r) => {
      if (r.klickFore === null) return false;

      const positionTapp =
        r.positionDelta !== null && r.positionDelta > TAPP_POSITION_STEG;
      const klickTapp =
        r.klickFore >= 3 &&
        r.klickDelta !== null &&
        r.klickDelta < -TAPP_KLICK_ANDEL;

      return positionTapp || klickTapp;
    })
    .sort((a, b) => {
      // Storst tapp forst, mätt i forlorade klick. Positionstappen sorteras
      // efter dem: ett raserat klicktal ar alltid mer akut an tre platser.
      const aTapp = (a.klickFore ?? 0) - a.klick;
      const bTapp = (b.klickFore ?? 0) - b.klick;
      if (aTapp !== bTapp) return bTapp - aTapp;
      return (b.positionDelta ?? 0) - (a.positionDelta ?? 0);
    })
    .slice(0, TOPP_ANTAL);
}

/**
 * Hamtar alla rader ur admin_gsc_daily i fonstret, sidvis.
 *
 * PostgREST svarar med hogst tusen rader oavsett vad .limit() sager, och det
 * sker tyst: svaret ser komplett ut. Fonstret innehaller cirka 5 800 rader,
 * sa en enda fraga skulle lasa en dryg sjattedel och rita topplistor pa den
 * utan att nagot antydde att resten fanns. Darfor pagineras det med .range()
 * tills en sida kommer tillbaka kortare an sidstorleken.
 */
const SIDSTORLEK = 1000;

async function hamtaGscRader(admin: any, fran: string): Promise<GscRad[]> {
  const alla: GscRad[] = [];

  // Taket ar en sakerhetsspärr, inte en forvantan. Utan det blir ett fel i
  // pagineringen en oandlig loop i stallet for ett for litet svar.
  for (let sida = 0; sida < 100; sida++) {
    const fran_ = sida * SIDSTORLEK;
    const { data, error } = await admin
      .from('admin_gsc_daily')
      .select('dag, dimension, nyckel, clicks, impressions, ctr, position')
      .gte('dag', fran)
      .order('dag', { ascending: true })
      .order('nyckel', { ascending: true })
      .range(fran_, fran_ + SIDSTORLEK - 1);

    if (error) {
      console.error('[admin/trafik] admin_gsc_daily sida', sida, error);
      break;
    }

    const rader = (data ?? []) as GscRad[];
    alla.push(...rader);
    if (rader.length < SIDSTORLEK) break;
  }

  return alla;
}

async function las(dagar: number): Promise<TrafikData> {
  const admin = getSupabaseAdmin() as any;

  // Fonstret maste tacka bada perioderna plus fordrojningen, annars blir den
  // foregaende perioden avhuggen och alla delta ser ut som ras.
  const fonster = Math.max(dagar, PERIOD_DAGAR * 2 + GSC_FORDROJNING_DAGAR + 1);
  const fran = dagarBakat(fonster);

  const [metrikRes, gscRader] = await Promise.all([
    admin
      .from('admin_daily_metrics')
      .select('dag, gsc_clicks, gsc_impressions, gsc_ctr, gsc_position')
      .gte('dag', fran)
      .order('dag', { ascending: true }),
    hamtaGscRader(admin, fran),
  ]);

  if (metrikRes.error) {
    console.error('[admin/trafik] admin_daily_metrics:', metrikRes.error);
  }

  const metrikRader = (metrikRes.data ?? []) as Array<{
    dag: string;
    gsc_clicks: number | null;
    gsc_impressions: number | null;
    gsc_ctr: number | string | null;
    gsc_position: number | string | null;
  }>;

  // Serien behaller sina null. AdminChart har connectNulls={false} just for
  // att en lucka ska synas som en lucka.
  const heladSerie: TrafikDagsrad[] = metrikRader.map((r) => ({
    dag: r.dag,
    klick: tal(r.gsc_clicks),
    visningar: tal(r.gsc_impressions),
    ctr: tal(r.gsc_ctr),
    position: tal(r.gsc_position),
  }));

  const serie = heladSerie.slice(-dagar);

  const medData = heladSerie.filter((r) => r.klick !== null || r.visningar !== null);
  const senastMedData = medData.length ? medData[medData.length - 1].dag : null;

  // Perioderna raknas bakat fran senaste dagen med data, inte fran i dag.
  // Annars ligger tva tomma dagar i den senaste perioden och drar ner den
  // mot en foregaende period som har alla sina dagar.
  const ankare = senastMedData ?? dagarBakat(GSC_FORDROJNING_DAGAR);
  const ankareDatum = new Date(`${ankare}T00:00:00Z`);

  const granser: TrafikData['granser'] = {
    slut: ankare,
    start: dagarBakat(PERIOD_DAGAR - 1, ankareDatum),
    foreSlut: dagarBakat(PERIOD_DAGAR, ankareDatum),
    foreStart: dagarBakat(PERIOD_DAGAR * 2 - 1, ankareDatum),
  };

  const periodHop = nyHop();
  const foreHop = nyHop();

  for (const rad of heladSerie) {
    const hop =
      rad.dag >= granser.start && rad.dag <= granser.slut
        ? periodHop
        : rad.dag >= granser.foreStart && rad.dag <= granser.foreSlut
          ? foreHop
          : null;
    if (!hop) continue;

    hop.klick += rad.klick ?? 0;
    hop.visningar += rad.visningar ?? 0;
    if (rad.position !== null && rad.visningar) {
      hop.positionVikt += rad.position * rad.visningar;
      hop.positionVisningar += rad.visningar;
    }
  }

  const sidorAlla = byggRader(gscRader, 'page', granser);
  const ordAlla = byggRader(gscRader, 'query', granser);

  return {
    serie,
    senastMedData,
    period: {
      klick: periodHop.klick,
      visningar: periodHop.visningar,
      ctr: ctr(periodHop),
      position: snittposition(periodHop),
    },
    foregaende: {
      klick: foreHop.klick,
      visningar: foreHop.visningar,
      ctr: ctr(foreHop),
      position: snittposition(foreHop),
    },
    toppsidor: sidorAlla.slice(0, TOPP_ANTAL),
    toppord: ordAlla.slice(0, TOPP_ANTAL),
    tappare: byggTappare(sidorAlla),
    granser,
  };
}

/**
 * Cachad lasning, 15 minuter, samma tagg som ovriga admin-metrik sa att
 * knappen "Hamta nu" pa Intakter ocksa fraschar upp den har sidan.
 */
export const hamtaTrafik = unstable_cache(
  (dagar: number = 30) => las(dagar),
  ['admin-trafik'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);
