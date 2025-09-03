// src/lib/extractTOC.ts
// En hjälpfunktion för att extrahera TOC från markdown-innehåll på serversidan

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extraherar innehållsförteckning från markdown-innehåll
 * @param content Markdown-innehåll
 * @param maxLevel Max rubriknivå att inkludera (default: 3, dvs h2-h4)
 * @returns Array av TOCItem-objekt
 */
export function extractTOC(content: string, maxLevel: number = 3): TOCItem[] {
  if (!content) return [];

  const toc: TOCItem[] = [];
  const minLevel = 2; // Börja på h2

  // Regex för att matcha markdown-rubriker (# Rubrik)
  // Capture groups: (1) = antal #, (2) = rubriktext
  const regex = /^(#{2,6})\s+(.+)$/gm;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    
    // Skippa rubriker som är utanför vårt intervall
    if (level < minLevel || level > maxLevel) continue;
    
    const text = match[2].trim();
    
    // Skapa ID som skulle genereras av markdown-processorn
    // Detta är en förenklad version - markdownd-bibliotek har ofta mer komplexa algoritmer
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Ta bort special-tecken
      .replace(/\s+/g, '-')     // Ersätt mellanslag med bindestreck
      .replace(/--+/g, '-');    // Ta bort dubbla bindestreck
    
    toc.push({
      id,
      text,
      level
    });
  }
  
  return toc;
}

export default extractTOC;