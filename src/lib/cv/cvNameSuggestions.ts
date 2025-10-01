// src/lib/cv/cvNameSuggestions.ts
/**
 * Generates smart CV name suggestions in Swedish
 */

export function generateCVNameSuggestions(): string[] {
  const date = new Date().toLocaleDateString('sv-SE');
  const time = new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

  return [
    `Förbättrat CV - ${date}`,
    `Uppdaterat CV - ${date}`,
    `Optimerat CV - ${date}`,
    `ATS-anpassat CV - ${date}`,
    `CV (förbättrad version) - ${date} ${time}`
  ];
}
