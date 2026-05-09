import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Kvist - premium CV-mall fOr hallbarhets/eko-roller.
 *
 * Designprinciper:
 *  - MOrk skogsgron header-band (#14532d) som tar ~25% av sidan
 *  - Vit body med subtil gron accent (#16a34a) pa sektionsrubriker
 *  - Stort namn 32px i vit pa gron header
 *  - En kolumn body, ingen sidopanel
 *  - Sektion: "Hallbarhetsprojekt" om cvData.projects finns
 *  - Foto + LinkedIn stOd
 *  - ATS-saker
 */
function generateKvistHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;
  const projekt = cvData.projects || [];

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
            }

            .green-header {
                background: #14532d;
                color: white;
                padding: 36px 32px 30px;
                position: relative;
            }

            .green-header::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #16a34a 0%, transparent 60%);
            }

            .header-inner {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
            }

            .header-text {
                flex: 1;
                min-width: 0;
            }

            .green-header h1 {
                font-size: 34px;
                font-weight: 800;
                color: #f0fdf4;
                line-height: 1.05;
                letter-spacing: -0.02em;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .green-header .role {
                font-size: 15px;
                color: #86efac;
                font-weight: 600;
                margin-bottom: 14px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .green-meta-line {
                font-size: 12px;
                color: rgba(220, 252, 231, 0.92);
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .green-meta-separator {
                margin: 0 8px;
                color: rgba(134, 239, 172, 0.4);
            }

            .green-linkedin {
                color: #86efac;
                font-weight: 500;
                text-decoration: none;
            }

            .photo-wrap {
                flex-shrink: 0;
                width: 90px;
                height: 90px;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid rgba(255, 255, 255, 0.3);
                background: #1e293b;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .body {
                padding: 28px 32px 36px;
            }

            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 28px;
                padding-left: 16px;
                border-left: 3px solid #16a34a;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .section {
                margin-bottom: 28px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #14532d;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #d1fae5;
                position: relative;
            }

            .section-heading::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 36px;
                height: 2px;
                background: #16a34a;
            }

            .experience-item {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0fdf4;
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
                color: #14532d;
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
                color: #16a34a;
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
                padding-left: 18px;
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
                left: 4px;
                top: 9px;
                width: 6px;
                height: 6px;
                border-radius: 50% 0 50% 50%;
                background: #16a34a;
                transform: rotate(45deg);
            }

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
                color: #14532d;
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

            .project-item {
                margin-bottom: 12px;
                padding: 10px 14px;
                background: #f0fdf4;
                border-left: 3px solid #16a34a;
                border-radius: 2px;
            }

            .project-item:last-child {
                margin-bottom: 0;
            }

            .project-name {
                font-size: 13px;
                font-weight: 700;
                color: #14532d;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .project-desc {
                font-size: 12px;
                color: #1f2937;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-group {
                margin-bottom: 10px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 12px;
                font-weight: 700;
                color: #16a34a;
                margin-right: 8px;
            }

            .skill-list {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 13px;
            }

            .language-name {
                font-weight: 700;
                color: #14532d;
            }

            .language-level {
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="green-header">
                <div class="header-inner">
                    <div class="header-text">
                        <h1>${cvData.personalInfo.fullName}</h1>
                        ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                        <div class="green-meta-line">
                            ${cvData.personalInfo.email || ''}
                            ${cvData.personalInfo.phone ? `<span class="green-meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                            ${cvData.personalInfo.address ? `<span class="green-meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                            ${includeLinkedIn ? `<span class="green-meta-separator">·</span><a class="green-linkedin" href="${linkedInUrl}">LinkedIn</a>` : ''}
                        </div>
                    </div>
                    ${includePhoto ? `
                    <div class="photo-wrap">
                        <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                    </div>` : ''}
                </div>
            </header>

            <div class="body">
                ${cvData.summary ? `
                <div class="summary-block">${cvData.summary}</div>` : ''}

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

                ${projekt.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Hållbarhetsprojekt</h2>
                    ${projekt.slice(0, 5).map(p => `
                    <div class="project-item">
                        <div class="project-name">${p.name || p.title || ''}</div>
                        ${p.description ? `<div class="project-desc">${p.description}</div>` : ''}
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
        </div>
    </body>
    </html>
  `;
}

export const kvistTemplate: CVTemplateGenerator = {
  templateId: 'kvist',
  generate: generateKvistHTML,
  metadata: {
    name: 'Kvist',
    description: 'Premium-mall med skogsgrön header — för hållbarhet, klimat och cleantech',
    category: 'traditional',
    tier: 'premium'
  }
};
