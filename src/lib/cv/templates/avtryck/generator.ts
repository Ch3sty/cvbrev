import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Avtryck - premium creative CV-mall i retro/vintage stil.
 *
 * Designprinciper:
 *  - Cream/elfenben bakgrund (#fef3e8) over hela sidan
 *  - Decorative ramning runt hela CV:t (terracotta border + inre line)
 *  - Stort serif-namn (Fraunces/Playfair) 36px
 *  - Roll i italic terracotta (#9a3412)
 *  - Sektion-rubriker med decorative ornament
 *  - En kolumn, ingen foto-stOd
 *  - LinkedIn som elegant lank
 *  - ATS-saker
 */
function generateAvtryckHTML(cvData: CVMetadata, options: any = {}): string {
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
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                line-height: 1.7;
                color: #1c1917;
                background: #fef3e8;
                font-size: 13px;
            }

            /* CV-container: cream background tar hela sidan.
               Vid PDF-utskrift bryts inte ramar mitt i sektioner tack
               vare page-break-rules. Ingen absolutpositionerad ram -
               istallet anvander vi border + outline direkt pa content
               sa inramningen aterges pa varje sida som genereras. */
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: #fef3e8;
                padding: 22mm 20mm;
            }

            /* Inner frame: dubbel border via border + outline-offset.
               Outline ar PDF-sakert och bryts korrekt over sidor. */
            .content {
                border: 1px solid #9a3412;
                outline: 0.5px solid rgba(154, 52, 18, 0.4);
                outline-offset: 4px;
                padding: 14mm 12mm;
                background: #fef3e8;
            }

            /* Forhindra page-break inuti sektioner och experience items
               sa de inte splittas konstigt mellan sidor. */
            .section,
            .experience-item,
            .education-item {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            /* Header */
            .header {
                text-align: center;
                margin-bottom: 28px;
                padding-bottom: 22px;
                position: relative;
                page-break-after: avoid;
                break-after: avoid;
            }

            .header::after {
                content: '✦';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%) translateY(50%);
                font-size: 14px;
                color: #9a3412;
                background: #fef3e8;
                padding: 0 8px;
            }

            .header h1 {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 38px;
                font-weight: 700;
                color: #1c1917;
                line-height: 1.05;
                letter-spacing: -0.01em;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 15px;
                color: #9a3412;
                font-weight: 500;
                font-style: italic;
                margin-bottom: 14px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 11.5px;
                color: #57534e;
                line-height: 1.7;
                font-style: italic;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 10px;
                color: #d6d3d1;
            }

            .linkedin-link {
                color: #9a3412;
                font-weight: 500;
                text-decoration: underline;
                text-decoration-thickness: 0.5px;
                text-underline-offset: 2px;
            }

            /* Border-bottom efter header */
            .header-divider {
                border-top: 1px solid #9a3412;
                margin-top: 18px;
                width: 60%;
                margin-left: auto;
                margin-right: auto;
            }

            .summary-block {
                font-size: 14px;
                color: #1c1917;
                line-height: 1.85;
                margin-bottom: 32px;
                text-align: center;
                font-style: italic;
                max-width: 88%;
                margin-left: auto;
                margin-right: auto;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .section {
                margin-bottom: 28px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 13px;
                font-weight: 700;
                color: #1c1917;
                text-transform: uppercase;
                letter-spacing: 0.32em;
                text-align: center;
                margin-bottom: 22px;
                padding-bottom: 0;
                position: relative;
            }

            .section-heading::before,
            .section-heading::after {
                content: '—';
                color: #9a3412;
                font-weight: 400;
                margin: 0 14px;
            }

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
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 15px;
                font-weight: 700;
                color: #1c1917;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11.5px;
                color: #9a3412;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                font-style: italic;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #57534e;
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
                color: #1c1917;
                line-height: 1.7;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '◆';
                position: absolute;
                left: 0;
                top: 1px;
                color: #9a3412;
                font-size: 9px;
            }

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
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 14px;
                font-weight: 700;
                color: #1c1917;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 11.5px;
                color: #9a3412;
                font-weight: 600;
                font-style: italic;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #57534e;
                font-style: italic;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-group {
                margin-bottom: 10px;
                text-align: center;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 11px;
                font-weight: 700;
                color: #9a3412;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                display: block;
                margin-bottom: 4px;
            }

            .skill-list {
                font-size: 13px;
                color: #1c1917;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-row {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-bottom: 5px;
                font-size: 13px;
            }

            .language-name {
                font-weight: 700;
                color: #1c1917;
            }

            .language-level {
                color: #57534e;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <div class="content">
                <header class="header">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="meta-line">
                        ${cvData.personalInfo.email || ''}
                        ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                        ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                        ${includeLinkedIn ? `<span class="meta-separator">·</span><a class="linkedin-link" href="${linkedInUrl}">LinkedIn</a>` : ''}
                    </div>
                    <div class="header-divider"></div>
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
                            <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
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
                            <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                        </div>
                        <div class="institution">${edu.institution}</div>
                    </div>`).join('')}
                </div>` : ''}

                ${cvData.skills.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Kompetenser</h2>
                    ${cvData.skills.map(group => `
                    <div class="skill-group">
                        ${group.category ? `<span class="skill-group-name">${group.category}</span>` : ''}
                        <span class="skill-list">${group.skills.join(' · ')}</span>
                    </div>`).join('')}
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Språk</h2>
                    ${cvData.languages.map(lang => `
                    <div class="language-row">
                        <span class="language-name">${lang.language}</span>
                        <span class="language-level">— ${lang.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}
            </div>
        </div>
    </body>
    </html>
  `;
}

export const avtryckTemplate: CVTemplateGenerator = {
  templateId: 'avtryck',
  generate: generateAvtryckHTML,
  metadata: {
    name: 'Avtryck',
    description: 'Premium retro-mall med cream-bakgrund, ramning och vintage-typografi',
    category: 'creative',
    tier: 'premium'
  }
};
