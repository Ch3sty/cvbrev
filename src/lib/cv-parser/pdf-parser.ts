import { cleanExtractedText } from './text-utils';

// Dynamisk import för att undvika klientside-problem
async function getPdfParser() {
  // Kontrollera om vi är på serversidan
  if (typeof window === 'undefined') {
    // Serverside: använd pdf-parse
    try {
      const pdfParse = await import('pdf-parse');
      return pdfParse.default || pdfParse;
    } catch (error) {
      console.error('Failed to import pdf-parse:', error);
      return null;
    }
  }
  // Klientside: returnera null
  return null;
}

export async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
  try {
    // Få pdf-parser om vi är på serversidan
    const pdfParse = await getPdfParser();
    
    if (!pdfParse) {
      return "PDF-texten kunde inte extraheras - inget serverside PDF-bibliotek tillgängligt.";
    }
    
    // Använd pdf-parse för att extrahera text
    const result = await pdfParse(Buffer.from(pdfData));
    
    console.log(`📄 PDF text extraherad, längd: ${result.text.length}, sidor: ${result.numpages}`);
    
    if (!result.text || result.text.trim() === '') {
      return "PDF-filen verkar sakna läsbar text eller sidor.";
    }
    
    // Använd befintlig rengöringsfunktion
    const cleanedText = cleanExtractedText(result.text);
    return cleanedText;
      
  } catch (error: any) {
    console.error('⚠️ PDF extraction failed:', error);
    return 'Misslyckades med att läsa PDF. Kontrollera att filen inte är lösenordsskyddad eller skadad.';
  }
}

/**
 * Clean and normalize the extracted PDF text
 */
function cleanPdfText(text: string): string {
  return text
    // Fix hyphenation and line breaks
    .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Normalize newlines
    .replace(/\n{3,}/g, '\n\n')
    // Fix spacing around punctuation
    .replace(/\s+([.,;:!?)])/g, '$1')
    // Fix spacing for opening brackets/parentheses
    .replace(/([([])\s+/g, '$1')
    // Ensure space after periods and commas (except in numbers)
    .replace(/([.,;:!?)])(?=\w)/g, '$1 ')
    // Fix common OCR/PDF text issues
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .trim();
}

// Fallback function when PDF parsing fails
export async function extractTextFallback(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf') {
      return "PDF-texten kunde inte extraheras direkt. Vänligen använd ett alternativt format om möjligt (DOCX/TXT).";
    } else {
      return await file.text();
    }
  } catch (error) {
    console.error('Fallback text extraction failed:', error);
    return "Textextrahering misslyckades. Prova med en annan filtyp.";
  }
}