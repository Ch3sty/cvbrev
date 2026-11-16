/**
 * Kontraktet för det nya mallsystemet (docs/plan-mallar-2026-11-15.md
 * avsnitt 3.1 och 3.4, svepet 2026-11-16).
 *
 * En mall är en definition (MallDef, src/lib/cv/mallar/typer.ts). Samma
 * definition ger förhandsvisningen, PDF:en och, när mallen har Word,
 * Word-filen. Rubrikerna kommer ur rubrikmodellen (src/lib/cv/rubriker.ts),
 * innehållet ur CV:t och valen nedan gäller i alla mallar.
 *
 * Den här filen är gränsen mellan mallsystemet och komponenterna: allt som
 * komponenterna (mallväljaren, dokumentet, arken, finalen) behöver veta om
 * en mall står här, och inget mer. Klientsäker: ren data och typer, ingen
 * renderare, inget register med CSS.
 */

/** Avsnitten i ett CV. Ordningen här är standardordningen. */
export const SEKTIONER = [
  'profil',
  'erfarenhet',
  'utbildning',
  'kompetenser',
  'intyg',
  'sprak',
  'projekt',
  'intressen',
  'referenser',
] as const
export type Sektion = (typeof SEKTIONER)[number]

/** Sektionsordningen som val (skissen "Val som fungerar i alla mallar"). */
export type Ordning = 'standard' | 'intyg' | 'utbildning' | 'kompetenser'

export type Niva = 'gratis' | 'premium'

/**
 * Formfamiljen, för gruppering i "Alla"-arket och filtret Två spalter.
 * en-spalt: allt i en spalt. marginal: rubriker eller perioder i en
 * vänstermarginal. sidospalt: två spalter, en smal panel. konstnarlig: fri
 * form (oftast bara PDF).
 */
export type Familj = 'en-spalt' | 'marginal' | 'sidospalt' | 'konstnarlig'

/** Typsnitten i verktygsraden (src/lib/cv/preview-utils.ts). */
export type TypsnittId =
  | 'calibri'
  | 'arial'
  | 'verdana'
  | 'georgia'
  | 'garamond'
  | 'times'
  | 'lato'
  | 'open-sans'
  | 'roboto'
  | 'poppins'
  | 'helvetica'

/**
 * Valen som gäller i alla mallar. Tomt fält betyder mallens förval (eller
 * rubrikmodellens förval för rubrikerna).
 */
export interface MallVal {
  ordning?: Ordning
  /** Tätare marginaler och mindre grad i samma mall. */
  enSida?: boolean
  /**
   * Tillägg 2026-11-16 (byggagent A): steget 1 till 4 i "Få plats på en
   * sida" (src/lib/cv/mallar/farg.ts, matt). Sätts av servern när PDF-kedjan
   * har provat sig fram; komponenterna skickar bara enSida.
   */
  enSidaSteg?: 1 | 2 | 3 | 4 | 5
  /** Index 0 till 3 i mallens fyra accentfärger. */
  farg?: number
  /** Ersätter brödtextens typsnitt (namn och rubriker behåller mallens om mallen säger så). */
  typsnitt?: TypsnittId
  /** Foto på eller av, bara i mallar med fotoplats. */
  foto?: boolean
  /** Rubrikerna som CV:t har valt (cv_texts.section_titles). Saknade avsnitt får förvalet. */
  rubriker?: Partial<Record<Sektion, string>>
  /** Rubrikuppsättningen (yrkesområde) när rubrikerna inte är valda, t.ex. från en yrkessida. */
  uppsattning?: string
}

/** Det komponenterna vet om en mall. Liten nog att skickas som props. */
export interface MallKort {
  id: string
  namn: string
  niva: Niva
  familj: Familj
  /** Stilen i en rad ("Centrerat namn, tunna linjer"). */
  stil: string
  /** Vad som skiljer, högst fyra ord ("Färgad sidopanel"), för merförsäljningen. */
  kort: string
  /** Kortet när CV:t saknar foto, för fotomallarna (utbudsspecen avsnitt 6). Saknas: använd kort. */
  kortUtanFoto?: string
  /** Finns som Word-fil. */
  word: boolean
  /** Har fotoplats (fotoknappen syns bara då). */
  foto: boolean
  /** Fyra accentfärger, mallens egen först. */
  accenter: readonly [string, string, string, string]
  /** Miniatyrerna (webp) i två storlekar, renderade vid bygge ur definitionen. */
  bild: { liten: string; stor: string }
  /**
   * Tillägg 2026-11-16 (byggagent A): mallens brödtextstypsnitt, förvalt i
   * verktygsraden (och i Word-filen när mallen har Word). Användarens val
   * ersätter bara brödtexten; namn och rubriker behåller mallens typsnitt.
   */
  typsnitt?: TypsnittId
}

/** Formatet på filen. */
export type Format = 'pdf' | 'docx'
