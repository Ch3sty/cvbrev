// src/components/rum/rumMatning.ts
//
// Mätpunkterna för våg 1b (spec-rummen avsnitt 7): rum_oppnat och
// sokta_tjanster_oppnad. Dörrarna och sidomenyn markerar varifrån nästa
// navigering kommer; skalet skickar händelsen när rummet eller sidan väl
// bytts. Första vyn i en session är en landning, en navigering utan
// markering är en djuplänk (en länk i en vy, notis eller ett kort).

export type RumYta = 'dorr' | 'sidomeny' | 'djuplank' | 'landning'

let nastaYta: RumYta | null = null

/** Dörren eller sidomenyn trycktes: nästa rumsbyte kommer därifrån. */
export function markeraRumYta(yta: 'dorr' | 'sidomeny'): void {
  nastaYta = yta
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
