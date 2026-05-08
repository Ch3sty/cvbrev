import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

function generateCleanCorporateHTML(cvData: CVMetadata, options: any = {}): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
            body { 
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
                margin: 0; 
                padding: 0; 
                color: #1e293b; 
                background: white;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                position: relative;
                display: flex;
            }
            
            /* Left sidebar - Clean Corporate style */
            .sidebar {
                width: 180px;
                background: #1e293b;
                padding: 25px 22px 40px 22px;
                box-sizing: border-box;
                color: white;
                position: relative;
                min-height: fit-content;
                align-self: flex-start;
            }
            
            .sidebar::after {
                content: '';
                position: absolute;
                right: -3px;
                top: 0;
                bottom: 0;
                width: 3px;
                background: linear-gradient(to bottom, #f59e0b 0%, #f59e0b 85%, transparent 100%);
            }
            
            .sidebar::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 20px;
                background: linear-gradient(to bottom, #1e293b 0%, rgba(30, 41, 59, 0.8) 100%);
            }
            
            .sidebar h3 {
                color: #f59e0b;
                font-size: 13px;
                font-weight: 700;
                margin: 25px 0 12px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .sidebar h3:first-child {
                margin-top: 0;
            }
            
            .sidebar p, .sidebar div {
                color: #94a3b8;
                font-size: 12px;
                margin: 6px 0;
                word-break: break-word;
                line-height: 1.3;
            }
            
            .sidebar .contact-item {
                margin-bottom: 8px;
                font-size: 11px;
                line-height: 1.3;
                word-break: break-word;
            }
            
            .sidebar .skill-item {
                background: rgba(148, 163, 184, 0.1);
                padding: 6px 10px;
                border-radius: 4px;
                margin: 4px 0;
                font-size: 11px;
                border-left: 2px solid #f59e0b;
                word-break: break-word;
                line-height: 1.4;
            }
            
            .sidebar .language-item {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin: 6px 0;
                font-size: 11px;
                line-height: 1.3;
            }
            
            .sidebar .language-name {
                word-break: break-word;
                flex: 1;
                margin-right: 6px;
            }
            
            .sidebar .language-level {
                background: #f59e0b;
                color: #1e293b;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 9px;
                font-weight: 600;
                white-space: nowrap;
                flex-shrink: 0;
            }
            
            /* Main content area */
            .main-content {
                flex: 1;
                padding: 30px 25px;
                background: white;
            }
            
            /* Header section */
            .header {
                margin-bottom: 35px;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 20px;
            }

            .header h1 {
                color: #1e293b;
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 8px 0;
                letter-spacing: -0.5px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .title {
                color: #64748b;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 12px;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }

            .header .summary {
                color: #374151;
                font-size: 14px;
                line-height: 1.6;
                padding: 12px 0;
                margin-top: 12px;
                margin-bottom: 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
            }
            
            /* Section styling */
            .section {
                margin-bottom: 35px;
            }
            
            .section h2 {
                color: #f59e0b;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 20px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #f59e0b;
                padding-bottom: 5px;
            }
            
            /* Experience items */
            .experience-item {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .experience-item:last-child {
                border-bottom: none;
            }
            
            .job-title {
                font-weight: 700;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 6px;
            }
            
            .company-info {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 10px;
                font-weight: 500;
            }
            
            .job-description {
                color: #374151;
                font-size: 13px;
                line-height: 1.5;
                margin: 4px 0;
            }
            
            /* Education items */
            .education-item {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f1f5f9;
            }
            
            .education-item:last-child {
                border-bottom: none;
            }
            
            .degree {
                font-weight: 700;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 6px;
            }
            
            .institution {
                color: #64748b;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Skills in main area (if needed) */
            .main-skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            
            .main-skill-tag {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                color: #1e293b;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 13px;
                font-weight: 500;
            }
            
            /* Referenser sektion */
            .references-section {
                margin-top: 40px;
                padding-top: 25px;
                border-top: 1px solid #e2e8f0;
            }
            
            .references-text p {
                text-align: center;
                color: #64748b;
                font-size: 13px;
                font-style: italic;
                margin: 0;
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Left Sidebar -->
            <div class="sidebar">
                <h3>Kontakt</h3>
                <div class="contact-item">${cvData.personalInfo.email}</div>
                ${cvData.personalInfo.phone ? `<div class="contact-item">${cvData.personalInfo.phone}</div>` : ''}
                ${cvData.personalInfo.address ? `<div class="contact-item">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                ${cvData.personalInfo.linkedIn ? `<div class="contact-item">LinkedIn</div>` : ''}
                
                ${cvData.skills.length > 0 ? `
                <h3>Kompetenser</h3>
                ${cvData.skills.flatMap(skillGroup => 
                    skillGroup.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase()))).map(skill => `<div class="skill-item">${skill}</div>`)
                ).join('')}
                ` : ''}
                
                ${shouldShowSection('languages', cvData) ? `
                <h3>Språk</h3>
                ${cvData.languages?.map(lang => `
                    <div class="language-item">
                        <span class="language-name">${lang.language}</span>
                        <span class="language-level">${lang.proficiency}</span>
                    </div>
                `).join('')}
                ` : ''}
            </div>
            
            <!-- Main Content Area -->
            <div class="main-content">
                <!-- Header -->
                <div class="header">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `<div class="summary">${cvData.summary}</div>` : ''}
                </div>
                
                ${cvData.experience.length > 0 ? `
                <div class="section">
                    <h2>Arbetslivserfarenhet</h2>
                    ${cvData.experience
                        .sort((a, b) => {
                            // Sortera i omvänd kronologisk ordning (nyast först)
                            const dateA = a.endDate ? new Date(a.endDate) : new Date(); // Pågående jobb = nuvarande datum
                            const dateB = b.endDate ? new Date(b.endDate) : new Date();
                            return dateB.getTime() - dateA.getTime();
                        })
                        .map(exp => `
                        <div class="experience-item">
                            <div class="job-title">${exp.position}</div>
                            <div class="company-info">${exp.company} ${exp.startDate ? '• ' + exp.startDate : ''} ${exp.endDate ? '- ' + exp.endDate : exp.startDate ? '- Pågående' : ''}</div>
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
                            // Sortera i omvänd kronologisk ordning (nyast först)
                            const yearA = a.graduationYear ? parseInt(a.graduationYear) : (a.endDate ? new Date(a.endDate).getFullYear() : (a.startDate ? new Date(a.startDate).getFullYear() : 0));
                            const yearB = b.graduationYear ? parseInt(b.graduationYear) : (b.endDate ? new Date(b.endDate).getFullYear() : (b.startDate ? new Date(b.startDate).getFullYear() : 0));
                            return yearB - yearA;
                        })
                        .map(edu => `
                        <div class="education-item">
                            <div class="degree">${edu.degree}</div>
                            <div class="institution">${edu.institution} ${edu.graduationYear ? '• ' + edu.graduationYear : (edu.startDate ? '• ' + edu.startDate : '')} ${edu.endDate ? '- ' + edu.endDate : ''}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- Referenser -->
                <div class="section references-section">
                    <div class="references-text">
                        <p>Referenser lämnas på begäran</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const cleanCorporateTemplate: CVTemplateGenerator = {
  templateId: 'clean-corporate',
  generate: generateCleanCorporateHTML,
  metadata: {
    name: 'Ren Företagsstil',
    description: 'Perfekt för företag och affärsroller',
    category: 'modern',
    tier: 'premium'
  }
};