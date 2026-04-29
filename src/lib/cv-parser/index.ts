// src/lib/cv-parser/index.ts
import { extractTextFromPdf, extractTextFallback, ImageBasedPdfError } from './pdf-parser';
import { extractTextFromDocx } from './docx-parser';
import { cleanExtractedText } from './text-utils';
export { cleanExtractedText, extractTextFromPdf, extractTextFromDocx, ImageBasedPdfError };

/**
 * Parse CV file based on its format
 * With improved error handling and fallback mechanisms.
 *
 * Kastar `ImageBasedPdfError` om PDF:en innehåller för lite text för att
 * vara användbar — upload-routen fångar detta och triggar vision-fallback.
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
      try {
        return await extractTextFromPdf(pdfData);
      } catch (pdfError) {
        // Image-baserad PDF ska propageras hela vägen upp till routen
        if (pdfError instanceof ImageBasedPdfError) {
          throw pdfError;
        }
        console.error('Primary PDF parsing failed, trying fallback:', pdfError);
        return await extractTextFallback(file);
      }
    } else if (fileExt === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      return await extractTextFromDocx(arrayBuffer);
    } else if (fileExt === 'txt') {
      return await file.text();
    } else {
      throw new Error('Filformatet stöds inte. Vänligen använd PDF, DOCX eller TXT-filer.');
    }
  } catch (error: any) {
    if (error instanceof ImageBasedPdfError) throw error;
    console.error(`Error parsing ${fileExt}-file:`, error);
    return `Kunde inte läsa ${fileExt.toUpperCase()}-filen: ${error.message || 'Okänt fel'}`;
  }
}

/**
 * Creates a simplified text representation when full parsing fails
 * This ensures we always have some text to work with
 */
export function createPlaceholderText(file: File): string {
  return `Filnamn: ${file.name}
Filstorlek: ${Math.round(file.size / 1024)} KB
Filtyp: ${file.type}
Uppladdad: ${new Date().toLocaleString('sv-SE')}
CV-innehåll kunde inte extraheras fullständigt.
Denna text är en platshållare för att möjliggöra generering av personliga brev.
Vänligen fyll i viktig information om din bakgrund manuellt vid behov.`;
}