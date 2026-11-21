/**
 * Den gamla redigeringsrutten. Texten ändras numera i Brevet, fliken Texten.
 */
import { redirect } from 'next/navigation'

export default async function GammalRedigering({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/mina-brev/${id}?flik=texten`)
}
