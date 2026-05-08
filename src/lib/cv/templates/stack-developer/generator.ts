import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Stack - gratis CV-mall fOr utvecklare/DevOps.
 *
 * Designprinciper:
 *  - Vansterjusterad header (effektivt, inte ceremoniellt)
 *  - Mono-font (JetBrains Mono fallback) for meta-element och datum
 *  - Kompetens-grid (3 kolumner) ovanfor erfarenhet - skill-first
 *  - Dark cyan accent (#0e7490) for tech-kansla
 *  - Inga ikoner, inga clip-paths, inga gradient-fOrger
 *  - Vanlig block-flow (ATS-saker)
 */
function generateStackDeveloperHTML(cvData: CVMetadata, _options: any = {}): string {
  // Gruppera skills i kategorier baserat pa befintliga grupper
  const skillGroups = cvData.skills
    .map(group => ({
      name: group.category || 'Kompetenser',
      items: group.skills.filter(skill =>
        !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase()))
      )
    }))
    .filter(group => group.items.length > 0);

  // Om bara en grupp finns, dela upp den i tre delar for grid-effekt
  let displayGroups = skillGroups;
  if (skillGroups.length === 1 && skillGroups[0].items.length >= 6) {
    const items = skillGroups[0].items;
    const chunkSize = Math.ceil(items.length / 3);
    displayGroups = [
      { name: 'Kompetenser', items: items.slice(0, chunkSize) },
      { name: 'Verktyg', items: items.slice(chunkSize, chunkSize * 2) },
      { name: 'Övrigt', items: items.slice(chunkSize * 2) }
    ];
  }

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
                font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
                line-height: 1.55;
                color: #1f2937;
                background: white;
                font-size: 13.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 32mm 28mm;
            }

            /* === Header (vansterjusterad) === */
            .dev-header {
                margin-bottom: 24px;
                padding-bottom: 18px;
                border-bottom: 1px solid #e5e7eb;
            }

            .dev-header h1 {
                font-size: 30px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.15;
                letter-spacing: -0.01em;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .dev-header .role {
                font-size: 15px;
                color: #0e7490;
                font-weight: 600;
                margin-bottom: 12px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
                font-size: 12px;
                color: #475569;
                letter-spacing: -0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.7;
                margin-bottom: 28px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Kompetens-grid (3 kolumner) === */
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 18px;
                margin-bottom: 32px;
                padding: 18px 0;
                border-top: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
            }

            .skill-group {
                min-width: 0;
            }

            .skill-group-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: #0e7490;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                margin-bottom: 8px;
            }

            .skill-group-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .skill-group-list li {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
                font-size: 12px;
                color: #1f2937;
                line-height: 1.65;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 26px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }

            .section-heading::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 28px;
                height: 2px;
                background: #0e7490;
            }

            /* === Experience items === */
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
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
                font-size: 11.5px;
                color: #0e7490;
                font-weight: 500;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 6px;
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
                padding-left: 14px;
                font-size: 13px;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 3px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '–';
                position: absolute;
                left: 0;
                color: #94a3b8;
            }

            /* === Education items === */
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
                gap: 12px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 13.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
                font-size: 11.5px;
                color: #0e7490;
                font-weight: 500;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #475569;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 13px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                font-weight: 600;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
            }

            .references {
                margin-top: 28px;
                padding-top: 14px;
                border-top: 1px solid #e5e7eb;
                font-size: 11.5px;
                color: #94a3b8;
                font-style: italic;
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Header === -->
            <header class="dev-header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            <!-- === Sammanfattning === -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- === Kompetens-grid (3 kolumner) === -->
            ${displayGroups.length > 0 ? `
            <div class="skills-grid">
                ${displayGroups.slice(0, 3).map(group => `
                <div class="skill-group">
                    <div class="skill-group-heading">${group.name}</div>
                    <ul class="skill-group-list">
                        ${group.items.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>`).join('')}
            </div>` : ''}

            <!-- === Arbetslivserfarenhet === -->
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

            <!-- === Utbildning === -->
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

            <!-- === Sprak === -->
            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(lang => `
                <div class="language-row">
                    <span class="language-name">${lang.language}</span>
                    <span class="language-level">— ${lang.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}

            <!-- Referenser -->
            <div class="references">// Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const stackDeveloperTemplate: CVTemplateGenerator = {
  templateId: 'stack-developer',
  generate: generateStackDeveloperHTML,
  metadata: {
    name: 'Stack',
    description: 'Modern utvecklarmall med kompetens-stack ovanför erfarenhet',
    category: 'modern',
    tier: 'free'
  }
};
