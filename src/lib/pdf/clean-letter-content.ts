// src/lib/pdf/clean-letter-content.ts
// Utility för att rensa dubblerat innehåll från användargenererade brev

import { LetterMetadata } from './letter-templates';

/**
 * Rensar dubblerat innehåll från användarens brevtext för att undvika
 * överlappning med mallens automatiska formatering
 */
export function cleanLetterContent(content: string, metadata: LetterMetadata): string {
  if (!content) return content;
  
  let cleanedContent = content.trim();
  
  // Rensa början av innehållet
  cleanedContent = removeHeaderDuplicates(cleanedContent, metadata);
  
  // Rensa slutet av innehållet  
  cleanedContent = removeFooterDuplicates(cleanedContent, metadata);
  
  return cleanedContent.trim();
}

/**
 * Ta bort dubbletter från början av innehållet
 */
function removeHeaderDuplicates(content: string, metadata: LetterMetadata): string {
  const lines = content.split('\n');
  let startIndex = 0;
  
  // Mönster att leta efter i början
  const headerPatterns = [
    // Titlar och rubriker
    /^(personligt\s+brev|ansökningsbrev|ansökan|brev)/i,
    /^(ansökan\s*(till|om)\s*(tjänsten\s+som)?)/i,
    /^(angående|avseende|gällande)/i,
    
    // Datum i olika format
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{1,2}\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\s+\d{4}$/i,
    /^\d{1,2}\/\d{1,2}[-\/]\d{2,4}$/,
    
    // Namn (om det matchar metadata.author)
    new RegExp(`^${escapeRegex(metadata.author || '')}$`, 'i'),
    
    // E-post
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // Telefon
    /^(\+46|0)[\d\s-]{8,15}$/,
    
    // Företagsnamn (om det matchar metadata.company)
    ...(metadata.company ? [new RegExp(`^${escapeRegex(metadata.company)}$`, 'i')] : []),
    
    // Tjänstetitel (om den matchar metadata.position)
    ...(metadata.position ? [new RegExp(`^(ansökan:?\\s*)?${escapeRegex(metadata.position)}$`, 'i')] : []),
  ];
  
  // Hitta första raden som INTE matchar något header-mönster
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skippa tomma rader
    if (!line) {
      startIndex = i + 1;
      continue;
    }
    
    // Kolla om raden matchar något header-mönster
    const matchesPattern = headerPatterns.some(pattern => pattern.test(line));
    
    if (!matchesPattern) {
      // Första raden som inte matchar ett header-mönster
      startIndex = i;
      break;
    } else {
      startIndex = i + 1;
    }
  }
  
  return lines.slice(startIndex).join('\n');
}

/**
 * Ta bort dubbletter från slutet av innehållet
 */
function removeFooterDuplicates(content: string, metadata: LetterMetadata): string {
  const lines = content.split('\n');
  let endIndex = lines.length;
  
  // Mönster att leta efter i slutet
  const footerPatterns = [
    // Avslutningsfraser
    /^(med\s+)?vänliga\s+hälsningar,?$/i,
    /^mvh,?$/i,
    /^hälsningar,?$/i,
    /^med\s+vänlig\s+hälsning,?$/i,
    /^tack\s+(på\s+förhand|i\s+förväg),?$/i,
    
    // Namn (om det matchar metadata.author)
    new RegExp(`^${escapeRegex(metadata.author || '')}$`, 'i'),
    
    // E-postsignatur mönster
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    // Telefon
    /^(\+46|0)[\d\s-]{8,15}$/,
  ];
  
  // Arbetar bakåt från slutet
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Skippa tomma rader från slutet
    if (!line) {
      endIndex = i;
      continue;
    }
    
    // Kolla om raden matchar något footer-mönster
    const matchesPattern = footerPatterns.some(pattern => pattern.test(line));
    
    if (!matchesPattern) {
      // Första raden (bakåt) som inte matchar ett footer-mönster
      endIndex = i + 1;
      break;
    } else {
      endIndex = i;
    }
  }
  
  return lines.slice(0, endIndex).join('\n');
}

/**
 * Escapa specialtecken för regex
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}