import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { generateSkillProgressCSS, generateSectionIcon, calculateSkillLevel, extractAchievements, generateQRCodeDataURLSync, generateTimelineCSS, generatePortfolioSection, getPortfolioCSS } from '../visual-elements';

export const kreativCVTemplate: CVTemplate = {
  id: 'kreativ',
  name: 'Kreativ Professional',
  description: 'Balanserad kreativitet för designbranschen med professionell trovardighet och visuell impact',
  category: 'Creative',
  bestFor: ['Grafisk design', 'Marknadsföring', 'Reklam', 'Webbdesign', 'UX/UI', 'Kreativa byraer', 'Art Direction'],
  features: ['Creative balance', 'Portfolio integration', 'Visual storytelling', 'Brand personality', 'Design showcase'],
  colorSchemes: ['creative', 'brand', 'vibrant', 'artistic', 'modern', 'elegant'],
  previewImage: '/images/cv-templates/kreativ-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'kreativ');
    const creativeSchemes = {
      creative: { primary: '#e11d48', secondary: '#f43f5e', accent: '#fdf2f8', light: '#fef7f7', gradient: 'from-rose-500 to-pink-500' },
      brand: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f3e8ff', light: '#faf5ff', gradient: 'from-purple-500 to-violet-500' },
      vibrant: { primary: '#059669', secondary: '#10b981', accent: '#ecfdf5', light: '#f0fdf4', gradient: 'from-emerald-500 to-teal-500' },
      artistic: { primary: '#dc2626', secondary: '#ef4444', accent: '#fef2f2', light: '#fefbfb', gradient: 'from-red-500 to-orange-500' },
      modern: { primary: '#1e40af', secondary: '#3b82f6', accent: '#eff6ff', light: '#f8faff', gradient: 'from-blue-500 to-indigo-500' },
      elegant: { primary: '#374151', secondary: '#4b5563', accent: '#f9fafb', light: '#fcfcfd', gradient: 'from-gray-600 to-slate-600' }
    };
    const colors = creativeSchemes[options.colorScheme as keyof typeof creativeSchemes] || creativeSchemes.creative;
    const primaryColor = colors.primary;
    const accentColor = colors.accent;
    const lightColor = colors.light;
    
    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          
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
            font-family: 'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1f2937;
            background: linear-gradient(135deg, ${lightColor} 0%, #ffffff 100%);
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
          }
          
          .cv-container {
            background: white;
            min-height: 100vh;
            position: relative;
            overflow: hidden;
          }
          
          /* CREATIVE HEADER WITH ARTISTIC ELEMENTS */
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 8mm 6mm 6mm 6mm;
            position: relative;
            margin-bottom: 5mm;
            border-radius: 0 0 15px 15px;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
          }
          
          .header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: -10%;
            width: 120%;
            height: 30px;
            background: linear-gradient(45deg, ${primaryColor}20, transparent, ${colors.secondary}20);
            transform: skew(-2deg);
          }
          
          .header-content {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8mm;
            align-items: center;
          }
          
          .name {
            font-family: 'Poppins', sans-serif;
            font-size: 28pt;
            font-weight: 600;
            margin-bottom: 2mm;
            text-shadow: 0 2px 8px rgba(0,0,0,0.2);
            letter-spacing: -0.5px;
          }
          
          .tagline {
            font-size: 12pt;
            font-weight: 400;
            opacity: 0.95;
            font-style: italic;
            color: rgba(255,255,255,0.9);
            margin-bottom: 2mm;
          }
          
          .header-qr {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 3mm;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .qr-code {
            width: 60px;
            height: 60px;
            border: 2px solid white;
            border-radius: 6px;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          .qr-label {
            margin-top: 2mm;
            font-size: 8pt;
            opacity: 0.9;
            font-weight: 500;
          }
          
          /* CREATIVE LAYOUT WITH ASYMMETRIC GRID */
          .content-grid {
            display: grid;
            grid-template-columns: 2fr 1.2fr;
            gap: 8mm;
            padding: 0 6mm;
          }
          
          .main-content .section {
            margin-bottom: 6mm;
            break-inside: avoid;
          }
          
          /* CREATIVE SIDEBAR WITH ARTISTIC ELEMENTS */
          .sidebar {
            background: linear-gradient(145deg, ${lightColor} 0%, white 100%);
            padding: 6mm 5mm;
            border-radius: 15px;
            height: fit-content;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05);
            border-left: 4px solid ${primaryColor};
            position: relative;
            overflow: hidden;
          }
          
          .sidebar::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, ${primaryColor}10 0%, transparent 70%);
            border-radius: 0 15px 0 50px;
          }
          
          /* CREATIVE SECTION TITLES WITH ARTISTIC FLAIR */
          .section-title {
            font-family: 'Poppins', sans-serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 4mm;
            position: relative;
            padding-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
            border-radius: 2px;
            box-shadow: 0 1px 3px ${primaryColor}30;
          }
          
          .section-title::before {
            content: '✦';
            position: absolute;
            left: -15px;
            top: -2px;
            color: ${primaryColor};
            font-size: 8pt;
            opacity: 0.7;
          }
          
          /* CREATIVE TIMELINE WITH ARTISTIC ELEMENTS */
          .experience-timeline {
            position: relative;
            padding-left: 8mm;
          }
          
          .experience-timeline::before {
            content: '';
            position: absolute;
            left: 3mm;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, ${primaryColor}, ${colors.secondary}, ${primaryColor}50);
            border-radius: 1px;
          }
          
          .timeline-item {
            position: relative;
            margin-bottom: 6mm;
            padding: 4mm;
            background: linear-gradient(135deg, ${lightColor}40 0%, white 100%);
            border-radius: 12px;
            border: 1px solid ${primaryColor}15;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            break-inside: avoid;
          }
          
          .timeline-item::before {
            content: '';
            position: absolute;
            left: -13mm;
            top: 6mm;
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px ${primaryColor}40;
          }
          
          .timeline-item .job-title {
            font-family: 'Poppins', sans-serif;
            font-size: 12pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 1mm;
          }
          
          .timeline-item .company {
            font-size: 10pt;
            font-weight: 500;
            color: #374151;
            margin-bottom: 2mm;
          }
          
          .timeline-duration {
            font-size: 8pt;
            color: ${colors.secondary};
            font-weight: 500;
            background: ${primaryColor}10;
            padding: 1mm 3mm;
            border-radius: 10px;
            display: inline-block;
            margin-bottom: 2mm;
          }
          
          /* ACHIEVEMENTS HIGHLIGHT */
          ${generateSkillProgressCSS(primaryColor)}
          
          /* CREATIVE CONTACT SECTION */
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 3mm;
            font-size: 9pt;
            padding: 2mm;
            border-radius: 8px;
            background: linear-gradient(135deg, ${primaryColor}05, transparent);
            border: 1px solid ${primaryColor}10;
            transition: all 0.2s ease;
          }
          
          .contact-item:hover {
            background: linear-gradient(135deg, ${primaryColor}10, ${colors.secondary}05);
            transform: translateX(2px);
          }
          
          .contact-icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
            border-radius: 50%;
            margin-right: 3mm;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px ${primaryColor}30;
            flex-shrink: 0;
          }
          
          /* CREATIVE SKILLS VISUALIZATION */
          .skill-item {
            margin-bottom: 4mm;
          }
          
          .skill-category-title {
            font-family: 'Poppins', sans-serif;
            font-size: 9pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            padding-left: 8px;
          }
          
          .skill-category-title::before {
            content: '◆';
            position: absolute;
            left: 0;
            color: ${colors.secondary};
            font-size: 6pt;
          }
          
          .skills-visual {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
          }
          
          .skill-bubble {
            background: linear-gradient(135deg, ${primaryColor}15, ${colors.secondary}10);
            color: ${primaryColor};
            padding: 2mm 4mm;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 500;
            border: 1px solid ${primaryColor}20;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
          }
          
          .skill-bubble:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .skill-with-level {
            margin-bottom: 3mm;
          }
          
          .skill-name {
            font-size: 8pt;
            font-weight: 500;
            color: #374151;
            margin-bottom: 1mm;
          }
          
          /* CREATIVE EDUCATION CARDS */
          .education-item {
            margin-bottom: 4mm;
            padding: 4mm;
            background: linear-gradient(135deg, ${lightColor}60 0%, white 100%);
            border-radius: 10px;
            border: 1px solid ${primaryColor}20;
            box-shadow: 0 3px 10px rgba(0,0,0,0.06);
            break-inside: avoid;
            position: relative;
            overflow: hidden;
          }
          
          .education-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, ${primaryColor}, ${colors.secondary});
          }
          
          .degree {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 1mm;
            font-size: 9pt;
          }
          
          .institution {
            color: #4b5563;
            font-size: 8pt;
            font-weight: 400;
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
            background: linear-gradient(135deg, ${primaryColor}12, ${accentColor}18);
            color: ${primaryColor};
            padding: 2mm 4mm;
            border-radius: 15px;
            font-size: 7pt;
            font-weight: 500;
            border: 1px solid ${primaryColor}20;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
          }
          
          .interest-tag:hover {
            transform: scale(1.05);
            box-shadow: 0 3px 8px rgba(0,0,0,0.12);
          }

          .skill-tag {
            background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}20);
            color: ${primaryColor};
            padding: 2mm 4mm;
            border-radius: 12px;
            font-size: 7pt;
            font-weight: 500;
            border: 1px solid ${primaryColor}25;
            display: inline-block;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }
          
          .skill-tag:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 6px rgba(0,0,0,0.15);
          }
          
          .skills-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
          }
          
          .description ul {
            margin-left: 1cm;
            margin-top: 0.3cm;
          }
          
          .description li {
            margin-bottom: 0.2cm;
          }
          
          /* RESPONSIVE ADJUSTMENTS */
          @media print {
            .header::before { display: none; }
            .sidebar { box-shadow: none; }
            .timeline-item { box-shadow: none; break-inside: avoid; }
            .section { break-inside: avoid; }
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
                <div class="tagline">${cvData.personalInfo.title || cvData.targetRole || 'Kreativ Professional'}</div>
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
                <h2 class="section-title">${headings.experience}</h2>
                <div class="experience-timeline">
                  ${(cvData.experience || []).map(exp => {
                    const achievements = extractAchievements((Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).join(' ') + ' ' + (exp.achievements ? (exp.achievements || []).join(' ') : ''));
                    return `
                    <div class="timeline-item">
                      <div class="timeline-duration">${formatDateRange(exp.startDate, exp.endDate)}</div>
                      <div class="job-title">${exp.position}</div>
                      <div class="company">${exp.company}</div>
                      <div class="description">
                        <ul>
                          ${(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map(desc => `<li>${desc}</li>`).join('')}
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

              <!-- Creative Skills Visualization -->
              ${(cvData.skills || []).length > 0 ? `
              <section class="section">
                <h2 class="section-title">${headings.skills}</h2>
                ${(cvData.skills || []).map(skillCategory => `
                <div class="skill-item">
                  <div class="skill-category-title">${skillCategory.category}</div>
                  <div class="skills-visual">
                    ${(skillCategory.skills || []).map(skill => `
                    <span class="skill-bubble">${skill}</span>
                    `).join('')}
                  </div>
                </div>
                `).join('')}
              </section>
              ` : ''}

              <!-- Enhanced Education -->
              <section class="section">
                <h2 class="section-title">${headings.education}</h2>
                ${(cvData.education || []).map(edu => `
                <div class="education-item">
                  <div class="degree">${edu.degree}</div>
                  <div class="institution">${edu.institution}</div>
                  ${edu.graduationYear ? `<div class="institution">${edu.graduationYear}</div>` : ''}
                  ${edu.honors ? `<div style="font-size: 8pt; color: #6b7280; margin-top: 0.2cm;">${edu.honors}</div>` : ''}
                </div>
                `).join('')}
              </section>

              <!-- Languages -->
              ${(cvData.languages || []).length > 0 ? `
              <section class="section">
                <h2 class="section-title">${headings.languages}</h2>
                <div class="skills-tags">
                  ${(cvData.languages || []).map(lang => `<span class="skill-tag">${lang.language} (${lang.proficiency})</span>`).join('')}
                </div>
              </section>
              ` : ''}

              <!-- Interests as Visual Tags -->
              ${(cvData.interests || []).length > 0 ? `
              <section class="section">
                <h2 class="section-title">Intressen</h2>
                <div class="interests-container">
                  ${(cvData.interests || []).map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
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