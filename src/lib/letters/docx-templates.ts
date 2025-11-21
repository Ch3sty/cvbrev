/**
 * DOCX Letter Templates - Native document structures for Word export
 *
 * Dessa templates genererar strukturer med docx-biblioteket som fungerar
 * perfekt i Microsoft Word och andra ordbehandlare.
 *
 * Varje template använder:
 * - Borders för visuell separation
 * - Tables för kolumn-layout
 * - Spacing för luftighet
 * - Typography för hierarki
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ShadingType
} from 'docx';
import { ProfileDataForLetter, JobInfo } from './template-merger';

export type DocxTemplateId = 'classic' | 'sidebar' | 'minimal' | 'centered';

export interface DocxTemplate {
  id: DocxTemplateId;
  name: string;
  description: string;
  tier: 'free' | 'premium';
  industries: string[];  // Recommended industries
  generateDocument: (
    profile: ProfileDataForLetter,
    jobInfo: JobInfo,
    bodyContent: string,
    date?: string
  ) => Document;
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
 * Dela upp body content i paragrafer
 */
function splitIntoParagraphs(content: string): string[] {
  // Ta bort HTML-taggar om de finns
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  return cleanContent
    .split('\n')
    .filter(para => para.trim().length > 0);
}

/**
 * CLASSIC Template - Traditionell svensk standard
 * Layout: Header högst upp, datum, mottagare, body, signatur
 */
export const classicDocxTemplate: DocxTemplate = {
  id: 'classic',
  name: 'Klassisk',
  description: 'Traditionell svensk brevmall',
  tier: 'free',
  industries: ['Alla branscher', 'Traditionella företag', 'Offentlig sektor'],

  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${jobInfo.title || 'Ansökningsbrev'}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 2cm 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      max-width: 100%;
      width: 100%;
      margin: 0;
      padding: 0.75rem;
    }

    @media print {
      body {
        max-width: 21cm;
        padding: 1.5cm 1cm;
      }
    }

    .header-info {
      margin-bottom: 2rem;
    }

    .header-info p {
      margin-bottom: 0.5rem;
      font-size: 11pt;
    }

    .header-info .name {
      font-weight: bold;
      font-size: 12pt;
    }

    .date {
      margin: 2rem 0;
      font-size: 11pt;
    }

    .recipient {
      margin-bottom: 2rem;
    }

    .recipient .company {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .recipient .position {
      font-weight: bold;
    }

    .greeting {
      margin-bottom: 1.5rem;
    }

    .body-content p {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .closing {
      margin-top: 2.5rem;
      margin-bottom: 3rem;
      font-size: 10pt;
    }

    .signature {
      font-weight: bold;
      font-size: 11pt;
    }
  </style>
</head>
<body>
  <div class="header-info">
    <p class="name">${profile.full_name}</p>
    ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
    <p>${profile.email}</p>
    ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
  </div>

  <div class="date">${date}</div>

  <div class="recipient">
    ${jobInfo.company ? `<p class="company">${jobInfo.company}</p>` : ''}
    ${jobInfo.position ? `<p class="position">Ansökan: ${jobInfo.position}</p>` : ''}
  </div>

  <div class="greeting">
    <p>Hej,</p>
  </div>

  <div class="body-content">
    ${paragraphs.map(p => `<p>${p}</p>`).join('\n    ')}
  </div>

  <div class="closing">
    <p>Med vänliga hälsningar,</p>
  </div>

  <div class="signature">
    <p>${profile.full_name}</p>
  </div>
</body>
</html>`;
  },

  generateDocument: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 2.5cm
              right: 1152, // 2cm
              bottom: 1152,
              left: 1152
            }
          }
        },
        children: [
          // Header - Avsändare
          new Paragraph({
            children: [
              new TextRun({
                text: profile.full_name,
                bold: true,
                size: 24
              })
            ],
            spacing: { after: 120 },
            indent: { firstLine: 0 }
          }),

          ...(profile.include_phone_in_letters && profile.phone ? [
            new Paragraph({
              children: [new TextRun({ text: profile.phone, size: 22 })],
              spacing: { after: 120 },
              indent: { firstLine: 0 }
            })
          ] : []),

          new Paragraph({
            children: [new TextRun({ text: profile.email, size: 22 })],
            spacing: { after: 120 },
            indent: { firstLine: 0 }
          }),

          ...(profile.include_location_in_letters && profile.location ? [
            new Paragraph({
              children: [new TextRun({ text: profile.location, size: 22 })],
              spacing: { after: 400 },
              indent: { firstLine: 0 }
            })
          ] : []),

          ...(!profile.include_location_in_letters || !profile.location ? [
            new Paragraph({
              text: '',
              spacing: { after: 280 }
            })
          ] : []),

          // Datum
          new Paragraph({
            children: [new TextRun({ text: date, size: 22 })],
            spacing: { after: 400 },
            indent: { firstLine: 0 }
          }),

          // Mottagare
          ...(jobInfo.company ? [
            new Paragraph({
              children: [new TextRun({ text: jobInfo.company, bold: true, size: 22 })],
              spacing: { after: 120 },
              indent: { firstLine: 0 }
            })
          ] : []),

          ...(jobInfo.position ? [
            new Paragraph({
              children: [new TextRun({ text: `Ansökan: ${jobInfo.position}`, bold: true, size: 22 })],
              spacing: { after: 480 },
              indent: { firstLine: 0 }
            })
          ] : []),

          // Hälsning
          new Paragraph({
            children: [new TextRun({ text: 'Hej,', size: 24 })],
            spacing: { after: 240 },
            indent: { firstLine: 0 }
          }),

          // Body paragraphs
          ...paragraphs.map(para =>
            new Paragraph({
              children: [new TextRun({ text: para.trim(), size: 24 })],
              alignment: AlignmentType.LEFT,
              spacing: { after: 240, line: 360, lineRule: 'auto' },
              indent: { left: 0, right: 0, firstLine: 0 }
            })
          ),

          // Avslutning
          new Paragraph({
            children: [new TextRun({ text: 'Med vänliga hälsningar,', size: 24 })],
            spacing: { before: 480, after: 600 },
            indent: { firstLine: 0 }
          }),

          new Paragraph({
            children: [new TextRun({ text: profile.full_name, bold: true, size: 24 })],
            indent: { firstLine: 0 }
          })
        ]
      }]
    });
  }
};

/**
 * SIDEBAR Template - Vertikal linje som separator (liknande Therese Karlsson)
 * Layout: Kontaktinfo i vänster kolumn med border, content till höger
 */
export const sidebarDocxTemplate: DocxTemplate = {
  id: 'sidebar',
  name: 'Sidofält',
  description: 'Vertikal linje som skiljer kontaktinfo från innehåll',
  tier: 'free',
  industries: ['Kreativa yrken', 'Design', 'Marknadsföring'],

  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${jobInfo.title || 'Ansökningsbrev'}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 0.5cm 2cm 0.5cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      max-width: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    @media print {
      body {
        max-width: 21cm;
        padding: 0;
      }
    }

    .container {
      display: flex;
      gap: 0;
      position: relative;
      width: 100%;
      padding: 0;
    }

    .sidebar {
      width: 23%;
      flex-shrink: 0;
      flex-grow: 0;
      border-right: 2px solid #666666;
      padding-right: 2rem;
      margin-right: 2rem;
    }

    .sidebar p {
      margin-bottom: 0.75rem;
      font-size: 10pt;
      word-break: break-all;
      overflow-wrap: break-word;
      hyphens: none;
    }

    .sidebar .name {
      font-weight: bold;
      font-size: 11pt;
    }

    .content {
      flex: 1;
      padding-left: 0;
    }

    .date {
      margin-bottom: 2rem;
      font-size: 10pt;
    }

    .recipient {
      margin-bottom: 2rem;
    }

    .recipient .company {
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-size: 11pt;
    }

    .recipient .position {
      font-weight: bold;
      font-size: 11pt;
    }

    .greeting {
      margin-bottom: 1.5rem;
      font-size: 10pt;
    }

    .body-content p {
      margin-bottom: 1.5rem;
      text-align: left;
      font-size: 10pt;
    }

    .closing {
      margin-top: 2.5rem;
      margin-bottom: 3rem;
      font-size: 10pt;
    }

    .signature {
      font-weight: bold;
      font-size: 11pt;
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      .sidebar {
        border-right: none;
        border-bottom: 2px solid #666666;
        padding-right: 0;
        padding-bottom: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .content {
        padding-left: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <p class="name">${profile.full_name}</p>
      ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
      <p>${profile.email}</p>
      ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    </div>

    <div class="content">
      <div class="date">${date}</div>

      <div class="recipient">
        ${jobInfo.company ? `<p class="company">${jobInfo.company}</p>` : ''}
        ${jobInfo.position ? `<p class="position">Ansökan: ${jobInfo.position}</p>` : ''}
      </div>

      <div class="greeting">
        <p>Hej,</p>
      </div>

      <div class="body-content">
        ${paragraphs.map(p => `<p>${p}</p>`).join('\n        ')}
      </div>

      <div class="closing">
        <p>Med vänliga hälsningar,</p>
      </div>

      <div class="signature">
        <p>${profile.full_name}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  },

  generateDocument: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    // Kontaktinfo för sidebar - BEHÅLL tomma strängar för spacing
    const sidebarContent = [
      { text: profile.full_name, bold: true },
      ...(profile.include_phone_in_letters && profile.phone
        ? [{ text: profile.phone, bold: false }]
        : []
      ),
      { text: profile.email, bold: false },
      ...(profile.include_location_in_letters && profile.location
        ? [{ text: profile.location, bold: false }]
        : []
      )
    ];

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 288,
              bottom: 1152,
              left: 288
            }
          }
        },
        children: [
          // Table layout: sidebar + content
          new Table({
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  // Sidebar cell (23% width)
                  new TableCell({
                    width: { size: 23, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: {
                        style: BorderStyle.SINGLE,
                        size: 15,
                        color: '666666'
                      }
                    },
                    margins: {
                      right: 300
                    },
                    verticalAlign: VerticalAlign.TOP,
                    children: sidebarContent.map((item, idx) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: item.text,
                            size: item.bold ? 22 : 20,
                            bold: item.bold,
                            font: 'Arial'
                          })
                        ],
                        spacing: { after: 120 },
                        indent: { firstLine: 0 }
                      })
                    )
                  }),

                  // Content cell (80% width)
                  new TableCell({
                    width: { size: 80, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    },
                    margins: {
                      left: 0
                    },
                    children: [
                      // Datum
                      new Paragraph({
                        children: [new TextRun({ text: date, size: 20, font: 'Arial' })],
                        spacing: { after: 400 },
                        indent: { left: 400, firstLine: 0 }
                      }),

                      // Mottagare
                      ...(jobInfo.company ? [
                        new Paragraph({
                          children: [new TextRun({ text: jobInfo.company, bold: true, size: 22, font: 'Arial' })],
                          spacing: { after: 120 },
                          indent: { left: 400, firstLine: 0 }
                        })
                      ] : []),

                      ...(jobInfo.position ? [
                        new Paragraph({
                          children: [new TextRun({ text: `Ansökan: ${jobInfo.position}`, bold: true, size: 22, font: 'Arial' })],
                          spacing: { after: 480 },
                          indent: { left: 400, firstLine: 0 }
                        })
                      ] : []),

                      // Hälsning
                      new Paragraph({
                        children: [new TextRun({ text: 'Hej,', size: 20, font: 'Arial' })],
                        spacing: { after: 240 },
                        indent: { left: 400, firstLine: 0 }
                      }),

                      // Body
                      ...paragraphs.map(para =>
                        new Paragraph({
                          children: [new TextRun({ text: para.trim(), size: 20, font: 'Arial' })],
                          alignment: AlignmentType.LEFT,
                          spacing: { after: 240, line: 360, lineRule: 'auto' },
                          indent: { left: 400, right: 0, hanging: 0 }
                        })
                      ),

                      // Avslutning
                      new Paragraph({
                        children: [new TextRun({ text: 'Med vänliga hälsningar,', size: 20, font: 'Arial' })],
                        spacing: { before: 480, after: 600 },
                        indent: { left: 400, firstLine: 0 }
                      }),

                      new Paragraph({
                        children: [new TextRun({ text: profile.full_name, bold: true, size: 20, font: 'Arial' })],
                        indent: { left: 400, firstLine: 0 }
                      })
                    ]
                  })
                ]
              })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE }
          })
        ]
      }]
    });
  }
};

/**
 * MINIMAL Template - Från/Till struktur (liknande Maria Helterley)
 */
export const minimalDocxTemplate: DocxTemplate = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Ren från/till struktur',
  tier: 'free',
  industries: ['Alla branscher', 'Moderna företag', 'Teknik'],

  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${jobInfo.title || 'Ansökningsbrev'}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 2cm 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      max-width: 100%;
      width: 100%;
      margin: 0;
      padding: 0.75rem;
    }

    @media print {
      body {
        max-width: 21cm;
        padding: 1.5cm 1cm;
      }
    }

    .from-to-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .from-section, .to-section {
      flex: 1;
    }

    .section-title {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 0.75rem;
      color: #666666;
    }

    .from-section p, .to-section p {
      margin-bottom: 0.5rem;
      font-size: 11pt;
    }

    .from-section .name, .to-section .name {
      font-size: 11pt;
      font-weight: normal;
    }

    .date {
      margin: 2rem 0;
      font-size: 11pt;
    }

    .greeting {
      margin-bottom: 1.5rem;
    }

    .body-content p {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .closing {
      margin-top: 2.5rem;
      margin-bottom: 3rem;
      font-size: 10pt;
    }

    .signature {
      font-weight: bold;
      font-size: 11pt;
    }

    @media (max-width: 768px) {
      .from-to-container {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="from-to-container">
    <div class="from-section">
      <div class="section-title">Från</div>
      <p class="name">${profile.full_name}</p>
      ${profile.include_phone_in_letters && profile.phone ? `<p>${profile.phone}</p>` : ''}
      <p>${profile.email}</p>
      ${profile.include_location_in_letters && profile.location ? `<p>${profile.location}</p>` : ''}
    </div>

    <div class="to-section">
      <div class="section-title">Till</div>
      ${jobInfo.company ? `<p class="name">${jobInfo.company}</p>` : ''}
      ${jobInfo.position ? `<p>${jobInfo.position}</p>` : ''}
    </div>
  </div>

  <div class="date">${date}</div>

  <div class="greeting">
    <p>Hej,</p>
  </div>

  <div class="body-content">
    ${paragraphs.map(p => `<p>${p}</p>`).join('\n    ')}
  </div>

  <div class="closing">
    <p>Med vänliga hälsningar,</p>
  </div>

  <div class="signature">
    <p>${profile.full_name}</p>
  </div>
</body>
</html>`;
  },

  generateDocument: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1152,
              bottom: 1152,
              left: 1152
            }
          }
        },
        children: [
          // From/To layout
          new Table({
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
              new TableRow({
                children: [
                  // From
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Från', bold: true, size: 20 })],
                        spacing: { after: 120 },
                        indent: { firstLine: 0 }
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: profile.full_name, size: 22 })],
                        spacing: { after: 80 },
                        indent: { firstLine: 0 }
                      }),
                      ...(profile.include_phone_in_letters && profile.phone ? [
                        new Paragraph({
                          children: [new TextRun({ text: profile.phone, size: 20 })],
                          spacing: { after: 80 },
                          indent: { firstLine: 0 }
                        })
                      ] : []),
                      new Paragraph({
                        children: [new TextRun({ text: profile.email, size: 20 })],
                        spacing: { after: 80 },
                        indent: { firstLine: 0 }
                      }),
                      ...(profile.include_location_in_letters && profile.location ? [
                        new Paragraph({
                          children: [new TextRun({ text: profile.location, size: 20 })],
                          indent: { firstLine: 0 }
                        })
                      ] : [])
                    ]
                  }),

                  // To
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Till', bold: true, size: 20 })],
                        spacing: { after: 120 },
                        indent: { firstLine: 0 }
                      }),
                      ...(jobInfo.company ? [
                        new Paragraph({
                          children: [new TextRun({ text: jobInfo.company, size: 22 })],
                          spacing: { after: 80 },
                          indent: { firstLine: 0 }
                        })
                      ] : []),
                      ...(jobInfo.position ? [
                        new Paragraph({
                          children: [new TextRun({ text: jobInfo.position, size: 20 })],
                          indent: { firstLine: 0 }
                        })
                      ] : [])
                    ]
                  })
                ]
              })
            ],
            width: { size: 100, type: WidthType.PERCENTAGE }
          }),

          // Spacing
          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Datum
          new Paragraph({
            children: [new TextRun({ text: date, size: 22 })],
            spacing: { after: 400 },
            indent: { firstLine: 0 }
          }),

          // Hälsning
          new Paragraph({
            children: [new TextRun({ text: 'Hej,', size: 24 })],
            spacing: { after: 240 },
            indent: { firstLine: 0 }
          }),

          // Body
          ...paragraphs.map(para =>
            new Paragraph({
              children: [new TextRun({ text: para.trim(), size: 24 })],
              alignment: AlignmentType.LEFT,
              spacing: { after: 240, line: 360, lineRule: 'auto' },
              indent: { left: 0, right: 0, firstLine: 0 }
            })
          ),

          // Avslutning
          new Paragraph({
            children: [new TextRun({ text: 'Med vänliga hälsningar,', size: 24 })],
            spacing: { before: 480, after: 600 },
            indent: { firstLine: 0 }
          }),

          new Paragraph({
            children: [new TextRun({ text: profile.full_name, bold: true, size: 24 })],
            indent: { firstLine: 0 }
          })
        ]
      }]
    });
  }
};

/**
 * CENTERED Template - Centrerad header med horisontell linje (liknande Therese Bodin)
 */
export const centeredDocxTemplate: DocxTemplate = {
  id: 'centered',
  name: 'Centrerad',
  description: 'Centrerad header med horisontell linje',
  tier: 'premium',
  industries: ['Ledning', 'Chef', 'Konsult'],

  generateHTML: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${jobInfo.title || 'Ansökningsbrev'}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 2cm 2cm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
      max-width: 100%;
      width: 100%;
      margin: 0;
      padding: 0.75rem;
    }

    @media print {
      body {
        max-width: 21cm;
        padding: 1.5cm 1cm;
      }
    }

    .centered-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .centered-header .name {
      font-weight: bold;
      font-size: 13pt;
      margin-bottom: 0.5rem;
    }

    .centered-header .contact {
      font-size: 11pt;
      margin-bottom: 0.5rem;
    }

    .header-divider {
      border-bottom: 1px solid #000000;
      margin: 1.5rem 0 2rem 0;
    }

    .recipient-label {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 0.75rem;
    }

    .recipient .company {
      margin-bottom: 0.5rem;
      font-size: 11pt;
    }

    .recipient {
      margin-bottom: 2rem;
    }

    .date {
      margin: 2rem 0;
      font-size: 11pt;
    }

    .greeting {
      margin-bottom: 1.5rem;
    }

    .body-content p {
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .closing {
      margin-top: 2.5rem;
      margin-bottom: 3rem;
      font-size: 10pt;
    }

    .signature {
      font-weight: bold;
      font-size: 11pt;
    }
  </style>
</head>
<body>
  <div class="centered-header">
    <p class="name">${profile.full_name}</p>
    ${profile.include_phone_in_letters && profile.phone ? `<p class="contact">${profile.phone}</p>` : ''}
    <p class="contact">${profile.email}</p>
    ${profile.include_location_in_letters && profile.location ? `<p class="contact">${profile.location}</p>` : ''}
  </div>

  <div class="header-divider"></div>

  <div class="recipient-label">Till</div>
  <div class="recipient">
    ${jobInfo.company ? `<p class="company">${jobInfo.company}</p>` : ''}
  </div>

  <div class="date">${date}</div>

  <div class="greeting">
    <p>Hej,</p>
  </div>

  <div class="body-content">
    ${paragraphs.map(p => `<p>${p}</p>`).join('\n    ')}
  </div>

  <div class="closing">
    <p>Med vänliga hälsningar,</p>
  </div>

  <div class="signature">
    <p>${profile.full_name}</p>
  </div>
</body>
</html>`;
  },

  generateDocument: (profile, jobInfo, bodyContent, dateStr) => {
    const date = dateStr || formatSwedishDate();
    const paragraphs = splitIntoParagraphs(bodyContent);

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1152,
              bottom: 1152,
              left: 1152
            }
          }
        },
        children: [
          // Centered header
          new Paragraph({
            children: [new TextRun({ text: profile.full_name, bold: true, size: 26 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            indent: { firstLine: 0 }
          }),

          ...(profile.include_phone_in_letters && profile.phone ? [
            new Paragraph({
              children: [new TextRun({ text: profile.phone, size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              indent: { firstLine: 0 }
            })
          ] : []),

          new Paragraph({
            children: [new TextRun({ text: profile.email, size: 22 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            indent: { firstLine: 0 }
          }),

          ...(profile.include_location_in_letters && profile.location ? [
            new Paragraph({
              children: [new TextRun({ text: profile.location, size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              indent: { firstLine: 0 }
            })
          ] : []),

          ...(!profile.include_location_in_letters || !profile.location ? [
            new Paragraph({
              text: '',
              spacing: { after: 160 }
            })
          ] : []),

          // Horizontal line
          new Paragraph({
            border: {
              bottom: {
                color: '000000',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6
              }
            },
            spacing: { after: 400 }
          }),

          // Till/Mottagare
          new Paragraph({
            children: [new TextRun({ text: 'Till', bold: true, size: 20 })],
            spacing: { after: 120 },
            indent: { firstLine: 0 }
          }),

          ...(jobInfo.company ? [
            new Paragraph({
              children: [new TextRun({ text: jobInfo.company, size: 22 })],
              spacing: { after: 80 },
              indent: { firstLine: 0 }
            })
          ] : []),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Datum
          new Paragraph({
            children: [new TextRun({ text: date, size: 22 })],
            spacing: { after: 400 },
            indent: { firstLine: 0 }
          }),

          // Hälsning
          new Paragraph({
            children: [new TextRun({ text: 'Hej,', size: 24 })],
            spacing: { after: 240 },
            indent: { firstLine: 0 }
          }),

          // Body
          ...paragraphs.map(para =>
            new Paragraph({
              children: [new TextRun({ text: para.trim(), size: 24 })],
              alignment: AlignmentType.LEFT,
              spacing: { after: 240, line: 360, lineRule: 'auto' },
              indent: { left: 0, right: 0, firstLine: 0 }
            })
          ),

          // Avslutning
          new Paragraph({
            children: [new TextRun({ text: 'Med vänliga hälsningar,', size: 24 })],
            spacing: { before: 480, after: 600 },
            indent: { firstLine: 0 }
          }),

          new Paragraph({
            children: [new TextRun({ text: profile.full_name, bold: true, size: 24 })],
            indent: { firstLine: 0 }
          })
        ]
      }]
    });
  }
};

// Export all templates
export const DOCX_TEMPLATES: Record<DocxTemplateId, DocxTemplate> = {
  classic: classicDocxTemplate,
  sidebar: sidebarDocxTemplate,
  minimal: minimalDocxTemplate,
  centered: centeredDocxTemplate
};

export function getDocxTemplate(templateId: DocxTemplateId = 'classic'): DocxTemplate {
  return DOCX_TEMPLATES[templateId] || DOCX_TEMPLATES.classic;
}
