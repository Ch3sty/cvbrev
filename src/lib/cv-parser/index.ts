// index.ts
import { extractTextFromPdf } from './pdf-parser';
import { extractTextFromDocx } from './docx-parser';
import { cleanExtractedText } from './text-utils';

export { cleanExtractedText, extractTextFromPdf, extractTextFromDocx };

/**
 * Funktion som bestämmer vilket format CV-filen har och använder lämplig parser
 */
export async function parseCV(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  
  if (!fileExt) {
    throw new Error('Kunde inte bestämma filformat');
  }
  
  try {
    if (fileExt === 'pdf') {
      const pdfData = new Uint8Array(await file.arrayBuffer());
      return extractTextFromPdf(pdfData);
    } else if (fileExt === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      return extractTextFromDocx(arrayBuffer);
    } else if (fileExt === 'txt') {
      return await file.text(); // Läs som vanlig text
    } else {
      throw new Error('Filformatet stöds inte. Vänligen använd PDF, DOCX eller TXT-filer.');
    }
  } catch (error: any) {
    console.error(`Fel vid parsning av ${fileExt}-fil:`, error);
    return `Kunde inte läsa ${fileExt.toUpperCase()}-filen: ${error.message || 'Okänt fel'}`;
  }
}