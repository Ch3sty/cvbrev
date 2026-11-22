/**
 * De två korten till CV-exemplet och brevexemplet på yrkesmallsidan, i
 * publikt omgång 3: grundens länkbricka i delens färg (CV petrol, brev
 * plommon). Rubrikerna (h3), texterna och länkarna som förut.
 * Serverkomponent.
 */
import Link from 'next/link'
import { Dorr, Chip } from '@/components/publikt/v3'

type Variant = 'cv-exempel' | 'personligt-brev'

interface StortExempelCTAProps {
  variant: Variant
  yrkesNamn: string
  namnBestamd: string
  slug: string
}

const VARIANTS: Record<
  Variant,
  {
    rubrik: (n: string) => string
    text: (n: string) => string
    cta: string
    href: (slug: string) => string
    farg: 'cv' | 'brev'
    etikett: string
  }
> = {
  'cv-exempel': {
    rubrik: (n) => `Se ett färdigt ${n}-CV`,
    text: (n) =>
      `Vi har skrivit ett komplett CV-exempel för ${n} med konkret innehåll, branschspecifika formuleringar och rätt struktur. Använd det som mall för ditt eget.`,
    cta: 'Öppna CV-exempel',
    href: (slug) => `/cv-exempel/${slug}`,
    farg: 'cv',
    etikett: 'Färdigt CV-exempel',
  },
  'personligt-brev': {
    rubrik: () => `Skriv ett starkt personligt brev`,
    text: (n) =>
      `Ett välskrivet personligt brev kompletterar ditt CV och förklarar varför du söker rollen. Vi har ett konkret brev-exempel för ${n} med rätt ton för svenska rekryterare.`,
    cta: 'Öppna brev-exempel',
    href: (slug) => `/personligt-brev-exempel/${slug}`,
    farg: 'brev',
    etikett: 'Personligt brev',
  },
}

export default function StortExempelCTA({ variant, yrkesNamn, namnBestamd, slug }: StortExempelCTAProps) {
  void yrkesNamn
  const v = VARIANTS[variant]
  return (
    <Link href={v.href(slug)} className="p3-kort cvy-cta" data-p3-farg={v.farg}>
      <Dorr ikon={v.farg} />
      <div className="cvy-cta-text">
        <p className="p3-ey">{v.etikett}</p>
        <h3 className="p3-h3">{v.rubrik(namnBestamd)}</h3>
        <p>{v.text(namnBestamd)}</p>
      </div>
      <Chip typ="koppar" className="cvy-cta-knapp">
        {v.cta}
      </Chip>
    </Link>
  )
}
