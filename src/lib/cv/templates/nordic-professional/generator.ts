import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

function generateNordicProfessionalHTML(cvData: CVMetadata, options: any = {}): string {
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
                color: #2c2c2c;
                background: #fafafa;
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: #fafafa;
                position: relative;
            }
            
            /* Forest Green Sidebar - Nordic Style */
            .sidebar {
                width: 85mm;
                background: linear-gradient(180deg, #2d5016 0%, #3d6b1f 100%);
                position: absolute;
                padding: 25px 18px;
                color: white;
                min-height: 200mm; /* Begränsar höjden istället för hela PDF:en */
            }
            
            .sidebar::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                width: 2px;
                height: 100%;
                background: rgba(74, 144, 164, 0.3);
            }
            
            /* Contact Section */
            .contact-section {
                margin-bottom: 30px;
            }
            
            /* Profile Photo */
            .profile-photo {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid rgba(255, 255, 255, 0.3);
                margin-bottom: 15px;
                display: block;
                margin-left: auto;
                margin-right: auto;
            }
            
            .contact-header {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                padding: 8px 12px;
                margin-bottom: 20px;
                position: relative;
            }
            
            .contact-header::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 12px;
                right: 12px;
                height: 4px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 2px;
            }
            
            .contact-header h3 {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .contact-info {
                line-height: 1.7;
            }
            
            .contact-item {
                background: rgba(255, 255, 255, 0.9);
                color: #2d5016;
                padding: 3px 0;
                margin: 2px 0;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                text-indent: 2px;
            }
            
            .contact-accent {
                width: 40px;
                height: 1px;
                background: linear-gradient(90deg, #4a90a4, #6ba3b5);
                border-radius: 0.5px;
                margin: 8px auto;
            }
            
            /* Skills Section */
            .skills-section {
                margin-bottom: 30px;
            }
            
            .section-header {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                padding: 8px 12px;
                margin-bottom: 15px;
                position: relative;
            }
            
            .section-header::after {
                content: '';
                position: absolute;
                bottom: 2px;
                left: 12px;
                right: 12px;
                height: 4px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 2px;
            }
            
            .section-header h3 {
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .skill-text {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 4px 8px;
                margin: 4px 0;
                font-size: 11px;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.9);
            }
            
            /* Languages Section */
            .languages-section {
                margin-bottom: 30px;
            }
            
            .language-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                padding: 4px 6px;
                margin: 5px 0;
                font-size: 11px;
            }
            
            .language-name {
                color: rgba(255, 255, 255, 0.95);
                font-weight: 500;
            }
            
            .language-level {
                background: #4a90a4;
                color: white;
                padding: 1px 6px;
                border-radius: 1px;
                font-size: 9px;
                font-weight: 600;
            }
            
            /* Main Content Area */
            .main-content {
                margin-left: 85mm;
                padding: 35px 30px;
                background: #fafafa;
                min-height: 297mm;
            }
            
            /* Header Section */
            .header {
                margin-bottom: 35px;
            }
            
            .header h1 {
                font-size: 32px;
                font-weight: 700;
                color: #2c2c2c;
                margin-bottom: 8px;
                line-height: 1.2;
            }
            
            .header .title {
                font-size: 16px;
                color: #4a4a4a;
                margin-bottom: 15px;
                font-weight: 500;
            }
            
            .header-accent {
                width: 65px;
                height: 3px;
                background: linear-gradient(90deg, #4a90a4, #6ba3b5);
                border-radius: 2px;
                margin-bottom: 20px;
            }
            
            /* Summary Section */
            .summary-section {
                margin-bottom: 35px;
            }
            
            .summary-header {
                background: #2d5016;
                color: white;
                padding: 6px 16px;
                border-radius: 3px;
                margin-bottom: 15px;
                display: inline-block;
            }
            
            .summary-header h2 {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .summary-text {
                color: #4a4a4a;
                font-size: 14px;
                line-height: 1.6;
                text-align: justify;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 35px;
            }
            
            .section-title {
                background: #2d5016;
                color: white;
                padding: 6px 16px;
                border-radius: 3px;
                margin-bottom: 15px;
                display: inline-block;
            }
            
            .section-title h2 {
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: white;
            }
            
            .section-separator {
                width: 130px;
                height: 1.5px;
                background: rgba(74, 144, 164, 0.4);
                border-radius: 1px;
                margin-bottom: 20px;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 25px;
                position: relative;
            }
            
            .experience-item:not(:last-child)::after {
                content: '';
                position: absolute;
                left: 0;
                bottom: -12px;
                width: 3px;
                height: 3px;
                background: rgba(74, 144, 164, 0.4);
                border-radius: 50%;
            }
            
            .job-title {
                font-weight: 700;
                color: #2c2c2c;
                font-size: 16px;
                margin-bottom: 5px;
                line-height: 1.3;
            }
            
            .company-info {
                color: #6ba3b5;
                font-size: 14px;
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .job-description {
                color: #4a4a4a;
                font-size: 13px;
                line-height: 1.6;
                margin: 3px 0;
                text-align: justify;
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
                color: #2c2c2c;
                font-size: 16px;
                margin-bottom: 4px;
                line-height: 1.3;
            }
            
            .institution {
                color: #6ba3b5;
                font-size: 14px;
                font-weight: 500;
            }
            
            .education-separator {
                width: 110px;
                height: 2px;
                background: linear-gradient(90deg, #8b7355, #a68b5b);
                border-radius: 1px;
                margin: 8px 0;
                position: relative;
            }
            
            .education-separator::after {
                content: '';
                position: absolute;
                top: 1.5px;
                left: 0;
                width: 85px;
                height: 0.5px;
                background: rgba(160, 140, 95, 0.5);
                border-radius: 0.25px;
            }
            
            /* Main Content Skills */
            .main-skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            
            .main-skill-tag {
                background: rgba(74, 144, 164, 0.1);
                border: 1px solid rgba(74, 144, 164, 0.3);
                color: #2d5016;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            /* Decorative Elements */
            .decorative-element {
                position: absolute;
                right: 40px;
                top: 150px;
                width: 8px;
                height: 12px;
                background: rgba(74, 144, 164, 0.08);
                border-radius: 50%;
                transform: rotate(15deg);
            }
            
            /* References */
            .references-section {
                margin-top: 40px;
                text-align: center;
                border-top: 1px solid rgba(74, 144, 164, 0.2);
                padding-top: 20px;
            }
            
            .references-section p {
                color: #6ba3b5;
                font-size: 12px;
                font-style: italic;
                letter-spacing: 0.3px;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Forest Green Sidebar -->
            <div class="sidebar">
                <!-- Profile Photo -->
                ${cvData.personalInfo.profilePhotoUrl ? `
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" class="profile-photo" />
                </div>
                ` : ''}
                
                <!-- Contact Section -->
                <div class="contact-section">
                    <div class="contact-header">
                        <h3>Kontakt</h3>
                    </div>
                    <div class="contact-info">
                        ${cvData.personalInfo.email ? `<div class="contact-item">${cvData.personalInfo.email}</div>` : ''}
                        ${cvData.personalInfo.phone ? `<div class="contact-item">${cvData.personalInfo.phone}</div>` : ''}
                        ${cvData.personalInfo.address ? `<div class="contact-item">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                        ${(cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin) ? `<div class="contact-item">${cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin}</div>` : ''}
                    </div>
                    <div class="contact-accent"></div>
                </div>
                
                ${cvData.skills.length > 0 ? `
                <!-- Skills Section -->
                <div class="skills-section">
                    <div class="section-header">
                        <h3>Kompetenser</h3>
                    </div>
                    ${cvData.skills.flatMap(skillGroup => 
                        skillGroup.skills
                            .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                            .slice(0, 8) // Limit skills in sidebar for clean design
                            .map(skill => `<div class="skill-text">${skill}</div>`)
                    ).join('')}
                </div>
                ` : ''}
                
                ${shouldShowSection('languages', cvData) ? `
                <!-- Languages Section -->
                <div class="languages-section">
                    <div class="section-header">
                        <h3>Språk</h3>
                    </div>
                    ${cvData.languages?.map(lang => `
                        <div class="language-item">
                            <span class="language-name">${lang.language}</span>
                            <span class="language-level">${lang.proficiency}</span>
                        </div>
                    `).join('') || ''}
                </div>
                ` : ''}
            </div>
            
            <!-- Main Content Area -->
            <div class="main-content">
                <!-- Decorative Element -->
                <div class="decorative-element"></div>
                
                <!-- Header -->
                <div class="header">
                    <h1>${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `<div class="title">${cvData.summary}</div>` : ''}
                    <div class="header-accent"></div>
                </div>
                
                ${cvData.experience.length > 0 ? `
                <!-- Experience Section -->
                <div class="section">
                    <div class="section-title">
                        <h2>Arbetslivserfarenhet</h2>
                    </div>
                    <div class="section-separator"></div>
                    ${cvData.experience
                        .sort((a, b) => {
                            const dateA = a.endDate ? new Date(a.endDate) : new Date();
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
                <!-- Education Section -->
                <div class="section">
                    <div class="section-title">
                        <h2>Utbildning</h2>
                    </div>
                    <div class="education-separator"></div>
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
                
                
                <!-- References -->
                <div class="references-section">
                    <p>Referenser lämnas på begäran</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const nordicProfessionalTemplate: CVTemplateGenerator = {
  templateId: 'nordic-professional',
  generate: generateNordicProfessionalHTML,
  metadata: {
    name: 'Nordic Professional',
    description: 'Elegant nordisk design med forest green sidebar och clean layout',
    category: 'modern',
    tier: 'premium'
  }
};