import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange } from '../cv-metadata';
import { extractAchievements } from '../visual-elements';

export const modernCVTemplate: CVTemplate = {
  id: 'modern',
  name: 'Modern Premium Professional',
  description: 'Elegant minimalistisk design med premium svenska designprinciper för moderna professionella',
  category: 'Contemporary Excellence',
  bestFor: ['Konsultverksamhet', 'Marknadsföring', 'Projektledning', 'Affärsutveckling', 'Moderna företag', 'Innovation'],
  features: ['Premium minimalism', 'Svenska designprinciper', 'Visual excellence', 'Professional impact', 'Achievement focus'],
  colorSchemes: ['slate', 'teal', 'indigo', 'emerald', 'purple', 'amber'],
  previewImage: '/images/cv-templates/modern-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'modern');
    const colorScheme = {
      slate: { primary: '#1e293b', secondary: '#475569', accent: '#f1f5f9', light: '#cbd5e1', text: '#0f172a', gold: '#d97706' },
      teal: { primary: '#0f766e', secondary: '#14b8a6', accent: '#f0fdfa', light: '#5eead4', text: '#134e4a', gold: '#f59e0b' },
      indigo: { primary: '#3730a3', secondary: '#6366f1', accent: '#eef2ff', light: '#a5b4fc', text: '#312e81', gold: '#d97706' },
      emerald: { primary: '#065f46', secondary: '#10b981', accent: '#ecfdf5', light: '#6ee7b7', text: '#064e3b', gold: '#f59e0b' },
      purple: { primary: '#7c3aed', secondary: '#a855f7', accent: '#faf5ff', light: '#c4b5fd', text: '#581c87', gold: '#d97706' },
      amber: { primary: '#d97706', secondary: '#f59e0b', accent: '#fffbeb', light: '#fcd34d', text: '#92400e', gold: '#10b981' }
    };
    const colors = colorScheme[options.colorScheme as keyof typeof colorScheme] || colorScheme.slate;
    
    // Generate dynamic headings based on CV content and industry
    const achievements = extractAchievements(
      (cvData.experience || []).flatMap(exp => {
        const description = Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : []);
        return description.filter(Boolean);
      }).join(' ') + ' ' +
      (cvData.summary || '')
    );

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Curriculum Vitae - ${cvData.personalInfo.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&display=swap');
          
          /* PREMIUM SWEDISH TYPOGRAPHY SYSTEM */
          :root {
            --font-display: 'Playfair Display', 'Source Serif Pro', 'Times New Roman', serif;
            --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-accent: 'Manrope', 'Inter', sans-serif;
            --font-weight-light: 300;
            --font-weight-normal: 400;
            --font-weight-medium: 500;
            --font-weight-semibold: 600;
            --font-weight-bold: 700;
            --letter-spacing-tight: -0.025em;
            --letter-spacing-normal: 0;
            --letter-spacing-wide: 0.05em;
            --letter-spacing-wider: 0.1em;
            --line-height-tight: 1.2;
            --line-height-normal: 1.6;
            --line-height-relaxed: 1.8;
          }
          
          @page {
            size: A4;
            margin: 20mm 18mm;
            @top-center {
              content: "${cvData.personalInfo.fullName} | Curriculum Vitae";
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 2mm;
            }
            @bottom-center {
              content: "Sida " counter(page) " av " counter(pages);
              font-family: 'Inter', sans-serif;
              font-size: 8pt;
              color: #6b7280;
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: var(--font-body);
            font-size: 11pt;
            line-height: var(--line-height-normal);
            color: ${colors.text};
            background: white;
            font-weight: var(--font-weight-normal);
            letter-spacing: var(--letter-spacing-normal);
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* PREMIUM BACKGROUND TEXTURE */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 25% 25%, ${colors.accent}15 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${colors.accent}10 0%, transparent 50%);
            background-size: 200px 200px;
            pointer-events: none;
            z-index: -1;
          }
          
          /* PREMIUM MODERN HEADER */
          .modern-header {
            position: relative;
            padding: 2.5cm 0 2cm;
            margin-bottom: 2cm;
            text-align: center;
            background: linear-gradient(135deg, ${colors.accent} 0%, white 50%, ${colors.accent} 100%);
            border: 1px solid ${colors.accent};
            border-radius: 8px;
          }
          
          .modern-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.gold}, ${colors.primary});
            border-radius: 2px;
          }
          
          .modern-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.gold}, ${colors.primary});
            border-radius: 2px;
          }
          
          /* PREMIUM SWEDISH TRUST BADGE */
          .swedish-trust-badge {
            position: absolute;
            top: 1cm;
            right: 1cm;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 20px;
            font-size: 8pt;
            font-weight: var(--font-weight-semibold);
            font-family: var(--font-body);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          .swedish-trust-badge::before {
            content: '🇸🇪';
            margin-right: 0.2cm;
          }
          
          .name {
            font-family: var(--font-display);
            font-size: 36pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            letter-spacing: var(--letter-spacing-tight);
            line-height: var(--line-height-tight);
            text-shadow: 0 2px 4px rgba(0,0,0,0.05);
            position: relative;
          }
          
          .name::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, ${colors.gold}, ${colors.primary});
            border-radius: 1px;
          }
          
          .professional-title {
            font-family: var(--font-body);
            font-size: 16pt;
            font-weight: var(--font-weight-medium);
            color: ${colors.secondary};
            margin-bottom: 1cm;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wider);
            position: relative;
          }
          
          .professional-title::before,
          .professional-title::after {
            content: '◆';
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.gold};
            font-size: 12pt;
          }
          
          .professional-title::before {
            left: -2cm;
          }
          
          .professional-title::after {
            right: -2cm;
          }
          
          .professional-summary {
            font-size: 12pt;
            line-height: var(--line-height-relaxed);
            color: #4b5563;
            max-width: 80%;
            margin: 0 auto 1.5cm;
            font-style: italic;
          }
          
          /* PREMIUM CONTACT GRID */
          .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1cm;
            margin: 1.5cm 0;
            padding: 1cm;
            background: white;
            border: 1px solid ${colors.accent};
            border-radius: 4px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            font-size: 10pt;
            color: ${colors.text};
            font-family: var(--font-body);
            transition: all 0.2s ease;
          }
          
          .contact-item:hover {
            transform: translateX(3px);
            color: ${colors.primary};
          }
          
          .contact-icon {
            width: 18px;
            height: 18px;
            margin-right: 0.6cm;
            color: ${colors.secondary};
            transition: all 0.2s ease;
          }
          
          .contact-item:hover .contact-icon {
            color: ${colors.gold};
            transform: scale(1.1);
          }
          
          /* PREMIUM SECTION STYLING */
          .section {
            margin-bottom: 2cm;
            page-break-inside: avoid;
            position: relative;
          }
          
          .section::before {
            content: '';
            position: absolute;
            top: -0.5cm;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${colors.primary}20, transparent);
          }
          
          .section-header {
            position: relative;
            margin-bottom: 1.5cm;
            text-align: center;
            padding: 1cm 0;
            background: linear-gradient(135deg, ${colors.accent}08, transparent, ${colors.accent}08);
            border-radius: 8px;
          }
          
          .section-header::before {
            content: '❖';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 20pt;
            padding: 0 0.5cm;
          }
          
          .section-header::after {
            content: '';
            position: absolute;
            bottom: 0.2cm;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 3px;
            background: linear-gradient(90deg, transparent, ${colors.primary}, ${colors.gold}, ${colors.primary}, transparent);
            border-radius: 2px;
          }
          
          .section-title {
            font-family: var(--font-display);
            font-size: 18pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wider);
            position: relative;
            text-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          
          /* PREMIUM ACHIEVEMENTS BOX */
          .achievements-executive {
            background: linear-gradient(135deg, ${colors.accent}, white);
            border: 2px solid ${colors.primary};
            border-radius: 8px;
            padding: 1.5cm;
            margin-bottom: 2cm;
            position: relative;
          }
          
          .achievements-executive::before {
            content: '★';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 24pt;
            padding: 0 0.5cm;
          }
          
          .achievements-executive h3 {
            font-family: var(--font-display);
            font-size: 16pt;
            font-weight: 600;
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 1cm;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .achievement-executive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1cm;
          }
          
          .achievement-executive-item {
            text-align: center;
            padding: 0.8cm;
            background: white;
            border-radius: 6px;
            border: 1px solid ${colors.accent};
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          
          .achievement-metric {
            font-family: var(--font-display);
            font-size: 24pt;
            font-weight: 700;
            color: ${colors.primary};
            line-height: 1;
            margin-bottom: 0.3cm;
          }
          
          .achievement-description {
            font-size: 10pt;
            color: #6b7280;
            font-family: var(--font-body);
            line-height: 1.4;
          }
          
          /* PREMIUM MODERN TIMELINE DESIGN */
          .experience-timeline {
            position: relative;
            padding-left: 2.5cm;
          }
          
          .experience-timeline::before {
            content: '';
            position: absolute;
            left: 1cm;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(to bottom, 
              ${colors.primary} 0%,
              ${colors.gold} 25%,
              ${colors.secondary} 50%,
              ${colors.gold} 75%,
              ${colors.primary} 100%);
            border-radius: 2px;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
          }
          
          .experience-item {
            position: relative;
            margin-bottom: 2cm;
            padding: 1cm;
            background: linear-gradient(135deg, white, ${colors.accent});
            border-radius: 6px;
            border: 1px solid ${colors.accent};
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            break-inside: avoid;
          }
          
          .experience-item::before {
            content: '◆';
            position: absolute;
            left: -1.45cm;
            top: 1cm;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 3px ${colors.accent}, 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8pt;
            font-weight: bold;
          }
          
          .experience-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            margin-bottom: 0.8cm;
            gap: 1cm;
          }
          
          .job-title {
            font-family: var(--font-display);
            font-size: 14pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            line-height: var(--line-height-tight);
            letter-spacing: var(--letter-spacing-normal);
            position: relative;
          }
          
          .job-title::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, ${colors.gold}, transparent);
            border-radius: 1px;
          }
          
          .company-name {
            font-family: var(--font-body);
            font-size: 12pt;
            font-weight: var(--font-weight-medium);
            color: ${colors.secondary};
            margin-bottom: 0.3cm;
            letter-spacing: var(--letter-spacing-wide);
            text-transform: uppercase;
            font-variant: small-caps;
          }
          
          .date-range {
            font-family: 'Inter', sans-serif;
            font-size: 10pt;
            color: #6b7280;
            background: ${colors.primary};
            color: white;
            padding: 0.3cm 0.6cm;
            border-radius: 15px;
            white-space: nowrap;
            align-self: start;
            font-weight: 500;
          }
          
          .job-description {
            font-size: 11pt;
            line-height: 1.7;
            color: #4b5563;
            margin-bottom: 0.8cm;
          }
          
          .achievements {
            list-style: none;
          }
          
          .achievements li {
            font-size: 10pt;
            line-height: 1.6;
            color: #374151;
            margin-bottom: 0.4cm;
            padding-left: 1.2cm;
            position: relative;
          }
          
          .achievements li::before {
            content: '◆';
            position: absolute;
            left: 0;
            color: ${colors.gold};
            font-weight: bold;
          }
          
          /* PREMIUM SKILLS SHOWCASE */
          .skills-executive {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5cm;
          }
          
          .skill-category-executive {
            background: linear-gradient(135deg, ${colors.accent}05, white, ${colors.accent}10);
            border: 2px solid transparent;
            background-clip: padding-box;
            border-radius: 12px;
            padding: 1.5cm;
            position: relative;
            box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          }
          
          .skill-category-executive::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold}, ${colors.secondary});
            border-radius: 12px;
            z-index: -1;
          }
          
          .skill-category-executive::after {
            content: '❖';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 16pt;
            padding: 0 0.5cm;
            border-radius: 50%;
          }
          
          .skill-category-title {
            font-family: var(--font-display);
            font-size: 13pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            margin-bottom: 1cm;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            position: relative;
            padding-bottom: 0.5cm;
          }
          
          .skill-category-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${colors.gold}, transparent);
            border-radius: 1px;
          }
          
          .skills-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5cm;
          }
          
          .skill-item {
            background: linear-gradient(135deg, white, ${colors.accent}08);
            color: ${colors.text};
            padding: 0.5cm 1cm;
            border-radius: 25px;
            font-size: 10pt;
            font-weight: var(--font-weight-medium);
            text-align: center;
            border: 2px solid transparent;
            background-clip: padding-box;
            font-family: var(--font-body);
            position: relative;
            transition: all 0.2s ease;
          }
          
          .skill-item::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, ${colors.primary}30, ${colors.gold}30);
            border-radius: 25px;
            z-index: -1;
          }
          
          .skill-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          /* PREMIUM EDUCATION SHOWCASE */
          .education-item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2cm;
            margin-bottom: 1.5cm;
            padding: 1.5cm;
            background: linear-gradient(135deg, white, ${colors.accent}10, white);
            border: 2px solid transparent;
            background-clip: padding-box;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.08);
            position: relative;
            break-inside: avoid;
          }
          
          .education-item::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            border-radius: 10px;
            z-index: -1;
          }
          
          .education-item::after {
            content: '🎓';
            position: absolute;
            top: -10px;
            right: 1cm;
            font-size: 20pt;
            background: white;
            padding: 0.2cm;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .degree-title {
            font-family: var(--font-display);
            font-size: 13pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            letter-spacing: var(--letter-spacing-normal);
            position: relative;
          }
          
          .degree-title::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 50px;
            height: 2px;
            background: linear-gradient(90deg, ${colors.gold}, transparent);
            border-radius: 1px;
          }
          
          .institution-name {
            font-family: var(--font-body);
            font-size: 11pt;
            font-weight: var(--font-weight-medium);
            color: ${colors.secondary};
            margin-bottom: 0.5cm;
            letter-spacing: var(--letter-spacing-wide);
            text-transform: uppercase;
            font-variant: small-caps;
          }
          
          .education-details {
            text-align: right;
            font-family: var(--font-body);
          }
          
          .education-date {
            font-size: 10pt;
            color: #6b7280;
            font-weight: var(--font-weight-medium);
            letter-spacing: var(--letter-spacing-wide);
          }
          
          /* PREMIUM LANGUAGES SHOWCASE */
          .languages-executive {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1cm;
          }
          
          .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1cm;
            background: linear-gradient(135deg, white, ${colors.accent}08, white);
            border-radius: 12px;
            border: 2px solid transparent;
            background-clip: padding-box;
            position: relative;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          }
          
          .language-item::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, ${colors.primary}40, ${colors.gold}40);
            border-radius: 12px;
            z-index: -1;
          }
          
          .language-item::after {
            content: '🌐';
            position: absolute;
            top: -8px;
            left: 0.5cm;
            font-size: 16pt;
            background: white;
            padding: 0.1cm;
            border-radius: 50%;
          }
          
          .language-name {
            font-family: var(--font-display);
            font-size: 12pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.text};
            letter-spacing: var(--letter-spacing-normal);
          }
          
          .language-level {
            font-family: var(--font-body);
            font-size: 10pt;
            font-weight: var(--font-weight-semibold);
            background: linear-gradient(135deg, ${colors.gold}, ${colors.primary});
            color: white;
            padding: 0.4cm 0.8cm;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }
          
          /* PREMIUM SEPARATORS */
          .executive-separator {
            height: 3px;
            background: linear-gradient(90deg, 
              transparent, 
              ${colors.primary}40, 
              ${colors.gold}, 
              ${colors.primary}, 
              ${colors.gold}, 
              ${colors.primary}40, 
              transparent);
            margin: 2cm 0;
            border-radius: 2px;
            position: relative;
          }
          
          .executive-separator::before {
            content: '❖';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            color: ${colors.gold};
            font-size: 16pt;
            padding: 0 0.5cm;
          }
          
          /* PRINT OPTIMIZATIONS */
          @media print {
            body {
              font-size: 10pt;
            }
            
            .modern-header {
              padding: 2cm 0 1.5cm;
              margin-bottom: 1.5cm;
            }
            
            .section {
              margin-bottom: 1.5cm;
            }
            
            .achievement-executive-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .skills-executive {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          /* PAGE BREAK MANAGEMENT */
          .page-break-before {
            page-break-before: always;
          }
          
          .no-page-break {
            page-break-inside: avoid;
          }
          
          /* UTILITY CLASSES */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-italic { font-style: italic; }
          .font-bold { font-weight: 700; }
          .uppercase { text-transform: uppercase; }
          
          .mb-small { margin-bottom: 0.5cm; }
          .mb-medium { margin-bottom: 1cm; }
          .mb-large { margin-bottom: 1.5cm; }
          
          /* PREMIUM MICRO-INTERACTIONS */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .section {
            animation: fadeInUp 0.6s ease-out;
          }
        </style>
      </head>
      <body>
        <!-- PREMIUM MODERN HEADER -->
        <header class="modern-header no-page-break">
          <div class="swedish-trust-badge">Svenska Standards</div>
          <h1 class="name">${cvData.personalInfo.fullName}</h1>
          <div class="professional-title">${cvData.personalInfo.title || 'Professionell Kandidat'}</div>
          <div class="professional-summary">
            ${cvData.summary || 'Erfaren professionell med stark kompetens inom svensk företagskultur och internationell affärsutveckling.'}
          </div>
          
          <!-- PREMIUM CONTACT GRID -->
          <div class="contact-grid">
            ${cvData.personalInfo.email ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                </svg>
                ${cvData.personalInfo.email}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.phone ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.09 8.31 8.82 8.59L6.62 10.79Z"/>
                </svg>
                ${cvData.personalInfo.phone}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.location ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                </svg>
                ${cvData.personalInfo.location}
              </div>
            ` : ''}
            
            ${cvData.personalInfo.linkedin ? `
              <div class="contact-item">
                <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM8.5 18.5V9.5H6V18.5H8.5ZM7.25 8.5C7.66421 8.5 8.06116 8.33589 8.35355 8.04351C8.64594 7.75112 8.81 7.35417 8.81 6.94C8.81 6.52583 8.64594 6.12888 8.35355 5.83649C8.06116 5.54411 7.66421 5.38 7.25 5.38C6.83579 5.38 6.43884 5.54411 6.14645 5.83649C5.85406 6.12888 5.69 6.52583 5.69 6.94C5.69 7.35417 5.85406 7.75112 6.14645 8.04351C6.43884 8.33589 6.83579 8.5 7.25 8.5ZM18.5 18.5V13.8C18.5 11.67 18.03 9.9 15.61 9.9C14.45 9.9 13.69 10.53 13.39 11.12H13.36V9.5H11.03V18.5H13.53V14.25C13.53 13.22 13.72 12.23 15.05 12.23C16.36 12.23 16.38 13.4 16.38 14.32V18.5H18.5Z"/>
                </svg>
                LinkedIn Profile
              </div>
            ` : ''}
          </div>
        </header>

        <!-- PREMIUM ACHIEVEMENTS HIGHLIGHT -->
        ${achievements.length > 0 ? `
        <div class="achievements-executive no-page-break">
          <h3>Nyckelresultat & Prestationer</h3>
          <div class="achievement-executive-grid">
            ${achievements.slice(0, 4).map(achievement => `
              <div class="achievement-executive-item">
                <div class="achievement-metric">${achievement.metric || '★'}</div>
                <div class="achievement-description">${achievement.context}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="executive-separator"></div>
        ` : ''}

        <!-- PROFESSIONAL EXPERIENCE -->
        ${(cvData.experience || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.experience}</h2>
          </div>
          
          <div class="experience-timeline">
            ${(cvData.experience || []).map((exp, index) => `
              <div class="experience-item ${index === 0 ? 'no-page-break' : ''}">
                <div class="experience-header">
                  <div>
                    <div class="job-title">${exp.position}</div>
                    <div class="company-name">${exp.company}</div>
                  </div>
                  <div class="date-range">${formatDateRange(exp.startDate, exp.endDate)}</div>
                </div>
                
                ${exp.description ? `
                  <div class="job-description">${exp.description}</div>
                ` : ''}
                
                ${(exp.achievements || []).length > 0 ? `
                  <ul class="achievements">
                    ${(exp.achievements || []).map(achievement => `
                      <li>${achievement}</li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- CORE COMPETENCIES -->
        ${(cvData.skills || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.skills}</h2>
          </div>
          
          <div class="skills-executive">
            ${Object.entries(
              (cvData.skills || []).filter(Boolean).reduce((acc: any, skill: any) => {
                if (!skill) return acc;
                const category = skill.category || 'Kärnkompetenser';
                if (!acc[category]) acc[category] = [];
                // Handle both individual skills and skill objects with skills array
                if (skill.skills && Array.isArray(skill.skills)) {
                  const skillItems = skill.skills.filter(Boolean).map((s: string) => ({ name: s }));
                  acc[category].push(...skillItems);
                } else if (skill) {
                  acc[category].push(skill);
                }
                return acc;
              }, {})
            ).map(([category, skills]) => `
              <div class="skill-category-executive">
                <h4 class="skill-category-title">${category}</h4>
                <div class="skills-list">
                  ${((skills as any[]) || []).filter(Boolean).map((skill: any) => `
                    <div class="skill-item">${skill?.name || skill || ''}</div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- EDUCATION & QUALIFICATIONS -->
        ${(cvData.education || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.education}</h2>
          </div>
          
          ${(cvData.education || []).map(edu => `
            <div class="education-item no-page-break">
              <div>
                <div class="degree-title">${edu.degree}</div>
                <div class="institution-name">${edu.institution}</div>
                ${edu.description ? `<div class="job-description">${edu.description}</div>` : ''}
              </div>
              <div class="education-details">
                <div class="education-date">${edu.startDate ? formatDateRange(edu.startDate, edu.endDate) : (edu.graduationYear || '')}</div>
                ${edu.gpa ? `<div style="margin-top: 0.2cm; font-weight: 600; color: ${colors.primary};">Betyg: ${edu.gpa}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- LANGUAGES -->
        ${(cvData.languages || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">${headings.languages}</h2>
          </div>
          
          <div class="languages-executive">
            ${(cvData.languages || []).map(lang => `
              <div class="language-item">
                <span class="language-name">${lang.language}</span>
                <span class="language-level">${lang.proficiency}</span>
              </div>
            `).join('')}
          </div>
        </section>
        ` : ''}

        <!-- CERTIFICATIONS -->
        ${(cvData.certifications || []).length > 0 ? `
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">Professionella Certifieringar</h2>
          </div>
          
          ${(cvData.certifications || []).map(cert => `
            <div class="education-item no-page-break">
              <div>
                <div class="degree-title">${cert.name}</div>
                <div class="institution-name">${cert.issuer}</div>
              </div>
              <div class="education-details">
                <div class="education-date">${cert.date}</div>
                ${cert.credentialId ? `<div style="margin-top: 0.2cm; font-size: 8pt;">Credential ID: ${cert.credentialId}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </section>
        ` : ''}

        <!-- PREMIUM FOOTER -->
        <footer style="margin-top: 2cm; text-align: center; font-size: 9pt; color: #6b7280; font-family: var(--font-body);">
          <div class="executive-separator"></div>
          <p style="font-style: italic;">
            Detta dokument innehåller konfidentiell information. 
            Alla uppgifter är korrekta per ${new Date().toLocaleDateString('sv-SE')}.
          </p>
        </footer>
      </body>
      </html>
    `;
  }
};