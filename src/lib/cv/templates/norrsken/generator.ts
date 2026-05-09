import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Norrsken - gratis CV-mall som ren minimal general-purpose.
 *
 * Ersatter modern-minimal med en mer karaktarsfull men fortfarande
 * neutral baseline-mall. Subtila orange-DNA-detaljer (sajtens
 * varumarkesfarg) som ger karaktar utan att vara nischspecifik.
 *
 * Designprinciper:
 *  - Enkolumn, vansterstalld
 *  - Subtil orange vertikal accent-linje pa sektionsrubriker
 *  - Inter / system-ui body
 *  - Tunna divider-linjer mellan jobb (border-bottom)
 *  - Inga farger pa rubriker - bara size + weight for hierarki
 *  - ATS-saker (inga clip-paths, inga absolute positions)
 */
function generateNorrskenHTML(cvData: CVMetadata, _options: any = {}): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: white;
                font-size: 13.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 30mm 26mm;
            }

            /* === Header === */
            .header {
                margin-bottom: 28px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .header h1 {
                font-size: 30px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.1;
                letter-spacing: -0.015em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 15px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 14px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12.5px;
                color: #64748b;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 30px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 28px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 16px;
                padding-left: 10px;
                border-left: 3px solid #f97316;
                line-height: 1;
            }

            /* === Experience items === */
            .experience-item {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f1f5f9;
            }

            .experience-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 14px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 14.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 12px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .description-list li {
                position: relative;
                padding-left: 16px;
                font-size: 13px;
                color: #1f2937;
                line-height: 1.6;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 9px;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: #f97316;
            }

            /* === Education === */
            .education-item {
                margin-bottom: 14px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .education-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 14px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 13.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 12px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #475569;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Kompetenser === */
            .skills-block {
                line-height: 1.85;
            }

            .skill-group {
                margin-bottom: 8px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 12px;
                font-weight: 700;
                color: #0f172a;
                margin-right: 8px;
            }

            .skill-list {
                font-size: 13px;
                color: #1f2937;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sprak === */
            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 13px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                font-weight: 600;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
            }

            .references {
                margin-top: 28px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #94a3b8;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Header === -->
            <header class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            <!-- === Sammanfattning === -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- === Arbetslivserfarenhet === -->
            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Arbetslivserfarenhet</h2>
                ${cvData.experience
                    .sort((a, b) => {
                        const dateA = a.endDate ? new Date(a.endDate) : new Date();
                        const dateB = b.endDate ? new Date(b.endDate) : new Date();
                        return dateB.getTime() - dateA.getTime();
                    })
                    .map(exp => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div class="job-title">${exp.position}</div>
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
                    </div>
                    <div class="company">${exp.company}</div>
                    ${exp.description && exp.description.length > 0 ? `
                    <ul class="description-list">
                        ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>` : ''}
                </div>`).join('')}
            </div>` : ''}

            <!-- === Utbildning === -->
            ${cvData.education.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Utbildning</h2>
                ${cvData.education
                    .sort((a, b) => {
                        const dateA = a.endDate ? new Date(a.endDate) : (a.graduationYear ? new Date(a.graduationYear + '-12-31') : new Date());
                        const dateB = b.endDate ? new Date(b.endDate) : (b.graduationYear ? new Date(b.graduationYear + '-12-31') : new Date());
                        return dateB.getTime() - dateA.getTime();
                    })
                    .map(edu => `
                <div class="education-item">
                    <div class="education-header">
                        <div class="degree">${edu.degree}</div>
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                    </div>
                    <div class="institution">${edu.institution}</div>
                </div>`).join('')}
            </div>` : ''}

            <!-- === Kompetenser === -->
            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                <div class="skills-block">
                    ${cvData.skills.map(group => `
                    <div class="skill-group">
                        ${group.category ? `<span class="skill-group-name">${group.category}:</span>` : ''}
                        <span class="skill-list">${group.skills.join(', ')}</span>
                    </div>`).join('')}
                </div>
            </div>` : ''}

            <!-- === Sprak === -->
            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(lang => `
                <div class="language-row">
                    <span class="language-name">${lang.language}</span>
                    <span class="language-level">— ${lang.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}

            <!-- Referenser -->
            <div class="references">Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const norrskenTemplate: CVTemplateGenerator = {
  templateId: 'norrsken',
  generate: generateNorrskenHTML,
  metadata: {
    name: 'Norrsken',
    description: 'Ren minimal mall med subtila orange-detaljer för alla branscher',
    category: 'modern',
    tier: 'free'
  }
};
