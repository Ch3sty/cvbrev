/**
 * Intervjuprovets sju frågor (docs/design/intervjuprov-spec-2026-09-23.md,
 * utökade i docs/design/rod-trad-prov-spec-2026-09-24.md avsnitt 2).
 *
 * Klientsäker, ren data. promptFokus går bara till servern som underlag för
 * bedömningen, men står här så att frågan och det rekryteraren letar efter
 * alltid ändras tillsammans.
 *
 * Ordningen i FRAGOR är rekommendationens ordning: Nästa handling och
 * frågevalet föreslår första frågan i den här ordningen som inte gjorts.
 * Två frågor är publika (styrkor och star, de som står i artiklarna), de fem
 * andra finns bara inloggad och API:et avvisar dem för anonyma anrop.
 */

export type FragaId =
  | 'beratta'
  | 'styrkor'
  | 'varfor_vi'
  | 'varfor_jobbet'
  | 'star'
  | 'konflikt'
  | 'misstag'

export interface Fraga {
  /** Frågan som den ställs i rummet, utan citattecken. */
  text: string
  /** Listans korta namn: "Styrkor och svagheter". */
  kort: string
  /** Frågan i bestämd form efter "svaret om" och "frågan om". */
  bestamd: string
  /** En mening om frågan, under rubriken i frågevalet. */
  beskrivning: string
  platshallare: string
  /** Tipsraden under fältet. För STAR-frågorna ritas delarna som chips. */
  tips: string
  /** Vad en rekryterare letar efter i just den här frågan. */
  promptFokus: string
  /** Finns i artiklarna och går att bedöma utan konto. */
  publik: boolean
  /** Besvaras med STAR: chips i tipsraden och exakt fyra punkter i återkopplingen. */
  starChips: boolean
}

export const FRAGOR: Record<FragaId, Fraga> = {
  beratta: {
    text: 'Berätta om dig själv.',
    kort: 'Berätta om dig själv',
    bestamd: 'dig själv',
    beskrivning: 'Kommer nästan alltid först. Nuläge, två saker som gjort dig bra, varför du sitter här.',
    platshallare:
      'Skriv som du skulle säga det. Var du är i dag, två saker som gjort dig bra på det du gör, och varför du söker just nu.',
    tips: 'Ha med: var du är i dag, två saker som gjort dig bra på det du gör, och varför du sitter här.',
    promptFokus:
      'Rekryteraren letar efter en kort, strukturerad presentation med koppling till rollen, inte en genomgång av hela CV:t eller privatlivet. Ett bra svar har tre delar: nuläget (roll, arbetsplats eller situation), två saker som gjort kandidaten bra på det den gör, gärna med ett konkret exempel eller resultat, och varför kandidaten söker just den här rollen nu. Det vanligaste som saknas är kopplingen till rollen, eller att svaret är en uppräkning av egenskaper utan exempel.',
    publik: false,
    starChips: false,
  },
  styrkor: {
    text: 'Vilka är dina styrkor och svagheter?',
    kort: 'Styrkor och svagheter',
    bestamd: 'styrkor och svagheter',
    beskrivning: 'Självinsikt och relevans. En styrka med bevis, en svaghet med plan.',
    platshallare:
      'Skriv som du skulle säga det. En styrka med ett exempel, en svaghet och vad du gör åt den.',
    tips: 'Ha med: en styrka med ett konkret exempel, en svaghet och vad du gör åt den.',
    promptFokus:
      'Rekryteraren letar efter självinsikt och relevans. En bra styrka är namngiven och bevisad med ett konkret exempel, gärna med en siffra eller ett tydligt utfall, och hänger ihop med vad rollen kräver. En bra svaghet är genuin men hanterbar, inte en kärnkompetens i rollen och inte en klyscha som "perfektionist" eller "jobbar för hårt". Den har ett exempel på när den märkts och en konkret plan för vad kandidaten gör åt den. Det vanligaste som saknas är planen för svagheten eller exemplet för styrkan.',
    publik: true,
    starChips: false,
  },
  varfor_vi: {
    text: 'Varför ska vi anställa just dig?',
    kort: 'Varför ska vi anställa dig',
    bestamd: 'varför vi ska anställa dig',
    beskrivning: 'Två krav ur annonsen, ett bevis per krav, och det du ger som inte står där.',
    platshallare:
      'Skriv som du skulle säga det. Två krav ur annonsen och hur du visat att du klarar dem, och vad du ger utöver det.',
    tips: 'Ha med: två krav ur annonsen med ett bevis var, och det du ger som inte står i annonsen.',
    promptFokus:
      'Rekryteraren jämför kandidaten med de andra i urvalet och letar efter en tydlig matchning mot kravprofilen. Ett bra svar tar två konkreta krav ur annonsen och ger ett bevis per krav, ett exempel eller resultat från kandidatens egen erfarenhet, och avslutar med något kandidaten tillför som inte står i annonsen. Det vanligaste som saknas är bevisen (bara påståenden som "jag är driven") eller kopplingen till just den här rollen.',
    publik: false,
    starChips: false,
  },
  varfor_jobbet: {
    text: 'Varför söker du det här jobbet?',
    kort: 'Varför söker du jobbet',
    bestamd: 'varför du söker jobbet',
    beskrivning: 'Vad i rollen som lockar, vad i företaget, och vad du lämnar utan att tala illa om det.',
    platshallare:
      'Skriv som du skulle säga det. Vad i rollen som lockar, vad i företaget, och vad du lämnar.',
    tips: 'Ha med: vad i rollen som lockar, vad i företaget, och vad du lämnar, utan att tala illa om det.',
    promptFokus:
      'Rekryteraren letar efter motivation som är specifik för rollen och arbetsgivaren, inte allmän jobbsökarlust. Ett bra svar nämner något konkret i rollen som lockar och hänger ihop med kandidatens erfarenhet, något konkret om arbetsgivaren (verksamhet, uppdrag, arbetssätt) och vad kandidaten lämnar, sagt framåtblickande utan att tala illa om nuvarande eller tidigare arbetsgivare. Det vanligaste som saknas är kopplingen till just den här arbetsgivaren, eller att svaret handlar om lön, pendling eller att komma bort från något.',
    publik: false,
    starChips: false,
  },
  star: {
    text: 'Berätta om en gång då du löste ett problem som ingen annan tog tag i.',
    kort: 'Ett problem du löste',
    bestamd: 'ett problem du löste',
    beskrivning: 'Kompetensbaserad fråga, svaras med STAR. Initiativ, eget ansvar, resultat.',
    platshallare:
      'Skriv som du skulle säga det. Vad var läget, vad var din uppgift, vad gjorde du och vad blev resultatet.',
    tips: 'Ha med:',
    promptFokus:
      'Frågan är kompetensbaserad och besvaras bäst med STAR: Situation (kort och konkret), Uppgift (varför det blev kandidatens sak), Handling (vad kandidaten själv gjorde, i jag-form, steg för steg, den längsta delen) och Resultat (ett tydligt utfall, gärna mätbart, och gärna en lärdom). Rekryteraren letar efter initiativförmåga, problemlösning och eget ansvar. Det vanligaste som saknas är resultatet, eller att handlingen beskrivs i vi-form så att kandidatens eget bidrag inte syns.',
    publik: true,
    starChips: true,
  },
  konflikt: {
    text: 'Berätta om en konflikt med en kollega och hur du hanterade den.',
    kort: 'En konflikt',
    bestamd: 'en konflikt med en kollega',
    beskrivning: 'STAR igen. Rekryteraren lyssnar efter att du tog samtalet, inte vem som hade rätt.',
    platshallare:
      'Skriv som du skulle säga det. Vad var läget, vad stod på spel, vad gjorde du och hur slutade det.',
    tips: 'Ha med:',
    promptFokus:
      'Frågan är kompetensbaserad och besvaras bäst med STAR: Situation (vad oenigheten gällde, kort), Uppgift (varför kandidaten behövde ta tag i den), Handling (vad kandidaten själv gjorde, i jag-form: tog samtalet, lyssnade, föreslog en väg framåt) och Resultat (hur det slutade för arbetet och relationen). Rekryteraren lyssnar efter samarbetsförmåga och att kandidaten tog ansvar för samtalet, inte vem som hade rätt. Det vanligaste som saknas är kandidatens egen handling, att svaret skuldbelägger kollegan, eller resultatet för relationen.',
    publik: false,
    starChips: true,
  },
  misstag: {
    text: 'Berätta om ett misstag du gjort på jobbet.',
    kort: 'Ett misstag',
    bestamd: 'ett misstag du gjort',
    beskrivning: 'Misstaget rakt ut, vad du gjorde direkt, och vad du ändrade efteråt.',
    platshallare:
      'Skriv som du skulle säga det. Vad som gick fel, vad du gjorde direkt, och vad du gör annorlunda i dag.',
    tips: 'Ha med: misstaget rakt ut, vad du gjorde direkt, och vad du ändrade efteråt.',
    promptFokus:
      'Rekryteraren letar efter ansvarstagande och lärande. Ett bra svar beskriver ett verkligt misstag rakt ut utan att förminska det eller skylla på andra, vad kandidaten gjorde direkt för att rätta till det, och vad kandidaten ändrade i sitt arbetssätt efteråt, gärna med ett exempel på att ändringen fungerat. Misstaget ska vara verkligt men inte röra en kärnkompetens i rollen på ett sätt som väcker oro. Det vanligaste som saknas är vad kandidaten ändrade efteråt, eller att misstaget är ett förklätt beröm.',
    publik: false,
    starChips: false,
  },
}

/** Frågorna i rekommendationens ordning. */
export const FRAGA_ORDNING = Object.keys(FRAGOR) as FragaId[]

/** Frågorna som går att bedöma utan konto. */
export const PUBLIKA_FRAGOR: readonly FragaId[] = FRAGA_ORDNING.filter((id) => FRAGOR[id].publik)

/** STAR-delarna, i ordning. Chips i tipsraden och rubriker på dashboardsidan. */
export const STAR_DELAR = ['Situation', 'Uppgift', 'Handling', 'Resultat'] as const

export function arFragaId(v: unknown): v is FragaId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(FRAGOR, v)
}

export function arPublikFraga(v: unknown): v is FragaId {
  return arFragaId(v) && FRAGOR[v].publik
}
