import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { generateSkillProgressCSS, generateSectionIcon, calculateSkillLevel, extractAchievements } from '../visual-elements';

export const modernCVTemplate: CVTemplate = {
  id: 'modern',
  name: 'Modern Professional',
  description: 'Elegant minimalistisk design för framgångsrika professionella inom alla branscher',
  category: 'Contemporary',
  bestFor: ['Konsultverksamhet', 'Marknadsföring', 'Projektledning', 'Affärsutveckling', 'Moderna företag', 'Startup'],
  features: ['Minimalistisk elegans', 'Visual hierarchy', 'Achievement focus', 'Clean typography', 'Professional impact'],
  colorSchemes: ['slate', 'teal', 'indigo', 'emerald'],
  previewImage: '/images/cv-templates/modern-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern');
    const colorScheme = {
      slate: { primary: '#1e293b', secondary: '#475569', accent: '#f1f5f9', light: '#cbd5e1' },
      teal: { primary: '#0f766e', secondary: '#14b8a6', accent: '#f0fdfa', light: '#5eead4' },
      indigo: { primary: '#3730a3', secondary: '#6366f1', accent: '#eef2ff', light: '#a5b4fc' },
      emerald: { primary: '#065f46', secondary: '#10b981', accent: '#ecfdf5', light: '#6ee7b7' }
    };
    const colors = colorScheme[options.colorScheme as keyof typeof colorScheme] || colorScheme.slate;
    const primaryColor = colors.primary;
    const accentColor = colors.accent;
    const lightColor = colors.light;
    const techBg = colors.secondary + '10';
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
          
          @page {
            size: A4;
            margin: 1.2cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #1f2937;
            background: white;
            font-weight: 300;
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
            color: ${colors.secondary};
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
            break-inside: avoid;
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
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
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
            break-inside: avoid;
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
            color: ${colors.secondary};
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
            color: ${colors.secondary};
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
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
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
            break-inside: avoid;
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
              <div class="dev-title">${cvData.targetRole || 'Yrkesperson'}</div>
              <p class="tech-summary">${cvData.summary || 'Passionerad professionell med fokus på modern teknik och användarupplevelse.'}</p>
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
              <h2 class="section-title">${headings.experience}</h2>
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
              <h2 class="section-title">${headings.projects}</h2>
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
              <h2 class="section-title">${headings.skills}</h2>
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
              <h2 class="section-title">${headings.education}</h2>
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