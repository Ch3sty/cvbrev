import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange, shouldShowSection, extractProfessionalTitle } from '../cv-metadata';

export const modernTechCVTemplate: CVTemplate = {
  id: 'modern-tech',
  name: 'Modern Tech',
  description: 'Professionell och ren design optimerad för tekniska roller. Balanserar modern estetik med svensk formell standard.',
  designStyle: 'Modern Professionalism',
  visualFeatures: ['Ren tvåkolumns layout', 'Diskret färgaccent', 'Professionell typografi', 'PDF-optimerad struktur'],
  features: ['Tech-optimerad', 'ATS-kompatibel', 'Svenska standarder', 'PDF-vänlig', 'Mobil-responsiv'],
  colorSchemes: ['tech-blue', 'professional-navy', 'modern-slate', 'innovation-purple'],
  previewImage: '/images/cv-templates/modern-tech-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern-tech');
    
    // Professional Tech Color Schemes
    const colorSchemes = {
      'tech-blue': {
        primary: '#1E40AF',      // Professional blue
        secondary: '#3B82F6',    // Lighter blue
        accent: '#EFF6FF',       // Very light blue
        background: '#F8FAFC',   // Neutral background
        text: '#1F2937',         // Dark gray
        textLight: '#6B7280',    // Medium gray
        white: '#FFFFFF'
      },
      'professional-navy': {
        primary: '#1E3A8A',      // Navy blue
        secondary: '#3B82F6',    // Standard blue
        accent: '#E0F2FE',       // Light cyan
        background: '#F1F5F9',   // Light slate
        text: '#0F172A',         // Near black
        textLight: '#64748B',    // Slate gray
        white: '#FFFFFF'
      },
      'modern-slate': {
        primary: '#475569',      // Slate
        secondary: '#64748B',    // Light slate
        accent: '#F1F5F9',       // Very light slate
        background: '#F8FAFC',   // Off white
        text: '#0F172A',         // Dark slate
        textLight: '#64748B',    // Medium slate
        white: '#FFFFFF'
      },
      'innovation-purple': {
        primary: '#7C3AED',      // Purple
        secondary: '#A855F7',    // Light purple
        accent: '#F3E8FF',       // Very light purple
        background: '#FEFEFE',   // Pure white
        text: '#1F2937',         // Dark gray
        textLight: '#6B7280',    // Medium gray
        white: '#FFFFFF'
      }
    };
    const colors = colorSchemes[options.colorScheme as keyof typeof colorSchemes] || colorSchemes['tech-blue'];
    const professionalTitle = extractProfessionalTitle(cvData);
    
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
      margin: 15mm;
      @bottom-center {
        content: "Sida " counter(page);
        font-family: 'Arial', sans-serif;
        font-size: 8pt;
        color: ${colors.textLight};
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: ${colors.text};
      background: ${colors.white};
      -webkit-font-smoothing: antialiased;
    }
    
    .cv-container {
      max-width: 210mm;
      margin: 0 auto;
      background: ${colors.white};
    }
    
    /* CLEAN MODERN HEADER */
    .modern-tech-header {
      background: ${colors.primary};
      color: ${colors.white};
      padding: 20mm 15mm 15mm 15mm;
      margin-bottom: 0;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .name-section {
      flex: 1;
    }
    
    .cv-name {
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 4mm;
      letter-spacing: -0.5px;
    }
    
    .cv-title {
      font-size: 14pt;
      font-weight: 400;
      margin-bottom: 6mm;
      opacity: 0.9;
    }
    
    .header-summary {
      font-size: 11pt;
      line-height: 1.4;
      opacity: 0.95;
      max-width: 400px;
    }

    /* TWO COLUMN LAYOUT */
    .cv-content {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 0;
    }
    
    .main-column {
      padding: 20mm 15mm 20mm 15mm;
      background: ${colors.white};
    }
    
    .sidebar {
      background: ${colors.background};
      padding: 20mm 15mm 20mm 15mm;
      border-left: 2px solid ${colors.accent};
    }
    
    /* SECTION STYLING */
    .cv-section {
      margin-bottom: 20mm;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 12mm;
      padding-bottom: 4mm;
      border-bottom: 2px solid ${colors.accent};
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 25mm;
      height: 2px;
      background: ${colors.primary};
    }
    
    .sidebar-section-title {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 8mm;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* EXPERIENCE SECTION */
    .experience-item {
      margin-bottom: 16mm;
      page-break-inside: avoid;
      position: relative;
      padding-left: 15mm;
    }
    
    .experience-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6mm;
      width: 6mm;
      height: 6mm;
      background: ${colors.primary};
      border-radius: 50%;
    }
    
    .job-header {
      margin-bottom: 6mm;
    }
    
    .job-title {
      font-size: 12pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2mm;
    }
    
    .company-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2mm;
    }
    
    .company-name {
      font-size: 10pt;
      font-weight: 500;
      color: ${colors.text};
    }
    
    .job-dates {
      font-size: 9pt;
      color: ${colors.textLight};
      background: ${colors.accent};
      padding: 1mm 3mm;
      border-radius: 8mm;
    }
    
    .job-location {
      font-size: 9pt;
      color: ${colors.textLight};
      font-style: italic;
    }
    
    .job-description {
      margin-top: 4mm;
    }
    
    .job-description ul {
      list-style: none;
      padding: 0;
    }
    
    .job-description li {
      position: relative;
      padding-left: 12mm;
      margin-bottom: 3mm;
      font-size: 10pt;
      line-height: 1.4;
    }
    
    .job-description li::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: ${colors.primary};
      font-weight: bold;
    }

    /* SIDEBAR SECTIONS */
    .sidebar-section {
      margin-bottom: 16mm;
      page-break-inside: avoid;
    }
    
    /* CONTACT SECTION */
    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 6mm;
      font-size: 9pt;
    }
    
    .contact-icon {
      width: 12mm;
      height: 12mm;
      background: ${colors.primary};
      color: ${colors.white};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 6mm;
      font-size: 6pt;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .contact-text {
      color: ${colors.text};
      word-break: break-word;
    }
    
    /* SKILLS SECTION */
    .skill-category {
      margin-bottom: 12mm;
    }
    
    .skill-category-title {
      font-size: 9pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 6mm;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm;
    }
    
    .skill-tag {
      background: ${colors.white};
      color: ${colors.text};
      padding: 2mm 4mm;
      border-radius: 10mm;
      font-size: 8pt;
      border: 1px solid ${colors.accent};
      font-weight: 500;
    }

    /* EDUCATION SECTION */
    .education-item {
      margin-bottom: 12mm;
      padding: 8mm;
      background: ${colors.white};
      border-left: 3mm solid ${colors.primary};
      border-radius: 4mm;
      page-break-inside: avoid;
    }
    
    .degree-name {
      font-size: 10pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2mm;
    }
    
    .institution-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .institution-name {
      font-size: 9pt;
      color: ${colors.text};
    }
    
    .education-dates {
      font-size: 8pt;
      color: ${colors.textLight};
    }
    
    /* LANGUAGES SECTION */
    .language-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6mm;
      font-size: 9pt;
    }
    
    .language-name {
      font-weight: 500;
      color: ${colors.text};
    }
    
    .language-level {
      background: ${colors.primary};
      color: ${colors.white};
      padding: 1mm 3mm;
      border-radius: 8mm;
      font-size: 7pt;
      font-weight: 500;
    }

    /* PROJECTS SECTION */
    .project-item {
      margin-bottom: 12mm;
      page-break-inside: avoid;
    }
    
    .project-title {
      font-size: 11pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 3mm;
    }
    
    .project-description {
      font-size: 10pt;
      line-height: 1.4;
      margin-bottom: 4mm;
      color: ${colors.text};
    }
    
    .project-technologies {
      display: flex;
      flex-wrap: wrap;
      gap: 3mm;
    }
    
    .tech-tag {
      background: ${colors.accent};
      color: ${colors.text};
      padding: 1mm 3mm;
      border-radius: 8mm;
      font-size: 7pt;
      border: 1px solid ${colors.primary}30;
      font-weight: 500;
    }
    
    /* CERTIFICATIONS SECTION */
    .certification-item {
      margin-bottom: 8mm;
      padding: 4mm;
      background: ${colors.white};
      border-radius: 4mm;
      border: 1px solid ${colors.accent};
    }
    
    .certification-name {
      font-size: 9pt;
      font-weight: 600;
      color: ${colors.primary};
      margin-bottom: 2mm;
    }
    
    .certification-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: ${colors.textLight};
    }

    /* PRINT OPTIMIZATION */
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
      
      .modern-tech-header {
        padding: 15mm 15mm 10mm 15mm;
      }
      
      .main-column, .sidebar {
        padding: 15mm 15mm 15mm 15mm;
      }
      
      .cv-section, .experience-item, .project-item {
        page-break-inside: avoid;
      }
    }
    
    /* MOBILE RESPONSIVE */
    @media screen and (max-width: 768px) {
      .cv-content {
        grid-template-columns: 1fr;
      }
      
      .sidebar {
        border-left: none;
        border-top: 2px solid ${colors.accent};
      }
      
      .header-content {
        flex-direction: column;
        text-align: left;
      }
      
      .main-column, .sidebar {
        padding: 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- Clean Modern Header -->
    <header class="modern-tech-header">
      <div class="header-content">
        <div class="name-section">
          <h1 class="cv-name">${cvData.personalInfo.fullName}</h1>
          ${professionalTitle ? `<div class="cv-title">${professionalTitle}</div>` : ''}
          ${cvData.summary ? `<div class="header-summary">${cvData.summary.length > 150 ? cvData.summary.substring(0, 150) + '...' : cvData.summary}</div>` : ''}
        </div>
      </div>
    </header>

    <div class="cv-content">
      <!-- Main Content Column -->
      <main class="main-column">
        <!-- Experience Section -->
        ${shouldShowSection('experience', cvData) ? `
        <section class="cv-section">
          <h2 class="section-title">${headings.experience}</h2>
          ${(cvData.experience || []).map(exp => `
            <div class="experience-item">
              <div class="job-header">
                <div class="job-title">${exp.position}</div>
                <div class="company-info">
                  <div class="company-name">${exp.company}</div>
                  <div class="job-dates">${formatDateRange(exp.startDate, exp.endDate)}</div>
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
          `).join('')}
        </section>
        ` : ''}
        
        <!-- Projects Section -->
        ${shouldShowSection('projects', cvData) ? `
        <section class="cv-section">
          <h2 class="section-title">${headings.projects}</h2>
          ${(cvData.projects || []).map(project => `
            <div class="project-item">
              <div class="project-title">${project.name || project.title}</div>
              <div class="project-description">${project.description}</div>
              ${project.technologies && project.technologies.length > 0 ? `
                <div class="project-technologies">
                  ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}
      </main>

      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Contact Information -->
        <section class="sidebar-section">
          <h3 class="sidebar-section-title">Kontaktuppgifter</h3>
          <div class="contact-item">
            <div class="contact-icon">@</div>
            <div class="contact-text">${cvData.personalInfo.email}</div>
          </div>
          ${cvData.personalInfo.phone ? `
          <div class="contact-item">
            <div class="contact-icon">☎</div>
            <div class="contact-text">${cvData.personalInfo.phone}</div>
          </div>
          ` : ''}
          ${cvData.personalInfo.address ? `
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div class="contact-text">${cvData.personalInfo.address}</div>
          </div>
          ` : ''}
          ${cvData.personalInfo.linkedIn || cvData.personalInfo.linkedin ? `
          <div class="contact-item">
            <div class="contact-icon">in</div>
            <div class="contact-text">LinkedIn</div>
          </div>
          ` : ''}
          ${cvData.personalInfo.website ? `
          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div class="contact-text">${cvData.personalInfo.website}</div>
          </div>
          ` : ''}
          ${cvData.personalInfo.github ? `
          <div class="contact-item">
            <div class="contact-icon">💻</div>
            <div class="contact-text">${cvData.personalInfo.github}</div>
          </div>
          ` : ''}
        </section>

        <!-- Skills Section -->
        ${shouldShowSection('skills', cvData) ? `
        <section class="sidebar-section">
          <h3 class="sidebar-section-title">${headings.skills}</h3>
          ${(cvData.skills || []).map(category => `
            <div class="skill-category">
              <div class="skill-category-title">${category.category}</div>
              <div class="skills-list">
                ${(category.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- Education Section -->
        ${shouldShowSection('education', cvData) ? `
        <section class="sidebar-section">
          <h3 class="sidebar-section-title">${headings.education}</h3>
          ${(cvData.education || []).map(edu => `
            <div class="education-item">
              <div class="degree-name">${edu.degree}</div>
              <div class="institution-info">
                <div class="institution-name">${edu.institution}</div>
                ${edu.graduationYear ? `<div class="education-dates">${edu.graduationYear}</div>` : ''}
              </div>
              ${edu.location ? `<div class="job-location">${edu.location}</div>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- Languages Section -->
        ${shouldShowSection('languages', cvData) ? `
        <section class="sidebar-section">
          <h3 class="sidebar-section-title">${headings.languages}</h3>
          ${(cvData.languages || []).map(lang => `
            <div class="language-item">
              <span class="language-name">${lang.language}</span>
              <span class="language-level">${lang.proficiency}</span>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- Certifications Section -->
        ${shouldShowSection('certifications', cvData) ? `
        <section class="sidebar-section">
          <h3 class="sidebar-section-title">${headings.certifications}</h3>
          ${(cvData.certifications || []).map(cert => `
            <div class="certification-item">
              <div class="certification-name">${cert.name}</div>
              <div class="certification-details">
                <span>${cert.issuer}</span>
                ${cert.issueDate || cert.date ? `<span>${cert.issueDate || cert.date}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}
      </aside>
    </div>
    
    ${cvData.references && cvData.references.trim() ? `
    <footer style="text-align: center; padding: 10mm; color: ${colors.textLight}; font-size: 9pt; border-top: 1px solid ${colors.accent};">
      ${cvData.references}
    </footer>
    ` : ''}
  </div>
</body>
</html>
    `;
  }
};