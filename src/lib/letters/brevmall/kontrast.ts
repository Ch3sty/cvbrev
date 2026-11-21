/** Kontrast enligt WCAG, för brevets färger (render.ts, word.ts, puts.ts). Klientsäker. */

/** Relativ luminans (WCAG) för en hexfärg. */
function luminans(hex: string): number {
  const s = hex.replace('#', '')
  const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Kontrasten mellan två färger, 1 till 21. */
export function kontrast(a: string, b: string): number {
  const [x, y] = [luminans(a), luminans(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
