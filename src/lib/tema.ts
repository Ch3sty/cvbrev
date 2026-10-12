// src/lib/tema.ts
//
// Utseendet: Följer systemet, Ljust, Mörkt (spec-rummen 4.3 och 6, våg 1b;
// skiss-installningar-2026-10-12). Delas av segmentet i avatarmenyn och
// sektionen Utseende på Inställningar, genom useTema.
//
// Valet sparas i localStorage.tema på den här enheten, utan serverlagring,
// och slår igenom direkt: attributet data-theme på <html> sätts eller tas
// bort. Skriptet i rotlayoutens <head> läser samma nyckel före hydrering,
// så nästa sidladdning står i rätt läge från första bilden. Ändras nyckeln
// här måste skriptet i src/app/layout.tsx ändras i samma commit.
//
// Klientsäker: rör bara window och document när funktionerna anropas.

export type Tema = 'system' | 'ljust' | 'morkt'

export const TEMAN: readonly Tema[] = ['system', 'ljust', 'morkt']

/** Nyckeln i localStorage. Samma som rotlayoutens skript läser. */
export const TEMA_NYCKEL = 'tema'

/** Händelsen på window när valet ändrats, så att menyn och sidan följs åt. */
export const TEMA_HANDELSE = 'jc-tema'

export function lasTema(): Tema {
  try {
    const t = window.localStorage.getItem(TEMA_NYCKEL)
    return t === 'ljust' || t === 'morkt' ? t : 'system'
  } catch {
    return 'system'
  }
}

/** Sätter eller tar bort data-theme på <html>. */
export function tillampaTema(tema: Tema): void {
  const rot = document.documentElement
  if (tema === 'ljust') rot.dataset.theme = 'light'
  else if (tema === 'morkt') rot.dataset.theme = 'dark'
  else delete rot.dataset.theme
}

/** Sparar valet, slår igenom direkt och säger till andra lyssnare på sidan. */
export function sparaTema(tema: Tema): void {
  try {
    if (tema === 'system') window.localStorage.removeItem(TEMA_NYCKEL)
    else window.localStorage.setItem(TEMA_NYCKEL, tema)
  } catch {
    // Privat läge: valet gäller den här sidvisningen.
  }
  tillampaTema(tema)
  window.dispatchEvent(new CustomEvent<Tema>(TEMA_HANDELSE, { detail: tema }))
}
