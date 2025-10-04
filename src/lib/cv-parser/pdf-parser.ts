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

    // Använd pdf-parse för att extrahera text med förbättrade inställningar
    const result = await pdfParse(Buffer.from(pdfData), {
      // Försök extrahera text från alla tillgängliga källor
      max: 0, // Process all pages (0 = no limit)
      version: 'v2.0.550', // Use specific version if needed
    });

    console.log(`📄 PDF text extraherad, längd: ${result.text.length}, sidor: ${result.numpages}`);

    // Om vi fick för lite text (< 50 tecken) - PDF:en är troligen bildbaserad
    if (!result.text || result.text.trim().length < 50) {
      console.warn(`⚠️ PDF contains very little extractable text (${result.text?.length || 0} chars). Likely image-based PDF - trying OCR fallback...`);

      // Try OCR with OpenAI Vision API
      const ocrText = await extractTextWithOCR(pdfData);
      if (ocrText && ocrText.length > 50) {
        console.log(`✅ OCR extraction successful: ${ocrText.length} chars`);
        return cleanExtractedText(ocrText);
      }

      return "PDF-filen verkar sakna läsbar text. Detta kan bero på att PDF:en innehåller text som bilder. Vänligen exportera PDF:en på nytt från ursprungskällan (t.ex. Word) eller använd en textbaserad PDF.";
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
 * Enhanced PDF text extraction using pdf2json
 * Alternative parser that works better with some PDF formats
 */
async function extractTextWithOCR(pdfData: Uint8Array): Promise<string> {
  try {
    console.log('🔄 Attempting enhanced PDF text extraction with pdf2json...');

    const PDFParser = (await import('pdf2json')).default;

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('❌ pdf2json parsing error:', errData.parserError);
        resolve('');
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          let fullText = '';

          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const text of page.Texts) {
                  if (text.R) {
                    for (const run of text.R) {
                      if (run.T) {
                        // Decode URI-encoded text
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                fullText += '\n\n';
              }
            }
          }

          const trimmedText = fullText.trim();
          console.log(`📄 pdf2json extracted ${trimmedText.length} chars`);

          if (trimmedText.length > 50) {
            console.log('✅ pdf2json extraction successful');
            resolve(trimmedText);
          } else {
            console.warn('⚠️ pdf2json still yielded insufficient text');
            resolve('');
          }
        } catch (error) {
          console.error('❌ Error processing pdf2json data:', error);
          resolve('');
        }
      });

      // Parse the PDF data
      pdfParser.parseBuffer(Buffer.from(pdfData));
    });

  } catch (error) {
    console.error('❌ pdf2json import/setup error:', error);
    return '';
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