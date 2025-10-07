import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
};

// ============================================================================
// ALLA SVERIGES 290 KOMMUNER MED KOORDINATER
// ============================================================================
const SWEDISH_MUNICIPALITIES: Record<string, { lat: number; lon: number }> = {
  // Stockholms län (26 kommuner)
  "stockholm": { lat: 59.3293, lon: 18.0686 }, "solna": { lat: 59.3599, lon: 18.0000 }, "sundbyberg": { lat: 59.3609, lon: 17.9711 },
  "sollentuna": { lat: 59.4280, lon: 17.9514 }, "täby": { lat: 59.4439, lon: 18.0687 }, "upplands väsby": { lat: 59.5177, lon: 17.9106 },
  "vallentuna": { lat: 59.5342, lon: 18.0774 }, "österåker": { lat: 59.4797, lon: 18.2978 }, "värmdö": { lat: 59.2914, lon: 18.4381 },
  "lidingö": { lat: 59.3667, lon: 18.1333 }, "vaxholm": { lat: 59.4022, lon: 18.3539 }, "nacka": { lat: 59.3096, lon: 18.1633 },
  "tyresö": { lat: 59.2443, lon: 18.2179 }, "huddinge": { lat: 59.2364, lon: 17.9827 }, "salem": { lat: 59.1617, lon: 17.7559 },
  "botkyrka": { lat: 59.2000, lon: 17.8333 }, "haninge": { lat: 59.1644, lon: 18.1439 }, "nynäshamn": { lat: 58.9027, lon: 17.9492 },
  "södertälje": { lat: 59.1959, lon: 17.6255 }, "nykvarn": { lat: 59.1794, lon: 17.4294 }, "järfälla": { lat: 59.4138, lon: 17.8333 },
  "ekerö": { lat: 59.2814, lon: 17.7944 }, "sigtuna": { lat: 59.6171, lon: 17.7241 }, "upplands-bro": { lat: 59.5161, lon: 17.6108 },
  "norrtälje": { lat: 59.7581, lon: 18.7048 }, "knivsta": { lat: 59.7267, lon: 17.7942 },

  // Uppsala län (8 kommuner)
  "uppsala": { lat: 59.8586, lon: 17.6389 }, "enköping": { lat: 59.6357, lon: 17.0777 }, "håbo": { lat: 59.5939, lon: 17.5372 },
  "tierp": { lat: 60.3461, lon: 17.5181 }, "älvkarleby": { lat: 60.5739, lon: 17.4561 }, "heby": { lat: 59.9158, lon: 16.2889 },
  "östhammar": { lat: 60.2619, lon: 18.3800 },

  // Södermanlands län (9 kommuner)
  "eskilstuna": { lat: 59.3710, lon: 16.5077 }, "strängnäs": { lat: 59.3783, lon: 17.0339 }, "nyköping": { lat: 58.7530, lon: 17.0086 },
  "katrineholm": { lat: 58.9959, lon: 16.2073 }, "flen": { lat: 59.0597, lon: 16.5878 }, "oxelösund": { lat: 58.6694, lon: 17.0986 },
  "trosa": { lat: 58.8942, lon: 17.5547 }, "gnesta": { lat: 59.0492, lon: 17.3122 }, "vingåker": { lat: 59.0444, lon: 15.8747 },

  // Östergötlands län (13 kommuner)
  "linköping": { lat: 58.4108, lon: 15.6214 }, "norrköping": { lat: 58.5877, lon: 16.1924 }, "motala": { lat: 58.5370, lon: 15.0364 },
  "mjölby": { lat: 58.3253, lon: 15.1289 }, "finspång": { lat: 58.7056, lon: 15.7703 }, "vadstena": { lat: 58.4492, lon: 14.8911 },
  "ödeshög": { lat: 58.2339, lon: 14.6569 }, "ydre": { lat: 57.8719, lon: 15.2281 }, "kinda": { lat: 58.0531, lon: 15.5469 },
  "boxholm": { lat: 58.1956, lon: 15.0542 }, "åtvidaberg": { lat: 58.1986, lon: 16.0028 }, "valdemarsvik": { lat: 58.2031, lon: 16.6031 },
  "söderköping": { lat: 58.4833, lon: 16.3211 },

  // Jönköpings län (13 kommuner)
  "jönköping": { lat: 57.7826, lon: 14.1618 }, "värnamo": { lat: 57.1856, lon: 14.0400 }, "nässjö": { lat: 57.6531, lon: 14.6968 },
  "vetlanda": { lat: 57.4289, lon: 15.0776 }, "tranås": { lat: 58.0369, lon: 14.9786 }, "gislaved": { lat: 57.3050, lon: 13.5411 },
  "gnosjö": { lat: 57.3508, lon: 13.7350 }, "eksjö": { lat: 57.6667, lon: 14.9725 }, "sävsjö": { lat: 57.4044, lon: 14.6622 },
  "aneby": { lat: 57.8353, lon: 14.8117 }, "vaggeryd": { lat: 57.4767, lon: 14.1419 }, "mullsjö": { lat: 57.9133, lon: 13.8819 },
  "habo": { lat: 57.9108, lon: 14.0733 },

  // Kronobergs län (8 kommuner)
  "växjö": { lat: 56.8787, lon: 14.8059 }, "ljungby": { lat: 56.8333, lon: 13.9397 }, "älmhult": { lat: 56.5506, lon: 14.1372 },
  "markaryd": { lat: 56.4644, lon: 13.5967 }, "tingsryd": { lat: 56.5239, lon: 14.9800 }, "alvesta": { lat: 56.8989, lon: 14.5564 },
  "lessebo": { lat: 56.7533, lon: 15.2644 }, "uppvidinge": { lat: 56.9306, lon: 15.3942 },

  // Kalmar län (12 kommuner)
  "kalmar": { lat: 56.6634, lon: 16.3567 }, "oskarshamn": { lat: 57.2644, lon: 16.4486 }, "västervik": { lat: 57.7583, lon: 16.6378 },
  "vimmerby": { lat: 57.6658, lon: 15.8556 }, "borgholm": { lat: 56.8789, lon: 16.6550 }, "hultsfred": { lat: 57.4878, lon: 15.8406 },
  "mönsterås": { lat: 57.0403, lon: 16.4364 }, "nybro": { lat: 56.7439, lon: 15.9081 }, "emmaboda": { lat: 56.6319, lon: 15.5394 },
  "torsås": { lat: 56.4181, lon: 16.0150 }, "mörbylånga": { lat: 56.5100, lon: 16.3819 }, "högsby": { lat: 57.1656, lon: 16.0156 },

  // Gotlands län (1 kommun)
  "gotland": { lat: 57.6348, lon: 18.2948 },

  // Blekinge län (5 kommuner)
  "karlskrona": { lat: 56.1621, lon: 15.5866 }, "ronneby": { lat: 56.2092, lon: 15.2761 }, "karlshamn": { lat: 56.1706, lon: 14.8619 },
  "sölvesborg": { lat: 56.0514, lon: 14.5825 }, "olofström": { lat: 56.2789, lon: 14.5322 },

  // Skåne län (33 kommuner)
  "malmö": { lat: 55.6050, lon: 13.0038 }, "lund": { lat: 55.7047, lon: 13.1910 }, "helsingborg": { lat: 56.0465, lon: 12.6945 },
  "landskrona": { lat: 55.8708, lon: 12.8301 }, "ängelholm": { lat: 56.2428, lon: 12.8622 }, "höganäs": { lat: 56.2011, lon: 12.5594 },
  "eslöv": { lat: 55.8392, lon: 13.3039 }, "ystad": { lat: 55.4296, lon: 13.8206 }, "trelleborg": { lat: 55.3754, lon: 13.1567 },
  "kristianstad": { lat: 56.0294, lon: 14.1567 }, "simrishamn": { lat: 55.5556, lon: 14.3522 }, "hässleholm": { lat: 56.1590, lon: 13.7658 },
  "staffanstorp": { lat: 55.6444, lon: 13.2064 }, "burlöv": { lat: 55.6436, lon: 13.0836 }, "lomma": { lat: 55.6722, lon: 13.0764 },
  "svedala": { lat: 55.5064, lon: 13.2347 }, "vellinge": { lat: 55.4708, lon: 13.0169 }, "skurup": { lat: 55.4792, lon: 13.4967 },
  "sjöbo": { lat: 55.6306, lon: 13.7061 }, "hörby": { lat: 55.8547, lon: 13.6586 }, "höör": { lat: 55.9364, lon: 13.5419 },
  "tomelilla": { lat: 55.5453, lon: 13.9631 }, "åstorp": { lat: 56.1344, lon: 12.9453 }, "båstad": { lat: 56.4297, lon: 12.8506 },
  "klippan": { lat: 56.1333, lon: 13.1267 }, "perstorp": { lat: 56.1403, lon: 13.3919 }, "örkelljunga": { lat: 56.2858, lon: 13.2800 },
  "bjuv": { lat: 56.0831, lon: 12.9189 }, "kävlinge": { lat: 55.7919, lon: 13.1103 }, "östra göinge": { lat: 56.2542, lon: 14.0678 },
  "bromölla": { lat: 56.0714, lon: 14.4656 }, "osby": { lat: 56.3833, lon: 13.9886 }, "svalöv": { lat: 55.9117, lon: 13.1117 },

  // Hallands län (6 kommuner)
  "halmstad": { lat: 56.6745, lon: 12.8577 }, "varberg": { lat: 57.1057, lon: 12.2502 }, "falkenberg": { lat: 56.9054, lon: 12.4915 },
  "kungsbacka": { lat: 57.4870, lon: 12.0772 }, "hylte": { lat: 56.9953, lon: 13.2508 }, "laholm": { lat: 56.5125, lon: 13.0444 },

  // Västra Götalands län (49 kommuner)
  "göteborg": { lat: 57.7089, lon: 11.9746 }, "mölndal": { lat: 57.6554, lon: 12.0137 }, "partille": { lat: 57.7395, lon: 12.1064 },
  "lerum": { lat: 57.7704, lon: 12.2694 }, "alingsås": { lat: 57.9303, lon: 12.5344 }, "härryda": { lat: 57.6581, lon: 12.3689 },
  "öckerö": { lat: 57.7064, lon: 11.6569 }, "stenungsund": { lat: 58.0706, lon: 11.8189 }, "tjörn": { lat: 58.0122, lon: 11.6289 },
  "orust": { lat: 58.2000, lon: 11.6167 }, "uddevalla": { lat: 58.3480, lon: 11.9424 }, "lysekil": { lat: 58.2753, lon: 11.4350 },
  "trollhättan": { lat: 58.2836, lon: 12.2886 }, "vänersborg": { lat: 58.3808, lon: 12.3235 }, "borås": { lat: 57.7210, lon: 12.9401 },
  "ulricehamn": { lat: 57.7931, lon: 13.4122 }, "skövde": { lat: 58.3910, lon: 13.8455 }, "lidköping": { lat: 58.5052, lon: 13.1577 },
  "ale": { lat: 57.9347, lon: 12.0483 }, "kungälv": { lat: 57.8708, lon: 11.9800 }, "sotenäs": { lat: 58.4878, lon: 11.2483 },
  "munkedal": { lat: 58.4697, lon: 11.6808 }, "tanum": { lat: 58.7264, lon: 11.3236 }, "dals-ed": { lat: 59.0483, lon: 11.9178 },
  "färgelanda": { lat: 58.5708, lon: 12.4600 }, "mellerud": { lat: 58.7000, lon: 12.4583 }, "åmål": { lat: 59.0508, lon: 12.7044 },
  "bengtsfors": { lat: 59.0317, lon: 12.2294 }, "strömstad": { lat: 58.9378, lon: 11.1753 }, "vara": { lat: 58.2606, lon: 12.9556 },
  "götene": { lat: 58.5414, lon: 13.4392 }, "tibro": { lat: 58.4231, lon: 14.1603 }, "töreboda": { lat: 58.7067, lon: 14.1258 },
  "gullspång": { lat: 58.9897, lon: 14.1078 }, "tranemo": { lat: 57.4878, lon: 13.3508 }, "mariestad": { lat: 58.7094, lon: 13.8236 },
  "essunga": { lat: 58.2000, lon: 12.8500 }, "karlsborg": { lat: 58.5353, lon: 14.5069 }, "grästorp": { lat: 58.3394, lon: 12.6197 },
  "falköping": { lat: 58.1733, lon: 13.5508 }, "hjo": { lat: 58.3011, lon: 14.2867 }, "tidaholm": { lat: 58.1800, lon: 13.9569 },
  "svenljunga": { lat: 57.4969, lon: 13.1094 }, "herrljunga": { lat: 58.0817, lon: 13.0308 }, "bollebygd": { lat: 57.6683, lon: 12.5686 },
  "mark": { lat: 57.4939, lon: 12.5261 }, "lilla edet": { lat: 58.1333, lon: 12.1333 }, "vårgårda": { lat: 58.0342, lon: 12.8106 },

  // Värmlands län (16 kommuner)
  "karlstad": { lat: 59.3793, lon: 13.5036 }, "arvika": { lat: 59.6556, lon: 12.5906 }, "kristinehamn": { lat: 59.3097, lon: 14.1081 },
  "filipstad": { lat: 59.7111, lon: 14.1664 }, "hagfors": { lat: 60.0264, lon: 13.6681 }, "säffle": { lat: 59.1339, lon: 12.9322 },
  "kil": { lat: 59.5050, lon: 13.3225 }, "eda": { lat: 59.8669, lon: 12.3911 }, "torsby": { lat: 60.1306, lon: 12.9939 },
  "sunne": { lat: 59.8408, lon: 13.1203 }, "forshaga": { lat: 59.5283, lon: 13.4961 }, "grums": { lat: 59.3481, lon: 13.1108 },
  "årjäng": { lat: 59.3867, lon: 12.1378 }, "munkfors": { lat: 59.8386, lon: 13.5442 }, "storfors": { lat: 59.7528, lon: 14.2908 },
  "hammarö": { lat: 59.3278, lon: 13.6306 },

  // Örebro län (12 kommuner)
  "örebro": { lat: 59.2753, lon: 15.2134 }, "kumla": { lat: 59.1289, lon: 15.1428 }, "hallsberg": { lat: 59.0644, lon: 15.1089 },
  "askersund": { lat: 58.8758, lon: 14.9061 }, "degerfors": { lat: 59.2569, lon: 14.4567 }, "karlskoga": { lat: 59.3267, lon: 14.5233 },
  "laxå": { lat: 58.9792, lon: 14.6139 }, "lindesberg": { lat: 59.5939, lon: 15.2278 }, "ljusnarsberg": { lat: 59.8667, lon: 14.9500 },
  "nora": { lat: 59.5206, lon: 15.0319 }, "hällefors": { lat: 59.7747, lon: 14.5211 }, "lekeberg": { lat: 59.0689, lon: 15.2581 },

  // Västmanlands län (10 kommuner)
  "västerås": { lat: 59.6099, lon: 16.5448 }, "köping": { lat: 59.5139, lon: 15.9931 }, "sala": { lat: 59.9239, lon: 16.6050 },
  "fagersta": { lat: 59.9944, lon: 15.7933 }, "arboga": { lat: 59.3931, lon: 15.8372 }, "kungsör": { lat: 59.4264, lon: 16.0978 },
  "hallstahammar": { lat: 59.6156, lon: 16.2261 }, "norberg": { lat: 60.0569, lon: 15.9164 }, "skinnskatteberg": { lat: 59.8294, lon: 15.7550 },
  "surahammar": { lat: 59.7406, lon: 16.2528 },

  // Dalarnas län (15 kommuner)
  "falun": { lat: 60.6066, lon: 15.6265 }, "borlänge": { lat: 60.4858, lon: 15.4378 }, "ludvika": { lat: 60.1497, lon: 15.1881 },
  "avesta": { lat: 60.1456, lon: 16.1681 }, "mora": { lat: 61.0086, lon: 14.5428 }, "säter": { lat: 60.3475, lon: 15.7547 },
  "hedemora": { lat: 60.2767, lon: 15.9911 }, "rättvik": { lat: 60.8844, lon: 15.1139 }, "orsa": { lat: 61.1192, lon: 14.6203 },
  "älvdalen": { lat: 61.2267, lon: 14.0483 }, "malung-sälen": { lat: 60.6833, lon: 13.7167 }, "gagnef": { lat: 60.5739, lon: 15.0953 },
  "leksand": { lat: 60.7308, lon: 14.9989 }, "vansbro": { lat: 60.5319, lon: 14.2808 }, "smedjebacken": { lat: 60.1436, lon: 15.4089 },

  // Gävleborgs län (10 kommuner)
  "gävle": { lat: 60.6749, lon: 17.1413 }, "sandviken": { lat: 60.6167, lon: 16.7667 }, "söderhamn": { lat: 61.3039, lon: 17.0672 },
  "hudiksvall": { lat: 61.7281, lon: 17.1050 }, "bollnäs": { lat: 61.3489, lon: 16.3931 }, "hofors": { lat: 60.5500, lon: 16.2800 },
  "ovanåker": { lat: 61.3278, lon: 16.3669 }, "ockelbo": { lat: 60.8919, lon: 16.7169 }, "ljusdal": { lat: 61.8294, lon: 16.0869 },
  "nordanstig": { lat: 61.7667, lon: 17.2833 },

  // Västernorrlands län (7 kommuner)
  "sundsvall": { lat: 62.3908, lon: 17.3069 }, "härnösand": { lat: 62.6322, lon: 17.9383 }, "kramfors": { lat: 62.9333, lon: 17.7833 },
  "sollefteå": { lat: 63.1686, lon: 17.2657 }, "örnsköldsvik": { lat: 63.2909, lon: 18.7155 }, "ånge": { lat: 62.5264, lon: 15.6639 },
  "timrå": { lat: 62.4883, lon: 17.3308 },

  // Jämtlands län (8 kommuner)
  "östersund": { lat: 63.1792, lon: 14.6357 }, "härjedalen": { lat: 62.0833, lon: 13.6833 }, "strömsund": { lat: 63.8486, lon: 15.5539 },
  "åre": { lat: 63.3989, lon: 13.0819 }, "krokom": { lat: 63.3144, lon: 14.4597 }, "berg": { lat: 62.8667, lon: 14.3167 },
  "bräcke": { lat: 62.7472, lon: 15.4192 }, "ragunda": { lat: 63.0000, lon: 16.1667 },

  // Västerbottens län (15 kommuner)
  "umeå": { lat: 63.8258, lon: 20.2630 }, "skellefteå": { lat: 64.7507, lon: 20.9527 }, "lycksele": { lat: 64.5989, lon: 18.6733 },
  "nordmaling": { lat: 63.5694, lon: 19.5014 }, "bjurholm": { lat: 63.9458, lon: 19.3092 }, "vindeln": { lat: 64.2069, lon: 19.7139 },
  "robertsfors": { lat: 64.1986, lon: 20.8347 }, "norsjö": { lat: 64.9036, lon: 19.4825 }, "malå": { lat: 65.1825, lon: 18.7317 },
  "storuman": { lat: 65.0944, lon: 17.1136 }, "sorsele": { lat: 65.5361, lon: 17.5406 }, "dorotea": { lat: 64.2575, lon: 16.4117 },
  "vännäs": { lat: 63.9103, lon: 19.7586 }, "vilhelmina": { lat: 64.6233, lon: 16.6522 }, "åsele": { lat: 64.1661, lon: 17.3472 },

  // Norrbottens län (14 kommuner)
  "luleå": { lat: 65.5848, lon: 22.1547 }, "piteå": { lat: 65.3197, lon: 21.4758 }, "boden": { lat: 65.8250, lon: 21.6886 },
  "kalix": { lat: 65.8558, lon: 23.1472 }, "haparanda": { lat: 65.8347, lon: 24.1361 }, "kiruna": { lat: 67.8558, lon: 20.2253 },
  "gällivare": { lat: 67.1333, lon: 20.6500 }, "jokkmokk": { lat: 66.6039, lon: 19.8258 }, "arjeplog": { lat: 66.0514, lon: 17.8858 },
  "älvsbyn": { lat: 65.6758, lon: 21.0069 }, "pajala": { lat: 67.2139, lon: 23.3742 }, "övertorneå": { lat: 66.3881, lon: 23.6550 },
  "arvidsjaur": { lat: 65.5903, lon: 19.1772 }, "överkalix": { lat: 66.3267, lon: 22.8453 },
};

// ============================================================================
// DISTANCE CALCULATION
// ============================================================================
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getMunicipalityCoords(location: string): { lat: number; lon: number } | null {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();
  for (const [city, coords] of Object.entries(SWEDISH_MUNICIPALITIES)) {
    if (normalized.includes(city)) return coords;
  }
  return null;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// DATABASE CACHE
// ============================================================================
interface CachedOccupationEnrichment {
  occupation: string;
  ssyk_code: string | null;
  preferred_label: string | null;
  alternative_labels: string[];
  related_occupations: string[];
  competencies: string[];
  trending_skills: any;
  historical_data: any;
  education_matches: string[];
}

interface EnrichedJobData {
  jobId: string;
  occupations?: Array<{ term: string; weight: number; ssyk_code?: string }>;
  skills?: Array<{ term: string; weight: number }>;
  competencies?: Array<{ term: string; weight: number }>;
  experience_required?: { years?: number; level?: string; weight: number };
  education_level?: { level: string; weight: number };
}

async function getCachedOccupationEnrichment(occupation: string): Promise<CachedOccupationEnrichment | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('enriched_occupations').select('*')
      .eq('occupation', occupation.toLowerCase()).gt('expires_at', new Date().toISOString()).single();
    if (error || !data) return null;
    console.log(`[DB Cache] HIT for occupation "${occupation}"`);
    return data as CachedOccupationEnrichment;
  } catch { return null; }
}

async function saveCachedOccupationEnrichment(occupation: string, taxonomyData: any, historicalTrends: any, educationMatches: string[]): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const cacheData = {
      occupation: occupation.toLowerCase(), ssyk_code: taxonomyData.ssykCode, preferred_label: taxonomyData.preferredLabel,
      alternative_labels: taxonomyData.alternativeLabels, related_occupations: taxonomyData.relatedOccupations,
      competencies: taxonomyData.competencies, trending_skills: historicalTrends?.trendingSkills || null,
      historical_data: historicalTrends || null, education_matches: educationMatches,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await supabase.from('enriched_occupations').upsert(cacheData, { onConflict: 'occupation' });
    console.log(`[DB Cache] Saved occupation "${occupation}"`);
  } catch (error) { console.error('[DB Cache] Save error:', error); }
}

async function getCachedJobsBatch(jobIds: string[]): Promise<Map<string, EnrichedJobData>> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.from('enriched_jobs').select('*').in('job_id', jobIds).gt('expires_at', new Date().toISOString());
    const results = new Map<string, EnrichedJobData>();
    if (data) {
      data.forEach((row: any) => {
        results.set(row.job_id, {
          jobId: row.job_id, occupations: row.occupations, skills: row.skills, competencies: row.competencies,
          experience_required: row.experience_required, education_level: row.education_level
        });
      });
    }
    console.log(`[DB Cache] Batch lookup: ${results.size}/${jobIds.length} jobs found`);
    return results;
  } catch { return new Map(); }
}

async function saveCachedJobsBatch(enrichedJobs: Map<string, EnrichedJobData>, jobHeadlines: Map<string, string>): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const cacheDataArray = Array.from(enrichedJobs.entries()).map(([jobId, enrichedData]) => ({
      job_id: jobId, job_headline: jobHeadlines.get(jobId) || null, occupations: enrichedData.occupations || null,
      skills: enrichedData.skills || null, competencies: enrichedData.competencies || null,
      experience_required: enrichedData.experience_required || null, education_level: enrichedData.education_level || null,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));
    if (cacheDataArray.length > 0) {
      await supabase.from('enriched_jobs').upsert(cacheDataArray, { onConflict: 'job_id' });
      console.log(`[DB Cache] Batch saved ${cacheDataArray.length} jobs`);
    }
  } catch (error) { console.error('[DB Cache] Batch save error:', error); }
}

// ============================================================================
// TAXONOMY ENRICHMENT
// ============================================================================
interface TaxonomyEnrichment {
  primaryTerm: string; ssykCode: string | null; preferredLabel: string | null;
  alternativeLabels: string[]; relatedOccupations: string[]; competencies: string[];
}

async function enrichOccupationWithTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const baseUrl = 'https://taxonomy.api.jobtechdev.se/v1/taxonomy';
  try {
    // Rätt endpoint enligt Swagger: /specific/concepts/ssyk med preferred-label parameter
    const searchUrl = `${baseUrl}/specific/concepts/ssyk?preferred-label=${encodeURIComponent(occupation)}&limit=5`;
    const response = await fetch(searchUrl, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      console.warn(`Taxonomy API error (${response.status}) for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      console.warn(`No SSYK data found for "${occupation}"`);
      return createFallbackEnrichment(occupation);
    }

    const bestMatch = data[0];

    // Taxonomy API använder namespace-prefix för alla fält
    const ssykCode = bestMatch['taxonomy/ssyk-code-2012'] || null;
    const preferredLabel = bestMatch['taxonomy/preferred-label'] || null;
    const alternativeLabels = bestMatch['taxonomy/alternative-labels'] || [];

    // Relationer och kompetenser (om tillgängliga via andra endpoints)
    let relatedOccupations: string[] = [];
    let competencies: string[] = [];

    console.log(`[Taxonomy] "${occupation}" → SSYK ${ssykCode}, ${alternativeLabels.length} synonymer`);

    return { primaryTerm: occupation, ssykCode, preferredLabel, alternativeLabels, relatedOccupations, competencies };
  } catch (error) {
    console.error(`Taxonomy API error for "${occupation}":`, error);
    return createFallbackEnrichment(occupation);
  }
}

function createFallbackEnrichment(occupation: string): TaxonomyEnrichment {
  const manualSynonyms: Record<string, string[]> = {
    'rörmokare': ['vvs-montör', 'vs-montör', 'rörläggare', 'vvs-installatör'],
    'elektriker': ['elmontör', 'elinstallatör', 'eltekniker'],
    'snickare': ['byggsnickare', 'möbelsnickare', 'inredningssnickare'],
    'utvecklare': ['systemutvecklare', 'mjukvaruutvecklare', 'programmerare']
  };
  const synonyms = manualSynonyms[occupation.toLowerCase()] || [];
  return { primaryTerm: occupation, ssykCode: null, preferredLabel: null, alternativeLabels: synonyms, relatedOccupations: [], competencies: [] };
}

const taxonomyCache = new Map<string, { data: TaxonomyEnrichment; timestamp: number }>();
const TAXONOMY_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

async function getCachedTaxonomy(occupation: string): Promise<TaxonomyEnrichment> {
  const cacheKey = `taxonomy:${occupation.toLowerCase()}`;
  if (taxonomyCache.has(cacheKey)) {
    const cached = taxonomyCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < TAXONOMY_CACHE_DURATION) return cached.data;
    taxonomyCache.delete(cacheKey);
  }
  const data = await enrichOccupationWithTaxonomy(occupation);
  taxonomyCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

// ============================================================================
// JOBAD LINKS API
// ============================================================================
interface JobAdLinksJob {
  id: string;
  headline: string;
  description: { text: string };
  employer: { name: string };
  workplace_address?: { municipality?: string };
  publication_date?: string;
  application_deadline?: string;
  application_details?: { url?: string };
  webpage_url?: string;
  occupation?: { label?: string };
  occupation_group?: { label?: string };
}

async function searchJobAdLinks(params: any): Promise<JobAdLinksJob[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.municipality) queryParams.append('municipality', params.municipality);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    const url = `https://jobsearch.api.jobtechdev.se/search?${queryParams.toString()}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      console.error(`[API Error] ${response.status}: ${response.statusText} for query:`, params);
      return [];
    }
    const data = await response.json();
    return data.hits || [];
  } catch (error) {
    console.error('[API Exception]', error, 'for params:', params);
    return [];
  }
}

// Hämta jobb med pagination (upp till maxPages sidor)
async function searchJobAdLinksWithPagination(query: any, maxPages: number = 5): Promise<JobAdLinksJob[]> {
  const SAFE_LIMIT = 100; // Max per query (säker limit)
  const allJobs: JobAdLinksJob[] = [];
  const seen = new Set<string>();

  console.log(`[Pagination] Fetching up to ${maxPages} pages for query:`, query.q);

  for (let page = 0; page < maxPages; page++) {
    const offset = page * SAFE_LIMIT;
    const params = { ...query, limit: SAFE_LIMIT, offset };

    const jobs = await searchJobAdLinks(params);

    if (jobs.length === 0) {
      console.log(`[Pagination] No more results at page ${page + 1}, stopping`);
      break;
    }

    // Deduplicate
    let newJobsCount = 0;
    for (const job of jobs) {
      if (!seen.has(job.id)) {
        seen.add(job.id);
        allJobs.push(job);
        newJobsCount++;
      }
    }

    console.log(`[Pagination] Page ${page + 1}: ${newJobsCount} new jobs (${jobs.length} total returned)`);

    // If we got fewer results than the limit, we've reached the end
    if (jobs.length < SAFE_LIMIT) {
      console.log(`[Pagination] Reached end of results at page ${page + 1}`);
      break;
    }
  }

  console.log(`[Pagination] Total unique jobs fetched: ${allJobs.length}`);
  return allJobs;
}

async function searchJobAdLinksMultiQuery(queries: any[]): Promise<JobAdLinksJob[]> {
  const results = await Promise.allSettled(queries.map(q => searchJobAdLinks(q)));
  const allJobs: JobAdLinksJob[] = [];
  results.forEach((result) => { if (result.status === 'fulfilled') allJobs.push(...result.value); });
  const seen = new Map<string, JobAdLinksJob>();
  for (const job of allJobs) { if (!seen.has(job.id)) seen.set(job.id, job); }
  return Array.from(seen.values());
}

function convertToInternalFormat(job: JobAdLinksJob): any {
  return {
    id: job.id,
    headline: job.headline,
    description: job.description,
    employer: job.employer,
    workplace_address: job.workplace_address,
    location: job.workplace_address?.municipality || '',
    company: job.employer.name,
    source_type: 'jobad-links',
    // Datum och ansökningsinfo
    publication_date: job.publication_date,
    application_deadline: job.application_deadline,
    application_url: job.application_details?.url || job.webpage_url,
    // Yrkesinformation för bättre matchning
    occupation: job.occupation,
    occupation_group: job.occupation_group
  };
}

// ============================================================================
// JOB ENRICHMENT
// ============================================================================
async function enrichJobTextLocally(jobId: string, jobText: string): Promise<EnrichedJobData> {
  const lowerText = jobText.toLowerCase();
  const commonSkills = ['javascript', 'python', 'excel', 'cad', 'bim', 'svetsning', 'installation', 'projektledning'];
  const skills: Array<{ term: string; weight: number }> = [];
  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      const occurrences = (lowerText.match(new RegExp(skill, 'g')) || []).length;
      skills.push({ term: skill, weight: Math.min(1.0, 0.5 + (occurrences * 0.2)) });
    }
  }
  return { jobId, skills };
}

async function enrichJobsBatch(jobs: Array<{ id: string; text: string }>): Promise<Map<string, EnrichedJobData>> {
  const results = new Map<string, EnrichedJobData>();
  const BATCH_SIZE = 10;
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(job => enrichJobTextLocally(job.id, job.text)));
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) results.set(batch[index].id, result.value);
    });
  }
  console.log(`[Enrichments] Successfully enriched ${results.size}/${jobs.length} jobs`);
  return results;
}

// ============================================================================
// ADVANCED SCORING
// ============================================================================
interface AdvancedScoringInput {
  cvData: any; cvOccupations: string[]; cvLocations: string[]; analysisData: any; job: any;
  enrichedJob: EnrichedJobData | null; taxonomyData: TaxonomyEnrichment | null; historicalTrends: any;
  educationMatches?: string[]; userPreferredDistance?: number; isRemote?: boolean;
}

interface ScoringBreakdown {
  total: number;
  breakdown: {
    ssykMatch: number;       // Faktor 1: SSYK-kod matchning (0-35p)
    occupationMatch: number; // Faktor 2: Yrkestitel matchning (0-25p)
    experienceMatch: number; // Faktor 3: Erfarenhet i liknande roll (0-20p)
    geography: number;       // Faktor 4: Geografisk distans (0-15p)
    skillsMatch: number;     // Faktor 5: Kompetenser/färdigheter (0-5p)
  };
  explanation: string[];
  distance?: number;
}

function calculateAdvancedRelevance(input: AdvancedScoringInput): ScoringBreakdown {
  const breakdown = {
    ssykMatch: 0,        // Faktor 1: SSYK-matchning (0-35p)
    occupationMatch: 0,  // Faktor 2: Yrkestitel (0-25p)
    experienceMatch: 0,  // Faktor 3: Erfarenhet (0-20p)
    geography: 0,        // Faktor 4: Geografi (0-15p)
    skillsMatch: 0       // Faktor 5: Kompetenser (0-5p)
    // Totalt max: 100 poäng
  };
  const explanation: string[] = [];
  let distance: number | undefined;

  // FAKTOR 1: SSYK-matchning (35p) - NU MED KORREKT TAXONOMY API!
  if (input.taxonomyData?.ssykCode && input.enrichedJob?.occupations) {
    for (const jobOcc of input.enrichedJob.occupations) {
      if (jobOcc.ssyk_code === input.taxonomyData.ssykCode) {
        breakdown.ssykMatch = 35;
        explanation.push(`✅ SSYK-match: ${input.taxonomyData.ssykCode} (35p)`);
        break;
      }
    }
  }

  // FAKTOR 2: Yrkestitel-matchning (25p)
  // Används om SSYK inte matchar eller som komplement
  if (breakdown.ssykMatch === 0 && input.cvOccupations.length > 0) {
    const cvOccupation = input.cvOccupations[0].toLowerCase();
    const jobOccupation = (input.job.occupation?.label || '').toLowerCase();
    const jobHeadline = (input.job.headline || '').toLowerCase();

    if (jobOccupation === cvOccupation) {
      breakdown.occupationMatch = 25;
      explanation.push(`✅ Exakt yrkestitel: ${input.job.occupation?.label} (25p)`);
    } else if (jobOccupation.includes(cvOccupation) || cvOccupation.includes(jobOccupation)) {
      breakdown.occupationMatch = 20;
      explanation.push(`✅ Liknande yrkestitel (20p)`);
    } else if (jobHeadline.includes(cvOccupation)) {
      breakdown.occupationMatch = 15;
      explanation.push(`✅ Yrke i rubrik (15p)`);
    }

    // Kolla yrkesgrupp som fallback
    if (breakdown.occupationMatch === 0 && input.job.occupation_group?.label) {
      const jobGroup = input.job.occupation_group.label.toLowerCase();
      if ((jobGroup.includes('chef') && cvOccupation.includes('chef')) ||
          (jobGroup.includes('handel') && (cvOccupation.includes('butik') || cvOccupation.includes('försälj')))) {
        breakdown.occupationMatch = 10;
        explanation.push(`✅ Samma yrkesgrupp: ${input.job.occupation_group.label} (10p)`);
      }
    }
  }

  // FAKTOR 3: Erfarenhet (20p) - NYTT!
  let yearsExperience = 0;
  if (input.cvData.structuredCV?.experience) {
    const jobOccupation = (input.job.occupation?.label || '').toLowerCase();

    input.cvData.structuredCV.experience.forEach((exp: any) => {
      const position = (exp.position || '').toLowerCase();

      // Räkna år om positionen matchar jobbtypen
      const isRelevant = position.includes(jobOccupation) ||
                        jobOccupation.includes(position) ||
                        (position.includes('chef') && jobOccupation.includes('chef')) ||
                        (position.includes('butik') && jobOccupation.includes('butik')) ||
                        (position.includes('vvs') && jobOccupation.includes('vvs')) ||
                        (position.includes('rörmok') && jobOccupation.includes('rörmok'));

      if (isRelevant) {
        try {
          // Parsa datum (format: MM/YYYY)
          const parseDate = (dateStr: string) => {
            const parts = dateStr.split('/');
            if (parts.length === 2) {
              const month = parseInt(parts[0]);
              const year = parseInt(parts[1]);
              return new Date(year, month - 1);
            }
            return null;
          };

          const startDate = parseDate(exp.startDate);
          const endDate = exp.endDate ? parseDate(exp.endDate) : new Date();

          if (startDate && endDate) {
            const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            yearsExperience += years;
          }
        } catch (e) {
          console.warn('[Experience] Date parse error:', e);
        }
      }
    });
  }

  if (yearsExperience >= 5) {
    breakdown.experienceMatch = 20;
    explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (20p)`);
  } else if (yearsExperience >= 3) {
    breakdown.experienceMatch = 15;
    explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (15p)`);
  } else if (yearsExperience >= 1) {
    breakdown.experienceMatch = 10;
    explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (10p)`);
  } else if (yearsExperience > 0) {
    breakdown.experienceMatch = 5;
    explanation.push(`⚠️ <1 års erfarenhet (5p)`);
  }

  // FAKTOR 4: Geography (15p) - BEHÅLL BEFINTLIG
  if (input.isRemote) {
    breakdown.geography = 15;
    explanation.push(`✅ Remote-jobb (15p)`);
  } else if (input.cvLocations.length > 0 && input.job.workplace_address?.municipality) {
    const cvCoords = getMunicipalityCoords(input.cvLocations[0]);
    const jobCoords = getMunicipalityCoords(input.job.workplace_address.municipality);
    if (cvCoords && jobCoords) {
      distance = calculateDistance(cvCoords.lat, cvCoords.lon, jobCoords.lat, jobCoords.lon);
      if (distance < 10) {
        breakdown.geography = 15;
        explanation.push(`✅ Samma stad: ${Math.round(distance)}km (15p)`);
      } else if (distance < 30) {
        breakdown.geography = 14;
        explanation.push(`✅ <30km: ${Math.round(distance)}km (14p)`);
      } else if (distance < 50) {
        breakdown.geography = 12;
        explanation.push(`⚠️ <50km: ${Math.round(distance)}km (12p)`);
      } else if (distance < 100) {
        breakdown.geography = 9;
        explanation.push(`⚠️ <100km: ${Math.round(distance)}km (9p)`);
      } else {
        breakdown.geography = 1;
        explanation.push(`❌ För långt: ${Math.round(distance)}km (1p)`);
      }
    }
  }

  // FAKTOR 5: Skills (5p)
  if (input.cvData.structuredCV?.skills && input.job.description?.text) {
    const jobText = input.job.description.text.toLowerCase();
    let matchedSkills = 0;

    // Skills kan vara antingen string[] (gammalt format) eller CVSkill[] (nytt format med {category, skills})
    (input.cvData.structuredCV.skills || []).forEach((skillItem: any) => {
      // Hantera båda formaten
      const skillsList = typeof skillItem === 'string' ? [skillItem] : (skillItem.skills || []);

      skillsList.forEach((skill: string) => {
        if (jobText.includes(skill.toLowerCase())) {
          matchedSkills++;
        }
      });
    });

    if (matchedSkills >= 3) {
      breakdown.skillsMatch = 5;
      explanation.push(`✅ ${matchedSkills} matchande kompetenser (5p)`);
    } else if (matchedSkills > 0) {
      breakdown.skillsMatch = 3;
      explanation.push(`✅ ${matchedSkills} kompetenser (3p)`);
    }
  }

  const total = Math.min(100, Math.round(
    breakdown.ssykMatch +
    breakdown.occupationMatch +
    breakdown.experienceMatch +
    breakdown.geography +
    breakdown.skillsMatch
  ));

  return { total, breakdown, explanation, distance };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function extractOccupations(cvData: any): string[] {
  const occupations: string[] = [];
  if (cvData.structuredCV?.experience) {
    cvData.structuredCV.experience.forEach((exp: any) => {
      if (exp.position) occupations.push(exp.position.toLowerCase());
    });
  }
  return [...new Set(occupations)];
}

function extractGeography(cvData: any): string[] {
  const locations: string[] = [];
  if (cvData.structuredCV?.personalInfo?.address) {
    locations.push(cvData.structuredCV.personalInfo.address);
  }
  return locations;
}

const REMOTE_KEYWORDS = ["distans", "remote", "hemarbete", "hemifrån"];

function checkIfRemote(job: any): boolean {
  const jobText = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
  return REMOTE_KEYWORDS.some(keyword => jobText.includes(keyword));
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { userId, selectedAnalysisId, customParams } = await req.json();
    if (!userId || !selectedAnalysisId) {
      return new Response(JSON.stringify({ error: 'Missing userId or selectedAnalysisId' }), { status: 400, headers: corsHeaders });
    }

    const supabase = getSupabaseClient();
    const { data: analysisData, error: analysisError } = await supabase
      .from('cv_analysis_jobs').select('result, display_name, created_at, cv_id').eq('id', selectedAnalysisId).eq('user_id', userId).single();

    if (analysisError || !analysisData) {
      return new Response(JSON.stringify({ error: 'CV analysis not found' }), { status: 404, headers: corsHeaders });
    }

    const cvData = analysisData.result;
    const cvOccupations = extractOccupations(cvData);
    const cvLocations = extractGeography(cvData);

    console.log('[Match-Jobs] Occupations:', cvOccupations);
    console.log('[Match-Jobs] Locations:', cvLocations);

    let taxonomyData = null;
    let historicalTrends = null;
    let educationMatches: string[] = [];

    if (cvOccupations[0]) {
      const cachedEnrichment = await getCachedOccupationEnrichment(cvOccupations[0]);
      if (cachedEnrichment) {
        console.log('[DB Cache] Using cached enrichment');
        taxonomyData = {
          primaryTerm: cachedEnrichment.occupation, ssykCode: cachedEnrichment.ssyk_code,
          preferredLabel: cachedEnrichment.preferred_label, alternativeLabels: cachedEnrichment.alternative_labels,
          relatedOccupations: cachedEnrichment.related_occupations, competencies: cachedEnrichment.competencies
        };
        historicalTrends = cachedEnrichment.historical_data;
      } else {
        console.log('[DB Cache] Fetching from APIs...');
        const taxonomy = await getCachedTaxonomy(cvOccupations[0]);
        taxonomyData = taxonomy;
        saveCachedOccupationEnrichment(cvOccupations[0], taxonomy, null, []).catch(err => console.error('[DB Cache] Save failed:', err));
      }
    }

    const primaryOccupation = cvOccupations[0] || '';
    const primaryLocation = cvLocations[0] || '';

    // V38: Använd pagination istället för höga limits
    console.log('[Search Strategy] Using pagination with 100 jobs/page, max 5 pages = 500 jobs');

    let jobAdLinksJobs: JobAdLinksJob[] = [];

    // Fritextsökning har prioritet om användaren har angett en
    if (customParams?.q) {
      console.log(`[Custom Search] User search query: "${customParams.q}"`);
      jobAdLinksJobs = await searchJobAdLinksWithPagination({
        q: customParams.q
      }, 5); // Max 5 sidor = 500 jobb
    } else {
      // Primär sökning med occupation/SSYK
      const primaryQuery = taxonomyData?.ssykCode
        ? `${primaryOccupation} OR ssyk:${taxonomyData.ssykCode}`
        : primaryOccupation;

      console.log(`[Primary Search] Query: "${primaryQuery}"`);
      jobAdLinksJobs = await searchJobAdLinksWithPagination({
        q: primaryQuery
      }, 5); // Max 5 sidor

      // Om vi har alternativa yrkestitlar och färre än 300 jobb, hämta mer
      if (taxonomyData?.alternativeLabels && taxonomyData.alternativeLabels.length > 0 && jobAdLinksJobs.length < 300) {
        console.log(`[Alternative Search] Fetching jobs for alternative titles...`);
        const altQuery = taxonomyData.alternativeLabels.slice(0, 3).join(' OR ');
        const altJobs = await searchJobAdLinksWithPagination({
          q: altQuery
        }, 3); // Max 3 sidor för alternativa

        // Merge och deduplicate
        const seen = new Set(jobAdLinksJobs.map(j => j.id));
        for (const job of altJobs) {
          if (!seen.has(job.id)) {
            jobAdLinksJobs.push(job);
            seen.add(job.id);
          }
        }
        console.log(`[Alternative Search] Added ${altJobs.length} jobs (${jobAdLinksJobs.length} total unique)`);
      }
    }

    const jobs = jobAdLinksJobs.map(job => convertToInternalFormat(job));
    console.log(`[Match-Jobs] Found ${jobs.length} unique jobs`);
    if (jobs.length === 0) {
      console.error('[ERROR] No jobs found from API!');
    }

    // STEG 1: Betygsätt ALLA jobb med grundläggande scoring
    // Baserat på titel, geografi, erfarenhet (ingen AI/API-anrop)
    console.log(`[Scoring] Calculating scores for all ${jobs.length} jobs...`);
    const jobsWithPreliminaryScore = jobs.map((job: any) => {
      const isRemote = checkIfRemote(job);
      const scoringInput: AdvancedScoringInput = {
        cvData, cvOccupations, cvLocations, analysisData: cvData, job,
        enrichedJob: null, // Ingen enrichment ännu
        taxonomyData, historicalTrends: null, educationMatches, isRemote
      };
      const scoringResult = calculateAdvancedRelevance(scoringInput);
      return {
        ...job,
        preliminaryRelevance: scoringResult.total,
        distance: scoringResult.distance,
        isRemote
      };
    });

    // STEG 2: Sortera alla jobb på relevans
    jobsWithPreliminaryScore.sort((a, b) => (b.preliminaryRelevance || 0) - (a.preliminaryRelevance || 0));
    const allJobs = jobsWithPreliminaryScore;
    if (allJobs.length > 0) {
      console.log(`[Scoring] All jobs sorted (best: ${allJobs[0]?.preliminaryRelevance}p, worst: ${allJobs[allJobs.length - 1]?.preliminaryRelevance}p)`);
    } else {
      console.error('[ERROR] No jobs after scoring!');
    }

    // STEG 3: Enricha alla jobb (lokal string matching för färdigheter)
    const jobIds = allJobs.map((job: any) => job.id);
    let enrichedJobsMap = await getCachedJobsBatch(jobIds);

    const uncachedJobs = allJobs.filter((job: any) => !enrichedJobsMap.has(job.id));
    if (uncachedJobs.length > 0) {
      console.log(`[Enrichment] Processing ${uncachedJobs.length} uncached jobs (string matching)...`);
      const jobsToProcess = uncachedJobs.map((job: any) => ({ id: job.id, text: `${job.headline} ${job.description?.text || ''}` }));
      const newEnrichments = await enrichJobsBatch(jobsToProcess);
      newEnrichments.forEach((enrichedData, jobId) => { enrichedJobsMap.set(jobId, enrichedData); });
      const jobHeadlines = new Map(uncachedJobs.map((job: any) => [job.id, job.headline]));
      saveCachedJobsBatch(newEnrichments, jobHeadlines).catch(err => console.error('[DB Cache] Batch save failed:', err));
    }

    // STEG 4: Ombetygsätt alla jobb med enriched data
    const jobsWithRelevance = allJobs.map((job: any) => {
      const enrichedJob = enrichedJobsMap.get(job.id) || null;
      const scoringInput: AdvancedScoringInput = {
        cvData, cvOccupations, cvLocations, analysisData: cvData, job, enrichedJob,
        taxonomyData, historicalTrends: null, educationMatches, isRemote: job.isRemote
      };
      const scoringResult = calculateAdvancedRelevance(scoringInput);
      return {
        ...job,
        relevance: scoringResult.total,
        scoringBreakdown: scoringResult.breakdown,
        scoringExplanation: scoringResult.explanation,
        enriched: enrichedJob !== null,
        distance: scoringResult.distance
      };
    });

    // STEG 5: Final sortering och returnera ALLA jobb
    jobsWithRelevance.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    if (jobsWithRelevance.length > 0) {
      console.log(`[Final Scoring] Returning ${jobsWithRelevance.length} jobs (best: ${jobsWithRelevance[0]?.relevance}p, worst: ${jobsWithRelevance[jobsWithRelevance.length - 1]?.relevance}p)`);
    } else {
      console.error('[ERROR] No jobs in final result!');
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobs: jobsWithRelevance,
        selectedAnalysis: {
          ...cvData,
          id: selectedAnalysisId,
          displayName: analysisData.display_name,
          createdAt: analysisData.created_at,
          cvId: analysisData.cv_id
        },
        searchTerms: { occupations: cvOccupations, locations: cvLocations },
        totalResults: jobsWithRelevance.length,
        municipalitiesCount: Object.keys(SWEDISH_MUNICIPALITIES).length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Match-Jobs] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
