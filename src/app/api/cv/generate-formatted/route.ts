import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById } from '@/lib/cv/simple-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';
import { shouldShowSection } from '@/lib/cv/cv-metadata';
import { validateCVData } from '@/lib/openai/cv-parser-ai';
import { getTemplateGenerator } from '@/lib/cv/templates';
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { userHasPremiumAccess } from '@/lib/supabase/premiumAccess';

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
function generateTemplateHTML(cvData: CVMetadata, templateId: CVTemplateType, options: any = {}): string {
  // Se till att referenser alltid är standard svenska frasen
  const standardizedCVData = {
    ...cvData,
    references: 'Referenser lämnas på begäran'
  };

  // Use the new modular template system
  const templateGenerator = getTemplateGenerator(templateId);
  if (templateGenerator) {
    return templateGenerator.generate(standardizedCVData, options);
  }

  // Fallback to default template if template not found
  return generateDefaultHTML(standardizedCVData);
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

// Modern Minimal HTML-template som matchar SVG-förhandsgranskningen
function generateModernMinimalHTML(cvData: CVMetadata): string {
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

// Classic Professional HTML-template som matchar SVG-förhandsgranskningen
function generateClassicProfessionalHTML(cvData: CVMetadata): string {
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
                padding: 20px;
                position: relative;
            }
            
            /* Header Section */
            .header {
                background: #f8fafc;
                padding: 20px;
                margin-bottom: 25px;
                border-radius: 6px;
            }
            
            .header h1 {
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 8px;
            }
            
            .header .contact {
                color: #64748b;
                font-size: 13px;
                line-height: 1.4;
                margin-bottom: 5px;
            }
            
            .header .summary {
                color: #64748b;
                font-size: 13px;
                line-height: 1.6;
                margin-top: 8px;
            }
            
            /* Section Styling */
            .section {
                margin-bottom: 30px;
            }
            
            .section h2 {
                color: #2563eb;
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .section-separator {
                width: 100%;
                height: 1px;
                background: #e2e8f0;
                margin-bottom: 15px;
            }
            
            /* Experience Items */
            .experience-item {
                margin-bottom: 20px;
                padding-bottom: 15px;
            }
            
            .experience-item:not(:last-child) {
                border-bottom: 1px solid #f1f5f9;
            }
            
            .job-title {
                font-weight: 700;
                color: #1e293b;
                font-size: 14px;
                margin-bottom: 3px;
            }
            
            .company-info {
                color: #64748b;
                font-size: 13px;
                margin-bottom: 6px;
                font-weight: 500;
            }
            
            .job-description {
                color: #9ca3af;
                font-size: 12px;
                line-height: 1.5;
                margin: 1px 0;
            }
            
            /* Education Items */
            .education-item {
                margin-bottom: 15px;
            }
            
            .education-item:last-child {
                margin-bottom: 0;
            }
            
            .degree {
                font-weight: 700;
                color: #1e293b;
                font-size: 14px;
                margin-bottom: 3px;
            }
            
            .institution {
                color: #64748b;
                font-size: 13px;
                font-weight: 500;
            }
            
            /* Skills */
            .skills-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            
            .skill-tag {
                background: #dbeafe;
                border: 1px solid #bfdbfe;
                color: #1e40af;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }
            
            /* Languages */
            .languages-container {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .language-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
            }
            
            .language-name {
                font-weight: 600;
                color: #1e293b;
                font-size: 13px;
            }
            
            .language-level {
                background: #2563eb;
                color: white;
                padding: 1px 6px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 600;
            }
            
            /* References */
            .references-section {
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
                margin-top: 30px;
                text-align: center;
            }
            
            .references-section p {
                color: #9ca3af;
                font-size: 12px;
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
            
            <!-- Referenser -->
            <div class="references-section">
                <p>Referenser lämnas på begäran</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Executive Premium HTML-template som matchar SVG-förhandsgranskningen
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
    // Noll marginal: mallarna är full-bleed helsideslayouter (210mm × 297mm)
    // som äger sin egen inre marginal. Se swedish-cv-pdf-generator.ts.
    margins: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
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
      await page.evaluateHandle('document.fonts.ready').catch(() => {});

      // Samma fragmenteringssäkring som huvudgeneratorn, så även reservvägen
      // aldrig lämnar headern ensam på sida 1.
      await page.addStyleTag({
        content: `
          @page { margin: 0; size: A4; }
          @media print {
            .cv-container, .cv-wrapper, .resume, .page { min-height: 0 !important; height: auto !important; }
            .experience-item, .education-item, .cv-section, .section { break-inside: avoid; page-break-inside: avoid; }
            header, .header, .photo-banner, .cv-header { break-after: avoid; page-break-after: avoid; }
            * { -webkit-print-color-adjust: exact !important; }
          }
        `,
      });

      // Fit-to-page: skala ned om innehållet är marginellt för högt (samma
      // logik som huvudgeneratorn), annars flera sidor med brytning i botten.
      let scale = 1;
      try {
        const contentPx: number = await page.evaluate(() => {
          let max = 0;
          for (const sel of ['.cv-container', '.cv-wrapper', '.resume', '.page']) {
            document.querySelectorAll(sel).forEach((el) => {
              max = Math.max(max, (el as HTMLElement).offsetHeight);
            });
          }
          return max || document.body.scrollHeight;
        });
        const ratio = contentPx / 1123;
        // Skala ned för att bevara tvåkolumns-designen (gridet kan inte delas),
        // golv 0.80. Samma logik som huvudgeneratorns computeFitToPageScale.
        if (ratio > 1 && ratio <= 1.25) scale = Math.max(0.80, (1 / ratio) * 0.99);
      } catch { /* behåll scale 1 */ }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        // Noll marginal, samma skäl som huvudgeneratorn: mallen är full-bleed.
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        // preferCSSPageSize inte true: den skulle få Chromium att ignorera scale.
        preferCSSPageSize: false,
        scale,
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
    const { template, cvText, structuredData, format = 'pdf', colorScheme = 'blue', templateOptions = {}, fontFamily } = await request.json();

    // DEBUG: Log what the API receives
    console.log('🔍 DEBUG - generate-formatted API: Mottagen data:', {
      template,
      hasStructuredData: !!structuredData,
      cvTextLength: cvText?.length || 0,
      cvTextPreview: cvText?.substring(0, 200) + '...',
      format,
      hasTemplateOptions: Object.keys(templateOptions).length > 0
    });

    // DEFENSIV VALIDERING: Kontrollera att vi har giltiga data
    if (!template || (!cvText && !structuredData)) {
      console.error('❌ DEBUG - Missing required data:', {
        template: !!template,
        cvText: !!cvText,
        structuredData: !!structuredData,
        templateValue: template,
        cvTextLength: cvText?.length || 0
      });
      return NextResponse.json(
        { error: 'Template och antingen CV-text eller strukturerad data krävs' },
        { status: 400 }
      );
    }

    // Extra validering för CV-text kvalitet (om text används)
    if (cvText && cvText.trim().length < 50) {
      console.error('❌ DEBUG - CV-text för kort:', cvText.length, 'tecken');
      return NextResponse.json(
        { error: 'CV-text är för kort eller tom' },
        { status: 400 }
      );
    }
    
    // Get user profile data for photo and LinkedIn.
    // Användar-id hissas ut ur try-blocket så vi kan premium-validera mallen
    // serverside nedan (klientens egen kontroll går att kringgå).
    let userProfile = null;
    let authedUserId: string | null = null;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
        },
      }
    );
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authedUserId = user.id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_photo_url, linkedin_url, full_name, email, phone, location')
          .eq('id', user.id)
          .single();

        userProfile = profile;
      }
    } catch (error) {
      console.log('Could not fetch user profile data:', error);
      // Continue without profile data - not critical for CV generation
    }

    // Kontrollera att mallen finns
    const selectedTemplate = getTemplateById(template);
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: 'Mall hittades inte' },
        { status: 400 }
      );
    }

    // Serverside-gating: premium-mallar får bara exporteras av konton med
    // premium-åtkomst (manuell premium, Stripe-prenumeration eller admin).
    if (selectedTemplate.tier === 'premium') {
      if (!authedUserId) {
        return NextResponse.json(
          { error: 'Logga in för att exportera den här mallen.' },
          { status: 401 }
        );
      }
      const hasPremium = await userHasPremiumAccess(supabase, authedUserId);
      if (!hasPremium) {
        return NextResponse.json(
          { error: 'Den här mallen ingår i Premium. Uppgradera för att exportera den.' },
          { status: 403 }
        );
      }
    }

    // Use structured data if available and valid, otherwise parse from text.
    // Aldre CV:n kan vara sparade i ParsedCV-format - normaliseraren
    // hanterar bada formaten och returnerar null om strukturen ar trasig.
    let extractedCVData: CVMetadata | null = null;
    if (structuredData) {
      extractedCVData = normalizeStructuredData(structuredData);
      if (extractedCVData) {
        console.log('✅ Använder strukturerad CV-data direkt (högsta kvalitet)');
      } else {
        console.log('⚠️ structured_data var ogiltig - faller tillbaka till text-parser');
      }
    }
    if (!extractedCVData) {
      console.log('⚠️ Fallback: Extraherar svenskt CV-innehåll från text...');
      extractedCVData = await extractSwedishCVContent(cvText);
    }

    // Enhance CV data with user profile information
    if (userProfile) {
      if (userProfile.profile_photo_url) {
        extractedCVData.personalInfo.profilePhotoUrl = userProfile.profile_photo_url;
      }
      if (userProfile.linkedin_url) {
        // Use profile LinkedIn URL if not already present in CV text
        if (!extractedCVData.personalInfo.linkedIn && !extractedCVData.personalInfo.linkedin) {
          extractedCVData.personalInfo.linkedin = userProfile.linkedin_url;
        }
      }
      // Always override contact details with real profile values (cv_text may contain [EMAIL]/[TEL] placeholders)
      if (userProfile.full_name) extractedCVData.personalInfo.fullName = userProfile.full_name;
      if (userProfile.email) extractedCVData.personalInfo.email = userProfile.email;
      if (userProfile.phone) extractedCVData.personalInfo.phone = userProfile.phone;
      if (userProfile.location) extractedCVData.personalInfo.address = userProfile.location;
    }
    
    // Generera template-specifik HTML baserat på vald mall
    let html = generateTemplateHTML(extractedCVData, template as CVTemplateType, templateOptions);

    // Applicera anvandarvalt typsnitt om sant. Same teknik som preview pa
    // klientsidan: injecta CSS-override direkt efter <style>-taggen sa den
    // vinner specificity-striden mot mallens default-typsnitt.
    if (fontFamily && typeof fontFamily === 'string') {
      html = html.replace(
        /<style>/,
        `<style>\n  body, body * { font-family: ${fontFamily} !important; }\n  `
      );
    }
    
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

    // Track onboarding progress for CV template download
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get: (name: string) => cookieStore.get(name)?.value,
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Record download in formatted_cv_downloads table
        await supabase.from('formatted_cv_downloads').insert({
          user_id: user.id,
          template_id: template,
          downloaded_at: new Date().toISOString()
        });

        // Update onboarding progress
        const { error: onboardingError } = await supabase.rpc('update_onboarding_progress', {
          user_id: user.id,
          step_name: 'download_cv_template'
        });
        if (onboardingError) {
          console.error('Failed to update onboarding progress:', onboardingError.message);
        }
      }
    } catch (trackingError) {
      console.error('Failed to track download/onboarding:', trackingError);
      // Don't fail the CV generation if tracking fails
    }

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