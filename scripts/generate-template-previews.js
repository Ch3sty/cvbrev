/**
 * Generate Template Preview HTML Files
 *
 * This script generates HTML preview files for all 6 letter templates
 * using example data from Anna Andersson.
 *
 * These HTML files can be:
 * 1. Opened in a browser and screenshotted
 * 2. Converted to images using Puppeteer or similar tools
 * 3. Used as-is for preview purposes
 */

const fs = require('fs');
const path = require('path');

// Example profile data
const exampleProfile = {
  full_name: 'Anna Andersson',
  email: 'anna.andersson@gmail.com',
  phone: '070 000 00 00',
  location: 'Stockholm',
  include_phone_in_letters: true,
  include_location_in_letters: true
};

// Example job info
const exampleJobInfo = {
  company: 'Företag AB',
  title: 'Ansökningsbrev',
  position: 'Marknadsansvarig',
  recipient: 'Rekryteringsansvarig',
  job_title: 'Marknadsansvarig'
};

// Example letter body content
const exampleBodyContent = `Jag söker härmed tjänsten som Marknadsansvarig hos er, en roll som passar perfekt med min bakgrund och passion för strategisk marknadskommunikation.

Med fem års erfarenhet från digital marknadsföring och varumärkesutveckling har jag byggt upp en bred kompetens inom både strategisk planering och praktiskt genomförande. På mitt nuvarande uppdrag hos en snabbväxande tech-startup har jag framgångsrikt lett lanseringen av tre nya produkter, vilket resulterade i en 200% ökning av varumärkeskännedom och 45% tillväxt i kundbasen.

Min styrka ligger i att kombinera kreativ problemlösning med datadriven analys. Jag är van att leda tvärfunktionella team och har erfarenhet av att arbeta med både traditionella och digitala marknadsföringskanaler. Jag tror starkt på vikten av att förstå kundens behov och bygga långsiktiga relationer.

Jag ser fram emot möjligheten att bidra till ert företags fortsatta tillväxt och utveckling.`;

// Swedish date
const exampleDate = '19 november 2025';

// Helper function to format Swedish date
function formatSwedishDate(date = new Date()) {
  const months = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Template generators (simplified versions matching the actual templates)

function generateClassicHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klassisk Mall - Preview</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2.54cm;
      background: white;
    }
    .header { margin-bottom: 2rem; }
    .header p { margin: 0.25rem 0; font-weight: bold; }
    .recipient { margin-bottom: 2rem; }
    .recipient p { margin: 0.25rem 0; }
    .date { margin-bottom: 2rem; }
    .greeting { margin-bottom: 1.5rem; }
    .body { margin-bottom: 2rem; white-space: pre-wrap; text-align: justify; }
    .signature { margin-top: 2rem; }
    .signature p { margin: 0.5rem 0; }
  </style>
</head>
<body>
  <div class="header">
    <p>${exampleProfile.full_name}</p>
    <p>${exampleProfile.location}</p>
    <p>${exampleProfile.phone}</p>
    <p>${exampleProfile.email}</p>
  </div>

  <div class="recipient">
    <p>${exampleJobInfo.company}</p>
    <p>Avseende: ${exampleJobInfo.position}</p>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="greeting">Hej ${exampleJobInfo.recipient},</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p>Med vänliga hälsningar,</p>
    <p>${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

function generateMinimalistHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimalistisk Mall - Preview</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2.54cm;
      background: white;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .name { font-size: 16pt; font-weight: bold; margin-bottom: 0.5rem; }
    .contact { display: flex; gap: 1rem; font-size: 10pt; color: #333; }
    .recipient { margin-bottom: 1.5rem; font-size: 10pt; }
    .date { margin-bottom: 1.5rem; font-size: 10pt; color: #666; }
    .subject {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .body { margin-bottom: 2rem; white-space: pre-wrap; }
    .signature { margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${exampleProfile.full_name}</div>
    <div class="contact">
      <span>${exampleProfile.phone}</span>
      <span>${exampleProfile.email}</span>
      <span>${exampleProfile.location}</span>
    </div>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="recipient">
    <div>${exampleJobInfo.company}</div>
  </div>

  <div class="subject">Ansökan - ${exampleJobInfo.position}</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p>Med vänlig hälsning,</p>
    <p>${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

function generateModernHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modern Mall - Preview</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #2c3e50;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      margin: -2cm -2cm 2rem -2cm;
    }
    .name { font-size: 20pt; font-weight: bold; margin-bottom: 0.5rem; }
    .contact { font-size: 10pt; opacity: 0.95; }
    .date { margin-bottom: 1rem; color: #7f8c8d; font-size: 10pt; }
    .recipient { margin-bottom: 1.5rem; }
    .subject {
      font-weight: bold;
      font-size: 13pt;
      color: #667eea;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }
    .body { margin-bottom: 2rem; white-space: pre-wrap; }
    .signature { margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${exampleProfile.full_name}</div>
    <div class="contact">
      ${exampleProfile.phone} • ${exampleProfile.email} • ${exampleProfile.location}
    </div>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="recipient">
    <div style="font-weight: 600;">${exampleJobInfo.company}</div>
    <div>Att: ${exampleJobInfo.recipient}</div>
  </div>

  <div class="subject">Ansökan om tjänst som ${exampleJobInfo.position}</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p style="margin: 0;">Med vänlig hälsning,</p>
    <p style="margin: 0.5rem 0 0 0; font-weight: 600;">${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

function generateExecutiveHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exekutiv Mall - Preview</title>
  <style>
    @page { size: A4; margin: 3cm; }
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      max-width: 21cm;
      margin: 0 auto;
      padding: 3cm;
      background: white;
    }
    .header {
      text-align: center;
      border-top: 3px solid #2c3e50;
      border-bottom: 1px solid #2c3e50;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }
    .name {
      font-size: 18pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .contact { font-size: 10pt; color: #555; }
    .date { text-align: right; margin-bottom: 2rem; color: #666; }
    .recipient { margin-bottom: 2rem; }
    .subject {
      text-align: center;
      font-weight: bold;
      font-size: 12pt;
      margin: 2rem 0;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .body { margin-bottom: 2rem; white-space: pre-wrap; text-align: justify; }
    .signature { margin-top: 3rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${exampleProfile.full_name}</div>
    <div class="contact">
      ${exampleProfile.location} • ${exampleProfile.phone} • ${exampleProfile.email}
    </div>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="recipient">
    <div>${exampleJobInfo.company}</div>
    <div>Att: ${exampleJobInfo.recipient}</div>
  </div>

  <div class="subject">Ansökan - ${exampleJobInfo.position}</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p style="margin: 0;">Med utmärkta hälsningar,</p>
    <p style="margin: 1.5rem 0 0 0; font-weight: bold;">${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

function generateCreativeHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kreativ Mall - Preview</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #2d3748;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      background: white;
    }
    .header {
      position: relative;
      padding-left: 1rem;
      margin-bottom: 2rem;
    }
    .header::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #f6ad55 0%, #fc8181 50%, #9f7aea 100%);
    }
    .name {
      font-size: 22pt;
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }
    .contact {
      font-size: 10pt;
      color: #718096;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .date { margin-bottom: 1.5rem; color: #718096; font-size: 10pt; }
    .recipient { margin-bottom: 1.5rem; }
    .subject {
      background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: bold;
      font-size: 14pt;
      margin-bottom: 1.5rem;
    }
    .body { margin-bottom: 2rem; white-space: pre-wrap; }
    .signature { margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${exampleProfile.full_name}</div>
    <div class="contact">
      <span>${exampleProfile.phone}</span>
      <span>${exampleProfile.email}</span>
      <span>${exampleProfile.location}</span>
    </div>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="recipient">
    <div style="font-weight: 600;">${exampleJobInfo.company}</div>
    <div>Att: ${exampleJobInfo.recipient}</div>
  </div>

  <div class="subject">Ansökan som ${exampleJobInfo.position}</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p style="margin: 0;">Med entusiasm och passion,</p>
    <p style="margin: 0.5rem 0 0 0; font-weight: 600;">${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

function generateTraditionalHTML() {
  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Traditionell Mall - Preview</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2.5cm;
      background: white;
    }
    .header {
      border-bottom: 2px double #000;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .name {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .contact { font-size: 11pt; line-height: 1.4; }
    .date { margin-bottom: 1.5rem; font-style: italic; }
    .recipient { margin-bottom: 2rem; }
    .greeting { margin-bottom: 1.5rem; font-weight: 600; }
    .body { margin-bottom: 2rem; white-space: pre-wrap; text-align: justify; }
    .signature { margin-top: 2.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${exampleProfile.full_name}</div>
    <div class="contact">
      <div>${exampleProfile.location}</div>
      <div>${exampleProfile.phone}</div>
      <div>${exampleProfile.email}</div>
    </div>
  </div>

  <div class="date">${exampleDate}</div>

  <div class="recipient">
    <div>${exampleJobInfo.company}</div>
    <div>Att: ${exampleJobInfo.recipient}</div>
    <div>Angående: ${exampleJobInfo.position}</div>
  </div>

  <div class="greeting">Bästa ${exampleJobInfo.recipient},</div>

  <div class="body">${exampleBodyContent}</div>

  <div class="signature">
    <p style="margin: 0;">Högaktningsfullt,</p>
    <p style="margin: 2rem 0 0 0;">${exampleProfile.full_name}</p>
  </div>
</body>
</html>`;
}

// Generate all templates
const templates = {
  'classic': generateClassicHTML(),
  'minimalist': generateMinimalistHTML(),
  'modern': generateModernHTML(),
  'executive': generateExecutiveHTML(),
  'creative': generateCreativeHTML(),
  'traditional': generateTraditionalHTML()
};

// Create output directory
const outputDir = path.join(__dirname, '..', 'public', 'images', 'templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write HTML files
Object.entries(templates).forEach(([name, html]) => {
  const filePath = path.join(outputDir, `${name}-preview.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Created: ${name}-preview.html`);
});

console.log('\n✅ All template preview HTML files generated!');
console.log(`📁 Location: ${outputDir}`);
console.log('\n📝 Next steps:');
console.log('1. Open each HTML file in a browser');
console.log('2. Take a screenshot (recommended size: 800x1131px for A4 aspect ratio)');
console.log('3. Save as {template-name}-preview.jpg in the same directory');
console.log('4. Or use a tool like Puppeteer to automate screenshot generation');
