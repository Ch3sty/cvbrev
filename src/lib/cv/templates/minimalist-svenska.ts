// src/lib/cv/templates/minimalist-svenska.ts
// Minimalistisk premium svenska CV-mall med "less-is-more" filosofi

import { 
  CVTemplate, 
  CVMetadata, 
  CVGenerationOptions, 
  formatDateRange,
  shouldShowSection,
  generateDynamicHeadings 
} from '../cv-metadata';

export const minimalistSvenskaTemplate: CVTemplate = {
  id: 'minimalistisk',
  name: 'Minimalistisk Premium',
  description: 'Sofistikerad enkelhet med maximal visuell impact. Perfect för senior roller och konservativa branscher som kräver elegans.',
  designStyle: 'Less-is-more luxury med maximal läsbarhet',
  visualFeatures: [
    'Generösa 20mm marginaler för luftighet',
    'Endast Navy-900, Navy-600 och Pink-500',
    'Helvetica Neue Light/Regular mix',
    'Större punktstorlekar för premium-känsla',
    'Strategiska indrag utan störande element'
  ],
  features: [
    'Maximal läsbarhet och professionalism',
    'Snabbare att uppdatera och anpassa',
    'Fungerar perfekt i alla branscher',
    'Aldrig går ur stil - tidlös design',
    'Fokuserar på innehåll över form',
    'Premium utan att verka överdrivet',
    'ATS-vänlig genom enkelhet'
  ],
  colorSchemes: ['minimalist'],
  previewImage: '/images/cv-templates/minimalist-preview.jpg',
  
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions): string => {
    const headings = generateDynamicHeadings(cvData, 'minimalistisk');
    const colors = getMinimalistColorScheme(options.colorScheme || 'minimalist');
    
    return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${cvData.personalInfo.fullName}</title>
    <style>
        ${getMinimalistCSS(colors)}
    </style>
</head>
<body class="minimalist-swedish-cv">
    <div class="cv-container">
        ${generateMinimalistHeader(cvData)}
        ${generateSummarySection(cvData, headings)}
        ${generateExperienceSection(cvData, headings)}
        ${generateEducationSection(cvData, headings)}
        ${shouldShowSection('skills', cvData) ? generateSkillsSection(cvData, headings) : ''}
        <div class="two-column-section">
          <div class="left-column">
            ${shouldShowSection('languages', cvData) ? generateLanguagesSection(cvData, headings) : ''}
            ${shouldShowSection('certifications', cvData) ? generateCertificationsSection(cvData, headings) : ''}
          </div>
          <div class="right-column">
            ${shouldShowSection('projects', cvData) ? generateProjectsSection(cvData, headings) : ''}
            ${shouldShowSection('interests', cvData) ? generateInterestsSection(cvData, headings) : ''}
          </div>
        </div>
        ${generateReferencesSection(cvData)}
    </div>
</body>
</html>`;
  }
};

function getMinimalistColorScheme(scheme: string = 'minimalist') {
  const schemes = {
    minimalist: {
      primary: '#131B32',      // Navy-900 - endast för rubriker och namn
      secondary: '#6B7280',    // Navy-600 - för sekundär text
      accent: '#EC4899',       // Pink-500 - endast för accent-linjer
      text: '#374151',         // Gray-700 - huvudtext
      white: '#FFFFFF',        // Ren vit bakgrund
      background: '#FAFAFA'    // Mycket subtil bakgrund om behövs
    }
  };
  return schemes[scheme as keyof typeof schemes] || schemes.minimalist;
}

function getMinimalistCSS(colors: any): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 300;
      line-height: 1.4;
      color: ${colors.text};
      background: ${colors.white};
      font-size: 12pt;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 30mm 20mm;
      min-height: 297mm;
    }
    
    /* Minimalist Header */
    .minimalist-header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid ${colors.accent};
    }
    
    .cv-name {
      font-size: 32pt;
      font-weight: 300;
      color: ${colors.primary};
      margin-bottom: 8px;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }
    
    .cv-title {
      font-size: 18pt;
      font-weight: 400;
      color: ${colors.secondary};
      margin-bottom: 16px;
      letter-spacing: -0.01em;
    }
    
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      font-size: 11pt;
      color: ${colors.text};
      margin-top: 12px;
    }
    
    .contact-item {
      position: relative;
    }
    
    .contact-item:not(:last-child)::after {
      content: '•';
      position: absolute;
      right: -14px;
      color: ${colors.accent};
      font-weight: normal;
    }
    
    /* Section Styles - Less is More */
    .cv-section {
      margin-bottom: 35px;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: 400;
      color: ${colors.primary};
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 40px;
      height: 1px;
      background: ${colors.accent};
    }
    
    /* Summary Section */
    .summary-content {
      font-size: 13pt;
      line-height: 1.6;
      color: ${colors.text};
      max-width: 600px;
      font-weight: 300;
    }
    
    /* Experience Section - Clean Typography */
    .experience-item {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    
    .job-title {
      font-size: 14pt;
      font-weight: 500;
      color: ${colors.primary};
      margin-bottom: 4px;
    }
    
    .job-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    
    .company-name {
      font-size: 12pt;
      color: ${colors.text};
      font-weight: 400;
    }
    
    .job-dates {
      font-size: 11pt;
      color: ${colors.secondary};
      font-variant-numeric: tabular-nums;
      margin-left: auto;
    }
    
    .job-location {
      font-size: 11pt;
      color: ${colors.secondary};
      font-style: italic;
      width: 100%;
      margin-top: 2px;
    }
    
    .job-description {
      margin-top: 12px;
    }
    
    .job-description ul {
      list-style: none;
      padding: 0;
    }
    
    .job-description li {
      margin-bottom: 6px;
      line-height: 1.4;
      font-size: 11pt;
      padding-left: 20px;
      position: relative;
    }
    
    .job-description li::before {
      content: '—';
      position: absolute;
      left: 0;
      color: ${colors.accent};
      font-weight: normal;
    }
    
    /* Education Section */
    .education-item {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .degree-name {
      font-size: 12pt;
      font-weight: 500;
      color: ${colors.primary};
      margin-bottom: 2px;
    }
    
    .education-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }
    
    .institution-name {
      font-size: 11pt;
      color: ${colors.text};
    }
    
    .education-dates {
      font-size: 10pt;
      color: ${colors.secondary};
      font-variant-numeric: tabular-nums;
    }
    
    /* Skills Section - Elegant Lists */
    .skills-container {
      max-width: 600px;
    }
    
    .skill-category {
      margin-bottom: 18px;
    }
    
    .skill-category-title {
      font-size: 12pt;
      font-weight: 500;
      color: ${colors.primary};
      margin-bottom: 8px;
    }
    
    .skill-items {
      font-size: 11pt;
      line-height: 1.5;
    }
    
    .skill-item {
      display: inline;
      color: ${colors.text};
    }
    
    .skill-item:not(:last-child)::after {
      content: ' • ';
      color: ${colors.secondary};
      font-weight: normal;
    }
    
    /* Two Column Section for Secondary Info */
    .two-column-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }
    
    /* Languages Section */
    .language-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 11pt;
      padding: 4px 0;
    }
    
    .language-name {
      font-weight: 400;
      color: ${colors.text};
    }
    
    .language-level {
      color: ${colors.secondary};
      font-size: 10pt;
    }
    
    /* Projects Section */
    .project-item {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .project-title {
      font-size: 12pt;
      font-weight: 500;
      color: ${colors.primary};
      margin-bottom: 4px;
    }
    
    .project-description {
      font-size: 10pt;
      line-height: 1.4;
      color: ${colors.text};
    }
    
    .project-technologies {
      margin-top: 4px;
      font-size: 9pt;
      color: ${colors.secondary};
      font-style: italic;
    }
    
    /* Certifications Section */
    .certification-item {
      margin-bottom: 10px;
      font-size: 11pt;
    }
    
    .certification-name {
      font-weight: 400;
      color: ${colors.text};
      margin-bottom: 2px;
    }
    
    .certification-details {
      font-size: 9pt;
      color: ${colors.secondary};
    }
    
    /* Interests Section */
    .interests-content {
      font-size: 11pt;
      line-height: 1.5;
      color: ${colors.text};
    }
    
    .interest-item {
      display: inline;
    }
    
    .interest-item:not(:last-child)::after {
      content: ' • ';
      color: ${colors.secondary};
      font-weight: normal;
    }
    
    /* References Section */
    .references-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${colors.accent};
    }
    
    .references-content {
      font-size: 11pt;
      color: ${colors.secondary};
      font-style: italic;
      text-align: center;
    }
    
    /* Print Optimization */
    @media print {
      body {
        font-size: 11pt;
        line-height: 1.3;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .cv-container {
        margin: 0;
        padding: 25mm 20mm;
      }
      
      .minimalist-header {
        margin-bottom: 30px;
      }
      
      .cv-section {
        margin-bottom: 25px;
      }
      
      .experience-item,
      .project-item {
        page-break-inside: avoid;
      }
      
      .two-column-section {
        gap: 30px;
      }
    }
    
    /* Mobile Responsive */
    @media screen and (max-width: 768px) {
      .cv-container {
        padding: 20px;
      }
      
      .cv-name {
        font-size: 24pt;
      }
      
      .cv-title {
        font-size: 14pt;
      }
      
      .contact-info {
        flex-direction: column;
        gap: 8px;
      }
      
      .contact-item:not(:last-child)::after {
        display: none;
      }
      
      .job-meta,
      .education-meta {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .job-dates,
      .education-dates {
        margin-left: 0;
        margin-top: 4px;
      }
      
      .two-column-section {
        grid-template-columns: 1fr;
        gap: 25px;
      }
    }
  `;
}

function generateMinimalistHeader(cvData: CVMetadata): string {
  const { personalInfo } = cvData;
  const professionalTitle = personalInfo.title || '';
  
  const contactItems = [
    { text: personalInfo.email, show: !!personalInfo.email },
    { text: personalInfo.phone, show: !!personalInfo.phone },
    { text: personalInfo.address, show: !!personalInfo.address },
    { text: personalInfo.linkedIn, show: !!personalInfo.linkedIn },
    { text: personalInfo.website, show: !!personalInfo.website }
  ].filter(item => item.show);
  
  return `
    <div class="minimalist-header">
      <h1 class="cv-name">${personalInfo.fullName}</h1>
      ${professionalTitle ? `<div class="cv-title">${professionalTitle}</div>` : ''}
      ${contactItems.length > 0 ? `
        <div class="contact-info">
          ${contactItems.map(item => `
            <span class="contact-item">${item.text}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function generateSummarySection(cvData: CVMetadata, headings: any): string {
  if (!cvData.summary || cvData.summary.trim() === '') {
    return '';
  }
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.summary}</h2>
      <div class="summary-content">${cvData.summary}</div>
    </div>
  `;
}

function generateExperienceSection(cvData: CVMetadata, headings: any): string {
  if (!cvData.experience || cvData.experience.length === 0) {
    return '';
  }
  
  const experienceItems = cvData.experience.map(exp => `
    <div class="experience-item">
      <div class="job-title">${exp.position}</div>
      <div class="job-meta">
        <div class="company-name">${exp.company}</div>
        <div class="job-dates">
          ${formatDateRange(exp.startDate, exp.endDate)}
        </div>
      </div>
      ${exp.location ? `<div class="job-location">${exp.location}</div>` : ''}
      ${exp.description && exp.description.length > 0 ? `
        <div class="job-description">
          <ul>
            ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.experience}</h2>
      ${experienceItems}
    </div>
  `;
}

function generateEducationSection(cvData: CVMetadata, headings: any): string {
  if (!cvData.education || cvData.education.length === 0) {
    return '';
  }
  
  const educationItems = cvData.education.map(edu => `
    <div class="education-item">
      <div class="degree-name">${edu.degree}</div>
      <div class="education-meta">
        <div class="institution-name">${edu.institution}</div>
        <div class="education-dates">
          ${edu.graduationYear || edu.endDate || ''}
        </div>
      </div>
      ${edu.location ? `<div class="job-location">${edu.location}</div>` : ''}
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.education}</h2>
      ${educationItems}
    </div>
  `;
}

function generateSkillsSection(cvData: CVMetadata, headings: any): string {
  const skillCategories = cvData.skills!.map(skillGroup => `
    <div class="skill-category">
      <div class="skill-category-title">${skillGroup.category}</div>
      <div class="skill-items">
        ${skillGroup.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
      </div>
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.skills}</h2>
      <div class="skills-container">
        ${skillCategories}
      </div>
    </div>
  `;
}

function generateLanguagesSection(cvData: CVMetadata, headings: any): string {
  const languageItems = cvData.languages!.map(lang => `
    <div class="language-item">
      <span class="language-name">${lang.language}</span>
      <span class="language-level">${lang.proficiency}</span>
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.languages}</h2>
      ${languageItems}
    </div>
  `;
}

function generateCertificationsSection(cvData: CVMetadata, headings: any): string {
  const certificationItems = cvData.certifications!.map(cert => `
    <div class="certification-item">
      <div class="certification-name">${cert.name}</div>
      <div class="certification-details">
        ${cert.issuer}${(cert.issueDate || cert.date) ? ` • ${cert.issueDate || cert.date}` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.certifications}</h2>
      ${certificationItems}
    </div>
  `;
}

function generateProjectsSection(cvData: CVMetadata, headings: any): string {
  const projectItems = cvData.projects!.map(project => `
    <div class="project-item">
      <div class="project-title">${project.name || project.title}</div>
      <div class="project-description">${project.description}</div>
      ${project.technologies ? `
        <div class="project-technologies">${project.technologies.join(' • ')}</div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">${headings.projects}</h2>
      ${projectItems}
    </div>
  `;
}

function generateInterestsSection(cvData: CVMetadata, headings: any): string {
  const interestItems = cvData.interests!.map(interest => 
    `<span class="interest-item">${interest}</span>`
  ).join('');
  
  return `
    <div class="cv-section">
      <h2 class="section-title">Intressen</h2>
      <div class="interests-content">
        ${interestItems}
      </div>
    </div>
  `;
}

function generateReferencesSection(cvData: CVMetadata): string {
  const referencesText = cvData.references || 'Referenser lämnas på begäran';
  
  if (!referencesText.trim()) {
    return '';
  }
  
  return `
    <div class="references-section">
      <div class="references-content">
        ${referencesText}
      </div>
    </div>
  `;
}