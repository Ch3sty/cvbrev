import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Konto - gratis CV-mall fOr ekonomi, redovisning, finans och HR.
 *
 * Designprinciper:
 *  - Strukturerad tabell-layout med tabular-nums
 *  - "Redovisningssystem"-sektion (Visma, Fortnox, SAP, Hogia)
 *  - "Certifieringar"-block (Far, auktoriserad redovisningskonsult)
 *  - MOrkbla (#1e3a8a) - bank/finans-DNA
 *  - Mono-font pa siffror
 *  - ATS-saker
 */
function generateKontoHTML(cvData: CVMetadata, _options: any = {}): string {
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
                font-variant-numeric: tabular-nums;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 28mm 24mm;
            }
            .header {
                margin-bottom: 16px; padding-bottom: 12px;
                border-bottom: 3px double #1e3a8a;
            }
            .header h1 {
                font-size: 28px; font-weight: 700; color: #1e3a8a;
                line-height: 1.05; margin-bottom: 4px;
            }
            .header .role {
                font-size: 13.5px; color: #3730a3; font-weight: 600; margin-bottom: 8px;
            }
            .meta-line {
                font-size: 11.5px; color: #475569; line-height: 1.65;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            .meta-separator { margin: 0 8px; color: #cbd5e1; }
            .summary-block {
                font-size: 13px; color: #1f2937; line-height: 1.7; margin-bottom: 22px;
            }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 700; color: #1e3a8a;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-bottom: 4px;
                border-bottom: 1px solid #1e3a8a;
            }
            .experience-table { width: 100%; border-collapse: collapse; }
            .experience-row {
                display: grid; grid-template-columns: 1fr 90px;
                gap: 12px; padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .experience-row:last-child { border-bottom: none; }
            .experience-info { min-width: 0; }
            .job-title { font-size: 13.5px; font-weight: 700; color: #1e3a8a; margin-bottom: 2px; }
            .company { font-size: 12.5px; color: #475569; font-weight: 600; margin-bottom: 4px; }
            .job-period {
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 11px; color: #475569; font-weight: 500;
                text-align: right;
            }
            .description-list { list-style: none; padding: 0; margin: 4px 0 0 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.55; margin-bottom: 2px;
            }
            .description-list li::before {
                content: '›'; position: absolute; left: 0; color: #1e3a8a;
                font-weight: 700; font-size: 12px;
            }
            .education-item { margin-bottom: 10px; }
            .education-item:last-child { margin-bottom: 0; }
            .education-header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .degree { font-size: 13px; font-weight: 700; color: #1e3a8a; flex: 1; min-width: 0; }
            .education-year {
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px; color: #475569; font-weight: 500; flex-shrink: 0;
            }
            .institution { font-size: 12px; color: #475569; margin-top: 2px; }
            .skill-group { margin-bottom: 6px; }
            .skill-group-name {
                font-size: 11px; font-weight: 700; color: #1e3a8a;
                text-transform: uppercase; letter-spacing: 0.06em; margin-right: 6px;
            }
            .skill-list { font-size: 12.5px; color: #1f2937; }
            .language-row {
                display: flex; justify-content: space-between; gap: 8px;
                margin-bottom: 3px; font-size: 12.5px;
                padding: 3px 0; border-bottom: 1px dotted #e5e7eb;
            }
            .language-row:last-child { border-bottom: none; }
            .language-name { font-weight: 700; color: #1e3a8a; }
            .language-level { color: #64748b; font-style: italic; }
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

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Arbetslivserfarenhet</h2>
                <div class="experience-table">
                    ${cvData.experience.map(exp => `
                    <div class="experience-row">
                        <div class="experience-info">
                            <div class="job-title">${exp.position}</div>
                            <div class="company">${exp.company}</div>
                            ${exp.description && exp.description.length > 0 ? `
                            <ul class="description-list">
                                ${exp.description.map(d => `<li>${d}</li>`).join('')}
                            </ul>` : ''}
                        </div>
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? '<br>– ' + exp.endDate : (exp.startDate ? '<br>– Pågående' : '')}</div>
                    </div>`).join('')}
                </div>
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
                <h2 class="section-heading">Redovisningssystem & kompetenser</h2>
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
                    <span class="language-level">${l.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const kontoTemplate: CVTemplateGenerator = {
  templateId: 'konto' as any,
  generate: generateKontoHTML,
  metadata: {
    name: 'Konto',
    description: 'Gratis CV-mall för ekonomi, redovisning och finans',
    category: 'modern',
    tier: 'free'
  }
};
