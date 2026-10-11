/**
 * Laddar (konceptets L1): väggen står med toppraden, och rubriken,
 * dagsraden, veckan och kurvan som skelett i väggens eget ljus (vitt 8
 * procent), i samma höjd som mitt i träningen (1b), så inget hoppar när
 * datan landar. Det lyfta kortet laddar med tråden längs överkanten.
 *
 * Hemvyn är serverrenderad, så det här syns bara under en navigering.
 */
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Lagesrad from '@/components/rum/Lagesrad';
import Golv from '@/components/rum/Golv';

const V = 'skelett-vagg';
const G = 'rounded-lg bg-papper-2';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true">
      <Vagg tat={false}>
        <Topprad />
        <Lagesrad aktiv="plan" />
        <div role="status" aria-label="Laddar" className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8">
          <div className="mt-2">
            <div className={`${V} h-9 w-[78%]`} />
            <div className={`${V} mt-3 h-[14px] w-[60%]`} />
          </div>
          <div>
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-vagg-kant bg-white/5 p-3.5 lg:mt-0">
              <div className={`${V} h-14 w-14 shrink-0 !rounded-full`} />
              <div className="flex-1">
                {[48].map((b, i) => (
                  <div key={i}>
                    <div className={`${V} h-6`} style={{ width: b }} />
                    <div className={`${V} mt-1.5 h-2.5 w-4/5`} />
                  </div>
                ))}
              </div>
            </div>
            <div className={`${V} mt-3.5 h-[42px] !rounded-[11px]`} />
          </div>
        </div>
        <p className="mt-[22px] text-ey text-vagg-mjuk">Din nivå, dag för dag</p>
        <div className={`${V} mt-2 aspect-[380/150] max-w-[840px] !rounded-xl lg:aspect-[840/170]`} />
        <div className={`${V} mt-2 h-3 w-[45%]`} />
      </Vagg>
      <Golv lyft>
        <section aria-label="Dagens pass laddar" className="loading-thread relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft lg:max-w-[calc((100%-32px)/3)]">
          <div className={`${G} h-3.5 w-[35%]`} />
          <div className={`${G} mt-2 h-[27px] w-[72%]`} />
          <div className={`${G} mt-2.5 h-3.5`} />
          <div className={`${G} mt-1.5 h-3.5 w-[84%]`} />
          <div className={`${G} mt-3.5 h-12 !rounded-xl`} />
        </section>
      </Golv>
    </div>
  );
}
