// src/lib/pdf/letter-templates.ts
// Professionella brevmallar för svenska personliga brev

import { cleanLetterContent } from './clean-letter-content';

export interface LetterMetadata {
  title: string;
  company: string;
  position?: string;
  author: string;
  email: string;
  phone?: string;
  address?: string;
  date?: string;
  recipientAddress?: string;
}

export interface LetterTemplate {
  name: string;
  description: string;
  generateHTML: (content: string, metadata: LetterMetadata) => string;
}

// Klassisk formell brevmall - svensk standard
export const formalLetterTemplate: LetterTemplate = {
  name: 'Formell',
  description: 'Klassisk formell brevmall enligt svenska standarder',
  generateHTML: (content: string, metadata: LetterMetadata) => {
    const cleanedContent = cleanLetterContent(content, metadata);
    const currentDate = metadata.date || new Date().toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${metadata.title}</title>
        <style>
          @page {
            size: A4;
            margin: 2.5cm 2cm 2cm 2cm;
          }
          
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
          }
          
          .letter-header {
            margin-bottom: 2cm;
          }
          
          .sender-info {
            font-size: 10pt;
            line-height: 1.3;
            margin-bottom: 1.5cm;
          }
          
          .recipient-info {
            margin-bottom: 1.5cm;
            font-weight: normal;
          }
          
          .date-line {
            text-align: right;
            margin-bottom: 2cm;
            font-size: 11pt;
          }
          
          .subject-line {
            font-weight: bold;
            margin-bottom: 1.5cm;
            text-decoration: underline;
          }
          
          .letter-content {
            text-align: left;
            margin-bottom: 2cm;
          }
          
          .letter-content p {
            margin-bottom: 1em;
            text-indent: 0;
          }
          
          .letter-content p:first-child {
            margin-top: 0;
          }
          
          .closing {
            margin-top: 1.5cm;
          }
          
          .signature-area {
            margin-top: 3cm;
            border-bottom: 1px solid #000;
            width: 200px;
            padding-bottom: 2px;
          }
          
          .signature-name {
            margin-top: 5px;
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
        <div class="letter-header">
          <div class="sender-info">
            <strong>${metadata.author}</strong><br>
            ${metadata.email}<br>
            ${metadata.phone ? metadata.phone + '<br>' : ''}
            ${metadata.address ? metadata.address : ''}
          </div>
          
          ${metadata.company ? `
            <div class="recipient-info">
              ${metadata.company}
            </div>
          ` : ''}
          
          <div class="date-line">
            ${currentDate}
          </div>
          
          ${metadata.position ? `
            <div class="subject-line">
              Ansökan: ${metadata.position}
            </div>
          ` : ''}
        </div>
        
        <div class="letter-content">
          ${cleanedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
        </div>
        
        <div class="closing">
          <p>Med vänliga hälsningar,</p>
          
          <div class="signature-area"></div>
          <div class="signature-name">${metadata.author}</div>
        </div>
      </body>
      </html>
    `;
  }
};

// Modern brevmall med ren design
export const modernLetterTemplate: LetterTemplate = {
  name: 'Modern',
  description: 'Modern och ren brevmall med elegant typografi',
  generateHTML: (content: string, metadata: LetterMetadata) => {
    const cleanedContent = cleanLetterContent(content, metadata);
    const currentDate = metadata.date || new Date().toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${metadata.title}</title>
        <style>
          @page {
            size: A4;
            margin: 3cm 2.5cm 2.5cm 2.5cm;
          }
          
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.15;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .letter-header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 1cm;
            margin-bottom: 2cm;
          }
          
          .sender-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1cm;
          }
          
          .sender-details h1 {
            color: #2563eb;
            font-size: 16pt;
            font-weight: 600;
            margin: 0 0 10px 0;
          }
          
          .sender-contact {
            font-size: 10pt;
            color: #666;
            line-height: 1.4;
          }
          
          .date-info {
            text-align: right;
            font-size: 10pt;
            color: #666;
          }
          
          .recipient-section {
            margin-bottom: 1.5cm;
          }
          
          .recipient-section h2 {
            font-size: 12pt;
            font-weight: 600;
            color: #333;
            margin: 0 0 5px 0;
          }
          
          .subject-line {
            background-color: #f8fafc;
            padding: 10px 15px;
            border-left: 4px solid #2563eb;
            font-weight: 600;
            margin-bottom: 2cm;
            font-size: 11pt;
          }
          
          .letter-content {
            text-align: left;
            margin-bottom: 2cm;
          }
          
          .letter-content p {
            margin-bottom: 1.2em;
          }
          
          .letter-content p:first-child {
            margin-top: 0;
          }
          
          .closing {
            margin-top: 2cm;
          }
          
          .signature-section {
            margin-top: 2.5cm;
          }
          
          .signature-area {
            border-bottom: 1px solid #ccc;
            width: 200px;
            padding-bottom: 3px;
            margin-bottom: 8px;
          }
          
          .signature-name {
            font-weight: 600;
            color: #2563eb;
          }
        </style>
      </head>
      <body>
        <div class="letter-header">
          <div class="sender-info">
            <div class="sender-details">
              <h1>${metadata.author}</h1>
              <div class="sender-contact">
                ${metadata.email}<br>
                ${metadata.phone ? metadata.phone + '<br>' : ''}
                ${metadata.address ? metadata.address : ''}
              </div>
            </div>
            <div class="date-info">
              ${currentDate}
            </div>
          </div>
        </div>
        
        ${metadata.company ? `
          <div class="recipient-section">
            <h2>${metadata.company}</h2>
          </div>
        ` : ''}
        
        ${metadata.position ? `
          <div class="subject-line">
            Ansökan om tjänsten som ${metadata.position}
          </div>
        ` : ''}
        
        <div class="letter-content">
          ${cleanedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
        </div>
        
        <div class="closing">
          <p>Med vänliga hälsningar,</p>
          
          <div class="signature-section">
            <div class="signature-area"></div>
            <div class="signature-name">${metadata.author}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Semi-formell brevmall - balans mellan formell och modern
export const semiFormalLetterTemplate: LetterTemplate = {
  name: 'Semi-formell',
  description: 'Balanserad brevmall mellan formell och modern stil',
  generateHTML: (content: string, metadata: LetterMetadata) => {
    const cleanedContent = cleanLetterContent(content, metadata);
    const currentDate = metadata.date || new Date().toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${metadata.title}</title>
        <style>
          @page {
            size: A4;
            margin: 2.5cm 2.5cm 2cm 2.5cm;
          }
          
          body {
            font-family: 'Georgia', 'Calibri', serif;
            font-size: 11.5pt;
            line-height: 1.2;
            color: #2c2c2c;
            margin: 0;
            padding: 0;
          }
          
          .letter-header {
            margin-bottom: 2cm;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 1cm;
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1cm;
          }
          
          .sender-info h1 {
            font-size: 14pt;
            font-weight: normal;
            color: #1a365d;
            margin: 0 0 8px 0;
          }
          
          .sender-contact {
            font-size: 10pt;
            color: #5a5a5a;
            line-height: 1.3;
          }
          
          .date-line {
            font-size: 10pt;
            color: #5a5a5a;
            font-style: italic;
          }
          
          .recipient-info {
            margin-bottom: 1cm;
            font-weight: 500;
          }
          
          .subject-line {
            font-weight: 600;
            color: #1a365d;
            margin-bottom: 2cm;
            padding: 8px 0;
            border-top: 1px solid #e5e5e5;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .letter-content {
            text-align: left;
            margin-bottom: 2cm;
          }
          
          .letter-content p {
            margin-bottom: 1.1em;
            text-indent: 0;
          }
          
          .letter-content p:first-child {
            margin-top: 0;
          }
          
          .closing {
            margin-top: 1.5cm;
            font-style: italic;
          }
          
          .signature-area {
            margin-top: 2.5cm;
            border-bottom: 1px solid #666;
            width: 180px;
            padding-bottom: 2px;
          }
          
          .signature-name {
            margin-top: 8px;
            font-weight: 500;
            color: #1a365d;
          }
        </style>
      </head>
      <body>
        <div class="letter-header">
          <div class="header-top">
            <div class="sender-info">
              <h1>${metadata.author}</h1>
              <div class="sender-contact">
                ${metadata.email}<br>
                ${metadata.phone ? metadata.phone + '<br>' : ''}
                ${metadata.address ? metadata.address : ''}
              </div>
            </div>
            <div class="date-line">
              ${currentDate}
            </div>
          </div>
          
          ${metadata.company ? `
            <div class="recipient-info">
              ${metadata.company}
            </div>
          ` : ''}
        </div>
        
        ${metadata.position ? `
          <div class="subject-line">
            Angående: Ansökan om tjänsten som ${metadata.position}
          </div>
        ` : ''}
        
        <div class="letter-content">
          ${cleanedContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}
        </div>
        
        <div class="closing">
          <p>Med vänliga hälsningar,</p>
          
          <div class="signature-area"></div>
          <div class="signature-name">${metadata.author}</div>
        </div>
      </body>
      </html>
    `;
  }
};

// Exportera alla mallar
export const letterTemplates = {
  formal: formalLetterTemplate,
  modern: modernLetterTemplate,
  'semi-formal': semiFormalLetterTemplate
} as const;

export type TemplateType = keyof typeof letterTemplates;

export function getLetterTemplate(templateType: TemplateType = 'formal'): LetterTemplate {
  return letterTemplates[templateType];
}