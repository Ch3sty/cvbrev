/**
 * Ikonen per val i registreringen, ur Trådens ikoner (samma som sidomenyn:
 * Mina CV, Personliga brev, Rekryteringstester, Inför intervjun, Matchade jobb).
 */

import {
  IkonBrev,
  IkonCv,
  IkonIntervju,
  IkonMatchning,
  IkonTest,
  type IkonProps,
} from '@/components/illustrations/Ikoner'
import { INTENTS, type SignupIntent } from './intent'

const IKON = {
  cv: IkonCv,
  brev: IkonBrev,
  test: IkonTest,
  intervju: IkonIntervju,
  jobb: IkonMatchning,
} as const

export default function IntentIkon({ intent, ...props }: IkonProps & { intent: SignupIntent }) {
  const Ikon = IKON[INTENTS[intent].ikon]
  return <Ikon {...props} />
}
