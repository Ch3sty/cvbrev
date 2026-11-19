/**
 * Laddar Hem (tester v4): väggen med toppraden, eyebrow, rubriken och en
 * statusrad som skelett i väggens eget ljus, det lyfta kortet Nästa steg
 * med tråden längs överkanten, flikarna och golvets två spalter i samma höjd
 * som den riktiga vyn, så att inget hoppar när datan landar.
 *
 * Hem är serverrenderad, så det här syns bara under en navigering.
 */
import Vagg from '@/components/rum/Vagg';
import Topprad from '@/components/rum/Topprad';
import Golv from '@/components/rum/Golv';

const V = 'skelett-vagg';
const G = 'rounded-lg bg-papper-2';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true">
      <Vagg>
        <Topprad />
        <div role="status" aria-label="Laddar">
          <div className={`${V} mt-3 h-3 w-24`} />
          <div className={`${V} mt-3 h-9 w-[46%] lg:h-11`} />
          <div className={`${V} mt-3 h-[14px] w-[64%]`} />
          <div className={`${V} mt-[22px] h-10 max-w-[840px] !rounded-xl`} />
        </div>
      </Vagg>
      <Golv lyft className="pb-10">
        <section aria-label="Nästa steg laddar" className="loading-thread relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft">
          <div className={`${G} h-3.5 w-[28%]`} />
          <div className={`${G} mt-2 h-[27px] w-[62%]`} />
          <div className={`${G} mt-2.5 h-3.5 w-[80%]`} />
          <div className={`${G} mt-3.5 h-12 !rounded-xl sm:w-44`} />
        </section>
        <div className="h-11 border-b border-kant" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((k) => (
            <div key={k} className="rounded-2xl border border-kant bg-papper p-4">
              <div className={`${G} h-3 w-[30%]`} />
              {[0, 1, 2].map((r) => (
                <div key={r} className="mt-4">
                  <div className={`${G} h-3.5 w-[70%]`} />
                  <div className={`${G} mt-2 h-3 w-[85%]`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Golv>
    </div>
  );
}
