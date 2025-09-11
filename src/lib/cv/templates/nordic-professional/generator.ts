import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

interface NordicProfessionalOptions {
  includePhoto?: boolean;
  includeLinkedIn?: boolean;
}

function generateNordicProfessionalHTML(cvData: CVMetadata, options: NordicProfessionalOptions = {}): string {
  // Smart defaults - inkludera om data finns
  const hasProfilePhoto = Boolean(cvData.personalInfo.profilePhotoUrl);
  const hasLinkedIn = Boolean(cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin);
  
  const includePhoto = options.includePhoto !== false && hasProfilePhoto;
  const includeLinkedIn = options.includeLinkedIn !== false && hasLinkedIn;
  
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
                font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                color: #2d3748;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                position: relative;
                box-shadow: 0 8px 32px rgba(6, 78, 59, 0.15);
                overflow: hidden;
            }
            
            /* Subtle Background Texture */
            .cv-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 30%, rgba(6, 78, 59, 0.02) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(217, 119, 6, 0.02) 0%, transparent 50%);
                pointer-events: none;
            }
            
            /* Angular Sidebar Design */
            .angular-sidebar {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 140px;
                background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%);
                clip-path: polygon(0 0, 85px 0, 100px 25px, 100px calc(100% - 25px), 85px 100%, 0 100%);
                z-index: 1;
            }
            
            .angular-sidebar::after {
                content: '';
                position: absolute;
                right: -15px;
                top: 0;
                bottom: 0;
                width: 15px;
                background: linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.1));
                clip-path: polygon(0 25px, 15px 0, 15px 100%, 0 calc(100% - 25px));
            }
            
            /* Profile Photo Section */
            .profile-photo-section {
                position: absolute;
                left: 30px;
                top: 60px;
                z-index: 2;
            }
            
            .profile-photo {
                width: 90px;
                height: 90px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid rgba(255, 255, 255, 0.9);
                box-shadow: 
                    0 8px 25px rgba(6, 78, 59, 0.25),
                    0 3px 8px rgba(6, 78, 59, 0.15);
                background: rgba(255, 255, 255, 0.1);
                position: relative;
            }
            
            .profile-photo::before {
                content: '';
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border-radius: 50%;
                border: 1px solid rgba(217, 119, 6, 0.3);
                z-index: -1;
            }
            
            /* Sidebar Content */
            .sidebar-content {
                position: absolute;
                left: 20px;
                top: ${includePhoto ? '170px' : '60px'};
                width: 100px;
                z-index: 2;
            }
            
            .sidebar-section {
                margin-bottom: 30px;
            }
            
            .sidebar-header {
                color: rgba(255, 255, 255, 0.9);
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 12px;
                padding-bottom: 4px;
                border-bottom: 2px solid rgba(217, 119, 6, 0.6);
                position: relative;
            }
            
            .sidebar-header::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 60%;
                height: 1px;
                background: rgba(217, 119, 6, 0.4);
            }
            
            .contact-item {
                color: rgba(255, 255, 255, 0.85);
                font-size: 11px;
                margin-bottom: 8px;
                padding-left: 15px;
                position: relative;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .contact-item::before {
                content: '';
                position: absolute;
                left: 0;
                top: 6px;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 50%;
            }
            
            /* LinkedIn Section */
            .linkedin-section {
                background: rgba(0, 119, 181, 0.15);
                border: 1px solid rgba(0, 119, 181, 0.3);
                border-radius: 8px;
                padding: 8px;
                margin: 15px 0;
            }
            
            .linkedin-link {
                color: #0077b5;
                text-decoration: none;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.95);
                padding: 4px 6px;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .linkedin-link:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 119, 181, 0.2);
            }
            
            .linkedin-icon {
                width: 12px;
                height: 12px;
                margin-right: 4px;
                fill: #0077b5;
            }
            
            /* Sidebar Skills */
            .skill-item {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
                padding: 6px 8px;
                margin: 6px 0;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                border-left: 3px solid rgba(217, 119, 6, 0.6);
                position: relative;
            }
            
            .skill-item::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 50%;
                transform: translateY(-50%);
                width: 6px;
                height: 6px;
                background: rgba(217, 119, 6, 0.8);
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            
            /* Language Items */
            .language-item {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.9);
                padding: 6px 8px;
                margin: 6px 0;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                position: relative;
            }
            
            .language-item::before {
                content: '';
                position: absolute;
                left: -5px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                background: rgba(217, 119, 6, 0.7);
                border-radius: 50%;
            }
            
            /* Main Content */
            .main-content {
                margin-left: 160px;
                padding: 40px 40px 40px 20px;
                position: relative;
                z-index: 1;
            }
            
            /* Header Section */
            .header-section {
                margin-bottom: 35px;
                position: relative;
            }
            
            .name {
                font-size: 32px;
                font-weight: 700;
                color: #064e3b;
                margin-bottom: 12px;
                line-height: 1.2;
                background: linear-gradient(135deg, #064e3b, #047857);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
            }
            
            .name::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 0;
                width: 80px;
                height: 3px;
                background: linear-gradient(90deg, #d97706, #f59e0b);
                border-radius: 2px;
            }
            
            .title {
                font-size: 16px;
                color: rgba(6, 78, 59, 0.8);
                font-weight: 600;
                margin-bottom: 20px;
            }
            
            .summary {
                font-size: 14px;
                color: #4a5568;
                line-height: 1.7;
                text-align: justify;
                font-weight: 500;
                max-width: 450px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 35px;
                position: relative;
            }
            
            .section-header {
                background: linear-gradient(135deg, #064e3b, #047857);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                display: inline-block;
                position: relative;
                box-shadow: 0 4px 15px rgba(6, 78, 59, 0.2);
            }
            
            .section-header::after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 20px;
                right: 20px;
                height: 2px;
                background: linear-gradient(90deg, #d97706, #f59e0b);
                border-radius: 1px;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 30px;
                position: relative;
                padding-left: 25px;
                border-left: 2px solid #e2e8f0;
            }
            
            .experience-item::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 8px;
                width: 12px;
                height: 12px;
                background: linear-gradient(45deg, #d97706, #f59e0b);
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 0 2px #d97706;
            }
            
            .job-title {
                font-weight: 700;
                color: #064e3b;
                font-size: 18px;
                margin-bottom: 6px;
                line-height: 1.3;
            }
            
            .company-info {
                color: #718096;
                font-size: 14px;
                margin-bottom: 12px;
                font-weight: 600;
            }
            
            .job-description {
                color: #4a5568;
                font-size: 14px;
                line-height: 1.6;
                margin: 4px 0;
                text-align: justify;
            }
            
            /* Education Items */
            .education-item {
                margin-bottom: 20px;
                padding: 20px;
                background: linear-gradient(135deg, #f7fafc, #edf2f7);
                border-radius: 8px;
                border-left: 4px solid #064e3b;
                position: relative;
            }
            
            .education-item::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 20px;
                width: 6px;
                height: 6px;
                background: #d97706;
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            
            .degree {
                font-weight: 700;
                color: #064e3b;
                font-size: 16px;
                margin-bottom: 6px;
            }
            
            .institution {
                color: #718096;
                font-size: 14px;
                font-weight: 600;
            }
            
            /* Skills Grid */
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            
            .skill-tag {
                background: linear-gradient(135deg, rgba(6, 78, 59, 0.05), rgba(6, 78, 59, 0.08));
                color: #064e3b;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                border: 1px solid rgba(217, 119, 6, 0.3);
                text-align: center;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .skill-tag:hover {
                transform: translateY(-2px);
                border-color: #d97706;
                background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.15));
                box-shadow: 0 4px 15px rgba(217, 119, 6, 0.2);
            }
            
            /* Languages */
            .language-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 20px;
            }
            
            .language-tag {
                background: linear-gradient(135deg, #064e3b, #047857);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(6, 78, 59, 0.2);
            }
            
            .language-level {
                background: rgba(217, 119, 6, 0.2);
                color: #d97706;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
            }
            
            /* Footer */
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 25px;
                border-top: 1px solid #e2e8f0;
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 100px;
                height: 2px;
                background: linear-gradient(90deg, transparent, #d97706, transparent);
            }
            
            .references-note {
                color: #718096;
                font-size: 13px;
                font-style: italic;
                font-weight: 500;
            }
            
            /* Decorative Elements */
            .decorative-elements {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 0;
            }
            
            .decorative-elements::before {
                content: '';
                position: absolute;
                right: 40px;
                top: 40px;
                width: 12px;
                height: 12px;
                background: rgba(217, 119, 6, 0.3);
                border-radius: 50%;
            }
            
            .decorative-elements::after {
                content: '';
                position: absolute;
                right: 40px;
                bottom: 40px;
                width: 8px;
                height: 8px;
                background: rgba(6, 78, 59, 0.3);
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Angular Sidebar -->
            <div class="angular-sidebar"></div>
            
            <!-- Profile Photo Section -->
            ${includePhoto ? `
            <div class="profile-photo-section">
                <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" class="profile-photo" />
            </div>
            ` : ''}
            
            <!-- Sidebar Content -->
            <div class="sidebar-content">
                <!-- Contact Information -->
                ${(cvData.personalInfo.email || cvData.personalInfo.phone || cvData.personalInfo.address) ? `
                <div class="sidebar-section">
                    <div class="sidebar-header">Kontakt</div>
                    ${cvData.personalInfo.email ? `<div class="contact-item">${cvData.personalInfo.email}</div>` : ''}
                    ${cvData.personalInfo.phone ? `<div class="contact-item">${cvData.personalInfo.phone}</div>` : ''}
                    ${cvData.personalInfo.address ? `<div class="contact-item">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                </div>
                ` : ''}
                
                <!-- LinkedIn Section -->
                ${includeLinkedIn ? `
                <div class="linkedin-section">
                    <a href="${cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin}" class="linkedin-link" target="_blank">
                        <svg class="linkedin-icon" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                    </a>
                </div>
                ` : ''}
                
                <!-- Skills in Sidebar -->
                ${cvData.skills.length > 0 ? `
                <div class="sidebar-section">
                    <div class="sidebar-header">Färdigheter</div>
                    ${cvData.skills
                        .flatMap(skillGroup => skillGroup.skills)
                        .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                        .slice(0, 6)
                        .map(skill => `<div class="skill-item">${skill}</div>`)
                        .join('')}
                </div>
                ` : ''}
                
                <!-- Languages in Sidebar -->
                ${shouldShowSection('languages', cvData) ? `
                <div class="sidebar-section">
                    <div class="sidebar-header">Språk</div>
                    ${cvData.languages?.map(lang => `
                        <div class="language-item">${lang.language}</div>
                    `).join('') || '<div class="language-item">Svenska</div>'}
                </div>
                ` : ''}
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                <!-- Decorative Elements -->
                <div class="decorative-elements"></div>
                
                <!-- Header Section -->
                <div class="header-section">
                    <h1 class="name">${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `<div class="summary">${cvData.summary}</div>` : ''}
                </div>
                
                ${cvData.experience.length > 0 ? `
                <!-- Professional Experience -->
                <div class="section">
                    <div class="section-header">Arbetslivserfarenhet</div>
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
                            ${exp.description?.map(desc => `<div class="job-description">• ${desc}</div>`).join('') || ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                <!-- Education -->
                <div class="section">
                    <div class="section-header">Utbildning</div>
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
                <!-- Skills -->
                <div class="section">
                    <div class="section-header">Kompetenser</div>
                    <div class="skills-grid">
                        ${cvData.skills
                            .flatMap(skillGroup => skillGroup.skills)
                            .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                            .map(skill => `<span class="skill-tag">${skill}</span>`)
                            .join('')}
                    </div>
                </div>
                ` : ''}
                
                ${shouldShowSection('languages', cvData) ? `
                <!-- Languages -->
                <div class="section">
                    <div class="section-header">Språk</div>
                    <div class="language-grid">
                        ${cvData.languages?.map(lang => `
                            <div class="language-tag">
                                <span>${lang.language}</span>
                                <span class="language-level">${lang.proficiency}</span>
                            </div>
                        `).join('') || 
                            `<div class="language-tag">
                                <span>Svenska</span>
                                <span class="language-level">Modersmål</span>
                            </div>`}
                    </div>
                </div>
                ` : ''}
                
                <!-- Footer -->
                <div class="footer">
                    <div class="references-note">Referenser lämnas på begäran</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const nordicProfessionalTemplate: CVTemplateGenerator = {
  templateId: 'nordic-professional',
  generate: (cvData: CVMetadata, options?: any) => generateNordicProfessionalHTML(cvData, options),
  metadata: {
    name: 'Nordic Professional',
    description: 'Elegant nordisk design med angular sidebar, profilbild och LinkedIn integration',
    category: 'modern',
    tier: 'premium'
  }
};