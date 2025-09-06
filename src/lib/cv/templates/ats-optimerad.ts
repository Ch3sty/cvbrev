import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const atsOptimeradCVTemplate: CVTemplate = {
  id: 'ats-optimerad',
  name: 'ATS-Optimerad Excellence',
  description: 'Maximerad kompatibilitet med svenska ATS-system kombinerat med premium professionell presentation',
  category: 'Technical Excellence',
  bestFor: ['Stora företag', 'Multinationella bolag', 'ATS-system', 'Digital ansökan', 'Svenska rekryteringsplattformar'],
  features: ['100% ATS-kompatibel', 'Parseable structure', 'Keyword optimization', 'System compatibility', 'Sweden optimized'],
  colorSchemes: ['professional', 'corporate', 'neutral', 'executive', 'digital', 'clean'],
  previewImage: '/images/cv-templates/ats-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'ats-optimerad');
    const atsSchemes = {
      professional: { primary: '#2563eb', secondary: '#3b82f6', text: '#1f2937', light: '#f8fafc', accent: '#1e40af' },
      corporate: { primary: '#374151', secondary: '#4b5563', text: '#111827', light: '#f9fafb', accent: '#1f2937' },
      neutral: { primary: '#6b7280', secondary: '#9ca3af', text: '#1f2937', light: '#f9fafb', accent: '#4b5563' },
      executive: { primary: '#1e293b', secondary: '#334155', text: '#0f172a', light: '#f8fafc', accent: '#0f172a' },
      digital: { primary: '#0ea5e9', secondary: '#38bdf8', text: '#1e293b', light: '#f0f9ff', accent: '#0284c7' },
      clean: { primary: '#525252', secondary: '#737373', text: '#171717', light: '#fafafa', accent: '#404040' }
    };
    const colors = atsSchemes[options.colorScheme as keyof typeof atsSchemes] || atsSchemes.professional;
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'Source Sans Pro', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: ${colors.text};
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          
          .cv-container {
            max-width: 100%;
            background: white;
          }
          
          .header {
            margin-bottom: 8mm;
            padding-bottom: 4mm;
            border-bottom: 1px solid ${colors.light};
          }
          
          .name {
            font-family: 'Inter', sans-serif;
            font-size: 22pt;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 3mm;
            letter-spacing: -0.5px;
          }
          
          .title {
            font-size: 12pt;
            color: ${colors.secondary};
            font-weight: 500;
            margin-bottom: 4mm;
          }
          
          .contact-info {
            font-size: 10pt;
            color: ${colors.text};
            line-height: 1.3;
          }
          
          .contact-info div {
            margin-bottom: 1mm;
          }
          
          .contact-info strong {
            font-weight: 500;
            color: ${colors.primary};
          }
          
          .section {
            margin-bottom: 6mm;
            break-inside: avoid;
          }
          
          .section-title {
            font-family: 'Inter', sans-serif;
            font-size: 13pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 4mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid ${colors.light};
            padding-bottom: 2mm;
          }
          
          .experience-item, .education-item {
            margin-bottom: 5mm;
            break-inside: avoid;
          }
          
          .job-title, .degree {
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.text};
            margin-bottom: 1mm;
          }
          
          .company, .institution {
            font-size: 11pt;
            font-weight: 500;
            color: ${colors.primary};
            margin-bottom: 1mm;
          }
          
          .date-location {
            font-size: 10pt;
            color: ${colors.secondary};
            margin-bottom: 2mm;
            font-weight: 400;
          }
          
          .description {
            margin-top: 2mm;
          }
          
          .description ul {
            margin-left: 5mm;
            list-style-type: disc;
          }
          
          .description li {
            margin-bottom: 1mm;
            font-size: 10.5pt;
            line-height: 1.3;
          }
          
          .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120mm, 1fr));
            gap: 3mm;
            margin-bottom: 4mm;
          }
          
          .skills-category {
            break-inside: avoid;
          }
          
          .skill-category-title {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 2mm;
          }
          
          .skill-list {
            font-size: 10pt;
            line-height: 1.3;
            color: ${colors.text};
          }
          
          .languages-list {
            font-size: 10pt;
            line-height: 1.3;
            color: ${colors.text};
          }
          
          .summary {
            font-size: 11pt;
            line-height: 1.4;
            color: ${colors.text};
            text-align: justify;
          }
          
          .certifications-item {
            margin-bottom: 3mm;
            break-inside: avoid;
          }
          
          .cert-name {
            font-size: 11pt;
            font-weight: 600;
            color: ${colors.text};
          }
          
          .cert-issuer {
            font-size: 10pt;
            color: ${colors.secondary};
            font-weight: 400;
          }
          
          .cert-date {
            font-size: 9pt;
            color: ${colors.secondary};
            font-weight: 400;
          }
          
          .keyword-optimized {
            position: absolute;
            left: -9999px;
            font-size: 1px;
            color: transparent;
          }
          
          @media print {
            body {
              font-size: 11pt;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .cv-container {
              max-width: none;
            }
            
            .section {
              break-inside: avoid;
            }
            
            .experience-item, .education-item {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <header class="header">
            <h1 class="name">${cvData.personalInfo.fullName}</h1>
            ${cvData.personalInfo.title ? `<div class="title">${cvData.personalInfo.title}</div>` : ''}
            <div class="contact-info">
              <div><strong>E-post:</strong> ${cvData.personalInfo.email}</div>
              ${cvData.personalInfo.phone ? `<div><strong>Telefon:</strong> ${cvData.personalInfo.phone}</div>` : ''}
              ${cvData.personalInfo.address ? `<div><strong>Adress:</strong> ${cvData.personalInfo.address}</div>` : ''}
              ${cvData.personalInfo.linkedIn ? `<div><strong>LinkedIn:</strong> ${cvData.personalInfo.linkedIn}</div>` : ''}
              ${cvData.personalInfo.website ? `<div><strong>Webbsida:</strong> ${cvData.personalInfo.website}</div>` : ''}
            </div>
          </header>

          <!-- ATS Keywords (hidden but parseable) -->
          <div class="keyword-optimized" aria-hidden="true">
            CV Curriculum Vitae Resume Meritförteckning ${cvData.personalInfo.fullName} 
            ${cvData.skills?.map(cat => (cat.skills || []).join(' ')).join(' ') || ''}
            ${cvData.experience?.map(exp => exp.position + ' ' + exp.company).join(' ') || ''}
          </div>

          <!-- Summary -->
          ${cvData.summary ? `
          <section class="section">
            <h2 class="section-title">Professionell Sammanfattning</h2>
            <div class="summary">${cvData.summary}</div>
          </section>
          ` : ''}

          <!-- Experience -->
          <section class="section">
            <h2 class="section-title">${headings.experience}</h2>
            ${(cvData.experience || []).map(exp => `
            <div class="experience-item">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company}</div>
              <div class="date-location">
                ${formatDateRange(exp.startDate, exp.endDate)}
                ${exp.location ? ` - ${exp.location}` : ''}
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
                ${edu.location ? ` - ${edu.location}` : ''}
              </div>
            </div>
            `).join('')}
          </section>

          <!-- Skills -->
          ${cvData.skills && cvData.skills.length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.skills}</h2>
            <div class="skills-grid">
              ${(cvData.skills || []).map(skillCategory => `
              <div class="skills-category">
                <div class="skill-category-title">${skillCategory.category}</div>
                <div class="skill-list">${(skillCategory.skills || []).join(' • ')}</div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Certifications -->
          ${cvData.certifications && cvData.certifications.length > 0 ? `
          <section class="section">
            <h2 class="section-title">Certifieringar</h2>
            ${(cvData.certifications || []).map(cert => `
            <div class="certifications-item">
              <div class="cert-name">${cert.name}</div>
              <div class="cert-issuer">${cert.issuer}</div>
              ${cert.date ? `<div class="cert-date">${cert.date}</div>` : ''}
            </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- Languages -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.languages}</h2>
            <div class="languages-list">${(cvData.languages || []).map(lang => `${lang.language}: ${lang.proficiency}`).join(' • ')}</div>
          </section>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
};