// src/lib/cv/templates/klassisk-svenska.ts
// Klassisk kronologisk svenska CV-mall enligt Arbetsförmedlingens standarder

import { 
  CVTemplate, 
  CVMetadata, 
  CVGenerationOptions, 
  formatDateRange,
  shouldShowSection,
  generateDynamicHeadings 
} from '../cv-metadata';

export const klassiskSvenskaTemplate: CVTemplate = {
  id: 'klassisk',
  name: 'Klassisk Svensk',
  description: 'Traditionell kronologisk layout som följer svenska CV-standarder. Perfekt för konservativa branscher och erfarna yrkespersoner.',
  designStyle: 'Tidlös professionalitet med högre trovärdighet',
  visualFeatures: [
    'Enspaltig layout med klassisk hierarki',
    'Diskret pink-accent för elegant touch',
    'Standardiserade svenska rubriker',
    'Optimal läsbarhet med Helvetica',
    'ATS-kompatibel struktur'
  ],
  features: [
    'Följer Arbetsförmedlingens riktlinjer',
    '1-2 sidor enligt svenska normer',
    'Kronologisk erfarenhetsstruktur',
    'Professionell sammanfattning',
    'Svenska datumformat',
    'Referenser på begäran',
    'GDPR-kompatibel'
  ],
  colorSchemes: ['blue', 'navy', 'purple'],
  previewImage: '/images/cv-templates/klassisk-preview.jpg',
  
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions): string => {
    const headings = generateDynamicHeadings(cvData, 'klassisk');
    const colors = getColorScheme(options.colorScheme || 'blue');
    
    return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${cvData.personalInfo.fullName}</title>
    <style>
        ${getClassicSwedishCSS(colors)}
    </style>
</head>
<body class="classic-swedish-cv">
    <div class="cv-container">
        ${generateHeader(cvData)}
        ${generateSummarySection(cvData, headings)}
        ${generateExperienceSection(cvData, headings)}
        ${generateEducationSection(cvData, headings)}
        ${generateSkillsSection(cvData, headings)}
        ${shouldShowSection('languages', cvData) ? generateLanguagesSection(cvData, headings) : ''}
        ${shouldShowSection('certifications', cvData) ? generateCertificationsSection(cvData, headings) : ''}
        ${shouldShowSection('projects', cvData) ? generateProjectsSection(cvData, headings) : ''}
        ${shouldShowSection('interests', cvData) ? generateInterestsSection(cvData, headings) : ''}
        ${generateReferencesSection(cvData)}
    </div>
</body>
</html>`;
  }
};

function getColorScheme(scheme: string) {
  const schemes = {
    blue: {
      primary: '#131B32',
      accent: '#EC4899', 
      text: '#374151',
      light: '#F8FAFC'
    },
    navy: {
      primary: '#1E293B',
      accent: '#EC4899',
      text: '#334155', 
      light: '#F1F5F9'
    },
    purple: {
      primary: '#581C87',
      accent: '#EC4899',
      text: '#374151',
      light: '#FAF5FF'
    }
  };
  return schemes[scheme as keyof typeof schemes] || schemes.blue;
}

function getClassicSwedishCSS(colors: any): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.4;
      color: ${colors.text};
      background: white;
      font-size: 11pt;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm 15mm;
      min-height: 297mm;
    }
    
    /* Header Styles */
    .cv-header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid ${colors.accent};
    }
    
    .cv-name {
      font-size: 24pt;
      font-weight: bold;
      color: ${colors.primary};
      margin-bottom: 8px;
      letter-spacing: -0.025em;
    }
    
    .cv-title {
      font-size: 14pt;
      color: ${colors.text};
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .contact-info {
      font-size: 10pt;
      color: ${colors.text};
      line-height: 1.3;
    }
    
    .contact-info div {
      margin-bottom: 3px;
    }
    
    /* Section Styles */
    .cv-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid ${colors.accent};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Summary Section */
    .summary-content {
      font-size: 11pt;
      line-height: 1.5;
      text-align: justify;
      margin-bottom: 5px;
    }
    
    /* Experience Section */
    .experience-item {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    
    .job-title {
      font-size: 12pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2px;
    }
    
    .company-name {
      font-size: 11pt;
      color: ${colors.text};
      font-weight: 500;
    }
    
    .job-dates {
      font-size: 10pt;
      color: ${colors.text};
      font-variant-numeric: tabular-nums;
      text-align: right;
      white-space: nowrap;
    }
    
    .job-location {
      font-size: 10pt;
      color: ${colors.text};
      font-style: italic;
    }
    
    .job-description {
      margin-top: 6px;
    }
    
    .job-description ul {
      list-style-type: none;
      padding-left: 0;
    }
    
    .job-description li {
      position: relative;
      padding-left: 15px;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    
    .job-description li::before {
      content: '•';
      color: ${colors.accent};
      position: absolute;
      left: 0;
      font-weight: bold;
    }
    
    /* Education Section */
    .education-item {
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    
    .education-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    
    .degree-name {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
    }
    
    .institution-name {
      font-size: 11pt;
      color: ${colors.text};
    }
    
    .education-dates {
      font-size: 10pt;
      color: ${colors.text};
      font-variant-numeric: tabular-nums;
    }
    
    /* Skills Section */
    .skills-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .skill-category {
      margin-bottom: 10px;
    }
    
    .skill-category-title {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 4px;
    }
    
    .skill-items {
      font-size: 10pt;
      line-height: 1.4;
    }
    
    .skill-item {
      display: inline;
    }
    
    .skill-item:not(:last-child)::after {
      content: ' • ';
      color: ${colors.accent};
      font-weight: bold;
    }
    
    /* Languages Section */
    .languages-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    
    .language-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10pt;
    }
    
    .language-name {
      font-weight: 500;
      color: ${colors.text};
    }
    
    .language-level {
      color: ${colors.primary};
      font-size: 9pt;
    }
    
    /* Projects Section */
    .project-item {
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    
    .project-title {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 3px;
    }
    
    .project-description {
      font-size: 10pt;
      line-height: 1.3;
    }
    
    /* Certifications Section */
    .certification-item {
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .certification-name {
      font-size: 10pt;
      font-weight: 500;
      color: ${colors.text};
    }
    
    .certification-issuer {
      font-size: 9pt;
      color: ${colors.text};
      font-style: italic;
    }
    
    .certification-date {
      font-size: 9pt;
      color: ${colors.text};
      font-variant-numeric: tabular-nums;
    }
    
    /* Interests Section */
    .interests-content {
      font-size: 10pt;
      line-height: 1.4;
    }
    
    .interest-item {
      display: inline;
    }
    
    .interest-item:not(:last-child)::after {
      content: ' • ';
      color: ${colors.accent};
      font-weight: bold;
    }
    
    /* References Section */
    .references-content {
      font-size: 10pt;
      font-style: italic;
      color: ${colors.text};
      text-align: center;
      margin-top: 10px;
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
        padding: 15mm;
      }
      
      .cv-section {
        page-break-inside: avoid;
      }
      
      .experience-item,
      .education-item,
      .project-item {
        page-break-inside: avoid;
      }
    }
    
    /* Responsive adjustments for screen */
    @media screen and (max-width: 768px) {
      .cv-container {
        padding: 20px;
      }
      
      .job-header,
      .education-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .job-dates,
      .education-dates {
        text-align: left;
        margin-top: 4px;
      }
    }
  `;
}

function generateHeader(cvData: CVMetadata): string {
  const { personalInfo } = cvData;
  const professionalTitle = personalInfo.title || '';
  
  return `
    <div class="cv-header">
      <h1 class="cv-name">${personalInfo.fullName}</h1>
      ${professionalTitle ? `<div class="cv-title">${professionalTitle}</div>` : ''}
      <div class="contact-info">
        ${personalInfo.email ? `<div><strong>E-post:</strong> ${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div><strong>Telefon:</strong> ${personalInfo.phone}</div>` : ''}
        ${personalInfo.address ? `<div><strong>Adress:</strong> ${personalInfo.address}</div>` : ''}
        ${personalInfo.linkedIn ? `<div><strong>LinkedIn:</strong> ${personalInfo.linkedIn}</div>` : ''}
        ${personalInfo.website ? `<div><strong>Webbsida:</strong> ${personalInfo.website}</div>` : ''}
      </div>
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
      <div class="job-header">
        <div>
          <div class="job-title">${exp.position}</div>
          <div class="company-name">${exp.company}</div>
          ${exp.location ? `<div class="job-location">${exp.location}</div>` : ''}
        </div>
        <div class="job-dates">
          ${formatDateRange(exp.startDate, exp.endDate)}
        </div>
      </div>
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
      <div class="education-header">
        <div>
          <div class="degree-name">${edu.degree}</div>
          <div class="institution-name">${edu.institution}</div>
          ${edu.location ? `<div class="job-location">${edu.location}</div>` : ''}
        </div>
        <div class="education-dates">
          ${edu.graduationYear || edu.endDate || ''}
        </div>
      </div>
      ${edu.description ? `<div class="project-description">${edu.description}</div>` : ''}
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
  if (!shouldShowSection('skills', cvData)) {
    return '';
  }
  
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
      <div class="languages-container">
        ${languageItems}
      </div>
    </div>
  `;
}

function generateCertificationsSection(cvData: CVMetadata, headings: any): string {
  const certificationItems = cvData.certifications!.map(cert => `
    <div class="certification-item">
      <div>
        <div class="certification-name">${cert.name}</div>
        <div class="certification-issuer">${cert.issuer}</div>
      </div>
      ${cert.issueDate || cert.date ? `<div class="certification-date">${cert.issueDate || cert.date}</div>` : ''}
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
      ${project.technologies ? `<div class="skill-items">${project.technologies.map(tech => `<span class="skill-item">${tech}</span>`).join('')}</div>` : ''}
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
    <div class="cv-section">
      <div class="references-content">
        ${referencesText}
      </div>
    </div>
  `;
}