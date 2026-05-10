import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Disk Plus - premium variant av Disk fOr butik/frontline-service.
 *
 * SkillNader fran Disk:
 *  - Foto + namn-banner Overst (160px hOjd, fullbredd) gor visuell impact
 *  - Diagonal accent-bar (emerald -> magenta) under banner
 *  - Tva-kolumn body med "Sammanfattning" + side-panel
 *  - Storre serif-rubriker (Fraunces) ger magazine-kansla
 *  - LinkedIn-badge integrerad
 */
function generateDiskPlusHTML(cvData: CVMetadata, options: any = {}): string {
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
                line-height: 1.55; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto; background: white;
            }
            /* Foto-banner */
            .photo-banner {
                background: linear-gradient(135deg, #064e3b 0%, #10b981 50%, #db2777 100%);
                padding: 24px 28mm; display: flex; align-items: center; gap: 22px;
                color: white;
            }
            .photo-wrap {
                flex-shrink: 0; width: 88px; height: 88px; border-radius: 50%;
                border: 3px solid white; overflow: hidden; background: white;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 88px; height: 88px; border-radius: 50%;
                border: 3px solid white; background: rgba(255,255,255,0.2);
                display: flex; align-items: center; justify-content: center;
                font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
                font-size: 36px; font-weight: 700; color: white;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
                font-size: 32px; font-weight: 700; line-height: 1.05;
                letter-spacing: -0.015em; margin-bottom: 4px; color: white;
            }
            .header-text .role { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.95); margin-bottom: 8px; }
            .header-meta { font-size: 11.5px; color: rgba(255,255,255,0.9); line-height: 1.55; }
            .header-meta a { color: white; text-decoration: underline; font-weight: 500; }
            .meta-separator { margin: 0 6px; }
            /* Diagonal accent under banner */
            .accent-bar { height: 6px; background: linear-gradient(90deg, #10b981 0%, #db2777 100%); }
            /* Body */
            .body-grid {
                display: grid; grid-template-columns: 1fr 200px;
                gap: 24px; padding: 22px 28mm 26mm;
            }
            .main-col { min-width: 0; }
            .side-col { min-width: 0; }
            .summary-block {
                font-family: 'Fraunces', Georgia, serif;
                font-size: 14px; color: #1f2937; line-height: 1.65;
                font-style: italic; margin-bottom: 22px;
                padding: 12px 0 12px 16px; border-left: 3px solid #10b981;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-family: 'Fraunces', Georgia, serif;
                font-size: 17px; font-weight: 700; color: #064e3b;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #10b981;
            }
            .side-heading {
                font-size: 10.5px; font-weight: 700; color: #047857;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 10px; padding-bottom: 4px;
                border-bottom: 1px solid #d1fae5;
            }
            .experience-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 13.5px; font-weight: 700; color: #064e3b; flex: 1; min-width: 0; }
            .job-period { font-size: 11px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .company { font-size: 12.5px; color: #10b981; font-weight: 600; margin-bottom: 5px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.55; margin-bottom: 3px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 0; top: 7px;
                width: 4px; height: 4px; background: #10b981; border-radius: 50%;
            }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #064e3b; flex: 1; min-width: 0; }
            .education-year { font-size: 11px; color: #64748b; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; margin-top: 1px; }
            .skill-pill {
                display: inline-block; padding: 3px 9px; margin: 0 4px 4px 0;
                border-radius: 10px; font-size: 11px; font-weight: 500;
                background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;
            }
            .skill-side-row { font-size: 11.5px; color: #1f2937; margin-bottom: 4px; }
            .lang-row {
                display: flex; justify-content: space-between; gap: 6px;
                margin-bottom: 3px; font-size: 11.5px;
            }
            .lang-name { font-weight: 700; color: #064e3b; }
            .lang-level { color: #64748b; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="photo-banner">
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
            <div class="accent-bar"></div>

            <div class="body-grid">
                <div class="main-col">
                    ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

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
                        <h3 class="side-heading">Kassasystem</h3>
                        ${cvData.skills.flatMap(g => g.skills).slice(0, 8).map(s => `<span class="skill-pill">${s}</span>`).join('')}
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

export const diskPlusTemplate: CVTemplateGenerator = {
  templateId: 'disk-plus' as any,
  generate: generateDiskPlusHTML,
  metadata: {
    name: 'Disk Plus',
    description: 'Premium-mall för butik och frontline-service med foto-banner och magazine-stil',
    category: 'modern',
    tier: 'premium'
  }
};
