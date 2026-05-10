import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Verkstad Plus - premium variant fOr industri/maskin/produktion.
 *
 * Skillnader frán Verkstad:
 *  - Stor blueprint-style-header med tunna konstruktions-linjer (CSS-only)
 *  - Foto + LinkedIn integrerade med subtle teknisk-ram
 *  - Tva-kolumn med "Verktygs-stack" som sidopanel
 *  - Strukturerad teknisk farg-palett (grafit + steel blue)
 *  - Storre typografisk skala
 */
function generateVerkstadPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;
  const certifieringar = cvData.certifications || [];

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
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; }
            /* Blueprint-header */
            .blueprint-header {
                background: #f8fafc;
                background-image:
                    linear-gradient(rgba(55,65,81,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(55,65,81,0.06) 1px, transparent 1px);
                background-size: 16px 16px;
                padding: 26px 28mm; border-bottom: 2px solid #374151;
                display: flex; align-items: center; gap: 22px;
            }
            .photo-wrap {
                flex-shrink: 0; width: 88px; height: 110px;
                overflow: hidden; border: 2px solid #475569;
                background: white; box-shadow: 0 0 0 1px white, 0 0 0 3px #475569;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 88px; height: 110px;
                border: 2px solid #475569; background: white;
                box-shadow: 0 0 0 1px white, 0 0 0 3px #475569;
                display: flex; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', monospace;
                font-size: 32px; font-weight: 700; color: #475569;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-size: 30px; font-weight: 800; color: #111827;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header-text .role { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 8px; }
            .header-meta { font-size: 11.5px; color: #475569; line-height: 1.55; font-family: 'JetBrains Mono', 'Consolas', monospace; }
            .header-meta a { color: #475569; font-weight: 600; }
            .meta-separator { margin: 0 6px; color: #cbd5e1; }
            /* Body */
            .body-grid {
                display: grid; grid-template-columns: 1fr 200px;
                gap: 24px; padding: 22px 28mm 26mm;
            }
            .main-col { min-width: 0; }
            .side-col { min-width: 0; }
            .summary-block {
                font-size: 13px; line-height: 1.7; margin-bottom: 22px;
                padding: 12px 16px; background: #f9fafb;
                border-left: 3px solid #475569; border-radius: 2px; font-style: italic;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #111827;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #475569;
            }
            .side-heading {
                font-size: 10.5px; font-weight: 800; color: #111827;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 8px; padding-bottom: 4px;
                border-bottom: 1px solid #d1d5db;
            }
            .experience-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dashed #e5e7eb; }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 13.5px; font-weight: 700; color: #111827; flex: 1; min-width: 0; }
            .job-period {
                font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
                color: #475569; font-weight: 500; flex-shrink: 0;
            }
            .company { font-size: 12.5px; color: #475569; font-weight: 600; margin-bottom: 5px; font-style: italic; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.6; margin-bottom: 3px;
            }
            .description-list li::before { content: '–'; position: absolute; left: 0; color: #9ca3af; font-weight: 700; }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #111827; flex: 1; min-width: 0; }
            .education-year { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #475569; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; font-style: italic; margin-top: 1px; }
            .cert-row {
                font-size: 11px; color: #1f2937; line-height: 1.5;
                padding-left: 12px; position: relative; margin-bottom: 4px;
            }
            .cert-row::before {
                content: '◆'; position: absolute; left: 0; top: 1px;
                color: #475569; font-size: 8px;
            }
            .skill-side-row { font-size: 11.5px; color: #1f2937; margin-bottom: 4px; padding-left: 12px; position: relative; }
            .skill-side-row::before {
                content: ''; position: absolute; left: 0; top: 6px;
                width: 5px; height: 5px; background: #475569;
            }
            .lang-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 3px; font-size: 11.5px; }
            .lang-name { font-weight: 700; color: #111827; }
            .lang-level { color: #475569; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="blueprint-header">
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
                    ${certifieringar.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Standarder & Certifikat</h3>
                        ${certifieringar.map(c => `<div class="cert-row">${c.name}</div>`).join('')}
                    </div>` : ''}

                    ${cvData.skills.length > 0 ? `
                    <div class="section">
                        <h3 class="side-heading">Verktygs-stack</h3>
                        ${cvData.skills.flatMap(g => g.skills).slice(0, 12).map(s => `<div class="skill-side-row">${s}</div>`).join('')}
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

export const verkstadPlusTemplate: CVTemplateGenerator = {
  templateId: 'verkstad-plus' as any,
  generate: generateVerkstadPlusHTML,
  metadata: {
    name: 'Verkstad Plus',
    description: 'Premium industri-mall med blueprint-header, foto och verktygs-stack i sidopanel',
    category: 'traditional',
    tier: 'premium'
  }
};
