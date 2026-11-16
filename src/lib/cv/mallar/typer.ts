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
  /** Namnets typsnitt när det skiljer från rubrikernas (Index, Lind). Saknas: rubrik. */
  namn?: TypsnittId
  /** Titelns typsnitt. Saknas: brödtexten. */
  titel?: TypsnittId
  /** Kontaktradens typsnitt. Saknas: brödtexten. */
  kontakt?: TypsnittId
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
  /** Textfärgen på bandet. Saknas: namn, titel och kontakt behåller sina egna färger (ljust band, Betong). */
  text?: Farg
  /** Inre luft, mm. Topp mäts från papperskanten (bandet går ut i kanten i PDF). */
  luft: { topp: number; sidor: number; botten: number }
  /** Lägsta höjd, mm. Bandet växer med ett långt namn. */
  minHojd?: number
  /**
   * Fotot fyller bandets höjd och går ut i papperskanten (Panorama): bandet
   * är exakt fotots höjd med foto och `utanFotoHojd` utan.
   */
  fotoTillKant?: boolean
  /** Bandets höjd utan foto när fotot går till kant, mm. */
  utanFotoHojd?: number
}

/** Remsan överst med bara kontakten (Skylt). Namnet står på vitt under. */
export interface HuvudRemsa {
  hojd: number
  bakgrund: Farg
  text: Farg
  /** Inre luft i sidled, mm. */
  sidor: number
  /** Luft mellan remsan och namnet, mm. */
  luft: number
}

/** Ram runt hela huvudet (Pergament). */
export interface HuvudRam extends Linje {
  dubbel?: boolean
  luft: { lodratt: number; sidor: number }
}

/** Monogramring med initialerna till vänster om namnet (Sigill). */
export interface HuvudMonogram {
  mm: number
  linje: Linje
  pt: number
  vikt: Vikt
  sparrning: number
  luft: number
}

export interface MallHuvud {
  /**
   * vanster, centrerad, hoger: texten i den justeringen.
   * band: färgat band i full bredd (Koppar, Granit, Mörkrum), text vänster, fotot höger.
   * block-vanster: namnet i en färgad ruta, titel och kontakt till höger (Kvadrat).
   * tidningshuvud: linje över, namnet centrerat, daterad rad med titel och kontakt (Tidning).
   * delad: namn och titel till vänster (fotot före), kontakten som högerställd lista till höger (Alm, Not).
   * remsa: smal färgad remsa överst med kontakten, namnet på vitt under (Skylt).
   */
  form: 'vanster' | 'centrerad' | 'hoger' | 'band' | 'block-vanster' | 'tidningshuvud' | 'delad' | 'remsa'
  /** exakt: Word får exakt radhöjd på namnet (Calibri ger annars 1,22 och ett högre huvud än PDF:en). */
  namn: TextStil & { radavstand?: number; exakt?: boolean }
  titel: TextStil
  /** Kontakten som rad med " · " eller som lista (en uppgift per rad). */
  kontakt: 'rad' | 'lista'
  /** Luft mellan namn och titel, mm. */
  luftTitel: number
  /** Luft mellan titel och kontakt, mm. */
  luftKontakt: number
  /**
   * Linje under huvudet. `dubbel` ritar två linjer med glipa (Antikva).
   * `langd` (mm) ger en kort linje centrerad under huvudet (Valv).
   */
  linjeUnder?: Linje & { luft: number; dubbel?: boolean; langd?: number }
  /** Linje ovanför namnet i full textbredd, `luft` mm mellan linjen och namnet (Lind). */
  linjeOver?: Linje & { luft: number }
  /** Kontakten i två kolumner i ett delat huvud (Not): två uppgifter per rad. */
  kontaktKolumner?: 2
  /** Kontaktens lodräta läge mot namnblocket i ett delat huvud. Förval centrerad. */
  kontaktLage?: 'centrerad' | 'botten'
  remsa?: HuvudRemsa
  ram?: HuvudRam
  monogram?: HuvudMonogram
  /** Namnet på två rader, förnamn och efternamn (Affisch), krympt till lägst `minPt` om det inte ryms. */
  namnRader?: { antal: 2; minPt: number }
  /** Stapel till vänster om huvudtexten (Fasad), med indrag i mm. */
  stapel?: Linje & { indrag: number }
  band?: HuvudBand
  /** Namnrutan i 'block-vanster'. */
  block?: { storlek: number; bakgrund: Farg; text: Farg; luft: number }
  /** Luft under huvudet innan första avsnittet, mm. */
  luftUnder: number
}

export interface MallRubrik extends TextStil {
  justering?: 'vanster' | 'centrerad' | 'hoger'
  /** Understrykning bara under texten (Alm, Panorama), `avstand` mm under baslinjen. */
  understruken?: Linje & { avstand: number }
  /**
   * Hårlinje efter texten till högermarginalen (Valv): `luft` mm mellan text
   * och linje, `hojd` mm ovanför baslinjen.
   */
  linjeEfter?: Linje & { luft: number; hojd: number }
  /** Avsnittets nummer (01, 02 ...) före rubriken (Index), `luft` mm före texten. */
  nummer?: { typsnitt: TypsnittId; pt: number; farg: Farg; luft: number }
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
  /** Linje längs spaltens innerkant, utan bakgrund (Ek). */
  linje?: Linje
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
  | { typ: 'marginalrubrik'; bredd: number; linjeOver?: Linje & { luft: number }; mellanrum?: number }
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
      /** Periodkolumnen till höger om innehållet (Furu). Förval vänster. */
      sida?: 'vanster' | 'hoger'
    }
  /**
   * Prickad tidslinje (Spår): alla avsnitt indragna `indrag` mm; i avsnitten
   * `sektioner` (de med poster) löper en prickad linje vid `kolumn` mm med en
   * fylld punkt (`punkt` mm) per post.
   */
  | { typ: 'marginalprick'; kolumn: number; indrag: number; linje: Linje; punkt: number; sektioner: Sektion[] }
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
  /**
   * Periodens plats: höger på titelns rad (förval) eller efter arbetsgivaren
   * på raden under, "Arbetsgivare · 2018 – 2021" (Lind).
   */
  periodPlats?: 'hoger' | 'efter-arbetsgivare'
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

export type FotoForm = 'rund' | 'kvadrat' | 'rundad' | 'staende'

export interface MallFoto {
  /** rund, kvadrat, rundad (kvadrat med 3 mm hörnradie) eller staende (bredd x höjd 3:4). */
  form: FotoForm
  /** Bredd (och höjd utom för staende), mm. */
  storlek: number
  /** Höjden för staende, mm. Förval storlek x 4/3. */
  hojd?: number
  /**
   * huvud-topp: centrerat ovanför namnet. huvud-topp-vanster: vänsterställt
   * ovanför namnet (Kant). huvud-hoger/huvud-vanster: i huvudet.
   * sidospalt-topp: överst i spalten (Sand, Ek). band-vanster: till vänster i
   * huvudbandet (Betong, Panorama).
   */
  plats: 'huvud-topp' | 'huvud-topp-vanster' | 'huvud-hoger' | 'huvud-vanster' | 'sidospalt-topp' | 'band-vanster'
  /** Fotot i spalten centrerat eller vänsterställt. Förval vänster. */
  justering?: 'vanster' | 'centrerad'
  /** Luft mellan fotot och texten, mm. Förval 7 i PDF:en. */
  luft?: number
  /**
   * Fotot (huvud-hoger) räknas inte in i huvudets höjd: luften under huvudet
   * mäts från texten och fotot får hänga ned i den, högst till 2 mm ovanför
   * första avsnittet (Loft, granskningsvarv 1).
   */
  hanger?: boolean
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
  /** Antalet spalter i kompetenser: 'spalter'. Förval 2 (Not 3). */
  kompetensSpalter?: 2 | 3
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
  /** Ram runt sidan på varje sida (Ramverk), `avstand` mm från papperskanten. PDF och Word. */
  sidram?: Linje & { avstand: number }
  /** Färgad remsa längs vänster papperskant på varje sida (Kant, bara PDF). */
  sidoremsa?: { mm: number; farg: Farg }
  /** Sockel nederst på varje sida med kontakten och avsnitten `sektioner` (Sockel, bara PDF). */
  sockel?: { hojd: number; bakgrund: Farg; text: Farg; luft: { lodratt: number; sidor: number }; sektioner: Sektion[] }
  /**
   * Tonade rutor (Kakel, bara PDF): `ruta` är avsnitten i egen ruta i full
   * bredd, `rutnat` rutnätets rader, varje rad [vänster, höger]. Rutnätet
   * står där dess första avsnitt står och bryts bara mellan raderna.
   */
  rutor?: { ruta: Sektion[]; rutnat: [Sektion, Sektion][]; bakgrund: Farg; luft: number; mellanrum: number }
  /** Egen CSS efter mallens, bara när word är falskt. */
  extraCss?: string
}

/** Definitionens fält som står i katalogen. */
export type MallKortFalt = Pick<MallDef, 'id' | 'namn' | 'niva' | 'familj' | 'stil' | 'kort' | 'word' | 'accenter'>
