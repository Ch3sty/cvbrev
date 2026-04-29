import { cleanExtractedText } from './text-utils';

/**
 * Kastas när pdf-parse extraherar för lite text för att vara meningsfullt.
 * Typiskt fall: skannad PDF, "Skriv ut till PDF" från macOS, PDF där text
 * är inbäddade som outlines/bilder.
 *
 * Upload-routen fångar detta och kör vision-fallback istället för att
 * blockera direkt.
 */
export class ImageBasedPdfError extends Error {
  readonly extractedLength: number;
  constructor(extractedLength: number) {
    super(`PDF innehåller endast ${extractedLength} tecken extraherbar text`);
    this.name = 'ImageBasedPdfError';
    this.extractedLength = extractedLength;
  }
}

// Dynamisk import för att undvika klientside-problem
async function getPdfParser() {
  if (typeof window === 'undefined') {
    try {
      const pdfParse = await import('pdf-parse');
      return pdfParse.default || pdfParse;
    } catch (error) {
      console.error('Failed to import pdf-parse:', error);
      return null;
    }
  }
  return null;
}

export async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
  const pdfParse = await getPdfParser();

  if (!pdfParse) {
    return 'PDF-texten kunde inte extraheras - inget serverside PDF-bibliotek tillgängligt.';
  }

  let result;
  try {
    result = await pdfParse(Buffer.from(pdfData), { max: 0 });
  } catch (error: any) {
    console.error('⚠️ PDF extraction failed:', error);
    return 'Misslyckades med att läsa PDF. Kontrollera att filen inte är lösenordsskyddad eller skadad.';
  }

  console.log(
    `📄 PDF text extraherad, längd: ${result.text.length}, sidor: ${result.numpages}`
  );

  // Om vi fick för lite text - PDF:en är troligen bildbaserad.
  // Kasta typed error så upload-routen kan trigga vision-fallback.
  if (!result.text || result.text.trim().length < 50) {
    throw new ImageBasedPdfError(result.text?.length || 0);
  }

  return cleanExtractedText(result.text);
}

// Fallback function when PDF parsing fails (icke-image-relaterat fel)
export async function extractTextFallback(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf') {
      return 'PDF-texten kunde inte extraheras direkt. Vänligen använd ett alternativt format om möjligt (DOCX/TXT).';
    } else {
      return await file.text();
    }
  } catch (error) {
    console.error('Fallback text extraction failed:', error);
    return 'Textextrahering misslyckades. Prova med en annan filtyp.';
  }
}
