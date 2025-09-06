import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { generateSkillProgressCSS, generateSectionIcon, calculateSkillLevel, extractAchievements, generateQRCodeDataURLSync, generateTimelineCSS, generatePortfolioSection, getPortfolioCSS } from '../visual-elements';

export const kreativCVTemplate: CVTemplate = {
  id: 'kreativ',
  name: 'Kreativ Powerhouse',
  description: 'Visuellt imponerande design för kreativa ledare som vill showcasa sitt portfolio och sina prestationer',
  category: 'Creative Excellence',
  bestFor: ['Creative Director', 'Art Director', 'UX/UI Design', 'Brand Strategy', 'Advertising', 'Digital Media'],
  features: ['Visual Portfolio', 'Achievement Spotlight', 'Creative Timeline', 'Brand Identity', 'Premium Typography'],
  colorSchemes: ['crimson', 'emerald', 'sapphire', 'violet'],
  previewImage: '/images/cv-templates/kreativ-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'kreativ');
    const creativeSchemes = {
      crimson: { primary: '#dc2626', secondary: '#ef4444', accent: '#fef2f2', gradient: 'from-red-500 to-pink-500' },
      emerald: { primary: '#059669', secondary: '#10b981', accent: '#ecfdf5', gradient: 'from-emerald-500 to-teal-500' },
      sapphire: { primary: '#1e40af', secondary: '#3b82f6', accent: '#eff6ff', gradient: 'from-blue-500 to-indigo-500' },
      violet: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f3e8ff', gradient: 'from-purple-500 to-violet-500' }
    };
    const colors = creativeSchemes[options.colorScheme as keyof typeof creativeSchemes] || creativeSchemes.violet;
    const primaryColor = colors.primary;
    const accentColor = colors.accent;
    const lightColor = colors.accent;
    
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
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
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
            break-inside: avoid;
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
            background: linear-gradient(90deg, ${primaryColor}, ${colors.secondary}, ${primaryColor}40);
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
            background: linear-gradient(135deg, ${primaryColor}, ${colors.secondary});
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

          .skill-tag {
            background: linear-gradient(135deg, ${primaryColor}15, ${accentColor}10);
            color: ${primaryColor};
            padding: 0.3cm 0.6cm;
            border-radius: 15px;
            font-size: 8pt;
            font-weight: 500;
            border: 1px solid ${primaryColor}20;
            margin-right: 0.3cm;
            margin-bottom: 0.3cm;
            display: inline-block;
          }
          
          .skills-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
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
                <div class="tagline">${cvData.targetRole || 'Kreativ Professionell'}</div>
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
                <h2 class="section-title">${headings.skills}</h2>
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