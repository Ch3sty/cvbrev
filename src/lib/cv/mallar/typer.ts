/**
 * MallDef: en mall är en definition (docs/plan-mallar-2026-11-15.md avsnitt
 * 3.4, docs/design/mallar-utbud-2026-11-16.md avsnitt 4). Samma definition
 * ger förhandsvisningen och PDF:en (render/html.ts) och, när `word` är sant,
 * Word-filen (src/lib/cv/word/).
 *
 * Vokabulären täcker utbudets variation: huvudet vänster, centrerat,
 * högerställt, som färgat band, som färgad namnruta eller som tidningshuvud;
 * rubriker med linje under, över, kort linje, vänsterstapel, tonat band
 * eller kvadrat före, centrerade eller indragna; avsnitt i en spalt, med
 * rubriken eller perioden i en vänstermarginal, i två spalter utan panel
 * eller med sidospalt; kompetenser som grupper, mittpunktsrad, lista,
 * spalter, brickor eller i marginalen; foto runt eller kvadratiskt. De
 * konstnärliga mallarna (word: false) får dessutom egen CSS i `extraCss`.
 *
 * Enheter: mått i millimeter (mm), grader och linjer i punkter (pt),
 * spärrning i em, färger som hex med # ("#1f2937"). En färg kan också vara
 * en referens som löses per val (farg.ts):
 *   'accent'  mallens valda accent (en av de fyra, MallVal.farg),
 *   'ton'     accenten mycket ljus (`tonAndel` mot vitt, förval 0,86),
 *   'text', 'dampad', 'linje'  mallens egna färger, 'vit' vitt.
 *
 * Kortfälten (namn, nivå, familj, stil, kort, word, accenter) står i
 * katalogen (katalog.ts); definitionen hämtar dem med `franKatalog(id)`.
 */
import type { Familj, Niva, Ordning, Sektion, TypsnittId } from './kontrakt'

export type Hex = `#${string}`

/** En färg: hex eller en referens (se filens överdel). */
export type Farg = Hex | 'accent' | 'ton' | 'text' | 'dampad' | 'linje' | 'vit'

/** En linje: färg och tjocklek i punkter. */
export interface Linje {
  farg: Farg
  pt: number
}

export type Vikt = 300 | 400 | 500 | 600 | 700

/** Hur en textrad ser ut: vikt, versaler, kursiv, spärrning (em), färg. */
export interface TextStil {
  vikt?: Vikt
  versaler?: boolean
  kursiv?: boolean
  /** Spärrning i em. ATS-gränsen är 0,16 em; renderaren klipper där. */
  sparrning?: number
  farg?: Farg
}

export interface MallTypsnitt {
  /** Brödtextens typsnitt. Användarens typsnittsval ersätter bara det här. */
  brod: TypsnittId
  /** Namnets och rubrikernas typsnitt. Saknas: samma som mallens brödtext. Byts aldrig av användaren. */
  rubrik?: TypsnittId
}

/** Grader i punkter. */
export interface MallGrader {
  brod: number
  namn: number
  titel: number
  kontakt: number
  rubrik: number
  posttitel: number
  /** Perioden och andra småuppgifter. */
  period: number
  /** Brödtext i sidospalten. Saknas: brod. */
  sidospalt?: number
}

export interface MallFarger {
  /** Brödtextens färg. */
  text: Hex
  /** Dämpad text: perioder, kontakt. */
  dampad: Hex
  /** Hårlinjer. */
  linje: Hex
  /** Arbetsgivarens färg. Förval 'dampad'. */
  arbetsgivare?: Farg
  /** Posttitelns färg. Förval 'text'. */
  posttitel?: Farg
  /** Periodens färg. Förval 'dampad'. */
  period?: Farg
  /** Papperets färg (Terrakotta). Förval vitt. Bara PDF. */
  sida?: Hex
  /** Andelen vitt i den ljusa tonen (0,86 ger accent 14 procent). */
  tonAndel?: number
}

export interface HuvudBand {
  bakgrund: Farg
  /** Textfärgen på bandet. */
  text: Farg
  /** Inre luft, mm. Topp mäts från papperskanten (bandet går ut i kanten i PDF). */
  luft: { topp: number; sidor: number; botten: number }
  /** Lägsta höjd, mm. Bandet växer med ett långt namn. */
  minHojd?: number
}

export interface MallHuvud {
  /**
   * vanster, centrerad, hoger: texten i den justeringen.
   * band: färgat band i full bredd (Koppar, Granit, Mörkrum), text vänster, fotot höger.
   * block-vanster: namnet i en färgad ruta, titel och kontakt till höger (Kvadrat).
   * tidningshuvud: linje över, namnet centrerat, daterad rad med titel och kontakt (Tidning).
   */
  form: 'vanster' | 'centrerad' | 'hoger' | 'band' | 'block-vanster' | 'tidningshuvud'
  namn: TextStil & { radavstand?: number }
  titel: TextStil
  /** Kontakten som rad med " · " eller som lista (en uppgift per rad). */
  kontakt: 'rad' | 'lista'
  /** Luft mellan namn och titel, mm. */
  luftTitel: number
  /** Luft mellan titel och kontakt, mm. */
  luftKontakt: number
  /** Linje under huvudet. `dubbel` ritar två linjer med glipa (Antikva). */
  linjeUnder?: Linje & { luft: number; dubbel?: boolean }
  /** Stapel till vänster om huvudtexten (Fasad), med indrag i mm. */
  stapel?: Linje & { indrag: number }
  band?: HuvudBand
  /** Namnrutan i 'block-vanster'. */
  block?: { storlek: number; bakgrund: Farg; text: Farg; luft: number }
  /** Luft under huvudet innan första avsnittet, mm. */
  luftUnder: number
}

export interface MallRubrik extends TextStil {
  justering?: 'vanster' | 'centrerad'
  /**
   * Linjen kring rubriken: under, över eller en stapel till vänster.
   * `langd` (mm) ger en kort linje (Terrakotta, Tusch). `luft` är avståndet
   * mellan text och linje, mm.
   */
  linje?: Linje & { var: 'under' | 'over' | 'vanster'; luft: number; langd?: number }
  /** Tonat band bakom rubriken (Raster). */
  band?: { bakgrund: Farg; lodratt: number; sidor: number }
  /** Liten kvadrat före rubriken (Mörkrum). */
  kvadrat?: { mm: number; farg: Farg; luft: number }
  /** Rubriken indragen, mm (i linje med en innehållskolumn). */
  indrag?: number
  /** Luft ovanför ett avsnitt, mm. */
  luftOver: number
  /** Luft mellan rubrik och innehåll, mm. */
  luftUnder: number
}

/** En spalt med sina avsnitt. */
export interface MallSidospalt {
  sida: 'vanster' | 'hoger'
  /** Bredd från papperskanten, mm (yttermarginalen ligger inne i spalten). */
  bredd: number
  bakgrund?: Farg
  text?: Farg
  /** Rubrikernas färg och linje i spalten. */
  rubrik?: TextStil & { pt?: number; linje?: Linje & { luft: number } }
  /** Inre luft, mm: topp och mot huvudspalten. Ytterkanten är sidmarginalen. */
  luft: { topp: number; inre: number }
  /** Avstånd mellan spalten och huvudspalten, mm. */
  mellanrum: number
  /** Kontakten står i spalten (lista), med rubriken "Kontakt". */
  kontakt: boolean
  sektioner: Sektion[]
  /** Certifieringarna i en ruta (Kalksten, Granit). */
  intygsfalt?: { kant: Linje; bakgrund?: Farg; luft: number }
  /** Namn och titel överst i spalten i stället för ovanför spalterna (Ritning). */
  huvudISpalten?: boolean
  /**
   * Spalten från papperskant till papperskant på varje sida (Ritning, bara
   * PDF): sidmarginalen är 0 och topp- och bottenmarginalen är tabellens
   * thead- och tfoot-rader, som Chrome upprepar på varje sida.
   */
  helSida?: boolean
}

export type Layout =
  | { typ: 'enspalt' }
  /** Rubriken i en vänsterkolumn (Kolumn). */
  | { typ: 'marginalrubrik'; bredd: number; linjeOver?: Linje & { luft: number } }
  /**
   * Perioden i en vänsterkolumn (Årsring, Tusch). `lodrat` ritar en linje
   * till vänster om innehållet; `stortAr` skriver startåret stort med
   * "Pågående" eller "till 2021" under (Tusch).
   */
  | {
      typ: 'marginalperiod'
      bredd: number
      lodrat?: Linje & { luft: number }
      stortAr?: { pt: number; farg: Hex; vikt: Vikt }
      /** Avsnitt utan perioder (profil, kompetenser) indragna till innehållskolumnen. */
      indragAvsnitt: boolean
    }
  /** Två spalter utan panel efter avsnitten i full bredd (Stål). */
  | { typ: 'tvaspalt'; fullBredd: Sektion[]; vanster: Sektion[]; hoger: Sektion[]; vansterAndel: number; mellanrum: number }
  | { typ: 'sidospalt'; spalt: MallSidospalt }

export interface MallPost {
  arbetsgivare: TextStil
  periodKursiv?: boolean
  /** Perioden fet (Årsring). */
  periodFet?: boolean
  /** Hårlinje mellan posterna. */
  linjeMellan?: Linje
  /** Luft mellan poster, mm. */
  luftMellan: number
}

/**
 * grupp: "Kategori: a, b, c" per grupp.
 * mittpunkt: gruppnamnet på egen rad, kompetenserna skilda med " · ".
 * lista: punktlista (gruppnamnet fett ovanför när det finns).
 * spalter: grupperna i två spalter med punktlista.
 * brickor: gruppnamnet, därunder rundade brickor (bara PDF).
 * marginal: gruppnamnet i marginalkolumnen.
 */
export type KompetensForm = 'grupp' | 'mittpunkt' | 'lista' | 'spalter' | 'brickor' | 'marginal'

/** rad: namn till vänster, utgivare och år till höger. lista: namn, utgivare och år under. marginal: året i marginalen. */
export type IntygForm = 'rad' | 'lista' | 'marginal'

/** rad: "Svenska Modersmål · Engelska Flytande". lista: språk till vänster, nivå till höger. marginal: språket i marginalen. */
export type SprakForm = 'rad' | 'lista' | 'marginal'

export interface MallFoto {
  form: 'rund' | 'kvadrat'
  /** Bredd och höjd, mm. */
  storlek: number
  /** huvud-topp: centrerat ovanför namnet. huvud-hoger/huvud-vanster: i huvudet. sidospalt: överst i spalten. */
  plats: 'huvud-topp' | 'huvud-hoger' | 'huvud-vanster' | 'sidospalt'
  /** Fotot på från början när CV:t har ett foto. */
  forval: boolean
}

/** "Få plats på en sida". */
export interface MallEnSida {
  /** Ändring av alla grader, pt. */
  grad: number
  /** Minskning av sidmarginalerna, mm. */
  marginal: number
  /** Luft ovanför avsnitt, mm. */
  luftOver: number
}

export interface MallDef {
  id: string
  namn: string
  niva: Niva
  familj: Familj
  stil: string
  kort: string
  /** Finns som Word-fil. Kräver Word-typsnitt och ingen extraCss. */
  word: boolean
  /** Fyra accenter, förvalet först (MallVal.farg väljer). */
  accenter: readonly [Hex, Hex, Hex, Hex]

  typsnitt: MallTypsnitt
  grad: MallGrader
  /** Radavstånd i brödtexten. */
  radavstand: number
  /** Sidmarginaler, mm. */
  sida: { topp: number; hoger: number; botten: number; vanster: number }
  farger: MallFarger
  huvud: MallHuvud
  rubrik: MallRubrik
  layout: Layout
  post: MallPost
  punkt: { tecken: string; farg: Farg; indrag: number }
  kompetenser: KompetensForm
  /** Kompetensernas form i en sidospalt eller högerspalt. Förval 'lista'. */
  kompetenserISpalt?: KompetensForm
  intyg: IntygForm
  sprak: SprakForm
  foto?: MallFoto
  /** Huvudspaltens avsnitt i standardordning; sidospaltens står i layouten. */
  ordning: Sektion[]
  /** Ordningsvalen mallen stöder. Förval alla. */
  ordningsval?: Ordning[]
  /** Tidsaxel under huvudet (Horisont, bara PDF). */
  tidsaxel?: boolean
  /** Profilen i två spalter med anfang (Tidning, bara PDF). */
  profilSpalter?: boolean
  enSida: MallEnSida
  /** Egen CSS efter mallens, bara när word är falskt. */
  extraCss?: string
}

/** Definitionens fält som står i katalogen. */
export type MallKortFalt = Pick<MallDef, 'id' | 'namn' | 'niva' | 'familj' | 'stil' | 'kort' | 'word' | 'accenter'>
