// src/lib/spatialV1/types.ts
// =============================================================================
// Spatial förmåga (kind 'spatial', brief-tester-steg2-2026-11-09.md avsnitt 2,
// namnet enligt skissens beslut 1). Tre uppgiftsformer i samma nivåtest:
//   A  vriden eller speglad brickfigur (2D)
//   B  pappersvikning med hål, på expert med klipp (I-provets två vikningsdeltest)
//   C  tärningar: kubrotation i 3D (I-provets namn, skissens beslut 12)
//   D  pappersvikning i I-provets riktning: utvikt ark med hål och klipp,
//      välj hur det ser ut ihopvikt (ägarens beslut 2026-11-10, version 2)
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
}

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

export type SpatialFigur = BrickFigur | ArkVikFigur | ArkStansFigur | ArkUtFigur | KubFigur;

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
  referens?: BrickFigur | KubFigur;
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
  fran_version: 1 | 2;
  pensionerad_fran?: number;
}

/** Uppgiften under testet: alternativen i visad ordning, utan facit och misstag. */
export interface VisadSpatial {
  id: string;
  form: SpatialForm;
  klipp?: boolean;
  difficulty: number;
  fraga: string;
  referens?: BrickFigur | KubFigur;
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
