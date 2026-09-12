'use client'

/**
 * Förtroendeblocket om personuppgifter och AI.
 *
 * Ligger överst, direkt under sidans ingress och före sektion ett, eftersom
 * invändningen kommer före ifyllandet: den som tvekar inför att lämna sitt
 * telefonnummer till en AI-tjänst tvekar när hon ser fältet, inte efteråt.
 *
 * Lugnt kort med border-neutral-200, ingen färgad bakgrund. En varningsruta
 * hade fått löftet att läsa som en risk vi försöker prata bort.
 *
 * Copyn är ordagrann från SaaS-specialistens underlag och är medvetet skriven
 * på fältnivå: profilens uppgifter går aldrig till någon modell, vilket är
 * verifierat i letters/generate. Den påstår inte att ingen AI någonsin ser ett
 * namn, eftersom CV-parsningen och CV-analysen skickar CV-texten som den är.
 */

import IntegritetsFlode from './illustrations/IntegritetsFlode'

export default function IntegritetsBlock() {
  return (
    <section
      id="integritet"
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6"
    >
      <div className="sm:flex sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-900">
            Dina uppgifter går aldrig till någon AI
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Namn, e-post, telefon, ort och foto sparas för sig, skilt från dina
            CV:n och brev. Innan något skickas till en AI byter vi ut personuppgifterna mot
            platshållare, så den ser att du har ett telefonnummer men aldrig
            vilket. Namnet och kontaktraderna sätts in i det
            färdiga dokumentet efteråt, av vår egen kod. Du ändrar eller raderar
            uppgifterna när du vill.
          </p>
        </div>

        <div className="mt-4 shrink-0 sm:mt-0 sm:w-[240px]">
          <IntegritetsFlode className="h-auto w-full text-neutral-700" />
          <div className="mt-2 flex items-start justify-between gap-2 text-xs text-neutral-500">
            <span className="flex-1">Din profil, hos oss</span>
            <span className="flex-1 text-center">Det AI:n ser</span>
            <span className="flex-1 text-right">Ditt färdiga brev</span>
          </div>
        </div>
      </div>
    </section>
  )
}
