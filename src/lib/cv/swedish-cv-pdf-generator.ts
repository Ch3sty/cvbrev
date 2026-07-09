// src/lib/cv/swedish-cv-pdf-generator.ts
// Premium Puppeteer-baserad PDF-generering för svenska CV-mallar

import { CVMetadata, CVGenerationOptions, CVTemplateType } from './cv-metadata';

// Dynamisk import av Puppeteer för att undvika byggfel
let puppeteer: any = null;

export interface SwedishCVPDFOptions {
  template: CVTemplateType;
  format?: 'A4';
  margins?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  colorScheme?: 'navy' | 'pink' | 'purple' | 'blue' | 'custom';
  customColors?: {
    primary?: string;
    accent?: string;
    text?: string;
  };
  // Svenska CV-specifika inställningar
  swedishSettings?: {
    dateFormat?: 'YYYY-MM' | 'MM/YYYY' | 'MMM YYYY';
    phoneFormat?: 'international' | 'national';
    includePhoto?: boolean;
    photoPosition?: 'top-left' | 'top-right' | 'header-center';
    pageLimit?: 1 | 2; // Arbetsförmedlingens rekommendation
  };
}

export class SwedishCVPDFGenerator {
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
   * Initialiserar Puppeteer browser med svenska CV-optimerade inställningar
   */
  private async initBrowser(): Promise<any> {
    if (!this.browser) {
      const puppeteerModule = await this.loadPuppeteer();
      
      // Serverless environment detection
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
          '--disable-features=site-per-process',
          // Svenska CV-specifika optimeringar
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning'
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

        console.log('Using Sparticuz Chromium for serverless CV generation');
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
   * Genererar svenska CV-optimerad PDF
   */
  async generateSwedishCVPDF(
    html: string,
    cvData: CVMetadata,
    options: SwedishCVPDFOptions
  ): Promise<Buffer> {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      try {
        // Sätt viewport för A4-format (794 x 1123 pixels vid 96 DPI)
        await page.setViewport({ 
          width: 794, 
          height: 1123,
          deviceScaleFactor: 2 // Högre kvalitet för PDF
        });
        
        // Ladda svenska typsnitt
        await this.loadSwedishFonts(page);
        
        // Sätt HTML innehåll med svenska specifika optimeringar
        await page.setContent(html, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Vänta på att alla fonts och CSS laddas korrekt
        await page.evaluateHandle('document.fonts.ready');
        
        // Svenska CV-specifika CSS-justeringar
        await this.applySwedishCVStyling(page, options);
        
        // Konfigurera PDF-inställningar enligt svenska standarder
        const pdfOptions = this.getSwedishPDFOptions(options);

        // FIT-TO-PAGE: mallarna är designade som exakt en A4-sida, men riktigt
        // innehåll kan tippa några mm över 297mm. Body är ofta en CSS-grid som
        // Chromium inte kan dela, så hela blocket knuffas till sida 2 och headern
        // blir ensam. Är innehållet BARA marginellt för högt skalar vi ned det så
        // det ryms på en sida (löser buggen för alla mallar oavsett grid-struktur).
        // Är CV:t genuint långt (flersidigt) lämnar vi scale=1 och låter de
        // fragmenteringssäkra print-reglerna bryta i botten, aldrig efter headern.
        const fitScale = await this.computeFitToPageScale(page);
        if (fitScale < 1) {
          (pdfOptions as any).scale = fitScale;
          console.log(`CV skalas till ${Math.round(fitScale * 1000) / 10}% för att rymmas på en sida`);
        }

        // Pre-flight validering för svenskt CV
        await this.validateSwedishCVLayout(page, options);

        // Generera PDF
        const pdfBuffer = await page.pdf(pdfOptions);
        
        // Post-processing validering
        const pageCount = await this.validatePageCount(pdfBuffer, options.swedishSettings?.pageLimit || 2);
        if (pageCount > (options.swedishSettings?.pageLimit || 2)) {
          console.warn(`CV överstiger rekommenderad sidlängd: ${pageCount} sidor`);
        }
        
        console.log(`Svenskt CV genererat: ${pageCount} sidor, mall: ${options.template}`);
        
        return Buffer.from(pdfBuffer);
        
      } finally {
        await page.close();
      }
    } catch (error) {
      console.error('Swedish CV PDF generation error:', error);
      throw new Error(`Svenskt CV PDF-generering misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    }
  }
  
  /**
   * Laddar svenska typsnitt för optimal läsbarhet
   */
  private async loadSwedishFonts(page: any): Promise<void> {
    await page.addStyleTag({
      content: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Fallback för svenska tecken */
        * {
          font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* Svenska CV-specifika typografi */
        .swedish-cv-text {
          font-feature-settings: "kern" 1, "liga" 1;
          text-rendering: optimizeLegibility;
        }
        
        /* Förbättrad läsbarhet för svenska tecken */
        h1, h2, h3, .name, .section-title {
          letter-spacing: -0.025em;
        }
        
        body, p, li, .body-text {
          letter-spacing: -0.01em;
          line-height: 1.4;
        }
      `
    });
  }
  
  /**
   * Applicerar svenska CV-specifik styling
   */
  private async applySwedishCVStyling(page: any, options: SwedishCVPDFOptions): Promise<void> {
    const colors = this.getSwedishColorScheme(options);
    
    await page.addStyleTag({
      content: `
        /* Svenska CV-specifika färgscheman */
        :root {
          --cv-primary: ${colors.primary};
          --cv-accent: ${colors.accent};
          --cv-text: ${colors.text};
          --cv-background: #ffffff;
          --cv-border: #e5e7eb;
        }
        
        /* Säkerställ svensk formatering */
        .phone-number::before {
          content: "";
        }
        
        .email-address {
          word-break: break-all;
        }
        
        /* Svenska datum-formatering */
        .date-range {
          font-variant-numeric: tabular-nums;
        }
        
        /* Kontrastförbättringar för ATS-kompatibilitet */
        .section-title {
          color: var(--cv-primary);
          font-weight: 600;
          border-bottom: 2px solid var(--cv-accent);
          margin-bottom: 12px;
          padding-bottom: 4px;
        }
        
        /* Standardiserade avstånd enligt svenska normer */
        .cv-section {
          margin-bottom: 20px;
        }
        
        .experience-item,
        .education-item {
          margin-bottom: 16px;
          page-break-inside: avoid;
        }
        
        /* ATS-vänlig formatting */
        ul, ol {
          margin: 8px 0;
        }
        
        li {
          margin-bottom: 4px;
          line-height: 1.3;
        }
        
        /* Sidbrytningshantering */
        .avoid-break {
          page-break-inside: avoid;
        }

        .page-break-before {
          page-break-before: always;
        }

        /* Mallarna är helsideslayouter (210mm × 297mm) som äger sin egen inre
           marginal och går kant-till-kant (t.ex. gradient-headers). Därför MÅSTE
           sidmarginalen vara 0, annars läggs en 210mm-behållare i en mindre
           utskriftsyta och innehållet trycks till nästa sida (headern blev ensam
           på sida 1). Skydda dessutom headern och toppsektionerna så en ev.
           brytning alltid sker längre ned, aldrig direkt efter headern. */
        header, .header, .photo-banner, .cv-header, .sidebar, .side-col {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        header, .header, .photo-banner, .cv-header {
          break-after: avoid;
          page-break-after: avoid;
        }

        /* KRITISKT: mallcontainern har min-height: 297mm för att fylla en A4 på
           skärmen. I PDF tvingar det containern till minst en full sida, och med
           den inre paddingen blir totalen ~300mm > 297mm. Body är dessutom ofta
           en CSS-grid som Chromium inte kan dela, så hela body-blocket knuffas
           till sida 2 och headern blir ensam kvar. Vid print nollställer vi
           min-height och gör body-gridet delbart, så innehållet flödar direkt
           under headern och en ev. brytning sker längst ned, aldrig i toppen. */
        @media print {
          /* Låt containern krympa till innehållet, annars tvingar min-height:
             297mm den till minst en full sida och headern + body tippar över. */
          .cv-container, .cv-wrapper, .resume, .page {
            min-height: 0 !important;
            height: auto !important;
          }
          /* En CSS-grid kan inte delas över sidor i Chromium. Konvertera det
             vanligaste tvåkolumns-body-mönstret till display:table i PRINT: det
             BEHÅLLER kolumnordningen och layouten (till skillnad från float, som
             la sidokolumnen sist), men en tabell kan fragmenteras över sidor. Så
             ett kort CV ser identiskt ut, och ett långt bryts rent i botten utan
             att headern blir ensam. Endast kända, säkra klassnamn. */
          .body-grid { display: table !important; width: 100% !important; border-collapse: collapse !important; }
          .body-grid > .main-col { display: table-cell !important; vertical-align: top !important; }
          .body-grid > .side-col { display: table-cell !important; vertical-align: top !important; width: 200px !important; padding-left: 24px !important; }

          /* Håll ihop rubrik + innehåll, och lämna aldrig headern ensam: en ev.
             sidbrytning skjuts nedåt förbi headern och första sektionen. */
          .experience-item, .education-item, .cv-section, .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          header, .header, .photo-banner, .cv-header {
            break-after: avoid;
            page-break-after: avoid;
          }
        }

        @page {
          margin: 0;
          size: A4;
        }
        
        /* Print-optimering */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `
    });
  }
  
  /**
   * Räknar ut en skalfaktor så ett CV som är för högt ryms på EN A4-sida.
   * Mallarna har tvåkolumns-layouter (CSS-grid) som Chromium INTE kan dela över
   * sidor, och att bryta isär gridet förstör designen. Därför bevarar vi gridet
   * intakt och skalar i stället ned hela sidan så innehållet ryms. Golv på 0.80
   * så texten aldrig blir oläsbart liten; är CV:t genuint längre än så (mer än
   * ~25% över en sida) returneras 1 och det får bli flersidigt.
   */
  private async computeFitToPageScale(page: any): Promise<number> {
    const A4_PX = 1123; // 297mm vid 96dpi
    const MIN_SCALE = 0.80;
    // Skala hela vägen ned till golvet innan vi ger upp, så designen bevaras och
    // headern aldrig blir ensam. 1/0.80 ≈ 1.25.
    const MAX_OVERFLOW = 1 / MIN_SCALE;
    try {
      // Mät i PRINT-media så höjden speglar den faktiska print-layouten.
      await page.emulateMediaType('print');
      const contentPx: number = await page.evaluate(() => {
        const sels = ['.cv-container', '.cv-wrapper', '.resume', '.page'];
        let max = 0;
        for (const sel of sels) {
          document.querySelectorAll(sel).forEach((el) => {
            max = Math.max(max, (el as HTMLElement).getBoundingClientRect().height);
          });
        }
        return max || document.body.scrollHeight;
      });
      await page.emulateMediaType(null); // återställ
      if (!contentPx || contentPx <= A4_PX) return 1;
      const ratio = contentPx / A4_PX;
      // Genuint flersidigt (mer än golvet klarar): låt det bli flera sidor.
      if (ratio > MAX_OVERFLOW) return 1;
      // Skala så det precis ryms, med en liten säkerhetsmarginal.
      const scale = Math.max(MIN_SCALE, (1 / ratio) * 0.99);
      return scale;
    } catch {
      return 1;
    }
  }

  /**
   * Hämtar svenska CV-färgschema
   */
  private getSwedishColorScheme(options: SwedishCVPDFOptions) {
    if (options.customColors) {
      return {
        primary: options.customColors.primary || '#131B32',
        accent: options.customColors.accent || '#EC4899',
        text: options.customColors.text || '#374151'
      };
    }
    
    const schemes = {
      navy: {
        primary: '#131B32', // Navy-900
        accent: '#EC4899',  // Pink-500
        text: '#374151'     // Gray-700
      },
      pink: {
        primary: '#EC4899', // Pink-500
        accent: '#8B5CF6',  // Purple-500
        text: '#374151'     // Gray-700
      },
      purple: {
        primary: '#8B5CF6', // Purple-500
        accent: '#EC4899',  // Pink-500
        text: '#374151'     // Gray-700
      },
      blue: {
        primary: '#2563EB', // Blue-600
        accent: '#EC4899',  // Pink-500
        text: '#374151'     // Gray-700
      },
      custom: {
        primary: '#131B32', // Navy-900 as default
        accent: '#EC4899',  // Pink-500 as default
        text: '#374151'     // Gray-700 as default
      }
    };
    
    return schemes[options.colorScheme || 'navy'];
  }
  
  /**
   * Konfigurerar PDF-inställningar enligt svenska standarder
   */
  private getSwedishPDFOptions(options: SwedishCVPDFOptions) {
    return {
      format: 'A4' as const,
      printBackground: true,
      // Noll marginal: mallen är en full-bleed 210mm × 297mm-sida som äger sin
      // egen inre marginal. En påtvingad sidmarginal krymper utskriftsytan och
      // trycker innehållet till sida 2 (headern hamnade ensam på sida 1).
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      displayHeaderFooter: false,
      // OBS: preferCSSPageSize får INTE vara true här. Då ignorerar Chromium
      // scale-parametern, och fit-to-page-skalningen (som räddar ett CV som är
      // marginellt för högt) slutar fungera. format A4 + noll marginal ger ändå
      // rätt sidstorlek eftersom mallarna redan är 210mm breda.
      preferCSSPageSize: false,
      // Svenska CV-specifika inställningar
      tagged: true, // För accessibility
      outline: false,
      waitForFonts: true
    };
  }
  
  /**
   * Validerar att CV-layouten följer svenska standarder
   */
  private async validateSwedishCVLayout(page: any, options: SwedishCVPDFOptions): Promise<void> {
    const validation = await page.evaluate(() => {
      const issues = [];
      
      // Kontrollera att kontaktuppgifter finns
      const contactInfo = document.querySelector('.contact-info, .personal-info');
      if (!contactInfo) {
        issues.push('Saknar kontaktuppgifter');
      }
      
      // Kontrollera att namn finns och är prominent
      const name = document.querySelector('.name, h1');
      if (!name || !name.textContent?.trim()) {
        issues.push('Saknar namn eller namn inte prominent');
      }
      
      // Kontrollera sektioner
      const requiredSections = ['.experience', '.education', '.skills'];
      for (const selector of requiredSections) {
        if (!document.querySelector(selector)) {
          issues.push(`Saknar sektion: ${selector}`);
        }
      }
      
      // Kontrollera textmängd (inte för mycket)
      const textContent = document.body.textContent || '';
      if (textContent.length > 8000) {
        issues.push('För mycket text för 1-2 sidor');
      }
      
      return issues;
    });
    
    if (validation.length > 0) {
      console.warn('Svenska CV-validering varningar:', validation);
    }
  }
  
  /**
   * Validerar antal sidor i genererad PDF
   */
  private async validatePageCount(pdfBuffer: Buffer, maxPages: number): Promise<number> {
    try {
      // Enkel PDF-page counting (kan förbättras med pdf-lib)
      const pdfText = pdfBuffer.toString('binary');
      const pageMatches = pdfText.match(/\/Type\s*\/Page[^s]/g);
      const pageCount = pageMatches ? pageMatches.length : 1;
      
      return pageCount;
    } catch (error) {
      console.warn('Kunde inte räkna sidor i PDF:', error);
      return 1;
    }
  }
  
  /**
   * Genererar förhandsvisning av svenskt CV som bild
   */
  async generateSwedishCVPreview(
    html: string,
    cvData: CVMetadata,
    options: SwedishCVPDFOptions
  ): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      // Sätt viewport för preview (lägre upplösning för snabbhet)
      await page.setViewport({ width: 794, height: 1123 });
      
      await this.loadSwedishFonts(page);
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 15000 
      });
      
      await this.applySwedishCVStyling(page, options);
      await page.evaluateHandle('document.fonts.ready');
      
      // Generera screenshot av första sidan
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 794,
          height: 1123
        },
        omitBackground: false
      });
      
      return Buffer.from(screenshot);
      
    } catch (error) {
      console.error('Swedish CV preview generation error:', error);
      throw new Error(`Svenskt CV preview misslyckades: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      await page.close();
    }
  }
  
  /**
   * Publikt interface för svenskt CV PDF-generering med validering
   */
  async createSwedishCV(
    html: string,
    cvData: CVMetadata,
    options: SwedishCVPDFOptions
  ): Promise<Buffer> {
    this.validateSwedishCVData(cvData);
    
    if (!html || html.trim() === '') {
      throw new Error('HTML-innehåll får inte vara tomt');
    }
    
    return await this.generateSwedishCVPDF(html, cvData, options);
  }
  
  /**
   * Validerar CV-data enligt svenska standarder
   */
  private validateSwedishCVData(cvData: CVMetadata): void {
    if (!cvData.personalInfo.fullName || cvData.personalInfo.fullName.trim() === '') {
      throw new Error('Fullständigt namn krävs för svenskt CV');
    }
    
    if (!cvData.personalInfo.email || cvData.personalInfo.email.trim() === '') {
      throw new Error('E-postadress krävs för svenskt CV');
    }
    
    if (!cvData.experience || cvData.experience.length === 0) {
      console.warn('Svenskt CV saknar arbetslivserfarenhet');
    }
    
    if (!cvData.education || cvData.education.length === 0) {
      console.warn('Svenskt CV saknar utbildning');
    }
  }
}

// Singleton instance för att återanvända browser
let swedishCVGeneratorInstance: SwedishCVPDFGenerator | null = null;

/**
 * Hämta singleton Swedish CV PDF generator instance
 */
export function getSwedishCVPDFGenerator(): SwedishCVPDFGenerator {
  if (!swedishCVGeneratorInstance) {
    swedishCVGeneratorInstance = new SwedishCVPDFGenerator();
  }
  return swedishCVGeneratorInstance;
}

/**
 * Stäng Swedish CV PDF generator och frigör resurser
 */
export async function closeSwedishCVPDFGenerator(): Promise<void> {
  if (swedishCVGeneratorInstance) {
    await swedishCVGeneratorInstance.closeBrowser();
    swedishCVGeneratorInstance = null;
  }
}

/**
 * Hjälpfunktion för enkel svenskt CV PDF-generering
 */
export async function generateSwedishCVPDF(
  html: string,
  cvData: CVMetadata,
  options: SwedishCVPDFOptions
): Promise<Buffer> {
  const generator = getSwedishCVPDFGenerator();
  return await generator.createSwedishCV(html, cvData, options);
}

/**
 * Hjälpfunktion för svenskt CV preview-generering
 */
export async function generateSwedishCVPreview(
  html: string,
  cvData: CVMetadata,
  options: SwedishCVPDFOptions
): Promise<Buffer> {
  const generator = getSwedishCVPDFGenerator();
  return await generator.generateSwedishCVPreview(html, cvData, options);
}