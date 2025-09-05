// src/lib/cv/cv-templates.ts
// Professionella CV-mallar för svenska jobbsökande

import { CVMetadata, CVTemplate, CVGenerationOptions, formatDateRange } from './cv-metadata';
import { generateQRCodeDataURLSync, generateSkillProgressCSS, generateSectionIcon, generateTimelineCSS, calculateSkillLevel, extractAchievements, generatePortfolioSection, getPortfolioCSS } from './visual-elements';

// Klassisk CV-mall - Traditionell, konservativ layout
export const klassiskCVTemplate: CVTemplate = {
  id: 'klassisk',
  name: 'Klassisk',
  description: 'Traditionell och professionell CV-mall som passar alla branscher',
  category: 'Konservativ',
  bestFor: ['Bank & Finans', 'Juridik', 'Förvaltning', 'Traditionella företag'],
  features: ['Ren layout', 'Lätt att läsa', 'ATS-vänlig', 'Professionell'],
  colorSchemes: ['blue', 'black', 'green'],
  previewImage: '/images/cv-templates/klassisk-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const primaryColor = options.colorScheme === 'blue' ? '#2563eb' : 
                        options.colorScheme === 'green' ? '#059669' : '#1f2937';

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
            margin: 2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
          }
          
          .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2cm;
            padding-bottom: 1cm;
            border-bottom: 2px solid ${primaryColor};
          }
          
          .name {
            font-size: 24pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.5cm;
            letter-spacing: 1px;
          }
          
          .contact-info {
            font-size: 10pt;
            color: #666;
          }
          
          .contact-info span {
            margin: 0 0.5cm;
          }
          
          .section {
            margin-bottom: 1.5cm;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.8cm;
            padding-bottom: 0.2cm;
            border-bottom: 1px solid ${primaryColor};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .summary {
            text-align: justify;
            margin-bottom: 1cm;
          }
          
          .experience-item, .education-item {
            margin-bottom: 1cm;
          }
          
          .job-title, .degree {
            font-size: 12pt;
            font-weight: bold;
            color: #333;
          }
          
          .company, .institution {
            font-size: 11pt;
            font-weight: bold;
            color: ${primaryColor};
            margin: 0.2cm 0;
          }
          
          .date-location {
            font-size: 10pt;
            color: #666;
            font-style: italic;
          }
          
          .description ul {
            margin-left: 1cm;
            margin-top: 0.3cm;
          }
          
          .description li {
            margin-bottom: 0.2cm;
          }
          
          .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1cm;
          }
          
          .skill-category {
            margin-bottom: 0.8cm;
          }
          
          .skill-category-title {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
          }
          
          .skills-list {
            font-size: 10pt;
          }
          
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5cm;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <header class="header">
            <h1 class="name">${cvData.personalInfo.fullName}</h1>
            <div class="contact-info">
              <span>${cvData.personalInfo.email}</span>
              ${cvData.personalInfo.phone ? `<span>${cvData.personalInfo.phone}</span>` : ''}
              ${cvData.personalInfo.address ? `<span>${cvData.personalInfo.address}</span>` : ''}
              ${cvData.personalInfo.linkedIn ? `<span>${cvData.personalInfo.linkedIn}</span>` : ''}
            </div>
          </header>

          <!-- Summary -->
          ${cvData.summary ? `
          <section class="section">
            <h2 class="section-title">Professionell Sammanfattning</h2>
            <p class="summary">${cvData.summary}</p>
          </section>
          ` : ''}

          <!-- Experience -->
          <section class="section">
            <h2 class="section-title">Arbetslivserfarenhet</h2>
            ${cvData.experience.map(exp => `
            <div class="experience-item">
              <div class="job-title">${exp.position}</div>
              <div class="company">${exp.company}</div>
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
            <h2 class="section-title">Utbildning</h2>
            ${cvData.education.map(edu => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="company">${edu.institution}</div>
              <div class="date-location">
                ${edu.graduationYear ? edu.graduationYear : ''}
                ${edu.location ? ` • ${edu.location}` : ''}
              </div>
            </div>
            `).join('')}
          </section>

          <!-- Skills -->
          ${cvData.skills && cvData.skills.length > 0 ? `
          <section class="section">
            <h2 class="section-title">Kompetenser</h2>
            <div class="skills-grid">
              ${cvData.skills.map(skillCategory => `
              <div class="skill-category">
                <div class="skill-category-title">${skillCategory.category}</div>
                <div class="skills-list">${skillCategory.skills.join(' • ')}</div>
              </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Languages -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <section class="section">
            <h2 class="section-title">Språk</h2>
            <div class="skills-list">
              ${cvData.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' • ')}
            </div>
          </section>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
};

// Modern CV-mall - Ren, minimalistisk design
export const modernCVTemplate: CVTemplate = {
  id: 'modern',
  name: 'Modern Tech',
  description: 'Avancerad tech-fokuserad design med kodexempel, GitHub-integration och tekniska visualiseringar',
  category: 'Contemporary',
  bestFor: ['Tech', 'Utvecklare', 'DevOps', 'Data Science', 'Startup', 'AI/ML'],
  features: ['Tech-stack visualisering', 'GitHub-integration', 'Kodexempel', 'Tekniska projektvisning', 'Modern typografi', 'Minimalistisk design'],
  colorSchemes: ['blue', 'black', 'purple', 'green'],
  previewImage: '/images/cv-templates/modern-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const primaryColor = options.colorScheme === 'blue' ? '#3b82f6' : 
                        options.colorScheme === 'purple' ? '#8b5cf6' : 
                        options.colorScheme === 'green' ? '#10b981' : '#1f2937';
    const accentColor = options.colorScheme === 'blue' ? '#1e40af' : 
                       options.colorScheme === 'purple' ? '#7c3aed' : 
                       options.colorScheme === 'green' ? '#059669' : '#374151';
    const techBg = options.colorScheme === 'blue' ? '#eff6ff' : 
                   options.colorScheme === 'purple' ? '#f3e8ff' : 
                   options.colorScheme === 'green' ? '#ecfdf5' : '#f9fafb';
    
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
            margin: 1.5cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #1f2937;
            background: white;
          }
          
          /* TECH-FOCUSED HEADER */
          .tech-header {
            background: linear-gradient(135deg, ${primaryColor}15, ${techBg});
            padding: 1.5cm;
            margin: -1.5cm -1.5cm 2cm -1.5cm;
            border-radius: 0 0 20px 20px;
            position: relative;
            overflow: hidden;
          }
          
          .tech-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 100px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" fill="${encodeURIComponent(primaryColor)}20"><polygon points="0,0 200,0 150,100 0,100"/></svg>');
            background-size: cover;
          }
          
          .header-grid {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 2cm;
          }
          
          .name {
            font-size: 32pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
            line-height: 1.1;
            letter-spacing: -0.5px;
          }
          
          .dev-title {
            font-size: 14pt;
            color: ${accentColor};
            font-weight: 500;
            margin-bottom: 0.5cm;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
          }
          
          .tech-summary {
            font-size: 11pt;
            color: #4b5563;
            line-height: 1.6;
            max-width: 500px;
          }
          
          .github-badge {
            background: #24292f;
            color: white;
            padding: 0.4cm 0.8cm;
            border-radius: 20px;
            font-size: 9pt;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.3cm;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          /* MAIN LAYOUT */
          .cv-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2cm;
          }
          
          .main-content {
            padding-right: 0.5cm;
          }
          
          .tech-sidebar {
            background: ${techBg};
            padding: 1.5cm;
            border-radius: 15px;
            height: fit-content;
            border: 1px solid ${primaryColor}20;
          }
          
          /* SECTION STYLING */
          .section {
            margin-bottom: 2cm;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 1cm;
            position: relative;
            padding-left: 1cm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 0.6cm;
            height: 0.6cm;
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            border-radius: 3px;
          }
          
          /* TECH EXPERIENCE CARDS */
          .tech-experience-item {
            background: white;
            padding: 1.2cm;
            border-radius: 12px;
            margin-bottom: 1.5cm;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border-left: 4px solid ${primaryColor};
            position: relative;
          }
          
          .job-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            gap: 1cm;
            margin-bottom: 0.8cm;
          }
          
          .job-title {
            font-size: 12pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
          }
          
          .company {
            font-size: 11pt;
            color: #374151;
            font-weight: 600;
            margin-bottom: 0.3cm;
          }
          
          .job-date {
            background: ${primaryColor}15;
            color: ${accentColor};
            padding: 0.2cm 0.6cm;
            border-radius: 15px;
            font-size: 8pt;
            font-weight: 600;
            white-space: nowrap;
          }
          
          .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
            margin: 0.5cm 0;
          }
          
          .tech-tag {
            background: linear-gradient(135deg, ${primaryColor}20, ${primaryColor}10);
            color: ${accentColor};
            padding: 0.2cm 0.5cm;
            border-radius: 12px;
            font-size: 7pt;
            font-weight: 600;
            border: 1px solid ${primaryColor}30;
          }
          
          .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5cm;
            margin-top: 0.8cm;
          }
          
          .metric-card {
            background: linear-gradient(135deg, ${primaryColor}15, transparent);
            padding: 0.6cm;
            border-radius: 8px;
            text-align: center;
            border: 1px solid ${primaryColor}20;
          }
          
          .metric-value {
            font-size: 14pt;
            font-weight: 700;
            color: ${primaryColor};
            display: block;
          }
          
          .metric-label {
            font-size: 7pt;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* TECH SKILLS VISUALIZATION */
          .tech-skills-grid {
            display: grid;
            gap: 1cm;
          }
          
          .skill-category {
            background: white;
            padding: 1cm;
            border-radius: 12px;
            border: 1px solid ${primaryColor}20;
          }
          
          .skill-category-title {
            font-size: 10pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.6cm;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .skill-with-level {
            margin-bottom: 0.8cm;
          }
          
          .skill-name {
            font-size: 9pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.3cm;
          }
          
          /* SKILL PROGRESS BARS */
          ${generateSkillProgressCSS(primaryColor)}
          
          /* CONTACT ICONS */
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.8cm;
            font-size: 9pt;
            color: #4b5563;
            padding: 0.4cm;
            background: white;
            border-radius: 8px;
            border: 1px solid ${primaryColor}15;
          }
          
          .contact-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            border-radius: 4px;
            margin-right: 0.6cm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          /* PROJECT SHOWCASE */
          .project-card {
            background: white;
            padding: 1cm;
            border-radius: 10px;
            margin-bottom: 1cm;
            border: 1px solid ${primaryColor}20;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .project-title {
            font-size: 11pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
          }
          
          .project-description {
            font-size: 9pt;
            color: #4b5563;
            line-height: 1.5;
            margin-bottom: 0.5cm;
          }
          
          /* CODE BLOCK STYLING */
          .code-snippet {
            background: #1a202c;
            color: #e2e8f0;
            padding: 0.8cm;
            border-radius: 8px;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 8pt;
            line-height: 1.4;
            margin: 0.5cm 0;
            overflow-x: auto;
          }
          
          .code-comment {
            color: #68d391;
          }
          
          .code-keyword {
            color: #fbb6ce;
          }
          
          /* EDUCATION ENHANCED */
          .education-item {
            background: white;
            padding: 0.8cm;
            border-radius: 10px;
            margin-bottom: 0.8cm;
            border-left: 4px solid ${primaryColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          
          .degree {
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
            font-size: 10pt;
          }
          
          .institution {
            color: #4b5563;
            font-size: 9pt;
            font-weight: 500;
          }
          
          /* RESPONSIVE TWEAKS */
          @media print {
            .tech-header::before { display: none; }
            .tech-experience-item,
            .project-card,
            .skill-category { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <!-- Tech-focused Header -->
        <header class="tech-header">
          <div class="header-grid">
            <div>
              <h1 class="name">${cvData.personalInfo.fullName}</h1>
              <div class="dev-title">${cvData.summary ? cvData.summary.split('.')[0] + ' Developer' : 'Full Stack Developer'}</div>
              <p class="tech-summary">${cvData.summary || 'Passionerad utvecklare med fokus på modern teknik och användarupplevelse.'}</p>
            </div>
            <div>
              ${cvData.personalInfo.github ? `
              <a href="${cvData.personalInfo.github}" class="github-badge">
                ${generateSectionIcon('github', 'white')}
                GitHub Portfolio
              </a>
              ` : ''}
            </div>
          </div>
        </header>

        <div class="cv-container">
          <!-- Main Content -->
          <main class="main-content">
            <!-- Tech Experience -->
            <section class="section">
              <h2 class="section-title">Tech Experience</h2>
              ${cvData.experience.map(exp => {
                const techSkills = exp.description.join(' ').match(/(React|Node|Python|JavaScript|TypeScript|Docker|AWS|Azure|GCP|Kubernetes|MongoDB|PostgreSQL|Redis|GraphQL|REST|API|Git|Linux|DevOps|CI\/CD|Agile|Scrum)/gi) || [];
                const uniqueTechSkills = [...new Set(techSkills)];
                const achievements = extractAchievements(exp.description.join(' ') + ' ' + (exp.achievements?.join(' ') || ''));
                
                return `
                <div class="tech-experience-item">
                  <div class="job-header">
                    <div>
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      ${uniqueTechSkills.length > 0 ? `
                      <div class="tech-stack">
                        ${uniqueTechSkills.slice(0, 6).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                      </div>
                      ` : ''}
                    </div>
                    <div class="job-date">${formatDateRange(exp.startDate, exp.endDate)}</div>
                  </div>
                  
                  <ul style="list-style: none; margin: 0.5cm 0;">
                    ${exp.description.map(desc => `
                    <li style="margin-bottom: 0.3cm; position: relative; padding-left: 1cm; color: #4b5563;">
                      <span style="position: absolute; left: 0; color: ${primaryColor};">▸</span>
                      ${desc}
                    </li>
                    `).join('')}
                  </ul>
                  
                  ${achievements.length > 0 ? `
                  <div class="achievements-grid">
                    ${achievements.slice(0, 4).map(ach => `
                    <div class="metric-card">
                      <span class="metric-value">${ach.value}</span>
                      <span class="metric-label">${ach.metric}</span>
                    </div>
                    `).join('')}
                  </div>
                  ` : ''}
                </div>
                `;
              }).join('')}
            </section>
            
            <!-- Projects Section -->
            ${cvData.projects && cvData.projects.length > 0 ? `
            <section class="section">
              <h2 class="section-title">Tech Projects</h2>
              ${cvData.projects.slice(0, 3).map(project => `
              <div class="project-card">
                <div class="project-title">${project.title}</div>
                <div class="project-description">${project.description}</div>
                ${project.technologies ? `
                <div class="tech-stack">
                  ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                ` : ''}
              </div>
              `).join('')}
            </section>
            ` : ''}
          </main>

          <!-- Tech Sidebar -->
          <aside class="tech-sidebar">
            <!-- Contact -->
            <section class="section">
              <h2 class="section-title">Kontakt</h2>
              <div class="contact-item">
                <div class="contact-icon">${generateSectionIcon('email', 'white')}</div>
                <span>${cvData.personalInfo.email}</span>
              </div>
              ${cvData.personalInfo.phone ? `
              <div class="contact-item">
                <div class="contact-icon">${generateSectionIcon('phone', 'white')}</div>
                <span>${cvData.personalInfo.phone}</span>
              </div>
              ` : ''}
              ${cvData.personalInfo.linkedIn ? `
              <div class="contact-item">
                <div class="contact-icon">${generateSectionIcon('linkedin', 'white')}</div>
                <span>LinkedIn</span>
              </div>
              ` : ''}
              ${cvData.personalInfo.address ? `
              <div class="contact-item">
                <div class="contact-icon">${generateSectionIcon('location', 'white')}</div>
                <span>${cvData.personalInfo.address}</span>
              </div>
              ` : ''}
            </section>

            <!-- Tech Skills -->
            ${cvData.skills && cvData.skills.length > 0 ? `
            <section class="section">
              <h2 class="section-title">Tech Stack</h2>
              <div class="tech-skills-grid">
                ${cvData.skills.map(skillCategory => `
                <div class="skill-category">
                  <div class="skill-category-title">${skillCategory.category}</div>
                  ${skillCategory.skills.map(skill => {
                    const skillLevel = calculateSkillLevel(skill, cvData.experience, cvData.projects || []);
                    return `
                    <div class="skill-with-level">
                      <div class="skill-name">${skill}</div>
                      <div class="skill-progress">
                        <div class="skill-progress-fill" style="width: ${skillLevel}%"></div>
                      </div>
                    </div>
                    `;
                  }).join('')}
                </div>
                `).join('')}
              </div>
            </section>
            ` : ''}

            <!-- Education -->
            <section class="section">
              <h2 class="section-title">Utbildning</h2>
              ${cvData.education.map(edu => `
              <div class="education-item">
                <div class="degree">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
                ${edu.graduationYear ? `<div class="institution">${edu.graduationYear}</div>` : ''}
                ${edu.honors ? `<div style="font-size: 8pt; color: #6b7280; margin-top: 0.2cm;">${edu.honors}</div>` : ''}
              </div>
              `).join('')}
            </section>

            <!-- Languages -->
            ${cvData.languages && cvData.languages.length > 0 ? `
            <section class="section">
              <h2 class="section-title">Språk</h2>
              ${cvData.languages.map(lang => `
              <div class="contact-item">
                <div class="contact-icon" style="background: ${primaryColor}20; color: ${primaryColor};">🗣</div>
                <span>${lang.language} - ${lang.proficiency}</span>
              </div>
              `).join('')}
            </section>
            ` : ''}
          </aside>
        </div>
      </body>
      </html>
    `;
  }
};

// ATS-Optimerad CV-mall - Maximal robotvänlighet
export const atsOptimeradCVTemplate: CVTemplate = {
  id: 'ats-optimerad',
  name: 'ATS-Optimerad',
  description: 'Speciellt utformad för att passera Applicant Tracking Systems',
  category: 'ATS-Friendly',
  bestFor: ['Alla branscher', 'Stora företag', 'Online-ansökningar', 'Rekryteringsföretag'],
  features: ['ATS-kompatibel', 'Enkel struktur', 'Nyckelords-optimerad', 'Standardformat'],
  colorSchemes: ['black'],
  previewImage: '/images/cv-templates/ats-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
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
            margin: 2.5cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
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
          }
          
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 0.6cm;
            text-transform: uppercase;
          }
          
          .experience-item, .education-item {
            margin-bottom: 1cm;
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
            <h2 class="section-title">Arbetslivserfarenhet</h2>
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
            <h2 class="section-title">Utbildning</h2>
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
            <h2 class="section-title">Kompetenser och Färdigheter</h2>
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
            <h2 class="section-title">Språkkunskaper</h2>
            <div>${cvData.languages.map(lang => `${lang.language}: ${lang.proficiency}`).join(', ')}</div>
          </section>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
};

// Kreativ CV-mall - För kreativa yrken
export const kreativCVTemplate: CVTemplate = {
  id: 'kreativ',
  name: 'Kreativ',
  description: 'Avancerad visuell mall med portfolio-fokus, perfekt för kreativa yrken',
  category: 'Creative',
  bestFor: ['Grafisk design', 'Reklam', 'Media', 'Fotografering', 'Konstnärliga yrken', 'UX/UI Design'],
  features: ['Portfolio-sektion', 'Visuella färdighetsmarker', 'Timeline-layout', 'QR-kod för portfolio', 'Kvantifierade prestationer', 'Gradient-design'],
  colorSchemes: ['purple', 'red', 'green', 'blue'],
  previewImage: '/images/cv-templates/kreativ-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    // Import visual elements
    const { 
      generateQRCodeDataURLSync, 
      generateSkillProgressCSS, 
      generateSectionIcon, 
      generateTimelineCSS,
      calculateSkillLevel,
      extractAchievements,
      generatePortfolioSection,
      getPortfolioCSS
    } = require('./visual-elements');

    const primaryColor = options.colorScheme === 'purple' ? '#8b5cf6' : 
                        options.colorScheme === 'red' ? '#ef4444' : 
                        options.colorScheme === 'blue' ? '#3b82f6' : '#10b981';
    const lightColor = options.colorScheme === 'purple' ? '#f3e8ff' : 
                       options.colorScheme === 'red' ? '#fef2f2' : 
                       options.colorScheme === 'blue' ? '#eff6ff' : '#ecfdf5';
    const accentColor = options.colorScheme === 'purple' ? '#c084fc' : 
                        options.colorScheme === 'red' ? '#f87171' : 
                        options.colorScheme === 'blue' ? '#60a5fa' : '#34d399';
    
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
            margin: 0.8cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Apple SD Gothic Neo', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1f2937;
            background: linear-gradient(135deg, ${lightColor} 0%, #ffffff 50%);
          }
          
          .cv-container {
            background: white;
            min-height: 100vh;
            position: relative;
            overflow: hidden;
          }
          
          /* ENHANCED HEADER WITH PORTFOLIO FOCUS */
          .header {
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor}, ${primaryColor}dd);
            color: white;
            padding: 2cm 1.5cm 1.5cm;
            position: relative;
            margin-bottom: 1cm;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="3" fill="white" opacity="0.15"/><circle cx="40" cy="70" r="1.5" fill="white" opacity="0.08"/></svg>');
            background-size: 100px 100px;
          }
          
          .header::after {
            content: '';
            position: absolute;
            bottom: -25px;
            left: 0;
            right: 0;
            height: 50px;
            background: linear-gradient(135deg, ${primaryColor}25, transparent);
            clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
          }
          
          .header-content {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2cm;
            align-items: center;
          }
          
          .name {
            font-size: 34pt;
            font-weight: 200;
            margin-bottom: 0.3cm;
            text-shadow: 0 3px 6px rgba(0,0,0,0.15);
            letter-spacing: -1px;
          }
          
          .tagline {
            font-size: 15pt;
            font-weight: 400;
            opacity: 0.95;
            font-style: italic;
            color: ${lightColor};
            margin-bottom: 0.5cm;
          }
          
          .header-qr {
            text-align: center;
          }
          
          .qr-code {
            width: 80px;
            height: 80px;
            border: 3px solid white;
            border-radius: 8px;
            background: white;
          }
          
          .qr-label {
            margin-top: 0.3cm;
            font-size: 8pt;
            opacity: 0.9;
          }
          
          /* ENHANCED LAYOUT */
          .content-grid {
            display: grid;
            grid-template-columns: 1.8fr 1fr;
            gap: 1.5cm;
            padding: 0 1.5cm;
          }
          
          .main-content .section {
            margin-bottom: 1.2cm;
          }
          
          /* ADVANCED SIDEBAR */
          .sidebar {
            background: linear-gradient(160deg, ${lightColor}, white);
            padding: 1.2cm 1cm;
            border-radius: 20px;
            height: fit-content;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border: 1px solid ${primaryColor}20;
          }
          
          /* ENHANCED SECTION TITLES */
          .section-title {
            font-size: 14pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.8cm;
            position: relative;
            padding-bottom: 0.4cm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12pt;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, ${primaryColor}, ${accentColor}, ${primaryColor}40);
            border-radius: 3px;
          }
          
          /* TIMELINE EXPERIENCE LAYOUT */
          ${generateTimelineCSS(primaryColor)}
          
          .timeline-item .job-title {
            font-size: 13pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
          }
          
          .timeline-item .company {
            font-size: 11pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.3cm;
          }
          
          .timeline-item .job-date {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
            margin-bottom: 0.5cm;
          }
          
          /* ACHIEVEMENTS HIGHLIGHT */
          ${generateSkillProgressCSS(primaryColor)}
          
          /* ENHANCED CONTACT SECTION */
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.7cm;
            font-size: 9pt;
            padding: 0.3cm;
            border-radius: 8px;
            transition: background 0.2s;
          }
          
          .contact-item:hover {
            background: ${primaryColor}08;
          }
          
          .contact-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
            border-radius: 50%;
            margin-right: 0.6cm;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px ${primaryColor}30;
          }
          
          /* SKILLS WITH VISUAL LEVELS */
          .skill-item {
            margin-bottom: 1cm;
          }
          
          .skill-category-title {
            font-size: 10pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.4cm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .skill-with-level {
            margin-bottom: 0.6cm;
          }
          
          .skill-name {
            font-size: 9pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.2cm;
          }
          
          /* ENHANCED EDUCATION */
          .education-item {
            margin-bottom: 0.8cm;
            padding: 1cm;
            background: linear-gradient(135deg, ${primaryColor}08, white);
            border-radius: 12px;
            border-left: 4px solid ${primaryColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          
          .degree {
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
            font-size: 10pt;
          }
          
          .institution {
            color: #4b5563;
            font-size: 9pt;
            font-weight: 500;
          }
          
          /* PORTFOLIO SECTION STYLES */
          ${getPortfolioCSS(primaryColor)}
          
          /* INTERESTS AS VISUAL TAGS */
          .interests-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
          }
          
          .interest-tag {
            background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}10);
            color: ${primaryColor};
            padding: 0.3cm 0.6cm;
            border-radius: 15px;
            font-size: 8pt;
            font-weight: 500;
            border: 1px solid ${primaryColor}20;
          }
          
          /* RESPONSIVE ADJUSTMENTS */
          @media print {
            .header::before { display: none; }
            .sidebar { box-shadow: none; }
            .timeline-item { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Enhanced Header with QR Code -->
          <header class="header">
            <div class="header-content">
              <div class="header-info">
                <h1 class="name">${cvData.personalInfo.fullName}</h1>
                <div class="tagline">${cvData.summary ? cvData.summary.split('.')[0] + '.' : 'Kreativ Professionell'}</div>
              </div>
              <div class="header-qr">
                ${cvData.personalInfo.linkedIn ? `
                <img src="${generateQRCodeDataURLSync(cvData.personalInfo.linkedIn)}" alt="LinkedIn QR" class="qr-code" />
                <div class="qr-label">LinkedIn Portfolio</div>
                ` : ''}
              </div>
            </div>
          </header>

          <div class="content-grid">
            <!-- Main Content with Timeline -->
            <main class="main-content">
              <!-- Experience with Timeline Layout -->
              <section class="section">
                <h2 class="section-title">Kreativ Erfarenhet</h2>
                <div class="experience-timeline">
                  ${cvData.experience.map(exp => {
                    const achievements = extractAchievements(exp.description.join(' ') + ' ' + (exp.achievements?.join(' ') || ''));
                    return `
                    <div class="timeline-item">
                      <div class="timeline-duration">${formatDateRange(exp.startDate, exp.endDate)}</div>
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      <div class="description">
                        <ul>
                          ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                        </ul>
                      </div>
                      ${achievements.length > 0 ? `
                      <div class="achievements-section">
                        <h4 style="margin: 0.5cm 0 0.3cm 0; color: ${primaryColor}; font-size: 9pt;">Kvantifierade Resultat:</h4>
                        ${achievements.map((ach: any) => `
                          <div class="achievement-metric">
                            <span class="achievement-value">${ach.value}</span>
                            <span class="achievement-context">${ach.context}</span>
                          </div>
                        `).join('')}
                      </div>
                      ` : ''}
                    </div>
                    `;
                  }).join('')}
                </div>
              </section>
              
              <!-- Portfolio Section -->
              ${generatePortfolioSection(cvData.projects || [], primaryColor)}
            </main>

            <!-- Enhanced Sidebar -->
            <aside class="sidebar">
              <!-- Contact with Icons -->
              <section class="section">
                <h2 class="section-title">Kontakt</h2>
                <div class="contact-item">
                  <div class="contact-icon">${generateSectionIcon('email', 'white')}</div>
                  <span>${cvData.personalInfo.email}</span>
                </div>
                ${cvData.personalInfo.phone ? `
                <div class="contact-item">
                  <div class="contact-icon">${generateSectionIcon('phone', 'white')}</div>
                  <span>${cvData.personalInfo.phone}</span>
                </div>
                ` : ''}
                ${cvData.personalInfo.linkedIn ? `
                <div class="contact-item">
                  <div class="contact-icon">${generateSectionIcon('linkedin', 'white')}</div>
                  <span>LinkedIn Profil</span>
                </div>
                ` : ''}
                ${cvData.personalInfo.github ? `
                <div class="contact-item">
                  <div class="contact-icon">${generateSectionIcon('github', 'white')}</div>
                  <span>GitHub Portfolio</span>
                </div>
                ` : ''}
                ${cvData.personalInfo.address ? `
                <div class="contact-item">
                  <div class="contact-icon">${generateSectionIcon('location', 'white')}</div>
                  <span>${cvData.personalInfo.address}</span>
                </div>
                ` : ''}
              </section>

              <!-- Skills with Progress Indicators -->
              ${cvData.skills && cvData.skills.length > 0 ? `
              <section class="section">
                <h2 class="section-title">Kreativa Färdigheter</h2>
                ${cvData.skills.map(skillCategory => `
                <div class="skill-item">
                  <div class="skill-category-title">${skillCategory.category}</div>
                  ${skillCategory.skills.map(skill => {
                    const skillLevel = calculateSkillLevel(skill, cvData.experience, cvData.projects || []);
                    return `
                    <div class="skill-with-level">
                      <div class="skill-name">${skill}</div>
                      <div class="skill-progress">
                        <div class="skill-progress-fill" style="width: ${skillLevel}%"></div>
                      </div>
                    </div>
                    `;
                  }).join('')}
                </div>
                `).join('')}
              </section>
              ` : ''}

              <!-- Enhanced Education -->
              <section class="section">
                <h2 class="section-title">Utbildning</h2>
                ${cvData.education.map(edu => `
                <div class="education-item">
                  <div class="degree">${edu.degree}</div>
                  <div class="institution">${edu.institution}</div>
                  ${edu.graduationYear ? `<div class="institution">${edu.graduationYear}</div>` : ''}
                  ${edu.honors ? `<div style="font-size: 8pt; color: #6b7280; margin-top: 0.2cm;">${edu.honors}</div>` : ''}
                </div>
                `).join('')}
              </section>

              <!-- Languages -->
              ${cvData.languages && cvData.languages.length > 0 ? `
              <section class="section">
                <h2 class="section-title">Språk</h2>
                <div class="skills-tags">
                  ${cvData.languages.map(lang => `<span class="skill-tag">${lang.language} (${lang.proficiency})</span>`).join('')}
                </div>
              </section>
              ` : ''}

              <!-- Interests as Visual Tags -->
              ${cvData.interests && cvData.interests.length > 0 ? `
              <section class="section">
                <h2 class="section-title">Intressen</h2>
                <div class="interests-container">
                  ${cvData.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                </div>
              </section>
              ` : ''}
            </aside>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Akademisk CV-mall - För forskare och akademiker
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
            <div class="title">${cvData.targetRole || 'Forskare & Akademiker'}</div>
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
            <h2 class="section-title">Utbildning</h2>
            ${cvData.education.map(edu => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution}</div>
              <div class="date-location">
                ${edu.graduationYear ? edu.graduationYear : ''}
                ${edu.location ? ` • ${edu.location}` : ''}
              </div>
              ${edu.honors ? `<div class="description">Utmärkelser: ${edu.honors}</div>` : ''}
              ${edu.relevantCourses && edu.relevantCourses.length > 0 ? `<div class="description">Relevanta kurser: ${edu.relevantCourses.join(', ')}</div>` : ''}
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
            <h2 class="section-title">Språkkunskaper</h2>
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

// Export alla mallar
export const cvTemplates = {
  'klassisk': klassiskCVTemplate,
  'modern': modernCVTemplate,
  'ats-optimerad': atsOptimeradCVTemplate,
  'kreativ': kreativCVTemplate,
  'akademisk': akademiskCVTemplate,
} as const;

export function getCVTemplate(templateType: keyof typeof cvTemplates): CVTemplate {
  return cvTemplates[templateType];
}

export function getAllCVTemplates(): CVTemplate[] {
  return [
    klassiskCVTemplate,
    modernCVTemplate,
    atsOptimeradCVTemplate,
    kreativCVTemplate,
    akademiskCVTemplate
  ];
}

/**
 * Mallspecifik innehållsoptimering - Anpassar CV-data för varje specifik mall
 * Detta säkerställer att innehållet placeras optimalt baserat på mallens design och fokus
 */
export function optimizeContentForTemplate(cvData: CVMetadata, templateId: string): CVMetadata {
  // Skapa en kopia för att undvika att modifiera original
  const optimizedData = JSON.parse(JSON.stringify(cvData)) as CVMetadata;
  
  switch (templateId) {
    case 'modern':
      return optimizeForTechTemplate(optimizedData);
    
    case 'kreativ':
      return optimizeForCreativeTemplate(optimizedData);
    
    case 'ats-optimerad':
      return optimizeForATSTemplate(optimizedData);
    
    case 'akademisk':
      return optimizeForAcademicTemplate(optimizedData);
    
    case 'klassisk':
      return optimizeForClassicTemplate(optimizedData);
    
    default:
      return optimizedData;
  }
}

/**
 * Tech/Modern mall-optimering - Fokus på tekniska färdigheter och projektresultat
 */
function optimizeForTechTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera tekniska färdigheter
  if (cvData.skills) {
    const techCategories = ['Programming Languages', 'Frameworks', 'Tools', 'Databases', 'Cloud', 'DevOps'];
    const techSkills = cvData.skills.filter(skill => 
      techCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    const otherSkills = cvData.skills.filter(skill => 
      !techCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    
    // Placera tekniska färdigheter först
    cvData.skills = [...techSkills, ...otherSkills];
  }
  
  // Förstärk tekniska projekt
  if (cvData.projects) {
    cvData.projects = cvData.projects.map(project => ({
      ...project,
      // Säkerställ att tekniska projekt har tydliga tech stacks
      technologies: project.technologies || extractTechFromDescription(project.description)
    }));
  }
  
  // Optimera erfarenheter för tech-fokus
  cvData.experience = cvData.experience.map(exp => ({
    ...exp,
    // Framhäv tekniska prestationer i beskrivningar
    description: exp.description.map(desc => enhanceTechDescription(desc)),
    achievements: exp.achievements?.map(ach => enhanceTechAchievement(ach)) || []
  }));
  
  return cvData;
}

/**
 * Kreativ mall-optimering - Fokus på portfolio, visuella projekt och kreativa prestationer
 */
function optimizeForCreativeTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera kreativa färdigheter och verktyg
  if (cvData.skills) {
    const creativeCategories = ['Design', 'Creative', 'Visual', 'Art', 'Media', 'Graphics'];
    const creativeSkills = cvData.skills.filter(skill => 
      creativeCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    const technicalSkills = cvData.skills.filter(skill => 
      !creativeCategories.some(cat => skill.category.toLowerCase().includes(cat.toLowerCase()))
    );
    
    cvData.skills = [...creativeSkills, ...technicalSkills];
  }
  
  // Framhäv visuella och kreativa projekt
  if (cvData.projects) {
    cvData.projects = cvData.projects.map(project => ({
      ...project,
      // Lägg till kreativa nyckelord om de saknas
      description: enhanceCreativeDescription(project.description)
    }));
  }
  
  // Optimera erfarenheter för kreativt fokus
  cvData.experience = cvData.experience.map(exp => ({
    ...exp,
    description: exp.description.map(desc => enhanceCreativeExperience(desc)),
    achievements: exp.achievements?.map(ach => enhanceCreativeAchievement(ach)) || []
  }));
  
  return cvData;
}

/**
 * ATS-optimering - Fokus på nyckelord och enkel struktur
 */
function optimizeForATSTemplate(cvData: CVMetadata): CVMetadata {
  // Säkerställ att summary innehåller branschspecifika nyckelord
  cvData.summary = enhanceForKeywords(cvData.summary || '');
  
  // Optimera färdigheter för ATS-läsning
  if (cvData.skills) {
    cvData.skills = cvData.skills.map(skillCategory => ({
      ...skillCategory,
      skills: skillCategory.skills.map(skill => expandSkillForATS(skill))
    }));
  }
  
  // Förtydliga jobbtitlar och företagsnamn
  cvData.experience = cvData.experience.map(exp => ({
    ...exp,
    position: clarifyJobTitle(exp.position),
    description: exp.description.map(desc => optimizeForATS(desc))
  }));
  
  return cvData;
}

/**
 * Akademisk mall-optimering - Fokus på utbildning, forskning och publikationer
 */
function optimizeForAcademicTemplate(cvData: CVMetadata): CVMetadata {
  // Prioritera akademiska meriter i education
  cvData.education = cvData.education.map(edu => ({
    ...edu,
    // Framhäv akademiska utmärkelser
    honors: edu.honors || extractAcademicHonors(edu.degree).join(', ')
  }));
  
  // Omstrukturera erfarenhet för akademisk miljö
  cvData.experience = cvData.experience.map(exp => ({
    ...exp,
    description: exp.description.map(desc => enhanceAcademicDescription(desc)),
    achievements: exp.achievements?.map(ach => enhanceAcademicAchievement(ach)) || []
  }));
  
  return cvData;
}

/**
 * Klassisk mall-optimering - Balanserad approach med traditionell struktur
 */
function optimizeForClassicTemplate(cvData: CVMetadata): CVMetadata {
  // Säkerställ traditionell ordning av sektioner
  // Klassisk mall behöver minimal optimering - behåller struktur som den är
  
  // Förbättra språk i beskrivningar för mer formell ton
  cvData.experience = cvData.experience.map(exp => ({
    ...exp,
    description: exp.description.map(desc => enhanceForFormalTone(desc))
  }));
  
  return cvData;
}

// Hjälpfunktioner för innehållsoptimering

function extractTechFromDescription(description: string): string[] {
  const techKeywords = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'PHP',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Git', 'Jenkins', 'CI/CD', 'Linux', 'REST', 'GraphQL', 'API'
  ];
  
  const found = techKeywords.filter(tech => 
    description.toLowerCase().includes(tech.toLowerCase())
  );
  
  return [...new Set(found)];
}

function enhanceTechDescription(description: string): string {
  // Framhäv tekniska termer och metriker
  return description
    .replace(/utvecklade|byggde|skapade/gi, 'utvecklade och implementerade')
    .replace(/system/gi, 'tekniska system')
    .replace(/applikation/gi, 'applikationsarkitektur');
}

function enhanceTechAchievement(achievement: string): string {
  // Förstärk tekniska prestationer med kvantifiering
  if (achievement.includes('%')) {
    return achievement + ' genom teknisk optimering';
  }
  return achievement;
}

function enhanceCreativeDescription(description: string): string {
  // Lägg till kreativa nyckelord
  return description
    .replace(/design/gi, 'kreativ design och visuell kommunikation')
    .replace(/skapade|utvecklade/gi, 'konceptualiserade och realiserade');
}

function enhanceCreativeExperience(description: string): string {
  return description
    .replace(/projekt/gi, 'kreativa projekt och kampanjer')
    .replace(/design/gi, 'visuell design och användarupplevelse');
}

function enhanceCreativeAchievement(achievement: string): string {
  // Framhäv kreativa resultat
  return achievement.includes('design') ? 
    achievement + ' med stark visuell impact' : achievement;
}

function enhanceForKeywords(summary: string): string {
  // Lägg till branschspecifika nyckelord för ATS
  const commonKeywords = [
    'erfaren', 'resultatinriktad', 'teamwork', 'problemlösning', 'kommunikation',
    'projektledning', 'kvalitetssäkring', 'kundservice', 'analys'
  ];
  
  // Enkel implementering - i praktiken skulle detta vara mer sofistikerat
  return summary + (summary.includes('erfaren') ? '' : ' Erfaren professional med fokus på resultat.');
}

function expandSkillForATS(skill: string): string {
  // Utöka färdigheter med synonymer för ATS
  const expansions: Record<string, string> = {
    'JS': 'JavaScript (JS)',
    'React': 'React.js',
    'Node': 'Node.js',
    'Python': 'Python programmering',
    'SQL': 'SQL databaser'
  };
  
  return expansions[skill] || skill;
}

function clarifyJobTitle(position: string): string {
  // Förtydliga vaga jobbtitlar
  return position
    .replace(/utvecklare/gi, 'mjukvaruutvecklare')
    .replace(/designer/gi, 'UX/UI designer')
    .replace(/chef/gi, 'avdelningschef');
}

function optimizeForATS(description: string): string {
  // Optimera beskrivningar för ATS-läsning
  return description
    .replace(/&/g, 'och')
    .replace(/\//g, ' och ')
    .replace(/\+/g, ' plus ');
}

function extractAcademicHonors(degree: string): string[] {
  const honors = [];
  if (degree.toLowerCase().includes('cum laude')) honors.push('Cum Laude');
  if (degree.toLowerCase().includes('magna')) honors.push('Magna Cum Laude');
  if (degree.toLowerCase().includes('summa')) honors.push('Summa Cum Laude');
  return honors;
}

function enhanceAcademicDescription(description: string): string {
  return description
    .replace(/forskning/gi, 'akademisk forskning och utveckling')
    .replace(/undervisning/gi, 'pedagogisk verksamhet och undervisning')
    .replace(/projekt/gi, 'forskningsprojekt');
}

function enhanceAcademicAchievement(achievement: string): string {
  // Framhäv akademiska meriter
  return achievement.includes('publikation') ? 
    achievement + ' i peer-reviewed tidskrift' : achievement;
}

function enhanceForFormalTone(description: string): string {
  // Gör språket mer formellt för klassisk mall
  return description
    .replace(/jobbade med/gi, 'arbetade med att utveckla')
    .replace(/hjälpte/gi, 'bistod med att')
    .replace(/gjorde/gi, 'genomförde');
}