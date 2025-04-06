// src/global.d.ts

declare global {
  interface Window {
    // Deklarerar att 'gtag' kan finnas på window och är en funktion.
    // Vi specificerar en grundläggande funktionssignatur.
    // '?' gör den valfri, eftersom den inte finns innan skriptet laddats.
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any> | { page_path?: string; send_page_view?: boolean }
    ) => void;

    // Det är också bra att deklarera dataLayer om du använder det direkt någonstans
    dataLayer?: any[];
  }
}

// Denna tomma export gör filen till en modul, vilket hjälper TypeScript
// att korrekt känna igen de globala deklarationerna.
export {};