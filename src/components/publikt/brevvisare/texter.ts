/**
 * Visarens fasta texter (byggnoten våg 2, "Fast och ur data"). Klientsäker,
 * några byte: allt som läses ur katalogen räknas på servern och kommer som
 * props.
 */
export const VISARE_TEXT = {
  kick: 'Samma brev i fem mallar',
  tillbaka: 'Visa exemplet igen',
  bytMall: 'Byt mall',
  grupp: 'Välj mall',
  mall: (namn: string) => `Mallen ${namn}`,
  skriv: 'Skriv ditt eget brev',
  /** Kommentarskortets textlänk medan visaren är öppen på exempelsidan. */
  skrivPaAnnons: 'Skriv brevet på din annons',
  lasSomText: 'Läs brevet som text',
  /** Iframens titel: "Personligt brev för projektledare i mallen Koppar". */
  arkTitel: (mall: string, yrke?: string) => `Personligt brev${yrke ? ` för ${yrke}` : ''} i mallen ${mall}`,
  laddar: 'Laddar mallarna…',
} as const
