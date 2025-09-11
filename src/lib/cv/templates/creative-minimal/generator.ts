import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

interface CreativeMinimalOptions {
  includePhoto?: boolean;
  includeLinkedIn?: boolean;
}

function generateCreativeMinimalHTML(cvData: CVMetadata, options: CreativeMinimalOptions = {}): string {
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
                background: white;
            }
            
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                position: relative;
                overflow: hidden;
            }
            
            /* Subtle dot pattern background */
            .cv-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20px 20px, rgba(124,58,237,0.02) 1px, transparent 1px);
                background-size: 20px 20px;
                pointer-events: none;
                opacity: 0.4;
            }
            
            /* Vertical Accent Line - Bredare som SVG */
            .vertical-accent {
                position: absolute;
                left: 0;
                top: 0;
                width: 12px; /* Bredare lila del */
                height: 100%;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                border-radius: 0 6px 6px 0;
                z-index: 1;
            }
            
            .vertical-accent::after {
                content: '';
                position: absolute;
                left: 10px; /* Direkt bredvid, justerat för bredare lila */
                top: 0;
                width: 5px; /* Bredare orange del */
                height: 100%;
                background: linear-gradient(135deg, #f97316, #fb923c);
                border-radius: 0 3px 3px 0;
                opacity: 0.6;
            }
            
            /* Header Section - Större för mer innehåll */
            .header-section {
                margin: 25px 20px 30px 30px; /* Justerad marginal för bredare border */
                padding: 25px 30px;
                background: rgba(124,58,237,0.02);
                border: 1px solid rgba(124,58,237,0.08);
                border-radius: 12px;
                display: flex;
                align-items: flex-start; /* Align till toppen för längre innehåll */
                gap: 25px;
                position: relative;
                z-index: 2;
                min-height: 120px; /* Minimum höjd för större header */
            }
            
            /* Profile Photo */
            .profile-photo-container {
                position: relative;
                flex-shrink: 0;
            }
            
            .profile-photo {
                width: 85px; /* Större foto */
                height: 85px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid rgba(124,58,237,0.15);
                box-shadow: 
                    0 6px 16px rgba(124,58,237,0.15),
                    0 2px 6px rgba(124,58,237,0.08);
                background: white;
            }
            
            /* Name and Title */
            .name-title-container {
                flex: 1;
            }
            
            .name {
                font-size: 22px; /* Mindre namn */
                font-weight: 700;
                color: white;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                padding: 6px 14px;
                border-radius: 6px;
                margin-bottom: 6px;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(124,58,237,0.2);
            }
            
            .title {
                font-size: 14px;
                color: rgba(124,58,237,0.8);
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .header-description {
                font-size: 13px; /* En storlek mindre än title */
                color: rgba(124,58,237,0.8); /* Samma färg som title */
                line-height: 1.5;
                margin-bottom: 8px;
                max-width: 100%;
                font-weight: 600; /* Samma font-weight som title */
            }
            
            .header-accent {
                width: 50px;
                height: 3px;
                background: linear-gradient(90deg, #f97316, #fb923c);
                border-radius: 2px;
            }
            
            /* LinkedIn Badge in Header */
            .linkedin-header-badge {
                background: rgba(0,119,181,0.08);
                border: 1px solid rgba(0,119,181,0.2);
                border-radius: 20px;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            
            .linkedin-header-badge:hover {
                background: rgba(0,119,181,0.15);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,119,181,0.2);
            }
            
            .linkedin-icon {
                width: 16px;
                height: 16px;
                background: linear-gradient(135deg, #0077b5, #005885);
                border-radius: 2px;
            }
            
            .linkedin-text {
                color: #0077b5;
                font-size: 12px;
                font-weight: 600;
            }
            
            /* Contact Information Bar */
            .contact-bar {
                margin: 0 20px 30px 25px;
                padding: 15px 25px;
                background: rgba(249,115,22,0.04);
                border: 1px solid rgba(249,115,22,0.1);
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #4a5568;
                font-weight: 500;
            }
            
            .contact-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(124,58,237,0.7);
                flex-shrink: 0;
            }
            
            /* Main Content */
            .main-content {
                margin-left: 30px; /* Justerad för bredare vänster border */
                margin-right: 20px;
                position: relative;
                z-index: 1;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 30px;
            }
            
            .section-header {
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
                display: inline-block;
                box-shadow: 0 2px 8px rgba(124,58,237,0.2);
            }
            
            .section-underline {
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, #f97316, #fb923c);
                border-radius: 1px;
                margin-bottom: 20px;
                opacity: 0.6;
            }
            
            /* Summary */
            .summary {
                font-size: 14px;
                color: #4a5568;
                line-height: 1.7;
                text-align: justify;
                margin-bottom: 25px;
                font-weight: 500;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 25px;
                position: relative;
                padding-right: 40px;
            }
            
            .job-title {
                font-weight: 700;
                color: #7c3aed;
                font-size: 16px;
                margin-bottom: 4px;
                line-height: 1.3;
            }
            
            .company-info {
                color: #718096;
                font-size: 13px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .job-description {
                color: #4a5568;
                font-size: 13px;
                line-height: 1.6;
                margin: 3px 0;
                text-align: justify;
            }
            
            .experience-bullet {
                position: absolute;
                right: 15px;
                top: 5px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #fb923c);
            }
            
            /* Education Items */
            .education-item {
                margin-bottom: 20px;
                padding: 15px 20px;
                background: linear-gradient(135deg, rgba(124,58,237,0.02), rgba(124,58,237,0.04));
                border-radius: 8px;
                border-left: 3px solid #7c3aed;
                position: relative;
            }
            
            .degree {
                font-weight: 700;
                color: #7c3aed;
                font-size: 14px;
                margin-bottom: 4px;
            }
            
            .institution {
                color: #718096;
                font-size: 13px;
                font-weight: 600;
            }
            
            .education-bullet {
                position: absolute;
                right: 15px;
                top: 15px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #fb923c);
            }
            
            /* Skills */
            .skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            
            .skill-tag {
                background: rgba(124,58,237,0.1);
                color: #7c3aed;
                padding: 6px 12px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid rgba(124,58,237,0.2);
                transition: all 0.2s ease;
            }
            
            .skill-tag:hover {
                background: rgba(124,58,237,0.15);
                border-color: #7c3aed;
            }
            
            /* Languages */
            .languages-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .language-item {
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                color: white;
                padding: 6px 14px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 6px rgba(124,58,237,0.2);
            }
            
            .language-level {
                background: rgba(249,115,22,0.9);
                color: white;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 700;
            }
            
            /* Footer */
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(124,58,237,0.1);
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, #f97316, #fb923c);
                opacity: 0.6;
            }
            
            .references-note {
                color: #718096;
                font-size: 12px;
                font-style: italic;
                font-weight: 500;
            }
            
            /* Subtle decorative elements */
            .decoration-top {
                position: absolute;
                top: 30px;
                right: 30px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: linear-gradient(135deg, #f97316, #fb923c);
                opacity: 0.3;
            }
            
            .decoration-bottom {
                position: absolute;
                bottom: 20px;
                right: 30px;
                width: 20px;
                height: 2px;
                background: linear-gradient(90deg, #f97316, #fb923c);
                border-radius: 1px;
                opacity: 0.3;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Decorative Elements -->
            <div class="decoration-top"></div>
            <div class="decoration-bottom"></div>
            
            <!-- Vertical Accent Line -->
            <div class="vertical-accent"></div>
            
            <!-- Header Section -->
            <div class="header-section">
                ${includePhoto ? `
                <div class="profile-photo-container">
                    <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" class="profile-photo" />
                </div>
                ` : ''}
                
                <div class="name-title-container">
                    <h1 class="name">${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `
                    <div class="title">${cvData.summary.split('.')[0]}.</div>
                    <div class="header-description">${cvData.summary.split('.').slice(1, 3).join('.').trim()}${cvData.summary.split('.').length > 2 ? '.' : ''}</div>
                    ` : ''}
                    <div class="header-accent"></div>
                </div>
                
                ${includeLinkedIn ? `
                <a href="${cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin}" class="linkedin-header-badge" target="_blank" rel="noopener noreferrer">
                    <div class="linkedin-icon"></div>
                    <span class="linkedin-text">LinkedIn</span>
                </a>
                ` : ''}
            </div>
            
            <!-- Contact Information Bar -->
            ${(cvData.personalInfo.email || cvData.personalInfo.phone || cvData.personalInfo.address) ? `
            <div class="contact-bar">
                ${cvData.personalInfo.email ? `
                <div class="contact-item">
                    <div class="contact-dot"></div>
                    <span>${cvData.personalInfo.email}</span>
                </div>
                ` : ''}
                
                ${cvData.personalInfo.phone ? `
                <div class="contact-item">
                    <div class="contact-dot"></div>
                    <span>${cvData.personalInfo.phone}</span>
                </div>
                ` : ''}
                
                ${cvData.personalInfo.address ? `
                <div class="contact-item">
                    <div class="contact-dot"></div>
                    <span>${formatSwedishAddress(cvData.personalInfo.address)}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- Main Content -->
            <div class="main-content">
                
                ${cvData.experience.length > 0 ? `
                <!-- Professional Experience -->
                <div class="section">
                    <div class="section-header">Arbetslivserfarenhet</div>
                    <div class="section-underline"></div>
                    ${cvData.experience
                        .sort((a, b) => {
                            const dateA = a.endDate ? new Date(a.endDate) : new Date();
                            const dateB = b.endDate ? new Date(b.endDate) : new Date();
                            return dateB.getTime() - dateA.getTime();
                        })
                        .map(exp => `
                        <div class="experience-item">
                            <div class="experience-bullet"></div>
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
                    <div class="section-underline"></div>
                    ${cvData.education
                        .sort((a, b) => {
                            const dateA = a.endDate ? new Date(a.endDate) : (a.graduationYear ? new Date(a.graduationYear + '-12-31') : new Date());
                            const dateB = b.endDate ? new Date(b.endDate) : (b.graduationYear ? new Date(b.graduationYear + '-12-31') : new Date());
                            return dateB.getTime() - dateA.getTime();
                        })
                        .map(edu => `
                        <div class="education-item">
                            <div class="education-bullet"></div>
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
                    <div class="section-underline"></div>
                    <div class="skills-container">
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
                    <div class="section-underline"></div>
                    <div class="languages-container">
                        ${cvData.languages?.map(lang => `
                            <div class="language-item">
                                <span>${lang.language}</span>
                                <span class="language-level">${lang.proficiency}</span>
                            </div>
                        `).join('') || 
                            `<div class="language-item">
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

export const creativeMinimalTemplate: CVTemplateGenerator = {
  templateId: 'creative-minimal',
  generate: (cvData: CVMetadata, options?: any) => generateCreativeMinimalHTML(cvData, options),
  metadata: {
    name: 'Creative Minimal',
    description: 'Modern asymmetrisk design med horisontell header, foto och LinkedIn integration',
    category: 'creative',
    tier: 'premium'
  }
};