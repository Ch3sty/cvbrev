import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Student Plus - premium-uppgradering av Student-startup.
 *
 * Skillnader:
 *  - Foto + LinkedIn-rad i header
 *  - "DrOmjobb"-eyebrow med malroll (om title finns)
 *  - "Projekt"-sektion mer prominent (UF-foretag, hackathons)
 *  - Storre serif-namn ger statement
 */
function generateStudentPlusHTML(cvData: CVMetadata, options: any = {}): string {
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
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 26mm 24mm; }
            .header {
                display: flex; gap: 22px; align-items: center;
                padding-bottom: 16px; margin-bottom: 20px;
                border-bottom: 2px solid #06b6d4;
            }
            .photo-wrap {
                flex-shrink: 0; width: 88px; height: 88px; border-radius: 50%;
                overflow: hidden; border: 3px solid #06b6d4;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 88px; height: 88px; border-radius: 50%;
                border: 3px solid #06b6d4; background: #ecfeff;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Fraunces', Georgia, serif;
                font-size: 36px; font-weight: 700; color: #0e7490;
            }
            .header-text { flex: 1; min-width: 0; }
            .eyebrow {
                display: inline-block; font-size: 10px; font-weight: 800;
                color: #0e7490; text-transform: uppercase; letter-spacing: 0.2em;
                background: #ecfeff; padding: 3px 10px; border-radius: 10px;
                margin-bottom: 6px;
            }
            .header-text h1 {
                font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
                font-size: 32px; font-weight: 700; color: #0c4a6e;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header-text .role { font-size: 13px; color: #0e7490; font-weight: 600; margin-bottom: 8px; font-style: italic; }
            .header-meta { font-size: 11.5px; color: #475569; line-height: 1.65; }
            .header-meta a { color: #0e7490; font-weight: 500; }
            .meta-separator { margin: 0 7px; color: #cbd5e1; }
            .summary-block { font-size: 13px; line-height: 1.7; margin-bottom: 22px; }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 11px; font-weight: 800; color: #0c4a6e;
                text-transform: uppercase; letter-spacing: 0.18em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #06b6d4;
            }
            .education-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
            .education-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .education-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .degree { font-size: 14px; font-weight: 700; color: #0c4a6e; flex: 1; min-width: 0; }
            .education-year { font-size: 11.5px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .institution { font-size: 12.5px; color: #475569; margin-bottom: 4px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px; font-size: 12.5px;
                color: #1f2937; line-height: 1.6; margin-bottom: 3px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 0; top: 8px;
                width: 5px; height: 5px; border-radius: 50%; background: #06b6d4;
            }
            .experience-item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 13.5px; font-weight: 700; color: #0c4a6e; flex: 1; min-width: 0; }
            .job-period { font-size: 11.5px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .company { font-size: 12.5px; color: #475569; font-weight: 500; margin-bottom: 5px; }
            .skill-group { margin-bottom: 8px; }
            .skill-group-name { font-size: 12px; font-weight: 700; color: #0e7490; margin-right: 6px; }
            .skill-list { font-size: 13px; color: #1f2937; }
            .lang-row { display: flex; gap: 8px; margin-bottom: 4px; font-size: 13px; }
            .lang-name { font-weight: 700; color: #0c4a6e; }
            .lang-level { color: #475569; }
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
                    ${cvData.personalInfo.title ? `<div class="eyebrow">Söker · ${cvData.personalInfo.title}</div>` : `<div class="eyebrow">Student</div>`}
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

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

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
                    ${edu.description ? `<div style="font-size:12px;color:#475569;line-height:1.6;">${edu.description}</div>` : ''}
                </div>`).join('')}
            </div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Praktik & arbetslivserfarenhet</h2>
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

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
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
    </body>
    </html>
  `;
}

export const studentPlusTemplate: CVTemplateGenerator = {
  templateId: 'student-plus' as any,
  generate: generateStudentPlusHTML,
  metadata: {
    name: 'Student Plus',
    description: 'Premium-uppgradering av Student med foto, drömjobb-eyebrow och utbildning först',
    category: 'modern',
    tier: 'premium'
  }
};
