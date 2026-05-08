import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Sidopanel - gratis CV-mall med fast vansterspaltlayout.
 *
 * Designprinciper:
 *  - Flexbox cv-container (display: flex; align-items: stretch)
 *  - Sidopanel: 200px bred, ljus orange-tonad bakgrund (#fef7ed)
 *  - Huvudinnehall: flex: 1, min-width: 0 for overflow-skydd
 *  - Inga clip-paths, inga absolute positions
 *  - Subtila orange accenter matchar sajtens DNA (#f97316)
 *  - Calibri/system-ui typsnitt for ATS-saker rendering
 *  - Inline SVG-ikoner for kontaktrader (14px)
 */
function generateSidebarIconsHTML(cvData: CVMetadata, _options: any = {}): string {
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
                display: flex;
                align-items: stretch;
            }

            /* === Sidopanel === */
            .sidebar {
                flex: 0 0 200px;
                background: #fef7ed;
                padding: 32px 22px;
                border-right: 1px solid #fed7aa;
            }

            .sidebar-section {
                margin-bottom: 28px;
            }

            .sidebar-section:last-child {
                margin-bottom: 0;
            }

            .sidebar-heading {
                font-size: 11px;
                font-weight: 700;
                color: #9a3412;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                margin-bottom: 12px;
                padding-bottom: 6px;
                border-bottom: 1px solid #fed7aa;
            }

            .contact-row {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 9px;
                font-size: 12.5px;
                color: #374151;
                line-height: 1.4;
            }

            .contact-row:last-child {
                margin-bottom: 0;
            }

            .contact-icon {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                color: #f97316;
                margin-top: 2px;
            }

            .contact-text {
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .skill-list li {
                position: relative;
                padding-left: 14px;
                margin-bottom: 6px;
                font-size: 12.5px;
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
                font-size: 11px;
                font-weight: 500;
            }

            /* === Huvudinnehall === */
            .main {
                flex: 1;
                min-width: 0;
                padding: 38px 36px;
            }

            .name-block {
                margin-bottom: 24px;
                padding-bottom: 18px;
                border-bottom: 2px solid #fed7aa;
            }

            .name-block h1 {
                font-size: 30px;
                font-weight: 700;
                color: #111827;
                line-height: 1.1;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .name-block .role {
                font-size: 15px;
                color: #f97316;
                font-weight: 600;
                letter-spacing: 0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-block {
                font-size: 13.5px;
                color: #374151;
                line-height: 1.65;
                margin-bottom: 28px;
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
                font-size: 13px;
                font-weight: 700;
                color: #111827;
                text-transform: uppercase;
                letter-spacing: 0.1em;
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
                background: #f97316;
            }

            .experience-item {
                margin-bottom: 18px;
            }

            .experience-item:last-child {
                margin-bottom: 0;
            }

            .job-row {
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
                color: #111827;
                overflow-wrap: break-word;
                word-wrap: break-word;
                flex: 1;
                min-width: 0;
            }

            .job-period {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #f97316;
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

            .education-item {
                margin-bottom: 14px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .degree {
                font-size: 14px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .institution {
                font-size: 13px;
                color: #6b7280;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .references {
                margin-top: 28px;
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
            <!-- === Sidopanel === -->
            <aside class="sidebar">
                <!-- Kontakt -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kontakt</div>
                    ${cvData.personalInfo.email ? `
                    <div class="contact-row">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 5L2 7"></path></svg>
                        <span class="contact-text">${cvData.personalInfo.email}</span>
                    </div>` : ''}
                    ${cvData.personalInfo.phone ? `
                    <div class="contact-row">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span class="contact-text">${cvData.personalInfo.phone}</span>
                    </div>` : ''}
                    ${cvData.personalInfo.address ? `
                    <div class="contact-row">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span class="contact-text">${formatSwedishAddress(cvData.personalInfo.address)}</span>
                    </div>` : ''}
                </div>

                ${cvData.skills.length > 0 ? `
                <!-- Kompetenser -->
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kompetenser</div>
                    <ul class="skill-list">
                        ${cvData.skills.flatMap(group =>
                            group.skills
                                .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                                .map(skill => `<li>${skill}</li>`)
                        ).join('')}
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
                        <div class="job-row">
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
                        <div class="degree">${edu.degree}</div>
                        <div class="institution">${edu.institution}${edu.graduationYear ? ' • ' + edu.graduationYear : (edu.startDate ? ' • ' + edu.startDate : '')}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
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

export const sidebarIconsTemplate: CVTemplateGenerator = {
  templateId: 'sidebar-icons',
  generate: generateSidebarIconsHTML,
  metadata: {
    name: 'Sidopanel',
    description: 'Tydlig sidopanel med kontakt och kompetenser, modernt utseende',
    category: 'modern',
    tier: 'free'
  }
};
