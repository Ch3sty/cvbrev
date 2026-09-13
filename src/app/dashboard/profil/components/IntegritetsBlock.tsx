'use client'

/**
 * Förtroendeblocket om personuppgifter och AI.
 *
 * Invändningen kommer före ifyllandet, så löftet står som en statusrad i
 * positiv direkt under sidhuvudet: "Sparas separat, går aldrig till någon
 * AI". Hela förklaringen ligger i en panel längre ner, för den som vill
 * veta hur. Ingen varningsruta: en sådan hade fått löftet att läsa som en
 * risk vi försöker prata bort.
 *
 * Copyn är skriven på fältnivå: profilens uppgifter går aldrig till någon
 * modell, verifierat i letters/generate. Den påstår inte att ingen AI
 * någonsin ser ett namn, eftersom CV-parsningen skickar CV-texten som den är.
 */

import StatusRow from '@/components/shell/StatusRow'

export function IntegritetsRad() {
  return (
    <StatusRow tone="positive" showDot label="Integritet">
      Sparas separat, går aldrig till någon AI
    </StatusRow>
  )
}

export default function IntegritetsBlock() {
  return (
    <section id="integritet" className="scroll-mt-24 rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <h2 className="text-kort text-ink-1">Dina uppgifter går aldrig till någon AI</h2>
      <p className="mt-2 text-sm leading-[22px] text-ink-2">
        Namn, e-post, telefon, ort och foto sparas för sig, skilt från dina CV:n och brev. Innan
        något skickas till en AI byter vi ut personuppgifterna mot platshållare, så den ser att du
        har ett telefonnummer men aldrig vilket. Namnet och kontaktraderna sätts in i det färdiga
        dokumentet efteråt, av vår egen kod. Du ändrar eller raderar uppgifterna när du vill.
      </p>
    </section>
  )
}
