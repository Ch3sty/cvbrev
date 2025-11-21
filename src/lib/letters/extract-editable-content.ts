// src/lib/letters/extract-editable-content.ts
// Utility för att extrahera redigerbar text från template HTML

/**
 * Extraherar endast den redigerbara texten (body-content) från template HTML
 * för att användaren ska kunna redigera brevtexten utan att se HTML-kod
 */
export function extractEditableContent(html: string): string {
  // Kolla om det är template HTML
  if (!html.includes('<!DOCTYPE') && !html.includes('<style')) {
    // Legacy plain text - returnera som det är
    return html;
  }

  // Extrahera body-content div
  const bodyMatch = html.match(/<div class="body-content">([\s\S]*?)<\/div>/);

  if (bodyMatch) {
    // Konvertera <p> taggar till paragrafer separerade med dubbla radbrytningar
    return bodyMatch[1]
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<[^>]*>/g, '') // Ta bort övriga HTML-taggar
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Fallback: Försök extrahera all text från body
  const bodyTagMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  if (bodyTagMatch) {
    // Ta bort alla HTML-taggar och konvertera till ren text
    return bodyTagMatch[1]
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Ta bort style-taggar
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Ta bort script-taggar
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n') // Max 2 radbrytningar i rad
      .trim();
  }

  // Om inget matchar, returnera original
  return html;
}

/**
 * Kollar om innehållet är template HTML
 */
export function isTemplateHTML(content: string): boolean {
  return content.includes('<div') || content.includes('<style');
}
