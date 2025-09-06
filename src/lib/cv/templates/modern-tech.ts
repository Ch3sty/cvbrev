import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';

export const modernTechCVTemplate: CVTemplate = {
  id: 'modern-tech',
  name: 'Modern Tech Premium',
  description: 'Premium teknisk excellens för svenska tech-ledare - avancerad design som demonstrerar innovativ kompetens och teknisk expertis',
  category: 'Technical',
  bestFor: ['Tech Leadership', 'Mjukvaruarkitektur', 'Digital Innovation', 'AI/ML Engineering', 'Cloud Architecture', 'Tech Startup', 'CTO/VP Engineering'],
  features: ['Innovation-driven', 'Premium tech design', 'Svensk tech-standard', 'Advanced visualizations', 'Future-ready aesthetics'],
  colorSchemes: ['swedish-tech', 'digital-blue', 'innovation-green', 'cyber-purple', 'nordic-slate', 'startup-orange'],
  previewImage: '/images/cv-templates/modern-tech-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern-tech');
    // Premium Swedish Tech Color Schemes
    const techSchemes = {
      'swedish-tech': { primary: '#0052CC', secondary: '#2563eb', accent: '#eff6ff', bg: '#ffffff', text: '#1e293b', light: '#dbeafe', gradient: 'linear-gradient(135deg, #0052CC 0%, #2563eb 100%)' },
      'digital-blue': { primary: '#1e40af', secondary: '#3b82f6', accent: '#eff6ff', bg: '#ffffff', text: '#1e293b', light: '#dbeafe', gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
      'innovation-green': { primary: '#059669', secondary: '#10b981', accent: '#ecfdf5', bg: '#ffffff', text: '#064e3b', light: '#a7f3d0', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
      'cyber-purple': { primary: '#7c3aed', secondary: '#a855f7', accent: '#f3e8ff', bg: '#ffffff', text: '#581c87', light: '#c4b5fd', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' },
      'nordic-slate': { primary: '#475569', secondary: '#64748b', accent: '#f1f5f9', bg: '#ffffff', text: '#0f172a', light: '#cbd5e1', gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' },
      'startup-orange': { primary: '#ea580c', secondary: '#f97316', accent: '#fff7ed', bg: '#ffffff', text: '#9a3412', light: '#fed7aa', gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }
    };
    const colors = techSchemes[options.colorScheme as keyof typeof techSchemes] || techSchemes['swedish-tech'];
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: ${colors.text};
            background: ${colors.bg};
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            background-image: 
              radial-gradient(circle at 10% 20%, ${colors.light} 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors.accent} 0%, transparent 50%);
          }
          
          /* PREMIUM TECH HEADER */
          .tech-header {
            background: ${colors.gradient};
            border-radius: 16px;
            padding: 10mm 8mm;
            margin-bottom: 8mm;
            position: relative;
            overflow: hidden;
            color: white;
            box-shadow: 0 8px 32px ${colors.primary}30;
            border: 1px solid ${colors.primary}20;
          }
          
          .tech-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200px;
            height: 200px;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 4s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
          
          .header-layout {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 8mm;
            align-items: center;
            position: relative;
            z-index: 2;
          }
          
          .name {
            font-family: 'Space Grotesk', 'JetBrains Mono', monospace;
            font-size: 26pt;
            font-weight: 700;
            color: white;
            margin-bottom: 2mm;
            letter-spacing: -0.5px;
          }
          
          .tech-role {
            font-size: 12pt;
            color: rgba(255,255,255,0.9);
            margin-bottom: 3mm;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          
          .tech-summary {
            color: rgba(255,255,255,0.85);
            line-height: 1.5;
            font-size: 10pt;
          }
          
          .github-section {
            text-align: center;
          }
          
          .tech-stats {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 10px;
            padding: 4mm;
            margin-bottom: 3mm;
          }
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
            font-family: 'JetBrains Mono', monospace;
            font-size: 8pt;
          }
          
          .stat-label {
            color: rgba(255,255,255,0.8);
          }
          
          .stat-value {
            color: white;
            font-weight: 600;
          }
          
          .github-link {
            font-family: 'JetBrains Mono', monospace;
            font-size: 7pt;
            color: rgba(255,255,255,0.7);
            background: rgba(255,255,255,0.1);
            padding: 1mm 3mm;
            border-radius: 5px;
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          /* MODERN LAYOUT */
          .content-grid {
            display: grid;
            grid-template-columns: 2.2fr 1fr;
            gap: 6mm;
          }
          
          .main-content {
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 10px;
            padding: 6mm;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          
          .sidebar {
            background: linear-gradient(135deg, ${colors.light} 0%, white 100%);
            border: 1px solid ${colors.accent};
            border-radius: 10px;
            padding: 6mm;
            height: fit-content;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          
          /* TECH SECTION HEADERS */
          .section {
            margin-bottom: 8mm;
            break-inside: avoid;
          }
          
          .section-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 5mm;
            padding: 3mm 5mm;
            background: linear-gradient(135deg, ${colors.light} 0%, ${colors.accent} 100%);
            border-left: 4px solid ${colors.primary};
            border-radius: 0 8px 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
          }
          
          .section-title::before {
            content: '▶';
            position: absolute;
            left: -2px;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.primary};
            font-size: 8pt;
          }
          
          /* MODERN TECH EXPERIENCE */
          .tech-experience {
            margin-bottom: 6mm;
            background: linear-gradient(135deg, ${colors.light}40 0%, white 100%);
            border: 1px solid ${colors.accent};
            border-radius: 10px;
            padding: 5mm;
            break-inside: avoid;
            position: relative;
            overflow: hidden;
          }
          
          .tech-experience::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
          }
          
          .exp-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4mm;
          }
          
          .job-info h3 {
            font-family: 'Space Grotesk', sans-serif;
            color: ${colors.primary};
            font-size: 12pt;
            margin-bottom: 1mm;
            font-weight: 600;
          }
          
          .company-name {
            color: ${colors.text};
            font-weight: 500;
            font-size: 10pt;
          }
          
          .duration {
            font-family: 'JetBrains Mono', monospace;
            background: ${colors.primary};
            color: white;
            padding: 2mm 4mm;
            border-radius: 15px;
            font-size: 8pt;
            font-weight: 600;
            box-shadow: 0 2px 6px ${colors.primary}30;
          }
          
          .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
            margin: 3mm 0 4mm 0;
          }
          
          .tech-badge {
            background: linear-gradient(135deg, ${colors.secondary}15, ${colors.primary}10);
            color: ${colors.secondary};
            padding: 1mm 3mm;
            border-radius: 12px;
            font-size: 7pt;
            font-family: 'JetBrains Mono', monospace;
            border: 1px solid ${colors.secondary}30;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .tech-badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px ${colors.secondary}20;
          }
          
          .achievements {
            list-style: none;
          }
          
          .achievement {
            margin-bottom: 2mm;
            padding-left: 5mm;
            position: relative;
            color: ${colors.text};
            font-size: 9pt;
            line-height: 1.4;
          }
          
          .achievement::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: ${colors.primary};
            font-weight: 600;
            top: 1px;
          }
          
          /* MODERN SIDEBAR SECTIONS */
          .sidebar-section {
            margin-bottom: 6mm;
            break-inside: avoid;
          }
          
          .sidebar-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 4mm;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 2px solid ${colors.accent};
            padding-bottom: 1mm;
          }
          
          .skill-category {
            margin-bottom: 4mm;
            break-inside: avoid;
            background: white;
            padding: 3mm;
            border-radius: 8px;
            border: 1px solid ${colors.accent};
          }
          
          .skill-cat-title {
            font-size: 9pt;
            color: ${colors.secondary};
            margin-bottom: 2mm;
            font-weight: 600;
            text-transform: capitalize;
          }
          
          .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
          }
          
          .skill-item {
            background: linear-gradient(135deg, ${colors.light}, ${colors.accent});
            color: ${colors.text};
            padding: 1mm 3mm;
            border-radius: 10px;
            font-size: 7pt;
            border: 1px solid ${colors.primary}20;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .skill-item:hover {
            transform: scale(1.05);
            background: linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}15);
          }
          
          /* MODERN CONTACT SECTION */
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 3mm;
            font-size: 9pt;
            padding: 2mm;
            background: white;
            border-radius: 8px;
            border: 1px solid ${colors.accent};
            transition: all 0.2s ease;
          }
          
          .contact-item:hover {
            background: ${colors.light};
            transform: translateX(2px);
          }
          
          .contact-icon {
            width: 18px;
            height: 18px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            border-radius: 50%;
            margin-right: 3mm;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 7pt;
            box-shadow: 0 2px 4px ${colors.primary}30;
          }
          
          .education-item {
            margin-bottom: 4mm;
            padding: 4mm;
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 8px;
            break-inside: avoid;
            border-left: 4px solid ${colors.primary};
          }
          
          .degree {
            font-family: 'Space Grotesk', sans-serif;
            color: ${colors.primary};
            font-weight: 600;
            margin-bottom: 1mm;
            font-size: 10pt;
          }
          
          .institution {
            color: ${colors.text};
            font-size: 8pt;
            font-weight: 400;
          }
          
          /* Tech Excellence Grid */
          .tech-excellence-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4mm;
            margin-top: 2mm;
          }
          
          .excellence-card {
            background: linear-gradient(135deg, ${colors.light}40 0%, white 100%);
            border: 1px solid ${colors.accent};
            border-radius: 12px;
            padding: 4mm;
            display: flex;
            align-items: flex-start;
            gap: 3mm;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .excellence-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: ${colors.gradient};
          }
          
          .excellence-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
            background: linear-gradient(135deg, ${colors.light}60 0%, white 100%);
          }
          
          .excellence-card .excellence-icon {
            font-size: 16pt;
            width: 40px;
            height: 40px;
            background: ${colors.gradient};
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 12px ${colors.primary}30;
          }
          
          .excellence-card .excellence-content {
            flex: 1;
          }
          
          .excellence-card .excellence-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 10pt;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 2mm;
          }
          
          .excellence-card .excellence-desc {
            font-size: 8pt;
            color: ${colors.text};
            line-height: 1.4;
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
            .excellence-card .excellence-icon {
              background: #0066cc !important;
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
              <div class="tech-role">${cvData.personalInfo.title || cvData.targetRole || 'Tech Professional'}</div>
              <p class="tech-summary">
                ${cvData.summary || 'Resultatorienterad professionell med stark teknisk grund och passion för att leverera värde genom innovation och kontinuerlig utveckling.'}
              </p>
            </div>
            <div class="github-section">
              <div class="tech-stats">
                <div class="stat-item">
                  <span class="stat-label">Expertis År</span>
                  <span class="stat-value">${(cvData.experience || []).length}+</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Tech Impact</span>
                  <span class="stat-value">Hög</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Innovation</span>
                  <span class="stat-value">Premium</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Standard</span>
                  <span class="stat-value">Svensk</span>
                </div>
              </div>
              <div class="github-link">
                ${cvData.personalInfo.github || 'github.com/developer'}
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
              ${(cvData.experience || []).map(exp => {
                const techKeywords = ['React', 'Node.js', 'Python', 'Java', 'Docker', 'AWS', 'Kubernetes', 'TypeScript', 'PostgreSQL', 'MongoDB'];
                const detectedTech = techKeywords.filter(tech => 
                  (Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).some(desc => desc.toLowerCase().includes(tech.toLowerCase()))
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
                    ${(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => `<li class="achievement">${desc}</li>`).join('')}
                  </ul>
                </div>
                `;
              }).join('')}
            </section>

            <!-- Swedish Tech Excellence & Trust Indicators -->
            <section class="section">
              <h2 class="section-title">Tech Excellens & Innovation</h2>
              <div class="tech-excellence-grid">
                <div class="excellence-card">
                  <div class="excellence-icon">🇸🇪</div>
                  <div class="excellence-content">
                    <div class="excellence-title">Svensk Tech Standard</div>
                    <div class="excellence-desc">Högkvalitativ utveckling enligt svensk branschpraxis</div>
                  </div>
                </div>
                <div class="excellence-card">
                  <div class="excellence-icon">⚡</div>
                  <div class="excellence-content">
                    <div class="excellence-title">Innovation Leadership</div>
                    <div class="excellence-desc">Drivkraft för teknisk innovation och digital transformation</div>
                  </div>
                </div>
                <div class="excellence-card">
                  <div class="excellence-icon">🔧</div>
                  <div class="excellence-content">
                    <div class="excellence-title">Technical Mastery</div>
                    <div class="excellence-desc">Djup expertis inom moderna teknologier och arkitekturer</div>
                  </div>
                </div>
                <div class="excellence-card">
                  <div class="excellence-icon">🎯</div>
                  <div class="excellence-content">
                    <div class="excellence-title">Delivery Excellence</div>
                    <div class="excellence-desc">Proven track record av framgångsrika tech-implementationer</div>
                  </div>
                </div>
              </div>
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
            ${(cvData.skills || []).length > 0 ? `
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.skills}</h3>
              ${(cvData.skills || []).map(category => `
              <div class="skill-category">
                <div class="skill-cat-title">${category.category}</div>
                <div class="skills-list">
                  ${(category.skills || []).map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
              </div>
              `).join('')}
            </section>
            ` : ''}

            <!-- Education -->
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.education}</h3>
              ${(cvData.education || []).map(edu => `
              <div class="education-item">
                <div class="degree">${edu.degree}</div>
                <div class="institution">${edu.institution}</div>
                ${edu.graduationYear ? `<div class="institution">${edu.graduationYear}</div>` : ''}
              </div>
              `).join('')}
            </section>

            <!-- Languages -->
            ${(cvData.languages || []).length > 0 ? `
            <section class="sidebar-section">
              <h3 class="sidebar-title">${headings.languages}</h3>
              ${(cvData.languages || []).map(lang => `
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