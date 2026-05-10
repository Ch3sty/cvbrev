import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Hantverkare Plus - premium-uppgradering av Hantverkare (bygg).
 *
 * Skillnader frán bygg/Hantverkare:
 *  - Foto-stOd (for kund-frontline-roller som arbetsledare, egenforetagare)
 *  - Storre typografisk skala
 *  - Dubbel-accent (orange + grafit) i stallet for bara orange
 *  - "Projektportfolj"-sektion mer prominent
 *  - LinkedIn for byggchef-roller
 */
function generateHantverkarePlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Source Sans Pro', 'Calibri', 'Segoe UI', sans-serif;
                line-height: 1.6; color: #1f2937; background: white; font-size: 13px;
            }
            .cv-container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; padding: 26mm 24mm; }
            /* Header med foto */
            .header {
                display: flex; gap: 22px; align-items: center;
                margin-bottom: 18px; padding-bottom: 16px;
                border-bottom: 4px solid #f97316;
                position: relative;
            }
            .header::after {
                content: ''; position: absolute; bottom: -4px; left: 0; right: 30%;
                height: 4px; background: #374151;
            }
            .photo-wrap {
                flex-shrink: 0; width: 90px; height: 90px;
                overflow: hidden; border: 3px solid #f97316;
                border-radius: 4px;
            }
            .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                flex-shrink: 0; width: 90px; height: 90px; border-radius: 4px;
                border: 3px solid #f97316; background: #fff7ed;
                display: flex; align-items: center; justify-content: center;
                font-size: 36px; font-weight: 800; color: #c2410c;
            }
            .header-text { flex: 1; min-width: 0; }
            .header-text h1 {
                font-size: 32px; font-weight: 800; color: #0f172a;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 4px;
            }
            .header-text .role { font-size: 15px; color: #c2410c; font-weight: 700; margin-bottom: 8px; }
            .header-meta { font-size: 12px; color: #475569; line-height: 1.65; }
            .header-meta a { color: #c2410c; font-weight: 600; }
            .meta-separator { margin: 0 7px; color: #cbd5e1; }
            .summary-block { font-size: 13px; line-height: 1.7; margin-bottom: 18px; }
            /* Cert-block */
            .cert-block {
                margin-bottom: 18px; padding: 12px 16px;
                background: #fef3e8; border: 1px solid #fed7aa; border-radius: 4px;
            }
            .cert-label {
                font-size: 11px; font-weight: 800; color: #c2410c;
                text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;
            }
            .cert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 18px; }
            .cert-row {
                font-size: 12px; color: #1f2937; padding-left: 16px; position: relative; line-height: 1.5;
            }
            .cert-row::before {
                content: ''; position: absolute; left: 0; top: 5px;
                width: 11px; height: 9px; background: #f97316; border-radius: 1.5px;
            }
            /* Arbetsplatser pill-rad */
            .arbetsplats-block {
                margin-bottom: 18px; padding: 8px 0; border-bottom: 1px dashed #e5e7eb;
            }
            .arbetsplats-label {
                display: inline-block; font-size: 11px; font-weight: 800;
                color: #374151; text-transform: uppercase; letter-spacing: 0.14em;
                margin-right: 10px; margin-bottom: 4px;
            }
            .arbetsplats-pill {
                display: inline-block; padding: 2px 9px; margin: 0 3px 3px 0;
                background: #f9fafb; border: 1px solid #d1d5db; border-radius: 10px;
                font-size: 11px; color: #374151; font-weight: 500;
            }
            .section { margin-bottom: 22px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-size: 12px; font-weight: 800; color: #0f172a;
                text-transform: uppercase; letter-spacing: 0.16em;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 2px solid #f97316;
            }
            .experience-item { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
            .experience-item:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .experience-header {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 3px; flex-wrap: wrap;
            }
            .job-title { font-size: 14.5px; font-weight: 800; color: #0f172a; flex: 1; min-width: 0; }
            .job-period { font-size: 12px; color: #64748b; font-weight: 500; flex-shrink: 0; }
            .company { font-size: 13px; color: #c2410c; font-weight: 700; margin-bottom: 7px; }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 16px; font-size: 12.5px;
                color: #1f2937; line-height: 1.6; margin-bottom: 4px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 2px; top: 8px;
                width: 6px; height: 6px; background: #f97316;
            }
            .education-item { margin-bottom: 12px; }
            .education-header { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
            .degree { font-size: 13.5px; font-weight: 700; color: #0f172a; flex: 1; min-width: 0; }
            .education-year { font-size: 12px; color: #64748b; flex-shrink: 0; }
            .institution { font-size: 12.5px; color: #475569; margin-top: 2px; }
            .skill-group { margin-bottom: 8px; }
            .skill-group-name { font-size: 12px; font-weight: 700; color: #c2410c; margin-right: 6px; }
            .skill-list { font-size: 13px; color: #1f2937; }
            .lang-row { display: flex; gap: 8px; margin-bottom: 4px; font-size: 13px; }
            .lang-name { font-weight: 700; color: #0f172a; }
            .lang-level { color: #475569; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <header class="header">
                ${includePhoto ? `
                <div class="photo-wrap"><img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" /></div>
                ` : `
                <div class="photo-placeholder">${(cvData.personalInfo.fullName || '?').trim().charAt(0).toUpperCase()}</div>
                `}
                <div class="header-text">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="header-meta">
                        ${cvData.personalInfo.email || ''}
                        ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                        ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                        ${includeLinkedIn ? `<span class="meta-separator">·</span><a href="${linkedInUrl}">LinkedIn</a>` : ''}
                    </div>
                </div>
            </header>

            ${cvData.summary ? `<div class="summary-block">${cvData.summary}</div>` : ''}

            ${certifikat.length > 0 ? `
            <div class="cert-block">
                <div class="cert-label">Behörigheter & körkort</div>
                <div class="cert-grid">
                    ${certifikat.map(c => `<div class="cert-row">${c.name}</div>`).join('')}
                </div>
            </div>` : ''}

            ${arbetsplatser.length > 0 ? `
            <div class="arbetsplats-block">
                <span class="arbetsplats-label">Projekt & arbetsplatser:</span>
                ${arbetsplatser.map(a => `<span class="arbetsplats-pill">${a}</span>`).join('')}
            </div>` : ''}

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Yrkeserfarenhet</h2>
                ${cvData.experience.map(exp => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div class="job-title">${exp.position}</div>
                        <div class="job-period">${exp.startDate || ''}${exp.endDate ? ' – ' + exp.endDate : (exp.startDate ? ' – Pågående' : '')}</div>
                    </div>
                    <div class="company">${exp.company}</div>
                    ${exp.description && exp.description.length > 0 ? `
                    <ul class="description-list">
                        ${exp.description.map(d => `<li>${d}</li>`).join('')}
                    </ul>` : ''}
                </div>`).join('')}
            </div>` : ''}

            ${cvData.education.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Utbildning</h2>
                ${cvData.education.map(edu => `
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
                ${cvData.skills.map(g => `
                <div class="skill-group">
                    ${g.category ? `<span class="skill-group-name">${g.category}:</span>` : ''}
                    <span class="skill-list">${g.skills.join(', ')}</span>
                </div>`).join('')}
            </div>` : ''}

            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                ${cvData.languages.map(l => `
                <div class="lang-row">
                    <span class="lang-name">${l.language}</span>
                    <span class="lang-level">— ${l.proficiency}</span>
                </div>`).join('')}
            </div>` : ''}
        </div>
    </body>
    </html>
  `;
}

export const hantverkarePlusTemplate: CVTemplateGenerator = {
  templateId: 'hantverkare-plus' as any,
  generate: generateHantverkarePlusHTML,
  metadata: {
    name: 'Hantverkare Plus',
    description: 'Premium-uppgradering av Hantverkare med foto, dubbel-accent och projektportfölj',
    category: 'traditional',
    tier: 'premium'
  }
};
