import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Verkstad - gratis CV-mall fOr industri, maskin och produktion (icke-IT-ingenjOrer).
 *
 * Designprinciper:
 *  - MOrk grafit-accent (#374151) signalerar industri
 *  - "Tekniska system & CAD"-sektion (PLC, SCADA, SolidWorks, Catia)
 *  - "Standarder & certifikat" (CE, ISO 9001, ATEX, EN)
 *  - Tabellar projektmeriter
 *  - Mono-font pa datum
 *  - ATS-saker
 */
function generateVerkstadHTML(cvData: CVMetadata, _options: any = {}): string {
  const certifieringar = cvData.certifications || [];

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
                line-height: 1.55; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 28mm 24mm;
            }
            .header {
                margin-bottom: 16px; padding-bottom: 14px;
                border-bottom: 1px solid #374151;
                position: relative;
            }
            .header::before {
                content: ''; position: absolute; bottom: -1px; left: 0;
                width: 80px; height: 3px; background: #374151;
            }
            .header h1 {
                font-size: 28px; font-weight: 700; color: #111827;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header .role {
                font-size: 14px; color: #4b5563; font-weight: 600; margin-bottom: 10px;
            }
            .meta-line {
                font-size: 12px; color: #6b7280; line-height: 1.65;
            }
            .meta-separator { margin: 0 8px; color: #d1d5db; }
            .summary-block {
                font-size: 13px; color: #1f2937; line-height: 1.7; margin-bottom: 22px;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 700; color: #111827;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-bottom: 4px;
                border-bottom: 1px solid #d1d5db;
            }
            .experience-item {
                margin-bottom: 14px; padding-bottom: 14px;
                border-bottom: 1px dashed #e5e7eb;
            }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 14px; font-weight: 700; color: #111827; flex: 1; min-width: 0; }
            .job-period {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 11px; color: #4b5563; font-weight: 500;
                font-variant-numeric: tabular-nums; flex-shrink: 0;
            }
            .company { font-size: 12.5px; color: #4b5563; font-weight: 600; margin-bottom: 6px; font-style: italic; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12.5px;
                color: #1f2937; line-height: 1.6; margin-bottom: 3px;
            }
            .description-list li::before {
                content: '–'; position: absolute; left: 0; color: #9ca3af; font-weight: 700;
            }
            .cert-block {
                margin: 14px 0 18px; padding: 12px 16px;
                background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;
            }
            .cert-label {
                font-size: 10px; font-weight: 700; color: #374151;
                text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;
            }
            .cert-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;
            }
            .cert-item {
                font-size: 12px; color: #1f2937; padding-left: 12px;
                position: relative;
            }
            .cert-item::before {
                content: '◆'; position: absolute; left: 0;
                color: #374151; font-size: 9px; top: 1px;
            }
            .education-item { margin-bottom: 12px; }
            .education-item:last-child { margin-bottom: 0; }
            .education-header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .degree { font-size: 13px; font-weight: 700; color: #111827; flex: 1; min-width: 0; }
            .education-year {
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px; color: #4b5563; font-weight: 500; flex-shrink: 0;
            }
            .institution { font-size: 12px; color: #4b5563; margin-top: 2px; font-style: italic; }
            .skill-group { margin-bottom: 6px; }
            .skill-group-name { font-size: 11.5px; font-weight: 700; color: #374151; margin-right: 6px; }
            .skill-list { font-size: 12.5px; color: #1f2937; }
            .language-row { display: flex; gap: 8px; margin-bottom: 3px; font-size: 12.5px; }
            .language-name { font-weight: 700; color: #111827; }
            .language-level { color: #6b7280; }
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

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            ${certifieringar.length > 0 ? `
            <div class="cert-block">
                <div class="cert-label">Standarder & Certifikat</div>
                <div class="cert-grid">
                    ${certifieringar.map(c => `<div class="cert-item">${c.name}</div>`).join('')}
                </div>
            </div>` : ''}

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
                <h2 class="section-heading">Tekniska system & CAD</h2>
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

export const verkstadTemplate: CVTemplateGenerator = {
  templateId: 'verkstad' as any,
  generate: generateVerkstadHTML,
  metadata: {
    name: 'Verkstad',
    description: 'Gratis CV-mall för industri, maskin och produktion',
    category: 'traditional',
    tier: 'free'
  }
};
