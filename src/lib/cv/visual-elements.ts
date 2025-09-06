// src/lib/cv/visual-elements.ts
// Visuella element och hjälpfunktioner för CV-mallar

import { CVMetadata } from './cv-metadata';

import QRCode from 'qrcode';

/**
 * Genererar QR-kod som base64-sträng för LinkedIn/Portfolio
 * Använder riktigt QR-kod paket för professionell kvalitet
 */
export async function generateQRCodeDataURL(url: string): Promise<string> {
  try {
    // Generera QR-kod med hög kvalitet
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    
    // Fallback till placeholder vid fel
    const placeholderSvg = `
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" fill="white" stroke="#ccc" stroke-width="1"/>
        <text x="40" y="40" text-anchor="middle" dy=".3em" font-size="8" fill="#666">QR</text>
      </svg>
    `;
    
    // Safe Buffer usage with fallback
    try {
      if (typeof Buffer !== 'undefined') {
        return `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`;
      } else if (typeof btoa !== 'undefined') {
        return `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
      } else {
        return `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;
      }
    } catch (bufferError) {
      console.warn('Buffer encoding failed in QR fallback, using URL encoding:', bufferError);
      return `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;
    }
  }
}

/**
 * Synkron version för användning i template-generering
 * Använder placeholder och genererar riktig QR-kod asynkront i bakgrunden
 */
export function generateQRCodeDataURLSync(url: string): string {
  // För templates som kräver synkron generering, använda placeholder först
  const placeholderSvg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg" style="border: 2px solid #e5e7eb; border-radius: 8px;">
      <rect width="80" height="80" fill="white"/>
      <g transform="translate(10,10)">
        <rect x="0" y="0" width="8" height="8" fill="#000"/>
        <rect x="16" y="0" width="8" height="8" fill="#000"/>
        <rect x="48" y="0" width="8" height="8" fill="#000"/>
        <rect x="0" y="16" width="8" height="8" fill="#000"/>
        <rect x="48" y="16" width="8" height="8" fill="#000"/>
        <rect x="0" y="48" width="8" height="8" fill="#000"/>
        <rect x="16" y="48" width="8" height="8" fill="#000"/>
        <rect x="48" y="48" width="8" height="8" fill="#000"/>
        <rect x="24" y="24" width="16" height="16" fill="#000"/>
        <rect x="28" y="28" width="8" height="8" fill="#fff"/>
      </g>
      <text x="40" y="65" text-anchor="middle" font-size="6" fill="#666">Portfolio</text>
    </svg>
  `;
  
  // Safe Buffer usage with fallback for environments where Buffer is not available
  try {
    if (typeof Buffer !== 'undefined') {
      return `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`;
    } else {
      // Fallback for environments without Buffer - use btoa if available
      if (typeof btoa !== 'undefined') {
        return `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
      }
      // Last resort: return inline SVG
      return `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;
    }
  } catch (error) {
    console.warn('Buffer encoding failed, using URL encoding fallback:', error);
    return `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;
  }
}

/**
 * Skapar CSS för färdighetsvisualiseringar
 */
export function generateSkillProgressCSS(primaryColor: string): string {
  return `
    .skill-progress {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 4px;
    }
    
    .skill-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}aa);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .skill-tag {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px 4px 2px 0;
      background: ${primaryColor}15;
      color: ${primaryColor};
      border: 1px solid ${primaryColor}30;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 500;
    }
    
    .achievement-metric {
      background: linear-gradient(135deg, ${primaryColor}20, transparent);
      border-left: 3px solid ${primaryColor};
      padding: 8px 12px;
      margin: 4px 0;
      border-radius: 0 6px 6px 0;
    }
    
    .achievement-value {
      font-size: 14pt;
      font-weight: 700;
      color: ${primaryColor};
      display: block;
    }
    
    .achievement-context {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 2px;
    }
  `;
}

/**
 * Genererar ikoner som SVG för olika sektioner
 */
export function generateSectionIcon(iconType: string, color: string): string {
  const icons: Record<string, string> = {
    email: `<path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"/><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"/>`,
    phone: `<path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.653.552 1.918 1.378l.77 2.378a1.5 1.5 0 0 1-.434 1.565l-1.293 1.293a11.035 11.035 0 0 0 4.238 4.238l1.293-1.293a1.5 1.5 0 0 1 1.565-.434l2.378.77A1.5 1.5 0 0 1 17.5 12.628V14a3 3 0 0 1-3 3h-2.25C8.552 17 5 13.448 5 9.25v-2.25Z" clip-rule="evenodd"/>`,
    location: `<path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd"/>`,
    linkedin: `<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>`,
    github: `<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 10.956.558-.085.756-.364.756-.801 0-.39-.014-1.426-.022-2.799-3.338.724-4.043-1.61-4.043-1.61C3.746 16.498 3.014 16.6 3.014 16.6c-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12.017 6c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.814 1.103.814 2.222 0 1.606-.014 2.898-.014 3.293 0 .319.192.694.801.576C20.565 21.795 24 17.3 24 12.017 24 5.367 18.63.001 12.017.001z"/>`
  };

  const pathData = icons[iconType] || icons.email;
  
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      ${pathData}
    </svg>
  `;
}

/**
 * Skapar avancerad timeline för arbetslivserfarenhet
 */
export function generateTimelineCSS(primaryColor: string): string {
  return `
    .experience-timeline {
      position: relative;
      padding-left: 2cm;
    }
    
    .experience-timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, ${primaryColor}, ${primaryColor}40);
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 1.5cm;
      background: white;
      padding: 1cm;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-left: 4px solid ${primaryColor};
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -1.2cm;
      top: 1cm;
      width: 12px;
      height: 12px;
      background: ${primaryColor};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px ${primaryColor}30;
    }
    
    .timeline-duration {
      position: absolute;
      left: -3.5cm;
      top: 0.8cm;
      background: ${primaryColor};
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 600;
      white-space: nowrap;
    }
  `;
}

/**
 * Beräknar färdighetsnivå baserat på erfarenhet eller keywords
 */
export function calculateSkillLevel(skill: string, experience: any[], projects: any[]): number {
  // Enkel heuristik - i produktionen skulle detta vara mer sofistikerat
  let score = 50; // Baseline
  
  // Kolla erfarenhet
  const experienceText = experience.map(exp => 
    [...exp.description, ...exp.achievements].join(' ')
  ).join(' ').toLowerCase();
  
  if (experienceText.includes(skill.toLowerCase())) {
    score += 20;
  }
  
  // Kolla projekt
  const projectText = projects.map(proj => 
    [proj.description, ...(proj.technologies || [])].join(' ')
  ).join(' ').toLowerCase();
  
  if (projectText.includes(skill.toLowerCase())) {
    score += 15;
  }
  
  return Math.min(100, score);
}

/**
 * Extraherar kvantifierbara prestationer från text
 */
export function extractAchievements(text: string): Array<{metric: string, value: string, context: string}> {
  const achievements: Array<{metric: string, value: string, context: string}> = [];
  
  // Regex för vanliga metriker
  const patterns = [
    /(\d+)%\s*(ökning|minskning|förbättring|improvement|increase|decrease)/gi,
    /(\d+(?:,\d+)?)\s*(miljoner|million|tusen|thousand|SEK|USD|EUR)/gi,
    /(\d+)\s*(personer|team|people|år|year|månad|month)/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      achievements.push({
        metric: match[2] || 'improvement',
        value: match[1],
        context: match[0]
      });
    }
  });
  
  return achievements.slice(0, 5); // Begränsa till 5 achievements
}

/**
 * Genererar portfolio sektion för kreativa roller
 */
export function generatePortfolioSection(projects: any[], primaryColor: string): string {
  if (!projects || projects.length === 0) {
    return '';
  }

  const projectItems = projects.map(project => `
    <div class="portfolio-item">
      <h4 class="project-title">${project.name}</h4>
      <p class="project-description">${project.description}</p>
      ${project.technologies ? `
        <div class="tech-tags">
          ${project.technologies.map((tech: string) => 
            `<span class="skill-tag">${tech}</span>`
          ).join('')}
        </div>
      ` : ''}
      ${project.achievements ? `
        <ul class="project-achievements">
          ${project.achievements.map((achievement: string) => 
            `<li>${achievement}</li>`
          ).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');

  return `
    <section class="section portfolio-section">
      <h3 class="section-title">Portfolio & Projekt</h3>
      <div class="portfolio-grid">
        ${projectItems}
      </div>
    </section>
  `;
}

/**
 * CSS för portfolio sektion
 */
export function getPortfolioCSS(primaryColor: string): string {
  return `
    .portfolio-section {
      margin-top: 2cm;
    }
    
    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1cm;
    }
    
    .portfolio-item {
      background: white;
      padding: 1cm;
      border-radius: 8px;
      border-left: 4px solid ${primaryColor};
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .project-title {
      font-size: 11pt;
      font-weight: 700;
      color: ${primaryColor};
      margin-bottom: 0.5cm;
    }
    
    .project-description {
      font-size: 9pt;
      line-height: 1.4;
      margin-bottom: 0.5cm;
      color: #374151;
    }
    
    .tech-tags {
      margin-bottom: 0.5cm;
    }
    
    .project-achievements {
      list-style: none;
      margin: 0;
    }
    
    .project-achievements li {
      font-size: 8pt;
      color: #6b7280;
      margin-bottom: 0.2cm;
      position: relative;
      padding-left: 0.8cm;
    }
    
    .project-achievements li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${primaryColor};
      font-weight: bold;
    }
  `;
}