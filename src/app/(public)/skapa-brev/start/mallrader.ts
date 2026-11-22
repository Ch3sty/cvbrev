/**
 * Mallraderna i startflödet för brev (klicktestet på live 2026-11-22, F2).
 *
 * Visarens namnrad ("Gratis, även som Word.") är låst av SEO på
 * exempelsidorna och i artiklarna och rörs inte. Här, på spärrens skärm,
 * sade den emot raden "Nedladdning som PDF och Word ingår i Premium". Sant
 * enligt produkten: gratismallarna är gratis att skriva och spara brevet i,
 * och att ladda ner brevet ingår i Premium oavsett mall (letters/download).
 * Startflödet är noindex, så raderna här är fria.
 */
import { namnradMening } from '@/components/publikt/brevvisare/visare-data'

/** Raden efter mallens namn: i panelen, under arket och i väljarens fot. */
export function startMallRad(gratis: boolean, word: boolean, premium: string): string {
  if (!gratis) return namnradMening(false, word)
  return `Gratis att skriva och spara brevet i. Nedladdning${word ? ' som PDF och Word' : ''} ingår i ${premium}.`
}

/** Raden överst i väljaren med alla mallar. */
export function startValjareRad(gratisNamn: string, premiumAntal: number, premium: string): string {
  return `${gratisNamn} är gratis att skriva och spara brev i. De övriga ${premiumAntal} ingår i ${premium}, och du provar dem med ditt eget brev. Nedladdningen ingår i ${premium} i alla mallar.`
}
