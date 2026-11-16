/**
 * PDF-kedjan för mallarna: samma funktion skriver den nedladdade filen
 * (generate-formatted) och sidbilderna i helskärmen (sidbilder.ts), så att
 * sidindelningen i helskärmen aldrig kan skilja sig från filen. Flyttad ur
 * generate-formatted/route.ts 2026-11-16 utan ändringar.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata';
import { baddaInTypsnitt } from '@/lib/cv/mallar/typsnitt-inbaddning';
import { generateSwedishCVPDF, SwedishCVPDFOptions } from '@/lib/cv/swedish-cv-pdf-generator';

// Svenska CV PDF-generering med premium kvalitet
export async function createSwedishCVPDF(html: string, cvData: CVMetadata, templateId: string): Promise<Buffer> {
  console.log(`Generating Swedish CV PDF with template: ${templateId}`);
  
  const swedishPDFOptions: SwedishCVPDFOptions = {
    template: templateId,
    format: 'A4',
    // Noll marginal: mallarna är full-bleed helsideslayouter (210mm × 297mm)
    // som äger sin egen inre marginal. Se swedish-cv-pdf-generator.ts.
    margins: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
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
      await page.setContent(baddaInTypsnitt(html), { waitUntil: 'networkidle0', timeout: 30000 });
      await page.evaluateHandle('document.fonts.ready').catch(() => {});

      // Mallsystemets HTML (data-mall) äger sina marginaler, brytningar och
      // spalter; reservvägen skriver ut den som den är.
      const mallsystemet = /<html[^>]*data-mall=/.test(html);
      let scale = 1;
      if (!mallsystemet) {
      // Samma fragmenteringssäkring som huvudgeneratorn, så även reservvägen
      // aldrig lämnar headern ensam på sida 1.
      await page.addStyleTag({
        content: `
          @page { margin: 0; size: A4; }
          @media print {
            .cv-container, .cv-wrapper, .resume, .page { min-height: 0 !important; height: auto !important; }
            .experience-item, .education-item, .cv-section, .section { break-inside: avoid; page-break-inside: avoid; }
            header, .header, .photo-banner, .cv-header { break-after: avoid; page-break-after: avoid; }
            * { -webkit-print-color-adjust: exact !important; }
          }
        `,
      });

      // Grid → table med varje malls faktiska geometri, så tvåkolumns-body:n
      // blir fragmenterbar utan att designen ändras (samma som huvudgeneratorn).
      await page.evaluate(() => {
        document.querySelectorAll<HTMLElement>('.body-grid').forEach((grid) => {
          const cs = getComputedStyle(grid);
          if (cs.display !== 'grid') return;
          const kids = Array.from(grid.children) as HTMLElement[];
          if (kids.length !== 2) return;
          const w = kids.map((c) => c.getBoundingClientRect().width);
          const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
          const pt = cs.paddingTop, pr = cs.paddingRight, pb = cs.paddingBottom, pl = cs.paddingLeft;
          grid.style.setProperty('display', 'table', 'important');
          grid.style.setProperty('table-layout', 'fixed', 'important');
          grid.style.setProperty('width', '100%', 'important');
          grid.style.setProperty('border-collapse', 'collapse', 'important');
          grid.style.setProperty('box-sizing', 'border-box', 'important');
          grid.style.setProperty('padding', '0', 'important');
          grid.style.setProperty('gap', '0', 'important');
          const total = w[0] + w[1] + gap;
          kids.forEach((cell, i) => {
            cell.style.setProperty('display', 'table-cell', 'important');
            cell.style.setProperty('vertical-align', 'top', 'important');
            cell.style.setProperty('box-sizing', 'border-box', 'important');
            cell.style.setProperty('min-width', '0', 'important');
            const pct = total > 0 ? (w[i] + gap / 2) / total * 100 : 50;
            cell.style.setProperty('width', pct + '%', 'important');
            const g = gap / 2 + 'px';
            cell.style.setProperty('padding', i === 0 ? `${pt} ${g} ${pb} ${pl}` : `${pt} ${pr} ${pb} ${g}`, 'important');
          });
        });
      }).catch(() => {});

      // Fit-to-page: skala ned om innehållet är marginellt för högt (samma
      // logik som huvudgeneratorn), annars flera sidor med brytning i botten.
      try {
        const contentPx: number = await page.evaluate(() => {
          let max = 0;
          for (const sel of ['.cv-container', '.cv-wrapper', '.resume', '.page']) {
            document.querySelectorAll(sel).forEach((el) => {
              max = Math.max(max, (el as HTMLElement).offsetHeight);
            });
          }
          return max || document.body.scrollHeight;
        });
        const ratio = contentPx / 1123;
        // Skala ned för att bevara tvåkolumns-designen (gridet kan inte delas),
        // golv 0.80. Samma logik som huvudgeneratorns computeFitToPageScale.
        if (ratio > 1 && ratio <= 1.25) scale = Math.max(0.80, (1 / ratio) * 0.99);
      } catch { /* behåll scale 1 */ }
      }

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        // Noll marginal, samma skäl som huvudgeneratorn: mallen är full-bleed.
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        // preferCSSPageSize inte true: den skulle få Chromium att ignorera scale.
        preferCSSPageSize: false,
        scale,
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
