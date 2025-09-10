import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById } from '@/lib/cv/simple-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { validateCVData } from '@/lib/openai/cv-parser-ai';

// Svensk kommun-till-region mapping för CV-vänliga adresser
const SWEDISH_MUNICIPALITY_MAPPING: { [key: string]: string } = {
  // Stockholm län
  'huddinge': 'Stockholm',
  'stockholm': 'Stockholm', 
  'södermalm': 'Stockholm',
  'norrmalm': 'Stockholm',
  'östermalm': 'Stockholm',
  'vasastan': 'Stockholm',
  'solna': 'Stockholm',
  'sundbyberg': 'Stockholm',
  'nacka': 'Stockholm',
  'danderyd': 'Stockholm',
  'täby': 'Stockholm',
  'lidingö': 'Stockholm',
  'värmdö': 'Stockholm',
  'tyresö': 'Stockholm',
  'haninge': 'Stockholm',
  'botkyrka': 'Stockholm',
  'salem': 'Stockholm',
  'ekerö': 'Stockholm',
  'upplands väsby': 'Stockholm',
  'vallentuna': 'Stockholm',
  'järfälla': 'Stockholm',
  'norrtälje': 'Stockholm',
  
  // Göteborg
  'göteborg': 'Göteborg',
  'partille': 'Göteborg', 
  'mölndal': 'Göteborg',
  'lerum': 'Göteborg',
  'alingsås': 'Göteborg',
  'kungsbacka': 'Göteborg',
  
  // Malmö
  'malmö': 'Malmö',
  'lund': 'Malmö',
  'helsingborg': 'Malmö',
  'landskrona': 'Malmö',
  'trelleborg': 'Malmö',
  'vellinge': 'Malmö',
  'svedala': 'Malmö',
  'staffanstorp': 'Malmö',
  
  // Uppsala
  'uppsala': 'Uppsala',
  'enköping': 'Uppsala',
  'håbo': 'Uppsala',
  'knivsta': 'Uppsala',
  'tierp': 'Uppsala',
  
  // Övriga större städer/regioner  
  'västerås': 'Västerås',
  'örebro': 'Örebro',
  'linköping': 'Linköping',
  'helsingborg': 'Helsingborg',
  'jönköping': 'Jönköping',
  'norrköping': 'Norrköping',
  'luleå': 'Luleå',
  'umeå': 'Umeå',
  'gävle': 'Gävle',
  'borås': 'Borås',
  'eskilstuna': 'Eskilstuna',
  'sundsvall': 'Sundsvall',
  'halmstad': 'Halmstad',
  'växjö': 'Växjö',
  'karlstad': 'Karlstad',
  'kristianstad': 'Kristianstad'
};

/**
 * Formaterar svensk adress för CV - tar bort gatuadress och konverterar kommun till större stad/region
 */
function formatSwedishAddress(address: string): string {
  if (!address) return '';
  
  // Ta bort extra whitespace
  address = address.trim();
  
  // Regex för att hitta postnummer (5 siffror) + kommun
  const postalCodeMatch = address.match(/(\d{3}\s?\d{2})\s+(.+?)(?:,|$)/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1].replace(/(\d{3})(\d{2})/, '$1 $2'); // Formatera med mellanslag
    const municipality = postalCodeMatch[2].toLowerCase().trim();
    
    // Hitta rätt stad/region för kommunen
    const city = SWEDISH_MUNICIPALITY_MAPPING[municipality] || 
                 municipality.charAt(0).toUpperCase() + municipality.slice(1);
    
    return `${postalCode} ${city}, Sverige`;
  }
  
  // Om ingen postkod hittades, kolla om det bara är ett ortsnamn
  const lowerAddress = address.toLowerCase();
  for (const [municipality, city] of Object.entries(SWEDISH_MUNICIPALITY_MAPPING)) {
    if (lowerAddress.includes(municipality)) {
      return `${city}, Sverige`;
    }
  }
  
  // Fallback - returnera originaladress med Sverige tillagt om den inte redan finns
  return address.includes('Sverige') ? address : `${address}, Sverige`;
}
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import { generateSwedishCVPDF, SwedishCVPDFOptions } from '@/lib/cv/swedish-cv-pdf-generator';
import { 
  parseCVWithAIServerSide,
  extractBasicPersonalInfo,
  extractBasicSummary,
  extractBasicExperience,
  extractBasicEducation,
  extractBasicSkills,
  extractBasicLanguages
} from '../parse/route';

// Generera template-specifik HTML baserat på vald mall
function generateTemplateHTML(cvData: CVMetadata, templateId: CVTemplateType): string {
  // Se till att referenser alltid är standard svenska frasen
  const standardizedCVData = {
    ...cvData,
    references: 'Referenser lämnas på begäran'
  };

  switch (templateId) {
    case 'creative-edge':
      return generateCreativeEdgeHTML(standardizedCVData);
    case 'clean-corporate':
      return generateCleanCorporateHTML(standardizedCVData);
    default:
      return generateDefaultHTML(standardizedCVData);
  }
}

// Creative Edge HTML-template som matchar SVG-förhandsgranskningen exakt
function generateCreativeEdgeHTML(cvData: CVMetadata): string {
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
            
            /* Creative header med angled design som matchar SVG */
            .header {
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                height: 200px;
                position: relative;
                clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
                padding: 35px 30px 40px 30px;
                box-sizing: border-box;
            }
            
            .header h1 {
                color: white;
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header .title {
                color: rgba(255,255,255,0.9);
                font-size: 16px;
                margin: 5px 0;
            }
            
            .header .contact {
                color: rgba(255,255,255,0.8);
                font-size: 14px;
                margin: 3px 0;
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
                            ${exp.description.map(desc => `<div class="description">${desc}</div>`).join('')}
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
                            skillGroup.skills.map(skill => `<span class="skill-tag">${skill}</span>`)
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
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="section references-section">
                    <p>${cvData.references}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Clean Corporate HTML-template som matchar SVG-förhandsgranskningen exakt
function generateCleanCorporateHTML(cvData: CVMetadata): string {
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
                width: 160px;
                background: #1e293b;
                padding: 25px 22px;
                box-sizing: border-box;
                color: white;
                position: relative;
            }
            
            .sidebar::after {
                content: '';
                position: absolute;
                right: -3px;
                top: 0;
                bottom: 0;
                width: 3px;
                background: #f59e0b;
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
            }
            
            .header .title {
                color: #64748b;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 12px;
            }
            
            .header .summary {
                color: #374151;
                font-size: 14px;
                line-height: 1.6;
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
                    skillGroup.skills.map(skill => `<div class="skill-item">${skill}</div>`)
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
                    ${cvData.personalInfo.title ? `<div class="title">${cvData.personalInfo.title}</div>` : ''}
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
                            ${exp.description.map(desc => `<div class="job-description">${desc}</div>`).join('')}
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
            </div>
        </div>
    </body>
    </html>
  `;
}

// Default/fallback HTML-template
function generateDefaultHTML(cvData: CVMetadata): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
            h1 { color: #1e40af; margin-bottom: 10px; }
            h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 25px; }
            .contact-info { margin-bottom: 20px; color: #666; }
            .section { margin-bottom: 25px; }
            .experience-item, .education-item { margin-bottom: 15px; }
            .job-title { font-weight: bold; color: #1e40af; }
            .company { color: #666; margin-bottom: 5px; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-item { background: #f3f4f6; padding: 5px 10px; border-radius: 5px; font-size: 14px; }
        </style>
    </head>
    <body>
        <h1>${cvData.personalInfo.fullName}</h1>
        <div class="contact-info">
            ${cvData.personalInfo.email && `📧 ${cvData.personalInfo.email}`}
            ${cvData.personalInfo.phone && `📱 ${cvData.personalInfo.phone}`}
        </div>
        
        ${cvData.summary ? `
        <div class="section">
            <h2>Professionell sammanfattning</h2>
            <p>${cvData.summary}</p>
        </div>
        ` : ''}
        
        ${cvData.experience.length > 0 ? `
        <div class="section">
            <h2>Arbetslivserfarenhet</h2>
            ${cvData.experience.map(exp => `
                <div class="experience-item">
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                    ${exp.description.map(desc => `<p>${desc}</p>`).join('')}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${cvData.education.length > 0 ? `
        <div class="section">
            <h2>Utbildning</h2>
            ${cvData.education.map(edu => `
                <div class="education-item">
                    <div class="job-title">${edu.degree}</div>
                    <div class="company">${edu.institution}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${cvData.skills.length > 0 ? `
        <div class="section">
            <h2>Kompetenser</h2>
            ${cvData.skills.map(skillGroup => `
                <h3>${skillGroup.category}</h3>
                <div class="skills-list">
                    ${skillGroup.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
            <p style="text-align: center; color: #666; font-style: italic;">${cvData.references}</p>
        </div>
    </body>
    </html>
  `;
}

// Svenska CV PDF-generering med premium kvalitet
async function createSwedishCVPDF(html: string, cvData: CVMetadata, templateId: CVTemplateType): Promise<Buffer> {
  console.log(`Generating Swedish CV PDF with template: ${templateId}`);
  
  const swedishPDFOptions: SwedishCVPDFOptions = {
    template: templateId,
    format: 'A4',
    margins: {
      top: '20mm',
      right: '15mm', 
      bottom: '20mm',
      left: '15mm'
    },
    colorScheme: 'navy', // Default till navy färgschema
    swedishSettings: {
      dateFormat: 'YYYY-MM',
      phoneFormat: 'international',
      pageLimit: 2, // Arbetsförmedlingens rekommendation
      includePhoto: false
    }
  };
  
  try {
    return await generateSwedishCVPDF(html, cvData, swedishPDFOptions);
  } catch (error) {
    console.error('Swedish CV PDF generation failed, using fallback:', error);
    
    // Fallback till enklare PDF-generering
    return await createBasicCVPDF(html);
  }
}

// Fallback PDF-generering (enklare version)
async function createBasicCVPDF(html: string): Promise<Buffer> {
  try {
    console.log('Using basic PDF generation fallback');
    
    const puppeteer = await import('puppeteer');
    const puppeteerModule = puppeteer.default || puppeteer;
    
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
    
    const launchOptions: any = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    if (isServerless) {
      try {
        const chromium = await import('@sparticuz/chromium');
        launchOptions.executablePath = await chromium.default.executablePath();
        launchOptions.args = [
          ...launchOptions.args,
          ...chromium.default.args
        ];
      } catch (error) {
        console.warn('Sparticuz Chromium not available, falling back');
      }
    }
    
    const browser = await puppeteerModule.launch(launchOptions);
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width: 794, height: 1123 }); // A4
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (error) {
    console.error('Basic CV PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


// Svenska CV-innehåll extraction med förbättrad parsing
async function extractSwedishCVContent(rawText: string): Promise<CVMetadata> {
  console.log('Använder förbättrad svensk CV-parsing...');
  
  try {
    // Försök med svenska AI-driven parsing först
    console.log('Försöker med AI-driven CV-parsing...');
    const aiResult = await parseCVWithAIServerSide(rawText);
    
    // Logga metadata för insikter
    console.log('AI CV Parsing SUCCESS - metadata:', {
      model: aiResult.metadata.model,
      cost: aiResult.metadata.cost,
      processingTime: aiResult.metadata.processingTime,
      detectedIndustry: aiResult.metadata.detectedIndustry,
      confidenceScore: aiResult.metadata.confidenceScore,
      tokensUsed: aiResult.metadata.tokens
    });
    
    // Validera och returnera strukturerad data
    return validateCVData(aiResult.cvData);
    
  } catch (error) {
    console.error('AI CV-parsing misslyckades, använder svenska fallback:', error);
    
    // Fallback till avancerad svensk regex-baserad parsing
    return await parseSwedishCVContent(rawText);
  }
}

// Förbättrad fallback som använder server-side extraktionsfunktioner
async function extractCVContentFallback(rawText: string): Promise<CVMetadata> {
  console.log('Använder förbättrad fallback-parsing...');
  
  return {
    personalInfo: extractBasicPersonalInfo(rawText),
    summary: extractBasicSummary(rawText),
    experience: extractBasicExperience(rawText),
    education: extractBasicEducation(rawText),
    skills: extractBasicSkills(rawText),
    projects: [],
    certifications: [],
    languages: extractBasicLanguages(rawText),
    interests: [],
    references: ''
  };
}

// Gammal fallback-logik (behållen som backup)
async function extractCVContentOldFallback(rawText: string): Promise<CVMetadata> {
  console.log('Använder gammal fallback regex-baserad parsing...');
  
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const extractPersonalInfo = () => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+46|0)[\s-]?[\d\s-]{8,}/;
    
    const email = rawText.match(emailRegex)?.[0] || '';
    const phone = rawText.match(phoneRegex)?.[0] || '';
    
    const nameCandidate = lines.find(line => 
      line.trim().length > 5 && 
      !line.includes('@') && 
      !line.match(/^\d/) &&
      line.split(' ').length >= 2
    ) || '';
    
    return {
      fullName: nameCandidate,
      email,
      phone: phone?.replace(/\s/g, ''),
      address: '',
      linkedIn: '',
      website: '',
      github: ''
    };
  };
  
  const extractExperience = () => {
    const experienceKeywords = ['arbetslivserfarenhet', 'experience', 'anställning', 'tjänst', 'position'];
    const experiences = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (experienceKeywords.some(keyword => line.includes(keyword))) {
        for (let j = i + 1; j < lines.length; j++) {
          const expLine = lines[j];
          if (expLine.includes(' - ') && expLine.length > 10) {
            const parts = expLine.split(' - ');
            if (parts.length >= 2) {
              experiences.push({
                position: parts[0].trim(),
                company: parts[1].trim(),
                location: '',
                startDate: '2020-01-01',
                description: [`Arbetade som ${parts[0].toLowerCase()}`],
                achievements: []
              });
            }
          }
        }
        break;
      }
    }
    
    return experiences; // Return only actual experiences found
  };
  
  const extractEducation = () => {
    const educationKeywords = ['utbildning', 'education', 'examen', 'universitet', 'högskola'];
    const education = [];
    
    for (const line of lines) {
      if (educationKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        if (line.includes(' - ')) {
          const parts = line.split(' - ');
          education.push({
            degree: parts[0].trim(),
            institution: parts[1]?.trim() || 'Utbildningsinstitution',
            location: '',
            graduationYear: '2020'
          });
        }
      }
    }
    
    return education; // Return only actual education found
  };
  
  const extractSkills = () => {
    const skillsKeywords = ['kompetenser', 'skills', 'färdigheter', 'kunskaper'];
    const skills = [];
    
    for (const line of lines) {
      if (skillsKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        const skillsText = line.replace(/kompetenser:|skills:|färdigheter:|kunskaper:/gi, '').trim();
        if (skillsText) {
          const skillArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
          if (skillArray.length > 0) {
            skills.push({
              category: 'Tekniska färdigheter',
              skills: skillArray
            });
          }
        }
      }
    }
    
    return skills; // Return only actual skills found
  };
  
  return {
    personalInfo: extractPersonalInfo(),
    summary: '',
    experience: extractExperience(),
    education: extractEducation(),
    skills: extractSkills(),
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    references: 'Referenser lämnas på begäran'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { template, cvText, format = 'pdf', colorScheme = 'blue' } = await request.json();
    
    if (!template || !cvText) {
      return NextResponse.json(
        { error: 'Template och CV-text krävs' },
        { status: 400 }
      );
    }
    
    // Kontrollera att mallen finns
    const selectedTemplate = getTemplateById(template);
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: 'Mall hittades inte' },
        { status: 400 }
      );
    }
    
    // Extrahera CV-innehåll med förbättrad svensk parsing
    console.log('Extraherar svenskt CV-innehåll...');
    const extractedCVData = await extractSwedishCVContent(cvText);
    
    // Generera template-specifik HTML baserat på vald mall
    const html = generateTemplateHTML(extractedCVData, template as CVTemplateType);
    
    // Generera PDF med svenska premium-kvalitet
    console.log('Genererar svenskt premium-CV PDF...');
    const pdfBuffer = await createSwedishCVPDF(html, extractedCVData, template as CVTemplateType);
    
    // Sanitera filnamn (ta bort svenska tecken för att undvika header-fel)
    const sanitizedTemplate = template
      .replace(/ö/g, 'o')
      .replace(/ä/g, 'a')
      .replace(/å/g, 'a')
      .replace(/[^a-zA-Z0-9-]/g, '-');
    
    const filename = `cv-${sanitizedTemplate}.pdf`;
    
    console.log('CV genererat framgångsrikt:', filename);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Fel vid CV-generering:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte generera CV',
        details: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
}