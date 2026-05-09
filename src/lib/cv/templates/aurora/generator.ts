import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Aurora - premium tva-kolumns CV-mall for saljare, affarsutveckling
 * och finans-roller. Resultat-forsta stil.
 *
 * Designprinciper:
 *  - Subtil emerald -> orange gradient-band ovanfor header (sajt-DNA)
 *  - 65/35 layout: erfarenhet vanster, "key results" hoger
 *  - "PROFESSIONAL SUMMARY"-eyebrow ovanfor sammanfattning
 *  - Source Sans / Calibri body
 *  - Foto + LinkedIn stod
 *  - ATS-saker: inga clip-paths, inga absolute positions for text
 */
function generateAuroraHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Extrahera achievements / siffror fran experience for "Key Results"-panelen.
  // Vi tar de tva forsta jobb-bullets och packar in dem.
  const keyResults: string[] = [];
  cvData.experience.slice(0, 2).forEach(exp => {
    if (exp.description && exp.description.length > 0) {
      // Prioritera bullets som innehaller siffror
      const sortedDesc = [...exp.description].sort((a, b) => {
        const hasNumA = /\d/.test(a);
        const hasNumB = /\d/.test(b);
        if (hasNumA && !hasNumB) return -1;
        if (!hasNumA && hasNumB) return 1;
        return 0;
      });
      sortedDesc.slice(0, 2).forEach(desc => {
        if (keyResults.length < 4 && desc.length < 200) keyResults.push(desc);
      });
    }
  });

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
                line-height: 1.55;
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

            /* === Topp-band: subtil gradient === */
            .top-band {
                height: 8px;
                background: linear-gradient(90deg, #10b981 0%, #f97316 100%);
            }

            /* === Header === */
            .header {
                padding: 30px 32px 22px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 22px;
            }

            .photo-wrap {
                flex-shrink: 0;
                width: 78px;
                height: 78px;
                border-radius: 50%;
                overflow: hidden;
                background: #f1f5f9;
                border: 2px solid #fff;
                box-shadow: 0 0 0 1px #e2e8f0;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .header-text {
                flex: 1;
                min-width: 0;
            }

            .header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.1;
                letter-spacing: -0.015em;
                margin-bottom: 5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 14.5px;
                color: #047857;
                font-weight: 600;
                margin-bottom: 10px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12px;
                color: #64748b;
                line-height: 1.65;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 7px;
                color: #cbd5e1;
            }

            .linkedin-link {
                color: #047857;
                font-weight: 500;
                text-decoration: none;
            }

            /* === Body grid === */
            .body-grid {
                display: grid;
                grid-template-columns: 1fr 240px;
                gap: 28px;
                padding: 26px 32px 30px;
                align-items: start;
            }

            .main-col {
                min-width: 0;
            }

            .side-col {
                min-width: 0;
            }

            /* === Eyebrow + Summary === */
            .eyebrow {
                font-size: 10.5px;
                font-weight: 700;
                color: #047857;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 6px;
            }

            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.7;
                margin-bottom: 26px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 24px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 11.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 2px solid #f97316;
            }

            /* === Experience === */
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
                gap: 12px;
                margin-bottom: 3px;
                flex-wrap: wrap;
            }

            .job-title {
                font-size: 14px;
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
                font-size: 12.5px;
                color: #047857;
                font-weight: 600;
                margin-bottom: 7px;
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
                background: #f97316;
                transform: rotate(45deg);
            }

            /* === Side panel: Key Results card === */
            .results-card {
                background: #fefce8;
                border: 1px solid #fde68a;
                border-radius: 6px;
                padding: 16px 18px;
                margin-bottom: 22px;
            }

            .results-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: #b45309;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 10px;
            }

            .results-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .results-list li {
                position: relative;
                padding-left: 16px;
                font-size: 12px;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .results-list li:last-child {
                margin-bottom: 0;
            }

            .results-list li::before {
                content: '→';
                position: absolute;
                left: 0;
                color: #f97316;
                font-weight: 700;
            }

            /* === Side panel: Skills === */
            .side-section {
                margin-bottom: 22px;
            }

            .side-section:last-child {
                margin-bottom: 0;
            }

            .side-heading {
                font-size: 10.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #e5e7eb;
            }

            .skill-group {
                margin-bottom: 10px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 11px;
                font-weight: 700;
                color: #047857;
                margin-bottom: 4px;
            }

            .skill-list {
                font-size: 12px;
                color: #1f2937;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Education === */
            .education-item {
                margin-bottom: 12px;
            }

            .education-item:last-child {
                margin-bottom: 0;
            }

            .degree {
                font-size: 12.5px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.35;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .institution {
                font-size: 11.5px;
                color: #475569;
                margin-top: 1px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 11px;
                color: #64748b;
                margin-top: 2px;
                font-variant-numeric: tabular-nums;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 12px;
                gap: 8px;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                font-weight: 600;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
                font-size: 11px;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Topp-band -->
            <div class="top-band"></div>

            <!-- Header -->
            <header class="header">
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                </div>` : ''}
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
            </header>

            <!-- Body grid -->
            <div class="body-grid">
                <!-- Vanster: huvudinnehall -->
                <div class="main-col">
                    ${cvData.summary ? `
                    <div class="eyebrow">Professionell sammanfattning</div>
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
                            <div class="degree">${edu.degree}</div>
                            <div class="institution">${edu.institution}</div>
                            <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                        </div>`).join('')}
                    </div>` : ''}
                </div>

                <!-- Hoger: side-panel -->
                <div class="side-col">
                    ${keyResults.length > 0 ? `
                    <div class="results-card">
                        <div class="results-heading">Nyckelresultat</div>
                        <ul class="results-list">
                            ${keyResults.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>` : ''}

                    ${cvData.skills.length > 0 ? `
                    <div class="side-section">
                        <h3 class="side-heading">Kompetenser</h3>
                        ${cvData.skills.map(group => `
                        <div class="skill-group">
                            ${group.category ? `<div class="skill-group-name">${group.category}</div>` : ''}
                            <div class="skill-list">${group.skills.join(', ')}</div>
                        </div>`).join('')}
                    </div>` : ''}

                    ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                    <div class="side-section">
                        <h3 class="side-heading">Språk</h3>
                        ${cvData.languages.map(lang => `
                        <div class="language-row">
                            <span class="language-name">${lang.language}</span>
                            <span class="language-level">${lang.proficiency}</span>
                        </div>`).join('')}
                    </div>` : ''}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const auroraTemplate: CVTemplateGenerator = {
  templateId: 'aurora',
  generate: generateAuroraHTML,
  metadata: {
    name: 'Aurora',
    description: 'Resultat-första premium-mall för säljare, affärsutveckling och finans',
    category: 'modern',
    tier: 'premium'
  }
};
