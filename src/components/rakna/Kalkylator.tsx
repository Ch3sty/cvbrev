/**
 * Väljer kalkylator efter slug, för inbäddningen (/embed/[verktyg]) som
 * visar alla nio i samma route. Sidorna under /rakna-ut importerar sin egen
 * startfil i ./start direkt, så att de inte laddar de andra åtta.
 */
import type { Slug } from '@/lib/rakna/delning'
import type { Sok } from '@/lib/rakna/sok'
import LonEfterSkattStart from './start/lon-efter-skatt'
import AnstalldKostnadStart from './start/vad-kostar-en-anstalld'
import LoneforhandlingStart from './start/loneforhandling'
import SemesterStart from './start/semesterersattning'
import TimlonStart from './start/timlon-till-manadslon'
import UppsagningStart from './start/uppsagningstid'
import FelrekryteringStart from './start/felrekrytering'
import SourcingStart from './start/sourcing'
import TraffsakerhetStart from './start/traffsakerhet'

export default function Kalkylator({ slug, sok }: { slug: Slug; sok?: Sok }) {
  switch (slug) {
    case 'lon-efter-skatt':
      return <LonEfterSkattStart sok={sok} />
    case 'vad-kostar-en-anstalld':
      return <AnstalldKostnadStart sok={sok} />
    case 'loneforhandling':
      return <LoneforhandlingStart sok={sok} />
    case 'semesterersattning':
      return <SemesterStart sok={sok} />
    case 'timlon-till-manadslon':
      return <TimlonStart sok={sok} />
    case 'uppsagningstid':
      return <UppsagningStart sok={sok} />
    case 'felrekrytering':
      return <FelrekryteringStart sok={sok} />
    case 'sourcing':
      return <SourcingStart sok={sok} />
    case 'traffsakerhet':
      return <TraffsakerhetStart sok={sok} />
  }
}
