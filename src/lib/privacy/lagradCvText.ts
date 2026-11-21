// src/lib/privacy/lagradCvText.ts
//
// Maskeringen av CV-texten som sparas i cv_texts.cv_text. Samma funktion
// används vid uppladdningen (api/cv/upload) och när ett förbättrat CV ersätter
// det gamla på plats (api/cv/save-improved, lage 'ersatt'), så att kolumnen
// har samma form oavsett hur CV:t kom dit. Kontaktuppgifterna för arket och
// nedladdningen läses ur den strukturerade datan, aldrig ur den här texten.
//
// Flyttad oförändrad från upload-rutten (stripPii) 2026-11-21.

/** CV-texten med e-post, telefon, gatuadress, postnummer, personnummer och webbadresser maskade. */
export function maskaLagradCvText(text: string): string {
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/(\+46|0046|0)[\s-]?7[\s-]?\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '[TEL]')
    .replace(/\+\d{1,3}[\s-]?\d{6,14}/g, '[TEL]')
    .replace(/\b[A-ZÅÄÖ][a-zåäö]+(?:gatan|vägen|stigen|gränden|torget|platsen)\s+\d+[A-Za-z]?\b/g, '[ADRESS]')
    .replace(/\b\d{3}\s?\d{2}\b/g, '[POSTNR]')
    .replace(/\b\d{6}[-\s]?\d{4}\b/g, '[PERSNR]')
    .replace(/https?:\/\/[^\s]+/g, '[URL]');
}

/** Texten med blanktecken normaliserade, för att jämföra två CV-texter på innehåll. */
export function normaliseraForJamforelse(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** Har två lagrade CV-texter samma innehåll (blanktecken normaliserade)? */
export function sammaCvInnehall(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = normaliseraForJamforelse(a);
  return na.length > 0 && na === normaliseraForJamforelse(b);
}
