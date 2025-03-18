// src/lib/cv-parser/index.ts
import mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

// 🛠 Konfigurera worker-path för PDF.js
if (typeof window !== 'undefined') {
  // Klientkontext
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} else {
  // Serverkontext
  try {
    GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch (error) {
    console.warn('PDF.js worker kunde inte konfigureras på servern:', error);
  }
}

/**
 * Städar och normaliserar extraherad text med fokus på CV-format
 */
export function cleanExtractedText(text: string): string {
  return text
    // Grundläggande rengöring
    .replace(/\s+/g, ' ')              // Ersätt flera mellanslag med ett
    .replace(/\n+/g, '\n')             // Ersätt flera radbrytningar med en
    
    // Specifik hantering för CV-format
    .replace(/(\w)-\s+(\w)/g, '$1$2')  // Hantera felaktiga avstavningar inom en rad
    .replace(/(\w)\s+([,.:])/g, '$1$2') // Ta bort mellanslag före skiljetecken
    .replace(/\b([A-Za-z])\s+(\d+)\b/g, '$1$2') // Fixa uppdelade kodnamn (t.ex. "ABT 06" blir "ABT06")
    .replace(/(\w)\s+\-\s+(\w)/g, '$1-$2') // Fixa uppdelade intervall (t.ex. "2020 - 2024" blir "2020-2024")
    
    // Formatspecifika korrigeringar
    .replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, (match, p1, p2) => {
      // Behåll mellanslag mellan namn/titlar
      if (/^(Senior|Junior|Chief|Head|Lead)/i.test(p1)) {
        return `${p1} ${p2}`;
      }
      return match;
    })
    
    .trim(); // Ta bort mellanslag i början och slutet
}

/**
 * Funktion som bestämmer vilket format CV-filen har och använder lämplig parser
 */
export async function parseCV(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  
  if (!fileExt) {
    throw new Error('Kunde inte bestämma filformat');
  }
  
  if (fileExt === 'pdf') {
    const pdfData = new Uint8Array(await file.arrayBuffer());
    return extractTextFromPdf(pdfData);
  } else if (fileExt === 'docx') {
    const buffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(value || 'Kunde inte extrahera text från DOCX');
  } else if (fileExt === 'txt') {
    return await file.text(); // Läs som vanlig text
  } else {
    throw new Error('Filformatet stöds inte. Vänligen använd PDF, DOCX eller TXT-filer.');
  }
}

/**
 * Avancerad PDF-textextrahering optimerad för CV och dokumentformat
 */
export async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
  try {
    const pdfDoc = await getDocument({ data: pdfData }).promise;
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
      let lastY = null;
      
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
        let lastItem = null;
        
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
      
  } catch (error) {
    console.error('⚠️ PDF-extrahering misslyckades:', error);
    return 'Misslyckades med att läsa PDF';
  }
}