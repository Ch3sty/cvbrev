/**
 * CV-exemplet per yrke. Publikt omgång 3: ritas av CvExempelMall (grundens
 * skal i CV:ts petrol, samma form som brevexemplen). Serverkomponent: CV:t
 * serverrenderas i papperet och mallväljaren laddas först vid klick på
 * "Byt mall". Schemat ligger kvar i page.tsx.
 */

import CvExempelMall from './CvExempelMall'

export default function CVExempelPage({
  data,
  slug,
}: {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any
  slug: string
}) {
  return <CvExempelMall slug={slug} data={data} />
}
