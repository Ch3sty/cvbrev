import React from 'react';
import { C, F, KNAPP_TONING, LYFT } from './tokens';

// Gränssnittet i produktens egna mått (px på en 412 px bred telefon).
// Panelen skalar upp allt, så texten radbryts och mäts som i appen.

export const PANEL_PT_B = 412;

export const Kryss: React.FC<{ farg?: string }> = ({ farg = C.ink1 }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path d="M6 6 L18 18 M18 6 L6 18" stroke={farg} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

export const Topprad: React.FC<{
  titel: string;
  under?: string;
  hoger?: string;
  pa?: 'papper' | 'vagg';
}> = ({ titel, under, hoger, pa = 'papper' }) => {
  const vagg = pa === 'vagg';
  return (
    <div
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 18px',
        background: vagg ? 'transparent' : C.papper,
        borderBottom: vagg ? 'none' : `1px solid ${C.kant}`,
        flexShrink: 0,
      }}
    >
      <Kryss farg={vagg ? C.vaggInk : C.ink1} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.text, fontWeight: 600, fontSize: 15, lineHeight: '19px', color: vagg ? C.vaggInk : C.ink1 }}>
          {titel}
        </div>
        {under && (
          <div style={{ fontFamily: F.text, fontSize: 12.5, lineHeight: '16px', color: vagg ? C.vaggMjuk : C.ink3 }}>{under}</div>
        )}
      </div>
      {hoger && (
        <div style={{ fontFamily: F.text, fontSize: 14, color: vagg ? C.vaggMjuk : C.ink3, fontVariantNumeric: 'tabular-nums' }}>
          {hoger}
        </div>
      )}
    </div>
  );
};

/** Tidsraden: 4 px kopparrad som fylls mot provets tid. Räknar aldrig ner. */
export const Tidsrad: React.FC<{ andel: number; tid: string; provetsTid: string; opacity?: number }> = ({
  andel,
  tid,
  provetsTid,
  opacity = 1,
}) => (
  <div style={{ flexShrink: 0, opacity }}>
    <div style={{ height: 4, background: '#DADDEA' }}>
      <div style={{ height: 4, width: `${Math.max(0, Math.min(1, andel)) * 100}%`, background: C.koppar }} />
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 18px 0',
        fontFamily: F.text,
        fontSize: 12,
        color: C.ink3,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span>{tid}</span>
      <span>provets tid {provetsTid}</span>
    </div>
  </div>
);

export const Eyebrow: React.FC<{ children: React.ReactNode; farg?: string; style?: React.CSSProperties }> = ({
  children,
  farg = C.ink3,
  style,
}) => (
  <div
    style={{
      fontFamily: F.text,
      fontWeight: 600,
      fontSize: 11.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: farg,
      ...style,
    }}
  >
    {children}
  </div>
);

export type AltLage = 'neutral' | 'ratt' | 'valt' | 'nedtonad';

/** Ett svarsalternativ: bokstav uppe till vänster, kopparkant och kopparpunkt när det är rätt. */
export const Alternativ: React.FC<{
  bokstav: string;
  lage: AltLage;
  bredd: number;
  hojd?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  radie?: number;
}> = ({ bokstav, lage, bredd, hojd = bredd, children, style, radie = 12 }) => {
  const ratt = lage === 'ratt';
  const valt = lage === 'valt';
  const ned = lage === 'nedtonad';
  return (
    <div
      style={{
        position: 'relative',
        width: bredd,
        height: hojd,
        borderRadius: radie,
        background: ned ? '#F1F2F7' : C.papper,
        border: `${ratt || valt ? 2 : 1}px solid ${ratt ? C.koppar : valt ? C.ink1 : C.kant}`,
        boxShadow: ratt ? `0 0 0 3px ${C.kopparMjuk}` : 'none',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div style={{ opacity: ned ? 0.38 : 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 5,
          fontFamily: F.text,
          fontWeight: 600,
          fontSize: 11,
          color: ratt ? C.kopparInk : C.ink3,
          opacity: ned ? 0.38 : 1,
        }}
      >
        {bokstav}
      </div>
      {ratt && (
        <div style={{ position: 'absolute', right: 7, top: 7, width: 10, height: 10, borderRadius: 5, background: C.koppar }} />
      )}
    </div>
  );
};

/** Kopparknappen i inloggat (.knapp-primar). */
export const Knapp: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      height: 48,
      borderRadius: 12,
      background: KNAPP_TONING,
      color: C.kopparText,
      fontFamily: F.text,
      fontWeight: 600,
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 14px -8px rgba(196,98,31,0.6)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Kort: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: C.papper, borderRadius: 16, boxShadow: LYFT, border: `1px solid ${C.kant}`, ...style }}>{children}</div>
);
