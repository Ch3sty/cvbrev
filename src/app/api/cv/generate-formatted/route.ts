import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById } from '@/lib/cv/simple-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';
import { validateCVData } from '@/lib/openai/cv-parser-ai';
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser';
import { generateSwedishCVPDF, SwedishCVPDFOptions } from '@/lib/cv/swedish-cv-pdf-generator';
import { 
  parseCVWithAIServerSide,
  extractBasicPersonalInfo,
  extractBasicSummary,
  extractBasicExperience,
  extractBasicEducation,
  extractBasicSkills,
  extractBasicLanguages
} from '../parse/route';

// Svenska CV PDF-generering med premium kvalitet
async function createSwedishCVPDF(html: string, cvData: CVMetadata, templateId: CVTemplateType): Promise<Buffer> {
  console.log(`Generating Swedish CV PDF with template: ${templateId}`);
  
  const swedishPDFOptions: SwedishCVPDFOptions = {
    template: templateId,
    format: 'A4',
    margins: {
      top: '20mm',
      right: '15mm', 
      bottom: '20mm',
      left: '15mm'
    },
    colorScheme: 'navy', // Default till navy färgschema
    swedishSettings: {
      dateFormat: 'YYYY-MM',
      phoneFormat: 'international',
      pageLimit: 2, // Arbetsförmedlingens rekommendation
      includePhoto: false
    }
  };
  
  try {
    return await generateSwedishCVPDF(html, cvData, swedishPDFOptions);
  } catch (error) {
    console.error('Swedish CV PDF generation failed, using fallback:', error);
    
    // Fallback till enklare PDF-generering
    return await createBasicCVPDF(html);
  }
}

// Fallback PDF-generering (enklare version)
async function createBasicCVPDF(html: string): Promise<Buffer> {
  try {
    console.log('Using basic PDF generation fallback');
    
    const puppeteer = await import('puppeteer');
    const puppeteerModule = puppeteer.default || puppeteer;
    
    const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
    
    const launchOptions: any = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };

    if (isServerless) {
      try {
        const chromium = await import('@sparticuz/chromium');
        launchOptions.executablePath = await chromium.default.executablePath();
        launchOptions.args = [
          ...launchOptions.args,
          ...chromium.default.args
        ];
      } catch (error) {
        console.warn('Sparticuz Chromium not available, falling back');
      }
    }
    
    const browser = await puppeteerModule.launch(launchOptions);
    const page = await browser.newPage();
    
    try {
      await page.setViewport({ width: 794, height: 1123 }); // A4
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (error) {
    console.error('Basic CV PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


// Svenska CV-innehåll extraction med förbättrad parsing
async function extractSwedishCVContent(rawText: string): Promise<CVMetadata> {
  console.log('Använder förbättrad svensk CV-parsing...');
  
  try {
    // Försök med svenska AI-driven parsing först
    console.log('Försöker med AI-driven CV-parsing...');
    const aiResult = await parseCVWithAIServerSide(rawText);
    
    // Logga metadata för insikter
    console.log('AI CV Parsing SUCCESS - metadata:', {
      model: aiResult.metadata.model,
      cost: aiResult.metadata.cost,
      processingTime: aiResult.metadata.processingTime,
      detectedIndustry: aiResult.metadata.detectedIndustry,
      confidenceScore: aiResult.metadata.confidenceScore,
      tokensUsed: aiResult.metadata.tokens
    });
    
    // Validera och returnera strukturerad data
    return validateCVData(aiResult.cvData);
    
  } catch (error) {
    console.error('AI CV-parsing misslyckades, använder svenska fallback:', error);
    
    // Fallback till avancerad svensk regex-baserad parsing
    return await parseSwedishCVContent(rawText);
  }
}

// Förbättrad fallback som använder server-side extraktionsfunktioner
async function extractCVContentFallback(rawText: string): Promise<CVMetadata> {
  console.log('Använder förbättrad fallback-parsing...');
  
  return {
    personalInfo: extractBasicPersonalInfo(rawText),
    summary: extractBasicSummary(rawText),
    experience: extractBasicExperience(rawText),
    education: extractBasicEducation(rawText),
    skills: extractBasicSkills(rawText),
    projects: [],
    certifications: [],
    languages: extractBasicLanguages(rawText),
    interests: [],
    references: ''
  };
}

// Gammal fallback-logik (behållen som backup)
async function extractCVContentOldFallback(rawText: string): Promise<CVMetadata> {
  console.log('Använder gammal fallback regex-baserad parsing...');
  
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const extractPersonalInfo = () => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+46|0)[\s-]?[\d\s-]{8,}/;
    
    const email = rawText.match(emailRegex)?.[0] || '';
    const phone = rawText.match(phoneRegex)?.[0] || '';
    
    const nameCandidate = lines.find(line => 
      line.trim().length > 5 && 
      !line.includes('@') && 
      !line.match(/^\d/) &&
      line.split(' ').length >= 2
    ) || '';
    
    return {
      fullName: nameCandidate,
      email,
      phone: phone?.replace(/\s/g, ''),
      address: '',
      linkedIn: '',
      website: '',
      github: ''
    };
  };
  
  const extractExperience = () => {
    const experienceKeywords = ['arbetslivserfarenhet', 'experience', 'anställning', 'tjänst', 'position'];
    const experiences = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (experienceKeywords.some(keyword => line.includes(keyword))) {
        for (let j = i + 1; j < lines.length; j++) {
          const expLine = lines[j];
          if (expLine.includes(' - ') && expLine.length > 10) {
            const parts = expLine.split(' - ');
            if (parts.length >= 2) {
              experiences.push({
                position: parts[0].trim(),
                company: parts[1].trim(),
                location: '',
                startDate: '2020-01-01',
                description: [`Arbetade som ${parts[0].toLowerCase()}`],
                achievements: []
              });
            }
          }
        }
        break;
      }
    }
    
    return experiences; // Return only actual experiences found
  };
  
  const extractEducation = () => {
    const educationKeywords = ['utbildning', 'education', 'examen', 'universitet', 'högskola'];
    const education = [];
    
    for (const line of lines) {
      if (educationKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        if (line.includes(' - ')) {
          const parts = line.split(' - ');
          education.push({
            degree: parts[0].trim(),
            institution: parts[1]?.trim() || 'Utbildningsinstitution',
            location: '',
            graduationYear: '2020'
          });
        }
      }
    }
    
    return education; // Return only actual education found
  };
  
  const extractSkills = () => {
    const skillsKeywords = ['kompetenser', 'skills', 'färdigheter', 'kunskaper'];
    const skills = [];
    
    for (const line of lines) {
      if (skillsKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        const skillsText = line.replace(/kompetenser:|skills:|färdigheter:|kunskaper:/gi, '').trim();
        if (skillsText) {
          const skillArray = skillsText.split(',').map(s => s.trim()).filter(s => s.length > 0);
          if (skillArray.length > 0) {
            skills.push({
              category: 'Tekniska färdigheter',
              skills: skillArray
            });
          }
        }
      }
    }
    
    return skills; // Return only actual skills found
  };
  
  return {
    personalInfo: extractPersonalInfo(),
    summary: '',
    experience: extractExperience(),
    education: extractEducation(),
    skills: extractSkills(),
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    references: 'Referenser lämnas på begäran'
  };
}

export async function POST(request: NextRequest) {
  try {
    const { template, cvText, format = 'pdf', colorScheme = 'blue' } = await request.json();
    
    if (!template || !cvText) {
      return NextResponse.json(
        { error: 'Template och CV-text krävs' },
        { status: 400 }
      );
    }
    
    // Kontrollera att mallen finns
    const selectedTemplate = getTemplateById(template);
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: 'Mall hittades inte' },
        { status: 400 }
      );
    }
    
    // Extrahera CV-innehåll med förbättrad svensk parsing
    console.log('Extraherar svenskt CV-innehåll...');
    const extractedCVData = await extractSwedishCVContent(cvText);
    
    // För nu använder vi enkel HTML-generering istället för komplexa mallar
    const html = `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV - ${extractedCVData.personalInfo.fullName}</title>
        <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
            h1 { color: #1e40af; margin-bottom: 10px; }
            h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 25px; }
            .contact-info { margin-bottom: 20px; color: #666; }
            .section { margin-bottom: 25px; }
            .experience-item, .education-item { margin-bottom: 15px; }
            .job-title { font-weight: bold; color: #1e40af; }
            .company { color: #666; margin-bottom: 5px; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-item { background: #f3f4f6; padding: 5px 10px; border-radius: 5px; font-size: 14px; }
        </style>
    </head>
    <body>
        <h1>${extractedCVData.personalInfo.fullName}</h1>
        <div class="contact-info">
            ${extractedCVData.personalInfo.email && `📧 ${extractedCVData.personalInfo.email}`}
            ${extractedCVData.personalInfo.phone && `📱 ${extractedCVData.personalInfo.phone}`}
        </div>
        
        ${extractedCVData.summary ? `
        <div class="section">
            <h2>Professionell sammanfattning</h2>
            <p>${extractedCVData.summary}</p>
        </div>
        ` : ''}
        
        ${extractedCVData.experience.length > 0 ? `
        <div class="section">
            <h2>Arbetslivserfarenhet</h2>
            ${extractedCVData.experience.map(exp => `
                <div class="experience-item">
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                    ${exp.description.map(desc => `<p>${desc}</p>`).join('')}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${extractedCVData.education.length > 0 ? `
        <div class="section">
            <h2>Utbildning</h2>
            ${extractedCVData.education.map(edu => `
                <div class="education-item">
                    <div class="job-title">${edu.degree}</div>
                    <div class="company">${edu.institution}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${extractedCVData.skills.length > 0 ? `
        <div class="section">
            <h2>Kompetenser</h2>
            ${extractedCVData.skills.map(skillGroup => `
                <h3>${skillGroup.category}</h3>
                <div class="skills-list">
                    ${skillGroup.skills.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </body>
    </html>
    `;
    
    // Generera PDF med svenska premium-kvalitet
    console.log('Genererar svenskt premium-CV PDF...');
    const pdfBuffer = await createSwedishCVPDF(html, extractedCVData, template as CVTemplateType);
    
    // Sanitera filnamn (ta bort svenska tecken för att undvika header-fel)
    const sanitizedTemplate = template
      .replace(/ö/g, 'o')
      .replace(/ä/g, 'a')
      .replace(/å/g, 'a')
      .replace(/[^a-zA-Z0-9-]/g, '-');
    
    const filename = `cv-${sanitizedTemplate}.pdf`;
    
    console.log('CV genererat framgångsrikt:', filename);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Fel vid CV-generering:', error);
    return NextResponse.json(
      { 
        error: 'Kunde inte generera CV',
        details: error instanceof Error ? error.message : 'Okänt fel'
      },
      { status: 500 }
    );
  }
}