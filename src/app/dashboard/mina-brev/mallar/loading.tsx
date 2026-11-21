/**
 * Mallar medan sidan läses: väggen med flikarna, rubriken, arket och CV:t på
 * sina platser och panelen med mallarna i sina mått. Samma klasser som den
 * färdiga sidan (b3-ml-*), så att bytet inte flyttar något. Utan denna
 * gällde föräldern Dina brev, med en annan vägg.
 */
import { BrevVagg, BrevFlikar, Golv, LyftPanel } from '@/components/brev3/kit'
import { MALLAR_TEXT as T } from '@/components/brev3/mallar/text'

const vaggBit = 'rounded-xl bg-white/10 motion-safe:animate-pulse'
const golvBit = 'rounded-[18px] bg-[color:var(--b3-mjuk)] motion-safe:animate-pulse'

export default function MallarLaddar() {
  return (
    <div className="b3-sida b3-ml" data-rum="brev" aria-busy="true" aria-label="Laddar mallarna">
      <BrevVagg hojd={558} kulle etikett="Mallar" className="b3-ml-vagg">
        <div className="b3-topp">
          <BrevFlikar aktiv="mallar" hrefDinaBrev="/dashboard/mina-brev" hrefMallar="/dashboard/mina-brev/mallar" />
        </div>
        <div className="b3-ml-hjalte">
          <div className="b3-ml-text">
            <p className="b3-ogon b3-ml-ogon">
              <span className={`${vaggBit} inline-block h-4 w-40`} />
            </p>
            <h1 className="b3-h1">{T.rubrik}</h1>
            <p className="b3-ingress">
              <span className="hidden xl:inline">{T.ingress}</span>
              <span className="xl:hidden">{T.ingressMobil}</span>
            </p>
          </div>
          <div className="b3-ml-par" aria-hidden="true">
            <span className="b3-ml-cv block" />
            <div className="b3-ml-brev" />
          </div>
          <div className="b3-ml-knappar" aria-hidden="true">
            <div className="b3-ml-brickor">
              <span className={`${vaggBit} block h-[52px] w-[150px] shrink-0`} />
              <span className={`${vaggBit} block h-[52px] w-[170px] shrink-0`} />
            </div>
            <div className="b3-ml-ladda">
              <span className={`${vaggBit} block h-[60px] w-[240px]`} />
            </div>
          </div>
        </div>
      </BrevVagg>
      <Golv>
        <LyftPanel>
          <span className={`${golvBit} block h-[18px] w-40`} />
          <span className={`${golvBit} mt-3 block h-[34px] w-3/4`} />
          <span className={`${golvBit} mt-5 block h-11 w-full xl:w-2/3`} />
          {/* Telefon: mallarna som remsa i sidled (160 px breda kort), dator: rutnät. */}
          <div className="mt-5 flex gap-3 overflow-hidden xl:grid xl:grid-cols-4 xl:gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={`${golvBit} block h-[230px] w-[160px] shrink-0 xl:h-[300px] xl:w-auto ${i > 3 ? 'max-xl:hidden' : ''}`} />
            ))}
          </div>
        </LyftPanel>
      </Golv>
    </div>
  )
}
