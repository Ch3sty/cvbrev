import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { FPS, IN_UT, LINJAR, mix, ramp, UT } from '../anim';
import { C, F, KNAPP_TONING } from '../tokens';
import { Logiktest, Numeriskt, PassRam, Verbalt } from '../scener/Passet';
import { Genomgangen, Resultatet } from '../scener/Resultatet';
import { Hemvyn, Provet } from '../scener/Nivan';
import { Personlighet } from '../scener/Personlighet';
import { ANKARE, DROP, LOGIK_ANKARE, MORF, RUBRIKER3, SLAG, T, TAKT, takt } from './tid3';
import { Rymd, resaKurva } from './Rymd';

// Version 3, hela videon i 16:9. Varje scenbyte har en egen övergång som sitter på
// ett slag i spåret: explosion, flygning, drop, ruta som blir hela bilden, panorering,
// zoom genom svaret, kortvändning, flygning genom vyn, hårt klipp, iris och staplar.

const B = 1920;
const H = 1080;
const SKALA = 1.95;
const P = { x: 1010, y: 80, b: 412 * SKALA, h: 920 };
const PT_H = P.h / SKALA;
const skarm = (x: number, y: number) => ({ x: P.x + x * SKALA, y: P.y + y * SKALA });

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

const IN = (x: number) => x * x * x; // accelererar in i ett klipp

/** Panelen med produktens vy, skalad från 412 pt. */
const PanelVy: React.FC<{ children: React.ReactNode; transform?: string; filter?: string; clipPath?: string; opacity?: number; origo?: string; bg?: string }> = ({ children, transform, filter, clipPath, opacity = 1, origo = '50% 50%', bg = C.golv }) => (
  <div style={{ position: 'absolute', left: P.x, top: P.y, width: P.b, height: P.h, perspective: 2200 }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 44,
        overflow: 'hidden',
        background: bg,
        transformOrigin: origo,
        transform,
        filter,
        clipPath,
        opacity,
        backfaceVisibility: 'hidden',
        boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, width: 412, height: PT_H, transform: `scale(${SKALA})`, transformOrigin: '0 0' }}>{children}</div>
    </div>
  </div>
);

/** Ett ord som slår in över hela bilden. */
const Slag: React.FC<{ t: number; start: number; slut: number; text: React.ReactNode; storlek: number; bg: string; farg: string }> = ({ t, start, slut, text, storlek, bg, farg }) => {
  if (t < start || t >= slut) return null;
  const p = ramp(t, start, 0.25, UT);
  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, letterSpacing: '-0.045em', lineHeight: 1, color: farg, transform: `scale(${mix(1.3, 1, p) * (1 + (t - start) * 0.035)})`, whiteSpace: 'nowrap' }}>{text}</div>
    </AbsoluteFill>
  );
};

/** Rubriken till vänster: raderna reser sig ur en mask med en liten skevning. */
const Rubrik: React.FC<{ t: number; fran: number; till: number; rader: string[] }> = ({ t, fran, till, rader }) => {
  if (t < fran || t > till + 0.2) return null;
  const ut = ramp(t, till - 0.08, 0.15, LINJAR);
  const langst = Math.max(...rader.map((r) => r.length));
  const storlek = Math.min(104, 800 / (langst * 0.53));
  return (
    <div style={{ position: 'absolute', left: 140, bottom: H - 600, opacity: 1 - ut, filter: `blur(${ut * 10}px)`, transform: `translateY(${-ut * 30}px)` }}>
      {rader.map((r, i) => {
        const p = ramp(t, fran + i * 0.07, 0.4, UT);
        return (
          <div key={r} style={{ overflow: 'hidden', paddingTop: storlek * 0.12 }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, lineHeight: `${storlek * 0.98}px`, letterSpacing: '-0.04em', color: C.vaggInk, transform: `translateY(${(1 - p) * 110}%) skewY(${(1 - p) * 6}deg)`, whiteSpace: 'nowrap' }}>
              {r}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Ringar som slår ut från en punkt. */
const Utslag: React.FC<{ t: number; start: number; x: number; y: number; farg?: string }> = ({ t, start, x, y, farg = C.koppar }) => {
  if (t < start || t > start + 0.8) return null;
  return (
    <>
      {[0, 0.08, 0.16].map((d, i) => {
        const p = ramp(t, start + d, 0.6, UT);
        return (
          <div
            key={i}
            style={{ position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `${6 - i * 1.5}px solid ${farg}`, transform: `scale(${1 + p * (3 + i)})`, opacity: (1 - p) * (t >= start + d ? 1 : 0) }}
          />
        );
      })}
    </>
  );
};

// Alternativ E i logiktestet och rad B i numeriska testet (panelens koordinater).
const E = { x: 16 + (380 - 16) / 3 + 8, y: 346 + 56 + 8, b: (380 - 16) / 3, h: 56 };
const E_S = { ...skarm(E.x, E.y), b: E.b * SKALA, h: E.h * SKALA };
const RAD_B = skarm(16 + 190, 342 + 30 + 13);
const KLOCKA = { x: 412 - 18 - 19, y: 28 };

const Bild: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const pulsNu = t > DROP && t < T.slut ? Math.exp(-((t - DROP) % SLAG) / 0.1) : 0;

  // ---- Introt
  const explosion = ramp(t, takt(1), 0.4, (x) => x * x);
  const resa = resaKurva(ramp(t, takt(1), TAKT, LINJAR));
  const vitning = ramp(t, DROP - 0.35, 0.35, IN);

  // ---- Blixtar på de stora klippen
  const blixt = Math.max(
    t >= DROP ? Math.exp(-(t - DROP) / 0.12) : vitning,
    t >= T.resultat ? 0.7 * Math.exp(-(t - T.resultat) / 0.1) : 0,
    t >= T.provet ? 0.6 * Math.exp(-(t - T.provet) / 0.08) : 0,
    t >= T.nivasteg ? 0.35 * Math.exp(-(t - T.nivasteg) / 0.1) : 0,
  );

  // ---- Logiktestet
  const lt = intern(LOGIK_ANKARE, t);
  const utdrag = ramp(t, takt(2, 2), TAKT - 2 * SLAG + 0.1, IN_UT);
  const slam = ramp(t, DROP, 0.35, UT);
  const logikVrid = ramp(t, DROP, takt(3, 1) - DROP - 0.1, UT);
  const morf = ramp(t, MORF - 0.55, 0.55, IN);
  const rida = ramp(t, MORF + 0.05, 0.45, IN_UT);

  // ---- Panorering verbalt till numeriskt
  const panUt = ramp(t, T.numeriskt - 0.22, 0.22, IN);
  const panIn = ramp(t, T.numeriskt, 0.28, UT);

  // ---- Zoom genom svaret i numeriska testet
  const zoom = ramp(t, T.resultat - 0.4, 0.4, IN);

  // ---- Kortvändning resultat till genomgång
  const vandUt = ramp(t, T.genomgang - 0.22, 0.22, IN);
  const vandIn = ramp(t, T.genomgang, 0.3, UT);

  // ---- Flygning genom genomgången in i hemvyn
  const genomUt = ramp(t, T.hemvy - 0.25, 0.25, IN);
  const genomIn = ramp(t, T.hemvy, 0.35, UT);

  // ---- Iris från klockan till personligheten
  const iris = ramp(t, T.personlighet, 0.4, UT);
  const klockS = { x: KLOCKA.x * SKALA, y: KLOCKA.y * SKALA };

  // ---- Staplarna som sveper till avslutet
  const svep = ramp(t, T.avslut - 0.3, 0.3, IN);
  const svepUt = ramp(t, T.avslut, 0.35, UT);

  // ---- Klockan i övningsprovet rinner på slagen: 5, 4, 3, 2 minuter
  const minut = Math.max(2, 5 - Math.floor((t - T.provet) / SLAG));
  const minutFas = ((t - T.provet) % SLAG) / SLAG;
  const klocka = { minuter: minut, andel: (minut - Math.min(1, minutFas * 4) * (minut > 2 ? 1 : 0)) / 25, koppar: minut <= 2 };

  // ---- Nivåsteget: "5,6" slår in över hela bilden
  const steg = t >= T.nivasteg && t < T.nivasteg + 0.6;
  const stegP = ramp(t, T.nivasteg, 0.6, LINJAR);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.vagg2} 0%, ${C.vagg} 45%, ${C.vagg3} 100%)`, overflow: 'hidden' }}>
      {/* Ljuset bakom panelen */}
      {t >= DROP && t < T.avslut && (
        <div style={{ position: 'absolute', left: P.x + P.b / 2 - 900, top: -160, width: 1800, height: 1400, background: `radial-gradient(closest-side, rgba(147,160,236,${0.24 + pulsNu * 0.1}), rgba(147,160,236,0))` }} />
      )}

      {/* ===== Introt ===== */}
      {t >= takt(1) - 0.05 && t < DROP + 0.05 && <Rymd resa={resa} b={B} h={H} opacity={ramp(t, takt(1), 0.2, LINJAR)} />}
      <Slag t={t} start={0} slut={SLAG} text="Kallad" storlek={420} bg={C.vagg} farg={C.vaggInk} />
      <Slag t={t} start={SLAG} slut={2 * SLAG} text="till ett" storlek={360} bg={C.koppar} farg={C.kopparText} />
      {t >= 2 * SLAG && t < takt(1) + 0.4 && (
        <AbsoluteFill style={{ background: t < takt(1) ? C.vagg : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: 1 - explosion }}>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 210,
              letterSpacing: '-0.045em',
              color: C.vaggInk,
              whiteSpace: 'nowrap',
              filter: `blur(${explosion * 30}px)`,
              transform: `scale(${mix(1.3, 1, ramp(t, 2 * SLAG, 0.25, UT)) * (1 + (t - 2 * SLAG) * 0.04) * (1 + explosion * 5)})`,
            }}
          >
            rekryteringstest<span style={{ color: C.koppar }}>?</span>
          </div>
        </AbsoluteFill>
      )}

      {/* ===== Logiktestet ===== */}
      {t >= DROP && t < MORF && (
        <PanelVy
          origo="50% 34%"
          transform={`rotateY(${mix(-14, 0, logikVrid)}deg) rotateX(${mix(8, 0, logikVrid)}deg) scale(${mix(1.55, 1, utdrag) * mix(1.25, 1, slam) * (1 + pulsNu * 0.006)})`}
          filter={`blur(${(1 - slam) * 12}px)`}
        >
          <Logiktest t={lt} />
          <PassRam t={lt} />
        </PanelVy>
      )}
      <Utslag t={t} start={takt(3, 1)} x={E_S.x + E_S.b / 2} y={E_S.y + E_S.h / 2} />

      {/* ===== Verbalt ===== */}
      {t >= MORF && t < T.numeriskt && (
        <PanelVy transform={`translateX(${-panUt * 2600}px) scale(${mix(1.08, 1, rida)}) rotateY(${mix(0, 6, ramp(t, MORF, T.numeriskt - MORF, LINJAR))}deg)`}>
          <Verbalt t={intern(ANKARE.verbalt, t)} />
          <PassRam t={intern(ANKARE.verbalt, t)} />
        </PanelVy>
      )}
      <Utslag t={t} start={takt(4)} x={skarm(206, 422).x} y={skarm(206, 422).y} />

      {/* ===== Numeriskt ===== */}
      {t >= T.numeriskt && t < T.resultat && (
        <PanelVy
          origo={`${((206 / 412) * 100).toFixed(1)}% ${((385 / PT_H) * 100).toFixed(1)}%`}
          transform={`translateX(${(1 - panIn) * 2600}px) rotateY(${mix(-6, -1, ramp(t, T.numeriskt, 2, LINJAR)) * (1 - zoom)}deg) scale(${1 + zoom * zoom * 9})`}
        >
          <Numeriskt t={intern(ANKARE.numeriskt, t)} />
          <PassRam t={intern(ANKARE.numeriskt, t)} />
        </PanelVy>
      )}
      <Utslag t={t} start={takt(5)} x={RAD_B.x} y={RAD_B.y} />
      {/* Kopparn i svaret fyller bilden innan resultatet */}
      {t >= T.resultat - 0.15 && t < T.resultat + 0.12 && <AbsoluteFill style={{ background: C.koppar, opacity: ramp(t, T.resultat - 0.15, 0.15, LINJAR) * (1 - ramp(t, T.resultat, 0.12, LINJAR)) }} />}

      {/* ===== Resultatet ===== */}
      {t >= T.resultat && t < T.genomgang && (
        <PanelVy
          bg={C.golv}
          transform={`rotateY(${vandUt * 90}deg) scale(${mix(1.18, 1, ramp(t, T.resultat, 0.4, UT)) * (1 + (steg ? Math.exp(-stegP * 6) * 0.04 : 0))})`}
        >
          <Resultatet t={intern(ANKARE.resultat, t)} />
        </PanelVy>
      )}
      {/* Nivåsteget: 5,6 i jättestorlek som krymper in i skalan */}
      {steg && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 520,
              letterSpacing: '-0.05em',
              color: C.kopparLjus,
              opacity: (1 - ramp(t, T.nivasteg + 0.3, 0.3, LINJAR)) * ramp(t, T.nivasteg, 0.06, LINJAR),
              transform: `translate(${mix(0, 330, ramp(t, T.nivasteg + 0.25, 0.35, IN))}px, ${mix(0, -260, ramp(t, T.nivasteg + 0.25, 0.35, IN))}px) scale(${mix(1.25, 1, ramp(t, T.nivasteg, 0.25, UT)) * mix(1, 0.1, ramp(t, T.nivasteg + 0.25, 0.35, IN))})`,
              textShadow: '0 30px 80px rgba(0,0,0,0.4)',
            }}
          >
            5,6
          </div>
        </AbsoluteFill>
      )}

      {/* ===== Genomgången ===== */}
      {t >= T.genomgang && t < T.hemvy && (
        <PanelVy
          transform={`rotateY(${mix(-90, 0, vandIn)}deg) scale(${1 + genomUt * genomUt * 2.5})`}
          filter={`blur(${genomUt * 18}px)`}
          opacity={1 - ramp(t, T.hemvy - 0.1, 0.1, LINJAR)}
        >
          <Genomgangen t={intern(ANKARE.genomgang, t)} />
        </PanelVy>
      )}
      <Utslag t={t} start={takt(6, 2.5)} x={skarm(16 + 4 * ((380 - 30) / 6 + 6) + (380 - 30) / 12, 252 + (380 - 30) / 12).x} y={skarm(0, 252 + (380 - 30) / 12).y} />

      {/* ===== Hemvyn ===== */}
      {t >= T.hemvy && t < T.provet && (
        <PanelVy transform={`scale(${mix(0.62, 1, genomIn)}) rotateY(${mix(-12, -4, ramp(t, T.hemvy, 2, LINJAR))}deg)`} filter={`blur(${(1 - genomIn) * 10}px)`} opacity={ramp(t, T.hemvy, 0.12, LINJAR)}>
          <Hemvyn t={intern(ANKARE.hemvy, t)} />
        </PanelVy>
      )}

      {/* ===== Övningsprovet ===== */}
      {t >= T.provet && t < T.personlighet + 0.4 && (
        <PanelVy transform={`scale(${1 + (t - T.provet) * 0.02 + pulsNu * 0.008})`}>
          <Provet t={23.5} klocka={klocka} />
        </PanelVy>
      )}

      {/* ===== Personligheten, öppnas i en cirkel från klockan ===== */}
      {t >= T.personlighet && t < T.avslut + 0.05 && (
        <PanelVy transform={`rotateY(${mix(6, 2, ramp(t, T.personlighet, 2.6, LINJAR))}deg)`} clipPath={`circle(${iris * 1500}px at ${klockS.x}px ${klockS.y}px)`}>
          <Personlighet t={intern(ANKARE.personlighet, t)} />
        </PanelVy>
      )}

      {/* ===== Rubrikerna ===== */}
      {RUBRIKER3.map((r) => (
        <Rubrik key={r.rader.join()} t={t} fran={r.fran} till={r.till} rader={r.rader} />
      ))}
      {t >= DROP + SLAG * 0.5 && t < T.resultat && (
        <div style={{ position: 'absolute', left: 144, top: 640, fontFamily: F.text, fontWeight: 500, fontSize: 36, color: C.vaggMjuk, opacity: ramp(t, DROP + SLAG * 0.5, 0.3, LINJAR) * (1 - morf * (1 - rida)) * (1 - ramp(t, T.resultat - 0.2, 0.15, LINJAR)) }}>
          Samma format som det riktiga testet
        </div>
      )}

      {/* ===== Rutan som blir hela bilden, och ridån som lyfts ===== */}
      {t >= MORF - 0.55 && t < MORF + 0.55 && (
        <div
          style={{
            position: 'absolute',
            left: mix(E_S.x, 0, morf),
            top: mix(E_S.y, 0, morf),
            width: mix(E_S.b, B, morf),
            height: mix(E_S.h, H, morf),
            borderRadius: mix(24, 0, morf),
            background: C.koppar,
            transform: `translateY(${-rida * 1100}px)`,
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        />
      )}

      {/* ===== Staplarna som sveper till avslutet ===== */}
      {t >= T.avslut - 0.3 && t < T.avslut + 0.4 &&
        [0, 1, 2, 3, 4].map((i) => {
          const h = H / 5;
          const fordrojning = i * 0.04;
          const inP = ramp(t, T.avslut - 0.3 + fordrojning, 0.3 - fordrojning, IN);
          const utP = ramp(t, T.avslut + fordrojning, 0.35 - fordrojning, UT);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: i * h,
                height: h + 1,
                left: utP > 0 ? utP * B : 0,
                width: utP > 0 ? B * (1 - utP) : inP * B,
                background: i % 2 === 0 ? C.koppar : C.vagg2,
              }}
            />
          );
        })}

      {/* ===== Avslutet ===== */}
      <Avslut t={t} />

      <AbsoluteFill style={{ background: '#FFF8F0', opacity: blixt * 0.85, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.1 }}>
        <svg width="100%" height="100%">
          <filter id="kornHel">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#kornHel)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Avslut: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.avslut) return null;
  const slag = (start: number) => {
    const p = ramp(t, start, 0.3, UT);
    return { opacity: ramp(t, start, 0.08, LINJAR), transform: `scale(${mix(1.25, 1, p)})`, filter: `blur(${(1 - ramp(t, start, 0.18, UT)) * 10}px)` };
  };
  const knapp = takt(10, 2);
  const knappIn = ramp(t, knapp, 0.45, (x) => 1 - Math.pow(1 - x, 3));
  const studs = Math.sin(ramp(t, knapp, 0.45, LINJAR) * Math.PI) * 0.07;
  const tryck = t >= T.slut ? Math.exp(-(t - T.slut) / 0.12) : 0;
  const ring = ramp(t, T.slut, 0.7, UT);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 56 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 150, lineHeight: '150px', letterSpacing: '-0.045em', color: C.vaggInk, ...slag(T.avslut + 0.05) }}>Träna nu.</div>
        <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 150, lineHeight: '150px', letterSpacing: '-0.045em', color: C.kopparLjus, ...slag(takt(10, 1)) }}>Kom förberedd sen.</div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `4px solid ${C.koppar}`, opacity: t >= T.slut ? (1 - ring) * 0.9 : 0, transform: `scale(${1 + ring * 0.7})` }} />
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
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.3), 0 24px ${50 + tryck * 50}px -20px rgba(224,122,47,${0.7 + tryck * 0.3})`,
            opacity: ramp(t, knapp, 0.08, LINJAR),
            transform: `scale(${(0.5 + 0.5 * knappIn + studs) * (1 - tryck * 0.06)})`,
          }}
        >
          Starta gratis test
        </div>
      </div>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 44, color: C.vaggMjuk, ...slag(takt(10, 3)) }}>jobbcoach.ai</div>
    </AbsoluteFill>
  );
};

export const Hel: React.FC = () => (
  <>
    <CameraMotionBlur shutterAngle={200} samples={6}>
      <Bild />
    </CameraMotionBlur>
    <Audio src={staticFile('ljud3.wav')} />
  </>
);
