/**
 * Appens ikoner och figurer, ritade som i konceptet
 * (docs/design/app-koncept-2026-11-13.html: symbolerna i-*, TYPER, ring,
 * marke och dagkortets illustration). Rena SVG utan tillstånd, går att
 * rendera på servern.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { AppTyp } from '@/lib/mobilapp/vyer';

function Svg({ children, className, style, size = 20 }: { children: ReactNode; className?: string; style?: CSSProperties; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true">
      {children}
    </svg>
  );
}

const linje = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IkonChev = (p: { className?: string }) => (
  <Svg className={p.className ?? 'tk-chev'}>
    <path d="M9 6l6 6-6 6" {...linje} />
  </Svg>
);
export const IkonX = () => (
  <Svg size={22}>
    <path d="M6 6l12 12M18 6L6 18" {...linje} />
  </Svg>
);
export const IkonTillbaka = () => (
  <Svg size={24}>
    <path d="M19 12H5M11 6l-6 6 6 6" {...linje} />
  </Svg>
);
export const IkonBock = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}>
    <path d="M5 12.5l4.5 4.5L19 7.5" {...linje} strokeWidth={2.2} />
  </Svg>
);
export const IkonLas = () => (
  <Svg size={13}>
    <g fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </g>
  </Svg>
);
export const IkonKlocka = ({ size = 20 }: { size?: number }) => (
  <Svg size={size}>
    <g {...linje}>
      <circle cx="12" cy="12.5" r="7.5" />
      <path d="M12 8.5v4.5l3 2M9 3h6" />
    </g>
  </Svg>
);
export const IkonBell = () => (
  <Svg>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);
export const IkonIdag = () => (
  <Svg size={24}>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </Svg>
);
export const IkonTester = () => (
  <Svg size={24}>
    <g fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" opacity=".5" />
    </g>
    <rect x="15" y="15" width="4.4" height="4.4" rx="1" fill="currentColor" />
  </Svg>
);
export const IkonUtveckling = () => (
  <Svg size={24}>
    <path d="M3.5 17.5c3-1 4.5-6.5 7.5-7.5s4.5 3.5 8 1.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" />
    <circle cx="19" cy="11.5" r="2.3" fill="currentColor" />
  </Svg>
);
export const IkonMoln = () => (
  <svg viewBox="0 0 64 64" width={72} height={72} aria-hidden="true" style={{ color: 'var(--a-ink-3)' }}>
    <path d="M20 46h26a10 10 0 0 0 1-20 14 14 0 0 0-27 3 9 9 0 0 0 0 17z" fill="none" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
    <path d="M14 52L50 14" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/* ------------------------------------------------------------ testtypernas figurer */

/** Konceptets TYPER: en ton och en figur per testtyp. */
const FIGUR: Record<AppTyp, { ton: string; svg: string }> = {
  matris: { ton: 'himmel', svg: `<g fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="36" height="36" rx="5"/><path d="M18 6v36M30 6v36M6 18h36M6 30h36" opacity=".45"/></g><g fill="currentColor"><circle cx="12" cy="12" r="2.6"/><rect x="21.5" y="9.5" width="5" height="5" rx="1"/><path d="M36 9.4l3 5.2h-6z"/><rect x="9.5" y="21.5" width="5" height="5" rx="1"/><path d="M24 21.4l3 5.2h-6z"/><circle cx="36" cy="24" r="2.6"/><path d="M12 33.4l3 5.2h-6z"/><circle cx="24" cy="36" r="2.6"/></g><rect x="31.5" y="31.5" width="9" height="9" rx="2" fill="none" stroke="#E8732A" stroke-width="2" stroke-dasharray="3 2.5"/>` },
  figurserie: { ton: 'turkos', svg: `<rect x="4" y="15" width="40" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17.3 15v18M30.6 15v18" stroke="currentColor" stroke-width="1.5" opacity=".45"/><path d="M10.7 19.5l3.6 6.2h-7.2z" fill="currentColor"/><rect x="21.6" y="21.6" width="4.8" height="4.8" rx="1" fill="currentColor"/><rect x="33.6" y="19.6" width="8" height="8" rx="2" fill="none" stroke="#E8732A" stroke-width="2" stroke-dasharray="3 2.5"/>` },
  deduktiv: { ton: 'rosa', svg: `<path d="M8 11h22M8 18h15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".65"/><rect x="4" y="25" width="40" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 25v15M24 25v15M34 25v15" stroke="currentColor" stroke-width="1.5" opacity=".45"/><rect x="7" y="30" width="4" height="5" rx="1" fill="currentColor"/><rect x="17" y="30" width="4" height="5" rx="1" fill="currentColor"/><rect x="27" y="29" width="6" height="7" rx="1.5" fill="#E8732A"/><rect x="37" y="30" width="4" height="5" rx="1" fill="currentColor"/>` },
  verbal: { ton: 'gul', svg: `<rect x="6" y="7" width="36" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16h24M12 23h9M12 30h24M12 37h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity=".65"/><rect x="23" y="20" width="14" height="6" rx="3" fill="#E8732A"/>` },
  ordforrad: { ton: 'syren', svg: `<rect x="6" y="9" width="36" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><text x="24" y="24" font-family="Figtree,sans-serif" font-size="9" font-weight="700" letter-spacing="1" text-anchor="middle" fill="currentColor">LYHÖRD</text><rect x="12" y="29" width="10" height="4" rx="2" fill="currentColor" opacity=".5"/><rect x="26" y="29" width="10" height="4" rx="2" fill="#E8732A"/>` },
  numerisk: { ton: 'salvia', svg: `<rect x="5" y="8" width="22" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 16h22M5 24h22M5 32h22M14 8v30" stroke="currentColor" stroke-width="1.5" opacity=".45"/><rect x="31" y="26" width="5" height="12" rx="1.5" fill="currentColor" opacity=".55"/><rect x="38" y="14" width="5" height="24" rx="1.5" fill="#E8732A"/><path d="M29 40h15" stroke="currentColor" stroke-width="2"/>` },
  talserie: { ton: 'salvia', svg: `<rect x="4" y="15" width="40" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 15v18M24 15v18M34 15v18" stroke="currentColor" stroke-width="1.5" opacity=".45"/><text x="9" y="28.5" font-family="Figtree,sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">2</text><text x="19" y="28.5" font-family="Figtree,sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">5</text><text x="29" y="28.5" font-family="Figtree,sans-serif" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">9</text><rect x="35.5" y="19.5" width="7" height="9" rx="2" fill="none" stroke="#E8732A" stroke-width="2" stroke-dasharray="3 2.5"/>` },
  spatial: { ton: 'sand', svg: `<path d="M10 18l14-7 14 7v14l-14 7-14-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 18l14 7 14-7M24 25v14" stroke="currentColor" stroke-width="1.5" opacity=".55"/><circle cx="31" cy="21" r="3" fill="#E8732A"/>` },
  personlighet: { ton: 'rosa', svg: `<path d="M8 30a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 30h32" stroke="currentColor" stroke-width="2"/><circle cx="29" cy="22" r="3.5" fill="#E8732A"/><path d="M24 30l5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` },
  plan: { ton: 'himmel', svg: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="2" opacity=".55"/><circle cx="24" cy="24" r="2.6" fill="#E8732A"/>` },
};

export function tonFor(typ: AppTyp): { bg: string; ink: string } {
  const t = FIGUR[typ].ton;
  return { bg: `var(--${t})`, ink: `var(--${t}-ink)` };
}

/** Figuren ensam, i en 48-ruta. */
export function TypFigur({ typ, size }: { typ: AppTyp; size: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" dangerouslySetInnerHTML={{ __html: FIGUR[typ].svg }} />
  );
}

/** Konceptets ikon(): figuren på sin ton i en rundad ruta. */
export function TypIkon({ typ, px }: { typ: AppTyp; px: number }) {
  const { bg, ink } = tonFor(typ);
  return (
    <span
      style={{ width: px, height: px, borderRadius: Math.round(px * 0.3), background: bg, color: ink, display: 'grid', placeItems: 'center', flex: '0 0 auto' }}
    >
      <TypFigur typ={typ} size={Math.round(px * 0.68)} />
    </span>
  );
}

/* ------------------------------------------------------------ dagarna i rad */

export type { RingStatus } from '@/lib/mobilapp/vyer';
import type { RingStatus } from '@/lib/mobilapp/vyer';

export function Ring({ status }: { status: RingStatus }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true">
      {status === 'gjord' && (
        <>
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--kop)" strokeWidth="5" />
          <path d="M19 28.5l6 6 12-13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === 'idag' && (
        <>
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--kop)" strokeWidth="5" strokeDasharray="5 6" strokeLinecap="round" />
          <circle cx="28" cy="28" r="5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".6" />
        </>
      )}
      {status === 'kvar' && <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" opacity=".18" />}
      {status === 'fri' && (
        <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="2 7" strokeLinecap="round" opacity=".35" />
      )}
      {status === 'paus' && (
        <>
          <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" opacity=".18" />
          <path d="M24 22v12M32 22v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".5" />
        </>
      )}
      {status === 'missad' && (
        <>
          <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="5" opacity=".18" />
          <circle cx="28" cy="28" r="4" fill="currentColor" opacity=".3" />
        </>
      )}
    </svg>
  );
}

/** Dagkortets illustration: matrisen med luckan i vitt. */
export function DagkortIllu() {
  return (
    <svg className="illu" viewBox="0 0 132 132" aria-hidden="true">
      <g fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2">
        <rect x="18" y="18" width="96" height="96" rx="12" />
        <path d="M50 18v96M82 18v96M18 50h96M18 82h96" />
      </g>
      <g fill="#fff" opacity=".95">
        <circle cx="34" cy="34" r="7" />
        <rect x="58" y="26" width="16" height="16" rx="3" />
        <path d="M98 25l9 17H89z" />
        <rect x="26" y="58" width="16" height="16" rx="3" />
        <path d="M66 57l9 17H57z" />
        <circle cx="98" cy="66" r="7" />
        <path d="M34 89l9 17H25z" />
        <circle cx="66" cy="98" r="7" />
      </g>
      <rect x="88" y="88" width="20" height="20" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 3" />
    </svg>
  );
}

/** Dagsringen i det vita kortet när dagens pass är gjort. */
export function Dagsring({ px }: { px: number }) {
  return (
    <svg viewBox="0 0 64 64" width={px} height={px} aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--a-kant)" strokeWidth="6" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--kop)" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 33l7 7 13-14" fill="none" stroke="var(--a-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------ märkena */

export type MarkeTyp = 'matning' | 'vecka' | 'niva' | 'general' | 'prov';

export function Marke({ typ, nadd }: { typ: MarkeTyp; nadd: boolean }) {
  const g = nadd ? 'var(--kop)' : 'var(--a-kant-stark)';
  return (
    <svg viewBox="0 0 52 52" aria-hidden="true">
      <path d="M26 4l19 11v22L26 48 7 37V15z" fill={nadd ? 'var(--kop-mjuk)' : 'var(--a-papper)'} stroke={g} strokeWidth="2.5" strokeLinejoin="round" />
      {typ === 'matning' && <circle cx="26" cy="26" r="5" fill={g} />}
      {typ === 'vecka' && <path d="M17 27h18M26 18v18" stroke={g} strokeWidth="3" strokeLinecap="round" />}
      {typ === 'niva' && <path d="M18 32l8-12 8 12" fill="none" stroke={g} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
      {typ === 'general' && (
        <>
          <circle cx="26" cy="26" r="8" fill="none" stroke={g} strokeWidth="3" />
          <path d="M26 21v5l3 2" stroke={g} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {typ === 'prov' && <path d="M19 27l5 5 10-11" fill="none" stroke={g} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
