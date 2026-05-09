import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Aspekt - bred premium-mall fOr generella tjansteman med foto.
 *
 * Designprinciper:
 *  - Tre-zons header: namn vanster + foto hoger (rektangular 80x100)
 *  - Single column body med sektion-blocks
 *  - "Fokusomraden"-pills efter sammanfattning
 *  - Slate-bla accent (#1e40af → #3730a3) - neutral professional
 *  - Inter body, Source Serif Pro fOr rubriker
 *  - Foto + LinkedIn stOd
 *  - ATS-saker
 */
function generateAspektHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Plocka upp 3-5 fokusomrades-pills fran skills (forsta gruppen, max 5)
  const focusPills: string[] = [];
  if (cvData.skills.length > 0) {
    cvData.skills.forEach(group => {
      group.skills.forEach(skill => {
        if (focusPills.length < 5 && skill.length < 30 && !cvData.languages?.some(l => skill.toLowerCase().includes(l.language.toLowerCase()))) {
          focusPills.push(skill);
        }
      });
    });
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
                line-height: 1.6;
                color: #1f2937;
                background: white;
                font-size: 13px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 30mm 28mm;
            }

            /* === Header === */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                margin-bottom: 28px;
                padding-bottom: 22px;
                border-bottom: 2px solid #1e40af;
            }

            .header-text {
                flex: 1;
                min-width: 0;
            }

            .header h1 {
                font-family: 'Source Serif Pro', 'Georgia', serif;
                font-size: 32px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.05;
                letter-spacing: -0.015em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 14.5px;
                color: #1e40af;
                font-weight: 600;
                margin-bottom: 12px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12px;
                color: #475569;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            .linkedin-link {
                color: #1e40af;
                font-weight: 500;
                text-decoration: none;
            }

            .photo-wrap {
                flex-shrink: 0;
                width: 80px;
                height: 100px;
                overflow: hidden;
                background: #f1f5f9;
                border: 2px solid white;
                box-shadow: 0 0 0 1px #e2e8f0;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 18px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Fokusomraden pills === */
            .focus-pills {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 28px;
            }

            .focus-pill {
                display: inline-block;
                padding: 5px 11px;
                background: #eef2ff;
                color: #1e40af;
                font-size: 11.5px;
                font-weight: 600;
                border-radius: 12px;
                border: 1px solid #c7d2fe;
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
                font-family: 'Source Serif Pro', 'Georgia', serif;
                font-size: 16px;
                font-weight: 700;
                color: #0f172a;
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
                width: 36px;
                height: 2px;
                background: #1e40af;
            }

            /* === Experience === */
            .experience-item {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f1f5f9;
            }

            .experience-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 14px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 14.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11.5px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #1e40af;
                font-weight: 600;
                margin-bottom: 8px;
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
                padding-left: 16px;
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.6;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 2px;
                top: 8px;
                width: 6px;
                height: 6px;
                background: #1e40af;
                transform: rotate(45deg);
            }

            /* === Education === */
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
                gap: 14px;
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
                font-size: 11.5px;
                color: #64748b;
                font-weight: 500;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #475569;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Skills === */
            .skill-group {
                margin-bottom: 10px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 12px;
                font-weight: 700;
                color: #1e40af;
                margin-right: 8px;
            }

            .skill-list {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 13px;
            }

            .language-name {
                font-weight: 600;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                <div class="header-text">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="meta-line">
                        ${cvData.personalInfo.email || ''}
                        ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                        ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                        ${includeLinkedIn ? `<span class="meta-separator">·</span><a class="linkedin-link" href="${linkedInUrl}">LinkedIn</a>` : ''}
                    </div>
                </div>
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                </div>` : ''}
            </header>

            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            ${focusPills.length > 0 ? `
            <div class="focus-pills">
                ${focusPills.map(p => `<span class="focus-pill">${p}</span>`).join('')}
            </div>` : ''}

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

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                ${cvData.skills.map(group => `
                <div class="skill-group">
                    ${group.category ? `<span class="skill-group-name">${group.category}:</span>` : ''}
                    <span class="skill-list">${group.skills.join(', ')}</span>
                </div>`).join('')}
            </div>` : ''}

            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(lang => `
                <div class="language-row">
                    <span class="language-name">${lang.language}</span>
                    <span class="language-level">— ${lang.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const aspektTemplate: CVTemplateGenerator = {
  templateId: 'aspekt',
  generate: generateAspektHTML,
  metadata: {
    name: 'Aspekt',
    description: 'Bred premium-mall för tjänstemän, ingenjörer, ekonomer och HR med foto',
    category: 'modern',
    tier: 'premium'
  }
};
