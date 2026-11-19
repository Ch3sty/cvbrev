// src/lib/spatialV1/types.ts
// =============================================================================
// Spatial förmåga (kind 'spatial', brief-tester-steg2-2026-11-09.md avsnitt 2,
// namnet enligt skissens beslut 1). Tre uppgiftsformer i samma nivåtest:
//   A  vriden eller speglad brickfigur (2D)
//   B  pappersvikning med hål, på expert med klipp (I-provets två vikningsdeltest)
//   C  tärningar: kubrotation i 3D (I-provets namn, skissens beslut 12)
//   D  pappersvikning i I-provets riktning: utvikt ark med hål och klipp,
//      välj hur det ser ut ihopvikt (ägarens beslut 2026-11-10, version 2)
// Bankversion 5 (omgång 3, docs/fragebank/spatial-2026-11-19-omg3.md) lägger
// nya uppgiftstyper inom formerna: A spegling i två linjer (BrickFigur.axlar),
// C kroppar av kuber sedda från pilens håll och snitt (KroppFigur), B två
// vikningar med två hål på expert.
// Fyra alternativ A till D, blandade per session med logicTestV7/blanda.ts.
// Ren typfil.
// =============================================================================

export type SpatialNiva = 'grund' | 'avancerad' | 'expert';
export type SpatialForm = 'A' | 'B' | 'C' | 'D';

/** Koordinater i rutnätet: [rad, kolumn]. */
export type Ruta = [number, number];
/** Punkt i arkets enheter (en ruta = 1), x åt höger, y nedåt. */
export type Punkt = [number, number];

/** Form A: fyllda rutor i ett n×n-rutnät, normaliserade till (0, 0). Expert har en grå markerad ruta. */
export interface BrickFigur {
  kind: 'brick';
  n: 3 | 4 | 5;
  cells: Ruta[];
  mark?: Ruta;
  /**
   * Form A, spegling i två linjer (bankversion 5): linjerna figuren speglas i,
   * i tur och ordning, ritade streckade genom figurens mitt. v lodrät, h vågrät,
   * d diagonal från övre vänstra hörnet, a diagonal från övre högra hörnet.
   */
  axlar?: SpegelAxel[];
}
export type SpegelAxel = 'v' | 'h' | 'd' | 'a';

/** Form B, en vikning: arket som det ligger (poly), halvan som viks över (grå), viklinjen och pilen. */
export interface ArkVikFigur {
  kind: 'ark-vik';
  n: 4 | 6;
  poly: Punkt[];
  rorlig: Punkt[];
  linje: [Punkt, Punkt];
  pil: [Punkt, Punkt];
  /** Form D, första rutan: arkets hål och klipp (arket är helt utvikt, poly är hela arket). */
  hal?: Ruta[];
  klipp?: Ruta[];
}

/** Form B, det vikta arket med hålen (och klippet) som stansades. Alla lager är grå. */
export interface ArkStansFigur {
  kind: 'ark-stans';
  n: 4 | 6;
  poly: Punkt[];
  hal: Ruta[];
  /** Bortskurna rutor: i det stansade arket en ruta i kanten (expert, SP-B6); i uppvikningens mellansteg fler. */
  klipp?: Ruta[];
}

/** Form B, arket uppvikt: hålen och de rutor som klippet tog bort. */
export interface ArkUtFigur {
  kind: 'ark-ut';
  n: 4 | 6;
  hal: Ruta[];
  klipp: Ruta[];
}

export type KubSymbol = 'prick' | 'ring' | 'kryss' | 'stjarna' | 'kvadrat' | 'fkvadrat' | 'dubbelring' | 'triangel' | 'pil';
/** En synlig sida: symbolen och dess riktning, 0 till 3 kvarts varv medurs från sidans "upp". */
export interface KubSida {
  symbol: KubSymbol;
  riktning: 0 | 1 | 2 | 3;
}
/** Form C: kuben sedd snett ovanifrån, tre synliga sidor. `markera` färgar sidor i koppar (genomgången). */
export interface KubFigur {
  kind: 'kub';
  t: KubSida;
  l: KubSida;
  r: KubSida;
  markera?: ('t' | 'l' | 'r')[];
}

/**
 * Form C, kroppar (bankversion 5): staplar av kuber på en platta, sedda snett
 * ovanifrån som tärningen. h[y][x] är antalet kuber i rutan; x går snett nedåt
 * åt höger (de vita sidorna vetter åt det hållet), y snett nedåt åt vänster
 * (de grå sidorna). Pilen på plattan visar varifrån kroppen ses: 'l' rakt mot
 * de grå sidorna, 'r' rakt mot de vita sidorna till höger. `snitt` är raden
 * tvärs över pilen (y för 'l', x för 'r') som kroppen sågas itu genom, ritad
 * som en streckad linje på plattan.
 */
export interface KroppFigur {
  kind: 'kropp';
  h: number[][];
  blick: 'l' | 'r';
  snitt?: number;
}

export type SpatialFigur = BrickFigur | ArkVikFigur | ArkStansFigur | ArkUtFigur | KubFigur | KroppFigur;

export interface SpatialFraga {
  /** sp-<g|a|e>-<a|b|c|d>-<nn> */
  id: string;
  niva: SpatialNiva;
  form: SpatialForm;
  /** Form D: vikningen framåt till genomgången, arket först och sist det ihopvikta arket. */
  hopvikning?: (ArkUtFigur | ArkStansFigur)[];
  /** Form B: true när uppgiften har klipp (I-provets "pappersvikning med klipp"). */
  klipp?: boolean;
  difficulty: 1 | 2 | 3 | 4;
  p_prior: number;
  /** Frågan som den står ovanför alternativen. */
  fraga: string;
  /** Form A och C: figuren man jämför med. */
  referens?: BrickFigur | KubFigur | KroppFigur;
  /** Form B: rutorna överst, vikningarna och sist det stansade arket (högst fyra, SP-B7). */
  sekvens?: (ArkVikFigur | ArkStansFigur)[];
  /** Fyra alternativ, ordning före sessionens blandning. */
  options: SpatialFigur[];
  correctAnswer: number;
  /** Feltyp per alternativ, tom för facit. */
  typer: string[];
  /** Misstagstext per alternativ ur generatorn, tom för facit. */
  misstag: string[];
  /** En mening om facit, till genomgången ("Rätt figur är den första vriden 90 grader medurs."). */
  forklaring: string;
  /** Form B: uppvikningen baklänges, ett steg per ruta, sista är det uppvikta arket. */
  uppvikning?: (ArkStansFigur | ArkUtFigur)[];
  /** Form C: referensen med de sidor som avslöjar varje distraktor markerade, per alternativ (tom för facit). */
  avslojande?: (('t' | 'l' | 'r')[])[];
  /** 3: frågebanken 2026-11-19 (docs/fragebank/spatial-2026-11-19.md), aktiv sedan SPATIAL_VERSION 3. */
  /** 4: frågebanken 2026-11-19 omgång 2 (docs/fragebank/spatial-2026-11-19-omg2.md), aktiveras med SPATIAL_VERSION 4. */
  /** 5: frågebanken 2026-11-19 omgång 3 (docs/fragebank/spatial-2026-11-19-omg3.md), aktiveras med SPATIAL_VERSION 5. */
  fran_version: 1 | 2 | 3 | 4 | 5;
  pensionerad_fran?: number;
}

/** Uppgiften under testet: alternativen i visad ordning, utan facit och misstag. */
export interface VisadSpatial {
  id: string;
  form: SpatialForm;
  klipp?: boolean;
  difficulty: number;
  fraga: string;
  referens?: BrickFigur | KubFigur | KroppFigur;
  sekvens?: (ArkVikFigur | ArkStansFigur)[];
  options: SpatialFigur[];
}

/** Uppgiften i genomgången. */
export interface GenomgangSpatial extends VisadSpatial {
  rattVisat: number;
  misstag: string[];
  forklaring: string;
  uppvikning?: (ArkStansFigur | ArkUtFigur)[];
  /** Form D: arket och varje vikt läge med det som syns. */
  hopvikning?: (ArkUtFigur | ArkStansFigur)[];
  /** Per visat alternativ: referensens sidor som avslöjar det (form C). */
  avslojande?: (('t' | 'l' | 'r')[])[];
}
