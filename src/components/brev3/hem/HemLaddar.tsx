'use client'

/**
 * Dina brev medan sidan läses (loading.tsx). Två former med den färdiga
 * sidans mått, så att bytet inte flyttar något:
 *
 *   med brev   väggen 558 px (telefon 438), panelen med tre mått, remsan
 *   utan brev  väggen 664 px (telefon 570 med annonsfältet, 360 utan CV),
 *              panelen "Så går det till" (skissen Hem-ny)
 *
 * Formen väljs ur skalets delade data (sidomenyns antal brev och CV), som
 * redan finns i klienten. Saknas den: formen med brev, som förut.
 */
import { BrevVagg, BrevFlikar, Golv, LyftPanel } from '@/components/brev3/kit'
import { useDashboardData } from '@/contexts/DashboardDataContext'

const vaggBit = 'rounded-xl bg-white/10 motion-safe:animate-pulse'
const golvBit = 'rounded-[18px] bg-[color:var(--b3-mjuk)] motion-safe:animate-pulse xl:rounded-[20px]'

export default function HemLaddar() {
  const { summary } = useDashboardData()
  const antal = summary?.sidomeny
  const utanBrev = antal ? antal.brev === 0 : false
  const utanCv = antal ? antal.cv === 0 : false

  if (utanBrev) {
    return (
      <div className="b3-sida flex flex-1 flex-col" aria-busy="true" aria-label="Laddar dina brev">
        <BrevVagg etikett="Nästa steg" hojd={664} hojdMobil={utanCv ? 360 : 570}>
          <div className="xl:flex xl:items-center xl:justify-between">
            <BrevFlikar aktiv="dina-brev" hrefDinaBrev="/dashboard/mina-brev" hrefMallar="/dashboard/mina-brev/mallar" />
          </div>
          <div className="mt-4 grid gap-3 xl:mt-[34px] xl:grid-cols-[540px_minmax(0,1fr)] xl:gap-10">
            <div className="flex flex-col gap-3">
              <span className={`${vaggBit} h-4 w-48`} />
              <span className={`${vaggBit} h-[62px] xl:h-24`} />
              <span className={`${vaggBit} h-10 xl:h-11`} />
              {utanCv ? <span className={`${vaggBit} h-[56px] w-56`} /> : <span className={`${vaggBit} h-[180px] xl:h-[200px]`} />}
            </div>
            <span className={`${vaggBit} hidden xl:block xl:h-[440px]`} />
          </div>
        </BrevVagg>
        <Golv>
          <LyftPanel>
            <span className={`${golvBit} block h-[18px] w-36`} />
            <span className={`${golvBit} mt-2 block h-[30px] w-2/3`} />
            <div className="mt-3 grid gap-2.5 xl:mt-4 xl:grid-cols-3 xl:gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={`${golvBit} block h-[86px] xl:h-[150px]`} />
              ))}
            </div>
          </LyftPanel>
        </Golv>
      </div>
    )
  }

  return (
    <div className="b3-sida flex flex-1 flex-col" aria-busy="true" aria-label="Laddar dina brev">
      <BrevVagg etikett="Nästa steg">
        <div className="xl:flex xl:items-center xl:justify-between">
          <BrevFlikar aktiv="dina-brev" hrefDinaBrev="/dashboard/mina-brev" hrefMallar="/dashboard/mina-brev/mallar" />
        </div>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_92px] gap-3.5 xl:mt-8 xl:grid-cols-[500px_minmax(0,1fr)] xl:gap-10">
          <div className="flex flex-col gap-3">
            <span className={`${vaggBit} h-4 w-40`} />
            <span className={`${vaggBit} h-[62px] xl:h-[50px]`} />
            <span className={`${vaggBit} h-10 xl:h-[52px]`} />
            <span className={`${vaggBit} mt-3 hidden h-[60px] w-56 xl:block`} />
          </div>
          <span className={`${vaggBit} h-[126px] xl:h-[340px]`} />
        </div>
      </BrevVagg>
      <Golv>
        <LyftPanel>
          <span className={`${golvBit} block h-[42px] w-2/3`} />
          <div className="mt-3 grid grid-cols-2 gap-2.5 xl:mt-4 xl:grid-cols-[1.3fr_1fr_1fr] xl:gap-3">
            <span className={`${golvBit} col-span-2 block h-[150px] xl:col-span-1 xl:h-[232px]`} />
            <span className={`${golvBit} block h-[150px] xl:h-[232px]`} />
            <span className={`${golvBit} block h-[150px] xl:h-[232px]`} />
          </div>
        </LyftPanel>
        <div className="mt-7 xl:mt-11">
          <span className={`${golvBit} block h-[50px] w-1/2`} />
        </div>
        <div className="mt-3.5 flex gap-3 overflow-hidden xl:mt-5 xl:grid xl:grid-cols-4 xl:gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={`${golvBit} block h-[290px] w-[200px] shrink-0 xl:h-[364px] xl:w-auto`} />
          ))}
        </div>
      </Golv>
    </div>
  )
}
