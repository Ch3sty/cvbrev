/**
 * Brevet (/dashboard/mina-brev/[id]): läs, ändra och skicka. Serverkomponent.
 *
 * Brevet, låset, sökt-kopplingen, behörigheten, profilen som avsändare och
 * kvoten läses här, och arket ritas här med kravens markeringar, så att
 * första HTML:en är det färdiga arbetsläget utan rundtur i klienten.
 *
 * Ett låst brev (gratis, äldre än de två senaste) öppnas som låst och går
 * att läsa och kopiera, aldrig som "Brevet kunde inte hittas" (fynd 5).
 * ?flik= väljer fliken, ?klart=1 kommer från Skriv brev, ?ladda=1&format=pdf|docx
 * kommer från kassan efter köpet och laddar ner filen en gång. Med
 * &premium_activated=true väntar vyn in tillgången om webhooken ligger efter.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { arBrevLastForAnvandare, hamtaBrevProfil, hamtaSokta } from '@/lib/letters/server'
import { brevDataFranBrev, brevSprak } from '@/lib/letters/brevData'
import { brevKvot } from '@/lib/letters/brevKvot'
import { harAnnons, kravForBrev } from '@/lib/letters/lage'
import { lasSparadeKrav } from '@/lib/letters/krav'
import { styckenForBrev } from '@/lib/letters/stycken'
import { renderBrevHtml } from '@/lib/letters/brevmall'
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates'
import type { Letter } from '@/store/letter-store'
import BrevetVy from '@/components/brev3/arbete/BrevetVy'
import BrevSaknas from '@/components/brev3/arbete/BrevSaknas'
import { arFlik } from '@/components/brev3/arbete/texter'

export default async function BrevetSida({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ klart?: string; flik?: string; ladda?: string; format?: string; premium_activated?: string }>
}) {
  const { id } = await params
  const { klart, flik, ladda, format, premium_activated } = await searchParams
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const supabase = createServerClient({ cookies: await cookies() })

  const [radRes, harBetalt, kanLaddaNer, sokta] = await Promise.all([
    supabase.from('letters').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
    userHasAccess(supabase, user.id, 'any'),
    userHasAccess(supabase, user.id, 'letter_download'),
    hamtaSokta(supabase, user.id, [id]),
  ])
  const rad = (radRes.data ?? null) as Letter | null
  if (!rad) return <BrevSaknas />

  const [isLocked, { profil }] = await Promise.all([
    harBetalt ? Promise.resolve(false) : arBrevLastForAnvandare(supabase, user.id, id, false),
    hamtaBrevProfil(supabase, user.id, rad.cv_id ?? null),
  ])

  const data = brevDataFranBrev(rad, profil, { email: user.email ?? null })
  const kravTraffar = kravForBrev(rad)
  const html = rad.mall_id
    ? renderBrevHtml(rad.mall_id, data, { typsnitt: rad.font_id ?? null }, { markeringar: kravTraffar ?? undefined })
    : rad.content || ''
  const gammal = rad.template_id && rad.template_id in DOCX_TEMPLATES ? DOCX_TEMPLATES[rad.template_id as keyof typeof DOCX_TEMPLATES].name : null
  const s = sokta.get(id) ?? null
  const kvot = brevKvot(profil, harBetalt)

  return (
    <BrevetVy
      brev={{
        id: rad.id,
        title: rad.title,
        company: rad.company,
        job_title: rad.job_title,
        mottagare_person: rad.mottagare_person ?? null,
        halsning: rad.halsning ?? null,
        stycken: styckenForBrev(rad),
        krav: lasSparadeKrav(rad.krav),
        mall_id: rad.mall_id ?? null,
        font_id: rad.font_id ?? null,
        language: brevSprak(rad.language),
        tonality: rad.tonality,
        cv_id: rad.cv_id ?? null,
        forberett_at: rad.forberett_at ?? null,
        har_annons: harAnnons(rad),
      }}
      data={data}
      html={html}
      gammalMallNamn={rad.mall_id ? null : (gammal ?? 'Klassisk')}
      isLocked={isLocked}
      harBetalt={harBetalt}
      kanLaddaNer={kanLaddaNer}
      sokt={s ? { id: s.id, datum: s.applied_at } : null}
      kvot={{ kvar: kvot.kvar, nastaNu: kvot.nastaGratisbrev }}
      klart={klart === '1'}
      ladda={ladda === '1' && (format === 'pdf' || format === 'docx') ? format : null}
      kopRetur={premium_activated === 'true'}
      flik={arFlik(flik) ? flik : null}
    />
  )
}
