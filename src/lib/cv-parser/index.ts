// src/lib/cv-parser/index.ts
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Funktion som bestämmer vilket format CV-filen har och använder lämplig parser
export async function parseCV(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  // Konvertera File till ArrayBuffer för bearbetning
  const arrayBuffer = await file.arrayBuffer();
  
  if (fileName.endsWith('.pdf') || fileType === 'application/pdf') {
    return parsePDF(arrayBuffer);
  } else if (
    fileName.endsWith('.docx') || 
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDocx(arrayBuffer);
  } else if (
    fileName.endsWith('.doc') || 
    fileType === 'application/msword'
  ) {
    // Äldre Word-filer kan vara svårare att parsa korrekt
    // Vi bör rekommendera användaren att konvertera till ett modernare format
    throw new Error('DOC-format stöds inte. Vänligen konvertera till DOCX eller PDF.');
  } else if (
    fileName.endsWith('.txt') || 
    fileType === 'text/plain'
  ) {
    return parseTxt(arrayBuffer);
  } else {
    throw new Error('Filformatet stöds inte. Vänligen använd PDF, DOCX eller TXT-filer.');
  }
}

// Funktion för att parsa PDF-filer
async function parsePDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Ladda PDF.js worker
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    
    // Ladda dokumentet
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let textContent = '';
    
    // Extrahera text från varje sida
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      textContent += strings.join(' ') + '\n';
    }
    
    return cleanupText(textContent);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Kunde inte parsa PDF-filen. Kontrollera om filen är skadad eller lösenordsskyddad.');
  }
}

// Funktion för att parsa DOCX-filer
async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return cleanupText(result.value);
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Kunde inte parsa DOCX-filen. Kontrollera om filen är skadad.');
  }
}

// Funktion för att parsa TXT-filer
async function parseTxt(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);
    return cleanupText(text);
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Kunde inte parsa TXT-filen. Kontrollera filens teckenkodning.');
  }
}

// Hjälpfunktion för att rensa upp extraherad text
function cleanupText(text: string): string {
  return text
    .replace(/\s+/g, ' ')        // Ersätt flera mellanslag, tabbar och radbrytningar med ett mellanslag
    .replace(/\n\s*\n/g, '\n')   // Ersätt tomma rader med en enda radbrytning
    .trim();                     // Ta bort inledande och avslutande whitespace
}