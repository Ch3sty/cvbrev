import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Stack Plus - premium-uppgradering av Stack-developer.
 *
 * Skillnader frán Stack:
 *  - Foto + LinkedIn + GitHub-icons i header
 *  - "Stack-banner" med visuella tech-pillar
 *  - Tva-kolumn body med "Stack" som sidopanel
 *  - Tightare typografi for senior-roller
 */
function generateStackPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;

  // Plocka top-tech-stack frán fOrsta skill-gruppen
  const topStack = (cvData.skills[0]?.skills || []).slice(0, 6);

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
                line-height: 1.55; color: #1f2937; background: white; font-size: 12.5px;
            }
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 26mm 22mm; }
            .header {
                display: flex; gap: 22px; align-items: center;
                margin-bottom: 16px; padding-bottom: 14px;
                border-bottom: 1px solid #e5e7eb;
            }
            .photo-wrap {
                flex-shrink: 0; width: 84px; height: 84px;
                overflow: hidden; border: 2px solid #0e7490;
                border-radius: 4px;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 84px; height: 84px; border-radius: 4px;
                border: 2px solid #0e7490; background: #f0f9ff;
                display: flex; align-items: center; justify-content: center;
                font-family: 'JetBrains Mono', monospace;
                font-size: 32px; font-weight: 700; color: #0e7490;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-size: 28px; font-weight: 800; color: #0f172a;
                line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 4px;
            }
            .header-text .role {
                font-size: 14px; color: #0e7490; font-weight: 700; margin-bottom: 8px;
            }
            .header-meta {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 10.5px; color: #475569; line-height: 1.55; letter-spacing: -0.01em;
            }
            .header-meta a { color: #0e7490; font-weight: 600; }
            .meta-separator { margin: 0 7px; color: #cbd5e1; }
            /* Stack-banner */
            .stack-banner {
                margin-bottom: 18px; padding: 12px 16px;
                background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 4px;
                display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
            }
            .stack-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 9.5px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.18em; margin-right: 4px;
            }
            .stack-pill {
                font-family: 'JetBrains Mono', monospace;
                display: inline-block; padding: 3px 9px;
                background: white; border: 1px solid #67e8f9;
                border-radius: 12px; font-size: 10.5px; color: #0c4a6e; font-weight: 600;
            }
            /* Tva-kolumn body */
            .body-grid { display: grid; grid-template-columns: 1fr 180px; gap: 22px; }
            .main-col, .side-col { min-width: 0; }
            .summary-block { font-size: 12.5px; line-height: 1.7; margin-bottom: 18px; }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 10.5px; font-weight: 800; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }
            .section-heading::after {
                content: ''; position: absolute; bottom: -1px; left: 0;
                width: 28px; height: 2px; background: #0e7490;
            }
            .side-heading {
                font-family: 'JetBrains Mono', monospace;
                font-size: 10px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.16em;
                margin-bottom: 8px;
            }
            .experience-item { margin-bottom: 14px; }
            .experience-item:last-child { margin-bottom: 0; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 2px; flex-wrap: wrap;
            }
            .job-title { font-size: 13px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .job-period {
                font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
                color: #0e7490; font-weight: 600; flex-shrink: 0;
            }
            .company { font-size: 12px; color: #475569; font-weight: 500; margin-bottom: 5px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12px;
                color: #1f2937; line-height: 1.55; margin-bottom: 2px;
            }
            .description-list li::before { content: '–'; position: absolute; left: 0; color: #94a3b8; }
            .education-item { margin-bottom: 10px; }
            .education-header { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
            .degree { font-size: 12.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #0e7490; flex-shrink: 0; }
            .institution { font-size: 11.5px; color: #475569; margin-top: 1px; }
            .stack-side-row {
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px; color: #1f2937;
                padding-left: 12px; position: relative; margin-bottom: 4px;
                line-height: 1.55;
            }
            .stack-side-row::before { content: '›'; position: absolute; left: 0; color: #0e7490; font-weight: 700; }
            .lang-row { display: flex; justify-content: space-between; gap: 6px; margin-bottom: 3px; font-size: 11.5px; }
            .lang-name { font-weight: 700; color: #0f172a; }
            .lang-level { color: #475569; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; }
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

            ${topStack.length > 0 ? `
            <div class="stack-banner">
                <span class="stack-label">Stack //</span>
                ${topStack.map(t => `<span class="stack-pill">${t}</span>`).join('')}
            </div>` : ''}

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
                                <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Now' : '')}</div>
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
                    ${cvData.skills.length > 1 ? `
                    <div class="section">
                        <h3 class="side-heading">Verktyg & övrigt</h3>
                        ${cvData.skills.slice(1).flatMap(g => g.skills).slice(0, 14).map(s => `<div class="stack-side-row">${s}</div>`).join('')}
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

export const stackPlusTemplate: CVTemplateGenerator = {
  templateId: 'stack-plus' as any,
  generate: generateStackPlusHTML,
  metadata: {
    name: 'Stack Plus',
    description: 'Premium-uppgradering av Stack med foto, tech-pillar-banner och tvåkolumns layout',
    category: 'modern',
    tier: 'premium'
  }
};
