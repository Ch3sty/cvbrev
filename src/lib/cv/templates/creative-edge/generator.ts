import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { formatSwedishAddress } from '../base/address-formatter';
import type { CVTemplateGenerator } from '../base/template-base';

function generateCreativeEdgeHTML(cvData: CVMetadata, options: any = {}): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 0; 
                color: #333; 
                background: white;
                font-size: 14px;
                line-height: 1.4;
            }
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: white;
                position: relative;
                padding: 0;
            }
            
            /* Creative header med angled design.
               Flexibel layout - headern vaxer naturligt med innehallet.
               Clip-pathen ar procentbaserad (klipper 20% av hogerkanten)
               sa den foljer headerns faktiska hojd.
               Padding-bottom 60px ger sakerhets-zon mot clip-pathens
               diagonala kant oavsett om headern ar 150px eller 350px hog.
               Inget line-clamp - all text visas i sin helhet. */
            .header {
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                position: relative;
                clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
                padding: 35px 30px 60px 30px;
                box-sizing: border-box;
                overflow: hidden;
            }

            .header h1 {
                color: white;
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                overflow-wrap: break-word;
                word-wrap: break-word;
                max-width: 100%;
            }

            .header .title {
                color: rgba(255,255,255,0.9);
                font-size: 16px;
                padding: 12px 0;
                margin: 5px 0;
                line-height: 1.5;
                overflow-wrap: break-word;
                word-wrap: break-word;
                max-width: 100%;
            }

            .header .contact {
                color: rgba(255,255,255,0.8);
                font-size: 14px;
                margin: 3px 0;
                overflow-wrap: break-word;
                word-wrap: break-word;
                max-width: 100%;
            }
            
            /* Main content area */
            .content {
                padding: 40px 30px 30px;
            }
            
            /* Section styling med kreativa accenter */
            .section {
                margin-bottom: 30px;
                position: relative;
            }
            
            .section h2 {
                color: #7c3aed;
                font-size: 18px;
                font-weight: bold;
                margin: 0 0 15px 0;
                padding-left: 20px;
                position: relative;
            }
            
            /* Creative accent bars */
            .section h2:before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 5px;
                height: 30px;
                background: linear-gradient(135deg, #ec4899, #8b5cf6);
                border-radius: 2px;
            }
            
            .summary-section h2:before {
                height: 25px;
            }
            
            /* Experience med kreativa cirklar */
            .experience-section h2:before {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #ec4899;
                top: 2px;
                left: -8px;
            }
            
            /* Education med geometrisk accent */
            .education-section h2:before {
                width: 12px;
                height: 12px;
                background: #8b5cf6;
                border-radius: 2px;
                transform: rotate(45deg);
                top: 4px;
                left: -6px;
            }
            
            .section p {
                margin: 0 0 10px 20px;
                color: #374151;
                line-height: 1.5;
            }
            
            /* Experience items */
            .experience-item {
                margin: 20px 0 25px 20px;
                padding-bottom: 15px;
            }
            
            .job-title {
                font-weight: bold;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .company {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .description {
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.4;
                margin: 3px 0;
            }
            
            /* Education items */
            .education-item {
                margin: 15px 0 20px 20px;
            }
            
            .degree {
                font-weight: bold;
                color: #1e293b;
                font-size: 16px;
                margin-bottom: 5px;
            }
            
            .institution {
                color: #64748b;
                font-size: 14px;
            }
            
            /* Skills med kreativ layout */
            .skills-section .skills-container {
                margin-left: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .skill-tag {
                background: #f3e8ff;
                color: #7c3aed;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                border: 1px solid #e9d5ff;
            }
            
            /* Languages med elegant design */
            .languages-section .languages-container {
                margin-left: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .language-item {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 1px solid #e2e8f0;
                padding: 12px 16px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s ease;
            }
            
            .language-item:hover {
                border-color: #8b5cf6;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
            }
            
            .language-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 14px;
            }
            
            .language-level {
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            /* References */
            .references-section {
                margin-top: 40px;
                text-align: center;
            }
            
            .references-section p {
                color: #64748b;
                font-style: italic;
                margin-left: 0;
            }
            
            /* Creative decorative elements som matchar SVG */
            .decorative-circles {
                position: absolute;
                top: 240px;
                right: 30px;
                z-index: 1;
            }
            
            .circle-1 {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(252, 231, 243, 0.5);
                position: absolute;
                top: 0;
                right: 0;
            }
            
            .circle-2 {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(237, 233, 254, 0.7);
                position: absolute;
                top: 80px;
                right: 20px;
            }
        </style>
    </head>
    <body>
        <div class="cv-container">
            <!-- Creative header med angled design -->
            <div class="header">
                <h1>${cvData.personalInfo.fullName}</h1>
                ${cvData.summary ? `<div class="title">${cvData.summary}</div>` : ''}
                <div class="contact">
                    ${cvData.personalInfo.email || ''} ${cvData.personalInfo.phone ? '• ' + cvData.personalInfo.phone : ''}
                    ${cvData.personalInfo.address ? '<br>' + formatSwedishAddress(cvData.personalInfo.address) : ''}
                </div>
            </div>
            
            <!-- Decorative elements -->
            <div class="decorative-circles">
                <div class="circle-1"></div>
                <div class="circle-2"></div>
            </div>
            
            <div class="content">
                ${cvData.experience.length > 0 ? `
                <div class="section experience-section">
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
                            <div class="company">${exp.company} ${exp.startDate ? '• ' + exp.startDate : ''} ${exp.endDate ? '- ' + exp.endDate : exp.startDate ? '- Pågående' : ''}</div>
                            ${exp.description?.map(desc => `<div class="description">${desc}</div>`).join('') || ''}
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                <div class="section education-section">
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
                
                ${cvData.skills.length > 0 ? `
                <div class="section skills-section">
                    <h2>Kompetenser</h2>
                    <div class="skills-container">
                        ${cvData.skills.flatMap(skillGroup => 
                            skillGroup.skills.filter(skill => !cvData.languages?.some(lang => skill.toLowerCase().includes(lang.language.toLowerCase()))).map(skill => `<span class="skill-tag">${skill}</span>`)
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${shouldShowSection('languages', cvData) ? `
                <div class="section languages-section">
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
                
                <div class="section references-section">
                    <p>Referenser lämnas på begäran</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

export const creativeEdgeTemplate: CVTemplateGenerator = {
  templateId: 'creative-edge',
  generate: generateCreativeEdgeHTML,
  metadata: {
    name: 'Kreativ Profil',
    description: 'För kreativa yrken med subtil design-touch',
    category: 'creative',
    tier: 'premium'
  }
};