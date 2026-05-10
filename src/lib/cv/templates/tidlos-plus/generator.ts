import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Tidlos Plus - premium-uppgradering av Tidlos-formell.
 *
 * Skillnader frán Tidlos:
 *  - Dubbel-divider med ornament
 *  - Foto-stOd (for chef-roller dar det ar acceptabelt)
 *  - Justerad text med hyphens
 *  - Subtil burgundy-accent (#7c2d12) komplementerar svart
 *  - "Yrkesprofil"-blockquote i serif-italic
 */
function generateTidlosPlusHTML(cvData: CVMetadata, options: any = {}): string {
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
                font-family: 'Garamond', 'Source Serif Pro', 'Georgia', 'Times New Roman', serif;
                line-height: 1.65; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; padding: 32mm 30mm;
            }
            .header {
                text-align: center; margin-bottom: 22px; padding-bottom: 18px;
                position: relative;
            }
            .photo-wrap {
                width: 96px; height: 96px; margin: 0 auto 16px;
                border-radius: 50%; overflow: hidden;
                border: 1px solid #7c2d12; padding: 3px;
            }
            .photo-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
            .photo-placeholder {
                width: 96px; height: 96px; margin: 0 auto 16px;
                border-radius: 50%; border: 1px solid #7c2d12;
                background: #fef2f2;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Garamond', Georgia, serif;
                font-size: 36px; font-weight: 700; color: #7c2d12;
            }
            .header h1 {
                font-size: 36px; font-weight: 600; color: #0f172a;
                line-height: 1.05; letter-spacing: 0.005em; margin-bottom: 6px;
            }
            .header .role {
                font-size: 14px; color: #7c2d12; font-weight: 500;
                font-style: italic; letter-spacing: 0.04em; margin-bottom: 14px;
            }
            .meta-line {
                font-family: 'Inter', sans-serif;
                font-size: 11.5px; color: #475569; line-height: 1.7;
            }
            .meta-line a { color: #7c2d12; font-weight: 500; }
            .meta-separator { margin: 0 10px; color: #d1d5db; }
            /* Dubbel-divider med ornament */
            .header::after {
                content: ''; display: block; margin: 18px auto 0;
                width: 140px; height: 1px; background: #0f172a;
                box-shadow: 0 3px 0 rgba(124, 45, 18, 0.5);
            }
            .ornament {
                text-align: center; color: #7c2d12;
                font-size: 14px; line-height: 1; margin: 14px 0 4px;
            }
            .summary-block {
                font-size: 13.5px; line-height: 1.85; margin-bottom: 24px;
                text-align: justify; hyphens: auto;
                font-style: italic;
                padding: 0 8mm;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-family: 'Inter', sans-serif;
                font-size: 11px; font-weight: 700; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.24em;
                text-align: center; margin-bottom: 18px; padding-bottom: 6px;
                position: relative;
            }
            .section-heading::after {
                content: ''; display: block; margin: 6px auto 0;
                width: 32px; height: 1px; background: #7c2d12;
            }
            .experience-item { margin-bottom: 18px; }
            .experience-item:last-child { margin-bottom: 0; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 14px; margin-bottom: 4px; flex-wrap: wrap;
            }
            .job-title {
                font-family: 'Garamond', Georgia, serif;
                font-size: 15px; font-weight: 600; color: #0f172a; flex: 1; min-width: 0;
            }
            .job-period {
                font-family: 'Inter', sans-serif;
                font-size: 11.5px; color: #475569; font-weight: 500;
                font-variant-numeric: tabular-nums; letter-spacing: 0.04em;
                flex-shrink: 0;
            }
            .company {
                font-size: 13px; color: #7c2d12; font-style: italic;
                margin-bottom: 7px; font-weight: 500;
            }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 18px; font-size: 12.5px;
                color: #1f2937; line-height: 1.7; margin-bottom: 5px;
                text-align: justify; hyphens: auto;
            }
            .description-list li::before {
                content: '◆'; position: absolute; left: 4px; color: #7c2d12;
                font-size: 9px; top: 1px;
            }
            .education-item { margin-bottom: 12px; }
            .education-header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .degree { font-family: 'Garamond', Georgia, serif; font-size: 13.5px; font-weight: 600; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-family: 'Inter', sans-serif; font-size: 11.5px; color: #475569; flex-shrink: 0; }
            .institution { font-size: 12.5px; color: #475569; font-style: italic; margin-top: 2px; }
            .skill-group { margin-bottom: 8px; text-align: center; }
            .skill-group-name {
                font-family: 'Inter', sans-serif;
                font-size: 11px; font-weight: 700; color: #7c2d12;
                text-transform: uppercase; letter-spacing: 0.16em;
                display: block; margin-bottom: 3px;
            }
            .skill-list { font-size: 13px; color: #1f2937; line-height: 1.6; }
            .lang-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 5px; font-size: 12.5px; }
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

            ${cvData.summary ? `
            <div class="ornament">— § —</div>
            <div class="summary-block">${cvData.summary}</div>` : ''}

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

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                ${cvData.skills.map(g => `
                <div class="skill-group">
                    ${g.category ? `<span class="skill-group-name">${g.category}</span>` : ''}
                    <span class="skill-list">${g.skills.join(' · ')}</span>
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
    </body>
    </html>
  `;
}

export const tidlosPlusTemplate: CVTemplateGenerator = {
  templateId: 'tidlos-plus' as any,
  generate: generateTidlosPlusHTML,
  metadata: {
    name: 'Tidlös Plus',
    description: 'Premium-uppgradering av Tidlös med foto, dubbel-divider och burgundy-accent',
    category: 'traditional',
    tier: 'premium'
  }
};
