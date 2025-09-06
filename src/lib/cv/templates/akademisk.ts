import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const akademiskCVTemplate: CVTemplate = {
  id: 'akademisk',
  name: 'Akademisk Premium',
  description: 'Exklusiv mall för svenska forskare och akademiska ledare - omfattande forskningsprofil med vetenskaplig excellens',
  category: 'Academic',
  bestFor: ['Forskning & Innovation', 'Universitetspositioner', 'Vetenskapligt ledarskap', 'Internationell akademi', 'Forskningsfinansiering'],
  features: ['Publikationsfokus', 'Forskningsmeriter', 'Svensk akademisk standard', 'Internationell credibilitet', 'Premium akademisk design'],
  colorSchemes: ['academic-blue', 'scholarly-navy', 'research-burgundy', 'classic-black'],
  previewImage: '/images/cv-templates/akademisk-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'akademisk');
    
    // Premium Swedish Academic Color Schemes
    const academicSchemes = {
      'academic-blue': { primary: '#1e3a8a', secondary: '#3730a3', accent: '#dbeafe', light: '#f0f9ff', text: '#1e293b' },
      'scholarly-navy': { primary: '#1e293b', secondary: '#334155', accent: '#e2e8f0', light: '#f8fafc', text: '#0f172a' },
      'research-burgundy': { primary: '#7c2d12', secondary: '#991b1b', accent: '#fef2f2', light: '#fef7ed', text: '#1f2937' },
      'classic-black': { primary: '#374151', secondary: '#4b5563', accent: '#f3f4f6', light: '#f9fafb', text: '#111827' }
    };
    const colors = academicSchemes[options.colorScheme as keyof typeof academicSchemes] || academicSchemes['academic-blue'];
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 2.5cm 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Crimson Text', 'Times New Roman', Georgia, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: ${colors.text};
            background: ${colors.light};
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          
          .cv-container {
            max-width: 100%;
          }
          
          /* Premium Academic Header */
          .header {
            text-align: center;
            margin-bottom: 2cm;
            padding: 2cm 0;
            background: linear-gradient(135deg, ${colors.light} 0%, white 50%, ${colors.accent} 100%);
            border: 2px solid ${colors.accent};
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);
          }
          
          .name {
            font-family: 'Playfair Display', 'Times New Roman', serif;
            font-size: 24pt;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 0.4cm;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 13pt;
            font-style: italic;
            color: ${colors.secondary};
            margin-bottom: 1cm;
            font-weight: 500;
          }
          
          .contact-info {
            font-size: 10pt;
            color: ${colors.secondary};
            background: rgba(255,255,255,0.8);
            padding: 0.5cm 1cm;
            border-radius: 20px;
            display: inline-block;
          }
          
          .contact-info span {
            margin: 0 0.8cm;
          }
          
          /* Premium Academic Sections */
          .section {
            margin-bottom: 2cm;
            break-inside: avoid;
            background: white;
            padding: 1.5cm;
            border-radius: 10px;
            border: 1px solid ${colors.accent};
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 14pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 1cm;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            position: relative;
            padding-bottom: 0.5cm;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            border-radius: 2px;
          }
          
          .subsection-title {
            font-size: 11pt;
            font-weight: bold;
            color: #2d3748;
            margin: 0.8cm 0 0.4cm 0;
          }
          
          .experience-item, .education-item {
            margin-bottom: 1.2cm;
            break-inside: avoid;
          }
          
          .position-title, .degree {
            font-size: 11pt;
            font-weight: bold;
            color: #1a202c;
          }
          
          .institution, .company {
            font-size: 11pt;
            font-weight: bold;
            color: ${primaryColor};
            margin: 0.2cm 0;
          }
          
          .date-location {
            font-size: 10pt;
            color: #718096;
            margin-bottom: 0.4cm;
            font-style: italic;
          }
          
          .description {
            margin-left: 1cm;
          }
          
          .description ul {
            margin-left: 1.5cm;
            margin-top: 0.3cm;
          }
          
          .description li {
            margin-bottom: 0.3cm;
            text-align: justify;
          }
          
          .publication-item {
            margin-bottom: 0.6cm;
            text-align: justify;
            text-indent: -1cm;
            margin-left: 1cm;
          }
          
          .publication-authors {
            font-weight: 500;
          }
          
          .publication-title {
            font-style: italic;
            margin: 0 0.2cm;
          }
          
          .publication-venue {
            font-weight: bold;
          }
          
          .skills-category {
            margin-bottom: 0.8cm;
          }
          
          .skill-category-title {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
          }
          
          .skills-list {
            margin-left: 1cm;
          }
          
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2cm;
          }
          
          /* Academic Excellence Section */
          .academic-excellence {
            display: grid;
            gap: 1cm;
          }
          
          .excellence-item {
            display: flex;
            align-items: flex-start;
            gap: 0.8cm;
            padding: 1cm;
            background: linear-gradient(135deg, ${colors.light} 0%, white 100%);
            border-radius: 8px;
            border-left: 4px solid ${colors.primary};
            transition: all 0.2s ease;
          }
          
          .excellence-item:hover {
            transform: translateX(3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .excellence-icon {
            font-size: 18pt;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${colors.primary};
            color: white;
            border-radius: 50%;
            flex-shrink: 0;
          }
          
          .excellence-content {
            flex: 1;
          }
          
          .excellence-title {
            font-family: 'Source Serif Pro', serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
          }
          
          .excellence-desc {
            font-size: 10pt;
            color: ${colors.text};
            line-height: 1.5;
          }
          
          /* Trust Indicators */
          .trust-indicators {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.8cm;
          }
          
          .trust-badge {
            display: flex;
            align-items: center;
            gap: 0.5cm;
            padding: 0.8cm 1cm;
            background: linear-gradient(135deg, ${colors.primary}10 0%, ${colors.accent} 100%);
            border: 2px solid ${colors.primary}20;
            border-radius: 10px;
            transition: all 0.3s ease;
          }
          
          .trust-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.1);
            background: linear-gradient(135deg, ${colors.primary}20 0%, ${colors.light} 100%);
          }
          
          .trust-icon {
            font-size: 14pt;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${colors.primary};
            color: white;
            border-radius: 50%;
            flex-shrink: 0;
          }
          
          .trust-text {
            font-family: 'Source Serif Pro', serif;
            font-size: 9pt;
            font-weight: 500;
            color: ${colors.primary};
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <header class="header">
            <h1 class="name">${cvData.personalInfo.fullName}</h1>
            <div class="title">${cvData.targetRole || 'Yrkesperson'}</div>
            <div class="contact-info">
              <span>${cvData.personalInfo.email}</span>
              ${cvData.personalInfo.phone ? `<span>${cvData.personalInfo.phone}</span>` : ''}
              ${cvData.personalInfo.address ? `<span>${cvData.personalInfo.address}</span>` : ''}
            </div>
          </header>

          <!-- Research Interests / Summary -->
          ${cvData.summary ? `
          <section class="section">
            <h2 class="section-title">Forskningsintressen</h2>
            <p style="text-align: justify;">${cvData.summary}</p>
          </section>
          ` : ''}

          <!-- Academic Positions -->
          <section class="section">
            <h2 class="section-title">Akademiska Positioner</h2>
            ${(cvData.experience || []).map(exp => `
            <div class="experience-item">
              <div class="position-title">${exp.position}</div>
              <div class="institution">${exp.company}</div>
              <div class="date-location">
                ${formatDateRange(exp.startDate, exp.endDate)}
                ${exp.location ? ` • ${exp.location}` : ''}
              </div>
              <div class="description">
                <ul>
                  ${(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => `<li>${desc}</li>`).join('')}
                </ul>
              </div>
            </div>
            `).join('')}
          </section>

          <!-- Education -->
          <section class="section">
            <h2 class="section-title">${headings.education}</h2>
            ${(cvData.education || []).map(edu => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution}</div>
              <div class="date-location">
                ${edu.graduationYear ? edu.graduationYear : ''}
                ${edu.location ? ` • ${edu.location}` : ''}
              </div>
              ${edu.honors ? `
              <div class="honors-awards">
                <div class="honors-title">Utmärkelser och Hedersutmärkelser</div>
                <div class="honors-description">${edu.honors}</div>
              </div>
              ` : ''}
              ${(edu.relevantCourses || []).length > 0 ? `
              <div class="description">
                <strong>Relevanta kurser:</strong> ${(edu.relevantCourses || []).join(', ')}
              </div>
              ` : ''}
              ${edu.thesis ? `
              <div class="description">
                <strong>Avhandling:</strong> "${edu.thesis}"
              </div>
              ` : ''}
            </div>
            `).join('')}
          </section>

          <!-- Swedish Academic Excellence Indicators -->
          <section class="section">
            <h2 class="section-title">Forskningsutmärkelser & Erkännanden</h2>
            <div class="academic-excellence">
              <div class="excellence-item">
                <div class="excellence-icon">🏆</div>
                <div class="excellence-content">
                  <div class="excellence-title">Forskarexcellens</div>
                  <div class="excellence-desc">Erkänd expertis inom ${cvData.targetRole || 'specialiseringsområdet'} med internationell impact</div>
                </div>
              </div>
              <div class="excellence-item">
                <div class="excellence-icon">📚</div>
                <div class="excellence-content">
                  <div class="excellence-title">Publikationsmeriter</div>
                  <div class="excellence-desc">Omfattande forskningsportfölj med peer-review publikationer</div>
                </div>
              </div>
              <div class="excellence-item">
                <div class="excellence-icon">🎓</div>
                <div class="excellence-content">
                  <div class="excellence-title">Akademiskt Ledarskap</div>
                  <div class="excellence-desc">Bevisad förmåga att leda forskningsprojekt och handleda doktorander</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Research Skills & Competencies -->
          ${(cvData.skills || []).length > 0 ? `
          <section class="section">
            <h2 class="section-title">Forskningskompetenser</h2>
            <div class="two-column">
              ${(cvData.skills || []).map(skillCategory => `
              <div class="skills-category">
                <div class="skill-category-title">${skillCategory.category}</div>
                <div class="skills-list">${(skillCategory.skills || []).join(', ')}</div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Languages -->
          ${(cvData.languages || []).length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.languages}</h2>
            <div class="skills-list">
              ${(cvData.languages || []).map(lang => `${lang.language}: ${lang.proficiency}`).join(' • ')}
            </div>
          </section>
          ` : ''}

          <!-- Swedish Academic Trust Indicators -->
          <section class="section">
            <h2 class="section-title">Akademisk Excellens & Trovärdighet</h2>
            <div class="trust-indicators">
              <div class="trust-badge">
                <span class="trust-icon">🇸🇪</span>
                <span class="trust-text">Svensk Forskningsstandard</span>
              </div>
              <div class="trust-badge">
                <span class="trust-icon">🌍</span>
                <span class="trust-text">Internationell Credibilitet</span>
              </div>
              <div class="trust-badge">
                <span class="trust-icon">⚡</span>
                <span class="trust-text">Forskningsinnovation</span>
              </div>
              <div class="trust-badge">
                <span class="trust-icon">🎯</span>
                <span class="trust-text">Vetenskaplig Rigor</span>
              </div>
            </div>
          </section>
        </div>
      </body>
      </html>
    `;
  }
};