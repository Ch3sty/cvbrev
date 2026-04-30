/**
 * Delar upp en passage-text i läsbara stycken.
 *
 * Strategi:
 * - Om texten redan har dubbla radbrytningar (`\n\n`) → respektera dem
 * - Annars: dela på meningsslut (.!?) och gruppera ~3 meningar per stycke
 *   för naturlig läsrytm. Sista stycket slås ihop med föregående om det
 *   bara är 1 mening (undviker "orphans").
 */
export function splitIntoParagraphs(text: string): string[] {
  if (text.includes('\n\n')) {
    return text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  const sentences = text.match(/[^.!?]+[.!?]+["']?\s*/g) || [text];
  const trimmed = sentences.map((s) => s.trim()).filter((s) => s.length > 0);

  if (trimmed.length <= 3) return [trimmed.join(' ')];

  const paragraphs: string[] = [];
  const sentencesPerPara = 3;
  for (let i = 0; i < trimmed.length; i += sentencesPerPara) {
    const chunk = trimmed.slice(i, i + sentencesPerPara);
    if (chunk.length === 1 && paragraphs.length > 0) {
      paragraphs[paragraphs.length - 1] += ' ' + chunk[0];
    } else {
      paragraphs.push(chunk.join(' '));
    }
  }
  return paragraphs;
}
