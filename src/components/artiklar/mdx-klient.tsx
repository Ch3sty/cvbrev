'use client'

/**
 * MDX-komponenter med klientkod som bara enstaka artiklar ritar: räknarna
 * och brevexemplen. next/dynamic här, i en klientmodul, gör att deras kod
 * hämtas först när en artikel faktiskt ritar dem. Importerades de direkt i
 * artikelsidan (en serverkomponent) följde de med i varje artikels
 * JavaScript, och next/dynamic i serverkomponenten delade inte upp dem.
 * Serverrenderingen är densamma som förut.
 */
import dynamic from 'next/dynamic'

export const UppsagningstidRaknare = dynamic(() => import('@/components/rakna/UppsagningstidRaknare'))
export const LoneforhandlingsKalkylator = dynamic(() => import('@/components/rakna/LoneforhandlingsKalkylator'))
export const PersonligtBrevExample = dynamic(() => import('@/components/mdx/PersonligtBrevExample'))
export const PersonligtBrevExampleLarare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleLarare'))
export const PersonligtBrevExampleBarnskotare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleBarnskotare'))
export const PersonligtBrevExampleLakare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleLakare'))
export const PersonligtBrevExampleSommarjobb = dynamic(() => import('@/components/mdx/PersonligtBrevExampleSommarjobb'))
export const PersonligtBrevExampleSjukskoterska = dynamic(() => import('@/components/mdx/PersonligtBrevExampleSjukskoterska'))
export const PersonligtBrevExamplePersonligAssistent = dynamic(() => import('@/components/mdx/PersonligtBrevExamplePersonligAssistent'))
export const PersonligtBrevExampleAdministrator = dynamic(() => import('@/components/mdx/PersonligtBrevExampleAdministrator'))
export const PersonligtBrevExampleSaljare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleSaljare'))
export const PersonligtBrevExampleForskollarare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleForskollarare'))
export const PersonligtBrevExampleButikssaljare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleButikssaljare'))
export const PersonligtBrevExampleEngelska = dynamic(() => import('@/components/mdx/PersonligtBrevExampleEngelska'))
export const PersonligtBrevExampleLagerarbetare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleLagerarbetare'))
export const PersonligtBrevExampleVardOmsorg = dynamic(() => import('@/components/mdx/PersonligtBrevExampleVardOmsorg'))
export const PersonligtBrevExampleEkonomiassistent = dynamic(() => import('@/components/mdx/PersonligtBrevExampleEkonomiassistent'))
export const PersonligtBrevExampleReceptionist = dynamic(() => import('@/components/mdx/PersonligtBrevExampleReceptionist'))
export const PersonligtBrevExampleUtanErfarenhet = dynamic(() => import('@/components/mdx/PersonligtBrevExampleUtanErfarenhet'))
export const PersonligtBrevExampleIngenjor = dynamic(() => import('@/components/mdx/PersonligtBrevExampleIngenjor'))
export const PersonligtBrevExampleIT = dynamic(() => import('@/components/mdx/PersonligtBrevExampleIT'))
export const PersonligtBrevExampleKurator = dynamic(() => import('@/components/mdx/PersonligtBrevExampleKurator'))
export const PersonligtBrevExampleStadare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleStadare'))
export const PersonligtBrevExampleHandlaggare = dynamic(() => import('@/components/mdx/PersonligtBrevExampleHandlaggare'))
export const PersonligtBrevExampleUtbildning = dynamic(() => import('@/components/mdx/PersonligtBrevExampleUtbildning'))
export const PersonligtBrevPreview = dynamic(() => import('@/components/mdx/PersonligtBrevPreview'))
// Intervjuprovet ritas bara i två intervjuartiklar (docs/design/intervjuprov-spec-2026-09-23.md).
export const Intervjuprov = dynamic(() => import('@/components/artiklar/intervjuprov/Intervjuprov'))
