/**
 * Brevexemplet i publikt omgång 3 (skissen brev-exempel). Serverkomponent:
 * brevet serverrenderas på papperet och mallvisaren laddas först vid klick
 * på "Byt mall". Schemat och metadatan ligger kvar i page.tsx.
 */

import BrevExempelMall from '@/components/publikt/innehall/exempel/BrevExempelMall'

export default function PersonligtBrevExempelPage({
  data,
  slug,
}: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
  slug: string
}) {
  return <BrevExempelMall slug={slug} data={data} />
}
