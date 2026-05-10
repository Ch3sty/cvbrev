import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Myndighet Plus - premium variant fOr offentlig sektor och senior-handlaeggning.
 *
 * Skillnader frán Myndighet:
 *  - Centrerad serif-header (Source Serif Pro) signalerar prestige
 *  - Tunt guld-accent-band under header (samma som Atlas)
 *  - Foto + LinkedIn integrerade
 *  - Tva-kolumn med utredningar i hOger panel
 *  - Justerad text fOr formell laesbarhet
 */
function generateMyndighetPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;

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
                font-family: 'Source Serif Pro', 'Georgia', 'Times New Roman', serif;
                line-height: 1.6; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 28mm 26mm;
            }
            /* Centrerad header */
            .header {
                text-align: center; margin-bottom: 22px; padding-bottom: 18px;
                position: relative;
            }
            .photo-wrap {
                width: 88px; height: 88px; margin: 0 auto 14px;
                border-radius: 50%; overflow: hidden;
                border: 2px solid #1e3a8a;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                width: 88px; height: 88px; margin: 0 auto 14px;
                border-radius: 50%; border: 2px solid #1e3a8a;
                background: #eff6ff;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Source Serif Pro', Georgia, serif;
                font-size: 32px; font-weight: 700; color: #1e3a8a;
            }
            .header h1 {
                font-size: 32px; font-weight: 700; color: #0f172a;
                line-height: 1.05; margin-bottom: 6px;
            }
            .header .role {
                font-size: 14px; color: #1e3a8a; font-weight: 600;
                font-style: italic; margin-bottom: 12px;
            }
            .meta-line {
                font-family: 'Inter', sans-serif;
                font-size: 11.5px; color: #475569; line-height: 1.7;
            }
            .meta-line a { color: #1e3a8a; font-weight: 600; }
            .meta-separator { margin: 0 8px; color: #cbd5e1; }
            /* Dubbel guld-line under header */
            .header::after {
                content: ''; display: block; margin: 18px auto 0;
                width: 100px; height: 1px; background: #1e3a8a;
                box-shadow: 0 4px 0 #a88b5c;
            }
            .summary-block {
                font-size: 13px; line-height: 1.75; margin-bottom: 22px;
                text-align: justify; hyphens: auto;
            }
            /* Tva-kolumn body */
            .body-grid {
                display: grid; grid-template-columns: 1fr 200px;
                gap: 24px; align-items: start;
            }
            .main-col, .side-col { min-width: 0; }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-family: 'Inter', sans-serif;
                font-size: 11px; font-weight: 700; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.22em;
                margin-bottom: 14px; padding-bottom: 6px; text-align: center;
                border-bottom: 1px solid #1e3a8a;
            }
            .section-heading::after {
                content: ''; display: block; margin: 6px auto 0;
                width: 30px; height: 1px; background: #a88b5c;
            }
            .side-heading {
                font-family: 'Inter', sans-serif;
                font-size: 10.5px; font-weight: 700; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.22em;
                margin-bottom: 10px; padding-bottom: 5px;
                border-bottom: 1px solid #a88b5c;
            }
            .experience-item { margin-bottom: 16px; }
            .experience-item:last-child { margin-bottom: 0; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 13.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .job-period {
                font-family: 'Inter', sans-serif; font-size: 11px;
                color: #475569; font-weight: 500;
                font-variant-numeric: tabular-nums; flex-shrink: 0;
            }
            .company { font-size: 12.5px; color: #1e3a8a; font-style: italic; margin-bottom: 6px; font-weight: 500; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 16px; font-size: 12px;
                color: #1f2937; line-height: 1.65; margin-bottom: 3px;
            }
            .description-list li::before {
                content: '§'; position: absolute; left: 2px; color: #1e3a8a;
                font-weight: 700; font-size: 11px;
            }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-family: 'Inter', sans-serif; font-size: 11px; color: #475569; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; font-style: italic; margin-top: 1px; }
            .side-row { font-size: 11.5px; color: #1f2937; margin-bottom: 5px; }
            .side-row strong { color: #0f172a; display: block; font-weight: 700; }
            .lang-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 3px; font-size: 11.5px; }
            .lang-name { font-weight: 700; color: #0f172a; }
            .lang-level { color: #475569; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                ${includePhoto ? `
                <div class="photo-wrap"><img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" /></div>
                ` : `
                <div class="photo-placeholder">${(cvData.personalInfo.fullName || '?').trim().charAt(0).toUpperCase()}</div>
                `}
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                    ${includeLinkedIn ? `<span class="meta-separator">·</span><a href="${linkedInUrl}">LinkedIn</a>` : ''}
                </div>
            </header>

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            <div class="body-grid">
                <div class="main-col">
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
                </div>

                <div class="side-col">
                    ${cvData.skills.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Lagstiftning & metoder</h3>
                        ${cvData.skills.map(g => `
                        <div class="side-row">
                            ${g.category ? `<strong>${g.category}</strong>` : ''}
                            ${g.skills.join(', ')}
                        </div>`).join('')}
                    </div>` : ''}

                    ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Språk</h3>
                        ${cvData.languages.map(l => `
                        <div class="lang-row">
                            <span class="lang-name">${l.language}</span>
                            <span class="lang-level">${l.proficiency}</span>
                        </div>`).join('')}
                    </div>` : ''}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const myndighetPlusTemplate: CVTemplateGenerator = {
  templateId: 'myndighet-plus' as any,
  generate: generateMyndighetPlusHTML,
  metadata: {
    name: 'Myndighet Plus',
    description: 'Premium-mall för senior offentlig sektor med centrerad serif-header och gold-accent',
    category: 'traditional',
    tier: 'premium'
  }
};
