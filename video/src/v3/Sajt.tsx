import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, IN_UT, LINJAR, mix, ramp, UT } from '../anim';
import { C, F, KNAPP_TONING } from '../tokens';
import { Logiktest, Numeriskt, PassRam, Verbalt } from '../scener/Passet';
import { Genomgangen, Resultatet } from '../scener/Resultatet';
import { Hemvyn, Provet } from '../scener/Nivan';
import { SLAG, takt } from './tid3';
import { ANKARE_SAJT, RUBRIKER_SAJT, S } from './tidSajt';

// Sajtversionen av testvideon i 16:9 (dator) och 9:16 (telefon). Ljudlös som grund,
// produkten i bild från första bildrutan, ingen rörelseoskärpa och inget filmkorn så
// att filerna blir små. Ljudet ligger i en egen fil som spelas först efter tryck.

export type SajtFormat = '169' | '916';

type Layout = {
  b: number;
  h: number;
  skala: number;
  px: number;
  py: number;
  ph: number;
  rubrik: { x: number; botten: number; bredd: number; max: number; centrerad: boolean };
  underrad: { x: number; y: number; storlek: number };
  slut: number;
};

const LAYOUTER: Record<SajtFormat, Layout> = {
  '169': {
    b: 1920,
    h: 1080,
    skala: 1.95,
    px: 1010,
    py: 80,
    ph: 920,
    rubrik: { x: 140, botten: 600, bredd: 800, max: 104, centrerad: false },
    underrad: { x: 144, y: 640, storlek: 36 },
    slut: 150,
  },
  '916': {
    b: 1080,
    h: 1920,
    skala: 2.42,
    px: (1080 - 412 * 2.42) / 2,
    py: 620,
    ph: 1150,
    rubrik: { x: 40, botten: 470, bredd: 1000, max: 120, centrerad: true },
    underrad: { x: 40, y: 500, storlek: 40 },
    slut: 100,
  },
};

const intern = (ankare: [number, number][], t: number) => {
  if (t <= ankare[0][0]) return ankare[0][1] + (t - ankare[0][0]);
  for (let i = 1; i < ankare.length; i++) {
    if (t <= ankare[i][0]) {
      const p = (t - ankare[i - 1][0]) / (ankare[i][0] - ankare[i - 1][0]);
      return ankare[i - 1][1] + p * (ankare[i][1] - ankare[i - 1][1]);
    }
  }
  const s = ankare[ankare.length - 1];
  return s[1] + (t - s[0]);
};
const IN = (x: number) => x * x * x;

export const SajtVideo: React.FC<{ format: SajtFormat }> = ({ format }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const L = LAYOUTER[format];
  const pb = 412 * L.skala;
  const ptH = L.ph / L.skala;
  const skarm = (x: number, y: number) => ({ x: L.px + x * L.skala, y: L.py + y * L.skala });

  const PanelVy: React.FC<{ children: React.ReactNode; transform?: string; opacity?: number; origo?: string }> = ({ children, transform, opacity = 1, origo = '50% 50%' }) => (
    <div style={{ position: 'absolute', left: L.px, top: L.py, width: pb, height: L.ph, perspective: 2200 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 44,
          overflow: 'hidden',
          background: C.golv,
          transformOrigin: origo,
          transform,
          opacity,
          backfaceVisibility: 'hidden',
          boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, width: 412, height: ptH, transform: `scale(${L.skala})`, transformOrigin: '0 0' }}>{children}</div>
      </div>
    </div>
  );

  const Rubrik: React.FC<{ fran: number; till: number; rader: string[] }> = ({ fran, till, rader }) => {
    if (t < fran - 0.02 || t > till + 0.2) return null;
    const ut = ramp(t, till - 0.08, 0.15, LINJAR);
    const langst = Math.max(...rader.map((r) => r.length));
    const storlek = Math.min(L.rubrik.max, L.rubrik.bredd / (langst * 0.53));
    const forsta = fran === 0;
    return (
      <div
        style={{
          position: 'absolute',
          left: L.rubrik.x,
          width: L.rubrik.bredd,
          bottom: L.h - L.rubrik.botten,
          textAlign: L.rubrik.centrerad ? 'center' : 'left',
          opacity: 1 - ut,
          transform: `translateY(${-ut * 30}px)`,
        }}
      >
        {rader.map((r, i) => {
          const p = forsta ? 1 : ramp(t, fran + i * 0.07, 0.4, UT);
          return (
            <div key={r} style={{ overflow: 'hidden', paddingTop: storlek * 0.12 }}>
              <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, lineHeight: `${storlek * 0.98}px`, letterSpacing: '-0.04em', color: C.vaggInk, transform: `translateY(${(1 - p) * 110}%)`, whiteSpace: 'nowrap' }}>
                {r}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const Utslag: React.FC<{ start: number; x: number; y: number }> = ({ start, x, y }) => {
    if (t < start || t > start + 0.8) return null;
    return (
      <>
        {[0, 0.08, 0.16].map((d, i) => {
          const p = ramp(t, start + d, 0.6, UT);
          return (
            <div key={i} style={{ position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `${6 - i * 1.5}px solid ${C.koppar}`, transform: `scale(${1 + p * (3 + i)})`, opacity: (1 - p) * (t >= start + d ? 1 : 0) }} />
          );
        })}
      </>
    );
  };

  // Rätt alternativ (E) i logiktestet och rad B i numeriska testet, i bildens koordinater.
  const E = { x: 16 + (380 - 16) / 3 + 8, y: 346 + 56 + 8, b: (380 - 16) / 3, h: 56 };
  const eS = { ...skarm(E.x, E.y), b: E.b * L.skala, h: E.h * L.skala };
  const radB = skarm(16 + 190, 342 + 30 + 13);

  // Övergångar
  const morf = ramp(t, S.verbalt - 0.45, 0.45, IN);
  const rida = ramp(t, S.verbalt + 0.05, 0.4, IN_UT);
  const panUt = ramp(t, S.numeriskt - 0.2, 0.2, IN);
  const panIn = ramp(t, S.numeriskt, 0.3, UT);
  const zoom = ramp(t, S.resultat - 0.35, 0.35, IN);
  const vandUt = ramp(t, S.genomgang - 0.2, 0.2, IN);
  const vandIn = ramp(t, S.genomgang, 0.3, UT);
  const genomUt = ramp(t, S.hemvy - 0.22, 0.22, IN);
  const genomIn = ramp(t, S.hemvy, 0.3, UT);
  const svep = (i: number) => ramp(t, S.avslut - 0.3 + i * 0.04, 0.3 - i * 0.04, IN);
  const svepUt = (i: number) => ramp(t, S.avslut + i * 0.04, 0.35 - i * 0.04, UT);
  const steg = t >= S.nivasteg && t < S.nivasteg + 0.6;
  const blixt = Math.max(t >= S.resultat ? 0.6 * Math.exp(-(t - S.resultat) / 0.1) : 0, t >= S.provet ? 0.5 * Math.exp(-(t - S.provet) / 0.08) : 0);
  const pulsNu = t < S.tryck ? Math.exp(-(t % SLAG) / 0.1) : 0;
  const minut = t < S.provet + SLAG ? 3 : 2;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.vagg2} 0%, ${C.vagg} 45%, ${C.vagg3} 100%)`, overflow: 'hidden' }}>
      {t < S.avslut && (
        <div style={{ position: 'absolute', left: L.px + pb / 2 - 900, top: L.py + L.ph / 2 - 700, width: 1800, height: 1400, background: `radial-gradient(closest-side, rgba(147,160,236,${0.24 + pulsNu * 0.08}), rgba(147,160,236,0))` }} />
      )}

      {/* Logiktestet: från första bildrutan, pilen mitt i sina hopp */}
      {t < S.verbalt && (
        <PanelVy origo="50% 34%" transform={`rotateY(${mix(-10, 0, ramp(t, 0, takt(1), UT)) * (format === '916' ? 0.4 : 1)}deg) scale(${mix(1.12, 1, ramp(t, 0, takt(0, 3), IN_UT))})`}>
          <Logiktest t={intern(ANKARE_SAJT.logik, t)} />
          <PassRam t={intern(ANKARE_SAJT.logik, t)} />
        </PanelVy>
      )}
      <Utslag start={takt(1)} x={eS.x + eS.b / 2} y={eS.y + eS.h / 2} />

      {/* Verbalt */}
      {t >= S.verbalt && t < S.numeriskt && (
        <PanelVy transform={`translateX(${-panUt * 2600}px) scale(${mix(1.06, 1, rida)})`} opacity={1 - panUt * 0.6}>
          <Verbalt t={intern(ANKARE_SAJT.verbalt, t)} />
          <PassRam t={intern(ANKARE_SAJT.verbalt, t)} />
        </PanelVy>
      )}
      <Utslag start={takt(1, 3)} x={skarm(206, 422).x} y={skarm(206, 422).y} />

      {/* Numeriskt, zoomar genom svaret in i resultatet */}
      {t >= S.numeriskt && t < S.resultat && (
        <PanelVy
          origo={`${((206 / 412) * 100).toFixed(1)}% ${((385 / ptH) * 100).toFixed(1)}%`}
          transform={`translateX(${(1 - panIn) * 2600}px) scale(${1 + zoom * zoom * 9})`}
          opacity={ramp(t, S.numeriskt, 0.15, LINJAR)}
        >
          <Numeriskt t={intern(ANKARE_SAJT.numeriskt, t)} />
          <PassRam t={intern(ANKARE_SAJT.numeriskt, t)} />
        </PanelVy>
      )}
      <Utslag start={takt(2, 3)} x={radB.x} y={radB.y} />
      {t >= S.resultat - 0.15 && t < S.resultat + 0.12 && <AbsoluteFill style={{ background: C.koppar, opacity: ramp(t, S.resultat - 0.15, 0.15, LINJAR) * (1 - ramp(t, S.resultat, 0.12, LINJAR)) }} />}

      {/* Resultatet */}
      {t >= S.resultat && t < S.genomgang && (
        <PanelVy transform={`rotateY(${vandUt * 90}deg) scale(${mix(1.15, 1, ramp(t, S.resultat, 0.4, UT))})`}>
          <Resultatet t={intern(ANKARE_SAJT.resultat, t)} />
        </PanelVy>
      )}
      {steg && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: format === '916' ? 440 : 520,
              letterSpacing: '-0.05em',
              color: C.kopparLjus,
              opacity: (1 - ramp(t, S.nivasteg + 0.3, 0.3, LINJAR)) * ramp(t, S.nivasteg, 0.06, LINJAR),
              transform: `scale(${mix(1.25, 1, ramp(t, S.nivasteg, 0.25, UT)) * mix(1, 0.1, ramp(t, S.nivasteg + 0.25, 0.35, IN))})`,
              textShadow: '0 30px 80px rgba(0,0,0,0.4)',
            }}
          >
            5,6
          </div>
        </AbsoluteFill>
      )}

      {/* Genomgången, kortet vänds in */}
      {t >= S.genomgang && t < S.hemvy && (
        <PanelVy transform={`rotateY(${mix(-90, 0, vandIn)}deg) scale(${1 + genomUt * genomUt * 2.2})`} opacity={1 - ramp(t, S.hemvy - 0.12, 0.12, LINJAR)}>
          <Genomgangen t={intern(ANKARE_SAJT.genomgang, t)} />
        </PanelVy>
      )}

      {/* Hemvyn med nivån fram till provdagen */}
      {t >= S.hemvy && t < S.provet && (
        <PanelVy transform={`scale(${mix(0.7, 1, genomIn)})`} opacity={ramp(t, S.hemvy, 0.15, LINJAR)}>
          <Hemvyn t={intern(ANKARE_SAJT.hemvy, t)} />
        </PanelVy>
      )}

      {/* Övningsprovet: hårt klipp, klockan rinner på slagen */}
      {t >= S.provet && t < S.avslut + 0.05 && (
        <PanelVy transform={`scale(${1 + (t - S.provet) * 0.02})`}>
          <Provet t={23.5} klocka={{ minuter: minut, andel: minut / 25, koppar: minut <= 2 }} />
        </PanelVy>
      )}

      {RUBRIKER_SAJT.map((r) => (
        <Rubrik key={r.rader.join()} fran={r.fran} till={r.till} rader={r.rader} />
      ))}
      {t >= takt(0, 2) && t < S.resultat && (
        <div
          style={{
            position: 'absolute',
            left: L.underrad.x,
            width: L.rubrik.bredd,
            top: L.underrad.y,
            textAlign: L.rubrik.centrerad ? 'center' : 'left',
            fontFamily: F.text,
            fontWeight: 500,
            fontSize: L.underrad.storlek,
            color: C.vaggMjuk,
            opacity: ramp(t, takt(0, 2), 0.3, LINJAR) * (1 - ramp(t, S.resultat - 0.2, 0.15, LINJAR)),
          }}
        >
          Samma format som det riktiga testet
        </div>
      )}

      {/* Rutan som blir hela bilden, och ridån som lyfts */}
      {t >= S.verbalt - 0.45 && t < S.verbalt + 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: mix(eS.x, 0, morf),
            top: mix(eS.y, 0, morf),
            width: mix(eS.b, L.b, morf),
            height: mix(eS.h, L.h, morf),
            borderRadius: mix(24, 0, morf),
            background: C.koppar,
            transform: `translateY(${-rida * (L.h + 100)}px)`,
          }}
        />
      )}

      {/* Staplarna som sveper till avslutet */}
      {t >= S.avslut - 0.3 && t < S.avslut + 0.4 &&
        [0, 1, 2, 3, 4].map((i) => {
          const h = L.h / 5;
          const ut = svepUt(i);
          return <div key={i} style={{ position: 'absolute', top: i * h, height: h + 1, left: ut > 0 ? ut * L.b : 0, width: ut > 0 ? L.b * (1 - ut) : svep(i) * L.b, background: i % 2 === 0 ? C.koppar : C.vagg2 }} />;
        })}

      <Avslut t={t} storlek={L.slut} />
      <AbsoluteFill style={{ background: '#FFF8F0', opacity: blixt * 0.8, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

const Avslut: React.FC<{ t: number; storlek: number }> = ({ t, storlek }) => {
  if (t < S.avslut) return null;
  const slag = (start: number) => {
    const p = ramp(t, start, 0.3, UT);
    return { opacity: ramp(t, start, 0.08, LINJAR), transform: `scale(${mix(1.25, 1, p)})` };
  };
  const knapp = takt(6, 2);
  const knappIn = ramp(t, knapp, 0.45, (x) => 1 - Math.pow(1 - x, 3));
  const studs = Math.sin(ramp(t, knapp, 0.45, LINJAR) * Math.PI) * 0.07;
  const tryck = t >= S.tryck ? Math.exp(-(t - S.tryck) / 0.12) : 0;
  const ring = ramp(t, S.tryck, 0.7, UT);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56, padding: '0 40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, lineHeight: `${storlek}px`, letterSpacing: '-0.045em', color: C.vaggInk, ...slag(S.avslut + 0.05) }}>Träna nu.</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, lineHeight: `${storlek}px`, letterSpacing: '-0.045em', color: C.kopparLjus, ...slag(takt(6, 1)) }}>Kom förberedd sen.</div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `4px solid ${C.koppar}`, opacity: t >= S.tryck ? (1 - ring) * 0.9 : 0, transform: `scale(${1 + ring * 0.7})` }} />
        <div
          style={{
            height: 112,
            padding: '0 64px',
            borderRadius: 999,
            background: KNAPP_TONING,
            color: C.kopparText,
            fontFamily: F.text,
            fontWeight: 700,
            fontSize: 38,
            display: 'flex',
            alignItems: 'center',
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 24px 50px -20px rgba(224,122,47,0.7)`,
            opacity: ramp(t, knapp, 0.08, LINJAR),
            transform: `scale(${(0.5 + 0.5 * knappIn + studs) * (1 - tryck * 0.06)})`,
          }}
        >
          Starta gratis test
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.vaggMjuk, ...slag(takt(6, 3)) }}>jobbcoach.ai</div>
    </AbsoluteFill>
  );
};
