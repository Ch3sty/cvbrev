// src/lib/cv/cv-templates.ts
// Professionella CV-mallar för svenska jobbsökande

import { CVMetadata, CVTemplate, CVGenerationOptions, formatDateRange } from './cv-metadata';

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
  name: 'Modern',
  description: 'Ren och minimalistisk design perfekt för tech och startup-miljöer',
  category: 'Contemporary',
  bestFor: ['Tech', 'Startup', 'Design', 'Digital marknadsföring'],
  features: ['Minimalistisk', 'Modern typografi', 'Visuell hierarki', 'Skandinavisk design'],
  colorSchemes: ['blue', 'black', 'purple'],
  previewImage: '/images/cv-templates/modern-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const primaryColor = options.colorScheme === 'blue' ? '#3b82f6' : 
                        options.colorScheme === 'purple' ? '#8b5cf6' : '#1f2937';
    
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
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.5;
            color: #2d3748;
          }
          
          .cv-container {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2cm;
            min-height: 100vh;
          }
          
          .sidebar {
            background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05);
            padding: 1.5cm 1cm;
            border-radius: 8px;
          }
          
          .main-content {
            padding: 0.5cm 0;
          }
          
          .name {
            font-size: 28pt;
            font-weight: 300;
            color: ${primaryColor};
            margin-bottom: 0.5cm;
            line-height: 1.2;
          }
          
          .title {
            font-size: 14pt;
            color: #4a5568;
            margin-bottom: 1cm;
            font-weight: 400;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.4cm;
            font-size: 9pt;
            color: #4a5568;
          }
          
          .section {
            margin-bottom: 1.5cm;
          }
          
          .section-title {
            font-size: 13pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 0.8cm;
            position: relative;
            padding-left: 0.3cm;
          }
          
          .section-title:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: ${primaryColor};
          }
          
          .experience-item {
            margin-bottom: 1.2cm;
            position: relative;
            padding-left: 0.5cm;
          }
          
          .job-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.3cm;
          }
          
          .job-title {
            font-size: 11pt;
            font-weight: 600;
            color: #2d3748;
          }
          
          .job-date {
            font-size: 9pt;
            color: ${primaryColor};
            font-weight: 500;
          }
          
          .company {
            font-size: 10pt;
            color: ${primaryColor};
            font-weight: 500;
            margin-bottom: 0.4cm;
          }
          
          .description ul {
            list-style: none;
            margin-left: 0;
          }
          
          .description li {
            margin-bottom: 0.3cm;
            position: relative;
            padding-left: 1cm;
          }
          
          .description li:before {
            content: '▪';
            color: ${primaryColor};
            position: absolute;
            left: 0;
          }
          
          .skill-item {
            margin-bottom: 0.6cm;
          }
          
          .skill-category-title {
            font-size: 10pt;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.3cm;
          }
          
          .skills-list {
            font-size: 9pt;
            color: #4a5568;
            line-height: 1.6;
          }
          
          .education-item {
            margin-bottom: 0.8cm;
          }
          
          .degree {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.2cm;
          }
          
          .institution {
            color: ${primaryColor};
            font-size: 9pt;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Sidebar -->
          <aside class="sidebar">
            <header>
              <h1 class="name">${cvData.personalInfo.fullName}</h1>
              ${cvData.targetRole ? `<div class="title">${cvData.targetRole}</div>` : ''}
            </header>

            <!-- Contact -->
            <section class="section">
              <h2 class="section-title">Kontakt</h2>
              <div class="contact-item">${cvData.personalInfo.email}</div>
              ${cvData.personalInfo.phone ? `<div class="contact-item">${cvData.personalInfo.phone}</div>` : ''}
              ${cvData.personalInfo.address ? `<div class="contact-item">${cvData.personalInfo.address}</div>` : ''}
              ${cvData.personalInfo.linkedIn ? `<div class="contact-item">${cvData.personalInfo.linkedIn}</div>` : ''}
            </section>

            <!-- Skills -->
            ${cvData.skills && cvData.skills.length > 0 ? `
            <section class="section">
              <h2 class="section-title">Kompetenser</h2>
              ${cvData.skills.map(skillCategory => `
              <div class="skill-item">
                <div class="skill-category-title">${skillCategory.category}</div>
                <div class="skills-list">${skillCategory.skills.join(' • ')}</div>
              </div>
              `).join('')}
            </section>
            ` : ''}

            <!-- Languages -->
            ${cvData.languages && cvData.languages.length > 0 ? `
            <section class="section">
              <h2 class="section-title">Språk</h2>
              <div class="skills-list">
                ${cvData.languages.map(lang => `<div>${lang.language} - ${lang.proficiency}</div>`).join('')}
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
              </div>
              `).join('')}
            </section>
          </aside>

          <!-- Main Content -->
          <main class="main-content">
            <!-- Summary -->
            ${cvData.summary ? `
            <section class="section">
              <h2 class="section-title">Profil</h2>
              <p>${cvData.summary}</p>
            </section>
            ` : ''}

            <!-- Experience -->
            <section class="section">
              <h2 class="section-title">Arbetslivserfarenhet</h2>
              ${cvData.experience.map(exp => `
              <div class="experience-item">
                <div class="job-header">
                  <div>
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                  </div>
                  <div class="job-date">${formatDateRange(exp.startDate, exp.endDate)}</div>
                </div>
                <div class="description">
                  <ul>
                    ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                  </ul>
                </div>
              </div>
              `).join('')}
            </section>
          </main>
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
  description: 'Visuellt kreativ mall för designyrken och kreativa branscher',
  category: 'Creative',
  bestFor: ['Grafisk design', 'Reklam', 'Media', 'Fotografering', 'Konstnärliga yrken'],
  features: ['Kreativ layout', 'Visuell fokus', 'Färgrik design', 'Modern stil'],
  colorSchemes: ['purple', 'red', 'green'],
  previewImage: '/images/cv-templates/kreativ-preview.png',
  generateHTML: (cvData: CVMetadata, options: CVGenerationOptions) => {
    const primaryColor = options.colorScheme === 'purple' ? '#8b5cf6' : 
                        options.colorScheme === 'red' ? '#ef4444' : '#10b981';
    const lightColor = options.colorScheme === 'purple' ? '#f3e8ff' : 
                       options.colorScheme === 'red' ? '#fef2f2' : '#ecfdf5';
    
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
            margin: 1cm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Apple SD Gothic Neo', sans-serif;
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
          
          .header {
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
            color: white;
            padding: 2cm 1.5cm 1.5cm;
            position: relative;
            margin-bottom: 1.5cm;
          }
          
          .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: linear-gradient(135deg, ${primaryColor}20, transparent);
            clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
          }
          
          .name {
            font-size: 32pt;
            font-weight: 300;
            margin-bottom: 0.5cm;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .tagline {
            font-size: 14pt;
            font-weight: 400;
            opacity: 0.9;
            font-style: italic;
          }
          
          .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2cm;
            padding: 0 1.5cm;
          }
          
          .main-content .section {
            margin-bottom: 1.5cm;
          }
          
          .sidebar {
            background: ${lightColor};
            padding: 1.5cm 1cm;
            border-radius: 15px;
            height: fit-content;
          }
          
          .section-title {
            font-size: 14pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 0.8cm;
            position: relative;
            padding-bottom: 0.3cm;
          }
          
          .section-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, ${primaryColor}, ${primaryColor}60);
            border-radius: 2px;
          }
          
          .experience-item {
            margin-bottom: 1.2cm;
            padding: 1cm;
            background: white;
            border-left: 4px solid ${primaryColor};
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border-radius: 0 8px 8px 0;
          }
          
          .job-title {
            font-size: 12pt;
            font-weight: 700;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
          }
          
          .company {
            font-size: 11pt;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.3cm;
          }
          
          .job-date {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
            margin-bottom: 0.5cm;
          }
          
          .description ul {
            list-style: none;
          }
          
          .description li {
            margin-bottom: 0.3cm;
            position: relative;
            padding-left: 1.2cm;
          }
          
          .description li::before {
            content: '●';
            color: ${primaryColor};
            font-size: 14pt;
            position: absolute;
            left: 0;
            top: -0.1cm;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.6cm;
            font-size: 9pt;
          }
          
          .contact-icon {
            width: 20px;
            height: 20px;
            background: ${primaryColor};
            border-radius: 50%;
            margin-right: 0.5cm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .skill-item {
            margin-bottom: 0.8cm;
          }
          
          .skill-category-title {
            font-size: 10pt;
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 0.3cm;
          }
          
          .skills-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3cm;
          }
          
          .skill-tag {
            background: ${primaryColor}15;
            color: ${primaryColor};
            padding: 0.2cm 0.4cm;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 500;
          }
          
          .education-item {
            margin-bottom: 0.8cm;
            padding: 0.8cm;
            background: ${primaryColor}08;
            border-radius: 8px;
          }
          
          .degree {
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 0.2cm;
          }
          
          .institution {
            color: #4b5563;
            font-size: 9pt;
          }
        </style>
      </head>
      <body>
        <div class="cv-container">
          <!-- Header -->
          <header class="header">
            <h1 class="name">${cvData.personalInfo.fullName}</h1>
            <div class="tagline">${cvData.targetRole || 'Kreativ Professionell'}</div>
          </header>

          <div class="content-grid">
            <!-- Main Content -->
            <main class="main-content">
              <!-- Summary -->
              ${cvData.summary ? `
              <section class="section">
                <h2 class="section-title">Kreativ Profil</h2>
                <p style="font-size: 11pt; line-height: 1.6;">${cvData.summary}</p>
              </section>
              ` : ''}

              <!-- Experience -->
              <section class="section">
                <h2 class="section-title">Kreativ Erfarenhet</h2>
                ${cvData.experience.map(exp => `
                <div class="experience-item">
                  <div class="job-title">${exp.position}</div>
                  <div class="company">${exp.company}</div>
                  <div class="job-date">${formatDateRange(exp.startDate, exp.endDate)}</div>
                  <div class="description">
                    <ul>
                      ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>
                  </div>
                </div>
                `).join('')}
              </section>
            </main>

            <!-- Sidebar -->
            <aside class="sidebar">
              <!-- Contact -->
              <section class="section">
                <h2 class="section-title">Kontakt</h2>
                <div class="contact-item">
                  <div class="contact-icon">@</div>
                  <span>${cvData.personalInfo.email}</span>
                </div>
                ${cvData.personalInfo.phone ? `
                <div class="contact-item">
                  <div class="contact-icon">☎</div>
                  <span>${cvData.personalInfo.phone}</span>
                </div>
                ` : ''}
                ${cvData.personalInfo.linkedIn ? `
                <div class="contact-item">
                  <div class="contact-icon">in</div>
                  <span>${cvData.personalInfo.linkedIn}</span>
                </div>
                ` : ''}
              </section>

              <!-- Skills -->
              ${cvData.skills && cvData.skills.length > 0 ? `
              <section class="section">
                <h2 class="section-title">Kreativa Färdigheter</h2>
                ${cvData.skills.map(skillCategory => `
                <div class="skill-item">
                  <div class="skill-category-title">${skillCategory.category}</div>
                  <div class="skills-tags">
                    ${skillCategory.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                  </div>
                </div>
                `).join('')}
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
                </div>
                `).join('')}
              </section>

              <!-- Languages -->
              ${cvData.languages && cvData.languages.length > 0 ? `
              <section class="section">
                <h2 class="section-title">Språk</h2>
                <div class="skills-tags">
                  ${cvData.languages.map(lang => `<span class="skill-tag">${lang.language}</span>`).join('')}
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