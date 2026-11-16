/**
 * Räknar öppna dialoger (helskärmen, arken) på <html data-dialog="open">, så
 * att cookie-bannern (z 999) inte lägger sig över dem (UX 2026-11-16). Den
 * kommer tillbaka när sista dialogen stängs; samtycket går alltid att lämna.
 * Regeln står i globals.css.
 */
let oppna = 0

export function oppnaDialog(): () => void {
  oppna++
  document.documentElement.dataset.dialog = 'open'
  let stangd = false
  return () => {
    if (stangd) return
    stangd = true
    oppna = Math.max(0, oppna - 1)
    if (oppna === 0) delete document.documentElement.dataset.dialog
  }
}
