import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Linje - premium minimalistisk Swiss-design CV-mall.
 *
 * Designprinciper:
 *  - HELT monokrom: bara svart, vit, tva gratoner. INGEN accentfarg.
 *  - Asymmetrisk header: stort namn vanster, vertikal linje, kontaktinfo hoger
 *  - Inter / Helvetica Neue body (Swiss-standard)
 *  - Sektion-rubriker som tunna linjer + text
 *  - Hairline 1px linjer som dividers
 *  - Tabular-nums for datum, hogerstallda
 *  - Mycket whitespace
 *  - Ingen foto-stOd (minimal ar minimal)
 *  - LinkedIn som diskret lank-text
 *  - ATS-saker
 */
function generateLinjeHTML(cvData: CVMetadata, options: any = {}): string {
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

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
                font-family: 'Helvetica Neue', 'Inter', 'Helvetica', 'Arial', sans-serif;
                line-height: 1.6;
                color: #000000;
                background: white;
                font-size: 12.5px;
                -webkit-font-smoothing: antialiased;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 32mm 28mm;
            }

            /* Asymmetrisk header */
            .header {
                display: flex;
                gap: 32px;
                margin-bottom: 36px;
                padding-bottom: 24px;
                border-bottom: 1px solid #000000;
            }

            .header-name-col {
                flex: 1;
                min-width: 0;
            }

            .header h1 {
                font-size: 36px;
                font-weight: 500;
                color: #000000;
                line-height: 1.0;
                letter-spacing: -0.025em;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 14px;
                color: #404040;
                font-weight: 400;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header-contact-col {
                flex: 0 0 200px;
                border-left: 1px solid #000000;
                padding-left: 24px;
                font-size: 11px;
                color: #404040;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-row {
                margin-bottom: 4px;
            }

            .contact-row:last-child {
                margin-bottom: 0;
            }

            .contact-label {
                color: #888888;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                display: block;
                margin-bottom: 1px;
            }

            .linkedin-link {
                color: #000000;
                font-weight: 500;
                text-decoration: underline;
                text-decoration-thickness: 0.5px;
                text-underline-offset: 2px;
            }

            /* Sammanfattning */
            .summary-block {
                font-size: 13px;
                color: #000000;
                line-height: 1.75;
                margin-bottom: 36px;
                max-width: 90%;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* Sektioner */
            .section {
                margin-bottom: 32px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 10px;
                font-weight: 500;
                color: #000000;
                text-transform: uppercase;
                letter-spacing: 0.22em;
                margin-bottom: 18px;
                line-height: 1;
            }

            .section-heading::after {
                content: '';
                flex: 1;
                height: 1px;
                background: #000000;
            }

            /* Experience */
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
                gap: 16px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 14px;
                font-weight: 500;
                color: #000000;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11px;
                color: #888888;
                font-weight: 400;
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.04em;
                flex-shrink: 0;
                text-align: right;
            }

            .company {
                font-size: 12.5px;
                color: #404040;
                font-weight: 400;
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
                font-size: 12.5px;
                color: #000000;
                line-height: 1.65;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 11px;
                width: 8px;
                height: 1px;
                background: #000000;
            }

            /* Education */
            .education-item {
                margin-bottom: 16px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .education-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 16px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 13px;
                font-weight: 500;
                color: #000000;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 11px;
                color: #888888;
                font-weight: 400;
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.04em;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12px;
                color: #404040;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* Skills - typografisk lista */
            .skill-group {
                margin-bottom: 10px;
                display: flex;
                gap: 12px;
                align-items: baseline;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                flex: 0 0 110px;
                font-size: 10.5px;
                font-weight: 500;
                color: #888888;
                text-transform: uppercase;
                letter-spacing: 0.14em;
            }

            .skill-list {
                flex: 1;
                font-size: 12.5px;
                color: #000000;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* Languages */
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
                font-weight: 500;
                color: #000000;
            }

            .language-level {
                color: #888888;
                font-size: 11px;
                letter-spacing: 0.04em;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                <div class="header-name-col">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                </div>
                <div class="header-contact-col">
                    ${cvData.personalInfo.email ? `
                    <div class="contact-row">
                        <span class="contact-label">E-post</span>
                        ${cvData.personalInfo.email}
                    </div>` : ''}
                    ${cvData.personalInfo.phone ? `
                    <div class="contact-row">
                        <span class="contact-label">Telefon</span>
                        ${cvData.personalInfo.phone}
                    </div>` : ''}
                    ${cvData.personalInfo.address ? `
                    <div class="contact-row">
                        <span class="contact-label">Plats</span>
                        ${formatSwedishAddress(cvData.personalInfo.address)}
                    </div>` : ''}
                    ${includeLinkedIn ? `
                    <div class="contact-row">
                        <span class="contact-label">LinkedIn</span>
                        <a class="linkedin-link" href="${linkedInUrl}">${linkedInUrl.replace(/^https?:\/\//, '')}</a>
                    </div>` : ''}
                </div>
            </header>

            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

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
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' — ' + exp.endDate : (exp.startDate ? ' — Pågående' : '')}</div>
                    </div>
                    <div class="company">${exp.company}</div>
                    ${exp.description && exp.description.length > 0 ? `
                    <ul class="description-list">
                        ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>` : ''}
                </div>`).join('')}
            </div>` : ''}

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
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' — ' + edu.endDate : ''}</div>
                    </div>
                    <div class="institution">${edu.institution}</div>
                </div>`).join('')}
            </div>` : ''}

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                ${cvData.skills.map(group => `
                <div class="skill-group">
                    <span class="skill-group-name">${group.category || 'Övrigt'}</span>
                    <span class="skill-list">${group.skills.join(', ')}</span>
                </div>`).join('')}
            </div>` : ''}

            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(lang => `
                <div class="language-row">
                    <span class="language-name">${lang.language}</span>
                    <span class="language-level">${lang.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const linjeTemplate: CVTemplateGenerator = {
  templateId: 'linje',
  generate: generateLinjeHTML,
  metadata: {
    name: 'Linje',
    description: 'Minimalistisk Swiss-design — helt monokrom, ingen accentfärg',
    category: 'modern',
    tier: 'premium'
  }
};
