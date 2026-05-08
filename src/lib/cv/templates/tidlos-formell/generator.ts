import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Tidlos - gratis formell CV-mall fOr konservativa branscher
 * (juridik, bank, offentlig sektor, akademi).
 *
 * Designprinciper:
 *  - Centrerad symmetrisk header (klassisk symmetri)
 *  - Garamond/Georgia serif typsnitt - signalerar tradition
 *  - UPPERCASE sektion-rubriker omgivna av tunna ─ linjer
 *  - Inga farger fOrutom svart, mOrkgra och en subtil mOrkgrOn accent
 *  - Inga ikoner, inga clip-paths, inga gradient-fOrger
 *  - Vanlig block-flow (ATS-saker)
 *  - 35mm marginal fOr formell luft
 */
function generateTidlosFormellHTML(cvData: CVMetadata, _options: any = {}): string {
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
                font-family: 'Garamond', 'Georgia', 'Times New Roman', serif;
                line-height: 1.65;
                color: #1f2937;
                background: white;
                font-size: 14px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 35mm 30mm;
            }

            /* === Header (centrerad symmetrisk) === */
            .formal-header {
                text-align: center;
                padding-bottom: 24px;
                border-bottom: 1px solid #1f2937;
                margin-bottom: 28px;
            }

            .formal-header h1 {
                font-size: 32px;
                font-weight: 600;
                color: #111827;
                letter-spacing: 0.02em;
                line-height: 1.2;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .formal-header .role {
                font-size: 16px;
                color: #4b5563;
                font-style: italic;
                margin-bottom: 16px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .formal-header .contact-line {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.6;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-line .separator {
                margin: 0 8px;
                color: #9ca3af;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 14px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 32px;
                text-align: justify;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sektioner med ─ linjer === */
            .section {
                margin-bottom: 28px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12px;
                font-weight: 700;
                color: #1f2937;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 18px;
            }

            .section-heading::before,
            .section-heading::after {
                content: '';
                flex: 1;
                height: 1px;
                background: #d1d5db;
            }

            /* === Experience items === */
            .experience-item {
                margin-bottom: 18px;
            }

            .experience-item:last-child {
                margin-bottom: 0;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 16px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 15px;
                font-weight: 600;
                color: #111827;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 13px;
                color: #064e3b;
                font-weight: 500;
                font-style: italic;
                flex-shrink: 0;
            }

            .company {
                font-size: 14px;
                color: #4b5563;
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
                padding-left: 16px;
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.65;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '–';
                position: absolute;
                left: 0;
                color: #6b7280;
            }

            /* === Education items === */
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
                gap: 16px;
                margin-bottom: 2px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 14.5px;
                font-weight: 600;
                color: #111827;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 13px;
                color: #064e3b;
                font-weight: 500;
                font-style: italic;
                flex-shrink: 0;
            }

            .institution {
                font-size: 13.5px;
                color: #4b5563;
                font-style: italic;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Skills som kommaseparerade === */
            .skills-text {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .languages-text {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-entry {
                display: inline-block;
                margin-right: 16px;
            }

            .language-name {
                font-weight: 600;
            }

            .language-level {
                color: #4b5563;
                font-style: italic;
            }

            .references {
                margin-top: 36px;
                padding-top: 20px;
                border-top: 1px solid #d1d5db;
                font-size: 12.5px;
                color: #6b7280;
                font-style: italic;
                text-align: center;
                letter-spacing: 0.02em;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Header === -->
            <header class="formal-header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="contact-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="separator">·</span>${cvData.personalInfo.phone}` : ''}
                </div>
                ${cvData.personalInfo.address ? `
                <div class="contact-line">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
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

            <!-- === Kompetenser (kommaseparerade for formell stil) === -->
            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                <div class="skills-text">
                    ${cvData.skills.flatMap(group =>
                        group.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                    ).join(' · ')}
                </div>
            </div>` : ''}

            <!-- === Sprak === -->
            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språkkunskaper</h2>
                <div class="languages-text">
                    ${cvData.languages.map(lang => `
                    <span class="language-entry"><span class="language-name">${lang.language}</span> <span class="language-level">— ${lang.proficiency}</span></span>`).join('')}
                </div>
            </div>` : ''}

            <!-- Referenser -->
            <div class="references">Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const tidlosFormellTemplate: CVTemplateGenerator = {
  templateId: 'tidlos-formell',
  generate: generateTidlosFormellHTML,
  metadata: {
    name: 'Tidlös',
    description: 'Klassisk formell mall för konservativa branscher',
    category: 'traditional',
    tier: 'free'
  }
};
