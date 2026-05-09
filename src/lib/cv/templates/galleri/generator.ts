import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Galleri - premium creative CV-mall fOr designers, UX/UI, art directors.
 *
 * Designprinciper:
 *  - Stort namn vanster + rektangulart foto hoger (80x100, INTE cirkel)
 *  - DM Sans body + Fraunces fOr rubriker
 *  - Tre-kolumns "tools-grid" fOr verktyg/kompetenser
 *  - Subtila peach-accent-block (rena rektangler, INGA clip-paths)
 *  - Asymmetrisk layout men ATS-saker
 *  - Foto + LinkedIn stOd
 */
function generateGalleriHTML(cvData: CVMetadata, options: any = {}): string {
  const hasProfilePhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const hasLinkedIn = !!linkedInUrl;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;

  // Plocka ut ALLA skills som en grid (3-kolumns tools-grid)
  const allSkills = cvData.skills.flatMap(group =>
    group.skills.filter(skill =>
      !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase()))
    )
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
                font-family: 'DM Sans', 'Inter', 'Segoe UI', system-ui, sans-serif;
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
                padding: 28mm 26mm;
                position: relative;
            }

            /* Subtilt peach accent-block i Overst hOgra hOrn (ATS-saker - bara visuellt) */
            .accent-block {
                position: absolute;
                top: 0;
                right: 0;
                width: 90px;
                height: 30px;
                background: #fed7aa;
                pointer-events: none;
            }

            /* === Header (asymmetrisk men flexbox) === */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                margin-bottom: 30px;
                padding-bottom: 24px;
                border-bottom: 2px solid #0f172a;
                position: relative;
                z-index: 1;
            }

            .header-text {
                flex: 1;
                min-width: 0;
            }

            .header h1 {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 38px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.0;
                letter-spacing: -0.02em;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 14px;
                color: #c2410c;
                font-weight: 600;
                margin-bottom: 4px;
                letter-spacing: 0.01em;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .tagline {
                font-size: 13px;
                color: #475569;
                font-style: italic;
                margin-bottom: 14px;
                line-height: 1.55;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 11.5px;
                color: #64748b;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            .linkedin-link {
                color: #c2410c;
                font-weight: 500;
                text-decoration: none;
            }

            /* Foto: rektangulart 80x100 */
            .photo-wrap {
                flex-shrink: 0;
                width: 80px;
                height: 100px;
                overflow: hidden;
                background: #f1f5f9;
                position: relative;
            }

            .photo-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 15px;
                color: #1f2937;
                line-height: 1.7;
                margin-bottom: 32px;
                font-weight: 400;
                font-style: italic;
                padding-left: 18px;
                border-left: 3px solid #fed7aa;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Tools grid (3-kolumns kompetenser) === */
            .tools-section {
                margin-bottom: 30px;
            }

            .section-heading {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 18px;
                font-weight: 700;
                color: #0f172a;
                letter-spacing: -0.01em;
                margin-bottom: 16px;
                line-height: 1;
            }

            .tools-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 14px;
                padding: 14px 0;
                border-top: 1px solid #e5e7eb;
                border-bottom: 1px solid #e5e7eb;
            }

            .tool-group {
                min-width: 0;
            }

            .tool-group-name {
                font-size: 10px;
                font-weight: 700;
                color: #c2410c;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 6px;
            }

            .tool-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .tool-list li {
                font-size: 12px;
                color: #1f2937;
                line-height: 1.55;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 28px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            /* === Experience === */
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
                gap: 14px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .job-title {
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
                font-size: 15px;
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
                color: #c2410c;
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
                left: 0;
                top: 9px;
                width: 8px;
                height: 2px;
                background: #c2410c;
            }

            /* === Education === */
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
                font-family: 'Fraunces', 'Playfair Display', 'Georgia', serif;
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

            /* === Languages === */
            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 12.5px;
            }

            .language-row:last-child {
                margin-bottom: 0;
            }

            .language-name {
                font-weight: 700;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <div class="accent-block" aria-hidden="true"></div>

            <!-- Header -->
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
                </div>` : ''}
            </header>

            <!-- Sammanfattning -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- Tools grid (skills som 3-kolumns) -->
            ${cvData.skills.length > 0 ? `
            <div class="tools-section">
                <h2 class="section-heading">Verktyg & kompetenser</h2>
                <div class="tools-grid">
                    ${cvData.skills.slice(0, 3).map(group => `
                    <div class="tool-group">
                        <div class="tool-group-name">${group.category || 'Skills'}</div>
                        <ul class="tool-list">
                            ${group.skills.slice(0, 8).map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                    </div>`).join('')}
                </div>
            </div>` : ''}

            <!-- Arbetslivserfarenhet -->
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

            <!-- Sprak -->
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

export const galleriTemplate: CVTemplateGenerator = {
  templateId: 'galleri',
  generate: generateGalleriHTML,
  metadata: {
    name: 'Galleri',
    description: 'Designermall med rektangulärt foto, tools-grid och peach-accenter',
    category: 'creative',
    tier: 'premium'
  }
};
