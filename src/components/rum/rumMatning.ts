// src/components/rum/rumMatning.ts
//
// Mätpunkterna för våg 1b (spec-rummen avsnitt 7): rum_oppnat och
// sokta_tjanster_oppnad. Dörrarna, sidomenyn och lägesraden markerar
// varifrån nästa navigering kommer; skalet skickar händelsen när rummet
// eller sidan väl bytts. Första vyn i en session är en landning, en
// navigering utan markering är en djuplänk (en länk i en vy, notis eller
// ett kort).

export type RumYta = 'dorr' | 'sidomeny' | 'lagesrad' | 'djuplank' | 'landning'

let nastaYta: RumYta | null = null

/** Dörren, sidomenyn eller lägesraden trycktes: nästa sidbyte kommer därifrån. */
export function markeraRumYta(yta: 'dorr' | 'sidomeny' | 'lagesrad'): void {
  nastaYta = yta
}

/**
 * Ytan för navigeringen som pågår, utan att nollställa den. Hemvyns
 * traning_hem_visad läser den i sin effekt, som körs före skalets
 * (barnens effekter först), så lägesraden går att skilja ut
 * (beslut-hemvy 2026-10-11 punkt 1).
 */
export function kikaRumYta(): RumYta | null {
  return nastaYta
}

/** Ytan för den navigering som just skett, och nollställ markeringen. */
export function tagRumYta(forsta: boolean): RumYta {
  if (forsta) {
    nastaYta = null
    return 'landning'
  }
  const yta = nastaYta ?? 'djuplank'
  nastaYta = null
  return yta
}
