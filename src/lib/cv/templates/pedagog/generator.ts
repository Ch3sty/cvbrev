import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Pedagog - premium CV-mall for larare och pedagoger.
 *
 * Designprinciper:
 *  - 240px ljus salviegron sidopanel (#84a98c) - varm men professionell
 *  - "Behorigheter & legitimation" overst i sidopanelen
 *  - "Pedagogisk erfarenhet" istallet for "Arbetslivserfarenhet"
 *  - Auto-genererad lista over skolor/lärosäten
 *  - Foto + LinkedIn stod
 *  - Source Sans / Calibri body
 *  - ATS-saker - inga clip-paths
 */
function generatePedagogHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Filtrera skills (utan sprak)
  const allSkills = cvData.skills.flatMap(group =>
    group.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
  );

  // Unika skolor/larosaten
  const skolor = Array.from(new Set(cvData.experience.map(exp => exp.company).filter(Boolean)));

  // Hitta certifieringar (legitimation/behorigheter)
  const certifikat = cvData.certifications || [];

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
                font-family: 'Source Sans Pro', 'Calibri', 'Segoe UI', system-ui, sans-serif;
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
                background: #84a98c;
                color: white;
                padding: 32px 22px;
            }

            .photo-wrap {
                width: 100px;
                height: 100px;
                margin: 0 auto 22px;
                border-radius: 50%;
                padding: 3px;
                background: rgba(255, 255, 255, 0.22);
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
                color: rgba(255, 255, 255, 0.97);
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 11px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.35);
            }

            .cert-row {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                margin-bottom: 7px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.96);
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cert-mark {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.25);
                color: white;
                font-size: 10px;
                font-weight: 700;
                line-height: 14px;
                text-align: center;
                margin-top: 1px;
            }

            .contact-line {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.94);
                margin-bottom: 6px;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .contact-line:last-child {
                margin-bottom: 0;
            }

            .skill-item {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.95);
                line-height: 1.55;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-item:last-child {
                margin-bottom: 0;
            }

            .school-item {
                font-size: 11.5px;
                color: rgba(255, 255, 255, 0.92);
                line-height: 1.5;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Main === */
            .main {
                flex: 1;
                padding: 36px 32px 36px 30px;
                min-width: 0;
            }

            .main-header {
                margin-bottom: 24px;
                padding-bottom: 18px;
                border-bottom: 2px solid #84a98c;
            }

            .main-header h1 {
                font-size: 30px;
                font-weight: 700;
                color: #1f2937;
                line-height: 1.1;
                letter-spacing: -0.015em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .main-header .role {
                font-size: 15px;
                color: #5d8a6e;
                font-weight: 600;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 26px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .section {
                margin-bottom: 24px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #1f2937;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 1px solid #84a98c;
            }

            .experience-item {
                margin-bottom: 18px;
                padding-bottom: 18px;
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
                color: #1f2937;
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
                color: #5d8a6e;
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
                border-radius: 50%;
                background: #84a98c;
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
                color: #1f2937;
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

                ${certifikat.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Behörigheter</h3>
                    ${certifikat.map(cert => `
                    <div class="cert-row">
                        <span class="cert-mark">✓</span>
                        <span>${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}</span>
                    </div>`).join('')}
                </div>` : ''}

                ${allSkills.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Kompetensområden</h3>
                    ${allSkills.slice(0, 12).map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                </div>` : ''}

                ${skolor.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Skolor & lärosäten</h3>
                    ${skolor.map(skola => `<div class="school-item">${skola}</div>`).join('')}
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <div class="sidebar-section">
                    <h3 class="sidebar-heading">Språk</h3>
                    ${cvData.languages.map(lang => `<div class="skill-item">${lang.language} — ${lang.proficiency}</div>`).join('')}
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
                    <h2 class="section-heading">Pedagogisk erfarenhet</h2>
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

export const pedagogTemplate: CVTemplateGenerator = {
  templateId: 'pedagog',
  generate: generatePedagogHTML,
  metadata: {
    name: 'Pedagog',
    description: 'Premium-mall för lärare och pedagoger med behörigheter och kompetensområden',
    category: 'traditional',
    tier: 'premium'
  }
};
