import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Spektrum - premium creative CV-mall med fargglad gradient-sidopanel.
 *
 * Designprinciper:
 *  - 240px sidopanel med diagonal gradient (orange -> magenta -> lila)
 *  - Vit body med sektion-rubriker som har gradient-text
 *  - Inter body
 *  - Foto + LinkedIn stOd
 *  - ATS-saker (gradient ar bara CSS-bakgrund)
 */
function generateSpektrumHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

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
                display: flex;
                align-items: stretch;
            }

            .sidebar {
                flex: 0 0 240px;
                background: linear-gradient(180deg, #f97316 0%, #db2777 50%, #7c3aed 100%);
                color: white;
                padding: 36px 24px;
                position: relative;
            }

            .photo-wrap {
                width: 110px;
                height: 110px;
                margin: 0 auto 24px;
                border-radius: 50%;
                padding: 4px;
                background: rgba(255, 255, 255, 0.25);
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                display: block;
                border: 3px solid white;
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
                color: white;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                margin-bottom: 12px;
                padding-bottom: 6px;
                border-bottom: 1.5px solid rgba(255, 255, 255, 0.5);
            }

            .contact-line {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.96);
                margin-bottom: 6px;
                line-height: 1.55;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-line:last-child {
                margin-bottom: 0;
            }

            .skill-item {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.96);
                line-height: 1.6;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .skill-item:last-child {
                margin-bottom: 0;
            }

            .skill-item::before {
                content: '';
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: white;
                flex-shrink: 0;
            }

            .lang-row-side {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                margin-bottom: 5px;
                font-size: 12px;
                color: white;
            }

            .lang-row-side:last-child {
                margin-bottom: 0;
            }

            .lang-name-side {
                font-weight: 700;
            }

            .lang-level-side {
                font-size: 10.5px;
                color: rgba(255, 255, 255, 0.82);
            }

            .main {
                flex: 1;
                padding: 36px 32px 36px 30px;
                min-width: 0;
            }

            .main-header {
                margin-bottom: 22px;
                padding-bottom: 16px;
                border-bottom: 2px solid #db2777;
            }

            .main-header h1 {
                font-size: 32px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.05;
                letter-spacing: -0.02em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .main-header .role {
                font-size: 15px;
                font-weight: 700;
                background: linear-gradient(90deg, #f97316 0%, #db2777 50%, #7c3aed 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 24px;
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
                font-size: 11.5px;
                font-weight: 800;
                background: linear-gradient(90deg, #f97316 0%, #db2777 100%);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #f1f5f9;
            }

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
                color: #db2777;
                font-weight: 700;
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
                left: 0;
                top: 8px;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #db2777);
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
        </style>
    </head>
    <body>
        <div class="cv-container">
            <aside class="sidebar">
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                </div>` : ''}

                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Kontakt</h3>
                    ${cvData.personalInfo.email ? `<div class="contact-line">${cvData.personalInfo.email}</div>` : ''}
                    ${cvData.personalInfo.phone ? `<div class="contact-line">${cvData.personalInfo.phone}</div>` : ''}
                    ${cvData.personalInfo.address ? `<div class="contact-line">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                    ${includeLinkedIn ? `<div class="contact-line">${linkedInUrl}</div>` : ''}
                </div>

                ${allSkills.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Kompetenser</h3>
                    ${allSkills.slice(0, 12).map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Språk</h3>
                    ${cvData.languages.map(lang => `
                    <div class="lang-row-side">
                        <span class="lang-name-side">${lang.language}</span>
                        <span class="lang-level-side">${lang.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}
            </aside>

            <main class="main">
                <div class="main-header">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                </div>

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
            </main>
        </div>
    </body>
    </html>
  `;
}

export const spektrumTemplate: CVTemplateGenerator = {
  templateId: 'spektrum',
  generate: generateSpektrumHTML,
  metadata: {
    name: 'Spektrum',
    description: 'Premium-mall med levande gradient-sidopanel — för marknadsförare och kreativa',
    category: 'creative',
    tier: 'premium'
  }
};
