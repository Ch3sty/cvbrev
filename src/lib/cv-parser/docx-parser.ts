// src/lib/cv-parser/docx-parser.ts
import { Buffer } from 'buffer'; // Importera Buffer för Node.js-miljön

// We need to handle browser vs. Node.js environments
let mammoth: any = null;

/**
 * Dynamically loads mammoth.js
 * Handles potential default export issues.
 */
async function loadMammoth() {
  if (mammoth) return mammoth;

  try {
    const mammothModule = await import('mammoth');
    // Handle cases where the default export is needed (common with CJS/ESM interop)
    mammoth = mammothModule.default || mammothModule;
    console.log('Mammoth.js loaded successfully.'); // Lägg till loggning
    return mammoth;
  } catch (error) {
    console.error('Failed to load mammoth.js:', error);
    return null;
  }
}

/**
 * Extracts text from DOCX files with improved error handling
 * Adapted for server-side (Node.js) execution by using Buffer.
 */
export async function extractTextFromDocx(fileArrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Load mammoth dynamically
    const mammothLib = await loadMammoth();

    if (!mammothLib) {
      return 'Kunde inte ladda DOCX-parsningsbiblioteket. Vänligen försök med en annan filtyp.';
    }

    // --- NYCKELÄNDRING: Konvertera ArrayBuffer till Node.js Buffer ---
    // Eftersom detta körs på servern (Node.js) via API-routen,
    // är det säkrare att använda Buffer som Mammoth förväntar sig i detta kontext.
    const fileBuffer = Buffer.from(fileArrayBuffer);
    // --- SLUT PÅ ÄNDRING ---

    // Use mammoth with proper type handling - använd 'buffer' istället för 'arrayBuffer'
    console.log('Attempting DOCX text extraction using mammoth with Buffer...'); // Lägg till loggning
    const result = await mammothLib.extractRawText({
      buffer: fileBuffer // Skicka Node.js Buffer
    });

    const { value, messages } = result; // Hämta även eventuella meddelanden/varningar från mammoth

    if (messages && messages.length > 0) {
        console.warn('⚠️ Mammoth messages during DOCX extraction:', messages);
    }

    if (!value || value.trim() === '') {
      // Ge lite mer kontext om varför texten kan vara tom
      console.warn('⚠️ DOCX extraction resulted in empty text. File might be empty, password-protected, corrupted, or contain only images/unsupported elements.');
      return 'Kunde inte extrahera text från DOCX-filen (tom eller oläsbar fil)';
    }

    console.log(`📄 DOCX text extracted successfully, length: ${value.length}`); // Logga framgång

    // Clean and normalize extracted text
    return cleanDocxText(value);

  } catch (error: any) {
    // Försök logga mer specifika fel från Mammoth om möjligt
    console.error('⚠️ DOCX extraction failed:', error.message || error);
    // Logga stack trace för djupare felsökning
    if (error.stack) {
        console.error('Stack trace:', error.stack);
    }
    // Returnera ett användarvänligt meddelande
    return 'Misslyckades med att läsa DOCX-fil. Kontrollera att filen inte är skadad eller lösenordsskyddad.';
  }
}

/**
 * Clean and normalize text extracted from DOCX
 * (Inga ändringar här jämfört med din originalkod)
 */
function cleanDocxText(text: string): string {
  return text
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    // Replace multiple newlines with a single newline
    .replace(/\n+/g, '\n')

    // Fix common DOCX formatting issues
    .replace(/(\w)-\s+(\w)/g, '$1$2')  // Fix hyphenation within a line
    .replace(/(\w)\s+([,.:])/g, '$1$2') // Remove spaces before punctuation
    .replace(/\b([A-Za-z])\s+(\d+)\b/g, '$1$2') // Fix split code names (e.g., "ABT 06" becomes "ABT06")
    .replace(/(\w)\s+\-\s+(\w)/g, '$1-$2') // Fix split ranges (e.g., "2020 - 2024" becomes "2020-2024")

    // Specific format corrections
    .replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, (match, p1, p2) => {
      // Keep spaces between names/titles
      if (/^(Senior|Junior|Chief|Head|Lead)/i.test(p1)) {
        return `${p1} ${p2}`;
      }
      return match;
    })

    .trim(); // Remove spaces at the beginning and end
}