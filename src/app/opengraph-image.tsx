import { ImageResponse } from 'next/og';
import { siteMetadata } from './metadata';

export const runtime = 'edge';

export const alt = siteMetadata.defaultDescription;
export const size = {
  width: siteMetadata.ogImage.width,
  height: siteMetadata.ogImage.height,
};
export const contentType = 'image/png';

export default async function Image() {
  const features = [
    { emoji: '📝', text: 'Skapa ATS-anpassade personliga brev & CV:n' },
    { emoji: '🎯', text: 'Hitta tjänster som matchar dina kompetenser' },
    { emoji: '🎨', text: 'Ändra din CV-design med några få knapptryck' },
    { emoji: '🧠', text: 'Träna obegränsat på rekryteringstester' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #FDF4FF 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 60,
        }}
      >
        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: siteMetadata.brandColors.indigo,
              letterSpacing: '-0.02em',
            }}
          >
            Jobbcoach.ai
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              fontWeight: '600',
              color: '#0F172A',
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            CV, personligt brev, jobbmatchning & rekryteringstester
          </div>

          {/* Features grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              justifyContent: 'center',
              maxWidth: 1000,
              marginTop: 20,
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: siteMetadata.backgroundColors.white,
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: `2px solid ${siteMetadata.backgroundColors.slate200}`,
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.06)',
                  width: 460,
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {feature.emoji}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: '#475569',
                    flex: 1,
                    lineHeight: 1.3,
                  }}
                >
                  {feature.text}
                </div>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: '600',
              color: '#64748B',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            {siteMetadata.tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
