import ArbetsLaddar from '@/components/brev3/arbete/ArbetsLaddar'
import { BREVET } from '@/components/brev3/arbete/texter'

/** Brevet laddar i arbetslägets yta, med flikraden, bladet och arket på sina platser. */
export default function BrevetLaddar() {
  return <ArbetsLaddar rubrik={BREVET.rubrik(null)} bladRubrik={BREVET.kravRubrik} hojd={752} flikar />
}
