'use client'

/**
 * Arket Ett CV till (raden "Skapa nytt" i väggen och "Ett CV till, för en
 * annan roll" på Ditt CV): ladda upp ett CV med dagens uppladdning och
 * samtycke (InlineCVUpload, ordagrant), eller skriv ett från början i
 * CV-byggaren. Vid full kvot på gratisnivån står dagens betalvägg
 * (PaywallCard "cv-antal") i stället, och "Ta bort ett gammalt CV" öppnar
 * Byt CV-arket där Ta bort finns.
 *
 * `startFil`: filen hon redan valt med "Välj fil" på väggen; arket visar då
 * samtycket och knappen direkt.
 */
import Ark from '@/components/cv/Dokument/Ark'
import InlineCVUpload from '@/components/cv/InlineCVUpload'
import PaywallCard from '@/components/paywall/PaywallCard'
import SkrivFranBorjan from './SkrivFranBorjan'
import { NYTT_ARK } from './texter'

export interface NyttCvArkProps {
  open: boolean
  onClose: () => void
  /** Gratisnivåns två CV är fulla. */
  fullt: boolean
  /** "Ta bort ett gammalt CV" i betalväggen. */
  onOppnaByt: () => void
  /** CV:t är uppladdat och inläst. */
  onUppladdat: (id: string) => void
  startFil?: File | null
}

export default function NyttCvArk({ open, onClose, fullt, onOppnaByt, onUppladdat, startFil = null }: NyttCvArkProps) {
  if (startFil) {
    return (
      <Ark open={open} onClose={onClose} rubrik={NYTT_ARK.uppladdningRubrik} under={NYTT_ARK.laddaText}>
        <InlineCVUpload
          key={startFil.name + startFil.size}
          startFil={startFil}
          hideHeader
          showCancel={false}
          onComplete={(cv) => onUppladdat(cv.id)}
          // En inskannad PDF som avvisas: skriv från början står i samma vy
          // (i arket utan vald fil står den redan under uppladdningen).
          skrivVag={
            <div>
              <p className="mb-2 text-[13px] font-bold leading-[18px] text-ink-1">{NYTT_ARK.skriv}</p>
              <SkrivFranBorjan ton="golv" />
            </div>
          }
        />
      </Ark>
    )
  }
  return (
    <Ark open={open} onClose={onClose} rubrik={NYTT_ARK.rubrik} under={fullt ? undefined : NYTT_ARK.under}>
      {fullt ? (
        <PaywallCard variant="cv-antal" isPremium={false} onSecondary={onOppnaByt} bare />
      ) : (
        // Block, inte grid: i en grid växer kolumnen till fältets och
        // knappens minsta bredd (fältets inbyggda bredd plus Börja skriva)
        // och arket klipptes i 412 px. Samma blockflöde som väggens
        // .cv3-skriv på Ditt CV, där samma formulär ryms.
        <div className="space-y-5 pb-2" data-nytt-cv>
          <section>
            <h3 className="text-[15px] font-bold leading-5 text-ink-1">{NYTT_ARK.ladda}</h3>
            <p className="mb-3 mt-0.5 text-[13px] leading-[18px] text-[color:var(--cv3-ink-2)]">{NYTT_ARK.laddaText}</p>
            <InlineCVUpload hideHeader showCancel={false} onComplete={(cv) => onUppladdat(cv.id)} />
          </section>
          <section>
            <h3 className="text-[15px] font-bold leading-5 text-ink-1">{NYTT_ARK.skriv}</h3>
            <p className="mb-3 mt-0.5 text-[13px] leading-[18px] text-[color:var(--cv3-ink-2)]">{NYTT_ARK.skrivText}</p>
            <SkrivFranBorjan ton="golv" />
          </section>
        </div>
      )}
    </Ark>
  )
}
