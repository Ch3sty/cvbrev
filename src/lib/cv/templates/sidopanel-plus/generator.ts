import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Sidopanel Plus - premium-uppgradering av Sidopanel.
 *
 * Skillnader:
 *  - Foto i sidopanel (cirkulärt 110px, orange-magenta gradient-ring)
 *  - LinkedIn-rad i sidopanel
 *  - "Profilrubrik"-blockquote i body (matchar "cv profil exempel")
 *  - Orange + magenta accent-mix istället för bara orange
 *  - Större sektions-rubriker i serif (Fraunces)
 */
function generateSidopanelPlusHTML(cvData: CVMetadata, options: any = {}): string {
  const hasPhoto = !!cvData.personalInfo.profilePhotoUrl;
  const includePhoto = options.includePhoto !== false && hasPhoto;
  const linkedInUrl = (cvData.personalInfo as any).linkedIn || (cvData.personalInfo as any).linkedin;
  const includeLinkedIn = options.includeLinkedIn !== false && !!linkedInUrl;

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
                font-family: 'Calibri', 'Segoe UI', system-ui, sans-serif;
                line-height: 1.55; color: #1f2937; background: white; font-size: 13.5px;
            }
            .cv-container {
                width: 210mm; min-height: 297mm; margin: 0 auto;
                background: white; display: flex; align-items: stretch;
            }
            /* Sidopanel - bredare for foto */
            .sidebar {
                flex: 0 0 215px;
                background: linear-gradient(180deg, #fff7ed 0%, #fdf2f8 100%);
                padding: 30px 22px;
                border-right: 1px solid #fed7aa;
            }
            .photo-wrap {
                width: 110px; height: 110px;
                margin: 0 auto 20px;
                border-radius: 50%;
                padding: 3px;
                background: linear-gradient(135deg, #f97316 0%, #db2777 100%);
            }
            .photo-wrap-inner { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: white; }
            .photo-wrap-inner img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .photo-placeholder {
                width: 110px; height: 110px;
                margin: 0 auto 20px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316 0%, #db2777 100%);
                display: flex; align-items: center; justify-content: center;
                font-family: 'Fraunces', Georgia, serif;
                font-size: 44px; font-weight: 700; color: white;
            }
            .sidebar-section { margin-bottom: 26px; }
            .sidebar-section:last-child { margin-bottom: 0; }
            .sidebar-heading {
                font-family: 'Fraunces', Georgia, serif;
                font-size: 13px; font-weight: 700; color: #9a3412;
                text-transform: none; letter-spacing: 0.01em;
                margin-bottom: 11px; padding-bottom: 5px;
                border-bottom: 1.5px solid #f97316;
            }
            .contact-row {
                display: flex; align-items: flex-start; gap: 8px;
                margin-bottom: 8px; font-size: 12px; color: #374151; line-height: 1.4;
            }
            .contact-row:last-child { margin-bottom: 0; }
            .contact-icon { flex-shrink: 0; width: 13px; height: 13px; color: #db2777; margin-top: 2px; }
            .contact-text { flex: 1; min-width: 0; overflow-wrap: break-word; word-wrap: break-word; }
            .contact-text a { color: #9a3412; font-weight: 600; }
            .skill-list { list-style: none; padding: 0; margin: 0; }
            .skill-list li {
                position: relative; padding-left: 14px; margin-bottom: 5px;
                font-size: 12px; color: #374151; line-height: 1.45;
            }
            .skill-list li::before {
                content: ''; position: absolute; left: 0; top: 7px;
                width: 5px; height: 5px; border-radius: 50%;
                background: linear-gradient(135deg, #f97316 0%, #db2777 100%);
            }
            .language-row {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 8px; margin-bottom: 5px; font-size: 12px;
            }
            .language-name { color: #1f2937; font-weight: 600; }
            .language-level { color: #92400e; font-size: 11px; }
            /* Huvudinnehall */
            .main { flex: 1; min-width: 0; padding: 38px 36px; }
            .name-block { margin-bottom: 22px; padding-bottom: 16px; }
            .name-block h1 {
                font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
                font-size: 34px; font-weight: 700; color: #111827;
                line-height: 1.05; letter-spacing: -0.015em; margin-bottom: 5px;
            }
            .name-block .role {
                font-size: 15px;
                background: linear-gradient(90deg, #f97316 0%, #db2777 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700; letter-spacing: 0.01em;
            }
            .accent-bar {
                height: 3px; width: 60px;
                background: linear-gradient(90deg, #f97316 0%, #db2777 100%);
                margin-top: 12px;
            }
            /* Profilrubrik som blockquote */
            .profile-block {
                margin: 18px 0 26px;
                padding: 14px 18px;
                background: #fff7ed;
                border-left: 3px solid #f97316;
                font-size: 13.5px; line-height: 1.65; color: #374151;
                font-style: italic;
                border-radius: 0 6px 6px 0;
            }
            .profile-label {
                font-family: 'Fraunces', Georgia, serif;
                font-size: 11px; font-weight: 700; color: #9a3412;
                text-transform: uppercase; letter-spacing: 0.16em;
                margin-bottom: 6px; font-style: normal;
                display: block;
            }
            .section { margin-bottom: 24px; }
            .section:last-child { margin-bottom: 0; }
            .section-heading {
                font-family: 'Fraunces', Georgia, serif;
                font-size: 16px; font-weight: 700; color: #111827;
                margin-bottom: 12px; padding-bottom: 5px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }
            .section-heading::after {
                content: ''; position: absolute; bottom: -1px; left: 0;
                width: 42px; height: 2px;
                background: linear-gradient(90deg, #f97316 0%, #db2777 100%);
            }
            .experience-item { margin-bottom: 16px; }
            .experience-item:last-child { margin-bottom: 0; }
            .job-row {
                display: flex; justify-content: space-between; align-items: baseline;
                gap: 12px; margin-bottom: 2px; flex-wrap: wrap;
            }
            .job-title {
                font-size: 14px; font-weight: 700; color: #111827;
                flex: 1; min-width: 0;
            }
            .job-period {
                font-size: 11.5px; color: #6b7280; font-weight: 500; flex-shrink: 0;
            }
            .company {
                font-size: 13px;
                background: linear-gradient(90deg, #f97316 0%, #db2777 100%);
                -webkit-background-clip: text; background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700; margin-bottom: 5px;
            }
            .description-list { list-style: none; padding: 0; margin: 0; }
            .description-list li {
                position: relative; padding-left: 14px;
                font-size: 13px; color: #374151; line-height: 1.55; margin-bottom: 3px;
            }
            .description-list li::before {
                content: ''; position: absolute; left: 3px; top: 8px;
                width: 4px; height: 4px; border-radius: 50%;
                background: linear-gradient(135deg, #f97316 0%, #db2777 100%);
            }
            .education-item { margin-bottom: 12px; }
            .education-item:last-child { margin-bottom: 0; }
            .degree { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px; }
            .institution { font-size: 12.5px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <aside class="sidebar">
                ${includePhoto ? `
                <div class="photo-wrap"><div class="photo-wrap-inner"><img src="${cvData.personalInfo.profilePhotoUrl}" alt="${cvData.personalInfo.fullName}" /></div></div>
                ` : `
                <div class="photo-placeholder">${(cvData.personalInfo.fullName || '?').trim().charAt(0).toUpperCase()}</div>
                `}

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
                    ${includeLinkedIn ? `
                    <div class="contact-row">
                        <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span class="contact-text"><a href="${linkedInUrl}">LinkedIn</a></span>
                    </div>` : ''}
                </div>

                ${cvData.skills.length > 0 ? `
                <div class="sidebar-section">
                    <div class="sidebar-heading">Kompetenser</div>
                    <ul class="skill-list">
                        ${cvData.skills.flatMap(g => g.skills.map(s => `<li>${s}</li>`)).join('')}
                    </ul>
                </div>` : ''}

                ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
                <div class="sidebar-section">
                    <div class="sidebar-heading">Språk</div>
                    ${cvData.languages.map(l => `
                    <div class="language-row">
                        <span class="language-name">${l.language}</span>
                        <span class="language-level">${l.proficiency}</span>
                    </div>`).join('')}
                </div>` : ''}
            </aside>

            <main class="main">
                <div class="name-block">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                    <div class="accent-bar"></div>
                </div>

                ${cvData.summary ? `
                <div class="profile-block">
                    <span class="profile-label">Personlig profil</span>
                    ${cvData.summary}
                </div>` : ''}

                ${cvData.experience.length > 0 ? `
                <div class="section">
                    <h2 class="section-heading">Arbetslivserfarenhet</h2>
                    ${cvData.experience.map(exp => `
                    <div class="experience-item">
                        <div class="job-row">
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
                        <div class="degree">${edu.degree}</div>
                        <div class="institution">${edu.institution}${edu.graduationYear ? ' • ' + edu.graduationYear : (edu.startDate ? ' • ' + edu.startDate : '')}${edu.endDate ? ' – ' + edu.endDate : ''}</div>
                    </div>`).join('')}
                </div>` : ''}
            </main>
        </div>
    </body>
    </html>
  `;
}

export const sidopanelPlusTemplate: CVTemplateGenerator = {
  templateId: 'sidopanel-plus' as any,
  generate: generateSidopanelPlusHTML,
  metadata: {
    name: 'Sidopanel Plus',
    description: 'Premium-uppgradering av Sidopanel med foto, profilblock och orange-magenta accent',
    category: 'modern',
    tier: 'premium'
  }
};
