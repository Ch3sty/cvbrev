/**
 * Mallvalet: tre mallar ur registret (SIMPLE_TEMPLATES) med nivå, och
 * antalet mallar ur TEMPLATE_COUNT.
 */

import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import Telefon from '../Telefon'
import { SkarmFot, SkarmGolv, SkarmVagg } from '../delar'

function Ark({ accent }: { accent: boolean }) {
  return (
    <svg viewBox="0 0 60 80" width={44} height={58} fill="none" stroke="var(--ink-1)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="2" y="2" width="56" height="76" rx="4" fill="var(--papper-skarm)" />
      {accent ? <rect x="2" y="2" width="16" height="76" rx="3" fill="var(--rum-ton)" stroke="none" /> : null}
      <path d={accent ? 'M24 12h26M24 22h26M24 30h20M24 40h26M24 48h26M24 56h18' : 'M10 12h24M10 22h40M10 30h34M10 40h40M10 48h40M10 56h28'} />
    </svg>
  )
}

export default function SkarmMallar({ glid, className }: { glid?: boolean; className?: string }) {
  const tre = SIMPLE_TEMPLATES.slice(0, 3)
  return (
    <Telefon rum="cv" glid={glid} className={className}>
      <SkarmVagg kick="CV-mallar" rubrik={`${TEMPLATE_COUNT} mallar`} sub={`${FREE_TEMPLATE_COUNT} gratis. Alla läses av rekryteringssystemen.`} />
      <SkarmGolv>
        {tre.map((m, i) => (
          <div className="s-kort" key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'center', borderColor: i === 0 ? 'var(--koppar)' : undefined }}>
            <Ark accent={i === 1} />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13 }}>{m.name}</b>
              <p className="s-dim">{m.tier === 'free' ? 'Gratis' : 'Ingår i Premium'}</p>
            </div>
            {i === 0 ? <span className="s-pill s-gron">Vald</span> : null}
          </div>
        ))}
      </SkarmGolv>
      <SkarmFot knapp="Fyll i dina uppgifter" />
    </Telefon>
  )
}
