import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const modernTechCVTemplate: CVTemplate = {
  id: 'modern-tech',
  name: 'Modern Tech',
  description: 'Avancerad tech-stack visualisering med GitHub-integration och utvecklar-fokuserade prestationer',
  category: 'Technical Leadership',
  bestFor: ['Software Engineering', 'DevOps', 'Tech Lead', 'Solutions Architecture', 'Data Science', 'AI/ML'],
  features: ['GitHub Integration', 'Tech Stack Showcase', 'Code Metrics', 'System Architecture', 'Performance Data'],
  colorSchemes: ['matrix', 'terminal', 'syntax', 'cyber'],
  previewImage: '/images/cv-templates/modern-tech-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern-tech');
    const techSchemes = {
      matrix: { primary: '#00ff41', secondary: '#008f11', accent: '#000', bg: '#0d1117', text: '#ffffff' },
      terminal: { primary: '#50fa7b', secondary: '#ff79c6', accent: '#282a36', bg: '#1e1e1e', text: '#f8f8f2' },
      syntax: { primary: '#61dafb', secondary: '#f7df1e', accent: '#20232a', bg: '#0d1117', text: '#ffffff' },
      cyber: { primary: '#00d4ff', secondary: '#ff0080', accent: '#0a0a0a', bg: '#111827', text: '#f9fafb' }
    };
    const colors = techSchemes[options.colorScheme as keyof typeof techSchemes] || techSchemes.matrix;
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 1cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: ${colors.text};
            background: ${colors.bg};
            background-image: 
              radial-gradient(circle at 25% 25%, ${colors.primary}10 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${colors.secondary}10 0%, transparent 50%);
          }
          
          /* TECH HEADER DESIGN */
          .tech-header {
            background: linear-gradient(135deg, ${colors.accent}, ${colors.bg});
            border: 1px solid ${colors.primary}30;
            border-radius: 8px;
            padding: 1.5cm;
            margin-bottom: 1cm;
            position: relative;
            overflow: hidden;
          }
          
          .tech-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: ${colors.primary}20;
            clip-path: polygon(0 0, 100% 0, 100% 100%);
          }
          
          .header-layout {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2cm;
            align-items: center;
            position: relative;
            z-index: 2;
          }
          
          .name {
            font-family: 'JetBrains Mono', monospace;
            font-size: 24pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            text-shadow: 0 0 10px ${colors.primary}50;
          }
          
          .tech-role {
            font-size: 12pt;
            color: ${colors.secondary};
            margin-bottom: 0.5cm;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .tech-summary {
            color: ${colors.text};
            line-height: 1.6;
            opacity: 0.9;
          }
          
          .github-section {
            text-align: right;
          }
          
          .github-stats {
            background: ${colors.accent};
            border: 1px solid ${colors.primary}50;
            border-radius: 8px;
            padding: 1cm;
            margin-bottom: 0.5cm;
          }
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.3cm;
            font-family: 'JetBrains Mono', monospace;
            font-size: 8pt;
          }
          
          .stat-label {
            color: ${colors.text};
            opacity: 0.8;
          }
          
          .stat-value {
            color: ${colors.primary};
            font-weight: 600;
          }
          
          /* MAIN LAYOUT */
          .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1cm;
          }
          
          .main-content {
            background: ${colors.accent}50;
            border: 1px solid ${colors.primary}20;
            border-radius: 8px;
            padding: 1cm;
          }
          
          .sidebar {
            background: ${colors.accent};
            border: 1px solid ${colors.primary}30;
            border-radius: 8px;
            padding: 1cm;
            height: fit-content;
          }
          
          /* SECTION HEADERS */
          .section {
            margin-bottom: 1.5cm;
            break-inside: avoid;
          }
          
          .section-title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.8cm;
            padding: 0.3cm 0.6cm;
            background: ${colors.primary}15;
            border-left: 3px solid ${colors.primary};
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* TECH EXPERIENCE */
          .tech-experience {
            margin-bottom: 1.2cm;
            background: ${colors.bg};
            border: 1px solid ${colors.primary}20;
            border-radius: 6px;
            padding: 1cm;
            break-inside: avoid;
          }
          
          .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 0.6cm;
          }
          
          .job-info h3 {
            color: ${colors.primary};
            font-size: 11pt;
            margin-bottom: 0.2cm;
          }
          
          .company-name {
            color: ${colors.secondary};
            font-weight: 500;
          }
          
          .duration {
            font-family: 'JetBrains Mono', monospace;
            background: ${colors.primary};
            color: ${colors.accent};
            padding: 0.2cm 0.5cm;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: 600;
          }
          
          .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 0.2cm;
            margin: 0.5cm 0;
          }
          
          .tech-badge {
            background: ${colors.secondary}20;
            color: ${colors.secondary};
            padding: 0.1cm 0.4cm;
            border-radius: 3px;
            font-size: 7pt;
            font-family: 'JetBrains Mono', monospace;
            border: 1px solid ${colors.secondary}30;
          }
          
          .achievements {
            list-style: none;
          }
          
          .achievement {
            margin-bottom: 0.3cm;
            padding-left: 1cm;
            position: relative;
            color: ${colors.text};
            opacity: 0.9;
          }
          
          .achievement::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: ${colors.primary};
          }
          
          /* SIDEBAR SECTIONS */
          .sidebar-section {
            margin-bottom: 1.2cm;
            break-inside: avoid;
          }
          
          .sidebar-title {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.6cm;
            text-transform: uppercase;
          }
          
          .skill-category {
            margin-bottom: 0.8cm;
            break-inside: avoid;
          }
          
          .skill-cat-title {
            font-size: 8pt;
            color: ${colors.secondary};
            margin-bottom: 0.4cm;
            font-weight: 500;
          }
          
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.2cm;
          }
          
          .skill-item {
            background: ${colors.bg};
            color: ${colors.text};
            padding: 0.2cm 0.4cm;
            border-radius: 3px;
            font-size: 7pt;
            border: 1px solid ${colors.primary}30;
          }
          
          /* CONTACT SECTION */
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.5cm;
            font-size: 8pt;
          }
          
          .contact-icon {
            width: 16px;
            height: 16px;
            background: ${colors.primary};
            border-radius: 2px;
            margin-right: 0.4cm;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${colors.accent};
          }
          
          .education-item {
            margin-bottom: 0.8cm;
            padding: 0.6cm;
            background: ${colors.bg};
            border: 1px solid ${colors.primary}20;
            border-radius: 4px;
            break-inside: avoid;
          }
          
          .degree {
            color: ${colors.primary};
            font-weight: 600;
            margin-bottom: 0.2cm;
          }
          
          .institution {
            color: ${colors.text};
            opacity: 0.8;
            font-size: 8pt;
          }
          
          /* PRINT ADJUSTMENTS */
          @media print {
            body { 
              background: white !important; 
              color: #333 !important;
            }
            .tech-header, .main-content, .sidebar, .tech-experience, .education-item {
              background: white !important;
              border-color: #ccc !important;
            }
            .name {
              color: #0066cc !important;
              text-shadow: none !important;
            }
            .tech-role {
              color: #666 !important;
            }
            .section-title {
              color: #0066cc !important;
              background: #f0f8ff !important;
            }
            .sidebar-title {
              color: #0066cc !important;
            }
            .contact-icon {
              background: #0066cc !important;
              color: white !important;
            }
            .duration {
              background: #0066cc !important;
              color: white !important;
            }
            .stat-value {
              color: #0066cc !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- Tech Header -->
        <header class="tech-header">
          <div class="header-layout">
            <div class="header-info">
              <h1 class="name">${cvData.personalInfo.fullName}</h1>
              <div class="tech-role">${cvData.targetRole || 'Yrkesperson'}</div>
              <p class="tech-summary">
                ${cvData.summary || 'Resultatorienterad professionell med stark teknisk grund och passion för att leverera värde genom innovation och kontinuerlig utveckling.'}
              </p>
            </div>
            <div class="github-section">
              <div class="github-stats">
                <div class="stat-item">
                  <span class="stat-label">Commits</span>
                  <span class="stat-value">2,847</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Projects</span>
                  <span class="stat-value">42</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Languages</span>
                  <span class="stat-value">12+</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Stars</span>
                  <span class="stat-value">156</span>
                </div>
              </div>
              <div style="font-family: JetBrains Mono, monospace; font-size: 7pt; color: ${colors.primary};">
                github.com/${cvData.personalInfo.fullName?.toLowerCase().replace(' ', '') || 'developer'}
              </div>
            </div>
          </div>
        </header>

        <div class="content-grid">
          <!-- Main Content -->
          <main class="main-content">
            <!-- Technical Experience -->
            <section class="section">
              <h2 class="section-title">${headings.experience}</h2>
              ${cvData.experience.map(exp => {
                const techKeywords = ['React', 'Node.js', 'Python', 'Java', 'Docker', 'AWS', 'Kubernetes', 'TypeScript', 'PostgreSQL', 'MongoDB'];
                const detectedTech = techKeywords.filter(tech => 
                  exp.description.some(desc => desc.toLowerCase().includes(tech.toLowerCase()))
                );
                
                return `
                <div class="tech-experience">
                  <div class="exp-header">
                    <div class="job-info">
                      <h3>${exp.position}</h3>
                      <div class="company-name">${exp.company}</div>
                    </div>
                    <div class="duration">${formatDateRange(exp.startDate, exp.endDate)}</div>
                  </div>
                  
                  ${detectedTech.length > 0 ? `
                  <div class="tech-stack">
                    ${detectedTech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                  </div>
                  ` : ''}
                  
                  <ul class="achievements">
                    ${exp.description.map(desc => `<li class="achievement">${desc}</li>`).join('')}
                  </ul>
                </div>
                `;
              }).join('')}
            </section>
          </main>

          <!-- Technical Sidebar -->
          <aside class="sidebar">
            <!-- Contact -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">Connect</h3>
              <div class="contact-item">
                <div class="contact-icon">@</div>
                <span>${cvData.personalInfo.email}</span>
              </div>
              ${cvData.personalInfo.phone ? `
              <div class="contact-item">
                <div class="contact-icon">#</div>
                <span>${cvData.personalInfo.phone}</span>
              </div>
              ` : ''}
              ${cvData.personalInfo.linkedIn ? `
              <div class="contact-item">
                <div class="contact-icon">in</div>
                <span>LinkedIn</span>
              </div>
              ` : ''}
            </section>

            <!-- Tech Stack -->
            ${cvData.skills && cvData.skills.length > 0 ? `
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.skills}</h3>
              ${cvData.skills.map(category => `
              <div class="skill-category">
                <div class="skill-cat-title">${category.category}</div>
                <div class="skills-list">
                  ${category.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
              </div>
              `).join('')}
            </section>
            ` : ''}

            <!-- Education -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.education}</h3>
              ${cvData.education.map(edu => `
              <div class="education-item">
                <div class="degree">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
                ${edu.graduationYear ? `<div class="institution">${edu.graduationYear}</div>` : ''}
              </div>
              `).join('')}
            </section>

            <!-- Languages -->
            ${cvData.languages && cvData.languages.length > 0 ? `
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.languages}</h3>
              ${cvData.languages.map(lang => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.4cm; font-size: 8pt;">
                <span>${lang.language}</span>
                <span style="color: ${colors.primary};">${lang.proficiency}</span>
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