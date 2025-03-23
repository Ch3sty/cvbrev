// pdf-parser.ts - med fixad typning för lastY
import type { getDocument as GetDocumentType, GlobalWorkerOptions as WorkerOptionsType } from 'pdfjs-dist';

let pdfjsLib: { getDocument: typeof GetDocumentType, GlobalWorkerOptions: typeof WorkerOptionsType };

// Load PDF.js only on client side
export async function loadPdfJs() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Set worker path to CDN to avoid build issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
  }
  
  return pdfjsLib;
}

export async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
  try {
    const pdfjs = await loadPdfJs();
    if (!pdfjs) {
      throw new Error('PDF.js could not be loaded');
    }
    
    const pdfDoc = await pdfjs.getDocument({ data: pdfData }).promise;
    console.log("📄 PDF har", pdfDoc.numPages, "sidor");
    
    if (!pdfDoc.numPages) {
      return "PDF-filen verkar sakna läsbar text.";
    }
    
    let allText = "";
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      
      // Sortera textelement efter y-position (nedåtgående) och sedan x-position
      const items = [...content.items].sort((a: any, b: any) => {
        // Jämför y-positioner först (med en liten tolerans)
        const yDiff = Math.abs(a.transform[5] - b.transform[5]);
        if (yDiff < 2) {
          // Om y-positionerna är ungefär samma, sortera på x-position 
          return a.transform[4] - b.transform[4];
        }
        // Annars sortera på y-position (högre värden först)
        return b.transform[5] - a.transform[5];
      });
      
      // Gruppera textelement efter y-position
      const lines: any[][] = [];
      let currentLine: any[] = [];
      let lastY: number | null = null; // Explicit typannotering här!
      
      items.forEach((item: any) => {
        const y = item.transform[5];
        
        if (lastY === null || Math.abs(y - lastY) < 2) {
          // Samma rad (ungefär samma y-position)
          currentLine.push(item);
        } else {
          // Ny rad
          if (currentLine.length > 0) {
            lines.push([...currentLine]);
          }
          currentLine = [item];
        }
        
        lastY = y;
      });
      
      // Lägg till den sista raden
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      
      // Bygg ihop texten från varje rad
      let pageText = '';
      
      for (const line of lines) {
        // Sortera objekten i raden efter x-position
        line.sort((a: any, b: any) => a.transform[4] - b.transform[4]);
        
        let lineText = '';
        let lastItem: any = null; // Explicit typannotering här också
        
        for (const item of line) {
          if (lastItem) {
            // Beräkna avstånd mellan nuvarande och föregående element
            const lastEndX = lastItem.transform[4] + (lastItem.width || 0);
            const currentStartX = item.transform[4];
            const gap = currentStartX - lastEndX;
            
            // Lägg till mellanslag baserat på avståndet
            if (gap > 1) {
              // Normalt mellanslag om avståndet är lagom
              lineText += ' ';
            } else if (gap < -1) {
              // Överlappande tecken, troligen fel avstavning
              // Hantera möjliga bindestrecksfall
              if (lastItem.str.endsWith('-')) {
                // Ta bort bindestrecket och slå ihop orden
                lineText = lineText.slice(0, -1) + item.str;
                lastItem = item;
                continue;
              }
            }
          }
          
          lineText += item.str;
          lastItem = item;
        }
        
        pageText += lineText.trim() + '\n';
      }
      
      allText += pageText;
      console.log(`📄 Sida ${i} processerad.`);
    }
    
    // Avancerad efterbehandling
    return allText
      .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')  // Hantera avstavningar mellan rader
      .replace(/\s+\n/g, '\n')                // Ta bort mellanslag före radbrytningar
      .replace(/\n{3,}/g, '\n\n')             // Begränsa antal radbrytningar
      .replace(/\s{2,}/g, ' ')                // Normalisera mellanslag
      .replace(/\n\s+/g, '\n')                // Ta bort mellanslag i början av rader
      .replace(/(.)\n(.)/g, (match, p1, p2) => {
        // Lägg inte till mellanslag om tecknen indikerar en formatering
        if (/[.,;:!?)]/.test(p1) || /[\[(]/.test(p2)) {
          return `${p1}\n${p2}`;
        }
        return `${p1}\n${p2}`; 
      })
      .trim();
      
  } catch (error: any) {
    console.error('⚠️ PDF-extrahering misslyckades:', error);
    return 'Misslyckades med att läsa PDF';
  }
}