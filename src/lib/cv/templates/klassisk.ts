import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { extractAchievements } from '../visual-elements';

export const klassiskCVTemplate: CVTemplate = {
  id: 'klassisk',
  name: 'Klassisk Premium',
  description: 'Elegant svensk företagstradition med moderna premium-detaljer för ledande positioner',
  category: 'Executive',
  bestFor: ['Finanssektorn', 'Juridik', 'Konsultverksamhet', 'Offentlig förvaltning', 'C-level positioner'],
  features: ['Swedish Executive Design', 'Premium Typography', 'Elegant Hierarchy', 'Trust Indicators'],
  colorSchemes: ['navy', 'charcoal', 'forest', 'burgundy', 'royal', 'classic'],
  previewImage: '/images/cv-templates/klassisk-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const colorScheme = {
      navy: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#dbeafe', text: '#1e293b', gold: '#f59e0b' },
      charcoal: { primary: '#374151', secondary: '#6b7280', accent: '#f3f4f6', text: '#111827', gold: '#d97706' },
      forest: { primary: '#064e3b', secondary: '#059669', accent: '#d1fae5', text: '#1f2937', gold: '#10b981' },
      burgundy: { primary: '#7f1d1d', secondary: '#dc2626', accent: '#fee2e2', text: '#1f2937', gold: '#f59e0b' },
      royal: { primary: '#581c87', secondary: '#9333ea', accent: '#f3e8ff', text: '#1f2937', gold: '#f59e0b' },
      classic: { primary: '#1f2937', secondary: '#4b5563', accent: '#f9fafb', text: '#111827', gold: '#d97706' }
    };
    const colors = colorScheme[options.colorScheme as keyof typeof colorScheme] || colorScheme.navy;
    
    // Generate dynamic headings based on CV content and industry
    const headings = generateDynamicHeadings(cvData, 'klassisk');
    const achievements = extractAchievements(
      (cvData.experience || []).flatMap(exp => (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean)).join(' ') + ' ' +
      (cvData.summary || '')
    );

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Curriculum Vitae - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 20mm 18mm;
            @top-center {
              content: "${cvData.personalInfo.fullName} | Curriculum Vitae";
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 2mm;
            }
            @bottom-center {
              content: "Sida " counter(page) " av " counter(pages);
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
            font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: ${colors.text};
            background: white;
            font-weight: 400;
          }
          
          /* PREMIUM EXECUTIVE HEADER */
          .executive-header {
            position: relative;
            padding: 2.5cm 0 2cm;
            margin-bottom: 2cm;
            text-align: center;
            background: linear-gradient(135deg, ${colors.accent} 0%, white 50%, ${colors.accent} 100%);
            border: 1px solid ${colors.accent};
            border-radius: 4px;
          }
          
          .executive-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.gold}, ${colors.primary});
            border-radius: 2px;
          }
          
          .executive-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.gold}, ${colors.primary});
            border-radius: 2px;
          }
          
          .name {
            font-family: 'Playfair Display', 'Times New Roman', serif;
            font-size: 36pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }
          
          .executive-title {
            font-family: 'Inter', sans-serif;
            font-size: 16pt;
            font-weight: 500;
            color: ${colors.secondary};
            margin-bottom: 1cm;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          
          .executive-summary {
            font-size: 12pt;
            line-height: 1.8;
            color: #4b5563;
            max-width: 80%;
            margin: 0 auto 1.5cm;
            font-style: italic;
          }
          
          /* CONTACT INFORMATION - ELEGANT GRID */
          .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1cm;
            margin: 1.5cm 0;
            padding: 1cm;
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 4px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            font-size: 10pt;
            color: ${colors.text};
            font-family: 'Inter', sans-serif;
          }
          
          .contact-icon {
            width: 18px;
            height: 18px;
            margin-right: 0.6cm;
            color: ${colors.secondary};
          }
          
          /* SECTION STYLING */
          .section {
            margin-bottom: 2cm;
            page-break-inside: avoid;
          }
          
          .section-header {
            position: relative;
            margin-bottom: 1.2cm;
            text-align: center;
            padding-bottom: 0.8cm;
          }
          
          .section-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
          }
          
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 18pt;
            font-weight: 600;
            color: ${colors.primary};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            position: relative;
          }
          
          /* EXECUTIVE ACHIEVEMENTS BOX */
          .achievements-executive {
            background: linear-gradient(135deg, ${colors.accent}, white);
            border: 2px solid ${colors.primary};
            border-radius: 8px;
            padding: 1.5cm;
            margin-bottom: 2cm;
            position: relative;
          }
          
          .achievements-executive::before {
            content: '★';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 24pt;
            padding: 0 0.5cm;
          }
          
          .achievements-executive h3 {
            font-family: 'Playfair Display', serif;
            font-size: 16pt;
            font-weight: 600;
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 1cm;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .achievement-executive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1cm;
          }
          
          .achievement-executive-item {
            text-align: center;
            padding: 0.8cm;
            background: white;
            border-radius: 6px;
            border: 1px solid ${colors.accent};
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .achievement-metric {
            font-family: 'Playfair Display', serif;
            font-size: 24pt;
            font-weight: 700;
            color: ${colors.primary};
            line-height: 1;
            margin-bottom: 0.3cm;
          }
          
          .achievement-description {
            font-size: 10pt;
            color: #6b7280;
            font-family: 'Inter', sans-serif;
            line-height: 1.4;
          }
          
          /* EXPERIENCE - ELEGANT TIMELINE */
          .experience-timeline {
            position: relative;
            padding-left: 2cm;
          }
          
          .experience-timeline::before {
            content: '';
            position: absolute;
            left: 0.8cm;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary}, ${colors.primary});
          }
          
          .experience-item {
            position: relative;
            margin-bottom: 2cm;
            padding: 1cm;
            background: linear-gradient(135deg, white, ${colors.accent});
            border-radius: 6px;
            border: 1px solid ${colors.accent};
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          
          .experience-item::before {
            content: '';
            position: absolute;
            left: -1.3cm;
            top: 1cm;
            width: 16px;
            height: 16px;
            background: ${colors.primary};
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 2px ${colors.accent};
          }
          
          .experience-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            margin-bottom: 0.8cm;
            gap: 1cm;
          }
          
          .position-title {
            font-family: 'Playfair Display', serif;
            font-size: 14pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            line-height: 1.2;
          }
          
          .company-name {
            font-family: 'Inter', sans-serif;
            font-size: 12pt;
            font-weight: 500;
            color: ${colors.secondary};
            margin-bottom: 0.3cm;
          }
          
          .date-range {
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            color: #6b7280;
            background: ${colors.primary};
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 15px;
            white-space: nowrap;
            align-self: start;
            font-weight: 500;
          }
          
          .job-description {
            font-size: 11pt;
            line-height: 1.7;
            color: #4b5563;
            margin-bottom: 0.8cm;
          }
          
          .achievements-list {
            list-style: none;
          }
          
          .achievements-list li {
            font-size: 10pt;
            line-height: 1.6;
            color: #374151;
            margin-bottom: 0.4cm;
            padding-left: 1.2cm;
            position: relative;
          }
          
          .achievements-list li::before {
            content: '◆';
            position: absolute;
            left: 0;
            color: ${colors.gold};
            font-weight: bold;
          }
          
          /* SKILLS - PROFESSIONAL CATEGORIES */
          .skills-executive {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5cm;
          }
          
          .skill-category-executive {
            background: linear-gradient(135deg, ${colors.accent}, white);
            border: 1px solid ${colors.primary};
            border-radius: 8px;
            padding: 1.2cm;
            position: relative;
          }
          
          .skill-category-executive::before {
            content: '';
            position: absolute;
            top: -1px;
            left: 20%;
            right: 20%;
            height: 3px;
            background: ${colors.gold};
            border-radius: 2px;
          }
          
          .skill-category-title {
            font-family: 'Playfair Display', serif;
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.8cm;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .skills-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5cm;
          }
          
          .skill-item {
            background: white;
            color: ${colors.text};
            padding: 0.4cm 0.8cm;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: 500;
            text-align: center;
            border: 1px solid ${colors.accent};
            font-family: 'Inter', sans-serif;
          }
          
          /* EDUCATION - PRESTIGIOUS STYLING */
          .education-item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2cm;
            margin-bottom: 1.5cm;
            padding: 1.2cm;
            background: linear-gradient(135deg, white, ${colors.accent});
            border-left: 4px solid ${colors.primary};
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .degree-title {
            font-family: 'Playfair Display', serif;
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
          }
          
          .institution-name {
            font-family: 'Inter', sans-serif;
            font-size: 11pt;
            font-weight: 500;
            color: ${colors.secondary};
            margin-bottom: 0.5cm;
          }
          
          .education-details {
            text-align: right;
            font-family: 'Inter', sans-serif;
          }
          
          .education-date {
            font-size: 10pt;
            color: #6b7280;
            font-weight: 500;
          }
          
          .education-grade {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-top: 0.3cm;
          }
          
          /* LANGUAGES - INTERNATIONAL EXECUTIVE */
          .languages-executive {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1cm;
          }
          
          .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8cm;
            background: linear-gradient(135deg, white, ${colors.accent});
            border-radius: 8px;
            border: 1px solid ${colors.primary};
          }
          
          .language-name {
            font-family: 'Playfair Display', serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.text};
          }
          
          .language-level {
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.primary};
            background: ${colors.gold};
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 12px;
          }
          
          /* CERTIFICATIONS - PROFESSIONAL CREDENTIALS */
          .certification-item {
            margin-bottom: 1cm;
            padding: 1cm;
            background: linear-gradient(135deg, ${colors.accent}, white);
            border-radius: 6px;
            border: 1px solid ${colors.primary};
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 1cm;
            align-items: center;
          }
          
          .certification-name {
            font-family: 'Playfair Display', serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .certification-issuer {
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            color: ${colors.secondary};
            font-weight: 500;
          }
          
          .certification-date {
            font-family: 'Inter', sans-serif;
            font-size: 9pt;
            color: #6b7280;
            text-align: right;
          }
          
          /* PRINT OPTIMIZATIONS */
          @media print {
            body {
              font-size: 10pt;
            }
            
            .executive-header {
              padding: 2cm 0 1.5cm;
              margin-bottom: 1.5cm;
            }
            
            .section {
              margin-bottom: 1.5cm;
            }
            
            .achievement-executive-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .skills-executive {
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
          
          /* UTILITY CLASSES */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-italic { font-style: italic; }
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }
          
          .mb-small { margin-bottom: 0.5cm; }
          .mb-medium { margin-bottom: 1cm; }
          .mb-large { margin-bottom: 1.5cm; }
          
          /* EXECUTIVE SEPARATOR */
          .executive-separator {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${colors.primary}, ${colors.gold}, ${colors.primary}, transparent);
            margin: 1.5cm 0;
            border-radius: 1px;
          }
        </style>
      </head>
      <body>
        <!-- EXECUTIVE HEADER -->
        <header class="executive-header no-page-break">
          <h1 class="name">${cvData.personalInfo.fullName}</h1>
          <div class="executive-title">${cvData.personalInfo.title || 'Senior Executive'}</div>
          <div class="executive-summary">
            ${cvData.summary || 'Distinguished professional with extensive leadership experience and proven track record of delivering exceptional results in challenging business environments.'}
          </div>
          
          <!-- CONTACT GRID -->
          <div class="contact-grid">
            ${cvData.personalInfo.email ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                </svg>
                ${cvData.personalInfo.email}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.phone ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.09 8.31 8.82 8.59L6.62 10.79Z"/>
                </svg>
                ${cvData.personalInfo.phone}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.location ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                </svg>
                ${cvData.personalInfo.location}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.linkedin ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM8.5 18.5V9.5H6V18.5H8.5ZM7.25 8.5C7.66421 8.5 8.06116 8.33589 8.35355 8.04351C8.64594 7.75112 8.81 7.35417 8.81 6.94C8.81 6.52583 8.64594 6.12888 8.35355 5.83649C8.06116 5.54411 7.66421 5.38 7.25 5.38C6.83579 5.38 6.43884 5.54411 6.14645 5.83649C5.85406 6.12888 5.69 6.52583 5.69 6.94C5.69 7.35417 5.85406 7.75112 6.14645 8.04351C6.43884 8.33589 6.83579 8.5 7.25 8.5ZM18.5 18.5V13.8C18.5 11.67 18.03 9.9 15.61 9.9C14.45 9.9 13.69 10.53 13.39 11.12H13.36V9.5H11.03V18.5H13.53V14.25C13.53 13.22 13.72 12.23 15.05 12.23C16.36 12.23 16.38 13.4 16.38 14.32V18.5H18.5Z"/>
                </svg>
                LinkedIn Profile
              </div>
            ` : ''}
          </div>
        </header>

        <!-- EXECUTIVE ACHIEVEMENTS -->
        ${achievements.length > 0 ? `
        <div class="achievements-executive no-page-break">
          <h3>Nyckelresultat & Prestationer</h3>
          <div class="achievement-executive-grid">
            ${achievements.slice(0, 4).map(achievement => `
              <div class="achievement-executive-item">
                <div class="achievement-metric">${achievement.metric || '★'}</div>
                <div class="achievement-description">${achievement.context}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="executive-separator"></div>
        ` : ''}

        <!-- PROFESSIONAL EXPERIENCE -->
        ${(cvData.experience || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.experience}</h2>
          </div>
          
          <div class="experience-timeline">
            ${(cvData.experience || []).map((exp, index) => `
              <div class="experience-item ${index === 0 ? 'no-page-break' : ''}">
                <div class="experience-header">
                  <div>
                    <div class="position-title">${exp.position}</div>
                    <div class="company-name">${exp.company}</div>
                  </div>
                  <div class="date-range">${formatDateRange(exp.startDate, exp.endDate)}</div>
                </div>
                
                ${exp.description ? `
                  <div class="job-description">${exp.description}</div>
                ` : ''}
                
                ${(exp.achievements || []).length > 0 ? `
                  <ul class="achievements-list">
                    ${(exp.achievements || []).map(achievement => `
                      <li>${achievement}</li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- CORE COMPETENCIES -->
        ${(cvData.skills || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.skills}</h2>
          </div>
          
          <div class="skills-executive">
            ${Object.entries(
              (cvData.skills || []).reduce((acc: any, skill: any) => {
                const category = skill.category || 'Kärnkompetenser';
                if (!acc[category]) acc[category] = [];
                // Handle both individual skills and skill objects with skills array
                if (skill.skills && Array.isArray(skill.skills)) {
                  acc[category].push(...skill.skills.map((s: string) => ({ name: s })));
                } else {
                  acc[category].push(skill);
                }
                return acc;
              }, {})
            ).map(([category, skills]) => `
              <div class="skill-category-executive">
                <h4 class="skill-category-title">${category}</h4>
                <div class="skills-list">
                  ${((skills as any[]) || []).map((skill: any) => `
                    <div class="skill-item">${skill.name || skill}</div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- EDUCATION & QUALIFICATIONS -->
        ${(cvData.education || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.education}</h2>
          </div>
          
          ${(cvData.education || []).map(edu => `
            <div class="education-item no-page-break">
              <div>
                <div class="degree-title">${edu.degree}</div>
                <div class="institution-name">${edu.institution}</div>
                ${edu.description ? `<div class="job-description">${edu.description}</div>` : ''}
              </div>
              <div class="education-details">
                <div class="education-date">${edu.startDate ? formatDateRange(edu.startDate, edu.endDate) : (edu.graduationYear || '')}</div>
                ${edu.gpa ? `<div class="education-grade">Betyg: ${edu.gpa}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- LANGUAGES -->
        ${(cvData.languages || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.languages}</h2>
          </div>
          
          <div class="languages-executive">
            ${(cvData.languages || []).map(lang => `
              <div class="language-item">
                <span class="language-name">${lang.language}</span>
                <span class="language-level">${lang.proficiency}</span>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- PROFESSIONAL CERTIFICATIONS -->
        ${(cvData.certifications || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Professionella Certifieringar</h2>
          </div>
          
          ${(cvData.certifications || []).map(cert => `
            <div class="certification-item no-page-break">
              <div>
                <div class="certification-name">${cert.name}</div>
                <div class="certification-issuer">${cert.issuer}</div>
              </div>
              <div class="certification-date">
                ${cert.date}
                ${cert.credentialId ? `<br><small>Credential ID: ${cert.credentialId}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- EXECUTIVE FOOTER -->
        <footer style="margin-top: 2cm; text-align: center; font-size: 9pt; color: #6b7280; font-family: 'Inter', sans-serif;">
          <div class="executive-separator"></div>
          <p style="font-style: italic;">
            Detta dokument innehåller konfidentiell information. 
            Alla uppgifter är korrekta per ${new Date().toLocaleDateString('sv-SE')}.
          </p>
        </footer>
      </body>
      </html>
    `;
  }
};