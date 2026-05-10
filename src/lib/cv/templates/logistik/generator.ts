import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Logistik - gratis CV-mall fOr lager, logistik och transport.
 *
 * Designprinciper:
 *  - "Truck-behOrigheter & kOrkort"-block Overst (matchar GSC: "cv lagerarbetare")
 *  - Industriell typografi (kondenserad sans-serif)
 *  - "WMS-system & verktyg"-sektion
 *  - Robust en-kolumn med stark divider-hierarki
 *  - Cyan accent (#0e7490) - industri-DNA
 *  - ATS-saker
 */
function generateLogistikHTML(cvData: CVMetadata, _options: any = {}): string {
  // Plocka ut behOrigheter/certifikat for top-block
  const behorigheter = cvData.certifications || [];

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
                font-family: 'Roboto', 'Inter', system-ui, sans-serif;
                line-height: 1.55; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 26mm 22mm;
            }
            .header {
                margin-bottom: 14px; padding-bottom: 12px;
                border-bottom: 3px solid #0e7490;
            }
            .header h1 {
                font-size: 28px; font-weight: 800; color: #0c4a6e;
                line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 4px;
            }
            .header .role {
                font-size: 13.5px; color: #0e7490; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
            }
            .meta-line {
                font-size: 11.5px; color: #475569; line-height: 1.65;
                font-family: 'Roboto Mono', 'Consolas', monospace;
            }
            .meta-separator { margin: 0 8px; color: #cbd5e1; }
            .behorighet-block {
                margin: 14px 0 18px; padding: 10px 14px;
                background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px;
            }
            .behorighet-label {
                font-size: 10px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;
            }
            .behorighet-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;
            }
            .behorighet-item {
                font-size: 12px; color: #1f2937; padding-left: 14px; position: relative;
            }
            .behorighet-item::before {
                content: '✓'; position: absolute; left: 0; color: #0e7490; font-weight: 700;
            }
            .summary-block {
                font-size: 13px; color: #1f2937; line-height: 1.7; margin-bottom: 20px;
            }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #0e7490;
            }
            .experience-item { margin-bottom: 14px; }
            .experience-item:last-child { margin-bottom: 0; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 14px; font-weight: 700; color: #0c4a6e; flex: 1; min-width: 0; }
            .job-period {
                font-family: 'Roboto Mono', 'Consolas', monospace;
                font-size: 11px; color: #0e7490; font-weight: 600;
                font-variant-numeric: tabular-nums; flex-shrink: 0;
            }
            .company { font-size: 13px; color: #475569; font-weight: 600; margin-bottom: 6px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12.5px;
                color: #1f2937; line-height: 1.55; margin-bottom: 3px;
            }
            .description-list li::before {
                content: '▸'; position: absolute; left: 0; color: #0e7490;
                font-size: 10px; top: 1px;
            }
            .education-item { margin-bottom: 10px; }
            .education-item:last-child { margin-bottom: 0; }
            .education-header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .degree { font-size: 13px; font-weight: 700; color: #0c4a6e; flex: 1; min-width: 0; }
            .education-year {
                font-family: 'Roboto Mono', monospace;
                font-size: 11px; color: #0e7490; font-weight: 600; flex-shrink: 0;
            }
            .institution { font-size: 12px; color: #475569; margin-top: 2px; }
            .skill-group { margin-bottom: 6px; }
            .skill-group-name { font-size: 11.5px; font-weight: 700; color: #0e7490; margin-right: 6px; }
            .skill-list { font-size: 12.5px; color: #1f2937; }
            .language-row { display: flex; gap: 8px; margin-bottom: 3px; font-size: 12.5px; }
            .language-name { font-weight: 700; color: #0c4a6e; }
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

            ${behorigheter.length > 0 ? `
            <div class="behorighet-block">
                <div class="behorighet-label">Behörigheter & Körkort</div>
                <div class="behorighet-grid">
                    ${behorigheter.map(c => `<div class="behorighet-item">${c.name}</div>`).join('')}
                </div>
            </div>` : ''}

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Yrkeserfarenhet</h2>
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
                <h2 class="section-heading">WMS-system & verktyg</h2>
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

export const logistikTemplate: CVTemplateGenerator = {
  templateId: 'logistik' as any,
  generate: generateLogistikHTML,
  metadata: {
    name: 'Logistik',
    description: 'Gratis CV-mall för lager, logistik och transport',
    category: 'traditional',
    tier: 'free'
  }
};
