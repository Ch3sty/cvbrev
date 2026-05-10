import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Logistik Plus - premium variant av Logistik fOr lager/transport.
 *
 * Skillnader frán Logistik:
 *  - Grafit-svart header-band (#0f172a) Over hela toppen, vit text
 *  - Foto i hOrnet med tunn cyan ring
 *  - Tabellar projekt-historik istallet for listad
 *  - LinkedIn + cyan accent
 *  - Storre body-padding for premium-kansla
 */
function generateLogistikPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;
  const behorigheter = cvData.certifications || [];

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
            .dark-header {
                background: #0f172a; color: white;
                padding: 26px 28mm; display: flex; align-items: center; gap: 22px;
            }
            .photo-wrap {
                flex-shrink: 0; width: 92px; height: 92px; border-radius: 50%;
                overflow: hidden; border: 3px solid #06b6d4; background: #1e293b;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 92px; height: 92px; border-radius: 50%;
                border: 3px solid #06b6d4; background: rgba(6,182,212,0.15);
                display: flex; align-items: center; justify-content: center;
                font-size: 36px; font-weight: 800; color: #06b6d4;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-size: 30px; font-weight: 800; color: white;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header-text .role {
                font-size: 13px; font-weight: 700; color: #06b6d4;
                text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;
            }
            .header-meta { font-size: 11.5px; color: #cbd5e1; line-height: 1.55; font-family: 'Roboto Mono', monospace; }
            .header-meta a { color: #06b6d4; text-decoration: none; font-weight: 500; }
            .meta-separator { margin: 0 6px; color: #475569; }
            /* Body */
            .body { padding: 22px 28mm 26mm; }
            .behorighet-block {
                margin: 0 0 18px; padding: 12px 16px;
                background: #f0f9ff; border-left: 3px solid #06b6d4; border-radius: 3px;
            }
            .behorighet-label {
                font-size: 10px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 6px;
            }
            .behorighet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
            .behorighet-item { font-size: 11.5px; color: #1f2937; padding-left: 14px; position: relative; }
            .behorighet-item::before { content: '✓'; position: absolute; left: 0; color: #06b6d4; font-weight: 700; }
            .summary-block { font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #06b6d4;
            }
            .experience-row {
                display: grid; grid-template-columns: 1fr 100px;
                gap: 14px; padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .experience-row:last-child { border-bottom: none; }
            .job-title { font-size: 13.5px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
            .company { font-size: 12.5px; color: #475569; font-weight: 600; margin-bottom: 4px; }
            .job-period {
                font-family: 'Roboto Mono', monospace; font-size: 10.5px;
                color: #06b6d4; font-weight: 600; text-align: right;
            }
            .description-list { list-style: none; padding: 0; margin: 4px 0 0 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.55; margin-bottom: 2px;
            }
            .description-list li::before {
                content: '▸'; position: absolute; left: 0; color: #06b6d4;
                font-size: 10px; top: 1px;
            }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #06b6d4; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; margin-top: 1px; }
            .skill-group { margin-bottom: 6px; }
            .skill-group-name {
                font-size: 11px; font-weight: 700; color: #06b6d4;
                text-transform: uppercase; letter-spacing: 0.06em; margin-right: 6px;
            }
            .skill-list { font-size: 12px; color: #1f2937; }
            .lang-row { display: flex; gap: 8px; margin-bottom: 3px; font-size: 12px; }
            .lang-name { font-weight: 700; color: #0f172a; }
            .lang-level { color: #475569; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="dark-header">
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

            <div class="body">
                ${behorigheter.length > 0 ? `
                <div class="behorighet-block">
                    <div class="behorighet-label">Behörigheter & Körkort</div>
                    <div class="behorighet-grid">
                        ${behorigheter.map(c => `<div class="behorighet-item">${c.name}</div>`).join('')}
                    </div>
                </div>` : ''}

                ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

                ${cvData.experience.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Yrkeserfarenhet</h2>
                    ${cvData.experience.map(exp => `
                    <div class="experience-row">
                        <div>
                            <div class="job-title">${exp.position}</div>
                            <div class="company">${exp.company}</div>
                            ${exp.description && exp.description.length > 0 ? `
                            <ul class="description-list">
                                ${exp.description.map(d => `<li>${d}</li>`).join('')}
                            </ul>` : ''}
                        </div>
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? '<br>– ' + exp.endDate : (exp.startDate ? '<br>– Pågående' : '')}</div>
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

                ${cvData.skills.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">WMS-system & verktyg</h2>
                    ${cvData.skills.map(g => `
                    <div class="skill-group">
                        ${g.category ? `<span class="skill-group-name">${g.category}:</span>` : ''}
                        <span class="skill-list">${g.skills.join(', ')}</span>
                    </div>`).join('')}
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Språk</h2>
                    ${cvData.languages.map(l => `
                    <div class="lang-row">
                        <span class="lang-name">${l.language}</span>
                        <span class="lang-level">— ${l.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}
            </div>
        </div>
    </body>
    </html>
  `;
}

export const logistikPlusTemplate: CVTemplateGenerator = {
  templateId: 'logistik-plus' as any,
  generate: generateLogistikPlusHTML,
  metadata: {
    name: 'Logistik Plus',
    description: 'Premium-mall för lager och transport med mörk header och tabellär projekt-historik',
    category: 'traditional',
    tier: 'premium'
  }
};
