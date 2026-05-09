import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Magasin - premium creative CV-mall i tidnings-cover-stil.
 *
 * Designprinciper:
 *  - Vanster: stort foto 200x280 (eller alternativ namn-zon om utan foto)
 *  - Hoger: stort namn 48px serif (Playfair Display) + roll i italic
 *  - Body: 2-kolumns med blockquote-summary vanster + erfarenhet hoger
 *  - MOrkrod accent (#991b1b) - tidnings-bordeaux
 *  - Inga clip-paths - bara strikta rektangulara block
 *  - Foto rekommenderas men optional
 *  - LinkedIn stOd
 *  - ATS-saker
 */
function generateMagasinHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

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
                line-height: 1.65;
                color: #1f2937;
                background: white;
                font-size: 13px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 0;
            }

            /* Stor cover-header */
            .cover {
                display: grid;
                grid-template-columns: 220px 1fr;
                gap: 28px;
                padding: 32px 32px 28px;
                border-bottom: 4px solid #991b1b;
                align-items: stretch;
            }

            .cover-photo {
                width: 220px;
                height: 280px;
                background: #f1f5f9;
                overflow: hidden;
            }

            .cover-photo img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .cover-photo-placeholder {
                width: 220px;
                height: 280px;
                background: #fef2f2;
                border: 3px solid #991b1b;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Playfair Display', 'Georgia', serif;
                font-size: 86px;
                font-weight: 700;
                color: #991b1b;
                line-height: 1;
            }

            .cover-text {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-width: 0;
            }

            .cover-eyebrow {
                font-size: 10.5px;
                font-weight: 700;
                color: #991b1b;
                text-transform: uppercase;
                letter-spacing: 0.32em;
                padding-bottom: 8px;
                border-bottom: 1px solid #991b1b;
                margin-bottom: 14px;
            }

            .cover h1 {
                font-family: 'Playfair Display', 'Fraunces', 'Georgia', serif;
                font-size: 48px;
                font-weight: 700;
                color: #0f172a;
                line-height: 0.95;
                letter-spacing: -0.025em;
                margin-bottom: 10px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cover .role {
                font-family: 'Playfair Display', 'Georgia', serif;
                font-size: 17px;
                color: #475569;
                font-style: italic;
                font-weight: 400;
                margin-bottom: 14px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cover-meta {
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 11px;
                color: #475569;
                line-height: 1.7;
                letter-spacing: 0.02em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cover-meta-row {
                display: flex;
                gap: 8px;
            }

            .cover-meta-label {
                color: #991b1b;
                font-weight: 700;
                width: 60px;
                flex-shrink: 0;
            }

            .cover-linkedin {
                color: #991b1b;
                font-weight: 600;
                text-decoration: none;
            }

            /* Body */
            .body {
                padding: 28px 32px 36px;
            }

            .summary-block {
                font-family: 'Playfair Display', 'Fraunces', 'Georgia', serif;
                font-size: 18px;
                font-style: italic;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 30px;
                padding: 12px 0 12px 22px;
                border-left: 4px solid #991b1b;
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
                font-family: 'Playfair Display', 'Georgia', serif;
                font-size: 22px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 2px solid #991b1b;
                letter-spacing: -0.01em;
            }

            .experience-item {
                margin-bottom: 22px;
                padding-bottom: 22px;
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
                font-family: 'Playfair Display', 'Georgia', serif;
                font-size: 17px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 11px;
                color: #991b1b;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.04em;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #991b1b;
                font-weight: 700;
                font-style: italic;
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
                font-size: 13px;
                color: #1f2937;
                line-height: 1.65;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 10px;
                width: 8px;
                height: 1px;
                background: #991b1b;
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
                font-family: 'Playfair Display', 'Georgia', serif;
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 11px;
                color: #991b1b;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #475569;
                font-style: italic;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-group {
                margin-bottom: 8px;
            }

            .skill-group-name {
                font-size: 12px;
                font-weight: 700;
                color: #991b1b;
                margin-right: 8px;
            }

            .skill-list {
                font-size: 13px;
                color: #1f2937;
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
                color: #0f172a;
            }

            .language-level {
                color: #64748b;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="cover">
                ${includePhoto ? `
                <div class="cover-photo">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                </div>` : `
                <div class="cover-photo-placeholder">
                    ${(cvData.personalInfo.fullName || '?').trim().charAt(0).toUpperCase()}
                </div>`}

                <div class="cover-text">
                    <div>
                        <div class="cover-eyebrow">CV · ${new Date().getFullYear()}</div>
                        <h1>${cvData.personalInfo.fullName}</h1>
                        ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    </div>

                    <div class="cover-meta">
                        ${cvData.personalInfo.email ? `<div class="cover-meta-row"><span class="cover-meta-label">EPOST</span>${cvData.personalInfo.email}</div>` : ''}
                        ${cvData.personalInfo.phone ? `<div class="cover-meta-row"><span class="cover-meta-label">TEL</span>${cvData.personalInfo.phone}</div>` : ''}
                        ${cvData.personalInfo.address ? `<div class="cover-meta-row"><span class="cover-meta-label">PLATS</span>${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                        ${includeLinkedIn ? `<div class="cover-meta-row"><span class="cover-meta-label">LINKEDIN</span><a class="cover-linkedin" href="${linkedInUrl}">${linkedInUrl.replace(/^https?:\/\//, '')}</a></div>` : ''}
                    </div>
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
                            <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' / ' + exp.endDate : (exp.startDate ? ' / Pågående' : '')}</div>
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
                            <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' / ' + edu.endDate : ''}</div>
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

export const magasinTemplate: CVTemplateGenerator = {
  templateId: 'magasin',
  generate: generateMagasinHTML,
  metadata: {
    name: 'Magasin',
    description: 'Premium tidnings-cover-mall med stort foto och dramatisk serif-typografi',
    category: 'creative',
    tier: 'premium'
  }
};
