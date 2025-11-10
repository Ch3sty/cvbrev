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
          background: `linear-gradient(135deg, ${siteMetadata.brandColors.blue} 0%, ${siteMetadata.brandColors.purple} 50%, ${siteMetadata.brandColors.pink} 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logotype */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 60,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.05em',
              textAlign: 'center',
            }}
          >
            Jobbcoach.ai
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            maxWidth: 1000,
            lineHeight: 1.4,
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          CV, personligt brev och jobbmatchning i Sverige
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            Gratis verktyg för jobbsökare
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
