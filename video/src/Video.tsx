import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { FPS, LINJAR, mix, ramp, UT } from './anim';
import { C, F, KNAPP_TONING } from './tokens';
import { DROP, RUBRIKER, SLAG, SLUTSLAG, TAKT, UNDERRAD, internTid, scenVid, takt, Scen } from './tid';
import { Kallelsen } from './scener/Kallelsen';
import { Genomgangen, Resultatet } from './scener/Resultatet';
import { Logiktest, Numeriskt, PassRam, Verbalt } from './scener/Passet';
import { Hemvyn, Provet } from './scener/Nivan';
import { Personlighet } from './scener/Personlighet';

export type Format = '169' | '45';

// Panelen: 412 pt produktbredd i skala 1,95, samma i båda formaten.
const SKALA = 1.95;
const PANEL_B = 412 * SKALA;
const PANEL_H = 920;
const PANEL_PT_H = PANEL_H / SKALA;

const LAYOUT = {
  '169': {
    b: 1920,
    h: 1080,
    panel: { x: 1010, y: 80 },
    rubrik: { x: 140, botten: 600, storlek: 86 },
    underrad: { y: 640, storlek: 34 },
    ordmarke: { x: 140, y: 76 },
    intro: 150,
    slut: 120,
    vinkel: 1,
  },
  '45': {
    b: 1080,
    h: 1350,
    panel: { x: 138, y: 400 },
    rubrik: { x: 110, botten: 310, storlek: 72 },
    underrad: { y: 326, storlek: 30 },
    ordmarke: { x: 110, y: 60 },
    intro: 112,
    slut: 96,
    vinkel: 0.6,
  },
} as const;

/** Pulsen på varje slag från dropen: 1 på slaget, avklingar på 120 ms. */
const puls = (t: number) => {
  if (t < DROP || t > SLUTSLAG + 0.6) return 0;
  return Math.exp(-((t - DROP) % SLAG) / 0.12);
};

/** Slår in en rad: skala 1,14 till 1 och oskärpa 10 till 0 på 350 ms. */
const slagIn = (t: number, start: number): React.CSSProperties => {
  const p = ramp(t, start, 0.35, UT);
  return {
    opacity: ramp(t, start, 0.12, LINJAR),
    transform: `translateY(${(1 - p) * 24}px) scale(${mix(1.14, 1, p)})`,
    filter: `blur(${(1 - ramp(t, start, 0.22, UT)) * 10}px)`,
  };
};

const Rubrik: React.FC<{ t: number; rader: string[]; fran: number; till: number; storlek: number }> = ({ t, rader, fran, till, storlek }) => {
  if (t < fran - 0.02 || t > till + 0.15) return null;
  const ut = ramp(t, till - 0.06, 0.12, LINJAR);
  const langst = Math.max(...rader.map((r) => r.length));
  const s = langst > 17 ? storlek * 0.9 : storlek;
  return (
    <div style={{ opacity: 1 - ut, filter: `blur(${ut * 8}px)` }}>
      {rader.map((rad, i) => (
        <div
          key={rad}
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: s,
            lineHeight: `${s}px`,
            letterSpacing: '-0.03em',
            color: C.vaggInk,
            whiteSpace: 'nowrap',
            transformOrigin: '0 100%',
            ...slagIn(t, fran + i * 0.08),
          }}
        >
          {rad}
        </div>
      ))}
    </div>
  );
};

// Kameran per scen: vinkel och skala driver genom scenen och knycker vid klippet.
const KAMERA: Record<Scen['id'], { ry: [number, number]; rx: [number, number]; s: [number, number] }> = {
  kallelsen: { ry: [-6, -2], rx: [3, 1], s: [1, 1] },
  logik: { ry: [-9, -4], rx: [4, 2], s: [1.0, 1.04] },
  verbalt: { ry: [8, 4], rx: [3, 1], s: [1.02, 1.05] },
  numeriskt: { ry: [-7, -3], rx: [2, 4], s: [1.0, 1.04] },
  resultat: { ry: [2, -2], rx: [6, 2], s: [1.03, 1.0] },
  genomgang: { ry: [7, 3], rx: [2, 1], s: [1.0, 1.04] },
  hemvy: { ry: [-8, -3], rx: [3, 1], s: [1.0, 1.05] },
  provet: { ry: [0, 0], rx: [0, 0], s: [1.0, 1.0] },
  personlighet: { ry: [7, 3], rx: [3, 1], s: [1.0, 1.04] },
  avslut: { ry: [0, 0], rx: [0, 0], s: [1, 1] },
};

const ScenInnehall: React.FC<{ scen: Scen; t: number }> = ({ scen, t }) => {
  const it = internTid(scen, t);
  switch (scen.id) {
    case 'kallelsen':
      return <Kallelsen t={it} />;
    case 'logik':
      return (
        <>
          <Logiktest t={it} />
          <PassRam t={it} />
        </>
      );
    case 'verbalt':
      return (
        <>
          <Verbalt t={it} />
          <PassRam t={it} />
        </>
      );
    case 'numeriskt':
      return (
        <>
          <Numeriskt t={it} />
          <PassRam t={it} />
        </>
      );
    case 'resultat':
      return <Resultatet t={it} />;
    case 'genomgang':
      return <Genomgangen t={it} />;
    case 'hemvy':
      return <Hemvyn t={it} />;
    case 'provet':
      return <Provet t={it} />;
    case 'personlighet':
      return <Personlighet t={it} />;
    default:
      return null;
  }
};

// Introns kalender: kortet ligger klart på takt 2, dagen fylls på slag 3 och chippen på slag 4.
const introScen: Scen = {
  id: 'kallelsen',
  fran: 0,
  till: DROP,
  ankare: [
    [0, 0],
    [takt(1), 0.4],
    [takt(1) + 2 * SLAG, 1.0],
    [takt(1) + 3 * SLAG, 1.5],
    [DROP, 2.4],
  ],
};

const Panel: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  const L = LAYOUT[format];
  const scen = scenVid(t);
  if (scen.id === 'avslut' && t > scen.fran + 0.45) return null;
  const visad = scen.id === 'avslut' ? scenVid(scen.fran - 0.01) : scen;
  const lokal = visad.id === 'kallelsen' ? introScen : visad;
  const k = KAMERA[visad.id];
  const p = Math.min(1, Math.max(0, (t - visad.fran) / (visad.till - visad.fran)));
  const intro = visad.id === 'kallelsen';
  // Klippet: panelen knycker in från 4 % större med lite oskärpa.
  const knyck = intro ? 0 : 1 - ramp(t, visad.fran, 0.3, UT);
  const oskarpa = intro ? 0 : (1 - ramp(t, visad.fran, 0.14, UT)) * 6;
  // Introt: panelen flyger in på takt 2, kameran trycker in mot dagen under takt 3.
  const inflyg = ramp(t, takt(1) - 0.15, 0.6, UT);
  const tryck = intro ? ramp(t, takt(2), TAKT, (x) => x * x * x) : 0;
  // Avslutet: panelen faller bakåt och försvinner.
  const bort = scen.id === 'avslut' ? ramp(t, scen.fran, 0.4, UT) : 0;
  const v = L.vinkel;
  const ry = mix(k.ry[0], k.ry[1], p) * v + (intro ? (1 - inflyg) * -30 : 0);
  const rx = mix(k.rx[0], k.rx[1], p) * v;
  const s = mix(k.s[0], k.s[1], p) * (1 + knyck * 0.04) * (1 + puls(t) * 0.006) * (1 + tryck * 0.9) * (1 - bort * 0.25);
  // Under trycket glider dagen 30 mot bildens mitt.
  const dagX = L.panel.x + (276 / 412) * PANEL_B;
  const dagY = L.panel.y + (245 / PANEL_PT_H) * PANEL_H;
  const tx = intro ? (1 - inflyg) * 500 + (L.b / 2 - dagX) * tryck : 0;
  const ty = intro ? (L.h / 2 - dagY) * tryck : 0;
  // Trycket går mot dagen 30 i kalendern (panelens koordinater).
  const origo = intro ? `${((276 / 412) * 100).toFixed(1)}% ${((245 / PANEL_PT_H) * 100).toFixed(1)}%` : '50% 50%';
  const synligt = intro ? ramp(t, takt(1) - 0.15, 0.3, LINJAR) * (1 - ramp(t, DROP - 0.12, 0.12, LINJAR)) : 1 - bort;
  return (
    <div style={{ position: 'absolute', left: L.panel.x, top: L.panel.y, width: PANEL_B, height: PANEL_H, perspective: 2400 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 44,
          overflow: 'hidden',
          background: C.golv,
          opacity: synligt,
          transformOrigin: origo,
          transform: `translate(${tx}px, ${ty}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s})`,
          filter: `blur(${oskarpa + bort * 10}px)`,
          boxShadow: '0 60px 120px -40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, width: 412, height: PANEL_PT_H, transform: `scale(${SKALA})`, transformOrigin: '0 0' }}>
          <ScenInnehall scen={lokal} t={t} />
        </div>
      </div>
    </div>
  );
};

/** Introt: frågan slår in mitt i bild ord för ord och flyttar sedan till vänster. */
const Intro: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  if (t > DROP) return null;
  const L = LAYOUT[format];
  const ord = ['Kallad', 'till ett', 'rekryteringstest?'];
  const iMitten = 1 - ramp(t, takt(1) - 0.1, 0.25, LINJAR);
  return (
    <>
      {iMitten > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: iMitten, filter: `blur(${(1 - iMitten) * 12}px)` }}>
          <div style={{ textAlign: 'center' }}>
            {ord.map((o, i) => (
              <div key={o} style={{ fontFamily: F.display, fontWeight: 800, fontSize: L.intro, lineHeight: `${L.intro}px`, letterSpacing: '-0.035em', color: i === 2 ? C.kopparLjus : C.vaggInk, ...slagIn(t, i * SLAG) }}>
                {o}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
      <div style={{ position: 'absolute', left: L.rubrik.x, bottom: L.h - L.rubrik.botten }}>
        <Rubrik t={t} rader={['Kallad till ett', 'rekryteringstest?']} fran={takt(1)} till={takt(2) + 2 * SLAG} storlek={L.rubrik.storlek} />
      </div>
    </>
  );
};

/** Avslutet: raderna slår in, knappen poppar på downbeat och trycks på slutslaget. */
const Avslut: React.FC<{ t: number; format: Format }> = ({ t, format }) => {
  const start = takt(13);
  if (t < start) return null;
  const L = LAYOUT[format];
  const knappIn = ramp(t, takt(14), 0.45, (x) => 1 - Math.pow(1 - x, 3));
  const studs = Math.sin(ramp(t, takt(14), 0.45, LINJAR) * Math.PI) * 0.06;
  const tryck = t >= SLUTSLAG ? Math.exp(-(t - SLUTSLAG) / 0.12) : 0;
  const ring = ramp(t, SLUTSLAG, 0.6, UT);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: format === '169' ? 56 : 64 }}>
      <div style={{ textAlign: 'center' }}>
        {['Träna nu.', 'Kom förberedd sen.'].map((rad, i) => (
          <div key={rad} style={{ fontFamily: F.display, fontWeight: 800, fontSize: L.slut, lineHeight: `${L.slut * 1.02}px`, letterSpacing: '-0.035em', color: i === 1 ? C.kopparLjus : C.vaggInk, ...slagIn(t, start + i * 2 * SLAG) }}>
            {rad}
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            border: `3px solid ${C.koppar}`,
            opacity: t >= SLUTSLAG ? (1 - ring) * 0.9 : 0,
            transform: `scale(${1 + ring * 0.5})`,
          }}
        />
        <div
          style={{
            height: 108,
            padding: '0 60px',
            borderRadius: 999,
            background: KNAPP_TONING,
            color: C.kopparText,
            fontFamily: F.text,
            fontWeight: 700,
            fontSize: 36,
            display: 'flex',
            alignItems: 'center',
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 24px ${48 + tryck * 40}px -20px rgba(224,122,47,${0.7 + tryck * 0.3})`,
            opacity: ramp(t, takt(14), 0.1, LINJAR),
            transform: `scale(${(0.6 + 0.4 * knappIn + studs) * (1 - tryck * 0.05)})`,
          }}
        >
          Starta gratis test
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 40, color: C.vaggMjuk, ...slagIn(t, takt(14) + 2 * SLAG) }}>jobbcoach.ai</div>
    </AbsoluteFill>
  );
};

/** Filmkorn: brus som byter mönster varje bildruta. */
const Korn: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.12 }}>
    <svg width="100%" height="100%">
      <filter id="korn">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#korn)" />
    </svg>
  </AbsoluteFill>
);

export const TesterVideo: React.FC<{ format: Format }> = ({ format }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const L = LAYOUT[format];
  const pulsNu = puls(t);
  // Blixt vid dropen, vid avslutningen och på slutslaget.
  const blixt = Math.max(
    t >= DROP ? Math.exp(-(t - DROP) / 0.09) : 0,
    t >= takt(11) ? 0.6 * Math.exp(-(t - takt(11)) / 0.08) : 0,
    t >= SLUTSLAG ? 0.5 * Math.exp(-(t - SLUTSLAG) / 0.1) : 0,
  );
  const avslut = t >= takt(13);
  const ljusX = avslut ? L.b / 2 : L.panel.x + PANEL_B / 2;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.vagg2} 0%, ${C.vagg} 45%, ${C.vagg3} 100%)`, overflow: 'hidden' }}>
      {/* Ljuset bakom panelen andas med slagen */}
      <div
        style={{
          position: 'absolute',
          left: ljusX - 900,
          top: (avslut ? L.h / 2 : L.panel.y + PANEL_H / 2) - 700,
          width: 1800,
          height: 1400,
          background: `radial-gradient(closest-side, rgba(147,160,236,${0.22 + pulsNu * 0.08}), rgba(147,160,236,0))`,
        }}
      />
      {/* Ett kopparsken sveper över bilden vid dropen */}
      <div
        style={{
          position: 'absolute',
          top: -400,
          left: mix(-1200, L.b + 200, ramp(t, DROP - 0.05, 0.7, UT)),
          width: 500,
          height: L.h + 800,
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(224,122,47,0), rgba(224,122,47,0.22), rgba(224,122,47,0))',
          opacity: t > DROP - 0.05 && t < DROP + 0.8 ? 1 : 0,
        }}
      />
      <div style={{ position: 'absolute', left: L.ordmarke.x, top: L.ordmarke.y, fontFamily: F.display, fontWeight: 700, fontSize: format === '169' ? 30 : 32, color: C.vaggMjuk, opacity: ramp(t, takt(1), 0.3) * (1 - ramp(t, takt(13), 0.2)) }}>
        jobbcoach.ai
      </div>
      <Panel t={t} format={format} />
      <Intro t={t} format={format} />
      <div style={{ position: 'absolute', left: L.rubrik.x, bottom: L.h - L.rubrik.botten }}>
        {RUBRIKER.map((r) => (
          <div key={r.rader.join()} style={{ position: 'absolute', left: 0, bottom: 0 }}>
            <Rubrik t={t} rader={r.rader} fran={r.fran} till={r.till} storlek={L.rubrik.storlek} />
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.rubrik.x,
          top: L.underrad.y,
          fontFamily: F.text,
          fontWeight: 500,
          fontSize: L.underrad.storlek,
          color: C.vaggMjuk,
          whiteSpace: 'nowrap',
          opacity: ramp(t, UNDERRAD.fran, 0.25, LINJAR) * (1 - ramp(t, UNDERRAD.till - 0.06, 0.12, LINJAR)),
          transform: `translateY(${(1 - ramp(t, UNDERRAD.fran, 0.35, UT)) * 14}px)`,
        }}
      >
        Samma format som det riktiga testet
      </div>
      <Avslut t={t} format={format} />
      <AbsoluteFill style={{ background: '#FFF6EC', opacity: blixt * 0.35, pointerEvents: 'none' }} />
      <Korn frame={frame} />
      <Audio src={staticFile('ljud.wav')} />
    </AbsoluteFill>
  );
};
