/**
 * Scoring Engine V2
 *
 * Förbättrad scoring-algoritm med 6 faktorer (max 100 poäng):
 * 1. SSYK-match (35p) - Exakt eller relaterad SSYK-kod
 * 2. Yrkestitel (20p) - Inkl. synonymer från taxonomy
 * 3. Erfarenhet (15p) - CV-erfarenhet vs jobbkrav
 * 4. Kompetenser (15p) - AI-matchade från enrichments
 * 5. Geografi (10p) - Avstånd eller remote
 * 6. Utbildning (5p) - Utbildningsnivå vs krav
 */

import { EnrichedJobData } from './ai-enrichment.ts';
import { TaxonomyData } from './taxonomy-enhanced.ts';

export interface ScoringInput {
  cvData: any;
  cvOccupations: string[];
  cvLocations: string[];
  taxonomyData: TaxonomyData | null;
  job: any;
  enrichedJob: EnrichedJobData | null;
}

export interface ScoringResult {
  total: number;
  breakdown: {
    ssykMatch: number;          // 0-35p
    occupationMatch: number;    // 0-20p
    experienceMatch: number;    // 0-15p
    competenciesMatch: number;  // 0-15p
    geography: number;          // 0-10p
    educationMatch: number;     // 0-5p
  };
  explanation: string[];
  distance?: number;
}

// ALLA SVERIGES 290 KOMMUNER MED KOORDINATER
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

const REMOTE_KEYWORDS = ["distans", "remote", "hemarbete", "hemifrån"];

export class ScoringEngineV2 {
  /**
   * Huvudfunktion: Beräkna total score för ett jobb
   */
  calculateScore(input: ScoringInput): ScoringResult {
    const breakdown = {
      ssykMatch: 0,
      occupationMatch: 0,
      experienceMatch: 0,
      competenciesMatch: 0,
      geography: 0,
      educationMatch: 0
    };
    const explanation: string[] = [];
    let distance: number | undefined;

    // ============================================================================
    // FAKTOR 1: SSYK/Occupation-match (35p)
    // ============================================================================
    // NYTT: Prioritera JobAd Links occupation_field data över AI enrichment
    // JobAd Links har redan strukturerad occupation data direkt från källan

    // STRATEGI 1A: JobAd Links occupation_field match (högsta prioritet - 35p)
    if (input.taxonomyData?.conceptId && input.job.occupation_field?.concept_id) {
      if (input.job.occupation_field.concept_id === input.taxonomyData.conceptId) {
        breakdown.ssykMatch = 35;
        explanation.push(`✅ Exakt occupation-field match (JobAd Links): ${input.job.occupation_field.label} (35p)`);
      }
    }

    // STRATEGI 1B: JobAd Links occupation_group match (bredare - 25p)
    if (breakdown.ssykMatch === 0 && input.taxonomyData?.occupationGroupId && input.job.occupation_group?.concept_id) {
      if (input.job.occupation_group.concept_id === input.taxonomyData.occupationGroupId) {
        breakdown.ssykMatch = 25;
        explanation.push(`✅ Occupation-group match (JobAd Links): ${input.job.occupation_group.label} (25p)`);
      }
    }

    // STRATEGI 1C: SSYK-match från AI enrichment (fallback - används bara om JobAd Links data saknas)
    if (breakdown.ssykMatch === 0 && input.taxonomyData?.ssykCode && input.enrichedJob?.occupations) {
      // Exakt match: samma 4-siffrig SSYK-kod från AI enrichment
      for (const jobOcc of input.enrichedJob.occupations) {
        if (jobOcc.ssyk_code === input.taxonomyData.ssykCode) {
          const confidence = jobOcc.weight || 0.5;
          const weightedScore = Math.round(30 * confidence); // Något lägre än JobAd Links (30p vs 35p)
          breakdown.ssykMatch = weightedScore;
          explanation.push(`✅ Exakt SSYK-match (AI): ${input.taxonomyData.ssykCode} (${weightedScore}p, confidence: ${(confidence * 100).toFixed(0)}%)`);
          break;
        }
      }

      // Partiell match: samma 3-siffrig SSYK-kod (yrkesgrupp)
      if (breakdown.ssykMatch === 0) {
        const userSSYK3 = input.taxonomyData.ssykCode.substring(0, 3);
        for (const jobOcc of input.enrichedJob.occupations) {
          if (jobOcc.ssyk_code?.substring(0, 3) === userSSYK3) {
            const confidence = jobOcc.weight || 0.5;
            const weightedScore = Math.round(20 * confidence);
            breakdown.ssykMatch = weightedScore;
            explanation.push(`✅ Samma yrkesgrupp (AI SSYK-3): ${userSSYK3} (${weightedScore}p, confidence: ${(confidence * 100).toFixed(0)}%)`);
            break;
          }
        }
      }
    }

    // ============================================================================
    // FAKTOR 2: Yrkestitel-matchning (20p)
    // ============================================================================
    if (input.cvOccupations.length > 0) {
      const cvOccupation = input.cvOccupations[0].toLowerCase();
      const jobOccupation = (input.job.occupation?.label || '').toLowerCase();
      const jobHeadline = (input.job.headline || '').toLowerCase();

      if (jobOccupation === cvOccupation) {
        breakdown.occupationMatch = 20;
        explanation.push(`✅ Exakt yrkestitel: ${input.job.occupation?.label} (20p)`);
      } else if (jobOccupation.includes(cvOccupation) || cvOccupation.includes(jobOccupation)) {
        breakdown.occupationMatch = 16;
        explanation.push(`✅ Liknande yrkestitel (16p)`);
      } else if (jobHeadline.includes(cvOccupation)) {
        breakdown.occupationMatch = 12;
        explanation.push(`✅ Yrke i rubrik (12p)`);
      }

      // Kolla synonymer från taxonomy
      if (breakdown.occupationMatch === 0 && input.taxonomyData?.alternativeLabels) {
        for (const synonym of input.taxonomyData.alternativeLabels) {
          if (jobOccupation.includes(synonym.toLowerCase()) || jobHeadline.includes(synonym.toLowerCase())) {
            breakdown.occupationMatch = 14;
            explanation.push(`✅ Synonym-match: ${synonym} (14p)`);
            break;
          }
        }
      }

      // Yrkesgrupp som fallback
      if (breakdown.occupationMatch === 0 && input.job.occupation_group?.label) {
        const jobGroup = input.job.occupation_group.label.toLowerCase();
        if ((jobGroup.includes('chef') && cvOccupation.includes('chef')) ||
            (jobGroup.includes('handel') && (cvOccupation.includes('butik') || cvOccupation.includes('försälj')))) {
          breakdown.occupationMatch = 8;
          explanation.push(`✅ Samma yrkesgrupp: ${input.job.occupation_group.label} (8p)`);
        }
      }
    }

    // ============================================================================
    // FAKTOR 3: Erfarenhet (15p)
    // ============================================================================
    const yearsExperience = this.calculateRelevantExperience(input);

    if (yearsExperience >= 10) {
      breakdown.experienceMatch = 15;
      explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (15p)`);
    } else if (yearsExperience >= 5) {
      breakdown.experienceMatch = 13;
      explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (13p)`);
    } else if (yearsExperience >= 3) {
      breakdown.experienceMatch = 10;
      explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (10p)`);
    } else if (yearsExperience >= 1) {
      breakdown.experienceMatch = 7;
      explanation.push(`✅ ${Math.floor(yearsExperience)} års erfarenhet (7p)`);
    } else if (yearsExperience > 0) {
      breakdown.experienceMatch = 3;
      explanation.push(`⚠️ <1 års erfarenhet (3p)`);
    }

    // ============================================================================
    // FAKTOR 4: Kompetenser (15p) - NY VIKTAD FAKTOR
    // ============================================================================
    if (input.enrichedJob?.skills && input.cvData.structuredCV?.skills) {
      const matchedSkills = this.matchSkills(
        input.cvData.structuredCV.skills,
        input.enrichedJob.skills
      );

      if (matchedSkills >= 5) {
        breakdown.competenciesMatch = 15;
        explanation.push(`✅ ${matchedSkills} matchande kompetenser (15p)`);
      } else if (matchedSkills >= 3) {
        breakdown.competenciesMatch = 12;
        explanation.push(`✅ ${matchedSkills} kompetenser (12p)`);
      } else if (matchedSkills >= 2) {
        breakdown.competenciesMatch = 8;
        explanation.push(`✅ ${matchedSkills} kompetenser (8p)`);
      } else if (matchedSkills >= 1) {
        breakdown.competenciesMatch = 4;
        explanation.push(`✅ ${matchedSkills} kompetens (4p)`);
      }
    }

    // ============================================================================
    // FAKTOR 5: Geografi (10p) - JUSTERAD VIKTNING
    // ============================================================================
    const isRemote = this.checkIfRemote(input.job);

    if (isRemote) {
      breakdown.geography = 10;
      explanation.push(`✅ Remote-jobb (10p)`);
    } else if (input.cvLocations.length > 0 && input.job.workplace_address?.municipality) {
      const result = this.calculateGeographyScore(input.cvLocations[0], input.job.workplace_address.municipality);
      breakdown.geography = result.score;
      distance = result.distance;
      if (result.explanation) {
        explanation.push(result.explanation);
      }
    }

    // ============================================================================
    // FAKTOR 6: Utbildning (5p) - NY FAKTOR
    // ============================================================================
    if (input.enrichedJob?.education_level && input.cvData.structuredCV?.education) {
      const cvEducationLevel = this.getHighestEducationLevel(input.cvData.structuredCV.education);
      const jobRequiredLevel = input.enrichedJob.education_level.level;

      const educationScore = this.compareEducationLevels(cvEducationLevel, jobRequiredLevel);

      if (educationScore >= 1.0) {
        breakdown.educationMatch = 5;
        explanation.push(`✅ Utbildningsnivå matchar eller överträffar krav (5p)`);
      } else if (educationScore >= 0.8) {
        breakdown.educationMatch = 3;
        explanation.push(`✅ Liknande utbildningsnivå (3p)`);
      } else if (educationScore >= 0.5) {
        breakdown.educationMatch = 1;
        explanation.push(`⚠️ Lägre utbildningsnivå än krav (1p)`);
      }
    }

    // ============================================================================
    // Beräkna total score
    // ============================================================================
    const total = Math.min(
      100,
      Math.round(
        breakdown.ssykMatch +
        breakdown.occupationMatch +
        breakdown.experienceMatch +
        breakdown.competenciesMatch +
        breakdown.geography +
        breakdown.educationMatch
      )
    );

    return { total, breakdown, explanation, distance };
  }

  /**
   * Beräkna relevant erfarenhet för jobbet
   */
  private calculateRelevantExperience(input: ScoringInput): number {
    let totalYears = 0;

    if (!input.cvData.structuredCV?.experience) return 0;

    const jobOccupation = (input.job.occupation?.label || '').toLowerCase();

    for (const exp of input.cvData.structuredCV.experience) {
      const position = (exp.position || '').toLowerCase();

      // Kolla om erfarenheten är relevant
      const isRelevant =
        position.includes(jobOccupation) ||
        jobOccupation.includes(position) ||
        (position.includes('chef') && jobOccupation.includes('chef')) ||
        (position.includes('butik') && jobOccupation.includes('butik')) ||
        (position.includes('vvs') && jobOccupation.includes('vvs'));

      if (isRelevant) {
        try {
          const parseDate = (dateStr: string) => {
            const parts = dateStr.split('/');
            if (parts.length === 2) {
              return new Date(parseInt(parts[1]), parseInt(parts[0]) - 1);
            }
            return null;
          };

          const startDate = parseDate(exp.startDate);
          const endDate = exp.endDate ? parseDate(exp.endDate) : new Date();

          if (startDate && endDate) {
            const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
            totalYears += years;
          }
        } catch {
          // Skip om datum inte kan parsas
        }
      }
    }

    return totalYears;
  }

  /**
   * Matcha kompetenser mellan CV och jobb
   */
  private matchSkills(cvSkills: any[], jobSkills: Array<{ term: string; weight: number }>): number {
    const cvSkillSet = new Set<string>();

    // Extrahera alla CV-skills
    for (const skillItem of cvSkills) {
      if (typeof skillItem === 'string') {
        cvSkillSet.add(skillItem.toLowerCase());
      } else if (skillItem.skills) {
        for (const skill of skillItem.skills) {
          cvSkillSet.add(skill.toLowerCase());
        }
      }
    }

    // Räkna matchningar
    let matches = 0;
    for (const jobSkill of jobSkills) {
      const term = jobSkill.term.toLowerCase();
      if (cvSkillSet.has(term)) {
        matches++;
      }
    }

    return matches;
  }

  /**
   * Beräkna geografisk score
   */
  private calculateGeographyScore(userLocation: string, jobLocation: string): {
    score: number;
    distance?: number;
    explanation?: string;
  } {
    const userCoords = this.getMunicipalityCoords(userLocation);
    const jobCoords = this.getMunicipalityCoords(jobLocation);

    if (!userCoords || !jobCoords) {
      return { score: 5 }; // Default score om koordinater saknas
    }

    const distance = this.calculateDistance(
      userCoords.lat, userCoords.lon,
      jobCoords.lat, jobCoords.lon
    );

    if (distance < 10) {
      return { score: 10, distance, explanation: `✅ Samma stad: ${Math.round(distance)}km (10p)` };
    } else if (distance < 30) {
      return { score: 9, distance, explanation: `✅ <30km: ${Math.round(distance)}km (9p)` };
    } else if (distance < 50) {
      return { score: 7, distance, explanation: `⚠️ <50km: ${Math.round(distance)}km (7p)` };
    } else if (distance < 100) {
      return { score: 4, distance, explanation: `⚠️ <100km: ${Math.round(distance)}km (4p)` };
    } else {
      return { score: 1, distance, explanation: `❌ För långt: ${Math.round(distance)}km (1p)` };
    }
  }

  /**
   * Hitta högsta utbildningsnivå i CV
   */
  private getHighestEducationLevel(educations: any[]): string {
    const levels = ['universitet', 'eftergymnasial', 'gymnasial', 'grundskola'];

    for (const education of educations) {
      const degree = (education.degree || '').toLowerCase();
      const institution = (education.institution || '').toLowerCase();

      if (degree.includes('doktor') || degree.includes('phd')) return 'doktor';
      if (degree.includes('master') || degree.includes('magister')) return 'universitet';
      if (degree.includes('kandidat') || degree.includes('högskola') || institution.includes('universitet')) return 'universitet';
      if (degree.includes('yrkeshögskola') || degree.includes('komvux')) return 'eftergymnasial';
      if (degree.includes('gymnasie')) return 'gymnasial';
    }

    return 'gymnasial'; // Default
  }

  /**
   * Jämför utbildningsnivåer (returnerar 0-1)
   */
  private compareEducationLevels(cvLevel: string, requiredLevel: string): number {
    const levelRanking: Record<string, number> = {
      'grundskola': 1,
      'gymnasial': 2,
      'eftergymnasial': 3,
      'universitet': 4,
      'doktor': 5
    };

    const cvRank = levelRanking[cvLevel] || 2;
    const reqRank = levelRanking[requiredLevel] || 2;

    if (cvRank >= reqRank) return 1.0;
    if (cvRank === reqRank - 1) return 0.8;
    return 0.5;
  }

  /**
   * Kolla om jobbet är remote
   */
  private checkIfRemote(job: any): boolean {
    const text = `${job.headline} ${job.description?.text || ''}`.toLowerCase();
    return REMOTE_KEYWORDS.some(keyword => text.includes(keyword));
  }

  /**
   * Hämta koordinater för kommun
   */
  private getMunicipalityCoords(location: string): { lat: number; lon: number } | null {
    if (!location) return null;
    const normalized = location.toLowerCase().trim();

    for (const [city, coords] of Object.entries(SWEDISH_MUNICIPALITIES)) {
      if (normalized.includes(city)) return coords;
    }

    return null;
  }

  /**
   * Beräkna avstånd mellan två koordinater (Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
