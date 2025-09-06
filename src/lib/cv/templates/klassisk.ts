import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const klassiskCVTemplate: CVTemplate = {
  id: 'klassisk',
  name: 'Klassisk Premium',
  description: 'Elegant svensk företagstradition med moderna premium-detaljer för ledande positioner',
  category: 'Executive',
  bestFor: ['Finanssektorn', 'Juridik', 'Konsultverksamhet', 'Offentlig förvaltning', 'C-level positioner'],
  features: ['Swedish Executive Design', 'Premium Typography', 'Elegant Hierarchy', 'Trust Indicators'],
  colorSchemes: ['navy', 'charcoal', 'forest'],
  previewImage: '/images/cv-templates/klassisk-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const colorScheme = {
      navy: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#dbeafe', text: '#1e293b' },
      charcoal: { primary: '#374151', secondary: '#6b7280', accent: '#f3f4f6', text: '#111827' },
      forest: { primary: '#064e3b', secondary: '#059669', accent: '#d1fae5', text: '#1f2937' }
    };
    const colors = colorScheme[options.colorScheme as keyof typeof colorScheme] || colorScheme.navy;
    
    // Generate dynamic headings based on CV content and industry
    const headings = generateDynamicHeadings(cvData, 'klassisk');

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
          
          @page {
            size: A4;
            margin: 2cm 1.8cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Crimson Text', Georgia, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: ${colors.text};
            background: white;
          }
          
          /* PREMIUM HEADER DESIGN */
          .cv-header {
            border-bottom: 1px solid ${colors.accent};
            padding-bottom: 1.5cm;
            margin-bottom: 1.8cm;
            position: relative;
          }
          
          .cv-header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
          }
          
          .header-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2cm;
            align-items: center;
          }
          
          .name {
            font-family: 'Inter', sans-serif;
            font-size: 28pt;
            font-weight: 300;
            color: ${colors.primary};
            margin-bottom: 0.4cm;
            letter-spacing: -0.5px;
            line-height: 1.1;
          }
          
          .professional-title {
            font-size: 14pt;
            font-weight: 600;
            color: ${colors.secondary};
            margin-bottom: 0.8cm;
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .executive-summary {
            font-size: 12pt;
            line-height: 1.7;
            color: #4b5563;
            text-align: justify;
            font-style: italic;
          }
          
          .contact-elegant {
            text-align: right;
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            line-height: 1.8;
          }
          
          .contact-item {
            margin-bottom: 0.4cm;
            color: ${colors.text};
            display: flex;
            align-items: center;
            justify-content: flex-end;
          }
          
          .contact-icon {
            width: 16px;
            height: 16px;
            background: ${colors.primary};
            color: white;
            border-radius: 2px;
            margin-left: 0.3cm;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8pt;
          }
          
          /* SOPHISTICATED SECTIONS */
          .section {
            margin-bottom: 2cm;
            break-inside: avoid;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.2cm;
            padding-bottom: 0.4cm;
            border-bottom: 1px solid ${colors.accent};
          }
          
          .section-title {
            font-family: 'Inter', sans-serif;
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.primary};
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
          }
          
          .section-ornament {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            border-radius: 3px;
            margin-right: 0.8cm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          /* PREMIUM EXPERIENCE CARDS */
          .experience-entry {
            margin-bottom: 1.5cm;
            padding: 1.2cm;
            background: linear-gradient(135deg, ${colors.accent}40, transparent);
            border-left: 4px solid ${colors.primary};
            border-radius: 0 8px 8px 0;
            break-inside: avoid;
          }
          
          .position-header {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1cm;
            align-items: start;
            margin-bottom: 0.8cm;
          }
          
          .position-title {
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            font-family: 'Inter', sans-serif;
          }
          
          .company-name {
            font-size: 11pt;
            font-weight: 500;
            color: ${colors.text};
            margin-bottom: 0.2cm;
          }
          
          .tenure-badge {
            background: ${colors.primary};
            color: white;
            padding: 0.3cm 0.8cm;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 500;
            text-align: center;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 2px 4px ${colors.primary}30;
          }
          
          .achievements-list {
            list-style: none;
            margin-top: 0.6cm;
          }
          
          .achievement-item {
            margin-bottom: 0.4cm;
            padding-left: 1cm;
            position: relative;
            line-height: 1.7;
          }
          
          .achievement-item::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: ${colors.secondary};
            font-weight: 600;
          }
          
          /* ELEGANT EDUCATION */
          .education-entry {
            margin-bottom: 1cm;
            padding: 0.8cm 1cm;
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          
          .degree-title {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .institution-name {
            font-size: 10pt;
            color: ${colors.text};
            font-weight: 400;
          }
          
          .graduation-year {
            font-size: 9pt;
            color: #6b7280;
            float: right;
            font-family: 'Inter', sans-serif;
          }
          
          /* SOPHISTICATED SKILLS */
          .skills-matrix {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5cm;
          }
          
          .skill-category {
            margin-bottom: 1cm;
          }
          
          .category-title {
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding-bottom: 0.2cm;
            border-bottom: 1px solid ${colors.accent};
          }
          
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
          }
          
          .skill-tag {
            background: ${colors.primary}15;
            color: ${colors.text};
            padding: 0.2cm 0.6cm;
            border-radius: 12px;
            font-size: 9pt;
            font-weight: 500;
            border: 1px solid ${colors.primary}20;
          }
          
          /* LANGUAGE PROFICIENCY */
          .languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.8cm;
          }
          
          .language-item {
            text-align: center;
            padding: 0.6cm;
            background: ${colors.accent}50;
            border-radius: 8px;
            border: 1px solid ${colors.accent};
          }
          
          .language-name {
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.2cm;
          }
          
          .proficiency-level {
            font-size: 9pt;
            color: #6b7280;
            font-family: 'Inter', sans-serif;
          }
          
          /* PRINT OPTIMIZATIONS */
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .experience-entry { break-inside: avoid; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Premium Header -->
          <header class="cv-header">
            <div class="header-grid">
              <div class="header-content">
                <h1 class="name">${cvData.personalInfo.fullName}</h1>
                <div class="professional-title">${cvData.targetRole || 'Yrkesprofessionell'}</div>
                <div class="executive-summary">
                  ${cvData.summary || 'Erfaren yrkesperson med gedigen kompetens och måldriven fokus på att leverera resultat och värde.'}
                </div>
              </div>
              <div class="contact-elegant">
                <div class="contact-item">
                  ${cvData.personalInfo.email}
                  <div class="contact-icon">✉</div>
                </div>
                ${cvData.personalInfo.phone ? `
                <div class="contact-item">
                  ${cvData.personalInfo.phone}
                  <div class="contact-icon">☎</div>
                </div>
                ` : ''}
                ${cvData.personalInfo.address ? `
                <div class="contact-item">
                  ${cvData.personalInfo.address}
                  <div class="contact-icon">⌂</div>
                </div>
                ` : ''}
                ${cvData.personalInfo.linkedIn ? `
                <div class="contact-item">
                  LinkedIn
                  <div class="contact-icon">in</div>
                </div>
                ` : ''}
              </div>
            </div>
          </header>

          <!-- Professional Experience -->
          <section class="section">
            <div class="section-header">
              <div class="section-ornament">★</div>
              <h2 class="section-title">${headings.experience}</h2>
            </div>
            ${cvData.experience.map(exp => `
            <div class="experience-entry">
              <div class="position-header">
                <div>
                  <div class="position-title">${exp.position}</div>
                  <div class="company-name">${exp.company}</div>
                  ${exp.location ? `<div style="font-size: 9pt; color: #6b7280; margin-top: 0.2cm;">${exp.location}</div>` : ''}
                </div>
                <div class="tenure-badge">${formatDateRange(exp.startDate, exp.endDate)}</div>
              </div>
              <ul class="achievements-list">
                ${exp.description.map(desc => `<li class="achievement-item">${desc}</li>`).join('')}
              </ul>
            </div>
            `).join('')}
          </section>

          <!-- Education -->
          <section class="section">
            <div class="section-header">
              <div class="section-ornament">🎓</div>
              <h2 class="section-title">${headings.education}</h2>
            </div>
            ${cvData.education.map(edu => `
            <div class="education-entry">
              <div class="graduation-year">${edu.graduationYear || ''}</div>
              <div class="degree-title">${edu.degree}</div>
              <div class="institution-name">${edu.institution}</div>
              ${edu.honors ? `<div style="font-size: 9pt; color: ${colors.secondary}; margin-top: 0.3cm; font-style: italic;">${edu.honors}</div>` : ''}
            </div>
            `).join('')}
          </section>

          <!-- Core Competencies -->
          ${cvData.skills && cvData.skills.length > 0 ? `
          <section class="section">
            <div class="section-header">
              <div class="section-ornament">⚡</div>
              <h2 class="section-title">${headings.skills}</h2>
            </div>
            <div class="skills-matrix">
              ${cvData.skills.map(skillCategory => `
              <div class="skill-category">
                <div class="category-title">${skillCategory.category}</div>
                <div class="skills-list">
                  ${skillCategory.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Languages -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <section class="section">
            <div class="section-header">
              <div class="section-ornament">🌍</div>
              <h2 class="section-title">${headings.languages}</h2>
            </div>
            <div class="languages-grid">
              ${cvData.languages.map(lang => `
              <div class="language-item">
                <div class="language-name">${lang.language}</div>
                <div class="proficiency-level">${lang.proficiency}</div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
};