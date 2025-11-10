import { ImageResponse } from 'next/og';
import { siteMetadata } from '../metadata';

export const runtime = 'edge';

export const alt = 'Gratis karriärverktyg från Jobbcoach.ai';
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
          padding: 80,
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 50,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Gratis karriärverktyg
          </div>

          {/* Tools icons/boxes */}
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginTop: 20,
            }}
          >
            {/* CV-analys */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'white',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                📄
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                CV-analys
              </div>
            </div>

            {/* Personligt brev */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'white',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                ✉️
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                Personligt brev
              </div>
            </div>

            {/* Jobbmatchning */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'white',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                🎯
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                Jobbmatchning
              </div>
            </div>

            {/* LinkedIn */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 15,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: 'white',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                💼
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: 'white',
                  fontWeight: '600',
                }}
              >
                LinkedIn
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            Allt du behöver för din jobbsökning
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          Jobbcoach.ai
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
