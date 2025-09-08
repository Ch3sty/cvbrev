// src/lib/cv/templates/modern-svenska.ts
// Modern tvåkolumns svenska CV-mall med dynamisk layout och premium design

import { 
  CVTemplate, 
  CVMetadata, 
  CVGenerationOptions, 
  formatDateRange,
  shouldShowSection,
  generateDynamicHeadings 
} from '../cv-metadata';

export const modernSvenskaTemplate: CVTemplate = {
  id: 'modern',
  name: 'Modern Tvåkolumns',
  description: '70/30 split layout med sidokolumn för kontaktuppgifter och kompetenser. Perfekt balans mellan innovation och professionalitet.',
  designStyle: 'Dynamisk professionalism med visuell effektivitet',
  visualFeatures: [
    '70/30 split med huvudinnehåll och accent-kolumn',
    'Gradient header för modern känsla',
    'Progress bars för kompetensvisualisering', 
    'Diskret navy-50 bakgrund i sidokolumn',
    'Ikoner för snabb visuell igenkänning'
  ],
  features: [
    'Optimerad för moderna branscher',
    'Visuell hierarki med färgkodning',
    'Kompakt informationspresentation',
    'Skalbar för olika innehållsmängder',
    'Mobile-responsive struktur',
    'ATS-kompatibel trots avancerad design'
  ],
  colorSchemes: ['blue', 'navy', 'purple'],
  previewImage: '/images/cv-templates/modern-preview.jpg',
  
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions): string => {
    const headings = generateDynamicHeadings(cvData, 'modern');
    const colors = getModernColorScheme(options.colorScheme || 'blue');
    
    return `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${cvData.personalInfo.fullName}</title>
    <style>
        ${getModernSwedishCSS(colors)}
    </style>
</head>
<body class="modern-swedish-cv">
    <div class="cv-container">
        ${generateModernHeader(cvData, colors)}
        <div class="cv-content">
            <div class="main-column">
                ${generateSummarySection(cvData, headings)}
                ${generateExperienceSection(cvData, headings)}
                ${generateEducationSection(cvData, headings)}
                ${shouldShowSection('projects', cvData) ? generateProjectsSection(cvData, headings) : ''}
            </div>
            <div class="sidebar-column">
                ${generateContactSection(cvData)}
                ${shouldShowSection('skills', cvData) ? generateSkillsSection(cvData, headings) : ''}
                ${shouldShowSection('languages', cvData) ? generateLanguagesSection(cvData, headings) : ''}
                ${shouldShowSection('certifications', cvData) ? generateCertificationsSection(cvData, headings) : ''}
                ${shouldShowSection('interests', cvData) ? generateInterestsSection(cvData, headings) : ''}
            </div>
        </div>
        ${generateReferencesSection(cvData)}
    </div>
</body>
</html>`;
  }
};

function getModernColorScheme(scheme: string) {
  const schemes = {
    blue: {
      primary: '#1E40AF',      // Blue-700
      accent: '#EC4899',       // Pink-500  
      secondary: '#8B5CF6',    // Purple-500
      text: '#1F2937',         // Gray-800
      textLight: '#6B7280',    // Gray-500
      background: '#F8FAFC',   // Navy-50 alternative
      white: '#FFFFFF'
    },
    navy: {
      primary: '#131B32',      // Navy-900
      accent: '#EC4899',       // Pink-500
      secondary: '#8B5CF6',    // Purple-500
      text: '#374151',         // Gray-700
      textLight: '#6B7280',    // Gray-500
      background: '#F1F5F9',   // Slate-100
      white: '#FFFFFF'
    },
    purple: {
      primary: '#7C3AED',      // Violet-600
      accent: '#EC4899',       // Pink-500
      secondary: '#3B82F6',    // Blue-500
      text: '#374151',         // Gray-700
      textLight: '#6B7280',    // Gray-500
      background: '#FAF5FF',   // Purple-50
      white: '#FFFFFF'
    }
  };
  return schemes[scheme as keyof typeof schemes] || schemes.blue;
}

function getModernSwedishCSS(colors: any): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.4;
      color: ${colors.text};
      background: ${colors.white};
      font-size: 11pt;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      min-height: 297mm;
      background: ${colors.white};
      overflow: hidden;
    }
    
    /* Modern Header with Gradient */
    .modern-header {
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
      color: ${colors.white};
      padding: 25mm 15mm 20mm 15mm;
      position: relative;
      overflow: hidden;
    }
    
    .modern-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    
    .name-section {
      flex: 1;
      min-width: 250px;
    }
    
    .cv-name {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .cv-title {
      font-size: 16pt;
      font-weight: 400;
      opacity: 0.9;
      margin-bottom: 12px;
    }
    
    .header-summary {
      font-size: 12pt;
      line-height: 1.3;
      opacity: 0.85;
      max-width: 400px;
    }
    
    .header-accent {
      flex-shrink: 0;
      text-align: right;
      margin-left: 20px;
    }
    
    .accent-badge {
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 10pt;
      font-weight: 500;
      backdrop-filter: blur(10px);
    }
    
    /* Two Column Layout */
    .cv-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 0;
      min-height: calc(297mm - 60mm);
    }
    
    .main-column {
      padding: 25mm 20mm 25mm 15mm;
      background: ${colors.white};
    }
    
    .sidebar-column {
      background: ${colors.background};
      padding: 25mm 15mm 25mm 20mm;
      border-left: 3px solid ${colors.accent};
    }
    
    /* Section Styles */
    .cv-section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 14px;
      padding-bottom: 6px;
      border-bottom: 2px solid ${colors.accent};
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 30px;
      height: 2px;
      background: ${colors.secondary};
    }
    
    .sidebar-section-title {
      font-size: 12pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Summary Section */
    .summary-content {
      font-size: 11pt;
      line-height: 1.6;
      color: ${colors.text};
      text-align: justify;
    }
    
    /* Experience Section */
    .experience-item {
      margin-bottom: 20px;
      page-break-inside: avoid;
      position: relative;
      padding-left: 20px;
    }
    
    .experience-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 8px;
      height: 8px;
      background: ${colors.accent};
      border-radius: 50%;
    }
    
    .job-header {
      margin-bottom: 8px;
    }
    
    .job-title {
      font-size: 13pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2px;
    }
    
    .company-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    
    .company-name {
      font-size: 11pt;
      font-weight: 500;
      color: ${colors.text};
    }
    
    .job-dates {
      font-size: 10pt;
      color: ${colors.textLight};
      font-variant-numeric: tabular-nums;
      background: ${colors.background};
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .job-location {
      font-size: 10pt;
      color: ${colors.textLight};
      font-style: italic;
    }
    
    .job-description ul {
      list-style: none;
      padding: 0;
    }
    
    .job-description li {
      position: relative;
      padding-left: 16px;
      margin-bottom: 4px;
      font-size: 10pt;
      line-height: 1.4;
    }
    
    .job-description li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: ${colors.accent};
      font-weight: bold;
    }
    
    /* Education Section */
    .education-item {
      margin-bottom: 16px;
      padding: 12px;
      background: ${colors.background};
      border-radius: 8px;
      border-left: 4px solid ${colors.secondary};
    }
    
    .degree-name {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2px;
    }
    
    .institution-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .institution-name {
      font-size: 10pt;
      color: ${colors.text};
    }
    
    .education-dates {
      font-size: 9pt;
      color: ${colors.textLight};
    }
    
    /* Sidebar Contact Section */
    .contact-section {
      margin-bottom: 24px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 10pt;
    }
    
    .contact-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      color: ${colors.accent};
      flex-shrink: 0;
    }
    
    .contact-text {
      color: ${colors.text};
      word-break: break-all;
    }
    
    /* Skills Section with Progress Bars */
    .skills-container {
      margin-bottom: 20px;
    }
    
    .skill-category {
      margin-bottom: 16px;
    }
    
    .skill-category-title {
      font-size: 10pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .skill-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 9pt;
    }
    
    .skill-name {
      flex: 1;
      color: ${colors.text};
    }
    
    .skill-level {
      width: 60px;
      height: 4px;
      background: rgba(139, 92, 246, 0.2);
      border-radius: 2px;
      margin-left: 8px;
      position: relative;
    }
    
    .skill-level::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 85%; /* Default skill level */
      background: linear-gradient(90deg, ${colors.accent} 0%, ${colors.secondary} 100%);
      border-radius: 2px;
    }
    
    /* Languages Section */
    .language-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 10pt;
    }
    
    .language-name {
      font-weight: 500;
      color: ${colors.text};
    }
    
    .language-level {
      background: ${colors.accent};
      color: ${colors.white};
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 8pt;
      font-weight: 500;
    }
    
    /* Projects Section */
    .project-item {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }
    
    .project-title {
      font-size: 12pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 4px;
    }
    
    .project-description {
      font-size: 10pt;
      line-height: 1.4;
      margin-bottom: 6px;
    }
    
    .project-technologies {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    
    .tech-tag {
      background: ${colors.background};
      color: ${colors.text};
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 8pt;
      border: 1px solid ${colors.accent};
    }
    
    /* Certifications Section */
    .certification-item {
      margin-bottom: 12px;
      padding: 8px;
      background: ${colors.white};
      border-radius: 6px;
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
    
    .certification-name {
      font-size: 9pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2px;
    }
    
    .certification-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: ${colors.textLight};
    }
    
    /* Interests Section */
    .interests-content {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .interest-tag {
      background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%);
      color: ${colors.white};
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 8pt;
      font-weight: 500;
    }
    
    /* References Section */
    .references-section {
      background: ${colors.background};
      padding: 15mm;
      text-align: center;
      border-top: 3px solid ${colors.accent};
    }
    
    .references-content {
      font-size: 10pt;
      color: ${colors.textLight};
      font-style: italic;
    }
    
    /* Print Optimization */
    @media print {
      body {
        font-size: 10pt;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .cv-container {
        margin: 0;
        max-width: none;
      }
      
      .modern-header {
        padding: 20mm 15mm 15mm 15mm;
      }
      
      .cv-content {
        grid-template-columns: 1fr 250px;
      }
      
      .main-column {
        padding: 20mm 15mm 20mm 15mm;
      }
      
      .sidebar-column {
        padding: 20mm 15mm 20mm 15mm;
      }
      
      .cv-section,
      .experience-item,
      .project-item {
        page-break-inside: avoid;
      }
    }
    
    /* Mobile Responsive */
    @media screen and (max-width: 768px) {
      .cv-content {
        grid-template-columns: 1fr;
      }
      
      .sidebar-column {
        border-left: none;
        border-top: 3px solid ${colors.accent};
      }
      
      .header-content {
        flex-direction: column;
        text-align: left;
      }
      
      .header-accent {
        margin-left: 0;
        margin-top: 15px;
        text-align: left;
      }
      
      .main-column,
      .sidebar-column {
        padding: 20px;
      }
    }
  `;
}

function generateModernHeader(cvData: CVMetadata, colors: any): string {
  const { personalInfo } = cvData;
  const professionalTitle = personalInfo.title || '';
  const shortSummary = cvData.summary && cvData.summary.length > 100 
    ? cvData.summary.substring(0, 100) + '...' 
    : cvData.summary || '';
  
  return `
    <div class="modern-header">
      <div class="header-content">
        <div class="name-section">
          <h1 class="cv-name">${personalInfo.fullName}</h1>
          ${professionalTitle ? `<div class="cv-title">${professionalTitle}</div>` : ''}
          ${shortSummary ? `<div class="header-summary">${shortSummary}</div>` : ''}
        </div>
        <div class="header-accent">
          <div class="accent-badge">Premium CV</div>
        </div>
      </div>
    </div>
  `;
}

function generateContactSection(cvData: CVMetadata): string {
  const { personalInfo } = cvData;
  
  const contactItems = [
    { icon: '📧', text: personalInfo.email, show: !!personalInfo.email },
    { icon: '📱', text: personalInfo.phone, show: !!personalInfo.phone },
    { icon: '📍', text: personalInfo.address, show: !!personalInfo.address },
    { icon: '💼', text: personalInfo.linkedIn, show: !!personalInfo.linkedIn },
    { icon: '🌐', text: personalInfo.website, show: !!personalInfo.website },
    { icon: '💻', text: personalInfo.github, show: !!personalInfo.github }
  ].filter(item => item.show);
  
  if (contactItems.length === 0) {
    return '';
  }
  
  return `
    <div class="contact-section">
      <div class="sidebar-section-title">Kontakt</div>
      ${contactItems.map(item => `
        <div class="contact-item">
          <span class="contact-icon">${item.icon}</span>
          <span class="contact-text">${item.text}</span>
        </div>
      `).join('')}
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
        <div class="job-title">${exp.position}</div>
        <div class="company-info">
          <div class="company-name">${exp.company}</div>
          <div class="job-dates">
            ${formatDateRange(exp.startDate, exp.endDate)}
          </div>
        </div>
        ${exp.location ? `<div class="job-location">${exp.location}</div>` : ''}
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
      <div class="degree-name">${edu.degree}</div>
      <div class="institution-info">
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
      ${skillGroup.skills.map(skill => `
        <div class="skill-item">
          <span class="skill-name">${skill}</span>
          <div class="skill-level"></div>
        </div>
      `).join('')}
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <div class="sidebar-section-title">${headings.skills}</div>
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
      <div class="sidebar-section-title">${headings.languages}</div>
      ${languageItems}
    </div>
  `;
}

function generateCertificationsSection(cvData: CVMetadata, headings: any): string {
  const certificationItems = cvData.certifications!.map(cert => `
    <div class="certification-item">
      <div class="certification-name">${cert.name}</div>
      <div class="certification-details">
        <span>${cert.issuer}</span>
        ${cert.issueDate || cert.date ? `<span>${cert.issueDate || cert.date}</span>` : ''}
      </div>
    </div>
  `).join('');
  
  return `
    <div class="cv-section">
      <div class="sidebar-section-title">${headings.certifications}</div>
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
        <div class="project-technologies">
          ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
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
  const interestTags = cvData.interests!.map(interest => 
    `<span class="interest-tag">${interest}</span>`
  ).join('');
  
  return `
    <div class="cv-section">
      <div class="sidebar-section-title">Intressen</div>
      <div class="interests-content">
        ${interestTags}
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