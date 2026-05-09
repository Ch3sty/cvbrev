import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Atlas - premium executive CV-mall fOr C-suite, VD, styrelseroller.
 *
 * Designprinciper:
 *  - Centrerad header med stort namn (36px) + "EXECUTIVE PROFILE"-eyebrow
 *  - Tunn dubbel-linje under header (signaturmarke)
 *  - Playfair Display fOr namn + Source Serif fOr body
 *  - Black-on-white med deep navy accent (#0F172A)
 *  - Subtila gold-accenter (#A88B5C) pa sektionsrubriker
 *  - Inga foton (executive search vill ha namn-driven CV)
 *  - ATS-saker, inga clip-paths
 */
function generateAtlasHTML(cvData: CVMetadata, _options: any = {}): string {
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
                font-family: 'Source Serif Pro', 'Georgia', 'Times New Roman', serif;
                line-height: 1.65;
                color: #1f2937;
                background: white;
                font-size: 13px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 32mm 30mm;
            }

            /* === Header (centrerad) === */
            .header {
                text-align: center;
                margin-bottom: 32px;
                padding-bottom: 22px;
                position: relative;
            }

            .header::after {
                content: '';
                display: block;
                margin: 22px auto 0;
                width: 80px;
                height: 1px;
                background: #0f172a;
                box-shadow: 0 4px 0 #a88b5c;
            }

            .header h1 {
                font-family: 'Playfair Display', 'Garamond', 'Georgia', serif;
                font-size: 36px;
                font-weight: 600;
                color: #0f172a;
                line-height: 1.05;
                letter-spacing: 0.01em;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                font-style: italic;
                margin-bottom: 14px;
                letter-spacing: 0.02em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12px;
                color: #475569;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 10px;
                color: #cbd5e1;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.8;
                margin-bottom: 32px;
                text-align: justify;
                hyphens: auto;
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
                font-family: 'Source Sans Pro', 'Calibri', sans-serif;
                font-size: 11px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.24em;
                text-align: center;
                margin-bottom: 22px;
                padding-bottom: 8px;
                position: relative;
                line-height: 1;
            }

            .section-heading::after {
                content: '';
                display: block;
                margin: 8px auto 0;
                width: 36px;
                height: 1px;
                background: #a88b5c;
            }

            /* === Experience === */
            .experience-item {
                margin-bottom: 22px;
            }

            .experience-item:last-child {
                margin-bottom: 0;
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
                font-family: 'Playfair Display', 'Garamond', 'Georgia', serif;
                font-size: 15px;
                font-weight: 600;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-family: 'Source Sans Pro', 'Calibri', sans-serif;
                font-size: 11.5px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.04em;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                font-style: italic;
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
                padding-left: 18px;
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.7;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '\\25AA';
                position: absolute;
                left: 4px;
                color: #a88b5c;
                font-size: 10px;
                top: 1px;
            }

            /* === Tva-kolumns botten (Education + Skills) === */
            .bottom-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 28px;
                margin-top: 30px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
            }

            .bottom-col {
                min-width: 0;
            }

            .bottom-heading {
                font-family: 'Source Sans Pro', 'Calibri', sans-serif;
                font-size: 10.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.22em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #a88b5c;
            }

            /* === Education === */
            .education-item {
                margin-bottom: 14px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .degree {
                font-family: 'Playfair Display', 'Garamond', 'Georgia', serif;
                font-size: 13px;
                font-weight: 600;
                color: #0f172a;
                line-height: 1.35;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .institution {
                font-size: 12px;
                color: #475569;
                font-style: italic;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-family: 'Source Sans Pro', 'Calibri', sans-serif;
                font-size: 11px;
                color: #64748b;
                margin-top: 3px;
                letter-spacing: 0.04em;
                font-variant-numeric: tabular-nums;
            }

            /* === Skills === */
            .skill-group {
                margin-bottom: 12px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-family: 'Source Sans Pro', 'Calibri', sans-serif;
                font-size: 10.5px;
                font-weight: 700;
                color: #a88b5c;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 4px;
            }

            .skill-list {
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.65;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 12.5px;
                gap: 8px;
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
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Header (centrerad) -->
            <header class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            <!-- Sammanfattning -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- Arbetslivserfarenhet -->
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

            <!-- Botten-grid: Education + Skills -->
            ${(cvData.education.length > 0 || cvData.skills.length > 0 || (cvData.languages && cvData.languages.length > 0)) ? `
            <div class="bottom-grid">
                <div class="bottom-col">
                    ${cvData.education.length > 0 ? `
                    <h3 class="bottom-heading">Utbildning</h3>
                    ${cvData.education
                        .sort((a, b) => {
                            const dateA = a.endDate ? new Date(a.endDate) : (a.graduationYear ? new Date(a.graduationYear + '-12-31') : new Date());
                            const dateB = b.endDate ? new Date(b.endDate) : (b.graduationYear ? new Date(b.graduationYear + '-12-31') : new Date());
                            return dateB.getTime() - dateA.getTime();
                        })
                        .map(edu => `
                    <div class="education-item">
                        <div class="degree">${edu.degree}</div>
                        <div class="institution">${edu.institution}</div>
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                    </div>`).join('')}
                    ` : ''}
                </div>

                <div class="bottom-col">
                    ${cvData.skills.length > 0 ? `
                    <h3 class="bottom-heading">Kompetenser</h3>
                    ${cvData.skills.map(group => `
                    <div class="skill-group">
                        ${group.category ? `<div class="skill-group-name">${group.category}</div>` : ''}
                        <div class="skill-list">${group.skills.join(' · ')}</div>
                    </div>`).join('')}
                    ` : ''}

                    ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                    <h3 class="bottom-heading" style="margin-top: 18px;">Språk</h3>
                    ${cvData.languages.map(lang => `
                    <div class="language-row">
                        <span class="language-name">${lang.language}</span>
                        <span class="language-level">${lang.proficiency}</span>
                    </div>`).join('')}` : ''}
                </div>
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const atlasTemplate: CVTemplateGenerator = {
  templateId: 'atlas',
  generate: generateAtlasHTML,
  metadata: {
    name: 'Atlas',
    description: 'Centrerad serif-mall för executive och styrelseroller',
    category: 'traditional',
    tier: 'premium'
  }
};
