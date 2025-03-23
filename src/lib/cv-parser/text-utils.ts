/**
 * Städar och normaliserar extraherad text med fokus på CV-format
 */
export function cleanExtractedText(text: string): string {
  return text
    // Grundläggande rengöring
    .replace(/\s+/g, ' ')              // Ersätt flera mellanslag med ett
    .replace(/\n+/g, '\n')             // Ersätt flera radbrytningar med en
    
    // Specifik hantering för CV-format
    .replace(/(\w)-\s+(\w)/g, '$1$2')  // Hantera felaktiga avstavningar inom en rad
    .replace(/(\w)\s+([,.:])/g, '$1$2') // Ta bort mellanslag före skiljetecken
    .replace(/\b([A-Za-z])\s+(\d+)\b/g, '$1$2') // Fixa uppdelade kodnamn (t.ex. "ABT 06" blir "ABT06")
    .replace(/(\w)\s+\-\s+(\w)/g, '$1-$2') // Fixa uppdelade intervall (t.ex. "2020 - 2024" blir "2020-2024")
    
    // Formatspecifika korrigeringar
    .replace(/([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, (match, p1, p2) => {
      // Behåll mellanslag mellan namn/titlar
      if (/^(Senior|Junior|Chief|Head|Lead)/i.test(p1)) {
        return `${p1} ${p2}`;
      }
      return match;
    })
    
    .trim(); // Ta bort mellanslag i början och slutet
}