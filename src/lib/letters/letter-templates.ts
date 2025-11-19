/**
 * Letter Templates - Professional cover letter designs
 *
 * Each template generates HTML with embedded CSS for consistent rendering
 * across PDF export, DOCX export, and web preview.
 *
 * IMPORTANT: All templates must be ATS-compatible:
 * - Semantic HTML (h1, h2, p, not complex divs)
 * - Standard fonts (Arial, Calibri, Times New Roman, Georgia)
 * - No images or graphics
 * - Linear text flow (no complex layouts that confuse parsers)
 */

import { ProfileDataForLetter, JobInfo } from './template-merger';

export interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  tier: 'free' | 'premium';
  industries: string[];  // Recommended industries
  generateHTML: (
    profile: ProfileDataForLetter,
    jobInfo: JobInfo,
    bodyContent: string,
    date?: string
  ) => string;
}

/**
 * Format Swedish date: "19 november 2025"
 */
function formatSwedishDate(date: Date = new Date()): string {
  const months = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * CLASSIC Template - Traditional Swedish standard
 * FREE tier
 */
export const classicTemplate: LetterTemplate = {
  id: 'classic',
  name: 'Klassisk',
  description: 'Traditionell svensk brevmall enligt standard',
  tier: 'free',
  industries: ['Alla branscher', 'Offentlig sektor', 'Utbildning', 'Vård'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2.54cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2.54cm;
    }
    .header {
      margin-bottom: 2rem;
    }
    .header p {
      margin: 0.25rem 0;
    }
    .recipient {
      margin-bottom: 2rem;
    }
    .recipient p {
      margin: 0.25rem 0;
    }
    .date {
      margin-bottom: 2rem;
    }
    .greeting {
      margin-bottom: 1.5rem;
    }
    .body {
      margin-bottom: 2rem;
      text-align: justify;
    }
    .body p {
      margin-bottom: 1rem;
    }
    .signature {
      margin-top: 2rem;
    }
    .signature p {
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <p><strong>${profile.full_name}</strong></p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
  </div>

  <div class="recipient">
    ${jobInfo.recipient ? `<p>${jobInfo.recipient}</p>` : ''}
    <p>${jobInfo.company}</p>
    ${jobInfo.position ? `<p>Avseende: ${jobInfo.position}</p>` : ''}
  </div>

  <div class="date">
    <p>${date}</p>
  </div>

  <div class="greeting">
    <p>${jobInfo.recipient ? `Hej ${jobInfo.recipient},` : 'Hej,'}</p>
  </div>

  <div class="body">
    ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
  </div>

  <div class="signature">
    <p>Med vänliga hälsningar,</p>
    <p><strong>${profile.full_name}</strong></p>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * MINIMALIST Template - Clean, maximum whitespace
 * FREE tier
 */
export const minimalistTemplate: LetterTemplate = {
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Ultra-clean design med generösa marginaler',
  tier: 'free',
  industries: ['Tech', 'Design', 'Startup', 'Consulting'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 3cm;
    }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.8;
      color: #333;
      max-width: 21cm;
      margin: 0 auto;
      padding: 3cm;
    }
    .header {
      margin-bottom: 3rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e0e0e0;
    }
    .header p {
      margin: 0.4rem 0;
      font-size: 10pt;
      color: #666;
    }
    .header p:first-child {
      font-size: 14pt;
      font-weight: 600;
      color: #000;
      letter-spacing: -0.02em;
    }
    .recipient {
      margin-bottom: 3rem;
    }
    .recipient p {
      margin: 0.3rem 0;
      font-size: 10pt;
      color: #666;
    }
    .date {
      margin-bottom: 3rem;
      font-size: 10pt;
      color: #999;
    }
    .greeting {
      margin-bottom: 2rem;
      font-weight: 500;
    }
    .body {
      margin-bottom: 3rem;
    }
    .body p {
      margin-bottom: 1.5rem;
    }
    .signature {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
    }
    .signature p {
      margin: 0.5rem 0;
    }
    .signature p:first-child {
      font-size: 10pt;
      color: #666;
    }
    .signature p:last-child {
      font-weight: 600;
      color: #000;
    }
  </style>
</head>
<body>
  <div class="header">
    <p>${profile.full_name}</p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
  </div>

  <div class="recipient">
    ${jobInfo.recipient ? `<p>${jobInfo.recipient}</p>` : ''}
    <p>${jobInfo.company}</p>
    ${jobInfo.position ? `<p>${jobInfo.position}</p>` : ''}
  </div>

  <div class="date">
    <p>${date}</p>
  </div>

  <div class="greeting">
    <p>${jobInfo.recipient ? `Hej ${jobInfo.recipient},` : 'Hej,'}</p>
  </div>

  <div class="body">
    ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
  </div>

  <div class="signature">
    <p>Med vänliga hälsningar,</p>
    <p>${profile.full_name}</p>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * MODERN Template - Clean design with blue accents
 * PREMIUM tier
 */
export const modernTemplate: LetterTemplate = {
  id: 'modern',
  name: 'Modern',
  description: 'Professionell design med moderna accenter',
  tier: 'premium',
  industries: ['Tech', 'Marknadsföring', 'Finans', 'Consulting'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #2c3e50;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2.5cm;
    }
    .header {
      margin-bottom: 2.5rem;
      padding-left: 1rem;
      border-left: 4px solid #3b82f6;
    }
    .header p {
      margin: 0.3rem 0;
    }
    .header p:first-child {
      font-size: 14pt;
      font-weight: 600;
      color: #1e293b;
    }
    .recipient {
      margin-bottom: 2rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 4px;
    }
    .recipient p {
      margin: 0.25rem 0;
      color: #475569;
    }
    .date {
      margin-bottom: 2rem;
      color: #64748b;
      font-size: 10pt;
    }
    .greeting {
      margin-bottom: 1.5rem;
      font-weight: 500;
      color: #1e293b;
    }
    .body {
      margin-bottom: 2rem;
    }
    .body p {
      margin-bottom: 1.2rem;
    }
    .signature {
      margin-top: 2.5rem;
    }
    .signature p:first-child {
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .signature p:last-child {
      font-weight: 600;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="header">
    <p>${profile.full_name}</p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
  </div>

  <div class="recipient">
    ${jobInfo.recipient ? `<p><strong>${jobInfo.recipient}</strong></p>` : ''}
    <p><strong>${jobInfo.company}</strong></p>
    ${jobInfo.position ? `<p>${jobInfo.position}</p>` : ''}
  </div>

  <div class="date">
    <p>${date}</p>
  </div>

  <div class="greeting">
    <p>${jobInfo.recipient ? `Hej ${jobInfo.recipient},` : 'Hej,'}</p>
  </div>

  <div class="body">
    ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
  </div>

  <div class="signature">
    <p>Med vänliga hälsningar,</p>
    <p>${profile.full_name}</p>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * EXECUTIVE Template - Sidebar layout for contact info
 * PREMIUM tier
 */
export const executiveTemplate: LetterTemplate = {
  id: 'executive',
  name: 'Executive',
  description: 'Professionell layout med sidebar för kontaktinfo',
  tier: 'premium',
  industries: ['Finance', 'Law', 'Consulting', 'Management'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    .container {
      display: flex;
      gap: 2rem;
    }
    .sidebar {
      flex: 0 0 180px;
      padding-right: 1.5rem;
      border-right: 2px solid #2c5282;
    }
    .sidebar p {
      margin: 0.5rem 0;
      font-size: 9pt;
      color: #4a5568;
    }
    .sidebar p:first-child {
      font-size: 12pt;
      font-weight: 600;
      color: #2c5282;
      margin-bottom: 1rem;
    }
    .main {
      flex: 1;
    }
    .recipient {
      margin-bottom: 2rem;
    }
    .recipient p {
      margin: 0.25rem 0;
      color: #2d3748;
    }
    .date {
      margin-bottom: 2rem;
      color: #718096;
      font-size: 10pt;
    }
    .greeting {
      margin-bottom: 1.5rem;
      font-weight: 500;
    }
    .body {
      margin-bottom: 2rem;
      text-align: justify;
    }
    .body p {
      margin-bottom: 1.2rem;
    }
    .signature {
      margin-top: 2.5rem;
    }
    .signature p {
      margin: 0.5rem 0;
    }
    .signature p:first-child {
      color: #718096;
    }
    .signature p:last-child {
      font-weight: 600;
      color: #2c5282;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <p>${profile.full_name}</p>
      ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
      ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
      <p>${profile.email}</p>
    </div>

    <div class="main">
      <div class="recipient">
        ${jobInfo.recipient ? `<p><strong>${jobInfo.recipient}</strong></p>` : ''}
        <p><strong>${jobInfo.company}</strong></p>
        ${jobInfo.position ? `<p>Avseende: ${jobInfo.position}</p>` : ''}
      </div>

      <div class="date">
        <p>${date}</p>
      </div>

      <div class="greeting">
        <p>${jobInfo.recipient ? `Hej ${jobInfo.recipient},` : 'Hej,'}</p>
      </div>

      <div class="body">
        ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
      </div>

      <div class="signature">
        <p>Med vänliga hälsningar,</p>
        <p>${profile.full_name}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * CREATIVE Template - Bold design for creative industries
 * PREMIUM tier
 */
export const creativeTemplate: LetterTemplate = {
  id: 'creative',
  name: 'Kreativ',
  description: 'Modern och färgstark design för kreativa branscher',
  tier: 'premium',
  industries: ['Design', 'Marknadsföring', 'Media', 'Reklam'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a202c;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    .header {
      margin-bottom: 2.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
    }
    .header p {
      margin: 0.3rem 0;
    }
    .header p:first-child {
      font-size: 16pt;
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .recipient {
      margin-bottom: 2rem;
      padding-left: 1rem;
      border-left: 3px solid #667eea;
    }
    .recipient p {
      margin: 0.25rem 0;
      color: #2d3748;
    }
    .date {
      margin-bottom: 2rem;
      color: #718096;
      font-size: 10pt;
    }
    .greeting {
      margin-bottom: 1.5rem;
      font-weight: 600;
      color: #667eea;
    }
    .body {
      margin-bottom: 2rem;
    }
    .body p {
      margin-bottom: 1.2rem;
    }
    .signature {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #e2e8f0;
    }
    .signature p:first-child {
      color: #718096;
      margin-bottom: 0.5rem;
    }
    .signature p:last-child {
      font-weight: 600;
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="header">
    <p>${profile.full_name}</p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
  </div>

  <div class="recipient">
    ${jobInfo.recipient ? `<p><strong>${jobInfo.recipient}</strong></p>` : ''}
    <p><strong>${jobInfo.company}</strong></p>
    ${jobInfo.position ? `<p>${jobInfo.position}</p>` : ''}
  </div>

  <div class="date">
    <p>${date}</p>
  </div>

  <div class="greeting">
    <p>${jobInfo.recipient ? `Hej ${jobInfo.recipient},` : 'Hej,'}</p>
  </div>

  <div class="body">
    ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
  </div>

  <div class="signature">
    <p>Med vänliga hälsningar,</p>
    <p>${profile.full_name}</p>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * TRADITIONAL Template - Conservative design for formal industries
 * PREMIUM tier
 */
export const traditionalTemplate: LetterTemplate = {
  id: 'traditional',
  name: 'Traditionell',
  description: 'Konservativ design för bank, juridik och formella branscher',
  tier: 'premium',
  industries: ['Bank', 'Juridik', 'Försäkring', 'Revision'],
  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();

    return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 3cm 2.5cm;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 3cm 2.5cm;
    }
    .header {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .header p {
      margin: 0.3rem 0;
    }
    .header p:first-child {
      font-size: 13pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .recipient {
      margin-bottom: 2.5rem;
    }
    .recipient p {
      margin: 0.3rem 0;
    }
    .date {
      margin-bottom: 2.5rem;
      text-align: right;
    }
    .greeting {
      margin-bottom: 1.5rem;
    }
    .body {
      margin-bottom: 2.5rem;
      text-align: justify;
      text-indent: 0;
    }
    .body p {
      margin-bottom: 1.3rem;
    }
    .signature {
      margin-top: 3rem;
    }
    .signature p {
      margin: 0.8rem 0;
    }
    .signature p:last-child {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <p>${profile.full_name}</p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
  </div>

  <div class="recipient">
    ${jobInfo.recipient ? `<p>${jobInfo.recipient}</p>` : ''}
    <p>${jobInfo.company}</p>
    ${jobInfo.position ? `<p>Avseende: ${jobInfo.position}</p>` : ''}
  </div>

  <div class="date">
    <p>${date}</p>
  </div>

  <div class="greeting">
    <p>${jobInfo.recipient ? `Bäste ${jobInfo.recipient},` : 'Bästa Herrskap,'}</p>
  </div>

  <div class="body">
    ${bodyContent.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
  </div>

  <div class="signature">
    <p>Med vördsam hälsning,</p>
    <p>${profile.full_name}</p>
  </div>
</body>
</html>
    `.trim();
  }
};

/**
 * Template Registry
 */
export const LETTER_TEMPLATES: Record<string, LetterTemplate> = {
  classic: classicTemplate,
  minimalist: minimalistTemplate,
  modern: modernTemplate,
  executive: executiveTemplate,
  creative: creativeTemplate,
  traditional: traditionalTemplate
};

export type TemplateId = keyof typeof LETTER_TEMPLATES;

/**
 * Get template by ID with fallback to classic
 */
export function getLetterTemplate(templateId: string): LetterTemplate {
  return LETTER_TEMPLATES[templateId] || LETTER_TEMPLATES.classic;
}

/**
 * Get templates by tier (free or premium)
 */
export function getTemplatesByTier(tier: 'free' | 'premium'): LetterTemplate[] {
  return Object.values(LETTER_TEMPLATES).filter(t => t.tier === tier);
}

/**
 * Get templates by industry
 */
export function getTemplatesByIndustry(industry: string): LetterTemplate[] {
  return Object.values(LETTER_TEMPLATES).filter(t =>
    t.industries.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
  );
}
