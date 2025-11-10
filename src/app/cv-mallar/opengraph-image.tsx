import { ImageResponse } from 'next/og';
import { siteMetadata } from '../metadata';

export const runtime = 'edge';

export const alt = '50+ professionella CV-mallar från Jobbcoach.ai';
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
            gap: 40,
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
            50+ professionella CV-mallar
          </div>

          {/* Visual representation of CV templates */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 20,
            }}
          >
            {/* Template preview boxes */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 200,
                  height: 280,
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 20,
                  gap: 10,
                }}
              >
                {/* Mock CV content */}
                <div
                  style={{
                    width: '100%',
                    height: 20,
                    background: 'rgba(37, 99, 235, 0.3)',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '80%',
                    height: 12,
                    background: 'rgba(37, 99, 235, 0.2)',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '60%',
                    height: 12,
                    background: 'rgba(37, 99, 235, 0.2)',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    marginTop: 10,
                    width: '100%',
                    height: 8,
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: 8,
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '90%',
                    height: 8,
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
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
            Optimerade för svenska rekryterare och ATS-system
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
