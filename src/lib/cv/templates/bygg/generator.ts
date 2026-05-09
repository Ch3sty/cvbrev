import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Bygg - gratis CV-mall fOr bygg och hantverk.
 *
 * Designprinciper:
 *  - En kolumn, vansterstalld - robust och tydlig
 *  - "Behorigheter & korkort"-sektion direkt efter sammanfattning
 *  - Auto-genererad lista over unika arbetsplatser/byggprojekt
 *  - "Yrkeserfarenhet" istallet for "Arbetslivserfarenhet"
 *  - Subtil orange-accent (matchar varumarke)
 *  - Calibri / Source Sans body - inte dekorativt
 *  - ATS-saker, inga clip-paths
 */
function generateByggHTML(cvData: CVMetadata, _options: any = {}): string {
  const certifikat = cvData.certifications || [];
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
                font-family: 'Source Sans Pro', 'Calibri', 'Segoe UI', system-ui, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: white;
                font-size: 13.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 28mm 26mm;
            }

            /* === Header === */
            .header {
                margin-bottom: 24px;
                padding-bottom: 18px;
                border-bottom: 3px solid #f97316;
            }

            .header h1 {
                font-size: 30px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.1;
                letter-spacing: -0.015em;
                margin-bottom: 6px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .role {
                font-size: 15px;
                color: #c2410c;
                font-weight: 600;
                margin-bottom: 12px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12.5px;
                color: #475569;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 13.5px;
                color: #1f2937;
                line-height: 1.75;
                margin-bottom: 22px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Behorighets-block === */
            .cert-block {
                background: #fef3e8;
                border: 1px solid #fed7aa;
                border-radius: 4px;
                padding: 14px 18px;
                margin-bottom: 26px;
            }

            .cert-block-heading {
                font-size: 11px;
                font-weight: 700;
                color: #c2410c;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                margin-bottom: 10px;
            }

            .cert-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px 18px;
            }

            .cert-row {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .cert-mark {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                border-radius: 2px;
                background: #f97316;
                color: white;
                font-size: 9px;
                font-weight: 700;
                line-height: 14px;
                text-align: center;
                margin-top: 1px;
            }

            /* === Sektioner === */
            .section {
                margin-bottom: 26px;
            }

            .section:last-child {
                margin-bottom: 0;
            }

            .section-heading {
                font-size: 12px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                margin-bottom: 14px;
                padding-bottom: 6px;
                border-bottom: 2px solid #f97316;
            }

            /* === Arbetsplatser pill-rad === */
            .arbetsplatser-block {
                margin-bottom: 16px;
                padding: 10px 0 14px;
                border-bottom: 1px dashed #e5e7eb;
            }

            .arbetsplatser-label {
                display: inline-block;
                font-size: 11px;
                font-weight: 700;
                color: #c2410c;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                margin-right: 10px;
                margin-bottom: 4px;
            }

            .arbetsplats-pill {
                display: inline-block;
                padding: 2px 9px;
                background: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 10px;
                font-size: 11.5px;
                color: #1f2937;
                margin-right: 5px;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
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
                font-size: 12px;
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
                font-size: 13px;
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
                font-size: 13.5px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .education-year {
                font-size: 12px;
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

            /* === Skills === */
            .skill-group {
                margin-bottom: 8px;
            }

            .skill-group:last-child {
                margin-bottom: 0;
            }

            .skill-group-name {
                font-size: 12px;
                font-weight: 700;
                color: #c2410c;
                margin-right: 8px;
            }

            .skill-list {
                font-size: 13px;
                color: #1f2937;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Languages === */
            .language-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
                font-size: 13px;
            }

            .language-name {
                font-weight: 600;
                color: #1f2937;
            }

            .language-level {
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            ${certifikat.length > 0 ? `
            <div class="cert-block">
                <div class="cert-block-heading">Behörigheter & körkort</div>
                <div class="cert-grid">
                    ${certifikat.map(cert => `
                    <div class="cert-row">
                        <span class="cert-mark">✓</span>
                        <span>${cert.name}${cert.issuer ? ' (' + cert.issuer + ')' : ''}</span>
                    </div>`).join('')}
                </div>
            </div>` : ''}

            ${arbetsplatser.length > 0 ? `
            <div class="arbetsplatser-block">
                <span class="arbetsplatser-label">Arbetsplatser:</span>
                ${arbetsplatser.map(a => `<span class="arbetsplats-pill">${a}</span>`).join('')}
            </div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Yrkeserfarenhet</h2>
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

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                ${cvData.skills.map(group => `
                <div class="skill-group">
                    ${group.category ? `<span class="skill-group-name">${group.category}:</span>` : ''}
                    <span class="skill-list">${group.skills.join(', ')}</span>
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

export const byggTemplate: CVTemplateGenerator = {
  templateId: 'bygg',
  generate: generateByggHTML,
  metadata: {
    name: 'Bygg',
    description: 'Gratis CV-mall för bygg och hantverk med behörighets-sektion och certifikat',
    category: 'traditional',
    tier: 'free'
  }
};
