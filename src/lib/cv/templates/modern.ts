import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { generateSkillProgressCSS, generateSectionIcon, calculateSkillLevel, extractAchievements } from '../visual-elements';

export const modernCVTemplate: CVTemplate = {
  id: 'modern',
  name: 'Modern Professional',
  description: 'Elegant minimalistisk design för framgångsrika professionella inom alla branscher',
  category: 'Contemporary',
  bestFor: ['Konsultverksamhet', 'Marknadsföring', 'Projektledning', 'Affärsutveckling', 'Moderna företag', 'Startup'],
  features: ['Minimalistisk elegans', 'Visual hierarchy', 'Achievement focus', 'Clean typography', 'Professional impact'],
  colorSchemes: ['slate', 'teal', 'indigo', 'emerald', 'purple', 'amber'],
  previewImage: '/images/cv-templates/modern-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern');
    const colorScheme = {
      slate: { primary: '#1e293b', secondary: '#475569', accent: '#f1f5f9', light: '#cbd5e1', text: '#0f172a' },
      teal: { primary: '#0f766e', secondary: '#14b8a6', accent: '#f0fdfa', light: '#5eead4', text: '#134e4a' },
      indigo: { primary: '#3730a3', secondary: '#6366f1', accent: '#eef2ff', light: '#a5b4fc', text: '#312e81' },
      emerald: { primary: '#065f46', secondary: '#10b981', accent: '#ecfdf5', light: '#6ee7b7', text: '#064e3b' },
      purple: { primary: '#7c3aed', secondary: '#a855f7', accent: '#faf5ff', light: '#c4b5fd', text: '#581c87' },
      amber: { primary: '#d97706', secondary: '#f59e0b', accent: '#fffbeb', light: '#fcd34d', text: '#92400e' }
    };
    const colors = colorScheme[options.colorScheme as keyof typeof colorScheme] || colorScheme.slate;
    
    // Extract key information
    const achievements = extractAchievements(
      (cvData.experience || []).flatMap(exp => (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean)).join(' ') + ' ' +
      (cvData.summary || '')
    );
    const keySkills = cvData.skills?.slice(0, 6) || [];
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 15mm;
            @top-center {
              content: "${cvData.personalInfo.fullName} | Curriculum Vitae";
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              color: #6b7280;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 10.5pt;
            line-height: 1.6;
            color: ${colors.text};
            background: white;
            font-weight: 400;
          }
          
          /* MODERN HEADER DESIGN */
          .modern-header {
            position: relative;
            padding: 2cm 0 1.5cm;
            margin-bottom: 1.5cm;
            background: linear-gradient(135deg, ${colors.accent} 0%, white 100%);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .modern-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 160px;
            height: 160px;
            background: linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}08);
            border-radius: 50%;
            transform: translate(50%, -50%);
          }
          
          .modern-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, transparent);
            border-radius: 2px;
          }
          
          .header-content {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2cm;
            align-items: center;
            padding: 0 1.5cm;
          }
          
          .name-section .name {
            font-family: 'Manrope', sans-serif;
            font-size: 30pt;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            line-height: 1.2;
            letter-spacing: -0.02em;
          }
          
          .professional-title {
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.secondary};
            margin-bottom: 0.8cm;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .professional-summary {
            font-size: 11pt;
            line-height: 1.7;
            color: #4b5563;
            margin-bottom: 1cm;
            max-width: 90%;
          }
          
          .contact-info {
            font-size: 10pt;
            line-height: 1.8;
            color: #6b7280;
          }
          
          .contact-info div {
            display: flex;
            align-items: center;
            margin-bottom: 0.3cm;
          }
          
          .contact-icon {
            width: 16px;
            height: 16px;
            margin-right: 0.5cm;
            opacity: 0.7;
          }
          
          /* KEY ACHIEVEMENTS HIGHLIGHT */
          .achievements-preview {
            background: linear-gradient(135deg, ${colors.light}20, ${colors.accent});
            padding: 1cm;
            border-radius: 8px;
            border-left: 4px solid ${colors.primary};
            margin-bottom: 1.5cm;
          }
          
          .achievements-preview h3 {
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            display: flex;
            align-items: center;
          }
          
          .achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.8cm;
          }
          
          .achievement-item {
            background: white;
            padding: 0.6cm;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid ${colors.accent};
          }
          
          .achievement-number {
            font-size: 18pt;
            font-weight: 700;
            color: ${colors.primary};
            line-height: 1;
          }
          
          .achievement-label {
            font-size: 9pt;
            color: #6b7280;
            margin-top: 0.2cm;
          }
          
          /* SECTION STYLES */
          .section {
            margin-bottom: 1.8cm;
            break-inside: avoid;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1cm;
            padding-bottom: 0.4cm;
            border-bottom: 2px solid ${colors.accent};
            position: relative;
          }
          
          .section-header::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: ${colors.primary};
          }
          
          .section-title {
            font-family: 'Manrope', sans-serif;
            font-size: 14pt;
            font-weight: 600;
            color: ${colors.primary};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          /* EXPERIENCE SECTION */
          .experience-item {
            margin-bottom: 1.2cm;
            padding-left: 1cm;
            border-left: 3px solid ${colors.accent};
            position: relative;
          }
          
          .experience-item::before {
            content: '';
            position: absolute;
            left: -6px;
            top: 0.2cm;
            width: 12px;
            height: 12px;
            background: ${colors.primary};
            border-radius: 50%;
            box-shadow: 0 0 0 3px white, 0 0 0 4px ${colors.accent};
          }
          
          .experience-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            margin-bottom: 0.4cm;
          }
          
          .job-title {
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .company-name {
            font-size: 11pt;
            font-weight: 500;
            color: ${colors.secondary};
            margin-bottom: 0.2cm;
          }
          
          .date-range {
            font-size: 9pt;
            color: #6b7280;
            font-weight: 500;
            background: ${colors.accent};
            padding: 0.2cm 0.4cm;
            border-radius: 12px;
            white-space: nowrap;
            align-self: start;
          }
          
          .job-description {
            font-size: 10pt;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 0.6cm;
          }
          
          .achievements {
            list-style: none;
          }
          
          .achievements li {
            font-size: 10pt;
            line-height: 1.6;
            color: #374151;
            margin-bottom: 0.3cm;
            padding-left: 1cm;
            position: relative;
          }
          
          .achievements li::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: ${colors.secondary};
            font-size: 8pt;
          }
          
          /* SKILLS SECTION - MODERN GRID */
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1cm;
          }
          
          .skill-category {
            background: linear-gradient(135deg, ${colors.accent}, white);
            padding: 0.8cm;
            border-radius: 8px;
            border: 1px solid ${colors.light};
          }
          
          .skill-category h4 {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.6cm;
            display: flex;
            align-items: center;
          }
          
          .skill-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
          }
          
          .skill-tag {
            background: white;
            color: ${colors.text};
            padding: 0.3cm 0.6cm;
            border-radius: 15px;
            font-size: 9pt;
            font-weight: 500;
            border: 1px solid ${colors.light};
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          .skill-rating {
            display: flex;
            align-items: center;
            margin-top: 0.3cm;
          }
          
          .skill-dots {
            display: flex;
            gap: 0.2cm;
            margin-left: 0.5cm;
          }
          
          .skill-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${colors.light};
          }
          
          .skill-dot.filled {
            background: ${colors.secondary};
          }
          
          /* EDUCATION SECTION */
          .education-item {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1cm;
            margin-bottom: 1cm;
            padding: 0.8cm;
            background: linear-gradient(135deg, ${colors.accent}, white);
            border-radius: 8px;
            border-left: 4px solid ${colors.primary};
          }
          
          .degree-title {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .institution {
            font-size: 10pt;
            font-weight: 500;
            color: ${colors.secondary};
            margin-bottom: 0.3cm;
          }
          
          .education-details {
            font-size: 9pt;
            color: #6b7280;
            text-align: right;
          }
          
          /* LANGUAGES SECTION */
          .languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.8cm;
          }
          
          .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6cm;
            background: linear-gradient(135deg, ${colors.accent}, white);
            border-radius: 8px;
            border: 1px solid ${colors.light};
          }
          
          .language-name {
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.text};
          }
          
          .language-level {
            font-size: 9pt;
            font-weight: 500;
            color: ${colors.secondary};
            background: white;
            padding: 0.2cm 0.5cm;
            border-radius: 10px;
            border: 1px solid ${colors.light};
          }
          
          /* RESPONSIVE DESIGN */
          @media print {
            body {
              font-size: 10pt;
            }
            
            .modern-header {
              padding: 1.5cm 0 1cm;
              margin-bottom: 1cm;
            }
            
            .section {
              margin-bottom: 1.2cm;
            }
            
            .achievement-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .skills-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          /* PAGE BREAK CONTROL */
          .page-break-before {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
          
          /* UTILITY CLASSES */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          
          .mb-small { margin-bottom: 0.3cm; }
          .mb-medium { margin-bottom: 0.6cm; }
          .mb-large { margin-bottom: 1cm; }
        </style>
      </head>
      <body>
        <!-- MODERN HEADER -->
        <header class="modern-header">
          <div class="header-content">
            <div class="name-section">
              <h1 class="name">${cvData.personalInfo.fullName}</h1>
              <div class="professional-title">${cvData.personalInfo.title || 'Professional'}</div>
              <div class="professional-summary">
                ${cvData.summary || 'Driven professional with passion for excellence and continuous development.'}
              </div>
            </div>
            
            <div class="contact-info">
              ${cvData.personalInfo.email ? `
                <div>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                  </svg>
                  ${cvData.personalInfo.email}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.phone ? `
                <div>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.09 8.31 8.82 8.59L6.62 10.79Z"/>
                  </svg>
                  ${cvData.personalInfo.phone}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.location ? `
                <div>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                  </svg>
                  ${cvData.personalInfo.location}
                </div>
              ` : ''}
              
              ${cvData.personalInfo.linkedin ? `
                <div>
                  <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM8.5 18.5V9.5H6V18.5H8.5ZM7.25 8.5C7.66421 8.5 8.06116 8.33589 8.35355 8.04351C8.64594 7.75112 8.81 7.35417 8.81 6.94C8.81 6.52583 8.64594 6.12888 8.35355 5.83649C8.06116 5.54411 7.66421 5.38 7.25 5.38C6.83579 5.38 6.43884 5.54411 6.14645 5.83649C5.85406 6.12888 5.69 6.52583 5.69 6.94C5.69 7.35417 5.85406 7.75112 6.14645 8.04351C6.43884 8.33589 6.83579 8.5 7.25 8.5ZM18.5 18.5V13.8C18.5 11.67 18.03 9.9 15.61 9.9C14.45 9.9 13.69 10.53 13.39 11.12H13.36V9.5H11.03V18.5H13.53V14.25C13.53 13.22 13.72 12.23 15.05 12.23C16.36 12.23 16.38 13.4 16.38 14.32V18.5H18.5Z"/>
                  </svg>
                  LinkedIn
                </div>
              ` : ''}
            </div>
          </div>
        </header>

        <!-- KEY ACHIEVEMENTS HIGHLIGHT -->
        ${achievements.length > 0 ? `
        <div class="achievements-preview no-page-break">
          <h3>
            <svg style="width: 18px; height: 18px; margin-right: 0.5cm;" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,8.18V4.18C16,3.07 15.16,2.18 14.12,2.18H9.88C8.84,2.18 8,3.07 8,4.18V8.18C6.84,8.68 6,9.81 6,11.18V16.18C6,17.82 7.34,19.18 9,19.18H15C16.66,19.18 18,17.82 18,16.18V11.18C18,9.81 17.16,8.68 16,8.18M10,4.18H14V8.18H10V4.18M16,16.18H8V11.18H16V16.18Z"/>
            </svg>
            Nyckelprestation
          </h3>
          <div class="achievement-grid">
            ${achievements.slice(0, 3).map(achievement => `
              <div class="achievement-item">
                <div class="achievement-number">${achievement.metric || '+'}</div>
                <div class="achievement-label">${achievement.context}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- EXPERIENCE SECTION -->
        ${(cvData.experience || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.experience}</h2>
          </div>
          
          ${(cvData.experience || []).map((exp, index) => `
            <div class="experience-item ${index === 0 ? 'no-page-break' : ''}">
              <div class="experience-header">
                <div>
                  <div class="job-title">${exp.position}</div>
                  <div class="company-name">${exp.company}</div>
                </div>
                <div class="date-range">${formatDateRange(exp.startDate, exp.endDate)}</div>
              </div>
              
              ${exp.description ? `
                <div class="job-description">${exp.description}</div>
              ` : ''}
              
              ${(exp.achievements || []).length > 0 ? `
                <ul class="achievements">
                  ${(exp.achievements || []).map(achievement => `
                    <li>${achievement}</li>
                  `).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- SKILLS SECTION -->
        ${(cvData.skills || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.skills}</h2>
          </div>
          
          <div class="skills-grid">
            ${Object.entries(
              (cvData.skills || []).reduce((acc: any, skill: any) => {
                const category = skill.category || 'Övrigt';
                if (!acc[category]) acc[category] = [];
                acc[category].push(skill);
                return acc;
              }, {})
            ).map(([category, skills]) => `
              <div class="skill-category">
                <h4>
                  <svg style="width: 16px; height: 16px; margin-right: 0.4cm;" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/>
                  </svg>
                  ${category}
                </h4>
                <div class="skill-list">
                  ${(skills as any[]).map((skill: any) => `
                    <span class="skill-tag">${skill.name || skill}</span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- EDUCATION SECTION -->
        ${(cvData.education || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.education}</h2>
          </div>
          
          ${(cvData.education || []).map(edu => `
            <div class="education-item no-page-break">
              <div>
                <div class="degree-title">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
                ${edu.description ? `<div class="job-description">${edu.description}</div>` : ''}
              </div>
              <div class="education-details">
                <div class="date-range">${edu.startDate ? formatDateRange(edu.startDate, edu.endDate) : (edu.graduationYear || '')}</div>
                ${edu.gpa ? `<div style="margin-top: 0.2cm; font-weight: 600;">GPA: ${edu.gpa}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- LANGUAGES SECTION -->
        ${(cvData.languages || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.languages}</h2>
          </div>
          
          <div class="languages-grid">
            ${(cvData.languages || []).map(lang => `
              <div class="language-item">
                <span class="language-name">${lang.language}</span>
                <span class="language-level">${lang.proficiency}</span>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- ADDITIONAL SECTIONS -->
        ${(cvData.certifications || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Certifieringar</h2>
          </div>
          
          ${(cvData.certifications || []).map(cert => `
            <div class="education-item no-page-break">
              <div>
                <div class="degree-title">${cert.name}</div>
                <div class="institution">${cert.issuer}</div>
              </div>
              <div class="education-details">
                <div class="date-range">${cert.date}</div>
                ${cert.credentialId ? `<div style="margin-top: 0.2cm; font-size: 8pt;">ID: ${cert.credentialId}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}
      </body>
      </html>
    `;
  }
};