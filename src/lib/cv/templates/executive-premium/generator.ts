import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

function generateExecutivePremiumHTML(cvData: CVMetadata): string {
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
                font-family: 'Georgia', 'Times New Roman', serif;
                line-height: 1.6;
                color: #374151;
                background: white;
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                position: relative;
            }
            
            /* Premium Executive Header */
            .executive-header {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                padding: 30px 40px 25px 40px;
                color: white;
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .executive-header::after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
            }
            
            .header-main {
                flex: 1;
            }
            
            .header-main h1 {
                font-size: 32px;
                font-weight: 700;
                color: white;
                margin-bottom: 8px;
                font-family: 'Georgia', serif;
                letter-spacing: 0.5px;
            }
            
            .header-contact {
                flex-shrink: 0;
                text-align: right;
                font-size: 12px;
                line-height: 1.4;
                color: rgba(255, 255, 255, 0.9);
                margin-top: 5px;
            }
            
            .header-summary {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                line-height: 1.6;
                margin-top: 12px;
                font-style: italic;
            }
            
            /* Content Area */
            .content-area {
                padding: 35px 40px;
                position: relative;
            }
            
            /* Premium Decorative Elements */
            .content-area::before {
                content: '';
                position: absolute;
                left: 20px;
                top: 35px;
                bottom: 35px;
                width: 3px;
                background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
                border-radius: 2px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 35px;
                padding-left: 25px;
            }
            
            .section h2 {
                color: #1e293b;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: 'Georgia', serif;
            }
            
            .section-separator {
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, transparent 100%);
                margin-bottom: 20px;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 28px;
                padding-bottom: 20px;
            }
            
            .experience-item:not(:last-child) {
                border-bottom: 1px solid #f1f5f9;
            }
            
            .job-title {
                font-weight: 700;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 4px;
                font-family: 'Georgia', serif;
            }
            
            .company-info {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 8px;
                font-weight: 600;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            
            .job-description {
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.6;
                margin: 2px 0;
                font-family: 'Segoe UI', system-ui, sans-serif;
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
                font-family: 'Georgia', serif;
            }
            
            .institution {
                color: #64748b;
                font-size: 14px;
                font-weight: 600;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            
            /* Premium Skills */
            .skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .skill-tag {
                background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
                border: 1px solid #f59e0b;
                color: #92400e;
                padding: 8px 14px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Executive Languages */
            .languages-container {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .language-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            .language-name {
                font-weight: 700;
                color: #1e293b;
                font-size: 14px;
                font-family: 'Georgia', serif;
            }
            
            .language-level {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            /* Premium References */
            .references-section {
                margin-top: 40px;
                padding-top: 25px;
                border-top: 2px solid #d97706;
                text-align: center;
                position: relative;
            }
            
            .references-section::before {
                content: '';
                position: absolute;
                top: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%);
            }
            
            .references-section p {
                color: #64748b;
                font-size: 14px;
                font-style: italic;
                letter-spacing: 0.5px;
                font-family: 'Georgia', serif;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Premium Executive Header -->
            <div class="executive-header">
                <div class="header-main">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `<div class="header-summary">${cvData.summary}</div>` : ''}
                </div>
                <div class="header-contact">
                    ${cvData.personalInfo.email || ''}<br>
                    ${cvData.personalInfo.phone || ''}<br>
                    ${cvData.personalInfo.address ? formatSwedishAddress(cvData.personalInfo.address) : ''}
                </div>
            </div>

            <div class="content-area">
                ${cvData.experience.length > 0 ? `
                <div class="section">
                    <h2>Arbetslivserfarenhet</h2>
                    <div class="section-separator"></div>
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
                    <div class="section-separator"></div>
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
                    <div class="section-separator"></div>
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
                    <div class="section-separator"></div>
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
                
                <!-- Premium Referenser -->
                <div class="references-section">
                    <p>Referenser lämnas på begäran</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const executivePremiumTemplate: CVTemplateGenerator = {
  templateId: 'executive-premium',
  generate: generateExecutivePremiumHTML,
  metadata: {
    name: 'Executive Premium',
    description: 'Exklusiv design för ledande positioner',
    category: 'traditional',
    tier: 'premium'
  }
};