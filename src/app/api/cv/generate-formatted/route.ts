import { NextRequest, NextResponse } from 'next/server';
import { getAllCVTemplates, optimizeContentForTemplate, generateHTMLSafely } from '@/lib/cv/cv-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';
import { parseCVWithAI, validateCVData } from '@/lib/openai/cv-parser-ai';

// Använder samma approach som letters API - dynamisk import av Puppeteer
async function createCVPDF(html: string): Promise<Buffer> {
  try {
    console.log('Generating CV PDF with Puppeteer');
    
    // Dynamisk import precis som puppeteer-pdf.ts gör
    const puppeteer = await import('puppeteer');
    const puppeteerModule = puppeteer.default || puppeteer;
    
    // Serverless-detection samma som letters API
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
    console.error('CV PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


// AI-powered content extraction function - UPPGRADERAD!
async function extractCVContent(rawText: string): Promise<CVMetadata> {
  console.log('Använder AI-driven CV-parsing...');
  
  try {
    // Använd AI-baserad parsing för bästa resultat
    const aiResult = await parseCVWithAI(rawText);
    
    // Logga metadata för insikter och debugging
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
    console.error('AI CV-parsing misslyckades, använder fallback:', error);
    
    // Fallback till enkel regex-baserad parsing vid AI-fel
    return extractCVContentFallback(rawText);
  }
}

// Behåll ursprunglig logik som fallback
async function extractCVContentFallback(rawText: string): Promise<CVMetadata> {
  console.log('Använder fallback regex-baserad parsing...');
  
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
    
    return experiences.length > 0 ? experiences : [{
      position: 'Tidigare roller',
      company: 'Se bifogad information',
      location: '',
      startDate: '2020-01-01',
      description: ['Detaljerad information finns i originaltext'],
      achievements: []
    }];
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
    
    return education.length > 0 ? education : [{
      degree: 'Utbildningsbakgrund',
      institution: 'Se bifogad information',
      location: '',
      graduationYear: '2020'
    }];
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
    
    return skills.length > 0 ? skills : [{
      category: 'Kompetenser',
      skills: ['Se bifogad information för detaljerade färdigheter']
    }];
  };
  
  return {
    personalInfo: extractPersonalInfo(),
    summary: 'Se bifogad detaljerad information om kandidaten',
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
    
    // Hitta vald mall
    const selectedTemplate = getAllCVTemplates().find(t => t.id === template);
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: 'Okänd mall' },
        { status: 400 }
      );
    }
    
    // Extrahera CV-innehåll med AI
    console.log('Extraherar CV-innehåll...');
    const extractedCVData = await extractCVContent(cvText);
    
    // Optimera innehåll för vald mall
    console.log('Optimerar innehåll för mall:', template);
    const cvData = optimizeContentForTemplate(extractedCVData, template);
    
    // Generera HTML med vald mall
    const options: CVGenerationOptions = {
      template: template as CVTemplateType,
      format: format as 'pdf' | 'docx' | 'both',
      colorScheme: colorScheme as any,
      includePhoto: false
    };
    
    console.log('Genererar HTML med optimerat innehåll för mall:', template);
    const html = await generateHTMLSafely(selectedTemplate, cvData, options);
    
    // Generera PDF med samma approach som letters API
    console.log('Genererar PDF...');
    const pdfBuffer = await createCVPDF(html);
    
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