/**
 * Gemensam ram för delningsbilderna (og:image, 1200 × 630).
 *
 * Formen är sajtens publika form och samma som grafiken för de sociala
 * kontona: indigo i botten med två stora cirklar, loggans orange platta
 * med J och klack, rubriken i Schibsted Grotesk och till höger produkten
 * visad som den ser ut, i delens färg (illustrationerna i OgIllustrations).
 *
 * Ritas av next/og (Satori): inline-stil, flexbox och absolut placering.
 * Typsnittet skickas med av ogBild (ogBild.tsx). Samma komponent visas som
 * vanlig HTML på /dashboard/og-preview.
 *
 * Två API:er:
 *
 * 1. Per yrke (exempelsidorna): { variant: 'letter' | 'cv', yrke }.
 *    Ramen väljer arket och etiketten själv.
 * 2. Fritt (verktyg, listsidor): { eyebrow?, title, subtitle?, illustration }.
 *    En radbrytning i title (\n) styr var rubriken bryter.
 */

import type { ReactNode } from 'react';
import OgLetterMockup from './OgLetterMockup';
import OgCvMockup from './OgCvMockup';
import { OG_FARG, OG_KOPPAR, OG_LOGGA, OG_TYPSNITT } from './OgDelar';

interface OgFrameLegacyProps {
  variant: 'letter' | 'cv';
  yrke: string;
  eyebrow?: never;
  title?: never;
  subtitle?: never;
  illustration?: never;
}

interface OgFrameCustomProps {
  variant?: never;
  yrke?: never;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  illustration: ReactNode;
}

type OgFrameProps = OgFrameLegacyProps | OgFrameCustomProps;

/** Textspaltens bredd. Illustrationen börjar vid 600. */
const SPALT = 520;

/**
 * Teckenbredder i Schibsted Grotesk ExtraBold, tusendelar av en fyrkant
 * (ur typsnittsfilens hmtx-tabell). Rubrikens storlek räknas ur dem, så
 * att ett långt yrkesnamn aldrig går utanför spalten.
 */
const TECKEN: Record<string, number> = {
  ' ': 192, a: 614, b: 644, c: 595, d: 643, e: 606, f: 381, g: 588, h: 618, i: 301, j: 315, k: 630, l: 313, m: 929,
  n: 632, o: 617, p: 644, q: 644, r: 481, s: 557, t: 396, u: 632, v: 625, w: 908, x: 626, y: 634, z: 558, å: 614,
  ä: 614, ö: 617, é: 606, A: 754, B: 693, C: 723, D: 752, E: 614, F: 594, G: 735, H: 767, I: 456, J: 610, K: 753,
  L: 593, M: 962, N: 783, O: 767, P: 695, Q: 767, R: 712, S: 663, T: 707, U: 736, V: 729, W: 1038, X: 769, Y: 673,
  Z: 650, Å: 754, Ä: 754, Ö: 767, '0': 640, '1': 429, '2': 606, '3': 614, '4': 645, '5': 631, '6': 624, '7': 583,
  '8': 626, '9': 626, '-': 454, '/': 494, '&': 699, ':': 314, '.': 314, ',': 304, '+': 635, '?': 578, '!': 297,
  '·': 314, '%': 936,
};

/** Rubrikens teckenavstånd, i fyrkanter. */
const SPARRNING = -0.03;

/** Bredden på en text i fyrkanter. Okända tecken räknas som breda. */
function bredd(text: string): number {
  let b = 0;
  for (const t of text) b += (TECKEN[t] ?? 760) / 1000 + SPARRNING;
  return b;
}

/** Orden som de får brytas: vid mellanslag och efter bindestreck och snedstreck. */
function delar(rad: string): string[][] {
  return rad
    .split(/\s+/)
    .filter(Boolean)
    .map((ord) => ord.split(/(?<=[-/])/));
}

/** Antal rader rubriken tar i spalten vid en viss storlek. */
function antalRader(title: string, storlek: number): number {
  let rader = 0;
  for (const stycke of title.split('\n')) {
    rader += 1;
    let x = 0;
    for (const ord of delar(stycke)) {
      ord.forEach((del, i) => {
        const b = bredd(del) * storlek;
        const mellan = i === 0 && x > 0 ? bredd(' ') * storlek : 0;
        if (x > 0 && x + mellan + b > SPALT) {
          rader += 1;
          x = b;
        } else {
          x += mellan + b;
        }
      });
    }
  }
  return rader;
}

const STORLEKAR = [84, 76, 68, 62, 56, 50, 46, 42, 38, 34] as const;

/**
 * Största storleken där det längsta ordet ryms på en rad och rubriken tar
 * högst två rader i den största storleken, tre i de mellersta och fyra i
 * de minsta. Då ryms etikett, rubrik och två rader underrad under loggan.
 */
export function titelStorlek(title: string): number {
  const langst = Math.max(...title.split('\n').flatMap((s) => delar(s).flat().map(bredd)), 0.1);
  for (const s of STORLEKAR) {
    if (langst * s > SPALT * 0.98) continue;
    if (antalRader(title, s) <= (s >= 84 ? 2 : s >= 62 ? 3 : 4)) return s;
  }
  return STORLEKAR[STORLEKAR.length - 1];
}

function Logga() {
  const l = 52;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', width: l, height: l + 5, borderRadius: 16, background: OG_LOGGA.klack }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: l,
            height: l,
            borderRadius: 16,
            background: OG_LOGGA.platta,
            color: '#FFFFFF',
            fontSize: 31,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          J
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          marginLeft: 16,
          marginBottom: 5,
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: -0.64,
          lineHeight: 1,
          color: OG_FARG.tran.ink,
        }}
      >
        Jobbcoach
        <span style={{ color: OG_FARG.tran.mjuk }}>.ai</span>
      </div>
    </div>
  );
}

export default function OgFrame(props: OgFrameProps) {
  let eyebrow: string | undefined;
  let title: string;
  let subtitle: string | undefined;
  let illustration: ReactNode;

  if ('variant' in props && props.variant) {
    eyebrow = props.variant === 'letter' ? 'Personligt brev-exempel' : 'CV-exempel';
    title = props.yrke;
    subtitle = undefined;
    illustration = props.variant === 'letter' ? <OgLetterMockup /> : <OgCvMockup />;
  } else {
    eyebrow = props.eyebrow;
    title = props.title;
    subtitle = props.subtitle;
    illustration = props.illustration;
  }

  const t = OG_FARG.tran;
  const storlek = titelStorlek(title);
  // En underrad skriven som uppräkning ("Lön · Arbetsrätt · Intervju") blir
  // brickor, så att raden aldrig bryter med en ensam punkt sist.
  const punkter = subtitle && subtitle.includes(' · ') ? subtitle.split(' · ').map((p) => p.trim()).filter(Boolean) : null;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: t.vagg,
        color: t.ink,
        fontFamily: OG_TYPSNITT,
        // Fast radhöjd i roten: bilden och förhandsvisningen i HTML (som
        // annars ärver sidans 1,5) får samma mått.
        lineHeight: 1.2,
        textAlign: 'left',
      }}
    >
      {/* Väggens två cirklar, som på sajtens hjälte och på omslagen */}
      <div
        style={{
          position: 'absolute',
          left: 610,
          top: -470,
          width: 1040,
          height: 1040,
          borderRadius: 520,
          background: t.vagg2,
          opacity: 0.55,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -330,
          top: 350,
          width: 820,
          height: 820,
          borderRadius: 410,
          background: t.vagg3,
          opacity: 0.6,
        }}
      />

      {/* Vänster: loggan överst, texten mitt i resten */}
      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 0,
          width: SPALT,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 50,
          paddingBottom: 64,
        }}
      >
        <Logga />
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                marginBottom: 16,
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: 1.9,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                color: OG_KOPPAR.ljus,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              fontSize: storlek,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: storlek * SPARRNING,
              whiteSpace: 'pre-line',
              // Jämna rader: ingen ensam sista rad med ett enda ord.
              textWrap: 'balance',
              color: t.ink,
            }}
          >
            {title}
          </div>
          {punkter ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 14 }}>
              {punkter.map((punkt) => (
                <div
                  key={punkt}
                  style={{
                    display: 'flex',
                    marginTop: 10,
                    marginRight: 10,
                    padding: '7px 15px 8px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: t.ink,
                    fontSize: 21,
                    fontWeight: 500,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {punkt}
                </div>
              ))}
            </div>
          ) : subtitle ? (
            <div
              style={{
                display: 'flex',
                marginTop: 20,
                maxWidth: 500,
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.34,
                letterSpacing: -0.13,
                color: t.mjuk,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      {/* Höger: produkten */}
      <div
        style={{
          position: 'absolute',
          left: 600,
          top: 0,
          width: 600,
          height: 630,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {illustration}
      </div>
    </div>
  );
}
