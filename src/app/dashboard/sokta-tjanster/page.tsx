/**
 * Sökta tjänster (Jobbsöket omgång 1, etapp 2B). Serverkomponent: sessionen,
 * tjänsterna, Ska sökas, veckans mål, statistiken och rapporten läses i ett
 * varv av hamtaSoktaTjanster och skickas ner färdiga. Vy och filter står i
 * adressen (F8) och läses av vyn.
 *
 * ?logga=1 (eller ?logga=ska-soka) öppnar arket Logga sökt tjänst. Sidan tar
 * inte emot tjänst, arbetsgivare eller annat om annonsen i adressen
 * (beslut-agarpunkter D-13, 2026-11-22): PostHog skickar hela adressen med
 * sidvisningen. Förifyllningen bärs i webbläsaren och läses i SoktaVy
 * (src/lib/jobbsok/forifyllning.ts och provaSokt.ts).
 */
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaSoktaTjanster } from '@/lib/jobbsok/server'
import { tolkaSoktaAdress } from '@/lib/jobbsok'
import SoktaVy from '@/components/jobb3/sokta/SoktaVy'

type Sok = Record<string, string | string[] | undefined>

export default async function SoktaTjansterPage({ searchParams }: { searchParams: Promise<Sok> }) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const p = await searchParams
  const adress = tolkaSoktaAdress(p)
  const data = await hamtaSoktaTjanster(user.id, { manad: adress.manad })

  return <SoktaVy data={data} />
}
