import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Bold - premium CV-mall med stark typografisk hierarki och whitespace.
 *
 * Designprinciper:
 *  - Stort namn (44px) delat pa tva rader for visuell statement
 *  - Tjock horisontell linje (3px solid svart) under namn som ankare
 *  - Mycket whitespace - 50mm vansterspaltsmarginal istallet for 30mm
 *  - Foto litet (90px) i hornet - fokus pa personen, inte fotot
 *  - LinkedIn-badge diskret bredvid kontakt
 *  - Subtil orange-touch (#f97316) pa datum - matchar sajtens DNA
 *  - Inga clip-paths, inga absolute positions for textelement
 *  - Vanlig block-flow + flexbox (ATS-saker)
 */
function generateBoldModernHTML(cvData: CVMetadata, options: any = {}): string {
  // Smart defaults
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Dela namn pa tva rader (Fornamn / Efternamn)
  const nameParts = cvData.personalInfo.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || cvData.personalInfo.fullName;
  const restName = nameParts.slice(1).join(' ');

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
                font-family: 'Inter', 'Calibri', 'Segoe UI', system-ui, -apple-system, sans-serif;
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
                padding: 32mm 22mm 32mm 22mm;
            }

            /* === Top-row: foto + kontakt === */
            .top-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                margin-bottom: 36px;
            }

            .photo-wrap {
                flex-shrink: 0;
                width: 90px;
                height: 90px;
                border-radius: 50%;
                overflow: hidden;
                background: #f3f4f6;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .contact-area {
                text-align: right;
                font-size: 12.5px;
                color: #4b5563;
                line-height: 1.65;
                max-width: 260px;
            }

            .contact-line {
                margin-bottom: 3px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .linkedin-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                margin-top: 8px;
                padding: 5px 11px;
                background: #0a66c2;
                color: white;
                border-radius: 3px;
                font-size: 11.5px;
                font-weight: 600;
                text-decoration: none;
            }

            .linkedin-icon {
                width: 11px;
                height: 11px;
                fill: white;
            }

            /* === Bold namn-block === */
            .name-block {
                margin-bottom: 28px;
            }

            .name-line-1,
            .name-line-2 {
                display: block;
                font-size: 44px;
                font-weight: 800;
                color: #0f172a;
                line-height: 0.98;
                letter-spacing: -0.02em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .name-divider {
                width: 80px;
                height: 3px;
                background: #0f172a;
                margin: 16px 0 14px;
            }

            .role-line {
                font-size: 16px;
                color: #1f2937;
                font-weight: 500;
                letter-spacing: 0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 14px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 36px;
                max-width: 560px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Tunn dubbel-divider mellan sektioner === */
            .double-divider {
                position: relative;
                height: 5px;
                margin: 0 0 36px;
            }

            .double-divider::before,
            .double-divider::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                height: 1px;
                background: #0f172a;
            }

            .double-divider::before {
                top: 0;
            }

            .double-divider::after {
                bottom: 0;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 30px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 13px;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                margin-bottom: 18px;
            }

            /* === Experience items === */
            .experience-item {
                margin-bottom: 22px;
            }

            .experience-item:last-child {
                margin-bottom: 0;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 16px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 15px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 12.5px;
                color: #f97316;
                font-weight: 600;
                flex-shrink: 0;
                letter-spacing: 0.01em;
            }

            .company {
                font-size: 13.5px;
                color: #475569;
                font-weight: 500;
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
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.65;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 9px;
                width: 6px;
                height: 1px;
                background: #0f172a;
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
                gap: 16px;
                flex-wrap: wrap;
            }

            .degree {
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 12.5px;
                color: #f97316;
                font-weight: 600;
                flex-shrink: 0;
            }

            .institution {
                font-size: 13px;
                color: #475569;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Skills grid === */
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px 24px;
            }

            .skills-grid li {
                position: relative;
                padding-left: 14px;
                font-size: 13px;
                color: #1f2937;
                line-height: 1.5;
                list-style: none;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skills-grid li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 8px;
                width: 6px;
                height: 1px;
                background: #f97316;
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
                color: #0f172a;
            }

            .language-level {
                color: #64748b;
            }

            .references {
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                font-size: 11.5px;
                color: #94a3b8;
                font-style: italic;
                letter-spacing: 0.04em;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Top-row: foto + kontakt === -->
            <div class="top-row">
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" />
                </div>` : '<div></div>'}

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
            </div>

            <!-- === Bold namn-block === -->
            <div class="name-block">
                <span class="name-line-1">${firstName}</span>
                ${restName ? `<span class="name-line-2">${restName}</span>` : ''}
                <div class="name-divider"></div>
                ${cvData.personalInfo.title ? `<div class="role-line">${cvData.personalInfo.title}</div>` : ''}
            </div>

            <!-- === Sammanfattning === -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- === Tunn dubbel-divider === -->
            <div class="double-divider"></div>

            <!-- === Arbetslivserfarenhet === -->
            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Erfarenhet</h2>
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

            <!-- === Kompetenser === -->
            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                <ul class="skills-grid">
                    ${cvData.skills.flatMap(group =>
                        group.skills
                            .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                            .map(skill => `<li>${skill}</li>`)
                    ).join('')}
                </ul>
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
            <div class="references">Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const boldModernTemplate: CVTemplateGenerator = {
  templateId: 'bold-modern',
  generate: generateBoldModernHTML,
  metadata: {
    name: 'Bold',
    description: 'Stark typografisk hierarki med foto och LinkedIn för marknadsföring',
    category: 'creative',
    tier: 'premium'
  }
};
