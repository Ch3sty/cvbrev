/**
 * Brevexemplet i publikt v2 (spec del B 3.3). Serverkomponent: brevet
 * serverrenderas i papperet och mallväljaren laddas först vid klick på
 * "Byt mall". Schemat ligger kvar i page.tsx.
 */

import ExempelMall from '@/components/publikt/innehall/exempel/ExempelMall'

export default function PersonligtBrevExempelPage({
  data,
  slug,
}: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
  slug: string
}) {
  return <ExempelMall typ="brev" slug={slug} data={data} />
}
