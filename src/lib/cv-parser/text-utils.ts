// src/lib/cv-parser/text-utils.ts
/**
 * Cleans and normalizes extracted text with focus on CV format
 * Enhanced with more comprehensive text cleanup
 */
export function cleanExtractedText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    // Basic cleaning
    .replace(/\s+/g, ' ')              // Replace multiple spaces with a single space
    .replace(/\n+/g, '\n')             // Replace multiple newlines with a single newline
    
    // Specific handling for CV format
    .replace(/(\w)-\s+(\w)/g, '$1$2')  // Handle incorrect hyphenation within a line
    .replace(/(\w)\s+([,.:])/g, '$1$2') // Remove spaces before punctuation
    .replace(/\b([A-Za-z])\s+(\d+)\b/g, '$1$2') // Fix split code names (e.g., "ABT 06" becomes "ABT06")
    .replace(/(\w)\s+\-\s+(\w)/g, '$1-$2') // Fix split ranges (e.g., "2020 - 2024" becomes "2020-2024")
    
    // Format-specific corrections
    .replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, (match, p1, p2) => {
      // Keep spaces between names/titles
      if (/^(Senior|Junior|Chief|Head|Lead)/i.test(p1)) {
        return `${p1} ${p2}`;
      }
      return match;
    })
    
    // Enhanced cleaning for common PDF/OCR issues
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
    .replace(/[–—]/g, '-') // Normalize dashes
    .replace(/["''""]/g, '"') // Normalize quotes
    .replace(/\r\n|\r/g, '\n') // Normalize line endings
    
    // Additional CV-specific improvements
    .replace(/(\d{4})\s*-\s*(\d{4}|\w+)/g, '$1-$2') // Fix date ranges
    .replace(/(\w+@\w+)\s+(\.\w+)/g, '$1$2') // Fix split email addresses
    
    .trim(); // Remove spaces at the beginning and end
}

/**
 * Extracts potential key sections from a CV
 * This helps when generating personalized cover letters
 */
export function extractCVSections(text: string): Record<string, string> {
  // Don't process empty input
  if (!text || typeof text !== 'string') {
    return {};
  }
  
  const sections: Record<string, string> = {};
  
  // Common CV sections - both Swedish and English
  const sectionPatterns = [
    { key: 'education', pattern: /utbildning|education/i },
    { key: 'experience', pattern: /erfarenhet|arbetslivserfarenhet|experience|work experience/i },
    { key: 'skills', pattern: /kompetenser|färdigheter|kunskaper|skills|competencies/i },
    { key: 'languages', pattern: /språk|languages/i },
    { key: 'projects', pattern: /projekt|projects/i },
    { key: 'summary', pattern: /sammanfattning|profil|om mig|summary|profile|about me/i }
  ];
  
  // Split by common section header patterns
  const lines = text.split('\n');
  let currentSection = 'other';
  
  sections[currentSection] = '';
  
  for (const line of lines) {
    // Check if this line is a section header
    let isSectionHeader = false;
    
    for (const { key, pattern } of sectionPatterns) {
      if (pattern.test(line.toLowerCase()) && line.length < 50) {
        currentSection = key;
        sections[currentSection] = '';
        isSectionHeader = true;
        break;
      }
    }
    
    if (!isSectionHeader) {
      sections[currentSection] += line + '\n';
    }
  }
  
  // Clean up each section
  for (const key in sections) {
    sections[key] = sections[key].trim();
  }
  
  return sections;
}