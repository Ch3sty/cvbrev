import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Varden - premium CV-mall fOr varden och omsorg.
 *
 * Designprinciper:
 *  - 240px salviegron sidopanel (#5d8a73) - vardfarg
 *  - Legitimationer + certifikat OVERST i sidopanelen med checkmarks
 *  - "Kompetensomraden" istallet for "Kompetenser"
 *  - "Klinisk erfarenhet" istallet for "Arbetslivserfarenhet"
 *  - "Arbetsplatser" som unika company-namn
 *  - Subtil orange-DNA pa pagaende-roller
 *  - Foto valfritt med rund kant + LinkedIn-stod
 */
function generateVardenOmsorgHTML(cvData: CVMetadata, options: any = {}): string {
  // Smart defaults
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Filtrera skills (utan sprak)
  const allSkills = cvData.skills.flatMap(group =>
    group.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
  );

  // Unika arbetsplatser (companies fran experience)
  const arbetsplatser = Array.from(new Set(cvData.experience.map(exp => exp.company).filter(Boolean)));

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
                font-family: 'Calibri', 'Segoe UI', system-ui, -apple-system, sans-serif;
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
                display: flex;
                align-items: stretch;
            }

            /* === Sidopanel (salviegron) === */
            .sidebar {
                flex: 0 0 240px;
                background: #5d8a73;
                color: white;
                padding: 32px 22px;
            }

            /* Foto */
            .photo-wrap {
                width: 100px;
                height: 100px;
                margin: 0 auto 22px;
                border-radius: 50%;
                padding: 3px;
                background: rgba(255, 255, 255, 0.2);
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                display: block;
                border: 2px solid white;
                background: white;
            }

            .sidebar-section {
                margin-bottom: 22px;
            }

            .sidebar-section:last-child {
                margin-bottom: 0;
            }

            .sidebar-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.95);
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 11px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }

            /* Certifikat-rader med checkmark */
            .cert-row {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 7px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.95);
                line-height: 1.45;
            }

            .cert-row:last-child {
                margin-bottom: 0;
            }

            .cert-icon {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                color: #d4f5dd;
                margin-top: 1px;
            }

            .cert-text {
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-line {
                font-size: 11.5px;
                color: rgba(255, 255, 255, 0.92);
                line-height: 1.5;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-line:last-child {
                margin-bottom: 0;
            }

            .linkedin-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                margin-top: 10px;
                padding: 5px 10px;
                background: white;
                color: #0a66c2;
                border-radius: 3px;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
            }

            .linkedin-icon {
                width: 11px;
                height: 11px;
                fill: #0a66c2;
            }

            .skill-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .skill-list li {
                position: relative;
                padding-left: 12px;
                margin-bottom: 5px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.95);
                line-height: 1.45;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 7px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #d4f5dd;
            }

            .arbetsplats-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .arbetsplats-list li {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.95);
                line-height: 1.5;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 6px;
                margin-bottom: 4px;
                font-size: 11.5px;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                color: white;
                font-weight: 600;
            }

            .language-level {
                color: rgba(255, 255, 255, 0.75);
                font-size: 11px;
            }

            /* === Huvudinnehall === */
            .main {
                flex: 1;
                min-width: 0;
                padding: 36px 36px 36px 32px;
            }

            .name-block {
                margin-bottom: 8px;
            }

            .name-block h1 {
                font-size: 30px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1.15;
                letter-spacing: -0.005em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .name-block .role {
                font-size: 15px;
                color: #5d8a73;
                font-weight: 600;
                margin-top: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-block {
                font-size: 13px;
                color: #374151;
                line-height: 1.7;
                margin: 18px 0 26px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .section {
                margin-bottom: 26px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 12px;
                font-weight: 700;
                color: #1f2937;
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
                width: 32px;
                height: 2px;
                background: #5d8a73;
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
                color: #1f2937;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 12.5px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }

            .job-period.pagaende {
                color: #f97316;
                font-weight: 600;
            }

            .company {
                font-size: 13px;
                color: #5d8a73;
                font-weight: 600;
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
                font-size: 12.5px;
                color: #374151;
                line-height: 1.6;
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
                background: #5d8a73;
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
                color: #1f2937;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 12.5px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #5d8a73;
                margin-top: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .references {
                margin-top: 28px;
                padding-top: 14px;
                border-top: 1px solid #e5e7eb;
                font-size: 11.5px;
                color: #94a3b8;
                font-style: italic;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Sidopanel === -->
            <aside class="sidebar">
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" />
                </div>` : ''}

                ${cvData.certifications && cvData.certifications.length > 0 ? `
                <!-- Legitimationer & certifikat (forst, viktigast) -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Legitimationer</div>
                    ${cvData.certifications.map(cert => {
                        if (typeof cert === 'string') {
                            return `
                            <div class="cert-row">
                                <svg class="cert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span class="cert-text">${cert}</span>
                            </div>`;
                        }
                        const year = cert.issueDate || cert.date || '';
                        return `
                            <div class="cert-row">
                                <svg class="cert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span class="cert-text">${cert.name}${year ? ' (' + year + ')' : ''}</span>
                            </div>`;
                    }).join('')}
                </div>` : ''}

                <!-- Kontakt -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kontakt</div>
                    ${cvData.personalInfo.email ? `<div class="contact-line">${cvData.personalInfo.email}</div>` : ''}
                    ${cvData.personalInfo.phone ? `<div class="contact-line">${cvData.personalInfo.phone}</div>` : ''}
                    ${cvData.personalInfo.address ? `<div class="contact-line">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                    ${includeLinkedIn ? `
                    <a href="${linkedInUrl}" class="linkedin-badge" target="_blank" rel="noopener">
                        <svg class="linkedin-icon" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                    </a>` : ''}
                </div>

                ${allSkills.length > 0 ? `
                <!-- Kompetensomraden -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kompetensområden</div>
                    <ul class="skill-list">
                        ${allSkills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${arbetsplatser.length > 0 ? `
                <!-- Arbetsplatser (unika companies) -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Arbetsplatser</div>
                    <ul class="arbetsplats-list">
                        ${arbetsplatser.slice(0, 6).map(ap => `<li>${ap}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <!-- Sprak -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Språk</div>
                    ${cvData.languages.map(lang => `
                    <div class="language-row">
                        <span class="language-name">${lang.language}</span>
                        <span class="language-level">${lang.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}
            </aside>

            <!-- === Huvudinnehall === -->
            <main class="main">
                <!-- Namn + titel -->
                <div class="name-block">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                </div>

                <!-- Sammanfattning -->
                ${cvData.summary ? `
                <div class="summary-block">${cvData.summary}</div>` : ''}

                <!-- Klinisk erfarenhet -->
                ${cvData.experience.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Klinisk erfarenhet</h2>
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
                            <div class="job-period${!exp.endDate && exp.startDate ? ' pagaende' : ''}">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
                        </div>
                        <div class="company">${exp.company}</div>
                        ${exp.description && exp.description.length > 0 ? `
                        <ul class="description-list">
                            ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                        </ul>` : ''}
                    </div>`).join('')}
                </div>` : ''}

                <!-- Utbildning -->
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

                <!-- Referenser -->
                <div class="references">Referenser lämnas på begäran</div>
            </main>
        </div>
    </body>
    </html>
  `;
}

export const vardenOmsorgTemplate: CVTemplateGenerator = {
  templateId: 'varden-omsorg',
  generate: generateVardenOmsorgHTML,
  metadata: {
    name: 'Vården',
    description: 'Designad för vård och omsorg med legitimationer först och kompetensområden',
    category: 'traditional',
    tier: 'premium'
  }
};
