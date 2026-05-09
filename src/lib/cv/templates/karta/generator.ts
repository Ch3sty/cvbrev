import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Karta - premium CV-mall med infografik-element.
 *
 * Designprinciper:
 *  - Header med namn vanster + geometriskt monster hoger
 *  - Erfarenhet renderad som timeline (vertikal linje + cirklar pa datum)
 *  - Kompetenser renderade som 5-pricks-staplar
 *  - Cyan/teal accent (#0891b2) - datavisualiserings-DNA
 *  - Foto-stOd + LinkedIn
 *  - ATS-saker (allt CSS, inga clip-paths)
 */
function generateKartaHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Sortera experience kronologiskt (nyast forst)
  const sortedExp = [...cvData.experience].sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  // Forsta gruppen av skills som "kompetensstaplar" (max 6)
  const skillStapels = (cvData.skills[0]?.skills || []).slice(0, 6);

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
                padding: 30mm 28mm;
            }

            /* Header med geometriskt monster */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                margin-bottom: 28px;
                padding-bottom: 22px;
                border-bottom: 2px solid #0891b2;
            }

            .header-text {
                flex: 1;
                min-width: 0;
            }

            .header h1 {
                font-size: 32px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.05;
                letter-spacing: -0.02em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 13px;
                color: #0891b2;
                font-weight: 500;
                margin-bottom: 12px;
                letter-spacing: 0.02em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12px;
                color: #475569;
                line-height: 1.65;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            .linkedin-link {
                color: #0891b2;
                font-weight: 500;
                text-decoration: none;
            }

            /* Geometriskt monster (3 staplade rektanglar med olika opacity) */
            .geo-pattern {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex-shrink: 0;
            }

            .geo-bar {
                height: 14px;
                background: #0891b2;
            }

            .geo-bar.bar-1 { width: 80px; opacity: 1; }
            .geo-bar.bar-2 { width: 64px; opacity: 0.6; }
            .geo-bar.bar-3 { width: 48px; opacity: 0.3; }

            /* Foto (om finns) - rektangulart */
            .photo-wrap {
                width: 80px;
                height: 100px;
                overflow: hidden;
                background: #f1f5f9;
                border: 2px solid #0891b2;
                flex-shrink: 0;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            .summary-block {
                font-size: 13px;
                color: #1f2937;
                line-height: 1.75;
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
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 11.5px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 18px;
                line-height: 1;
            }

            .section-heading::before {
                content: '';
                width: 14px;
                height: 14px;
                background: #0891b2;
                flex-shrink: 0;
            }

            .section-heading::after {
                content: '';
                flex: 1;
                height: 1px;
                background: #e5e7eb;
            }

            /* Timeline */
            .timeline {
                position: relative;
                padding-left: 24px;
            }

            .timeline::before {
                content: '';
                position: absolute;
                left: 6px;
                top: 4px;
                bottom: 4px;
                width: 2px;
                background: #0891b2;
            }

            .timeline-item {
                position: relative;
                margin-bottom: 22px;
            }

            .timeline-item:last-child {
                margin-bottom: 0;
            }

            .timeline-item::before {
                content: '';
                position: absolute;
                left: -23px;
                top: 4px;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: white;
                border: 3px solid #0891b2;
            }

            .timeline-item.current::before {
                background: #0891b2;
            }

            .timeline-header {
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
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 11.5px;
                color: #0891b2;
                font-weight: 600;
                font-variant-numeric: tabular-nums;
                letter-spacing: 0.02em;
                flex-shrink: 0;
            }

            .company {
                font-size: 13px;
                color: #475569;
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
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.6;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '▸';
                position: absolute;
                left: 0;
                top: 0;
                color: #0891b2;
                font-size: 10px;
            }

            /* Kompetensstaplar */
            .skill-bars {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px 24px;
            }

            .skill-bar-row {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12.5px;
            }

            .skill-bar-name {
                flex: 1;
                font-weight: 600;
                color: #1f2937;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-bar-dots {
                display: flex;
                gap: 3px;
                flex-shrink: 0;
            }

            .skill-dot {
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #0891b2;
            }

            .skill-dot.empty {
                background: #e0f2fe;
            }

            /* Education + skills resterande */
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
                font-family: 'Source Code Pro', 'Consolas', monospace;
                font-size: 11.5px;
                color: #0891b2;
                font-weight: 600;
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

            .skill-group-extra {
                margin-bottom: 8px;
            }

            .skill-group-name-extra {
                font-size: 11.5px;
                font-weight: 700;
                color: #0891b2;
                margin-right: 8px;
            }

            .skill-list-extra {
                font-size: 12.5px;
                color: #1f2937;
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
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
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
                ${includePhoto ? `
                <div class="photo-wrap">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" />
                </div>` : `
                <div class="geo-pattern" aria-hidden="true">
                    <div class="geo-bar bar-1"></div>
                    <div class="geo-bar bar-2"></div>
                    <div class="geo-bar bar-3"></div>
                </div>`}
            </header>

            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            ${sortedExp.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Erfarenhet</h2>
                <div class="timeline">
                    ${sortedExp.map((exp, idx) => `
                    <div class="timeline-item ${idx === 0 && !exp.endDate ? 'current' : ''}">
                        <div class="timeline-header">
                            <div class="job-title">${exp.position}</div>
                            <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' — ' + exp.endDate : (exp.startDate ? ' — Nu' : '')}</div>
                        </div>
                        <div class="company">${exp.company}</div>
                        ${exp.description && exp.description.length > 0 ? `
                        <ul class="description-list">
                            ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                        </ul>` : ''}
                    </div>`).join('')}
                </div>
            </div>` : ''}

            ${skillStapels.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetensstaplar</h2>
                <div class="skill-bars">
                    ${skillStapels.map((skill, idx) => {
                        // Pseudo-skala: forsta 4 fyllda dots, sista 5 dots = top
                        const filled = idx < 2 ? 5 : (idx < 4 ? 4 : 3);
                        return `
                        <div class="skill-bar-row">
                            <span class="skill-bar-name">${skill}</span>
                            <span class="skill-bar-dots">
                                ${Array.from({length: 5}).map((_, i) => `<span class="skill-dot ${i < filled ? '' : 'empty'}"></span>`).join('')}
                            </span>
                        </div>`;
                    }).join('')}
                </div>
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
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' — ' + edu.endDate : ''}</div>
                    </div>
                    <div class="institution">${edu.institution}</div>
                </div>`).join('')}
            </div>` : ''}

            ${cvData.skills.length > 1 ? `
            <div class="section">
                <h2 class="section-heading">Övriga kompetenser</h2>
                ${cvData.skills.slice(1).map(group => `
                <div class="skill-group-extra">
                    ${group.category ? `<span class="skill-group-name-extra">${group.category}:</span>` : ''}
                    <span class="skill-list-extra">${group.skills.join(', ')}</span>
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
    </body>
    </html>
  `;
}

export const kartaTemplate: CVTemplateGenerator = {
  templateId: 'karta',
  generate: generateKartaHTML,
  metadata: {
    name: 'Karta',
    description: 'Premium-mall med timeline och kompetensstaplar — för data, BI och konsulter',
    category: 'modern',
    tier: 'premium'
  }
};
