/**
 * Kontraktet mellan brevets data (motorn), brevmallen (arket) och vyerna i
 * brevrummet (skissen "Personliga brev, omgång 1", 2026-11-21).
 *
 * Brevet lagras som text och val var för sig: stycken, hälsning, mall och
 * typsnitt. Mallen ritar arket av BrevData. Ingen vy och ingen rutt bygger
 * brevets HTML själv, och ingen AI-generering behövs för att byta mall,
 * typsnitt eller ändra texten.
 *
 * Klientsäker: bara typer och ren data.
 */

export type BrevSprak = 'sv' | 'en'

/** Avsändaren, ur profilen. Sätts in efter genereringen, aldrig i ett AI-anrop. */
export interface BrevAvsandare {
  namn: string
  /** Yrkestiteln under namnet, om profilen eller CV:t har en. */
  titel?: string | null
  epost: string
  telefon?: string | null
  ort?: string | null
}

export interface BrevMottagare {
  foretag: string | null
  /** Namngiven mottagare, t.ex. "Maria Ekström, rekryterande chef". */
  person?: string | null
}

export interface BrevData {
  avsandare: BrevAvsandare
  mottagare: BrevMottagare
  /** Tjänsten, utan "Ansökan:". Mallen skriver ärenderaden efter språk. */
  tjanst: string | null
  /** ISO-datum, ÅÅÅÅ-MM-DD. Mallen formaterar efter språk ("21 november 2026"). */
  datum: string
  /** Hälsningsraden, t.ex. "Hej Maria,". Null ger mallens förval efter språk. */
  halsning: string | null
  /** Brödtextens stycken som ren text, i ordning. Aldrig HTML. */
  stycken: string[]
  sprak: BrevSprak
}

/** Ett krav ur annonsen och meningen i brevet som svarar på det. */
export interface BrevKrav {
  /** Kravet i annonsens ord, versal först, högst 40 tecken. */
  krav: string
  /** Ordagrant utdrag ur brevets stycken, eller null när brevet saknar svar. */
  citat: string | null
}

/** Valen som inte ändrar texten. */
export interface BrevVal {
  /** Typsnittets id (FontSelector), null = mallens eget. */
  typsnitt?: string | null
  /** Accentfärg ur mallens fyra, null = mallens förval. */
  accent?: string | null
}

/** Det vyerna vet om en brevmall. Samma id, namn och nivå som CV-mallen. */
export interface BrevMallKort {
  id: string
  namn: string
  niva: 'gratis' | 'premium'
  /** Finns som Word-fil. */
  word: boolean
  /** En rad om utseendet. */
  kort: string
  familj: string
}

/** Vad renderaren kan märka ut på arket. */
export interface BrevRenderVal {
  /** Kraven som ska märkas i texten: citatet får data-krav="n" (1-baserat). */
  markeringar?: BrevKrav[]
  /** Visa bara de n första styckena, med skrivmarkör efter det sista (skrivläget). */
  skriverTill?: number
  /** Stycket som redigeras just nu (0-baserat) får data-aktivt. */
  aktivtStycke?: number | null
}

/** Brevets läge på vägen annonsen, brevet, läs igenom, skickat. */
export type BrevSteg = 'annonsen' | 'brevet' | 'las-igenom' | 'skickat'
