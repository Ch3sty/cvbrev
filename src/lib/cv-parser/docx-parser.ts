// src/lib/cv-parser/docx-parser.ts
// We need to handle browser vs. Node.js environments
let mammoth: any = null;

/**
 * Dynamically loads mammoth.js
 */
async function loadMammoth() {
  if (mammoth) return mammoth;
  
  try {
    mammoth = await import('mammoth');
    return mammoth;
  } catch (error) {
    console.error('Failed to load mammoth.js:', error);
    return null;
  }
}

/**
 * Extracts text from DOCX files with improved error handling
 */
export async function extractTextFromDocx(fileArrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Load mammoth dynamically
    const mammothLib = await loadMammoth();
    
    if (!mammothLib) {
      return 'Kunde inte ladda DOCX-parsningsbiblioteket. Vänligen försök med en annan filtyp.';
    }
    
    // Use mammoth with proper type handling
    const result = await mammothLib.extractRawText({ 
      arrayBuffer: fileArrayBuffer
    });
    
    const { value } = result;
    
    if (!value || value.trim() === '') {
      return 'Kunde inte extrahera text från DOCX-filen (tom fil)';
    }
    
    // Clean and normalize extracted text
    return cleanDocxText(value);
  } catch (error) {
    console.error('⚠️ DOCX extraction failed:', error);
    return 'Misslyckades med att läsa DOCX-fil';
  }
}

/**
 * Clean and normalize text extracted from DOCX
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