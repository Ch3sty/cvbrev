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
 * | Framhavd serie   | var(--accent)     |
 * | Positivt utfall  | var(--positiv)    |
 * | Varning          | var(--varning)    |
 * | Fel              | var(--fel)        |
 * | Rutnat           | var(--kant)       |
 * | Axeltext         | var(--ink-3), 12  |
 *
 * Hogst en framhavd serie per diagram, annars sprangs taket pa tre orange
 * inslag per skarm.
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
  | 'framhavd'
  | 'positiv'
  | 'varning'
  | 'fel';

export interface AdminSerie {
  /** Nyckeln i dataraden. */
  nyckel: string;
  /** Serienamnet som star i forklaringen och i tooltipen. */
  namn: string;
  /** Linje eller stapel. */
  typ: 'linje' | 'stapel';
  /** Fargroll. Hogst en framhavd per diagram. */
  roll: AdminSerieRoll;
}

export interface AdminChartProps {
  /** Raderna. Varje rad har xNyckel plus en nyckel per serie. */
  data: Array<Record<string, string | number | null>>;
  /** Faltet pa x-axeln, till exempel "dag". */
  xNyckel: string;
  /** En till fyra serier. Fler an sa ska delas i tva diagram. */
  serier: AdminSerie[];
  /** Reserverad hojd i pixlar. Standard 240. */
  hojd?: number;
  /** Formaterar x-etiketterna, till exempel ett datum till "14 sep". */
  formateraX?: (varde: string | number) => string;
  /** Formaterar y-etiketter och tooltip-varden, till exempel ore till kronor. */
  formateraY?: (varde: number) => string;
  /** Visas i stallet for diagrammet nar data ar tom. */
  tomText?: ReactNode;
  className?: string;
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
  ...props
}: AdminChartProps) {
  if (!props.data.length) {
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
      <AdminChartInner {...props} />
    </div>
  );
}
