/**
 * Antal med rätt böjning: "1 förbättring", "2 förbättringar". Talet står
 * som siffra (instrument och räknare); i löpande mening till och med tolv
 * används talord ur copy.ts. Singularformen skickas med eftersom svenska
 * plural inte går att härleda ("roll" och "roller", "CV" och "CV").
 */
export function antal(n: number, en: string, flera: string): string {
  return `${n} ${n === 1 ? en : flera}`
}
