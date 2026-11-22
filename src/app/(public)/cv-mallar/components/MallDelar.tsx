/**
 * Delarna som /cv-mallar och stilsidorna (word, foto, enkla) delar i
 * publikt omgång 3 (skissen cv-mallar): mallväggen i hjälten, det lyfta
 * kortet med uppladdningen och arbetsytan, och mallkortet i rutnätet.
 * Serverkomponenter; uppladdningen och arbetsytan är dagens klientdelar
 * ur src/components/cv/Dokument/prova, orörda.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Lyft, MallMiniatyr } from '@/components/publikt/v3'
import Uppladdning from '@/components/cv/Dokument/prova/Uppladdning'
import ProvaArbetsyta from '@/components/cv/Dokument/prova/ProvaArbetsyta'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import './mallar-v3.css'

/** Mallväggen i hjälten: åtta riktiga miniatyrer, Gratis som chip på gratismallarna. */
export function Mallvagg({ mallar, etikett }: { mallar: readonly MallKort[]; etikett: string }) {
  return (
    <ul className="cvm-mallvagg" aria-label={etikett}>
      {mallar.map((m) => (
        <li key={m.id}>
          <MallMiniatyr id={m.id} namn={false} chip={m.niva === 'gratis'} prioritet />
        </li>
      ))}
    </ul>
  )
}

/** Situationsraden: vanliga länkar till sidor och avsnitt som redan finns. */
export const SITUATION = [
  { text: 'Student', href: '/cv-mallar/student' },
  { text: 'Utan erfarenhet', href: '/artiklar/cv-utan-erfarenhet' },
  { text: 'Karriärbyte', href: '/artiklar/hur-skriver-man-cv#cv-vid-karriarbyte' },
  { text: 'Chef', href: '/cv-mallar/chef' },
] as const

export function Situationsrad() {
  return (
    <nav aria-label="Välj efter situation" className="cvm-situation">
      <span>Börja från din situation</span>
      {SITUATION.map((s) => (
        <Link key={s.href} href={s.href}>
          {s.text}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Det lyfta kortet: uppladdningen (och raden under den) överst, arbetsytan
 * med arket, valen och förslagen under, på samma sida som i dag.
 */
export function ProvaLyft({ etikett, under }: { etikett: string; under?: ReactNode }) {
  return (
    <Lyft id="valj-mall" etikett={etikett}>
      <div className="cvm-prova">
        <div className="cvm-prova-topp">
          <div>
            <p className="p3-ey">{etikett}</p>
            <div style={{ marginTop: 14 }}>
              {/* Lyftet är papper, inte vägg: uppladdningens ljusa läge. */}
              <Uppladdning ton="papper" />
            </div>
          </div>
          {under ? <div>{under}</div> : null}
        </div>
        <ProvaArbetsyta />
      </div>
    </Lyft>
  )
}

/** Mallkortet i rutnätet: riktig miniatyr, formatmärket, namnet, chip och en rad om stilen. */
export function MallKortet({ mall, href, under }: { mall: MallKort; href: string; under?: ReactNode }) {
  const gratis = mall.niva === 'gratis'
  return (
    <Link href={href} data-cta-klick={href} className={`cvm-mall ${gratis ? 'cvm-gratis' : ''}`.trim()}>
      <MallMiniatyr id={mall.id} storlek="stor" format />
      <small>{under ?? mall.kort}</small>
    </Link>
  )
}
