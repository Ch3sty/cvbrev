import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Editorial - premium CV-mall med asymmetrisk magazine-layout.
 *
 * Designprinciper:
 *  - Header som flexbox (display: flex; align-items: center; gap: 24px)
 *  - Foto: cirkel 110px med subtil orange ring, flex-shrink: 0
 *  - Name-title-area: flex: 1, min-width: 0 (overflow-skydd)
 *  - Contact-area: flex-shrink: 0 (hogersida med email/tel + LinkedIn-badge)
 *  - Sammanfattning: serif (Garamond/Georgia) i blockquote-stil med
 *    border-left orange-gradient, vaxer naturligt med text
 *  - Body: CSS Grid (1.5fr 1fr) med erfarenhet vanster, ovrigt hoger
 *  - Inga clip-paths, inga absolute positions for textelement
 *  - Subtil orange-DNA matchar sajtens varumarke
 */
function generateEditorialMagazineHTML(cvData: CVMetadata, options: any = {}): string {
  // Smart defaults - photo/LinkedIn visas bara om data finns
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
                font-family: 'Calibri', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
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
                padding: 38px 42px;
                position: relative;
            }

            /* === Header === */
            .editorial-header {
                display: flex;
                align-items: center;
                gap: 26px;
                padding-bottom: 24px;
                border-bottom: 1px solid #fed7aa;
                margin-bottom: 22px;
            }

            .photo-frame {
                flex-shrink: 0;
                width: 110px;
                height: 110px;
                border-radius: 50%;
                padding: 3px;
                background: linear-gradient(135deg, #fb923c, #f97316);
            }

            .photo-frame img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid white;
                background: white;
                display: block;
            }

            .name-title-area {
                flex: 1;
                min-width: 0;
            }

            .name-line {
                font-size: 32px;
                font-weight: 700;
                color: #111827;
                line-height: 1.1;
                margin-bottom: 6px;
                letter-spacing: -0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .role-line {
                font-size: 15px;
                color: #f97316;
                font-weight: 600;
                letter-spacing: 0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-area {
                flex-shrink: 0;
                text-align: right;
                font-size: 12.5px;
                color: #4b5563;
                line-height: 1.5;
                max-width: 200px;
            }

            .contact-area .contact-line {
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .linkedin-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                padding: 5px 11px;
                background: #0a66c2;
                color: white;
                border-radius: 4px;
                font-size: 11.5px;
                font-weight: 600;
                text-decoration: none;
                letter-spacing: 0.01em;
            }

            .linkedin-icon {
                width: 12px;
                height: 12px;
                fill: white;
            }

            /* === Sammanfattning som blockquote === */
            .summary-quote {
                position: relative;
                padding: 18px 22px;
                margin-bottom: 30px;
                font-family: 'Garamond', 'Georgia', serif;
                font-size: 14.5px;
                font-style: italic;
                color: #374151;
                line-height: 1.7;
                background: #fffbf5;
                border-radius: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-quote::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                background: linear-gradient(180deg, #f97316, #dc2626);
                border-radius: 2px 0 0 2px;
            }

            /* === Body grid === */
            .body-grid {
                display: grid;
                grid-template-columns: 1.5fr 1fr;
                gap: 32px;
            }

            .body-column {
                min-width: 0;
            }

            .section {
                margin-bottom: 26px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #111827;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 14px;
                padding-bottom: 7px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }

            .section-heading::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 32px;
                height: 2px;
                background: #f97316;
            }

            /* === Experience items === */
            .experience-item {
                margin-bottom: 18px;
                padding-left: 16px;
                position: relative;
            }

            .experience-item:last-child {
                margin-bottom: 0;
            }

            .experience-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 6px;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: white;
                border: 2px solid #f97316;
            }

            .experience-item::after {
                content: '';
                position: absolute;
                left: 4px;
                top: 18px;
                bottom: -10px;
                width: 1px;
                background: #fed7aa;
            }

            .experience-item:last-child::after {
                display: none;
            }

            .job-title {
                font-size: 14px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-meta {
                font-size: 12.5px;
                color: #f97316;
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
                padding-left: 14px;
                font-size: 13px;
                color: #374151;
                line-height: 1.55;
                margin-bottom: 3px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 3px;
                top: 8px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #d1d5db;
            }

            /* === Education items === */
            .education-item {
                margin-bottom: 14px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .degree {
                font-size: 13.5px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .institution {
                font-size: 12.5px;
                color: #6b7280;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Skills === */
            .skill-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .skill-list li {
                position: relative;
                padding-left: 14px;
                margin-bottom: 6px;
                font-size: 13px;
                color: #374151;
                line-height: 1.45;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 7px;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: #f97316;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 6px;
                font-size: 12.5px;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                color: #1f2937;
                font-weight: 600;
            }

            .language-level {
                color: #92400e;
                font-size: 11.5px;
                font-weight: 500;
            }

            .references {
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                font-size: 11.5px;
                color: #9ca3af;
                font-style: italic;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Header === -->
            <header class="editorial-header">
                ${includePhoto ? `
                <div class="photo-frame">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" />
                </div>` : ''}

                <div class="name-title-area">
                    <h1 class="name-line">${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role-line">${cvData.personalInfo.title}</div>` : ''}
                </div>

                <div class="contact-area">
                    ${cvData.personalInfo.email ? `<div class="contact-line">${cvData.personalInfo.email}</div>` : ''}
                    ${cvData.personalInfo.phone ? `<div class="contact-line">${cvData.personalInfo.phone}</div>` : ''}
                    ${cvData.personalInfo.address ? `<div class="contact-line">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                    ${includeLinkedIn ? `
                    <a href="${linkedInUrl}" class="linkedin-badge" target="_blank" rel="noopener">
                        <svg class="linkedin-icon" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>` : ''}
                </div>
            </header>

            <!-- === Sammanfattning === -->
            ${cvData.summary ? `
            <blockquote class="summary-quote">${cvData.summary}</blockquote>` : ''}

            <!-- === Body grid === -->
            <div class="body-grid">
                <!-- Vansterspalt: Arbetslivserfarenhet -->
                <div class="body-column">
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
                            <div class="job-title">${exp.position}</div>
                            <div class="job-meta">${exp.company}${exp.startDate || exp.endDate ? ' • ' : ''}${exp.startDate ? exp.startDate : ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
                            ${exp.description && exp.description.length > 0 ? `
                            <ul class="description-list">
                                ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                            </ul>` : ''}
                        </div>`).join('')}
                    </div>` : ''}
                </div>

                <!-- Hogerspalt: Utbildning, Kompetenser, Sprak -->
                <div class="body-column">
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
                            <div class="degree">${edu.degree}</div>
                            <div class="institution">${edu.institution}${edu.graduationYear ? ' • ' + edu.graduationYear : (edu.startDate ? ' • ' + edu.startDate : '')}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                        </div>`).join('')}
                    </div>` : ''}

                    ${cvData.skills.length > 0 ? `
                    <div class="section">
                        <h2 class="section-heading">Kompetenser</h2>
                        <ul class="skill-list">
                            ${cvData.skills.flatMap(group =>
                                group.skills
                                    .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                                    .map(skill => `<li>${skill}</li>`)
                            ).join('')}
                        </ul>
                    </div>` : ''}

                    ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                    <div class="section">
                        <h2 class="section-heading">Sprak</h2>
                        ${cvData.languages.map(lang => `
                        <div class="language-row">
                            <span class="language-name">${lang.language}</span>
                            <span class="language-level">${lang.proficiency}</span>
                        </div>`).join('')}
                    </div>` : ''}
                </div>
            </div>

            <!-- Referenser -->
            <div class="references">Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const editorialMagazineTemplate: CVTemplateGenerator = {
  templateId: 'editorial-magazine',
  generate: generateEditorialMagazineHTML,
  metadata: {
    name: 'Editorial',
    description: 'Asymmetrisk magazine-layout med foto och LinkedIn-stöd',
    category: 'creative',
    tier: 'premium'
  }
};
