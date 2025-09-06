import { CVTemplate, CVMetadata, CVGenerationOptions } from '../cv-metadata';
import { generateDynamicHeadings, formatDateRange, shouldShowSection } from '../cv-metadata';
import { extractAchievements } from '../visual-elements';

export const kreativCVTemplate: CVTemplate = {
  id: 'kreativ',
  name: 'Kreativ Premium Professional',
  description: 'Balanserad premium kreativitet med svensk elegans och visuell impact som passar alla som vill sticka ut',
  designStyle: 'Kreativ Premium',
  visualFeatures: ['Visuell Impact', 'Premium Kreativitet', 'Balanserad Elegans', 'Svensk Design'],
  features: ['Premium kreativitet', 'Portfolio integration', 'Visual storytelling', 'Svenska designprinciper', 'Creative excellence'],
  colorSchemes: ['creative', 'brand', 'vibrant', 'artistic', 'modern', 'elegant'],
  previewImage: '/images/cv-templates/kreativ-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const headings = generateDynamicHeadings(cvData, 'kreativ');
    const creativeSchemes = {
      creative: { primary: '#e11d48', secondary: '#f43f5e', accent: '#fdf2f8', light: '#fef7f7', gradient: 'from-rose-500 to-pink-500', gold: '#f59e0b' },
      brand: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f3e8ff', light: '#faf5ff', gradient: 'from-purple-500 to-violet-500', gold: '#d97706' },
      vibrant: { primary: '#059669', secondary: '#10b981', accent: '#ecfdf5', light: '#f0fdf4', gradient: 'from-emerald-500 to-teal-500', gold: '#f59e0b' },
      artistic: { primary: '#dc2626', secondary: '#ef4444', accent: '#fef2f2', light: '#fefbfb', gradient: 'from-red-500 to-orange-500', gold: '#d97706' },
      modern: { primary: '#1e40af', secondary: '#3b82f6', accent: '#eff6ff', light: '#f8faff', gradient: 'from-blue-500 to-indigo-500', gold: '#f59e0b' },
      elegant: { primary: '#374151', secondary: '#4b5563', accent: '#f9fafb', light: '#fcfcfd', gradient: 'from-gray-600 to-slate-600', gold: '#d97706' }
    };
    const colors = creativeSchemes[options.colorScheme as keyof typeof creativeSchemes] || creativeSchemes.creative;
    
    // Generate dynamic headings and achievements
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
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
          
          /* PREMIUM SWEDISH CREATIVE TYPOGRAPHY SYSTEM */
          :root {
            --font-display: 'Playfair Display', 'Poppins', serif;
            --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-creative: 'Poppins', 'Inter', sans-serif;
            --font-accent: 'Crimson Text', Georgia, serif;
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
              content: "${cvData.personalInfo.fullName} | Kreativt CV";
              font-family: 'Poppins', sans-serif;
              font-size: 8pt;
              color: #6b7280;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 2mm;
            }
            @bottom-center {
              content: "Sida " counter(page) " av " counter(pages);
              font-family: 'Poppins', sans-serif;
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
            color: #1f2937;
            background: linear-gradient(135deg, ${colors.light} 0%, #ffffff 100%);
            font-weight: var(--font-weight-normal);
            letter-spacing: var(--letter-spacing-normal);
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* PREMIUM CREATIVE BACKGROUND */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 20%, ${colors.accent}20 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${colors.light}30 0%, transparent 50%),
              linear-gradient(45deg, ${colors.accent}05, transparent);
            background-size: 300px 300px, 200px 200px, 100% 100%;
            pointer-events: none;
            z-index: -1;
          }
          
          .cv-container {
            background: white;
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          
          /* PREMIUM CREATIVE HEADER WITH ARTISTIC ELEMENTS */
          .creative-header {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            padding: 2.5cm 2cm 2cm 2cm;
            position: relative;
            margin-bottom: 2cm;
            border-radius: 0 0 20px 20px;
            overflow: hidden;
          }
          
          .creative-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
          }
          
          .creative-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: -10%;
            width: 120%;
            height: 30px;
            background: linear-gradient(45deg, ${colors.primary}30, transparent, ${colors.secondary}30);
            transform: skew(-2deg);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          /* PREMIUM SWEDISH CREATIVE TRUST BADGE */
          .swedish-creative-badge {
            position: absolute;
            top: 1cm;
            right: 1cm;
            background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
            backdrop-filter: blur(10px);
            color: white;
            padding: 0.4cm 0.8cm;
            border-radius: 25px;
            font-size: 8pt;
            font-weight: var(--font-weight-semibold);
            font-family: var(--font-creative);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          }
          
          .swedish-creative-badge::before {
            content: '🇸🇪';
            margin-right: 0.3cm;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          }
          
          .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
          }
          
          .creative-name {
            font-family: var(--font-display);
            font-size: 42pt;
            font-weight: var(--font-weight-bold);
            margin-bottom: 0.5cm;
            text-shadow: 0 4px 12px rgba(0,0,0,0.3);
            letter-spacing: var(--letter-spacing-tight);
            line-height: var(--line-height-tight);
            position: relative;
            color: white;
          }
          
          .creative-name::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, ${colors.gold}, rgba(255,255,255,0.8), ${colors.gold});
            border-radius: 2px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          
          .creative-tagline {
            font-family: var(--font-creative);
            font-size: 16pt;
            font-weight: var(--font-weight-medium);
            opacity: 0.95;
            margin-bottom: 1cm;
            color: rgba(255,255,255,0.95);
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wider);
            position: relative;
          }
          
          .creative-tagline::before,
          .creative-tagline::after {
            content: '✦';
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.gold};
            font-size: 14pt;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          .creative-tagline::before {
            left: -2.5cm;
          }
          
          .creative-tagline::after {
            right: -2.5cm;
          }
          
          .creative-summary {
            font-family: var(--font-accent);
            font-size: 13pt;
            line-height: var(--line-height-relaxed);
            color: rgba(255,255,255,0.9);
            max-width: 80%;
            margin: 0 auto 1.5cm;
            font-style: italic;
            text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          }
          
          /* PREMIUM CREATIVE CONTACT SHOWCASE */
          .creative-contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1cm;
            margin: 1.5cm auto;
            max-width: 90%;
            padding: 1.5cm;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          }
          
          .creative-contact-item {
            display: flex;
            align-items: center;
            font-size: 10pt;
            color: rgba(255,255,255,0.95);
            font-family: var(--font-body);
            transition: all 0.3s ease;
            padding: 0.5cm;
            border-radius: 10px;
            backdrop-filter: blur(5px);
          }
          
          .creative-contact-item:hover {
            background: rgba(255,255,255,0.15);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          }
          
          .creative-contact-icon {
            width: 20px;
            height: 20px;
            margin-right: 0.6cm;
            color: ${colors.gold};
            transition: all 0.3s ease;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
          }
          
          .creative-contact-item:hover .creative-contact-icon {
            transform: scale(1.2) rotate(5deg);
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          }
          
          /* PREMIUM CREATIVE SECTION STYLING */
          .creative-section {
            margin-bottom: 2cm;
            page-break-inside: avoid;
            position: relative;
          }
          
          .creative-section::before {
            content: '';
            position: absolute;
            top: -0.5cm;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, 
              transparent, 
              ${colors.primary}30, 
              ${colors.secondary}30, 
              ${colors.gold}30, 
              transparent);
            border-radius: 1px;
          }
          
          .creative-section-header {
            position: relative;
            margin-bottom: 2cm;
            text-align: center;
            padding: 1.5cm 0;
            background: linear-gradient(135deg, ${colors.accent}15, white, ${colors.accent}15);
            border-radius: 15px;
            border: 1px solid ${colors.accent}30;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          }
          
          .creative-section-header::before {
            content: '⚡';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            font-size: 24pt;
            padding: 0.3cm;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            border: 3px solid white;
          }
          
          .creative-section-header::after {
            content: '';
            position: absolute;
            bottom: 0.3cm;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: linear-gradient(90deg, transparent, ${colors.primary}, ${colors.gold}, ${colors.secondary}, transparent);
            border-radius: 2px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .creative-section-title {
            font-family: var(--font-display);
            font-size: 20pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wider);
            position: relative;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          /* PREMIUM CREATIVE ACHIEVEMENTS */
          .creative-achievements {
            background: linear-gradient(135deg, ${colors.accent}20, white, ${colors.light}30);
            border: 3px solid transparent;
            background-clip: padding-box;
            border-radius: 20px;
            padding: 2cm;
            margin-bottom: 2cm;
            position: relative;
            overflow: hidden;
            box-shadow: 0 12px 32px rgba(0,0,0,0.1);
          }
          
          .creative-achievements::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.gold});
            border-radius: 20px;
            z-index: -1;
          }
          
          .creative-achievements::after {
            content: '★';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${colors.gold}, ${colors.secondary});
            color: white;
            font-size: 28pt;
            padding: 0.3cm;
            border-radius: 50%;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            border: 4px solid white;
          }
          
          .creative-achievements h3 {
            font-family: var(--font-display);
            font-size: 18pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            text-align: center;
            margin-bottom: 1.5cm;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
          }
          
          .creative-achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5cm;
          }
          
          .creative-achievement-item {
            text-align: center;
            padding: 1.2cm;
            background: linear-gradient(135deg, white, ${colors.accent}08);
            border-radius: 15px;
            border: 2px solid ${colors.accent}30;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .creative-achievement-item:hover {
            transform: translateY(-5px) rotate(1deg);
            box-shadow: 0 16px 40px rgba(0,0,0,0.15);
          }
          
          .creative-achievement-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.gold});
          }
          
          .creative-achievement-metric {
            font-family: var(--font-display);
            font-size: 28pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            line-height: 1;
            margin-bottom: 0.5cm;
          }
          
          .creative-achievement-description {
            font-size: 11pt;
            color: #6b7280;
            font-family: var(--font-body);
            line-height: var(--line-height-normal);
            font-weight: var(--font-weight-medium);
          }
          
          /* PREMIUM CREATIVE TIMELINE */
          .creative-timeline {
            position: relative;
            padding-left: 3cm;
          }
          
          .creative-timeline::before {
            content: '';
            position: absolute;
            left: 1.5cm;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, 
              ${colors.primary} 0%,
              ${colors.secondary} 25%,
              ${colors.gold} 50%,
              ${colors.secondary} 75%,
              ${colors.primary} 100%);
            border-radius: 2px;
            box-shadow: 0 0 12px rgba(0,0,0,0.15);
          }
          
          .creative-timeline::after {
            content: '🎨';
            position: absolute;
            left: 1.2cm;
            bottom: -25px;
            font-size: 20pt;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            padding: 0.4cm;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            border: 3px solid white;
          }
          
          .creative-experience-item {
            position: relative;
            margin-bottom: 2.5cm;
            padding: 1.5cm;
            background: linear-gradient(135deg, ${colors.light}40 0%, white 50%, ${colors.accent}20 100%);
            border-radius: 15px;
            border: 2px solid ${colors.accent}30;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            break-inside: avoid;
            transition: all 0.3s ease;
          }
          
          .creative-experience-item:hover {
            transform: translateX(5px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.12);
          }
          
          .creative-experience-item::before {
            content: '◆';
            position: absolute;
            left: -1.8cm;
            top: 1.5cm;
            width: 25px;
            height: 25px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.gold});
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 4px ${colors.accent}30, 0 6px 16px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10pt;
            font-weight: bold;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          .creative-experience-item::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.gold});
            border-radius: 15px 15px 0 0;
          }
          
          .creative-experience-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
            margin-bottom: 1cm;
            gap: 1cm;
          }
          
          .creative-job-title {
            font-family: var(--font-display);
            font-size: 16pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.3cm;
            line-height: var(--line-height-tight);
            position: relative;
          }
          
          .creative-job-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 50px;
            height: 3px;
            background: linear-gradient(90deg, ${colors.gold}, ${colors.secondary});
            border-radius: 2px;
          }
          
          .creative-company-name {
            font-family: var(--font-creative);
            font-size: 13pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.secondary};
            margin-bottom: 0.3cm;
            letter-spacing: var(--letter-spacing-wide);
            text-transform: uppercase;
            font-variant: small-caps;
          }
          
          .creative-date-range {
            font-family: var(--font-body);
            font-size: 10pt;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 0.4cm 0.8cm;
            border-radius: 20px;
            white-space: nowrap;
            align-self: start;
            font-weight: var(--font-weight-semibold);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .creative-job-description {
            font-size: 11pt;
            line-height: var(--line-height-relaxed);
            color: #4b5563;
            margin-bottom: 1cm;
            font-family: var(--font-body);
          }
          
          .creative-achievements-list {
            list-style: none;
          }
          
          .creative-achievements-list li {
            font-size: 10pt;
            line-height: var(--line-height-normal);
            color: #374151;
            margin-bottom: 0.5cm;
            padding-left: 1.5cm;
            position: relative;
            font-weight: var(--font-weight-medium);
          }
          
          .creative-achievements-list li::before {
            content: '✦';
            position: absolute;
            left: 0;
            color: ${colors.gold};
            font-size: 12pt;
            font-weight: bold;
          }
          
          /* PREMIUM CREATIVE SKILLS */
          .creative-skills {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2cm;
          }
          
          .creative-skill-category {
            background: linear-gradient(135deg, ${colors.accent}08, white, ${colors.light}15);
            border: 3px solid transparent;
            background-clip: padding-box;
            border-radius: 20px;
            padding: 2cm;
            position: relative;
            box-shadow: 0 12px 32px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          
          .creative-skill-category::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.gold});
            border-radius: 20px;
            z-index: -1;
          }
          
          .creative-skill-category::after {
            content: '⚡';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${colors.gold}, ${colors.secondary});
            color: white;
            font-size: 20pt;
            padding: 0.3cm;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }
          
          .creative-skill-title {
            font-family: var(--font-display);
            font-size: 15pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 1.5cm;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            position: relative;
            padding-bottom: 0.8cm;
          }
          
          .creative-skill-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, transparent, ${colors.gold}, ${colors.secondary}, transparent);
            border-radius: 2px;
          }
          
          .creative-skills-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 0.8cm;
          }
          
          .creative-skill-item {
            background: linear-gradient(135deg, white, ${colors.accent}12);
            color: ${colors.primary};
            padding: 0.8cm 1.2cm;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: var(--font-weight-semibold);
            text-align: center;
            border: 2px solid ${colors.accent}30;
            font-family: var(--font-creative);
            position: relative;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .creative-skill-item:hover {
            transform: translateY(-3px) rotate(2deg);
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            background: linear-gradient(135deg, ${colors.gold}10, ${colors.secondary}10);
          }
          
          .creative-skill-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
            border-radius: 20px 20px 0 0;
          }
          
          /* PREMIUM CREATIVE EDUCATION */
          .creative-education-item {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2cm;
            margin-bottom: 2cm;
            padding: 2cm;
            background: linear-gradient(135deg, white, ${colors.accent}10, ${colors.light}10);
            border: 3px solid transparent;
            background-clip: padding-box;
            border-radius: 20px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.1);
            position: relative;
            break-inside: avoid;
            transition: all 0.3s ease;
          }
          
          .creative-education-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 40px rgba(0,0,0,0.15);
          }
          
          .creative-education-item::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.gold});
            border-radius: 20px;
            z-index: -1;
          }
          
          .creative-education-item::after {
            content: '🎓';
            position: absolute;
            top: -15px;
            right: 2cm;
            font-size: 24pt;
            background: linear-gradient(135deg, ${colors.gold}, white);
            padding: 0.3cm;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            border: 3px solid white;
          }
          
          .creative-degree-title {
            font-family: var(--font-display);
            font-size: 15pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            margin-bottom: 0.5cm;
            line-height: var(--line-height-tight);
            position: relative;
          }
          
          .creative-degree-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, ${colors.gold}, ${colors.secondary});
            border-radius: 2px;
          }
          
          .creative-institution-name {
            font-family: var(--font-creative);
            font-size: 12pt;
            font-weight: var(--font-weight-semibold);
            color: ${colors.secondary};
            margin-bottom: 0.8cm;
            letter-spacing: var(--letter-spacing-wide);
            text-transform: uppercase;
            font-variant: small-caps;
          }
          
          .creative-education-details {
            text-align: right;
            font-family: var(--font-body);
          }
          
          .creative-education-date {
            font-size: 11pt;
            color: #6b7280;
            font-weight: var(--font-weight-semibold);
            letter-spacing: var(--letter-spacing-wide);
          }
          
          /* PREMIUM CREATIVE LANGUAGES */
          .creative-languages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.5cm;
          }
          
          .creative-language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.2cm;
            background: linear-gradient(135deg, white, ${colors.accent}08, ${colors.light}08);
            border-radius: 20px;
            border: 3px solid transparent;
            background-clip: padding-box;
            position: relative;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
          }
          
          .creative-language-item:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
          }
          
          .creative-language-item::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(135deg, ${colors.primary}50, ${colors.gold}50);
            border-radius: 20px;
            z-index: -1;
          }
          
          .creative-language-item::after {
            content: '🌐';
            position: absolute;
            top: -12px;
            left: 1cm;
            font-size: 20pt;
            background: white;
            padding: 0.2cm;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .creative-language-name {
            font-family: var(--font-display);
            font-size: 13pt;
            font-weight: var(--font-weight-bold);
            color: ${colors.primary};
            letter-spacing: var(--letter-spacing-normal);
          }
          
          .creative-language-level {
            font-family: var(--font-creative);
            font-size: 10pt;
            font-weight: var(--font-weight-bold);
            background: linear-gradient(135deg, ${colors.gold}, ${colors.secondary});
            color: white;
            padding: 0.5cm 1cm;
            border-radius: 25px;
            text-transform: uppercase;
            letter-spacing: var(--letter-spacing-wide);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          
          /* PREMIUM CREATIVE SEPARATORS */
          .creative-separator {
            height: 4px;
            background: linear-gradient(90deg, 
              transparent, 
              ${colors.primary}60, 
              ${colors.secondary}, 
              ${colors.gold}, 
              ${colors.secondary}, 
              ${colors.primary}60, 
              transparent);
            margin: 2.5cm 0;
            border-radius: 2px;
            position: relative;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .creative-separator::before {
            content: '✦';
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, ${colors.gold}, ${colors.secondary});
            color: white;
            font-size: 20pt;
            padding: 0.3cm;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }
          
          /* PRINT OPTIMIZATIONS */
          @media print {
            body {
              background: white !important;
              font-size: 10pt;
            }
            
            .creative-header {
              padding: 2cm 1.5cm 1.5cm;
              margin-bottom: 1.5cm;
            }
            
            .creative-section {
              margin-bottom: 1.5cm;
            }
            
            .creative-achievement-grid {
              grid-template-columns: repeat(3, 1fr);
            }
            
            .creative-skills {
              grid-template-columns: repeat(2, 1fr);
            }
            
            /* Remove animations and transforms for print */
            *, *::before, *::after {
              animation: none !important;
              transition: none !important;
              transform: none !important;
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
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- PREMIUM CREATIVE HEADER -->
          <header class="creative-header">
            <div class="swedish-creative-badge">Svenska Creative</div>
            <div class="header-content">
              <h1 class="creative-name">${cvData.personalInfo.fullName}</h1>
              <div class="creative-tagline">${cvData.personalInfo.title || 'Kreativ Professionell'}</div>
              <div class="creative-summary">
                ${cvData.summary || 'Erfaren kreativ professionell med passion för innovation och visuell excellens inom svensk designkultur.'}
              </div>
              
              <!-- PREMIUM CREATIVE CONTACT GRID -->
              <div class="creative-contact-grid">
                ${cvData.personalInfo.email ? `
                  <div class="creative-contact-item">
                    <svg class="creative-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                    </svg>
                    ${cvData.personalInfo.email}
                  </div>
                ` : ''}
                
                ${cvData.personalInfo.phone ? `
                  <div class="creative-contact-item">
                    <svg class="creative-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.09 8.31 8.82 8.59L6.62 10.79Z"/>
                    </svg>
                    ${cvData.personalInfo.phone}
                  </div>
                ` : ''}
                
                ${cvData.personalInfo.location ? `
                  <div class="creative-contact-item">
                    <svg class="creative-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z"/>
                    </svg>
                    ${cvData.personalInfo.location}
                  </div>
                ` : ''}
                
                ${cvData.personalInfo.linkedin ? `
                  <div class="creative-contact-item">
                    <svg class="creative-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19ZM8.5 18.5V9.5H6V18.5H8.5ZM7.25 8.5C7.66421 8.5 8.06116 8.33589 8.35355 8.04351C8.64594 7.75112 8.81 7.35417 8.81 6.94C8.81 6.52583 8.64594 6.12888 8.35355 5.83649C8.06116 5.54411 7.66421 5.38 7.25 5.38C6.83579 5.38 6.43884 5.54411 6.14645 5.83649C5.85406 6.12888 5.69 6.52583 5.69 6.94C5.69 7.35417 5.85406 7.75112 6.14645 8.04351C6.43884 8.33589 6.83579 8.5 7.25 8.5ZM18.5 18.5V13.8C18.5 11.67 18.03 9.9 15.61 9.9C14.45 9.9 13.69 10.53 13.39 11.12H13.36V9.5H11.03V18.5H13.53V14.25C13.53 13.22 13.72 12.23 15.05 12.23C16.36 12.23 16.38 13.4 16.38 14.32V18.5H18.5Z"/>
                    </svg>
                    LinkedIn Portfolio
                  </div>
                ` : ''}
              </div>
            </div>
          </header>

          <!-- PREMIUM CREATIVE ACHIEVEMENTS -->
          ${achievements.length > 0 ? `
          <div class="creative-achievements no-page-break">
            <h3>Kreativa Prestationer & Impact</h3>
            <div class="creative-achievement-grid">
              ${achievements.slice(0, 4).map(achievement => `
                <div class="creative-achievement-item">
                  <div class="creative-achievement-metric">${achievement.metric || '✨'}</div>
                  <div class="creative-achievement-description">${achievement.context}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="creative-separator"></div>
          ` : ''}

          <!-- PROFESSIONAL EXPERIENCE -->
          ${(cvData.experience || []).length > 0 ? `
          <section class="creative-section">
            <div class="creative-section-header">
              <h2 class="creative-section-title">${headings.experience}</h2>
            </div>
            
            <div class="creative-timeline">
              ${(cvData.experience || []).map((exp, index) => `
                <div class="creative-experience-item ${index === 0 ? 'no-page-break' : ''}">
                  <div class="creative-experience-header">
                    <div>
                      <div class="creative-job-title">${exp.position}</div>
                      <div class="creative-company-name">${exp.company}</div>
                    </div>
                    <div class="creative-date-range">${formatDateRange(exp.startDate, exp.endDate)}</div>
                  </div>
                  
                  ${exp.description ? `
                    <div class="creative-job-description">${exp.description}</div>
                  ` : ''}
                  
                  ${(exp.achievements || []).length > 0 ? `
                    <ul class="creative-achievements-list">
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

          <!-- CREATIVE COMPETENCIES -->
          ${(cvData.skills || []).length > 0 ? `
          <section class="creative-section">
            <div class="creative-section-header">
              <h2 class="creative-section-title">${headings.skills}</h2>
            </div>
            
            <div class="creative-skills">
              ${Object.entries(
                (cvData.skills || []).filter(Boolean).reduce((acc: any, skill: any) => {
                  if (!skill) return acc;
                  const category = skill.category || 'Kreativa Kompetenser';
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
                <div class="creative-skill-category">
                  <h4 class="creative-skill-title">${category}</h4>
                  <div class="creative-skills-list">
                    ${((skills as any[]) || []).filter(Boolean).map((skill: any) => `
                      <div class="creative-skill-item">${skill?.name || skill || ''}</div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- EDUCATION & QUALIFICATIONS -->
          ${(cvData.education || []).length > 0 ? `
          <section class="creative-section">
            <div class="creative-section-header">
              <h2 class="creative-section-title">${headings.education}</h2>
            </div>
            
            ${(cvData.education || []).map(edu => `
              <div class="creative-education-item no-page-break">
                <div>
                  <div class="creative-degree-title">${edu.degree}</div>
                  <div class="creative-institution-name">${edu.institution}</div>
                  ${edu.description ? `<div class="creative-job-description">${edu.description}</div>` : ''}
                </div>
                <div class="creative-education-details">
                  <div class="creative-education-date">${edu.startDate ? formatDateRange(edu.startDate, edu.endDate) : (edu.graduationYear || '')}</div>
                  ${edu.gpa ? `<div style="margin-top: 0.3cm; font-weight: 600; color: ${colors.primary};">Betyg: ${edu.gpa}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- LANGUAGES -->
          ${shouldShowSection('languages', cvData) ? `
          <section class="creative-section">
            <div class="creative-section-header">
              <h2 class="creative-section-title">${headings.languages}</h2>
            </div>
            
            <div class="creative-languages">
              ${(cvData.languages || []).map(lang => `
                <div class="creative-language-item">
                  <span class="creative-language-name">${lang.language}</span>
                  <span class="creative-language-level">${lang.proficiency}</span>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- CERTIFICATIONS -->
          ${shouldShowSection('certifications', cvData) ? `
          <section class="creative-section">
            <div class="creative-section-header">
              <h2 class="creative-section-title">Kreativa Certifieringar</h2>
            </div>
            
            ${(cvData.certifications || []).map(cert => `
              <div class="creative-education-item no-page-break">
                <div>
                  <div class="creative-degree-title">${cert.name}</div>
                  <div class="creative-institution-name">${cert.issuer}</div>
                </div>
                <div class="creative-education-details">
                  <div class="creative-education-date">${cert.date}</div>
                  ${cert.credentialId ? `<div style="margin-top: 0.3cm; font-size: 8pt;">Credential ID: ${cert.credentialId}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </section>
          ` : ''}

          <!-- PREMIUM CREATIVE FOOTER -->
          <footer style="margin-top: 2.5cm; text-align: center; font-size: 9pt; color: #6b7280; font-family: var(--font-body);">
            <div class="creative-separator"></div>
            <p style="font-style: italic;">
              Detta kreativa dokument representerar min professionella resa. 
              Alla uppgifter är korrekta per ${new Date().toLocaleDateString('sv-SE')}.
            </p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }
};