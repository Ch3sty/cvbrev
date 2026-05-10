import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Norrsken Plus - premium variant av Norrsken (ren minimal -> visuellt rikare).
 *
 * Skillnader:
 *  - Foto + tva-kolumn body med "Snabbfakta"-sidopanel
 *  - Orange -> magenta gradient pa namn
 *  - "Personlig profil"-sektion overst (matchar GSC: cv profil 167/man)
 *  - Storre serif-namn (Fraunces) ger statement
 *  - LinkedIn integrerad
 */
function generateNorrskenPlusHTML(cvData: CVMetadata, options: any = {}): string {
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
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                line-height: 1.6; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 28mm 24mm; }
            .header {
                display: flex; gap: 22px; align-items: center;
                padding-bottom: 18px; margin-bottom: 22px;
                border-bottom: 2px solid;
                border-image: linear-gradient(90deg, #f97316 0%, #db2777 100%) 1;
            }
            .photo-wrap {
                flex-shrink: 0; width: 96px; height: 96px; border-radius: 50%;
                overflow: hidden; padding: 3px;
                background: linear-gradient(135deg, #f97316, #db2777);
            }
            .photo-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; background: white; }
            .photo-placeholder {
                flex-shrink: 0; width: 96px; height: 96px; border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #db2777);
                display: flex; align-items: center; justify-content: center;
                font-family: 'Fraunces', Georgia, serif;
                font-size: 36px; font-weight: 700; color: white;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
                font-size: 34px; font-weight: 700; line-height: 1.0;
                letter-spacing: -0.02em; margin-bottom: 4px;
                background: linear-gradient(135deg, #0f172a 0%, #db2777 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
            .header-text .role { font-size: 14px; font-weight: 600; color: #db2777; margin-bottom: 8px; }
            .header-meta { font-size: 11.5px; color: #475569; line-height: 1.65; }
            .header-meta a { color: #db2777; font-weight: 500; }
            .meta-separator { margin: 0 7px; color: #cbd5e1; }
            /* Profil-sektion */
            .profil-section {
                margin-bottom: 22px; padding: 14px 18px;
                background: #fff7ed; border-left: 3px solid #f97316; border-radius: 3px;
            }
            .profil-label {
                font-size: 10px; font-weight: 800; color: #c2410c;
                text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;
            }
            .profil-text { font-size: 13px; line-height: 1.7; color: #1f2937; font-style: italic; }
            /* Tva-kolumn body */
            .body-grid {
                display: grid; grid-template-columns: 1fr 200px;
                gap: 22px;
            }
            .main-col, .side-col { min-width: 0; }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-left: 10px;
                border-left: 3px solid #f97316; line-height: 1;
            }
            .side-heading {
                font-size: 10.5px; font-weight: 800; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 8px; padding-bottom: 4px;
                border-bottom: 2px solid #f97316;
            }
            .experience-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 13.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .job-period { font-size: 11px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .company { font-size: 12.5px; color: #475569; font-weight: 600; margin-bottom: 5px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.6; margin-bottom: 3px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 0; top: 8px;
                width: 5px; height: 5px; border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #db2777);
            }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-size: 11px; color: #64748b; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; margin-top: 1px; }
            .side-row { font-size: 11.5px; color: #1f2937; margin-bottom: 4px; }
            .side-row strong { color: #0f172a; display: block; font-weight: 700; }
            .lang-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 3px; font-size: 11.5px; }
            .lang-name { font-weight: 700; color: #0f172a; }
            .lang-level { color: #64748b; }
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
                <div class="header-text">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="header-meta">
                        ${cvData.personalInfo.email || ''}
                        ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                        ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                        ${includeLinkedIn ? `<span class="meta-separator">·</span><a href="${linkedInUrl}">LinkedIn</a>` : ''}
                    </div>
                </div>
            </header>

            ${cvData.summary ? `
            <div class="profil-section">
                <div class="profil-label">Personlig profil</div>
                <div class="profil-text">${cvData.summary}</div>
            </div>` : ''}

            <div class="body-grid">
                <div class="main-col">
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
                </div>

                <div class="side-col">
                    ${cvData.skills.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Kompetenser</h3>
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

export const norrskenPlusTemplate: CVTemplateGenerator = {
  templateId: 'norrsken-plus' as any,
  generate: generateNorrskenPlusHTML,
  metadata: {
    name: 'Norrsken Plus',
    description: 'Premium-uppgradering av Norrsken med foto, gradient-namn och två-kolumns body',
    category: 'modern',
    tier: 'premium'
  }
};
