import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { FPS, IN_UT, LINJAR, mix, ramp, UT } from '../anim';
import { C, F } from '../tokens';
import { Logiktest, PassRam, Verbalt } from '../scener/Passet';
import { DROP, LOGIK_ANKARE, MORF, SLAG, TAKT, takt } from './tid3';
import { Rymd, resaKurva } from './Rymd';

// Provklipp för version 3: introt, flygningen, dropen, logiktestet och övergången
// där rätt svar växer till hela bilden och blir nästa scen.

const SKALA = 1.95;
const PANEL = { x: 1010, y: 80, b: 412 * SKALA, h: 920 };
const PT_H = PANEL.h / SKALA;

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

/** Ett ord som slår in: hårt klipp, skala 1,3 till 1 på 250 ms. */
const Slag: React.FC<{ t: number; start: number; slut: number; text: React.ReactNode; storlek: number; bg: string; farg: string }> = ({ t, start, slut, text, storlek, bg, farg }) => {
  if (t < start || t >= slut) return null;
  const p = ramp(t, start, 0.25, UT);
  const zoom = 1 + (t - start) * 0.035;
  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: storlek, letterSpacing: '-0.045em', lineHeight: 1, color: farg, transform: `scale(${mix(1.3, 1, p) * zoom})`, whiteSpace: 'nowrap' }}>{text}</div>
    </AbsoluteFill>
  );
};

const Rubrik: React.FC<{ t: number; fran: number; till: number; rader: string[] }> = ({ t, fran, till, rader }) => {
  if (t < fran || t > till + 0.2) return null;
  const ut = ramp(t, till - 0.05, 0.15, LINJAR);
  return (
    <div style={{ position: 'absolute', left: 140, bottom: 1080 - 600, opacity: 1 - ut }}>
      {rader.map((r, i) => {
        const p = ramp(t, fran + i * 0.07, 0.4, UT);
        return (
          <div key={r} style={{ overflow: 'hidden', paddingTop: 10 }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 104, lineHeight: '100px', letterSpacing: '-0.04em', color: C.vaggInk, transform: `translateY(${(1 - p) * 110}%) skewY(${(1 - p) * 6}deg)`, whiteSpace: 'nowrap' }}>
              {r}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Ringar som slår ut från rätt svar. */
const Utslag: React.FC<{ t: number; start: number; x: number; y: number }> = ({ t, start, x, y }) => {
  if (t < start || t > start + 0.8) return null;
  return (
    <>
      {[0, 0.08, 0.16].map((d, i) => {
        const p = ramp(t, start + d, 0.6, UT);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 60,
              top: y - 60,
              width: 120,
              height: 120,
              borderRadius: 60,
              border: `${6 - i * 1.5}px solid ${C.koppar}`,
              transform: `scale(${1 + p * (3 + i)})`,
              opacity: (1 - p) * (t >= start + d ? 1 : 0),
            }}
          />
        );
      })}
    </>
  );
};

// Alternativ E i panelens koordinater (Passet.tsx: KANT 16, ALT_Y 346, ALT_B 121,3, ALT_H 56, mellanrum 8).
const E = { x: 16 + (380 - 16) / 3 + 8, y: 346 + 56 + 8, b: (380 - 16) / 3, h: 56 };
const E_SKARM = { x: PANEL.x + E.x * SKALA, y: PANEL.y + E.y * SKALA, b: E.b * SKALA, h: E.h * SKALA };

const ProvBild: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // Introt: tre ord på tre slag, sedan exploderar ordet mot kameran.
  const explosion = ramp(t, takt(1), 0.4, (x) => x * x);
  const resa = resaKurva(ramp(t, takt(1), TAKT, LINJAR));
  const vitning = ramp(t, DROP - 0.35, 0.35, (x) => x * x * x);
  const blixt = t >= DROP ? Math.exp(-(t - DROP) / 0.12) : vitning;

  // Logiktestet: kameran börjar nära matrisen och drar sig ut till hela vyn på takt 3.
  const lt = intern(LOGIK_ANKARE, t);
  const utdrag = ramp(t, takt(2, 2), TAKT - 2 * SLAG + 0.1, IN_UT);
  const slam = ramp(t, DROP, 0.35, UT);
  const ry = mix(-14, 0, ramp(t, DROP, takt(3, 1) - DROP - 0.1, UT));
  const rx = mix(8, 0, ramp(t, DROP, takt(3, 1) - DROP - 0.1, UT));
  const panelSkala = mix(1.55, 1, utdrag) * mix(1.25, 1, slam);
  const pulsNu = t > DROP ? Math.exp(-((t - DROP) % SLAG) / 0.1) : 0;

  // Morfen: rätt svar växer till hela bilden (accelererar in i klippet).
  const morf = ramp(t, MORF - 0.55, 0.55, (x) => x * x * x);
  const ruta = {
    x: mix(E_SKARM.x, 0, morf),
    y: mix(E_SKARM.y, 0, morf),
    b: mix(E_SKARM.b, 1920, morf),
    h: mix(E_SKARM.h, 1080, morf),
    r: mix(24, 0, morf),
  };
  // Efter morfen: kopparn lyfts uppåt som en rida och verbala testet ligger under.
  const rida = ramp(t, MORF + 0.05, 0.45, IN_UT);
  const visaLogik = t >= DROP && t < MORF;
  const visaVerbalt = t >= MORF;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.vagg2} 0%, ${C.vagg} 45%, ${C.vagg3} 100%)`, overflow: 'hidden' }}>
      {/* Flygningen */}
      {t >= takt(1) - 0.05 && t < DROP + 0.05 && <Rymd resa={resa} b={1920} h={1080} opacity={ramp(t, takt(1), 0.2, LINJAR)} />}

      {/* Introts ord */}
      <Slag t={t} start={0} slut={SLAG} text="Kallad" storlek={420} bg={C.vagg} farg={C.vaggInk} />
      <Slag t={t} start={SLAG} slut={2 * SLAG} text="till ett" storlek={360} bg={C.koppar} farg={C.kopparText} />
      {t >= 2 * SLAG && t < takt(1) + 0.4 && (
        <AbsoluteFill
          style={{
            background: t < takt(1) ? C.vagg : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1 - explosion,
          }}
        >
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

      {/* Ljuset bakom panelen */}
      {t >= DROP && (
        <div style={{ position: 'absolute', left: PANEL.x + PANEL.b / 2 - 900, top: -160, width: 1800, height: 1400, background: `radial-gradient(closest-side, rgba(147,160,236,${0.24 + pulsNu * 0.1}), rgba(147,160,236,0))` }} />
      )}

      {/* Logiktestet */}
      {visaLogik && (
        <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.b, height: PANEL.h, perspective: 2200 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 44,
              overflow: 'hidden',
              background: C.golv,
              transformOrigin: '50% 34%',
              transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${panelSkala * (1 + pulsNu * 0.006)})`,
              boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7)',
              filter: `blur(${(1 - slam) * 12}px)`,
            }}
          >
            <div style={{ position: 'absolute', left: 0, top: 0, width: 412, height: PT_H, transform: `scale(${SKALA})`, transformOrigin: '0 0' }}>
              <Logiktest t={lt} />
              <PassRam t={lt} />
            </div>
          </div>
        </div>
      )}
      <Rubrik t={t} fran={DROP} till={MORF} rader={['Logiktest']} />
      {t >= DROP + SLAG * 0.5 && t < MORF && (
        <div style={{ position: 'absolute', left: 144, top: 630, fontFamily: F.text, fontWeight: 500, fontSize: 36, color: C.vaggMjuk, opacity: ramp(t, DROP + SLAG * 0.5, 0.3, LINJAR) * (1 - morf) }}>
          Samma format som det riktiga testet
        </div>
      )}
      <Utslag t={t} start={takt(3, 1)} x={E_SKARM.x + E_SKARM.b / 2} y={E_SKARM.y + E_SKARM.h / 2} />

      {/* Verbala testet under ridan */}
      {visaVerbalt && (
        <>
          <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.b, height: PANEL.h, borderRadius: 44, overflow: 'hidden', background: C.golv, transform: `scale(${mix(1.08, 1, rida)})`, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7)' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 412, height: PT_H, transform: `scale(${SKALA})`, transformOrigin: '0 0' }}>
              <Verbalt t={7.0 + (t - MORF) * 0.8} />
              <PassRam t={7.0 + (t - MORF) * 0.8} />
            </div>
          </div>
          <Rubrik t={t} fran={MORF + 0.2} till={99} rader={['Verbalt', 'resonemang']} />
        </>
      )}

      {/* Rutan som blir hela bilden, och ridan som lyfts */}
      {t >= MORF - 0.55 && t < MORF + 0.55 && (
        <div
          style={{
            position: 'absolute',
            left: ruta.x,
            top: ruta.y,
            width: ruta.b,
            height: ruta.h,
            borderRadius: ruta.r,
            background: C.koppar,
            opacity: ramp(t, MORF - 0.55, 0.08, LINJAR),
            transform: `translateY(${-rida * 1100}px)`,
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        />
      )}

      <AbsoluteFill style={{ background: '#FFF8F0', opacity: blixt * 0.85, pointerEvents: 'none' }} />
      <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.1 }}>
        <svg width="100%" height="100%">
          <filter id="korn3">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#korn3)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Prov: React.FC = () => (
  <>
    <CameraMotionBlur shutterAngle={200} samples={8}>
      <ProvBild />
    </CameraMotionBlur>
    <Audio src={staticFile('ljud3.wav')} />
  </>
);
