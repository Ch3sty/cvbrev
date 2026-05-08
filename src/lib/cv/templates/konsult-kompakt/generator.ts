import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Konsulten - premium kompakt tva-kolumns CV-mall fOr seniora kandidater
 * (konsulter, ledning, 8+ ars erfarenhet).
 *
 * Designprinciper:
 *  - Flexbox container: 245px morkblá-gra sidopanel + flex: 1 main
 *  - Kompakt typografi (12.5px body) sa 8+ erfarenheter ryms pa en sida
 *  - Tight rad-spacing (1.4 line-height) utan att kannas crammad
 *  - Foto cirkel 110px med tunn vit ring i sidopanelen
 *  - LinkedIn-badge under kontakt
 *  - Subtil orange-DNA: orange foretagsnamn i body, orange divider
 *  - Inga clip-paths, inga absolute positions for textelement
 */
function generateKonsultKompaktHTML(cvData: CVMetadata, options: any = {}): string {
  // Smart defaults - foto/LinkedIn visas bara om data finns
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Kategorisera skills i grupper for kompakt presentation
  const allSkills = cvData.skills.flatMap(group =>
    group.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
  );

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
                line-height: 1.45;
                color: #1f2937;
                background: white;
                font-size: 12.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                display: flex;
                align-items: stretch;
            }

            /* === Sidopanel (morkblé-grá) === */
            .sidebar {
                flex: 0 0 245px;
                background: #1e293b;
                color: #e2e8f0;
                padding: 32px 24px;
                position: relative;
            }

            .sidebar::after {
                content: '';
                position: absolute;
                bottom: 32px;
                left: 24px;
                width: 36px;
                height: 3px;
                background: #f97316;
                border-radius: 1.5px;
            }

            /* Foto */
            .photo-wrap {
                width: 110px;
                height: 110px;
                margin: 0 auto 22px;
                border-radius: 50%;
                padding: 3px;
                background: rgba(255, 255, 255, 0.15);
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
                margin-bottom: 24px;
            }

            .sidebar-section:last-child {
                margin-bottom: 0;
            }

            .sidebar-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: #fdba74;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(253, 186, 116, 0.3);
            }

            .contact-line {
                font-size: 11.5px;
                color: #cbd5e1;
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
                margin-bottom: 4px;
                font-size: 11.5px;
                color: #cbd5e1;
                line-height: 1.4;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-list li::before {
                content: '';
                position: absolute;
                left: 0;
                top: 6px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #f97316;
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
                color: #e2e8f0;
                font-weight: 600;
            }

            .language-level {
                color: #94a3b8;
                font-size: 10.5px;
            }

            .cert-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .cert-list li {
                font-size: 11.5px;
                color: #cbd5e1;
                line-height: 1.4;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Huvudinnehall === */
            .main {
                flex: 1;
                min-width: 0;
                padding: 36px 36px 36px 32px;
            }

            .name-block {
                margin-bottom: 6px;
            }

            .name-block h1 {
                font-size: 26px;
                font-weight: 700;
                color: #111827;
                line-height: 1.15;
                letter-spacing: -0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .name-block .role {
                font-size: 14px;
                color: #f97316;
                font-weight: 600;
                margin-top: 3px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-block {
                font-size: 12.5px;
                color: #374151;
                line-height: 1.6;
                margin: 16px 0 22px;
                padding-bottom: 18px;
                border-bottom: 1px solid #e5e7eb;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .section {
                margin-bottom: 22px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #111827;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                margin-bottom: 12px;
                padding-bottom: 5px;
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
                background: #f97316;
            }

            /* === Experience items - kompakt === */
            .experience-item {
                margin-bottom: 14px;
            }

            .experience-item:last-child {
                margin-bottom: 0;
            }

            .experience-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 12px;
                margin-bottom: 2px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 13px;
                font-weight: 700;
                color: #111827;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11.5px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }

            .company {
                font-size: 12px;
                color: #f97316;
                font-weight: 600;
                margin-bottom: 5px;
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
                padding-left: 12px;
                font-size: 12px;
                color: #374151;
                line-height: 1.5;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 2px;
                top: 7px;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background: #d1d5db;
            }

            /* === Education items === */
            .education-item {
                margin-bottom: 10px;
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
                font-size: 12.5px;
                font-weight: 700;
                color: #111827;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 11.5px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }

            .institution {
                font-size: 11.5px;
                color: #6b7280;
                margin-top: 1px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .references {
                margin-top: 24px;
                padding-top: 12px;
                border-top: 1px solid #e5e7eb;
                font-size: 10.5px;
                color: #9ca3af;
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
                <!-- Kompetenser -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kompetenser</div>
                    <ul class="skill-list">
                        ${allSkills.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <!-- Sprak -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Sprak</div>
                    ${cvData.languages.map(lang => `
                    <div class="language-row">
                        <span class="language-name">${lang.language}</span>
                        <span class="language-level">${lang.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}

                ${cvData.certifications && cvData.certifications.length > 0 ? `
                <!-- Certifieringar -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Certifieringar</div>
                    <ul class="cert-list">
                        ${cvData.certifications.map(cert => {
                          if (typeof cert === 'string') return `<li>${cert}</li>`;
                          const year = cert.issueDate || cert.date || '';
                          return `<li>${cert.name}${year ? ' (' + year + ')' : ''}</li>`;
                        }).join('')}
                    </ul>
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

                <!-- Arbetslivserfarenhet -->
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

export const konsultKompaktTemplate: CVTemplateGenerator = {
  templateId: 'konsult-kompakt',
  generate: generateKonsultKompaktHTML,
  metadata: {
    name: 'Konsulten',
    description: 'Kompakt premium-mall för seniora kandidater med foto och LinkedIn',
    category: 'traditional',
    tier: 'premium'
  }
};
