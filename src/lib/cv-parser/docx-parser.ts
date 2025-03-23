// src/lib/cv-parser/docx-parser.ts
import mammoth from 'mammoth';
import { cleanExtractedText } from './text-utils';

/**
 * Extraherar text från DOCX-filer
 */
export async function extractTextFromDocx(fileArrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Använd mammoth med rätt typhantering
    const result = await mammoth.extractRawText({ 
      arrayBuffer: fileArrayBuffer as any // Type assertion för att undvika typfel
    });
    
    const { value } = result;
    
    if (!value || value.trim() === '') {
      return 'Kunde inte extrahera text från DOCX-filen (tom fil)';
    }
    
    // Rengör och normalisera extraherad text
    return cleanExtractedText(value);
  } catch (error) {
    console.error('⚠️ DOCX-extrahering misslyckades:', error);
    return 'Misslyckades med att läsa DOCX-fil';
  }
}