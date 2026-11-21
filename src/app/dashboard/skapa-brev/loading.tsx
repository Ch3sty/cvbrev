import ArbetsLaddar from '@/components/brev3/arbete/ArbetsLaddar'
import { SKRIV } from '@/components/brev3/arbete/texter'

/** Skriv brev laddar i arbetslägets yta, med samma mått som den färdiga sidan. */
export default function SkrivBrevLaddar() {
  return <ArbetsLaddar rubrik={SKRIV.rubrik} bladRubrik={SKRIV.bladRubrik} hojd={780} />
}
