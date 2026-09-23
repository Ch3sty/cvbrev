'use client';

/**
 * AdminChart: adminens enda diagramkomponent.
 *
 * Recharts laddas lazy i ett stycke via AdminChartInner, sa biblioteket
 * ligger utanfor sidans forsta paket. Hojden star pa behallaren och ar
 * reserverad innan diagrammet finns, alltsa inget layoutskifte nar det kommer
 * in (CLS 0 ar ett hart krav enligt planens avsnitt 9).
 *
 * Fargerna laser CSS-variabler, aldrig hex i komponenten. Det ar samma regel
 * som gor att mork lage i designsystemets avsnitt 11 gar att bygga senare
 * utan att rora nagon diagramkod.
 *
 * | Roll             | Variabel          |
 * |------------------|-------------------|
 * | Primar serie     | var(--ink-1)      |
 * | Sekundar serie   | var(--kant-stark) |
 * | Mellan serie     | var(--ink-3)      |
 * | Framhavd serie   | var(--accent)     |
 * | Positivt utfall  | var(--positiv)    |
 * | Varning          | var(--varning)    |
 * | Fel              | var(--fel)        |
 * | CV-paketet       | var(--diagram-cv) |
 * | Träningspaketet  | var(--diagram-test)|
 * | Hela paketet     | var(--ink-1)      |
 * | Rutnat           | var(--kant)       |
 * | Axeltext         | var(--ink-3), 12  |
 *
 * Hogst en framhavd serie per diagram, annars sprangs taket pa tre orange
 * inslag per skarm.
 *
 * Diagramregeln (spec-admin-tydlighet 2026-09-22, docs/designsystem.md
 * avsnitt 12): axlar med enhet (enhet eller formateraY), x-etiketter i
 * borjan, mitten och slutet, senaste vardet utskrivet vid slutpunkten,
 * farre an sju punkter med data blir en mening i stallet for ett diagram,
 * och dagar fore matstart (matstart) eller som kallan inte levererat an
 * (efterslap) blir en gra zon i stallet for nollor.
 *
 * Tre former utover linje och stapel, tillagda for /admin/flode:
 * liggande staplar (kategorin pa y-axeln, talet pa x), staplade ytor for
 * en del-av-helhet over tid, och en farg per rad via fargNyckel, sa att
 * en stapel kan fargas efter vilket paket den hor till.
 *
 * En sak komponenten medvetet inte kan: tva y-axlar. Planens avsnitt 4.3
 * beskriver klick och visningar med varsin axel, men tva skalor i samma ruta
 * later linjerna korsa varandra pa stallen som inte betyder nagot. Vag 2
 * loser det med tva diagram under varandra, eller genom att indexera bada mot
 * samma bas.
 */

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/** Rollerna en serie kan ha. Fargen kommer ur rollen, aldrig ur ordningen. */
export type AdminSerieRoll =
  | 'primar'
  | 'sekundar'
  | 'mellan'
  | 'framhavd'
  | 'positiv'
  | 'varning'
  | 'fel'
  /* Sparfargerna (designsystem avsnitt 12): CV-paketet, Träningspaketet, Hela paketet. */
  | 'cv'
  | 'test'
  | 'allt';

export interface AdminSerie {
  /** Nyckeln i dataraden. */
  nyckel: string;
  /** Serienamnet som star i forklaringen och i tooltipen. */
  namn: string;
  /** Linje, stapel eller yta. Ytor staplas alltid pa varandra. */
  typ: 'linje' | 'stapel' | 'yta';
  /** Fargroll. Hogst en framhavd per diagram. */
  roll: AdminSerieRoll;
  /** Staplar med samma stackId laggs pa varandra. */
  stackId?: string;
}

export interface AdminChartProps {
  /** Raderna. Varje rad har xNyckel plus en nyckel per serie. */
  data: Array<Record<string, string | number | null>>;
  /** Faltet pa x-axeln, till exempel "dag". Vid liggande: kategorin pa y. */
  xNyckel: string;
  /** En till fyra serier. Fler an sa ska delas i tva diagram. */
  serier: AdminSerie[];
  /** Reserverad hojd i pixlar. Standard 240. */
  hojd?: number;
  /**
   * Y-axelns bredd i pixlar. Standard 56, vilket rymmer fyra siffror i tolv
   * pixlars grad. Hoj den nar etiketterna bar en enhet ("600 kr") eller nar
   * talen blir langre: en for smal axel klipper fran vanster, sa "600 kr"
   * lases som "00 kr", vilket ar varre an ingen etikett alls. Vid liggande
   * ar det kategoriaxelns bredd, alltsa etiketternas.
   */
  yAxisWidth?: number;
  /** Formaterar x-etiketterna, till exempel ett datum till "14 sep". */
  formateraX?: (varde: string | number) => string;
  /** Formaterar y-etiketter och tooltip-varden, till exempel ore till kronor. */
  formateraY?: (varde: number) => string;
  /**
   * Liggande staplar: kategorin star pa y-axeln och talet pa x. Anvands
   * nar kategorierna ar manga eller har langa namn. Bara staplar.
   */
  liggande?: boolean;
  /**
   * Faltet i raden som bar fargrollen for just den raden, till exempel
   * "roll". Da fargas varje stapel efter sitt eget varde i stallet for
   * seriens. Fargen foljer alltsa entiteten (paketet), aldrig rangordningen.
   */
  fargNyckel?: string;
  /**
   * Skriver vardet vid stapelns spets. Anvands sparsamt: pa liggande
   * staplar med fa rader, dar axeln annars ar enda vagen till talet.
   */
  etiketter?: boolean;
  /** Y-axelns domän vid procent: [0, 100]. Utelamnad: automatisk. */
  yDoman?: [number, number];
  /** Visas i stallet for diagrammet nar data ar tom. */
  tomText?: ReactNode;
  /**
   * Enheten pa y-axeln: "kr", "st", "%". Skrivs efter varje etikett nar
   * formateraY saknas. Diagramregeln kraver en enhet pa varje y-axel.
   */
  enhet?: string;
  /**
   * Farre punkter med data an sa blir inget diagram utan en mening med
   * vardena (diagramregeln punkt 3). Standard 7. Galler inte liggande
   * staplar, dar raderna ar kategorier och inte tid.
   */
  minstaPunkter?: number;
  /** Meningen som star i stallet for diagrammet nar punkterna ar for fa. */
  faPunkterText?: ReactNode;
  /**
   * Forsta x-vardet som ar en matning. Raderna fore ritas inte som noll
   * utan som en gra zon markt "mats fran ...".
   */
  matstart?: string;
  /** Etiketten i zonen fore matstart. Standard "mäts från <x>". */
  matstartText?: string;
  /**
   * En zon i slutet dar kallan inte levererat an, till exempel GSC som
   * ligger tva till tre dagar efter. fran ar forsta x-vardet i zonen.
   */
  efterslap?: { fran: string; text: string };
  /** Skriver seriens senaste varde vid slutpunkten. Standard pa. */
  slutvarde?: boolean;
  className?: string;
}

/** Sant nar raden bar minst ett tal i nagon av serierna. */
function harData(rad: Record<string, unknown>, serier: AdminSerie[]): boolean {
  return serier.some((s) => {
    const v = rad[s.nyckel];
    return typeof v === 'number' && Number.isFinite(v);
  });
}

/**
 * Raderna med allt fore matstart satt till null. Exporterad for testet.
 */
export function nollstallForeMatstart(
  data: AdminChartProps['data'],
  xNyckel: string,
  serier: AdminSerie[],
  matstart?: string
): AdminChartProps['data'] {
  if (!matstart) return data;
  return data.map((rad) => {
    if (String(rad[xNyckel]) >= matstart) return rad;
    const ny = { ...rad };
    for (const s of serier) ny[s.nyckel] = null;
    return ny;
  });
}

/** Antal rader med data. Exporterad for testet. */
export function antalPunkter(data: AdminChartProps['data'], serier: AdminSerie[]): number {
  return data.filter((r) => harData(r, serier)).length;
}

/**
 * Meningen med vardena nar punkterna ar for fa: "21 sep: 447 kr. 22 sep:
 * 447 kr." Med flera serier star seriens namn fore vardet.
 */
export function punkterSomText(
  data: AdminChartProps['data'],
  xNyckel: string,
  serier: AdminSerie[],
  formateraX?: (v: string | number) => string,
  formateraY?: (v: number) => string,
  enhet?: string
): string {
  const fy = (v: number) =>
    formateraY ? formateraY(v) : `${v.toLocaleString('sv-SE')}${enhet ? ` ${enhet}` : ''}`;
  const delar: string[] = [];
  for (const rad of data) {
    if (!harData(rad, serier)) continue;
    const x = rad[xNyckel];
    const xText = formateraX ? formateraX(x as string) : String(x);
    const varden = serier
      .filter((s) => typeof rad[s.nyckel] === 'number')
      .map((s) => (serier.length > 1 ? `${s.namn} ${fy(rad[s.nyckel] as number)}` : fy(rad[s.nyckel] as number)));
    delar.push(`${xText}: ${varden.join(', ')}`);
  }
  return delar.length ? `${delar.join('. ')}.` : '';
}

// Hela recharts-beroendet i en enda dynamic. Platshallaren har samma hojd som
// diagrammet, sa ytan star still fran forsta malning till att biblioteket ar
// inne. Platshallaren star stilla, den pulserar inte: skelettblock rors
// aldrig enligt designsystemet, bara traden gor det.
const AdminChartInner = dynamic(() => import('./AdminChartInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-lg bg-insunken" />,
});

export default function AdminChart({
  hojd = 240,
  tomText = 'Ingen data för perioden.',
  className,
  minstaPunkter = 7,
  faPunkterText,
  ...props
}: AdminChartProps) {
  const data = nollstallForeMatstart(props.data, props.xNyckel, props.serier, props.matstart);
  const punkter = antalPunkter(data, props.serier);

  if (!props.liggande && punkter > 0 && punkter < minstaPunkter) {
    // Diagramregeln punkt 3: en ensam stapel utan skala ar precis det som
    // sag ut som en mockup. Vardena star i en mening i stallet.
    const text =
      faPunkterText ??
      punkterSomText(data, props.xNyckel, props.serier, props.formateraX, props.formateraY, props.enhet);
    return (
      <div className={className}>
        <p className="text-sm leading-[22px] text-ink-2">{text}</p>
        <p className="mt-1 text-meta text-ink-3">
          {`Diagrammet visas från ${minstaPunkter} dagar med data. ${punkter} ${punkter === 1 ? 'dag' : 'dagar'} hittills.`}
        </p>
      </div>
    );
  }

  if (!data.length || punkter === 0) {
    return (
      <div
        className={['flex items-center justify-center', className ?? ''].join(' ')}
        style={{ height: hojd }}
      >
        <p className="text-meta text-ink-3">{tomText}</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height: hojd }}>
      <AdminChartInner {...props} data={data} />
    </div>
  );
}
