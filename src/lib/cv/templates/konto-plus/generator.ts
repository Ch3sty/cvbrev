import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Konto Plus - premium variant fOr ekonomi/redovisning/finans.
 *
 * Skillnader frán Konto:
 *  - Tre-kolumns header: namn vanster, foto centrum, "Snabbfakta" hOger
 *  - Sidopanel med kvantifierade nyckeltal
 *  - LinkedIn-badge + email-icon i header
 *  - Subtil emerald-accent som komplement (vaxt-DNA, finans-kansla)
 *  - Tightare grid och storre typografi
 */
function generateKontoPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;

  // Plocka 3 nyckeltal/snabbfakta frán certifikat eller skills
  const snabbfakta: string[] = [];
  if (cvData.certifications && cvData.certifications.length > 0) {
    snabbfakta.push(cvData.certifications[0].name);
  }
  if (cvData.experience.length > 0) {
    snabbfakta.push(`${cvData.experience.length}+ års erfarenhet`);
  }
  if (cvData.skills.length > 0 && cvData.skills[0].skills.length > 0) {
    snabbfakta.push(`Behärskar ${cvData.skills[0].skills.slice(0, 2).join(', ')}`);
  }

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
                font-variant-numeric: tabular-nums;
            }
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 26mm 24mm; }
            /* Tre-kolumns header */
            .header-grid {
                display: grid; grid-template-columns: 1fr 92px 1fr;
                gap: 18px; align-items: center;
                padding-bottom: 14px; margin-bottom: 18px;
                border-bottom: 1px solid #1e3a8a;
                position: relative;
            }
            .header-grid::after {
                content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
                height: 2px; background: linear-gradient(90deg, #1e3a8a 0%, #10b981 100%);
            }
            .name-col h1 {
                font-size: 28px; font-weight: 800; color: #1e3a8a;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .name-col .role { font-size: 13px; color: #3730a3; font-weight: 600; margin-bottom: 6px; }
            .name-col .meta {
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 10.5px; color: #475569; line-height: 1.55;
            }
            .name-col .meta a { color: #1e3a8a; font-weight: 600; }
            .photo-col { display: flex; justify-content: center; }
            .photo-wrap {
                width: 92px; height: 92px; border-radius: 50%;
                overflow: hidden; border: 3px solid #1e3a8a;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                width: 92px; height: 92px; border-radius: 50%;
                border: 3px solid #1e3a8a; background: #eff6ff;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Inter', sans-serif;
                font-size: 36px; font-weight: 800; color: #1e3a8a;
            }
            .snabbfakta-col { display: flex; flex-direction: column; gap: 4px; }
            .snabbfakta-label {
                font-size: 9px; font-weight: 800; color: #10b981;
                text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 4px;
            }
            .snabbfakta-row {
                font-size: 11px; color: #1f2937;
                padding-left: 14px; position: relative; line-height: 1.4;
            }
            .snabbfakta-row::before {
                content: '→'; position: absolute; left: 0; top: 0;
                color: #10b981; font-weight: 700;
            }
            .summary-block { font-size: 13px; line-height: 1.7; margin-bottom: 22px; }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #1e3a8a;
                text-transform: uppercase; letter-spacing: 0.2em;
                margin-bottom: 12px; padding-bottom: 4px;
                border-bottom: 1.5px solid #1e3a8a;
            }
            .experience-row {
                display: grid; grid-template-columns: 1fr 90px;
                gap: 14px; padding: 10px 0; border-bottom: 1px solid #e5e7eb;
            }
            .experience-row:last-child { border-bottom: none; }
            .job-title { font-size: 13.5px; font-weight: 700; color: #1e3a8a; margin-bottom: 2px; }
            .company { font-size: 12.5px; color: #475569; font-weight: 600; margin-bottom: 4px; }
            .job-period {
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 10.5px; color: #1e3a8a; font-weight: 600;
                text-align: right;
            }
            .description-list { list-style: none; padding: 0; margin: 4px 0 0 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.55; margin-bottom: 2px;
            }
            .description-list li::before {
                content: '›'; position: absolute; left: 0; color: #10b981;
                font-weight: 700; font-size: 12px;
            }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #1e3a8a; flex: 1; min-width: 0; }
            .education-year { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #475569; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; margin-top: 1px; }
            .skill-group { margin-bottom: 6px; }
            .skill-group-name {
                font-size: 11px; font-weight: 700; color: #1e3a8a;
                text-transform: uppercase; letter-spacing: 0.06em; margin-right: 6px;
            }
            .skill-list { font-size: 12px; color: #1f2937; }
            .lang-row {
                display: flex; justify-content: space-between; gap: 6px;
                padding: 3px 0; border-bottom: 1px dotted #e5e7eb;
                font-size: 11.5px;
            }
            .lang-row:last-child { border-bottom: none; }
            .lang-name { font-weight: 700; color: #1e3a8a; }
            .lang-level { color: #475569; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header-grid">
                <div class="name-col">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="meta">
                        ${cvData.personalInfo.email || ''}<br>
                        ${cvData.personalInfo.phone ? cvData.personalInfo.phone + '<br>' : ''}
                        ${cvData.personalInfo.address ? formatSwedishAddress(cvData.personalInfo.address) + '<br>' : ''}
                        ${includeLinkedIn ? `<a href="${linkedInUrl}">LinkedIn</a>` : ''}
                    </div>
                </div>
                <div class="photo-col">
                    ${includePhoto ? `
                    <div class="photo-wrap"><img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" /></div>
                    ` : `
                    <div class="photo-placeholder">${(cvData.personalInfo.fullName || '?').trim().charAt(0).toUpperCase()}</div>
                    `}
                </div>
                <div class="snabbfakta-col">
                    <div class="snabbfakta-label">Nyckelfakta</div>
                    ${snabbfakta.map(s => `<div class="snabbfakta-row">${s}</div>`).join('')}
                </div>
            </header>

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Arbetslivserfarenhet</h2>
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
                <h2 class="section-heading">Redovisningssystem & kompetenser</h2>
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
                    <span class="lang-level">${l.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const kontoPlusTemplate: CVTemplateGenerator = {
  templateId: 'konto-plus' as any,
  generate: generateKontoPlusHTML,
  metadata: {
    name: 'Konto Plus',
    description: 'Premium-mall för ekonomi/finans med foto-header, nyckeltal och emerald-accent',
    category: 'modern',
    tier: 'premium'
  }
};
