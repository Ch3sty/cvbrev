/**
 * MallDef: en mall är en definition (docs/plan-mallar-2026-11-15.md avsnitt
 * 3.4). Samma definition ger förhandsvisningen och PDF:en
 * (render/html.ts) och, när `word` är sant, Word-filen (src/lib/cv/word/).
 *
 * Vokabulären täcker utbudets variation: huvudet vänsterställt, centrerat
 * eller delat, med eller utan färgat band; rubriker ovanför, i en
 * vänstermarginal eller centrerade, med linje under, över eller ett
 * vänsterstreck; perioden högerställd, i marginalen eller under titeln;
 * sidospalt vänster eller höger, med eller utan bakgrund; foto runt eller
 * fyrkantigt i huvudet eller sidospalten; kompetenser som lista, rad,
 * grupper eller spalter. De konstnärliga mallarna (word: false) får dessutom
 * egen CSS i `extraCss`.
 *
 * Enheter: mått i millimeter (mm), grader och linjer i punkter (pt),
 * spärrning i em, färger som hex med # ("#1f2937"). En färg kan också vara
 * en referens:
 *   'accent'  mallens valda accentfärg (en av de fyra, MallVal.farg),
 *   'ton'     accenten mycket ljus (bakgrunder, block),
 *   'text', 'dampad', 'linje'  mallens egna färger nedan.
 *
 * Kortfälten (namn, nivå, familj, stil, kort, word, accenter) står i
 * katalogen (katalog.ts), och definitionen hämtar dem därifrån med
 * `franKatalog(id)`, så att kortet och definitionen aldrig glider isär.
 */
import type { Familj, Niva, Ordning, Sektion, TypsnittId } from './kontrakt'

/** En färg: hex eller en referens (se filens överdel). */
export type Farg = `#${string}` | 'accent' | 'ton' | 'text' | 'dampad' | 'linje' | 'vit'

/** En linje: färg och tjocklek i punkter. */
export interface Linje {
  farg: Farg
  pt: number
}

/** Justering av en rad eller ett block. */
export type Justering = 'vanster' | 'centrerad' | 'hoger'

export interface MallTypsnitt {
  /** Brödtextens typsnitt. Användarens typsnittsval ersätter det. */
  brod: TypsnittId
  /** Rubrikernas och namnets typsnitt. Saknas: samma som brödtexten. */
  rubrik?: TypsnittId
  /**
   * Behåller rubrik och namn sitt typsnitt när användaren byter? Sant i mallar
   * där rubrikens typsnitt bär formen (serif-namn över sans-text). Förval falskt:
   * hela dokumentet byter.
   */
  rubrikFast?: boolean
}

/** Grader i punkter. */
export interface MallGrader {
  /** Brödtext (profil, punkter, kompetenser). */
  brod: number
  /** Namnet (h1). */
  namn: number
  /** Yrkestiteln under namnet. */
  titel: number
  /** Avsnittsrubrikerna (h2). */
  rubrik: number
  /** Posttiteln (jobbtitel, examen, projekt). */
  posttitel: number
  /** Kontaktuppgifter, perioder och annan småtext. */
  liten: number
}

export interface MallFarger {
  /** Brödtextens färg. */
  text: `#${string}`
  /** Dämpad text: perioder, kontakt, arbetsgivare om inget annat sägs. */
  dampad: `#${string}`
  /** Hårlinjer mellan poster och under huvudet. */
  linje: `#${string}`
  /** Namnets färg. Förval 'text'. */
  namn?: Farg
  /** Yrkestitelns färg. Förval 'accent'. */
  titel?: Farg
  /** Posttitelns färg. Förval 'text'. */
  posttitel?: Farg
  /** Arbetsgivarens (och skolans) färg. Förval 'dampad'. */
  arbetsgivare?: Farg
  /** Periodens färg. Förval 'dampad'. */
  period?: Farg
}

/** Det färgade bandet bakom huvudet (en tabellcell i full bredd i Word). */
export interface HuvudBand {
  bakgrund: Farg
  /** Textfärgen på bandet (namn, titel, kontakt). */
  text: Farg
  /** Inre luft i bandet, mm (topp/botten och sidor). */
  luft: { lodratt: number; sidor: number }
  /**
   * Går bandet ut i papperskanten (topp och sidor) i PDF:en? Word kan inte
   * skriva i sidmarginalen, så där står bandet inom marginalerna.
   */
  utfallande?: boolean
}

export interface MallHuvud {
  /**
   * vanster: namn, titel och kontakt vänsterställda.
   * centrerad: allt centrerat.
   * delad: namn och titel till vänster, kontakten i en högerspalt.
   */
  layout: 'vanster' | 'centrerad' | 'delad'
  /** Kontakten som en rad med mittpunkter eller som lista (en uppgift per rad). */
  kontakt: 'rad' | 'lista'
  /** Namnet i versaler. */
  namnVersaler?: boolean
  /** Spärrning i namnet, em (högst 0,08 för ATS). */
  namnSparrning?: number
  /** Namnets vikt. Förval fet (700). */
  namnVikt?: 400 | 500 | 600 | 700 | 800
  /** Yrkestiteln i versaler. */
  titelVersaler?: boolean
  titelKursiv?: boolean
  /** Linje under hela huvudet. */
  linjeUnder?: Linje
  /** Luft under huvudet innan första avsnittet, mm. */
  luftUnder: number
  /** Färgat band bakom huvudet. */
  band?: HuvudBand
}

export interface MallRubrik {
  /**
   * ovanfor: rubriken på egen rad ovanför innehållet.
   * marginal: rubriken i en vänstermarginal bredvid innehållet (bredd i `marginalBredd`).
   * centrerad: rubriken centrerad på egen rad.
   */
  placering: 'ovanfor' | 'marginal' | 'centrerad'
  /** Marginalens bredd när placering är 'marginal', mm. */
  marginalBredd?: number
  versaler: boolean
  /** Spärrning i em, högst 0,16 (ATS-läsaren klarar mer men vi håller oss lågt). */
  sparrning: number
  /** Vikt. Förval 700. */
  vikt?: 400 | 500 | 600 | 700 | 800
  farg: Farg
  /** Linjen kring rubriken. */
  linje?: Linje & { var: 'under' | 'over' | 'vanster' }
  /** Luft ovanför ett avsnitt, mm. */
  luftOver: number
  /** Luft mellan rubrik och innehåll, mm. */
  luftUnder: number
}

export interface MallPost {
  /**
   * hoger: perioden högerställd på titelns rad (tabbstopp i Word).
   * marginal: perioden i en vänstermarginal (bredd i `marginalBredd`).
   * under: perioden på egen rad under titeln, före arbetsgivaren.
   */
  period: 'hoger' | 'marginal' | 'under'
  /** Marginalens bredd när period är 'marginal', mm. */
  marginalBredd?: number
  /**
   * egen-rad: titel, sedan arbetsgivare på egen rad.
   * samma-rad: "Titel, Arbetsgivare" på en rad.
   */
  arbetsgivare: 'egen-rad' | 'samma-rad'
  arbetsgivareFet?: boolean
  arbetsgivareKursiv?: boolean
  /** Perioden kursiv. */
  periodKursiv?: boolean
  /** Hårlinje mellan posterna i ett avsnitt. */
  linjeMellan?: Linje
  /** Luft mellan poster, mm. */
  luftMellan: number
}

export interface MallPunkt {
  /** Punkttecknet ("•", "–", "▪", "›"). */
  tecken: string
  farg: Farg
}

/**
 * lista: en kompetens per rad med punkt.
 * rad: alla på en rad med mittpunkter.
 * grupper: "Kategori: a, b, c" per grupp.
 * spalter: grupperna i två eller tre spalter (tabell utan kanter i Word).
 */
export type KompetensForm = 'lista' | 'rad' | 'grupper' | 'spalter'

export interface MallSidospalt {
  sida: 'vanster' | 'hoger'
  /** Spaltens bredd, mm. */
  bredd: number
  /** Bakgrund. Saknas: ingen bakgrund (spalten skiljs med luft eller linje). */
  bakgrund?: Farg
  /** Textfärg i spalten. Förval mallens text. */
  text?: Farg
  /** Rubrikfärg i spalten. Förval mallens rubrikfärg. */
  rubrik?: Farg
  /** Linje mellan spalterna (när bakgrund saknas). */
  linje?: Linje
  /** Inre luft i spalten, mm. */
  luft: number
  /** Avstånd mellan spalterna, mm. */
  mellanrum: number
  /** Kontaktuppgifterna står i spalten i stället för i huvudet. */
  kontakt: boolean
  /** Rubriken över kontakten i spalten ("Kontakt"). */
  kontaktRubrik?: string
  /** Avsnitten i spalten, i ordning. Resten står i huvudspalten. */
  sektioner: Sektion[]
  /** Kompetensernas form i spalten. Förval 'lista'. */
  kompetenser?: KompetensForm
  /** Huvudet (namn och titel) står överst i spalten i stället för ovanför spalterna. */
  huvudISpalten?: boolean
}

export interface MallFoto {
  form: 'rund' | 'fyrkant'
  plats: 'huvud' | 'sidospalt'
  /** Bredd (och höjd), mm. */
  storlek: number
  /** Fotot på från början när CV:t har ett foto. */
  forval: boolean
}

/** Justeringen när "Få plats på en sida" är valt. */
export interface MallEnSida {
  /** Ändring av alla grader, pt (negativt minskar). */
  grad: number
  /** Faktor på sidmarginalerna (0,8 = 20 % smalare). */
  marginal: number
  /** Faktor på luften mellan avsnitt och poster. */
  luft: number
}

export interface MallDef {
  /** Mallens id, samma som i katalogen och i ?mall=. */
  id: string
  namn: string
  niva: Niva
  familj: Familj
  stil: string
  kort: string
  /** Finns som Word-fil. Kräver att allt i definitionen går att skriva med Words egna medel (ingen extraCss). */
  word: boolean
  /** Fyra accentfärger, mallens egen först (MallVal.farg väljer). */
  accenter: readonly [`#${string}`, `#${string}`, `#${string}`, `#${string}`]

  typsnitt: MallTypsnitt
  grad: MallGrader
  /** Radavstånd i brödtexten (1,15 till 1,5). */
  radavstand: number
  /** Sidmarginaler, mm. `sida` gäller vänster och höger. */
  sida: { topp: number; botten: number; sida: number }
  farger: MallFarger
  huvud: MallHuvud
  rubrik: MallRubrik
  post: MallPost
  punkt: MallPunkt
  /** Kompetensernas form i huvudspalten. */
  kompetenser: KompetensForm
  /** Språken som rad ("Svenska, modersmål · Engelska, flytande") eller lista. */
  sprak: 'rad' | 'lista'
  sidospalt?: MallSidospalt
  foto?: MallFoto
  /** Avsnittens standardordning (huvudspalten; sidospaltens står i sidospalt.sektioner). */
  ordning: Sektion[]
  /** Vilka ordningsval mallen stöder. Förval alla. */
  ordningsval?: Ordning[]
  enSida: MallEnSida
  /**
   * Egen CSS efter mallens, bara när `word` är falskt (de konstnärliga
   * mallarna). Väljarna ska utgå från klasserna i render/html.ts.
   */
  extraCss?: string
}

/** Definitionens fält som står i katalogen. */
export type MallKortFalt = Pick<MallDef, 'id' | 'namn' | 'niva' | 'familj' | 'stil' | 'kort' | 'word' | 'accenter'>
