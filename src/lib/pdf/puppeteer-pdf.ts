// src/lib/pdf/puppeteer-pdf.ts
// Puppeteer-baserad PDF-generering för professionella personliga brev

import puppeteer, { Browser, Page } from 'puppeteer';
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
  private browser: Browser | null = null;
  
  /**
   * Initialiserar Puppeteer browser instance
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      // Check if we're in a serverless environment
      const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
      
      this.browser = await puppeteer.launch({
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
          ...(isServerless ? ['--single-process'] : [])
        ],
        // Use system Chrome in production/serverless environments
        ...(isServerless && { executablePath: '/usr/bin/google-chrome-stable' })
      });
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
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
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