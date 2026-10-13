import React from 'react';
import { landa, mix, ramp, synlig } from '../anim';
import { Cell, Pil } from '../figurer';
import { C, F, LYFT, VAGG_TONING } from '../tokens';
import { Alternativ, AltLage, Eyebrow, Topprad } from '../ui';
import { ALT_2A, vaxling } from './Passet';

// Scen 3, 13 till 18 s: passets resultat på Träningens vägg (PassResultatVy)
// och sedan genomgången med Regelpanelen (GenomgangVy).

const B = 412;
const KANT = 16;
const INRE = B - 2 * KANT;
const VAGG_H = 318;

/** Nivåskalan 1 till 10 med din punkt, ringen "från" och målet (Nivaskala). */
const Nivaskala: React.FC<{ niva: number; fran: number; mal: number }> = ({ niva, fran, mal }) => {
  const b = INRE;
  const x = (n: number) => ((n - 1) / 9) * b;
  return (
    <div style={{ position: 'relative', width: b, height: 54 }}>
      <div style={{ position: 'absolute', left: x(niva), top: 0, transform: 'translateX(-50%)', fontFamily: F.text, fontWeight: 700, fontSize: 12.5, color: C.kopparLjus, whiteSpace: 'nowrap' }}>
        Nu {niva.toFixed(1).replace('.', ',')}
      </div>
      <svg width={b} height={34} style={{ position: 'absolute', left: 0, top: 14, overflow: 'visible' }}>
        <path d={`M ${x(mal)} 4 l -5 -8 l 10 0 Z`} transform="translate(0,4)" fill={C.ljus} />
        <rect x={0} y={16} width={b} height={6} rx={3} fill="rgba(255,255,255,0.14)" />
        <defs>
          <linearGradient id="nivafyll" x1="0" x2="1">
            <stop offset="0" stopColor={C.kopparDjup} />
            <stop offset="1" stopColor={C.kopparLjus} />
          </linearGradient>
        </defs>
        <rect x={0} y={16} width={x(niva)} height={6} rx={3} fill="url(#nivafyll)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={x(i + 1)} x2={x(i + 1)} y1={i === 0 || i === 4 || i === 9 ? 11 : 14} y2={i === 0 || i === 4 || i === 9 ? 27 : 24} stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} />
        ))}
        <circle cx={x(fran)} cy={19} r={6} fill="none" stroke={C.vaggMjuk} strokeWidth={2} />
        <circle cx={x(niva)} cy={19} r={7} fill={C.koppar} stroke={C.vagg} strokeWidth={2.5} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 42, height: 14, fontFamily: F.text, fontSize: 11.5, color: C.vaggMjuk }}>
        <span style={{ position: 'absolute', left: 0 }}>1</span>
        <span style={{ position: 'absolute', left: x(fran), transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>från 5,4</span>
        <span style={{ position: 'absolute', right: 0 }}>10</span>
      </div>
    </div>
  );
};

const Dagsring: React.FC<{ fyll: number; bock: number; storlek?: number }> = ({ fyll, bock, storlek = 62 }) => {
  const r = 26;
  const omkrets = 2 * Math.PI * r;
  return (
    <svg width={storlek} height={storlek} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={5} />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={C.koppar}
        strokeWidth={5}
        strokeDasharray={omkrets}
        strokeDashoffset={omkrets * (1 - fyll)}
        transform="rotate(-90 32 32)"
        strokeLinecap="round"
      />
      <path d="M 22 33 L 29 40 L 43 25" fill="none" stroke={C.vaggInk} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={bock} />
    </svg>
  );
};

const Tal: React.FC<{ tal: string; text: string; farg?: string }> = ({ tal, text, farg = C.vaggInk }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 27, lineHeight: '30px', letterSpacing: '-0.02em', color: farg }}>{tal}</div>
    <div style={{ fontFamily: F.text, fontSize: 12, color: C.vaggMjuk, marginTop: 2 }}>{text}</div>
  </div>
);

export const Resultatet: React.FC<{ t: number }> = ({ t }) => {
  const vagg = ramp(t, 13.0, 0.24);
  const fyll = ramp(t, 13.3, 0.5);
  const bock = ramp(t, 13.75, 0.15);
  const niva = mix(5.4, 5.6, ramp(t, 13.5, 0.2));
  const ut = ramp(t, 15.5, 0.3);
  const staplar = [32, 30, 38, 58, 34, 30, 36, 29, 31];
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - ramp(t, 15.45, 0.2), transform: `translateY(${-60 * ut}px)` }}>
      {/* Väggen växer ned från toppen när rummet byts */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: B,
          height: VAGG_H,
          background: VAGG_TONING,
          borderRadius: '0 0 28px 28px',
          clipPath: `inset(0 0 ${(1 - vagg) * 100}% 0 round 0 0 28px 28px)`,
        }}
      >
        <div style={{ opacity: synlig(t, 13.1, 99, 0.25) }}>
          <Topprad titel="Dagens pass sparat" hoger="9 / 9" pa="vagg" />
        </div>
        <div style={{ position: 'absolute', left: KANT, top: 66, width: INRE, display: 'flex', gap: 16, alignItems: 'center', ...landa(t, 13.12, 8, 0.26) }}>
          <Dagsring fyll={fyll} bock={bock} />
          <div>
            <Eyebrow farg={C.kopparLjus}>Passet klart</Eyebrow>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 25, lineHeight: '28px', letterSpacing: '-0.025em', color: C.vaggInk, marginTop: 4 }}>
              7 av 9 rätt. Nivån<br />steg till 5,6.
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: KANT, top: 148, ...landa(t, 13.42, 8, 0.26) }}>
          <Nivaskala niva={niva} fran={5.4} mal={6.5} />
        </div>
        <div style={{ position: 'absolute', left: KANT, top: 214, width: INRE, display: 'flex', ...landa(t, 13.42, 8, 0.26) }}>
          <Tal tal="7 av 9" text="rätt" />
          <Tal tal="+0,2" text="nivå, från 5,4" farg={C.kopparLjus} />
          <Tal tal="1 av 9" text="över provets tid" />
        </div>
        <div style={{ position: 'absolute', left: KANT, top: 270, fontFamily: F.text, fontWeight: 600, fontSize: 14, color: C.vaggInk, ...landa(t, 13.72, 8, 0.26) }}>
          Mål till provet: nivå 6,5
        </div>
      </div>
      {/* Tempokortet glider upp över väggens kant */}
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: VAGG_H - 18,
          width: INRE,
          boxSizing: 'border-box',
          background: C.papper,
          borderRadius: 18,
          boxShadow: LYFT,
          border: `1px solid ${C.kant}`,
          padding: '14px 16px 12px',
          ...landa(t, 14.02, 40, 0.4),
        }}
      >
        <Eyebrow>Tempo</Eyebrow>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 17, color: C.ink1, marginTop: 4 }}>Fråga 4 tog över provets tid</div>
        <div style={{ fontFamily: F.text, fontSize: 13, color: C.ink2, marginTop: 2 }}>Snitt 41 s, provet ger 68. Gå igenom den först.</div>
        <div style={{ position: 'relative', height: 64, marginTop: 10, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, borderTop: `1.5px dashed ${C.kantStark}` }} />
          {staplar.map((h, i) => (
            <div key={i} style={{ flex: 1, height: h, borderRadius: '4px 4px 0 0', background: i === 3 ? C.koppar : '#7078B4' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Genomgången

const G_CELL_B = (INRE - 2) / 3;
const G_CELL_H = 54;

export const Genomgangen: React.FC<{ t: number }> = ({ t }) => {
  const fyll = ramp(t, 16.25, 0.15);
  const altB = (INRE - 5 * 6) / 6;
  return (
    <div style={{ position: 'absolute', inset: 0, ...vaxling(t, 15.6, 18.0) }}>
      <Topprad titel="Genomgången" under="Fråga 4 av 9, Figuren vrider sig" hoger="1 / 2" />
      <div style={{ position: 'absolute', left: KANT, top: 70, width: INRE, height: G_CELL_H * 3 + 12, background: C.papper, borderRadius: 16, border: `1px solid ${C.kant}`, boxShadow: LYFT, boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', left: 0, top: 6, width: INRE - 2, height: G_CELL_H * 3 }}>
          {[1, 2].map((k) => (
            <div key={`v${k}`} style={{ position: 'absolute', left: G_CELL_B * k, top: 0, width: 1, height: G_CELL_H * 3, background: C.kant }} />
          ))}
          {[1, 2].map((k) => (
            <div key={`h${k}`} style={{ position: 'absolute', top: G_CELL_H * k, left: 0, height: 1, width: INRE - 2, background: C.kant }} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: (i % 3) * G_CELL_B, top: Math.floor(i / 3) * G_CELL_H, width: G_CELL_B, height: G_CELL_H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cell storlek={G_CELL_H - 4}>
                {i < 8 ? <Pil vinkel={i * 45} /> : <g opacity={fyll}><Pil vinkel={0} farg={C.kopparInk} /></g>}
              </Cell>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: KANT, top: 252, width: INRE, display: 'flex', gap: 6 }}>
        {ALT_2A.map((a) => {
          const lage: AltLage = a.ratt ? 'ratt' : a.bokstav === 'A' ? 'valt' : 'nedtonad';
          return (
            <Alternativ key={a.bokstav} bokstav={a.bokstav} lage={lage} bredd={altB} hojd={altB} radie={10}>
              <Cell storlek={altB - 12}>
                <Pil vinkel={a.vinkel} lang={a.lang !== false} oppenSpets={a.oppen} />
              </Cell>
            </Alternativ>
          );
        })}
      </div>
      {/* Regelpanelen */}
      <div
        style={{
          position: 'absolute',
          left: KANT,
          top: 330,
          width: INRE,
          boxSizing: 'border-box',
          background: C.ton,
          borderRadius: 16,
          padding: '13px 16px 14px',
          ...landa(t, 16.5, 24, 0.3),
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Eyebrow farg={C.tonInk} style={{ fontSize: 12.5 }}>Regeln</Eyebrow>
          <div style={{ fontFamily: F.text, fontSize: 12.5, color: C.ink3 }}>Inte den här, 52 s</div>
        </div>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 18, lineHeight: '23px', color: C.ink1, marginTop: 5 }}>
          Pilen vrider sig 45 grader medurs för varje ruta.
        </div>
        <div style={{ opacity: ramp(t, 17.0, 0.3) }}>
          <Eyebrow style={{ marginTop: 10 }}>Ditt misstag</Eyebrow>
          <div style={{ fontFamily: F.text, fontSize: 14, color: C.ink1, marginTop: 3 }}>Pilen har vridit sig ett steg för långt.</div>
        </div>
      </div>
    </div>
  );
};
