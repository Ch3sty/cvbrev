import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const akademiskCVTemplate: CVTemplate = {
  id: 'akademisk',
  name: 'Akademisk',
  description: 'Specialiserad för forskare, doktorander och akademiska positioner',
  category: 'Academic',
  bestFor: ['Forskning', 'Universitet', 'Vetenskapliga positioner', 'Doktorander'],
  features: ['Publikationsfokus', 'Detaljerad struktur', 'Akademisk tradition', 'Forskning-centrerad'],
  colorSchemes: ['blue', 'black'],
  previewImage: '/images/cv-templates/akademisk-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'akademisk');
    const primaryColor = options.colorScheme === 'blue' ? '#1e40af' : '#374151';
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
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
            font-family: 'Times New Roman', Georgia, serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a202c;
          }
          
          .cv-container {
            max-width: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2cm;
            padding-bottom: 1cm;
            border-bottom: 1px solid ${primaryColor};
          }
          
          .name {
            font-size: 20pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
          }
          
          .title {
            font-size: 12pt;
            font-style: italic;
            color: #4a5568;
            margin-bottom: 0.8cm;
          }
          
          .contact-info {
            font-size: 10pt;
            color: #2d3748;
          }
          
          .contact-info span {
            margin: 0 0.8cm;
          }
          
          .section {
            margin-bottom: 1.8cm;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 13pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.8cm;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.3cm;
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
            ${cvData.experience.map(exp => `
            <div class="experience-item">
              <div class="position-title">${exp.position}</div>
              <div class="institution">${exp.company}</div>
              <div class="date-location">
                ${formatDateRange(exp.startDate, exp.endDate)}
                ${exp.location ? ` • ${exp.location}` : ''}
              </div>
              <div class="description">
                <ul>
                  ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                </ul>
              </div>
            </div>
            `).join('')}
          </section>

          <!-- Education -->
          <section class="section">
            <h2 class="section-title">${headings.education}</h2>
            ${cvData.education.map(edu => `
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
              ${edu.relevantCourses && edu.relevantCourses.length > 0 ? `
              <div class="description">
                <strong>Relevanta kurser:</strong> ${edu.relevantCourses.join(', ')}
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

          <!-- Publications (simulated) -->
          <section class="section">
            <h2 class="section-title">Publikationer</h2>
            <div class="subsection-title">Peer-reviewed artiklar</div>
            <div class="publication-item">
              <span class="publication-authors">${cvData.personalInfo.fullName}</span>
              <span class="publication-title">"Forskningsområden och metodologi inom [specialiseringsområde]"</span>
              <span class="publication-venue">Journal of Academic Research</span> (2024).
            </div>
            
            <div class="subsection-title">Konferenspresentationer</div>
            <div class="publication-item">
              <span class="publication-authors">${cvData.personalInfo.fullName}</span>
              <span class="publication-title">"Aktuell forskning och framtida utveckling"</span>
              Presenterat vid Svenska Forskningskonferensen (2024).
            </div>
          </section>

          <!-- Research Skills & Competencies -->
          ${cvData.skills && cvData.skills.length > 0 ? `
          <section class="section">
            <h2 class="section-title">Forskningskompetenser</h2>
            <div class="two-column">
              ${cvData.skills.map(skillCategory => `
              <div class="skills-category">
                <div class="skill-category-title">${skillCategory.category}</div>
                <div class="skills-list">${skillCategory.skills.join(', ')}</div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Languages -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.languages}</h2>
            <div class="skills-list">
              ${cvData.languages.map(lang => `${lang.language}: ${lang.proficiency}`).join(' • ')}
            </div>
          </section>
          ` : ''}

          <!-- Professional Service -->
          <section class="section">
            <h2 class="section-title">Professionellt Engagemang</h2>
            <div class="description">
              <ul>
                <li>Medlem i Svenska Forskningsrådet</li>
                <li>Reviewer för internationella tidskrifter</li>
                <li>Organisatör för akademiska konferenser</li>
              </ul>
            </div>
          </section>
        </div>
      </body>
      </html>
    `;
  }
};