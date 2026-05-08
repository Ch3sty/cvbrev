/**
 * preview-utils.ts
 *
 * Delade utilities for CV-preview-rendering.
 * Anvands av bade /artiklar (InteractiveCVShowcase) och /dashboard/cv-mallar
 * for konsistent font-hantering och HTML-injection.
 */

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'ATS-Säkra' | 'Moderna' | 'Formella' | 'Premium';
  tier: 'free' | 'premium';
}

export const FONTS: FontOption[] = [
  // ATS-saakra (mest kompatibla, visar pa alla system)
  { id: 'calibri', name: 'Calibri', family: 'Calibri, Arial, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'arial', name: 'Arial', family: 'Arial, Helvetica, sans-serif', category: 'ATS-Säkra', tier: 'free' },
  { id: 'verdana', name: 'Verdana', family: 'Verdana, Geneva, sans-serif', category: 'ATS-Säkra', tier: 'free' },

  // Moderna (sans-serif med karaktar)
  { id: 'lato', name: 'Lato', family: "'Lato', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', Arial, sans-serif", category: 'Moderna', tier: 'free' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', Arial, sans-serif", category: 'Moderna', tier: 'free' },

  // Formella (serif, klassisk)
  { id: 'georgia', name: 'Georgia', family: 'Georgia, Times, serif', category: 'Formella', tier: 'free' },
  { id: 'garamond', name: 'Garamond', family: 'Garamond, Georgia, serif', category: 'Formella', tier: 'free' },
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'Formella', tier: 'free' },

  // Premium
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'Premium', tier: 'premium' },
];

export const DEFAULT_FONT_ID = 'calibri';

/**
 * Hitta en font via ID. Returnerar default-font om ingen match.
 */
export function getFontById(id: string): FontOption {
  return FONTS.find(f => f.id === id) || FONTS[0];
}

/**
 * Injecta en CSS-regel i en HTML-strang som overrider font-family for hela body.
 * Anvands for att applicera anvandarvalt typsnitt pa en mall som har sitt eget default.
 *
 * Mallarna borjar med <style>...</style> i <head>, vi injectar overrride-regel
 * direkt efter <style>-taggen sa den vinner specificity-striden.
 */
export function injectFontIntoHTML(html: string, fontFamily: string): string {
  if (!fontFamily) return html;
  return html.replace(
    /<style>/,
    `<style>\n  body, body * { font-family: ${fontFamily} !important; }\n  `
  );
}

/**
 * Gruppera FONTS efter kategori for dropdown-rendering.
 */
export function getFontsGroupedByCategory(): Record<FontOption['category'], FontOption[]> {
  const groups: Record<string, FontOption[]> = {};
  for (const font of FONTS) {
    if (!groups[font.category]) groups[font.category] = [];
    groups[font.category].push(font);
  }
  return groups as Record<FontOption['category'], FontOption[]>;
}
