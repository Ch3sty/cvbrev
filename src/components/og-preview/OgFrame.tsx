/**
 * Gemensam canvas för OG-bilder (1200x630).
 *
 * VIKTIGT: All styling använder inline-style + SVG (inte Tailwind), eftersom
 * koden senare ska flyttas till Next.js ImageResponse som inte stödjer
 * Tailwind-klasser eller box-shadow.
 *
 * Layout:
 * - Vänster (~540px): eyebrow + titel + (subtitle) + jobbcoach.ai-tagg
 * - Höger (~620px): SVG-illustration
 *
 * Stödjer två API:er:
 *
 * 1. **Legacy** (för exempel-sidor): { variant: 'letter' | 'cv', yrke }
 *    Använder OgLetterMockup eller OgCvMockup automatiskt och
 *    "Personligt brev exempel" / "CV exempel" som eyebrow.
 *
 * 2. **Custom** (för verktyg, listsidor etc): { eyebrow, title, subtitle,
 *    illustration } — ger full kontroll över innehållet.
 */

import { ReactNode } from 'react';
import OgLetterMockup from './OgLetterMockup';
import OgCvMockup from './OgCvMockup';

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
  eyebrow: string;
  title: string;
  subtitle?: string;
  illustration: ReactNode;
}

type OgFrameProps = OgFrameLegacyProps | OgFrameCustomProps;

export default function OgFrame(props: OgFrameProps) {
  // Härleder slutliga värden baserat på vilken signatur som används
  let eyebrow: string;
  let title: string;
  let subtitle: string | undefined;
  let illustration: ReactNode;
  let patternKey: string;

  if ('variant' in props && props.variant) {
    eyebrow =
      props.variant === 'letter' ? 'Personligt brev exempel' : 'CV exempel';
    title = props.yrke;
    subtitle = undefined;
    illustration =
      props.variant === 'letter' ? <OgLetterMockup /> : <OgCvMockup />;
    patternKey = props.variant;
  } else {
    eyebrow = props.eyebrow;
    title = props.title;
    subtitle = props.subtitle;
    illustration = props.illustration;
    patternKey = props.eyebrow.toLowerCase().replace(/\s+/g, '-');
  }

  // Dynamisk titelstorlek baserat på längd
  const titleLength = title.length;
  let titleSize = 88;
  if (titleLength > 14) titleSize = 76;
  if (titleLength > 22) titleSize = 60;
  if (titleLength > 32) titleSize = 50;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Prick-pattern overlay */}
      <svg
        width="1200"
        height="630"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <pattern
          id={`og-dots-${patternKey}`}
          x="0"
          y="0"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="14" cy="14" r="1.2" fill="white" />
        </pattern>
        <rect width="1200" height="630" fill={`url(#og-dots-${patternKey})`} />
      </svg>

      {/* Mjuk vinjett-skugga från höger */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 100% 50%, rgba(0,0,0,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      {/* Vänster sida: text */}
      <div
        style={{
          width: 540,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '70px 60px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Eyebrow-pill */}
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            fontSize: 14,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: '#FCD34D',
            }}
          />
          {eyebrow}
        </div>

        {/* Titel — jätte-typografi */}
        <div
          style={{
            color: 'white',
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            marginBottom: subtitle ? 16 : 24,
            textShadow: '0 4px 24px rgba(0,0,0,0.18)',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Subtitle (om present) */}
        {subtitle && (
          <div
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 500,
              opacity: 0.92,
              lineHeight: 1.3,
              marginBottom: 24,
              maxWidth: 460,
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        )}

        {/* jobbcoach.ai-tagg */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'white',
            fontSize: 24,
            fontWeight: 600,
            opacity: 0.95,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: '#FCD34D',
              boxShadow: '0 0 12px rgba(252, 211, 77, 0.6)',
            }}
          />
          jobbcoach.ai
        </div>
      </div>

      {/* Höger sida: illustration */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {illustration}
      </div>

      {/* Subtila dekor-prickar */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          bottom: 40,
          width: 6,
          height: 6,
          borderRadius: 999,
          background: 'white',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 70,
          width: 4,
          height: 4,
          borderRadius: 999,
          background: 'white',
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 40,
          top: 50,
          width: 5,
          height: 5,
          borderRadius: 999,
          background: 'white',
          opacity: 0.35,
        }}
      />
    </div>
  );
}
