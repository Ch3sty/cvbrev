/**
 * En sökt tjänst (Jobbsöket omgång 1, etapp 2B). Serverkomponent:
 * hamtaSoktTjanst läser tjänsten, händelserna, uppföljningarna, brevet, CV:t
 * och intervjuproven i ett varv. ?steg=forbered|folj-upp|hur-gick|andra-tid
 * väljer vilket block sidan öppnar i (F8).
 */
import { notFound, redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaSoktTjanst } from '@/lib/jobbsok/server'
import { arUuid, tolkaTjanstAdress } from '@/lib/jobbsok'
import TjanstVy from '@/components/jobb3/sokta/TjanstVy'

export default async function SoktTjanstPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ id }, sok] = await Promise.all([params, searchParams])
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  if (!arUuid(id)) notFound()

  const data = await hamtaSoktTjanst(user.id, id)
  if (!data) redirect('/dashboard/sokta-tjanster')

  return <TjanstVy key={id} data={data} fokus={tolkaTjanstAdress(sok)} />
}
