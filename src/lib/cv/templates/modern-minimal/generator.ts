import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

function generateModernMinimalHTML(cvData: CVMetadata, options: any = {}): string {
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
                font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'sans-serif';
                line-height: 1.6;
                color: #374151;
                background: white;
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                padding: 30px;
                position: relative;
            }
            
            /* Header Section */
            .header {
                background: #f8fafc;
                padding: 25px 20px;
                margin-bottom: 30px;
                border-radius: 8px;
            }
            
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 8px;
            }
            
            .header .contact {
                color: #64748b;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .header .summary {
                color: #64748b;
                font-size: 14px;
                line-height: 1.6;
                margin-top: 12px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 35px;
            }
            
            .section:not(:last-child) {
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 30px;
            }
            
            .section h2 {
                color: #e11d48;
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 25px;
            }
            
            .experience-item:last-child {
                margin-bottom: 0;
            }
            
            .job-title {
                font-weight: 700;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 4px;
            }
            
            .company-info {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .job-description {
                color: #374151;
                font-size: 14px;
                line-height: 1.6;
                margin: 2px 0;
            }
            
            /* Education Items */
            .education-item {
                margin-bottom: 20px;
            }
            
            .education-item:last-child {
                margin-bottom: 0;
            }
            
            .degree {
                font-weight: 700;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 4px;
            }
            
            .institution {
                color: #64748b;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Skills */
            .skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .skill-tag {
                background: #fdf2f8;
                border: 1px solid #fce7f3;
                color: #be185d;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 500;
            }
            
            /* Languages */
            .languages-container {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .language-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
            }
            
            .language-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 14px;
            }
            
            .language-level {
                background: #e11d48;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }
            
            /* References */
            .references-section {
                border-top: 1px solid #e2e8f0;
                padding-top: 25px;
                margin-top: 40px;
                text-align: center;
            }
            
            .references-section p {
                color: #94a3b8;
                font-size: 13px;
                font-style: italic;
                letter-spacing: 0.3px;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Header -->
            <div class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                <div class="contact">
                    ${cvData.personalInfo.email || ''} ${cvData.personalInfo.phone ? '• ' + cvData.personalInfo.phone : ''}
                    ${cvData.personalInfo.address ? '<br>' + formatSwedishAddress(cvData.personalInfo.address) : ''}
                </div>
                ${cvData.summary ? `<div class="summary">${cvData.summary}</div>` : ''}
            </div>

            ${cvData.experience.length > 0 ? `
            <div class="section">
                <h2>Arbetslivserfarenhet</h2>
                ${cvData.experience
                    .sort((a, b) => {
                        const dateA = a.endDate ? new Date(a.endDate) : new Date(); // Pågående jobb = nuvarande datum
                        const dateB = b.endDate ? new Date(b.endDate) : new Date();
                        return dateB.getTime() - dateA.getTime();
                    })
                    .map(exp => `
                    <div class="experience-item">
                        <div class="job-title">${exp.position}</div>
                        <div class="company-info">
                            ${exp.company}${exp.startDate || exp.endDate ? ' • ' : ''}${exp.startDate ? exp.startDate : ''}${exp.endDate ? ' - ' + exp.endDate : (exp.startDate ? ' - Pågående' : '')}
                        </div>
                        ${exp.description?.map(desc => `<div class="job-description">${desc}</div>`).join('') || ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${cvData.education.length > 0 ? `
            <div class="section">
                <h2>Utbildning</h2>
                ${cvData.education
                    .sort((a, b) => {
                        const dateA = a.endDate ? new Date(a.endDate) : (a.graduationYear ? new Date(a.graduationYear + '-12-31') : new Date());
                        const dateB = b.endDate ? new Date(b.endDate) : (b.graduationYear ? new Date(b.graduationYear + '-12-31') : new Date());
                        return dateB.getTime() - dateA.getTime();
                    })
                    .map(edu => `
                    <div class="education-item">
                        <div class="degree">${edu.degree}</div>
                        <div class="institution">${edu.institution} ${edu.graduationYear ? '• ' + edu.graduationYear : (edu.startDate ? '• ' + edu.startDate : '')} ${edu.endDate ? '- ' + edu.endDate : ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${cvData.skills.length > 0 ? `
            <div class="section">
                <h2>Kompetenser</h2>
                <div class="skills-container">
                    ${cvData.skills.flatMap(skillGroup => 
                        skillGroup.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase()))).map(skill => `<span class="skill-tag">${skill}</span>`)
                    ).join('')}
                </div>
            </div>
            ` : ''}

            ${shouldShowSection('languages', cvData) ? `
            <div class="section">
                <h2>Språkkunskaper</h2>
                <div class="languages-container">
                    ${cvData.languages?.map(lang => `
                        <div class="language-item">
                            <span class="language-name">${lang.language}</span>
                            <span class="language-level">${lang.proficiency}</span>
                        </div>
                    `).join('') || ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Referenser -->
            <div class="references-section">
                <p>Referenser lämnas på begäran</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const modernMinimalTemplate: CVTemplateGenerator = {
  templateId: 'modern-minimal',
  generate: generateModernMinimalHTML,
  metadata: {
    name: 'Modern Minimal',
    description: 'Ren, professionell design för alla branscher',
    category: 'modern',
    tier: 'free'
  }
};