import { NextRequest, NextResponse } from 'next/server';
import { loadTemplate } from '@/lib/cv/cv-templates';
import type { CVTemplateType, CVMetadata, CVGenerationOptions } from '@/lib/cv/cv-metadata';

// Cache för preview-generering
const previewCache = new Map<string, { 
  buffer: Buffer; 
  timestamp: number; 
  contentType: string;
}>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minuter
const MAX_CACHE_SIZE = 50; // Begränsa cache-storlek

// Rensa gammal cache
function cleanCache() {
  const now = Date.now();
  const entries = Array.from(previewCache.entries());
  
  // Ta bort expired entries
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      previewCache.delete(key);
    }
  });
  
  // Om cache fortfarande är för stor, ta bort äldsta
  if (previewCache.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, previewCache.size - MAX_CACHE_SIZE);
    
    sortedEntries.forEach(([key]) => previewCache.delete(key));
  }
}

// Generera cache-nyckel
function generateCacheKey(templateId: string, options: any): string {
  const optionsStr = JSON.stringify(options);
  return `${templateId}_${Buffer.from(optionsStr).toString('base64')}`;
}

// Generera PNG från HTML med Puppeteer
async function generatePreviewPNG(html: string, options: {
  width: number;
  height: number;
}): Promise<Buffer> {
  try {
    // Dynamisk import av Puppeteer (samma approach som CV PDF generation)
    const puppeteer = await import('puppeteer');
    const puppeteerModule = puppeteer.default || puppeteer;
    
    // Serverless detection
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
        '--disable-gpu',
        '--disable-web-security', // För preview generation
        '--disable-extensions'
      ]
    };

    // Lägg till Chromium executable för serverless
    if (isServerless) {
      try {
        const chromium = await import('@sparticuz/chromium');
        launchOptions.executablePath = await chromium.default.executablePath();
        launchOptions.args = [...launchOptions.args, ...chromium.default.args];
      } catch (error) {
        console.warn('Sparticuz Chromium not available, falling back to system Puppeteer');
      }
    }
    
    const browser = await puppeteerModule.launch(launchOptions);
    const page = await browser.newPage();
    
    try {
      // Sätt viewport för konsistent rendering
      await page.setViewport({ 
        width: options.width, 
        height: options.height,
        deviceScaleFactor: 1
      });
      
      // Ladda HTML content
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 15000 
      });
      
      // Vänta lite extra för fonter att ladda
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ta screenshot (PNG stöder inte quality-parameter)
      const buffer = Buffer.from(await page.screenshot({
        type: 'png',
        fullPage: true,
        optimizeForSpeed: true
      }));
      
      return buffer;
    } finally {
      await page.close();
      await browser.close();
    }
  } catch (error) {
    console.error('Preview generation error:', error);
    throw new Error(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, cvData, options = {} } = body;

    // Validering
    if (!template) {
      return NextResponse.json({ error: 'Template ID krävs' }, { status: 400 });
    }

    if (!cvData) {
      return NextResponse.json({ error: 'CV data krävs' }, { status: 400 });
    }

    // Ladda template dynamiskt
    let templateObj;
    try {
      templateObj = await loadTemplate(template as CVTemplateType);
    } catch (error) {
      console.error('Failed to load template:', error);
      return NextResponse.json({ error: 'Template kunde inte laddas' }, { status: 404 });
    }

    // Generera cache-nyckel
    const cacheKey = generateCacheKey(template, { cvData, options });
    
    // Rensa gammal cache
    cleanCache();
    
    // Kontrollera cache
    const cached = previewCache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit för template: ${template}`);
      return new NextResponse(cached.buffer, {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=600', // 10 minuter browser cache
        }
      });
    }

    console.log(`Genererar ny preview för template: ${template}`);

    // Generera HTML
    const generationOptions: CVGenerationOptions = {
      template: template as CVTemplateType,
      format: 'png',
      colorScheme: options.colorScheme || 'blue',
      includePhoto: false,
      ...options
    };

    const htmlResult = templateObj.generateHTML(cvData as CVMetadata, generationOptions);
    
    // Hantera både sync och async template generation med type-safe approach
    const html: string = typeof htmlResult === 'string' ? htmlResult : await htmlResult;
    
    // Generera PNG
    const previewOptions = {
      width: options.width || 794,
      height: options.height || 1123
    };

    const buffer = await generatePreviewPNG(html, previewOptions);
    const contentType = 'image/png';

    // Spara i cache
    previewCache.set(cacheKey, {
      buffer,
      timestamp: Date.now(),
      contentType
    });

    console.log(`Preview genererad för template: ${template}, storlek: ${buffer.length} bytes`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=600',
        'Content-Length': buffer.length.toString(),
      }
    });

  } catch (error: any) {
    console.error('API Error in generate-preview:', error);
    
    return NextResponse.json({
      error: 'Serverfel vid preview-generering',
      details: error.message
    }, { status: 500 });
  }
}

// GET method för hälsokontroll
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    cacheSize: previewCache.size,
    timestamp: new Date().toISOString()
  });
}