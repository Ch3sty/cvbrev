// src/lib/pdf/puppeteer-pdf.ts
// Puppeteer-baserad PDF-generering för professionella personliga brev

// Dynamisk import av Puppeteer för att undvika byggfel
let puppeteer: any = null;
import { getLetterTemplate, LetterMetadata, TemplateType } from './letter-templates';

export interface PDFGenerationOptions {
  template?: TemplateType;
  format?: 'A4' | 'Letter';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export class PuppeteerPDFGenerator {
  private browser: any = null;
  
  /**
   * Laddar Puppeteer dynamiskt för att undvika byggfel
   */
  private async loadPuppeteer(): Promise<any> {
    if (!puppeteer) {
      try {
        puppeteer = await import('puppeteer');
        return puppeteer.default || puppeteer;
      } catch (error) {
        console.warn('Puppeteer could not be loaded:', error);
        throw new Error('Puppeteer inte tillgängligt i denna miljö');
      }
    }
    return puppeteer.default || puppeteer;
  }
  
  /**
   * Initialiserar Puppeteer browser instance
   */
  private async initBrowser(): Promise<any> {
    if (!this.browser) {
      const puppeteerModule = await this.loadPuppeteer();
      
      // Check if we're in a serverless environment
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
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-web-security',
          '--disable-features=site-per-process'
        ]
      };

      if (isServerless) {
        // I serverless-miljö MÅSTE vi använda @sparticuz/chromium
        // Ingen fallback till system chrome - det finns inte på Vercel
        const chromium = await import('@sparticuz/chromium');
        const chromiumModule = chromium.default || chromium;

        // Använd korrekt API för @sparticuz/chromium
        launchOptions.executablePath = await chromiumModule.executablePath();
        launchOptions.args = chromiumModule.args;
        launchOptions.headless = 'shell'; // Krävs för @sparticuz/chromium

        console.log('Using Sparticuz Chromium for serverless');
        console.log('Chromium executable path:', launchOptions.executablePath);
      }
      
      this.browser = await puppeteerModule.launch(launchOptions);
    }
    return this.browser;
  }
  
  /**
   * Stänger browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Genererar PDF från brevinnehåll och metadata
   */
  async generateLetterPDF(
    content: string,
    metadata: LetterMetadata,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      try {
        // Sätt viewport för konsekvent rendering
        await page.setViewport({ width: 794, height: 1123 }); // A4 dimensioner i pixels
        
        // Välj och generera HTML från mall
        const template = getLetterTemplate(options.template || 'formal');
        const html = template.generateHTML(content, metadata);
        
        // Sätt HTML innehåll
        await page.setContent(html, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Konfigurera PDF-inställningar
        const pdfOptions = {
          format: options.format || 'A4' as const,
          printBackground: true,
          margin: options.margins || {
            top: '2.5cm',
            right: '2cm', 
            bottom: '2cm',
            left: '2cm'
          },
          displayHeaderFooter: options.displayHeaderFooter || false,
          headerTemplate: options.headerTemplate || '',
          footerTemplate: options.footerTemplate || '',
          preferCSSPageSize: true
        };
        
        // Generera PDF
        const pdfBuffer = await page.pdf(pdfOptions);
        
        return Buffer.from(pdfBuffer);
        
      } finally {
        await page.close();
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Genererar förhandsvisning av brevet som bild (för preview-funktion)
   */
  async generatePreviewImage(
    content: string,
    metadata: LetterMetadata,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      // Sätt viewport för preview
      await page.setViewport({ width: 794, height: 1123 });
      
      const template = getLetterTemplate(options.template || 'formal');
      const html = template.generateHTML(content, metadata);
      
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Generera screenshot av första sidan
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 794,
          height: 1123
        }
      });
      
      return Buffer.from(screenshot);
      
    } catch (error) {
      console.error('Preview generation error:', error);
      throw new Error(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }
  
  /**
   * Validerar metadata innan PDF-generering
   */
  private validateMetadata(metadata: LetterMetadata): void {
    if (!metadata.author || metadata.author.trim() === '') {
      throw new Error('Författarens namn krävs för PDF-generering');
    }
    
    if (!metadata.email || metadata.email.trim() === '') {
      throw new Error('E-postadress krävs för PDF-generering');
    }
    
    if (!metadata.title || metadata.title.trim() === '') {
      throw new Error('Brevtitel krävs för PDF-generering');
    }
  }
  
  /**
   * Publikt interface för PDF-generering med validering
   */
  async createPDF(
    content: string,
    metadata: LetterMetadata,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    this.validateMetadata(metadata);
    
    if (!content || content.trim() === '') {
      throw new Error('Brevinnehåll får inte vara tomt');
    }
    
    return await this.generateLetterPDF(content, metadata, options);
  }
  
  /**
   * Publikt interface för preview-generering
   */
  async createPreview(
    content: string,
    metadata: LetterMetadata,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    this.validateMetadata(metadata);
    
    if (!content || content.trim() === '') {
      throw new Error('Brevinnehåll får inte vara tomt');
    }
    
    return await this.generatePreviewImage(content, metadata, options);
  }
}

// Singleton instance för att återanvända browser
let pdfGeneratorInstance: PuppeteerPDFGenerator | null = null;

/**
 * Hämta singleton PDF generator instance
 */
export function getPDFGenerator(): PuppeteerPDFGenerator {
  if (!pdfGeneratorInstance) {
    pdfGeneratorInstance = new PuppeteerPDFGenerator();
  }
  return pdfGeneratorInstance;
}

/**
 * Stäng PDF generator och frigör resurser
 */
export async function closePDFGenerator(): Promise<void> {
  if (pdfGeneratorInstance) {
    await pdfGeneratorInstance.closeBrowser();
    pdfGeneratorInstance = null;
  }
}

/**
 * Hjälpfunktion för enkel PDF-generering
 */
export async function generateLetterPDF(
  content: string,
  metadata: LetterMetadata,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const generator = getPDFGenerator();
  return await generator.createPDF(content, metadata, options);
}

/**
 * Hjälpfunktion för preview-generering
 */
export async function generateLetterPreview(
  content: string,
  metadata: LetterMetadata,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const generator = getPDFGenerator();
  return await generator.createPreview(content, metadata, options);
}