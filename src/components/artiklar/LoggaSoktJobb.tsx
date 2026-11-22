/**
 * <LoggaSoktJobb />: arket "Logga sökt tjänst" i artikeln om
 * aktivitetsrapporten (saas-lead 10.2, SEO 11.3 i
 * docs/artiklar-2026-11/brief-aktivitetsrapport.md). Samma ark som på
 * /verktyg/sokta-tjanster (LoggaArkPublik), med fält och text orörda, i en
 * aside med aria-label och utan rubrikelement. Formuläret har action till
 * kontovägen, så att det fungerar utan JavaScript. Händelsen sample_completed
 * får kind sokt, surface artikel och sluggen, aldrig fältens innehåll.
 */
import LoggaArkPublik from '@/app/(public)/verktyg/sokta-tjanster/LoggaArkPublik'
import '@/app/(public)/verktyg/sokta-tjanster/sokta-tjanster.css'
import './logga-sokt-jobb.css'

export default function LoggaSoktJobb({ slug }: { slug: string }) {
  return (
    <aside className="lsj not-prose" aria-label="Logga sökt tjänst">
      <LoggaArkPublik surface="artikel" slug={slug} />
    </aside>
  )
}
