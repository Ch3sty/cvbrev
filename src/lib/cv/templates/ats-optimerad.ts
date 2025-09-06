import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const atsOptimeradCVTemplate: CVTemplate = {
  id: 'ats-optimerad',
  name: 'ATS Premium',
  description: 'Perfekt balans mellan ATS-kompatibilitet och premium professional appeal för svenska arbetsmarknaden',
  category: 'ATS Excellence',
  bestFor: ['Enterprise', 'Multinationella företag', 'Konsultbolag', 'Svenska ATS-system', 'LinkedIn Easy Apply'],
  features: ['Svensk ATS-optimerad', 'Premium typography', 'Keyword-strategisk', 'Clean hierarchy', 'Professional impact'],
  colorSchemes: ['professional', 'executive', 'corporate'],
  previewImage: '/images/cv-templates/ats-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'ats-optimerad');
    const atsSchemes = {
      professional: { primary: '#2563eb', text: '#1f2937', light: '#f8fafc' },
      executive: { primary: '#374151', text: '#111827', light: '#f9fafb' },
      corporate: { primary: '#1e40af', text: '#1f2937', light: '#f1f5f9' }
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
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: ${colors.text};
            background: white;
          }
          
          .cv-container {
            max-width: 100%;
          }
          
          .header {
            margin-bottom: 1.5cm;
          }
          
          .name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 0.5cm;
          }
          
          .contact-info {
            font-size: 11pt;
            margin-bottom: 0.5cm;
          }
          
          .section {
            margin-bottom: 1.2cm;
            break-inside: avoid;
          }
          
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 0.6cm;
            text-transform: uppercase;
          }
          
          .experience-item, .education-item {
            margin-bottom: 1cm;
            break-inside: avoid;
          }
          
          .job-title, .degree {
            font-weight: bold;
            margin-bottom: 0.2cm;
          }
          
          .company, .institution {
            font-weight: bold;
            margin-bottom: 0.2cm;
          }
          
          .date-location {
            margin-bottom: 0.3cm;
          }
          
          .description ul {
            margin-left: 1.2cm;
            margin-top: 0.3cm;
          }
          
          .description li {
            margin-bottom: 0.2cm;
          }
          
          .skills-section {
            margin-bottom: 0.8cm;
          }
          
          .skill-category-title {
            font-weight: bold;
            margin-bottom: 0.3cm;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <header class="header">
            <h1 class="name">${cvData.personalInfo.fullName}</h1>
            <div class="contact-info">
              Email: ${cvData.personalInfo.email}<br>
              ${cvData.personalInfo.phone ? `Telefon: ${cvData.personalInfo.phone}<br>` : ''}
              ${cvData.personalInfo.address ? `Adress: ${cvData.personalInfo.address}<br>` : ''}
              ${cvData.personalInfo.linkedIn ? `LinkedIn: ${cvData.personalInfo.linkedIn}<br>` : ''}
            </div>
          </header>

          <!-- Summary -->
          ${cvData.summary ? `
          <section class="section">
            <h2 class="section-title">Professionell Sammanfattning</h2>
            <p>${cvData.summary}</p>
          </section>
          ` : ''}

          <!-- Experience -->
          <section class="section">
            <h2 class="section-title">${headings.experience}</h2>
            ${cvData.experience.map(exp => `
            <div class="experience-item">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company}</div>
              <div class="date-location">
                ${formatDateRange(exp.startDate, exp.endDate)}
                ${exp.location ? ` - ${exp.location}` : ''}
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
                ${edu.location ? ` - ${edu.location}` : ''}
              </div>
            </div>
            `).join('')}
          </section>

          <!-- Skills -->
          ${cvData.skills && cvData.skills.length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.skills}</h2>
            ${cvData.skills.map(skillCategory => `
            <div class="skills-section">
              <div class="skill-category-title">${skillCategory.category}:</div>
              <div>${skillCategory.skills.join(', ')}</div>
            </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- Languages -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <section class="section">
            <h2 class="section-title">${headings.languages}</h2>
            <div>${cvData.languages.map(lang => `${lang.language}: ${lang.proficiency}`).join(', ')}</div>
          </section>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
};