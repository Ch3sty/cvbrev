import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

interface PlatinumExecutiveOptions {
  includePhoto?: boolean;
  includeLinkedIn?: boolean;
}

function generatePlatinumExecutiveHTML(cvData: CVMetadata, options: PlatinumExecutiveOptions = {}): string {
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
                box-shadow: 0 4px 20px rgba(26, 54, 93, 0.1);
            }
            
            /* Executive Header Section */
            .executive-header {
                background: linear-gradient(135deg, #1a365d 0%, #2d5a87 50%, #1e3a5f 100%);
                height: ${includePhoto ? '160px' : '140px'};
                position: relative;
                overflow: hidden;
            }
            
            .executive-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 30%, rgba(246, 173, 85, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(226, 232, 240, 0.05) 0%, transparent 50%);
            }
            
            .gold-accent {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #f6ad55, #ed8936, #f6ad55);
            }
            
            .gold-accent::after {
                content: '';
                position: absolute;
                top: 4px;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(246, 173, 85, 0.3);
            }
            
            /* Profile Photo Styling */
            .profile-photo {
                position: absolute;
                left: 30px;
                top: 50%;
                transform: translateY(-50%);
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
                border: 4px solid rgba(242, 243, 244, 0.9);
                box-shadow: 0 6px 20px rgba(26, 54, 93, 0.3);
                background: rgba(255, 255, 255, 0.1);
            }
            
            /* Name and Title Area */
            .name-title-area {
                position: absolute;
                left: ${includePhoto ? '150px' : '40px'};
                top: 50%;
                transform: translateY(-50%);
                right: ${includeLinkedIn ? '200px' : '40px'};
            }
            
            .executive-name {
                font-size: 28px;
                font-weight: 700;
                color: white;
                margin-bottom: 8px;
                line-height: 1.2;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .executive-title {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.9);
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .executive-summary-brief {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
                max-width: 300px;
            }
            
            /* Contact & LinkedIn Section */
            .contact-linkedin-area {
                position: absolute;
                right: 30px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(10px);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                min-width: 140px;
            }
            
            .contact-item {
                color: rgba(255, 255, 255, 0.9);
                font-size: 12px;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                font-weight: 500;
            }
            
            .linkedin-link {
                display: flex;
                align-items: center;
                color: #0077b5;
                text-decoration: none;
                background: rgba(255, 255, 255, 0.95);
                padding: 6px 8px;
                border-radius: 4px;
                margin-top: 8px;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .linkedin-link:hover {
                background: white;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 119, 181, 0.2);
            }
            
            .linkedin-icon {
                width: 14px;
                height: 14px;
                margin-right: 6px;
                fill: #0077b5;
            }
            
            /* Main Content Area */
            .main-content {
                padding: 40px;
                position: relative;
            }
            
            /* Section Headers */
            .section {
                margin-bottom: 35px;
            }
            
            .section-header {
                background: #1a365d;
                color: white;
                padding: 8px 20px;
                border-radius: 25px;
                margin-bottom: 8px;
                display: inline-block;
                font-size: 16px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
            }
            
            .section-header::after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                bottom: -4px;
                height: 2px;
                background: linear-gradient(90deg, #f6ad55, #ed8936);
                border-radius: 1px;
            }
            
            .section-separator {
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, #f6ad55, transparent);
                margin-bottom: 25px;
            }
            
            /* Executive Summary */
            .executive-summary {
                background: linear-gradient(135deg, #f7fafc, #edf2f7);
                padding: 25px;
                border-radius: 12px;
                border-left: 4px solid #f6ad55;
                margin-bottom: 35px;
                position: relative;
            }
            
            .summary-text {
                font-size: 15px;
                color: #4a5568;
                line-height: 1.7;
                text-align: justify;
                font-weight: 500;
            }
            
            /* Experience Items with Timeline */
            .experience-item {
                margin-bottom: 30px;
                position: relative;
                padding-left: 25px;
                border-left: 2px solid #e2e8f0;
            }
            
            .experience-item::before {
                content: '';
                position: absolute;
                left: -6px;
                top: 8px;
                width: 10px;
                height: 10px;
                background: linear-gradient(45deg, #f6ad55, #ed8936);
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 0 2px #f6ad55;
            }
            
            .job-title {
                font-weight: 700;
                color: #1a365d;
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
                border-left: 4px solid #1a365d;
            }
            
            .degree {
                font-weight: 700;
                color: #1a365d;
                font-size: 16px;
                margin-bottom: 6px;
            }
            
            .institution {
                color: #718096;
                font-size: 14px;
                font-weight: 600;
            }
            
            /* Executive Skills Columns */
            .executive-skills {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 25px;
                margin-top: 20px;
            }
            
            .skill-category {
                background: rgba(26, 54, 93, 0.05);
                border: 1px solid rgba(26, 54, 93, 0.1);
                border-radius: 8px;
                padding: 15px;
                transition: all 0.3s ease;
            }
            
            .skill-category:hover {
                background: rgba(26, 54, 93, 0.08);
                border-color: rgba(26, 54, 93, 0.2);
                transform: translateY(-1px);
            }
            
            .skill-category-title {
                font-weight: 700;
                color: #1a365d;
                font-size: 13px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-align: center;
                border-bottom: 2px solid #f6ad55;
                padding-bottom: 8px;
            }
            
            .skills-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .skill-tag {
                background: white;
                color: #1a365d;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                border: 1px solid rgba(246, 173, 85, 0.3);
                text-align: center;
                transition: all 0.2s ease;
            }
            
            .skill-tag:hover {
                border-color: #f6ad55;
                background: rgba(246, 173, 85, 0.05);
            }
            
            .language-item-column {
                background: white;
                color: #1a365d;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                border: 1px solid rgba(246, 173, 85, 0.3);
                text-align: center;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .language-level {
                background: linear-gradient(45deg, #f6ad55, #ed8936);
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
            }
            
            /* Languages */
            .language-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: white;
                padding: 8px 12px;
                border-radius: 6px;
                margin: 4px 0;
                border: 1px solid #e2e8f0;
            }
            
            .language-name {
                font-weight: 600;
                color: #1a365d;
            }
            
            .language-level {
                background: linear-gradient(45deg, #f6ad55, #ed8936);
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
            }
            
            /* Footer */
            .executive-footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 25px;
                border-top: 1px solid #e2e8f0;
            }
            
            .references-note {
                color: #718096;
                font-size: 13px;
                font-style: italic;
                font-weight: 500;
            }
            
            /* Decorative Elements */
            .decorative-accent {
                position: absolute;
                right: 40px;
                top: 200px;
                width: 8px;
                height: 40px;
                background: linear-gradient(180deg, #f6ad55, #ed8936);
                border-radius: 4px;
                opacity: 0.3;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Executive Header -->
            <div class="executive-header">
                <!-- Profile Photo (conditional) -->
                ${includePhoto ? `
                <img src="${cvData.personalInfo.profilePhotoUrl}" alt="Profilbild" class="profile-photo" />
                ` : ''}
                
                <!-- Name and Summary Area -->
                <div class="name-title-area">
                    <h1 class="executive-name">${cvData.personalInfo.fullName}</h1>
                    ${cvData.summary ? `<div class="executive-summary-brief">${cvData.summary}</div>` : ''}
                </div>
                
                <!-- Contact & LinkedIn Area (conditional LinkedIn) -->
                ${(cvData.personalInfo.email || cvData.personalInfo.phone || cvData.personalInfo.address || includeLinkedIn) ? `
                <div class="contact-linkedin-area">
                    ${cvData.personalInfo.email ? `<div class="contact-item">${cvData.personalInfo.email}</div>` : ''}
                    ${cvData.personalInfo.phone ? `<div class="contact-item">${cvData.personalInfo.phone}</div>` : ''}
                    ${cvData.personalInfo.address ? `<div class="contact-item">${formatSwedishAddress(cvData.personalInfo.address)}</div>` : ''}
                    
                    ${includeLinkedIn ? `
                    <a href="${cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin}" class="linkedin-link" target="_blank">
                        <svg class="linkedin-icon" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn Profil
                    </a>
                    ` : ''}
                </div>
                ` : ''}
                
                <!-- Gold Accent -->
                <div class="gold-accent"></div>
            </div>
            
            <!-- Main Content -->
            <div class="main-content">
                <!-- Decorative Accent -->
                <div class="decorative-accent"></div>
                
                
                ${cvData.experience.length > 0 ? `
                <!-- Professional Experience -->
                <div class="section">
                    <div class="section-header">Arbetslivserfarenhet</div>
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
                            ${exp.description?.map(desc => `<div class="job-description">• ${desc}</div>`).join('') || ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                <!-- Education -->
                <div class="section">
                    <div class="section-header">Utbildning</div>
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
                
                ${cvData.skills.length > 0 || shouldShowSection('languages', cvData) ? `
                <!-- Executive Skills & Languages Columns -->
                <div class="section">
                    <div class="section-header">Kompetenser</div>
                    <div class="section-separator"></div>
                    <div class="executive-skills">
                        <!-- Technical Skills Column -->
                        <div class="skill-category">
                            <div class="skill-category-title">TEKNISKA FÄRDIGHETER</div>
                            <div class="skills-list">
                                ${cvData.skills
                                    .filter(skillGroup => 
                                        skillGroup.category.toLowerCase().includes('teknisk') || 
                                        skillGroup.category.toLowerCase().includes('technical') ||
                                        skillGroup.category.toLowerCase().includes('programm') ||
                                        skillGroup.category.toLowerCase().includes('system') ||
                                        skillGroup.category.toLowerCase().includes('verktyg') ||
                                        skillGroup.category.toLowerCase().includes('tool')
                                    )
                                    .flatMap(skillGroup => skillGroup.skills)
                                    .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                                    .slice(0, 8)
                                    .map(skill => `<span class="skill-tag">${skill}</span>`)
                                    .join('')}
                                ${cvData.skills
                                    .filter(skillGroup => 
                                        !skillGroup.category.toLowerCase().includes('teknisk') && 
                                        !skillGroup.category.toLowerCase().includes('technical') &&
                                        !skillGroup.category.toLowerCase().includes('programm') &&
                                        !skillGroup.category.toLowerCase().includes('system') &&
                                        !skillGroup.category.toLowerCase().includes('verktyg') &&
                                        !skillGroup.category.toLowerCase().includes('tool') &&
                                        !skillGroup.category.toLowerCase().includes('mjuk') &&
                                        !skillGroup.category.toLowerCase().includes('soft') &&
                                        !skillGroup.category.toLowerCase().includes('personal')
                                    )
                                    .flatMap(skillGroup => skillGroup.skills)
                                    .filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase())))
                                    .slice(0, 6)
                                    .map(skill => `<span class="skill-tag">${skill}</span>`)
                                    .join('')}
                            </div>
                        </div>
                        
                        <!-- Soft Skills Column -->
                        <div class="skill-category">
                            <div class="skill-category-title">MJUKA FÄRDIGHETER</div>
                            <div class="skills-list">
                                ${cvData.skills
                                    .filter(skillGroup => 
                                        skillGroup.category.toLowerCase().includes('mjuk') || 
                                        skillGroup.category.toLowerCase().includes('soft') ||
                                        skillGroup.category.toLowerCase().includes('personal') ||
                                        skillGroup.category.toLowerCase().includes('social') ||
                                        skillGroup.category.toLowerCase().includes('ledarskap') ||
                                        skillGroup.category.toLowerCase().includes('kommunikation')
                                    )
                                    .flatMap(skillGroup => skillGroup.skills)
                                    .slice(0, 8)
                                    .map(skill => `<span class="skill-tag">${skill}</span>`)
                                    .join('')}
                                ${cvData.skills.length === 0 || cvData.skills.every(skillGroup => 
                                    !skillGroup.category.toLowerCase().includes('mjuk') && 
                                    !skillGroup.category.toLowerCase().includes('soft') &&
                                    !skillGroup.category.toLowerCase().includes('personal')
                                ) ? 
                                    ['Problemlösning', 'Teamarbete', 'Kommunikation', 'Ledarskap', 'Analytiskt tänkande', 'Kreativitet']
                                        .map(skill => `<span class="skill-tag">${skill}</span>`)
                                        .join('') : ''}
                            </div>
                        </div>
                        
                        <!-- Languages Column -->
                        <div class="skill-category">
                            <div class="skill-category-title">SPRÅK</div>
                            <div class="skills-list">
                                ${cvData.languages?.map(lang => `
                                    <div class="language-item-column">
                                        <span class="language-name">${lang.language}</span>
                                        <span class="language-level">${lang.proficiency}</span>
                                    </div>
                                `).join('') || 
                                    `<div class="language-item-column">
                                        <span class="language-name">Svenska</span>
                                        <span class="language-level">Modersmål</span>
                                    </div>`}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Footer -->
                <div class="executive-footer">
                    <div class="references-note">Referenser lämnas på begäran</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const platinumExecutiveTemplate: CVTemplateGenerator = {
  templateId: 'platinum-executive',
  generate: (cvData: CVMetadata, options?: any) => generatePlatinumExecutiveHTML(cvData, options),
  metadata: {
    name: 'Platinum Executive',
    description: 'Premium executive mall med profilbild och LinkedIn integration',
    category: 'traditional',
    tier: 'premium'
  }
};