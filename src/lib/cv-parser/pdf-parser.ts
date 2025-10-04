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
 * Extract text from image-based PDF using OpenAI Vision API (OCR fallback)
 */
async function extractTextWithOCR(pdfData: Uint8Array): Promise<string> {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY not found - cannot perform OCR');
      return '';
    }

    // Convert PDF to base64
    const base64Pdf = Buffer.from(pdfData).toString('base64');

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du är en OCR-assistent. Extrahera ALL text från detta CV-dokument exakt som det står. Bevara all formatering, struktur och ordning. Inkludera personuppgifter, arbetslivserfarenhet, utbildning, färdigheter och allt annat innehåll.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrahera all text från detta CV. Var noggrann och bevara all information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI OCR failed:', error);
      return '';
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || '';

    return extractedText;
  } catch (error) {
    console.error('❌ OCR extraction error:', error);
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