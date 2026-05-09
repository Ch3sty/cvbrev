import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Klinik - premium CV-mall fOr lakare/specialistlakare.
 *
 * Designprinciper:
 *  - Centrerad header med namn + specialitet
 *  - 2 kolumner: erfarenhet vanster + specialiseringar/publikationer hoger
 *  - Section: "Klinisk tjanstgoring" istallet for arbetslivserfarenhet
 *  - Subtil burgundy-accent (#7c2d12 dampad ~ #9f1239)
 *  - Source Serif Pro body (akademisk kansla)
 *  - Ingen foto-stOd (lakare-CV ar meriter-drivna), men LinkedIn
 *  - ATS-saker
 */
function generateKlinikHTML(cvData: CVMetadata, options: any = {}): string {
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Filtrera skills (utan sprak)
  const allSkills = cvData.skills.flatMap(group =>
    group.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
  );

  const certifikat = cvData.certifications || [];
  const projekt = cvData.projects || [];

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
                font-size: 12.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 28mm 26mm;
            }

            /* === Header (centrerad) === */
            .header {
                text-align: center;
                margin-bottom: 24px;
                padding-bottom: 18px;
                border-bottom: 1.5px solid #9f1239;
            }

            .header h1 {
                font-size: 32px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.05;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 14px;
                color: #9f1239;
                font-weight: 600;
                font-style: italic;
                margin-bottom: 10px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 11.5px;
                color: #475569;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            .linkedin-link {
                color: #9f1239;
                font-weight: 500;
                text-decoration: none;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 24px;
                text-align: justify;
                hyphens: auto;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Body grid 65/35 === */
            .body-grid {
                display: grid;
                grid-template-columns: 1fr 200px;
                gap: 26px;
                align-items: start;
            }

            .main-col, .side-col {
                min-width: 0;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 22px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #9f1239;
            }

            .side-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 11px;
                padding-bottom: 5px;
                border-bottom: 1px solid #e5e7eb;
            }

            /* === Experience === */
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
                gap: 12px;
                margin-bottom: 3px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 13.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .company {
                font-size: 12.5px;
                color: #9f1239;
                font-weight: 600;
                font-style: italic;
                margin-bottom: 7px;
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
                font-size: 12px;
                color: #1f2937;
                line-height: 1.6;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '\\25AA';
                position: absolute;
                left: 4px;
                color: #9f1239;
                font-size: 9px;
                top: 1px;
            }

            /* === Side panel === */
            .cert-row {
                font-size: 11.5px;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cert-row:last-child {
                margin-bottom: 0;
            }

            .cert-name {
                font-weight: 700;
                color: #0f172a;
            }

            .cert-issuer {
                color: #64748b;
                font-style: italic;
                font-size: 11px;
            }

            .skill-list-side {
                font-size: 11.5px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .project-row {
                font-size: 11.5px;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .project-row:last-child {
                margin-bottom: 0;
            }

            .project-name {
                font-weight: 700;
                color: #0f172a;
            }

            /* === Education === */
            .education-item {
                margin-bottom: 12px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .education-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 12px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 13px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12px;
                color: #475569;
                font-style: italic;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 11.5px;
                gap: 8px;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                font-weight: 700;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
                font-style: italic;
                font-size: 11px;
            }
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
                    ${includeLinkedIn ? `<span class="meta-separator">·</span><a class="linkedin-link" href="${linkedInUrl}">LinkedIn</a>` : ''}
                </div>
            </header>

            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <div class="body-grid">
                <div class="main-col">
                    ${cvData.experience.length > 0 ? `
                    <div class="section">
                        <h2 class="section-heading">Klinisk tjänstgöring</h2>
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
                </div>

                <div class="side-col">
                    ${certifikat.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Legitimation & specialistbevis</h3>
                        ${certifikat.map(cert => `
                        <div class="cert-row">
                            <div class="cert-name">${cert.name}</div>
                            ${cert.issuer ? `<div class="cert-issuer">${cert.issuer}</div>` : ''}
                        </div>`).join('')}
                    </div>` : ''}

                    ${allSkills.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Kompetensområden</h3>
                        <div class="skill-list-side">${allSkills.slice(0, 14).join(' · ')}</div>
                    </div>` : ''}

                    ${projekt.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Publikationer & projekt</h3>
                        ${projekt.slice(0, 4).map(p => `
                        <div class="project-row">
                            <div class="project-name">${p.name || p.title || ''}</div>
                            ${p.description ? `<div>${p.description}</div>` : ''}
                        </div>`).join('')}
                    </div>` : ''}

                    ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Språk</h3>
                        ${cvData.languages.map(lang => `
                        <div class="language-row">
                            <span class="language-name">${lang.language}</span>
                            <span class="language-level">${lang.proficiency}</span>
                        </div>`).join('')}
                    </div>` : ''}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const klinikTemplate: CVTemplateGenerator = {
  templateId: 'klinik',
  generate: generateKlinikHTML,
  metadata: {
    name: 'Klinik',
    description: 'Premium-mall för läkare med specialistbevis, kompetensområden och publikationer',
    category: 'traditional',
    tier: 'premium'
  }
};
