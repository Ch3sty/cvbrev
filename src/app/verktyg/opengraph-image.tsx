import { ImageResponse } from 'next/og';
import { siteMetadata } from '../metadata';

export const runtime = 'edge';

export const alt = '5 kraftfulla verktyg för din jobbsökning från Jobbcoach.ai';
export const size = {
  width: siteMetadata.ogImage.width,
  height: siteMetadata.ogImage.height,
};
export const contentType = 'image/png';

export default async function Image() {
  const tools = [
    { emoji: '📄', name: 'CV-analys', desc: 'Få expertfeedback', color: siteMetadata.brandColors.green },
    { emoji: '✉️', name: 'Personligt brev', desc: 'ATS-anpassat på 60 sek', color: siteMetadata.brandColors.blue },
    { emoji: '🎯', name: 'Jobbmatchning', desc: 'Hitta rätt tjänster', color: siteMetadata.brandColors.purple },
    { emoji: '💼', name: 'LinkedIn', desc: 'Optimera din profil', color: siteMetadata.brandColors.indigo },
    { emoji: '🧠', name: 'Rekryteringstester', desc: 'Träna obegränsat', color: siteMetadata.brandColors.pink },
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
          background: siteMetadata.backgroundColors.white,
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
            background: `linear-gradient(135deg, ${siteMetadata.brandColors.blue}08 0%, ${siteMetadata.brandColors.indigo}08 50%, ${siteMetadata.brandColors.purple}08 100%)`,
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            zIndex: 1,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${siteMetadata.brandColors.blue} 0%, ${siteMetadata.brandColors.indigo} 50%, ${siteMetadata.brandColors.purple} 100%)`,
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            5 kraftfulla verktyg i en plattform
          </div>

          {/* Tools grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              justifyContent: 'center',
              maxWidth: 1050,
              marginTop: 16,
            }}
          >
            {/* Row 1: 3 tools */}
            {tools.slice(0, 3).map((tool, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: siteMetadata.backgroundColors.white,
                  padding: 24,
                  borderRadius: 16,
                  border: `2px solid ${siteMetadata.backgroundColors.slate100}`,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  width: 320,
                }}
              >
                {/* Icon box with gradient */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    background: `linear-gradient(135deg, ${tool.color}CC, ${tool.color}FF)`,
                    borderRadius: 16,
                    fontSize: 40,
                  }}
                >
                  {tool.emoji}
                </div>
                {/* Tool name */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#0F172A',
                    textAlign: 'center',
                  }}
                >
                  {tool.name}
                </div>
                {/* Description */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    color: '#64748B',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {tool.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: 2 tools (centered) */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            {tools.slice(3, 5).map((tool, i) => (
              <div
                key={i + 3}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  background: siteMetadata.backgroundColors.white,
                  padding: 24,
                  borderRadius: 16,
                  border: `2px solid ${siteMetadata.backgroundColors.slate100}`,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  width: 320,
                }}
              >
                {/* Icon box with gradient */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    background: `linear-gradient(135deg, ${tool.color}CC, ${tool.color}FF)`,
                    borderRadius: 16,
                    fontSize: 40,
                  }}
                >
                  {tool.emoji}
                </div>
                {/* Tool name */}
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#0F172A',
                    textAlign: 'center',
                  }}
                >
                  {tool.name}
                </div>
                {/* Description */}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: '500',
                    color: '#64748B',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}
                >
                  {tool.desc}
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
              marginTop: 4,
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
