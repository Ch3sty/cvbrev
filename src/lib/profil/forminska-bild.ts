/**
 * Klientförminskning av profilfoton (docs/design/profil-registrering-spec-2026-09-24.md,
 * Del A, beslut 5): längsta sidan 800 px, JPEG 0,85, före uppladdning.
 * Mobilkameror ger 3 till 6 MB; efter förminskningen är ett porträtt runt
 * 100 kB, långt under 2 MB-gränsen. 800 px räcker för mallarnas fotoruta.
 *
 * createImageBitmap med imageOrientation 'from-image' respekterar
 * EXIF-orienteringen, så ett porträtt från telefonen blir inte liggande.
 * Saknas canvas eller createImageBitmap (gamla webbläsare) returneras
 * originalfilen, och servern avgör som förut.
 */

/** Målstorleken för en bild, med längsta sidan högst langstaSida. Aldrig uppskalning. */
export function malStorlek(bredd: number, hojd: number, langstaSida = 800): { bredd: number; hojd: number } {
  const langst = Math.max(bredd, hojd)
  if (langst <= langstaSida || langst === 0) return { bredd, hojd }
  const skala = langstaSida / langst
  return { bredd: Math.max(1, Math.round(bredd * skala)), hojd: Math.max(1, Math.round(hojd * skala)) }
}

/** Filen går inte att avkoda som bild. Uppladdningen visar "Filen går inte att läsa". */
export class OlasbarBild extends Error {
  constructor() {
    super('olasbar_bild')
    this.name = 'OlasbarBild'
  }
}

export async function forminskaBild(fil: File, langstaSida = 800, kvalitet = 0.85): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return fil

  let bild: ImageBitmap
  try {
    bild = await createImageBitmap(fil, { imageOrientation: 'from-image' })
  } catch {
    throw new OlasbarBild()
  }

  try {
    const mal = malStorlek(bild.width, bild.height, langstaSida)
    // Liten nog redan och inte större än den blir som JPEG: skicka originalet
    // (en PNG med genomskinlighet får behålla den).
    if (mal.bredd === bild.width && mal.hojd === bild.height && fil.size <= 2 * 1024 * 1024) return fil

    const canvas = document.createElement('canvas')
    canvas.width = mal.bredd
    canvas.height = mal.hojd
    const ctx = canvas.getContext('2d')
    if (!ctx || typeof canvas.toBlob !== 'function') return fil
    // Vit botten under genomskinliga PNG:er: JPEG har ingen alfa.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, mal.bredd, mal.hojd)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bild, 0, 0, mal.bredd, mal.hojd)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', kvalitet))
    return blob ?? fil
  } finally {
    bild.close?.()
  }
}
