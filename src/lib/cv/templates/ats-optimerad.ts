import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { extractAchievements } from '../visual-elements';

export const atsOptimeradCVTemplate: CVTemplate = {
  id: 'ats-optimerad',
  name: 'ATS-Optimerad Premium',
  description: 'Premium ATS-kompatibel design som säkerställer maximal läsbarhet för både ATS-system och svenska rekryterare',
  category: 'ATS Excellence',
  bestFor: ['Stora företag', 'Multinationella', 'HR-system', 'Rekryteringsbyråer', 'Tech-företag', 'Automatisk screening'],
  features: ['100% ATS-kompatibel', 'Premium design', 'Keyword-optimerad', 'Svenska standarder', 'HR-vänlig'],
  colorSchemes: ['professional', 'corporate', 'trust', 'stability', 'success', 'premium'],
  previewImage: '/images/cv-templates/ats-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'ats-optimerad');
    const atsSchemes = {
      professional: { primary: '#1e40af', secondary: '#3b82f6', accent: '#eff6ff', light: '#f8fafc', text: '#1e293b', gold: '#d97706' },
      corporate: { primary: '#374151', secondary: '#6b7280', accent: '#f9fafb', light: '#f8fafc', text: '#111827', gold: '#f59e0b' },
      trust: { primary: '#0c4a6e', secondary: '#0ea5e9', accent: '#f0f9ff', light: '#f7fbff', text: '#1e293b', gold: '#d97706' },
      stability: { primary: '#166534', secondary: '#22c55e', accent: '#f0fdf4', light: '#f7fef7', text: '#1e293b', gold: '#f59e0b' },
      success: { primary: '#92400e', secondary: '#d97706', accent: '#fffbeb', light: '#fefcf9', text: '#1e293b', gold: '#059669' },
      premium: { primary: '#581c87', secondary: '#8b5cf6', accent: '#faf5ff', light: '#fdfbff', text: '#1e293b', gold: '#d97706' }
    };
    const colors = atsSchemes[options.colorScheme as keyof typeof atsSchemes] || atsSchemes.professional;
    
    // Generate dynamic headings and achievements - ATS-friendly extraction
    const achievements = extractAchievements(
      (cvData.experience || []).flatMap(exp => {
        const description = Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : []);
        return description.filter(Boolean);
      }).join(' ') + ' ' +
      (cvData.summary || '')
    );
    
    // Extract key skills for ATS keyword optimization
    const allSkills = (cvData.skills || []).flatMap(category => 
      category.skills ? category.skills : [category.category || '']
    ).filter(Boolean);
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName} - ${cvData.personalInfo.title || ''}</title>
        <meta name="description" content="Professionellt CV för ${cvData.personalInfo.fullName}, ${cvData.personalInfo.title || 'Yrkesperson'} med expertis inom ${allSkills.slice(0, 5).join(', ')}">
        <meta name="keywords" content="${allSkills.join(', ')}, ${cvData.personalInfo.fullName}, CV, Sverige, ${cvData.personalInfo.title || ''}">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap');
          
          /* PREMIUM ATS-COMPATIBLE TYPOGRAPHY SYSTEM */
          :root {
            --font-primary: 'Inter', 'Source Sans Pro', 'Open Sans', Arial, sans-serif;
            --font-fallback: Arial, Helvetica, sans-serif;
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            --line-height-tight: 1.2;
            --line-height-normal: 1.4;
            --line-height-relaxed: 1.6;
            --letter-spacing-normal: 0;
            --letter-spacing-wide: 0.025em;
          }
          
          @page {
            size: A4;
            margin: 2cm 1.8cm;
            @top-center {
              content: "${cvData.personalInfo.fullName} - ${cvData.personalInfo.title || 'Professionellt CV'}";
              font-family: var(--font-primary);
              font-size: 8pt;
              color: #6b7280;
            }
            @bottom-center {
              content: "Sida " counter(page) " av " counter(pages);
              font-family: var(--font-primary);
              font-size: 8pt;
              color: #6b7280;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          /* ATS-OPTIMIZED BODY STYLING */
          body {
            font-family: var(--font-primary);
            font-size: 11pt;
            line-height: var(--line-height-normal);
            color: ${colors.text};
            background: white;
            font-weight: var(--font-weight-normal);
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
          }
          
          /* ATS-FRIENDLY CONTAINER */
          .ats-container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            position: relative;
          }
          
          /* PREMIUM ATS HEADER - Structured for parsing */
          .ats-header {
            background: linear-gradient(135deg, ${colors.accent} 0%, white 100%);
            padding: 1.5cm;
            margin-bottom: 1.5cm;
            border: 2px solid ${colors.primary};
            border-radius: 4px;
            position: relative;
            text-align: center;
          }
          
          .ats-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.gold}, ${colors.primary});
          }
          
          /* PREMIUM SWEDISH TRUST INDICATOR - ATS Compatible */
          .ats-trust-indicator {
            position: absolute;
            top: 0.5cm;
            right: 0.5cm;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: var(--font-weight-semibold);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
          }
          
          .ats-trust-indicator::before {
            content: 'SE';
            margin-right: 0.2cm;
            font-weight: var(--font-weight-bold);
          }
          
          /* ATS-PARSEABLE NAME AND TITLE */
          .ats-name {
            font-family: var(--font-primary);
            font-size: 28pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            line-height: var(--line-height-tight);
            letter-spacing: var(--letter-spacing-normal);
          }
          
          .ats-professional-title {
            font-family: var(--font-primary);
            font-size: 14pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.secondary};
            margin-bottom: 0.8cm;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
          }
          
          .ats-summary {
            font-size: 11pt;
            line-height: var(--line-height-relaxed);
            color: #4b5563;
            max-width: 85%;
            margin: 0 auto 1cm;
            text-align: center;
          }
          
          /* ATS-OPTIMIZED CONTACT INFORMATION */
          .ats-contact {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.8cm;
            margin: 1cm 0;
            padding: 0.8cm;
            background: white;
            border: 1px solid ${colors.accent};
          }
          
          .ats-contact-item {
            font-size: 10pt;
            font-family: var(--font-primary);
            color: ${colors.text};
            display: flex;
            align-items: center;
          }
          
          .ats-contact-label {
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            margin-right: 0.3cm;
            min-width: 60px;
          }
          
          /* ATS-FRIENDLY SECTION HEADERS */
          .ats-section {
            margin-bottom: 1.5cm;
            page-break-inside: avoid;
          }
          
          .ats-section-header {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 0.6cm 1cm;
            margin-bottom: 1cm;
            position: relative;
            border-radius: 2px;
          }
          
          .ats-section-header::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            right: 0;
            height: 3px;
            background: ${colors.gold};
          }
          
          .ats-section-title {
            font-family: var(--font-primary);
            font-size: 14pt;
            font-weight: var(--font-weight-bold);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            margin: 0;
          }
          
          /* PREMIUM ATS ACHIEVEMENTS BOX */
          .ats-achievements {
            background: linear-gradient(135deg, ${colors.accent}, white);
            border: 3px solid ${colors.primary};
            padding: 1.2cm;
            margin-bottom: 1.5cm;
            position: relative;
            border-radius: 4px;
          }
          
          .ats-achievements::before {
            content: 'NYCKELRESULTAT';
            position: absolute;
            top: -12px;
            left: 1cm;
            background: ${colors.gold};
            color: white;
            padding: 0.2cm 0.6cm;
            font-size: 8pt;
            font-weight: var(--font-weight-bold);
            border-radius: 2px;
          }
          
          .ats-achievements h3 {
            font-family: var(--font-primary);
            font-size: 13pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 0.8cm;
            text-transform: uppercase;
          }
          
          .ats-achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 0.8cm;
          }
          
          .ats-achievement-item {
            text-align: center;
            padding: 0.8cm;
            background: white;
            border: 2px solid ${colors.accent};
            border-radius: 2px;
          }
          
          .ats-achievement-metric {
            font-family: var(--font-primary);
            font-size: 20pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            line-height: 1;
            margin-bottom: 0.3cm;
          }
          
          .ats-achievement-description {
            font-size: 9pt;
            color: #6b7280;
            font-family: var(--font-primary);
            line-height: var(--line-height-normal);
          }
          
          /* ATS-OPTIMIZED EXPERIENCE SECTION */
          .ats-experience-item {
            margin-bottom: 1.2cm;
            padding: 1cm;
            background: linear-gradient(135deg, white, ${colors.accent});
            border: 1px solid ${colors.accent};
            border-left: 4px solid ${colors.primary};
            break-inside: avoid;
          }
          
          .ats-experience-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            margin-bottom: 0.6cm;
            gap: 1cm;
          }
          
          .ats-job-title {
            font-family: var(--font-primary);
            font-size: 13pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .ats-company-name {
            font-family: var(--font-primary);
            font-size: 11pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.secondary};
            margin-bottom: 0.2cm;
          }
          
          .ats-job-location {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
          }
          
          .ats-date-range {
            font-family: var(--font-primary);
            font-size: 10pt;
            background: ${colors.primary};
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 2px;
            white-space: nowrap;
            align-self: start;
            font-weight: var(--font-weight-semibold);
          }
          
          .ats-job-description {
            font-size: 10pt;
            line-height: var(--line-height-relaxed);
            color: #4b5563;
            margin-bottom: 0.6cm;
          }
          
          .ats-achievements-list {
            list-style-type: disc;
            margin-left: 1cm;
          }
          
          .ats-achievements-list li {
            font-size: 10pt;
            line-height: var(--line-height-relaxed);
            color: #374151;
            margin-bottom: 0.3cm;
          }
          
          /* ATS-FRIENDLY SKILLS SECTION */
          .ats-skills {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1cm;
          }
          
          .ats-skill-category {
            background: white;
            border: 2px solid ${colors.accent};
            border-top: 4px solid ${colors.primary};
            padding: 1cm;
            border-radius: 2px;
          }
          
          .ats-skill-title {
            font-family: var(--font-primary);
            font-size: 12pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.6cm;
            text-transform: uppercase;
          }
          
          .ats-skills-list {
            font-family: var(--font-primary);
            font-size: 10pt;
            line-height: var(--line-height-relaxed);
            color: ${colors.text};
          }
          
          .ats-skill-item {
            display: inline-block;
            background: ${colors.accent};
            padding: 0.2cm 0.5cm;
            margin: 0.1cm 0.2cm 0.1cm 0;
            border-radius: 2px;
            font-weight: var(--font-weight-medium);
            border: 1px solid ${colors.primary}30;
          }
          
          /* ATS-OPTIMIZED EDUCATION */
          .ats-education-item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 1cm;
            margin-bottom: 1cm;
            padding: 0.8cm;
            background: white;
            border: 1px solid ${colors.accent};
            border-left: 4px solid ${colors.secondary};
            break-inside: avoid;
          }
          
          .ats-degree-title {
            font-family: var(--font-primary);
            font-size: 12pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .ats-institution-name {
            font-family: var(--font-primary);
            font-size: 11pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.secondary};
            margin-bottom: 0.2cm;
          }
          
          .ats-education-details {
            text-align: right;
            font-family: var(--font-primary);
          }
          
          .ats-education-date {
            font-size: 10pt;
            color: #6b7280;
            font-weight: var(--font-weight-medium);
          }
          
          /* ATS-FRIENDLY LANGUAGES */
          .ats-languages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.8cm;
          }
          
          .ats-language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6cm;
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 2px;
          }
          
          .ats-language-name {
            font-family: var(--font-primary);
            font-size: 11pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.text};
          }
          
          .ats-language-level {
            font-family: var(--font-primary);
            font-size: 9pt;
            font-weight: var(--font-weight-bold);
            background: ${colors.primary};
            color: white;
            padding: 0.2cm 0.5cm;
            border-radius: 2px;
            text-transform: uppercase;
          }
          
          /* ATS-COMPATIBLE KEYWORDS SECTION */
          .ats-keywords {
            background: ${colors.accent};
            padding: 0.8cm;
            margin: 1.5cm 0;
            border: 1px solid ${colors.primary}30;
            border-radius: 2px;
          }
          
          .ats-keywords h4 {
            font-family: var(--font-primary);
            font-size: 11pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            text-transform: uppercase;
          }
          
          .ats-keywords-list {
            font-family: var(--font-primary);
            font-size: 9pt;
            color: ${colors.text};
            line-height: var(--line-height-relaxed);
            word-spacing: 0.2cm;
          }
          
          /* PREMIUM SEPARATORS - ATS Safe */
          .ats-separator {
            height: 2px;
            background: linear-gradient(90deg, 
              transparent, 
              ${colors.primary}, 
              ${colors.gold}, 
              ${colors.primary}, 
              transparent);
            margin: 1cm 0;
            position: relative;
          }
          
          .ats-separator::before {
            content: '●';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 16pt;
            padding: 0 0.3cm;
          }
          
          /* PRINT OPTIMIZATIONS FOR ATS */
          @media print {
            body {
              font-size: 10pt;
            }
            
            .ats-header {
              padding: 1cm;
              margin-bottom: 1cm;
            }
            
            .ats-section {
              margin-bottom: 1cm;
            }
            
            .ats-achievement-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .ats-skills {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          /* PAGE BREAK MANAGEMENT */
          .page-break-before {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
          
          /* ATS-SAFE UTILITY CLASSES */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: var(--font-weight-bold); }
          .uppercase { text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="ats-container">
          <!-- ATS-OPTIMIZED HEADER -->
          <header class="ats-header no-page-break">
            <div class="ats-trust-indicator">Svenska Premium</div>
            <h1 class="ats-name">${cvData.personalInfo.fullName}</h1>
            <div class="ats-professional-title">${cvData.personalInfo.title || 'Professionell Kandidat'}</div>
            <div class="ats-summary">
              ${cvData.summary || 'Erfaren professionell med stark kompetens och fokus på resultat inom svensk affärskultur.'}
            </div>
            
            <!-- ATS-FRIENDLY CONTACT INFORMATION -->
            <div class="ats-contact">
              ${cvData.personalInfo.email ? `
                <div class="ats-contact-item">
                  <span class="ats-contact-label">E-post:</span>
                  ${cvData.personalInfo.email}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.phone ? `
                <div class="ats-contact-item">
                  <span class="ats-contact-label">Telefon:</span>
                  ${cvData.personalInfo.phone}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.location ? `
                <div class="ats-contact-item">
                  <span class="ats-contact-label">Plats:</span>
                  ${cvData.personalInfo.location}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.linkedin ? `
                <div class="ats-contact-item">
                  <span class="ats-contact-label">LinkedIn:</span>
                  ${cvData.personalInfo.linkedin}
                </div>
              ` : ''}
            </div>
          </header>

          <!-- ATS-OPTIMIZED ACHIEVEMENTS -->
          ${achievements.length > 0 ? `
          <div class="ats-achievements no-page-break">
            <h3>Nyckelresultat och Prestationer</h3>
            <div class="ats-achievement-grid">
              ${achievements.slice(0, 4).map(achievement => `
                <div class="ats-achievement-item">
                  <div class="ats-achievement-metric">${achievement.metric || '▲'}</div>
                  <div class="ats-achievement-description">${achievement.context}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="ats-separator"></div>
          ` : ''}

          <!-- ATS-FRIENDLY KEYWORDS SECTION -->
          ${allSkills.length > 0 ? `
          <div class="ats-keywords">
            <h4>Nyckelkompetenser och Keywords</h4>
            <div class="ats-keywords-list">
              ${allSkills.join(' • ')}
            </div>
          </div>
          ` : ''}

          <!-- PROFESSIONAL EXPERIENCE -->
          ${(cvData.experience || []).length > 0 ? `
          <section class="ats-section">
            <div class="ats-section-header">
              <h2 class="ats-section-title">${headings.experience}</h2>
            </div>
            
            ${(cvData.experience || []).map((exp, index) => `
              <div class="ats-experience-item ${index === 0 ? 'no-page-break' : ''}">
                <div class="ats-experience-header">
                  <div>
                    <div class="ats-job-title">${exp.position}</div>
                    <div class="ats-company-name">${exp.company}</div>
                    ${exp.location ? `<div class="ats-job-location">${exp.location}</div>` : ''}
                  </div>
                  <div class="ats-date-range">${formatDateRange(exp.startDate, exp.endDate)}</div>
                </div>
                
                ${exp.description ? `
                  <div class="ats-job-description">${exp.description}</div>
                ` : ''}
                
                ${(exp.achievements || []).length > 0 ? `
                  <ul class="ats-achievements-list">
                    ${(exp.achievements || []).map(achievement => `
                      <li>${achievement}</li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- CORE COMPETENCIES -->
          ${(cvData.skills || []).length > 0 ? `
          <section class="ats-section">
            <div class="ats-section-header">
              <h2 class="ats-section-title">${headings.skills}</h2>
            </div>
            
            <div class="ats-skills">
              ${Object.entries(
                (cvData.skills || []).filter(Boolean).reduce((acc: any, skill: any) => {
                  if (!skill) return acc;
                  const category = skill.category || 'Kärnkompetenser';
                  if (!acc[category]) acc[category] = [];
                  // Handle both individual skills and skill objects with skills array
                  if (skill.skills && Array.isArray(skill.skills)) {
                    const skillItems = skill.skills.filter(Boolean);
                    acc[category].push(...skillItems);
                  } else if (skill && typeof skill === 'string') {
                    acc[category].push(skill);
                  } else if (skill && skill.name) {
                    acc[category].push(skill.name);
                  }
                  return acc;
                }, {})
              ).map(([category, skills]) => `
                <div class="ats-skill-category">
                  <h4 class="ats-skill-title">${category}</h4>
                  <div class="ats-skills-list">
                    ${((skills as any[]) || []).filter(Boolean).map((skill: any) => `
                      <span class="ats-skill-item">${typeof skill === 'string' ? skill : skill?.name || skill || ''}</span>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- EDUCATION & QUALIFICATIONS -->
          ${(cvData.education || []).length > 0 ? `
          <section class="ats-section">
            <div class="ats-section-header">
              <h2 class="ats-section-title">${headings.education}</h2>
            </div>
            
            ${(cvData.education || []).map(edu => `
              <div class="ats-education-item no-page-break">
                <div>
                  <div class="ats-degree-title">${edu.degree}</div>
                  <div class="ats-institution-name">${edu.institution}</div>
                  ${edu.description ? `<div class="ats-job-description">${edu.description}</div>` : ''}
                  ${edu.gpa ? `<div style="margin-top: 0.2cm; font-weight: 600; color: ${colors.primary};">Betyg: ${edu.gpa}</div>` : ''}
                </div>
                <div class="ats-education-details">
                  <div class="ats-education-date">${edu.startDate ? formatDateRange(edu.startDate, edu.endDate) : (edu.graduationYear || '')}</div>
                </div>
              </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- LANGUAGES -->
          ${(cvData.languages || []).length > 0 ? `
          <section class="ats-section">
            <div class="ats-section-header">
              <h2 class="ats-section-title">${headings.languages}</h2>
            </div>
            
            <div class="ats-languages">
              ${(cvData.languages || []).map(lang => `
                <div class="ats-language-item">
                  <span class="ats-language-name">${lang.language}</span>
                  <span class="ats-language-level">${lang.proficiency}</span>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- CERTIFICATIONS -->
          ${(cvData.certifications || []).length > 0 ? `
          <section class="ats-section">
            <div class="ats-section-header">
              <h2 class="ats-section-title">Professionella Certifieringar</h2>
            </div>
            
            ${(cvData.certifications || []).map(cert => `
              <div class="ats-education-item no-page-break">
                <div>
                  <div class="ats-degree-title">${cert.name}</div>
                  <div class="ats-institution-name">${cert.issuer}</div>
                  ${cert.credentialId ? `<div style="margin-top: 0.2cm; font-size: 9pt;">Credential ID: ${cert.credentialId}</div>` : ''}
                </div>
                <div class="ats-education-details">
                  <div class="ats-education-date">${cert.date}</div>
                </div>
              </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- ATS-FRIENDLY FOOTER -->
          <footer style="margin-top: 1.5cm; text-align: center; font-size: 9pt; color: #6b7280; font-family: var(--font-primary); border-top: 1px solid ${colors.accent}; padding-top: 0.5cm;">
            <div class="ats-separator"></div>
            <p>
              Detta dokument är optimerat för ATS-system och mänskliga rekryterare. 
              Senast uppdaterad: ${new Date().toLocaleDateString('sv-SE')}
            </p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }
};