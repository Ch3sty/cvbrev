import { ImageResponse } from 'next/og';
import { siteMetadata } from '../metadata';

export const runtime = 'edge';

export const alt = '50+ professionella CV-mallar från Jobbcoach.ai';
export const size = {
  width: siteMetadata.ogImage.width,
  height: siteMetadata.ogImage.height,
};
export const contentType = 'image/png';

// Helper function to convert hex to rgba with alpha
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default async function Image() {
  const templates = [
    { color: siteMetadata.brandColors.blue },
    { color: siteMetadata.brandColors.indigo },
    { color: siteMetadata.brandColors.purple },
  ];

  const features = [
    'ATS-optimerade',
    'Branschspecifika',
    'Ändra design med ett knapptryck',
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
          background: siteMetadata.backgroundColors.slate50,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: 60,
        }}
      >
        {/* Background gradient overlay (subtle) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${hexToRgba(siteMetadata.brandColors.blue, 0.07)} 0%, ${hexToRgba(siteMetadata.brandColors.indigo, 0.07)} 50%, ${hexToRgba(siteMetadata.brandColors.purple, 0.07)} 100%)`,
          }}
        />

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
          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: siteMetadata.brandColors.indigo,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            50+ professionella CV-mallar
          </div>

          {/* Template mockups */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 20,
            }}
          >
            {templates.map((template, i) => (
              <div
                key={i}
                style={{
                  width: 220,
                  height: 300,
                  background: siteMetadata.backgroundColors.white,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 24,
                  gap: 12,
                  border: `2px solid ${siteMetadata.backgroundColors.slate200}`,
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15), 0 4px 10px rgba(15, 23, 42, 0.08)',
                }}
              >
                {/* Header bar with accent color */}
                <div
                  style={{
                    width: '100%',
                    height: 24,
                    background: `linear-gradient(135deg, ${hexToRgba(template.color, 0.80)}, ${hexToRgba(template.color, 1.0)})`,
                    borderRadius: 8,
                  }}
                />
                {/* Subheader */}
                <div
                  style={{
                    width: '70%',
                    height: 16,
                    background: hexToRgba(template.color, 0.25),
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '50%',
                    height: 16,
                    background: hexToRgba(template.color, 0.19),
                    borderRadius: 4,
                  }}
                />
                {/* Divider */}
                <div
                  style={{
                    marginTop: 8,
                    width: '100%',
                    height: 2,
                    background: siteMetadata.backgroundColors.slate100,
                  }}
                />
                {/* Content lines */}
                <div
                  style={{
                    width: '100%',
                    height: 12,
                    background: '#E2E8F0',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: 12,
                    background: '#E2E8F0',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '85%',
                    height: 12,
                    background: '#E2E8F0',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    marginTop: 8,
                    width: '100%',
                    height: 2,
                    background: siteMetadata.backgroundColors.slate100,
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: 12,
                    background: '#E2E8F0',
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    width: '95%',
                    height: 12,
                    background: '#E2E8F0',
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 20,
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: siteMetadata.brandColors.green,
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: '600',
                    color: '#475569',
                  }}
                >
                  {feature}
                </div>
              </div>
            ))}
          </div>

          {/* Logo */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#64748B',
              marginTop: 10,
            }}
          >
            Jobbcoach.ai
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
