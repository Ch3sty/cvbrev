import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { cvTemplates } from '@/lib/cv/cv-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';

const isProd = process.env.NODE_ENV === 'production';

// AI-powered content extraction function
async function extractCVContent(rawText: string): Promise<CVMetadata> {
  // TODO: Implementera OpenAI API för intelligent CV-parsing
  // För nu använder vi en enkel regex-baserad parser
  
  const lines = rawText.split('\n').filter(line => line.trim());
  
  // Grundläggande parsing - detta kommer förbättras med AI
  const extractPersonalInfo = () => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+46|0)[\s-]?[\d\s-]{8,}/;
    
    const email = rawText.match(emailRegex)?.[0] || '';
    const phone = rawText.match(phoneRegex)?.[0] || '';
    
    // Hitta namn (vanligtvis första icke-tomma raden eller före email)
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
    // Enkel parsing av arbetslivserfarenhet
    const experienceKeywords = ['arbetslivserfarenhet', 'experience', 'anställning', 'tjänst', 'position'];
    const experiences = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (experienceKeywords.some(keyword => line.includes(keyword))) {
        // Hitta nästa sektion med arbetslivserfarenhet
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
        // Enkel kommaseparerad skills parsing
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
    const selectedTemplate = cvTemplates.find(t => t.id === template);
    if (!selectedTemplate) {
      return NextResponse.json(
        { error: 'Okänd mall' },
        { status: 400 }
      );
    }
    
    // Extrahera CV-innehåll med AI
    console.log('Extraherar CV-innehåll...');
    const cvData = await extractCVContent(cvText);
    
    // Generera HTML med vald mall
    const options: CVGenerationOptions = {
      template: template as CVTemplateType,
      format: format as 'pdf' | 'docx' | 'both',
      colorScheme: colorScheme as any,
      includePhoto: false
    };
    
    console.log('Genererar HTML med mall:', template);
    const html = selectedTemplate.generateHTML(cvData, options);
    
    // Starta Puppeteer
    console.log('Startar Puppeteer...');
    const browser = await puppeteer.launch({
      args: isProd ? chromium.args : [],
      defaultViewport: chromium.defaultViewport,
      executablePath: isProd ? await chromium.executablePath() : undefined,
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generera PDF
    console.log('Genererar PDF...');
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
    
    await browser.close();
    
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