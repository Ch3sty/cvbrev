import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

/**
 * Student - gratis CV-mall fOr studenter och nyexaminerade.
 *
 * Designprinciper:
 *  - Sektion-ordning anpassad: Utbildning → Projekt → Praktik → Kompetenser
 *  - "Praktik & Sommarjobb" istallet for "Arbetslivserfarenhet"
 *  - Egen sektion fOr Engagemang (kar, ideellt)
 *  - Cyan accentfarg (#0891b2) - utbildningsfarg, inte corporate
 *  - Liten textstorlek sa lite content inte ser glest ut
 *  - One-column layout, ATS-saker
 */
function generateStudentStartupHTML(cvData: CVMetadata, _options: any = {}): string {
  // Anvand projects om det finns
  const hasProjects = cvData.projects && cvData.projects.length > 0;

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
                font-family: 'Inter', 'Calibri', 'Segoe UI', system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background: white;
                font-size: 12.5px;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 30mm 26mm;
            }

            /* === Header === */
            .student-header {
                margin-bottom: 22px;
                padding-bottom: 16px;
                border-bottom: 2px solid #0891b2;
            }

            .student-header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.15;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .student-header .role {
                font-size: 14px;
                color: #0891b2;
                font-weight: 600;
                margin-bottom: 8px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-line {
                font-size: 12px;
                color: #475569;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .meta-separator {
                margin: 0 8px;
                color: #cbd5e1;
            }

            /* === Sammanfattning === */
            .summary-block {
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.7;
                margin-bottom: 24px;
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
                font-size: 11px;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.16em;
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
                background: #0891b2;
            }

            /* === Education items - mer prominent for studenter === */
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
                gap: 12px;
                margin-bottom: 2px;
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
                color: #0891b2;
                font-weight: 600;
                flex-shrink: 0;
            }

            .institution {
                font-size: 12.5px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 4px;
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
                font-size: 12px;
                color: #1f2937;
                line-height: 1.55;
                margin-bottom: 2px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .description-list li::before {
                content: '';
                position: absolute;
                left: 2px;
                top: 7px;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #0891b2;
            }

            /* === Project items === */
            .project-item {
                margin-bottom: 14px;
            }

            .project-item:last-child {
                margin-bottom: 0;
            }

            .project-header {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 12px;
                margin-bottom: 4px;
                flex-wrap: wrap;
            }

            .project-name {
                font-size: 13px;
                font-weight: 700;
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .project-period {
                font-size: 11.5px;
                color: #0891b2;
                font-weight: 500;
                flex-shrink: 0;
            }

            .project-description {
                font-size: 12px;
                color: #374151;
                line-height: 1.55;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .project-tech {
                display: inline-block;
                font-size: 10.5px;
                color: #0e7490;
                background: #ecfeff;
                border: 1px solid #cffafe;
                padding: 2px 7px;
                border-radius: 3px;
                margin-right: 4px;
                margin-top: 2px;
            }

            /* === Experience items (Praktik & Sommarjobb) === */
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
                color: #0f172a;
                flex: 1;
                min-width: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .job-period {
                font-size: 11.5px;
                color: #0891b2;
                font-weight: 500;
                flex-shrink: 0;
            }

            .company {
                font-size: 12.5px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 4px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            /* === Skills row (kommaseparerade) === */
            .skills-text {
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.75;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .skill-pill {
                display: inline-block;
                font-size: 12px;
                color: #0e7490;
                background: #ecfeff;
                border: 1px solid #cffafe;
                padding: 3px 9px;
                border-radius: 3px;
                margin-right: 5px;
                margin-bottom: 4px;
            }

            /* === Languages === */
            .languages-text {
                font-size: 12.5px;
                color: #1f2937;
                line-height: 1.7;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .language-entry {
                display: inline-block;
                margin-right: 14px;
            }

            .language-name {
                font-weight: 600;
            }

            .language-level {
                color: #475569;
            }

            .references {
                margin-top: 24px;
                padding-top: 12px;
                border-top: 1px solid #e5e7eb;
                font-size: 11px;
                color: #94a3b8;
                font-style: italic;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- === Header === -->
            <header class="student-header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.personalInfo.title ? `<div class="role">${cvData.personalInfo.title}</div>` : ''}
                <div class="meta-line">
                    ${cvData.personalInfo.email || ''}
                    ${cvData.personalInfo.phone ? `<span class="meta-separator">·</span>${cvData.personalInfo.phone}` : ''}
                    ${cvData.personalInfo.address ? `<span class="meta-separator">·</span>${formatSwedishAddress(cvData.personalInfo.address)}` : ''}
                </div>
            </header>

            <!-- === Sammanfattning === -->
            ${cvData.summary ? `
            <div class="summary-block">${cvData.summary}</div>` : ''}

            <!-- === Utbildning (forst for studenter) === -->
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
                        <div class="education-year">${edu.graduationYear || edu.startDate || ''}${edu.endDate ? ' – ' + edu.endDate : (edu.startDate && !edu.graduationYear ? ' – Pågående' : '')}</div>
                    </div>
                    <div class="institution">${edu.institution}${edu.gpa ? ' · GPA: ' + edu.gpa : ''}</div>
                    ${edu.relevantCourses && edu.relevantCourses.length > 0 ? `
                    <ul class="description-list">
                        <li>Relevanta kurser: ${edu.relevantCourses.join(', ')}</li>
                    </ul>` : ''}
                    ${edu.description ? `
                    <ul class="description-list">
                        <li>${edu.description}</li>
                    </ul>` : ''}
                </div>`).join('')}
            </div>` : ''}

            <!-- === Projekt === -->
            ${hasProjects ? `
            <div class="section">
                <h2 class="section-heading">Projekt</h2>
                ${cvData.projects!.map(project => `
                <div class="project-item">
                    <div class="project-header">
                        <div class="project-name">${project.name || project.title || ''}</div>
                        ${project.startDate || project.endDate ? `<div class="project-period">${project.startDate || ''}${project.endDate ? ' – ' + project.endDate : ''}</div>` : ''}
                    </div>
                    ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                    ${project.technologies && project.technologies.length > 0 ? `
                    <div>${project.technologies.map(tech => `<span class="project-tech">${tech}</span>`).join('')}</div>` : ''}
                </div>`).join('')}
            </div>` : ''}

            <!-- === Praktik & Sommarjobb === -->
            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Praktik &amp; Arbetslivserfarenhet</h2>
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

            <!-- === Kompetenser === -->
            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Kompetenser</h2>
                <div class="skills-text">
                    ${cvData.skills.flatMap(group =>
                        group.skills
                            .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                            .map(skill => `<span class="skill-pill">${skill}</span>`)
                    ).join('')}
                </div>
            </div>` : ''}

            <!-- === Sprak === -->
            ${shouldShowSection('languages', cvData) && cvData.languages && cvData.languages.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Språk</h2>
                <div class="languages-text">
                    ${cvData.languages.map(lang => `
                    <span class="language-entry"><span class="language-name">${lang.language}</span> <span class="language-level">— ${lang.proficiency}</span></span>`).join('')}
                </div>
            </div>` : ''}

            <!-- === Certifieringar (om finns) === -->
            ${cvData.certifications && cvData.certifications.length > 0 ? `
            <div class="section">
                <h2 class="section-heading">Certifieringar</h2>
                <div class="languages-text">
                    ${cvData.certifications.map(cert => {
                        if (typeof cert === 'string') return `<span class="language-entry">${cert}</span>`;
                        const year = cert.issueDate || cert.date || '';
                        return `<span class="language-entry"><span class="language-name">${cert.name}</span>${year ? ` <span class="language-level">— ${year}</span>` : ''}</span>`;
                    }).join('')}
                </div>
            </div>` : ''}

            <!-- Referenser -->
            <div class="references">Referenser lämnas på begäran</div>
        </div>
    </body>
    </html>
  `;
}

export const studentStartupTemplate: CVTemplateGenerator = {
  templateId: 'student-startup',
  generate: generateStudentStartupHTML,
  metadata: {
    name: 'Student',
    description: 'För studenter och nyexaminerade — utbildning först, projekt och praktik',
    category: 'modern',
    tier: 'free'
  }
};
