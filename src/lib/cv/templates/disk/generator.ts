import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Disk - gratis CV-mall fOr butik, kassa, kundtjanst och frontline-service.
 *
 * Designprinciper:
 *  - Energisk en-kolumn med emerald-accent (#10b981) som handel-DNA
 *  - "Forsaljningsresultat"-pill-rad overst med kvantifierade siffror
 *  - "Kassasystem & verktyg" som egen sektion
 *  - Compact-layout for flexibilitet (deltids/sasong vanligt)
 *  - ATS-saker, inga foton, ingen LinkedIn
 */
function generateDiskHTML(cvData: CVMetadata, _options: any = {}): string {
  // Plocka ut kvantifierade siffror frán experience for "Resultat"-banner
  const resultatSnippets: string[] = [];
  cvData.experience.forEach(exp => {
    if (exp.description) {
      exp.description.forEach(desc => {
        if (/\d+%|\d+\s?(kr|sek|tkr|msek)|\d+\s?(kunder|sålda|värda)/i.test(desc)) {
          if (resultatSnippets.length < 3) resultatSnippets.push(desc.substring(0, 80));
        }
      });
    }
  });

  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                line-height: 1.55;
                color: #1f2937;
                background: white;
                font-size: 13.5px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 28mm 24mm;
            }
            .header {
                margin-bottom: 18px; padding-bottom: 14px;
                border-bottom: 2px solid #10b981;
            }
            .header h1 {
                font-size: 28px; font-weight: 800; color: #064e3b;
                line-height: 1.1; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header .role {
                font-size: 14px; color: #10b981; font-weight: 700; margin-bottom: 10px;
            }
            .meta-line { font-size: 12px; color: #475569; line-height: 1.65; }
            .meta-separator { margin: 0 8px; color: #cbd5e1; }
            .resultat-banner {
                margin: 14px 0 20px; padding: 10px 14px; background: #ecfdf5;
                border-left: 3px solid #10b981; border-radius: 4px;
            }
            .resultat-label {
                font-size: 10px; font-weight: 700; color: #047857;
                text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 4px;
            }
            .resultat-text { font-size: 12.5px; color: #065f46; line-height: 1.5; }
            .summary-block {
                font-size: 13.5px; color: #1f2937; line-height: 1.7; margin-bottom: 22px;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #064e3b;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-left: 10px;
                border-left: 3px solid #10b981;
            }
            .experience-item {
                margin-bottom: 16px; padding-bottom: 16px;
                border-bottom: 1px solid #f1f5f9;
            }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 14px; font-weight: 700; color: #064e3b; flex: 1; min-width: 0; }
            .job-period {
                font-size: 11.5px; color: #64748b; font-weight: 500;
                font-variant-numeric: tabular-nums; flex-shrink: 0;
            }
            .company {
                font-size: 13px; color: #10b981; font-weight: 600;
                margin-bottom: 6px;
            }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12.5px;
                color: #1f2937; line-height: 1.55; margin-bottom: 3px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 0; top: 8px;
                width: 4px; height: 4px; background: #10b981; border-radius: 50%;
            }
            .education-item { margin-bottom: 12px; }
            .education-item:last-child { margin-bottom: 0; }
            .education-header {
                display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
            }
            .degree { font-size: 13.5px; font-weight: 700; color: #064e3b; flex: 1; min-width: 0; }
            .education-year { font-size: 11.5px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .institution { font-size: 12.5px; color: #475569; margin-top: 2px; }
            .skill-group { margin-bottom: 8px; }
            .skill-group-name {
                font-size: 11.5px; font-weight: 700; color: #047857; margin-right: 6px;
            }
            .skill-list { font-size: 13px; color: #1f2937; }
            .language-row {
                display: flex; gap: 8px; margin-bottom: 4px; font-size: 13px;
            }
            .language-name { font-weight: 700; color: #064e3b; }
            .language-level { color: #64748b; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            ${resultatSnippets.length > 0 ? `
            <div class="resultat-banner">
                <div class="resultat-label">Försäljningsresultat</div>
                <div class="resultat-text">${resultatSnippets.join(' · ')}</div>
            </div>` : ''}

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Arbetslivserfarenhet</h2>
                ${cvData.experience.map(exp => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div class="job-title">${exp.position}</div>
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
                    </div>
                    <div class="company">${exp.company}</div>
                    ${exp.description && exp.description.length > 0 ? `
                    <ul class="description-list">
                        ${exp.description.map(d => `<li>${d}</li>`).join('')}
                    </ul>` : ''}
                </div>`).join('')}
            </div>` : ''}

            ${cvData.education.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Utbildning</h2>
                ${cvData.education.map(edu => `
                <div class="education-item">
                    <div class="education-header">
                        <div class="degree">${edu.degree}</div>
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                    </div>
                    <div class="institution">${edu.institution}</div>
                </div>`).join('')}
            </div>` : ''}

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kassasystem & kompetenser</h2>
                ${cvData.skills.map(g => `
                <div class="skill-group">
                    ${g.category ? `<span class="skill-group-name">${g.category}:</span>` : ''}
                    <span class="skill-list">${g.skills.join(', ')}</span>
                </div>`).join('')}
            </div>` : ''}

            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(l => `
                <div class="language-row">
                    <span class="language-name">${l.language}</span>
                    <span class="language-level">— ${l.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const diskTemplate: CVTemplateGenerator = {
  templateId: 'disk' as any,
  generate: generateDiskHTML,
  metadata: {
    name: 'Disk',
    description: 'Gratis CV-mall för butik, kassa och kundnära service',
    category: 'modern',
    tier: 'free'
  }
};
