/**
 * POST /api/cv/bygg/forslag
 *
 * Jobbcoachen i CV-byggaren (docs/design/skiss-cv-byggare-2026-11-16.html,
 * beslut 6): bara på tryck, i fältet det gäller. Tre handlingar:
 *   punkter     tre punkter till ett jobb ur titel, arbetsgivare och stickord
 *   profil      ett profilförslag ur jobben, utbildningen och kompetenserna
 *   kompetenser kompetensförslag ur titeln och jobben
 *
 * All text maskas med maskForModel före modellen, så namn, e-post och
 * telefon aldrig går med. Kvoten är checkCvByggAiQuota (quotaService);
 * varje lyckat förslag skrivs i ai_usage_costs med feature_name cv_bygg_*,
 * och det är den raden kvoten räknar. Ett anrop som tar längre än sju och en
 * halv sekund avbryts och räknas inte (klienten visar felraden efter åtta).
 *
 * Svar: { punkter } | { profil } | { kompetenser }. 429 quota_exceeded med
 * feature cv_bygg när dagens förslag är använda.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateJSON, GEMINI_MODELS } from '@/lib/gemini'
import { maskForModel } from '@/lib/privacy/pii'
import { trackAIUsage } from '@/lib/ai-cost-tracker'
import { checkCvByggAiQuota, quotaExceededBody } from '@/lib/quota/quotaService'

export const maxDuration = 15

type Typ = 'punkter' | 'profil' | 'kompetenser'

interface Jobb {
  titel?: string
  arbetsgivare?: string
  punkter?: string[]
}

interface Indata {
  typ?: unknown
  /** Yrkestiteln i CV:t (startbladet). */
  yrkestitel?: unknown
  /** Punkter: jobbets titel, arbetsgivare och hennes stickord. */
  titel?: unknown
  arbetsgivare?: unknown
  stickord?: unknown
  pagaende?: unknown
  /** Profil och kompetenser: det som står i CV:t. */
  jobb?: unknown
  utbildning?: unknown
  kompetenser?: unknown
  /** Namnet i CV:t, bara för maskningen; går aldrig till modellen. */
  namn?: unknown
}

const TIDSGRANS_MS = 7500

const text = (v: unknown, max = 200) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const lista = (v: unknown, n: number, max = 160) =>
  Array.isArray(v) ? v.map((x) => text(x, max)).filter(Boolean).slice(0, n) : []

function jobbLista(v: unknown): Jobb[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 6).map((j) => {
    const o = (j ?? {}) as Record<string, unknown>
    return { titel: text(o.titel, 120), arbetsgivare: text(o.arbetsgivare, 120), punkter: lista(o.punkter, 6) }
  })
}

const SYSTEM =
  'Du är Jobbcoachen, en erfaren svensk rekryterare som hjälper en arbetssökande att skriva sitt CV. ' +
  'Skriv på naturlig, enkel svenska med svenska facktermer, som en människa skriver, aldrig säljigt. ' +
  'Hitta aldrig på arbetsgivare, siffror, system, utbildningar eller resultat som inte står i underlaget. ' +
  'Använd aldrig tankstreck. Platshållare som [NAMN] eller [E-POST] ska aldrig återges. Svara bara med JSON.'

function prompt(typ: Typ, d: Indata, mask: (t: string) => string): { prompt: string; schema: Record<string, unknown> } {
  const yrke = mask(text(d.yrkestitel, 120))
  if (typ === 'punkter') {
    const pagaende = d.pagaende === true
    return {
      prompt: [
        `Skriv tre punkter till ett jobb i ett svenskt CV.`,
        `Jobbtitel: ${mask(text(d.titel, 120)) || yrke}`,
        `Arbetsgivare: ${mask(text(d.arbetsgivare, 120))}`,
        text(d.stickord, 600) ? `Hennes egna stickord och punkter: ${mask(text(d.stickord, 600))}` : '',
        yrke ? `Hon söker jobb som: ${yrke}` : '',
        `Regler: varje punkt är en rad om högst 90 tecken, börjar med ett verb i ${pagaende ? 'presens' : 'preteritum'} utan subjekt, ` +
          `beskriver konkreta arbetsuppgifter eller ansvar som är typiska för titeln och stämmer med stickorden. ` +
          `Siffror bara om de står i stickorden. Ingen punkt i slutet av raden.`,
      ]
        .filter(Boolean)
        .join('\n'),
      schema: {
        type: 'object',
        properties: { punkter: { type: 'array', items: { type: 'string' } } },
        required: ['punkter'],
      },
    }
  }
  const jobb = jobbLista(d.jobb)
    .map((j) => `- ${mask(j.titel ?? '')}${j.arbetsgivare ? `, ${mask(j.arbetsgivare)}` : ''}${j.punkter?.length ? `: ${j.punkter.map(mask).join('; ')}` : ''}`)
    .join('\n')
  const utb = lista(d.utbildning, 4).map(mask).join('; ')
  const komp = lista(d.kompetenser, 30, 60).map(mask).join(', ')
  if (typ === 'profil') {
    return {
      prompt: [
        `Skriv profiltexten högst upp i ett svenskt CV.`,
        yrke ? `Hon söker jobb som: ${yrke}` : '',
        jobb ? `Jobb:\n${jobb}` : '',
        utb ? `Utbildning: ${utb}` : '',
        komp ? `Kompetenser: ${komp}` : '',
        `Regler: två eller tre meningar, högst 320 tecken, utan "jag" i första ordet, ingen rubrik. ` +
          `Säg vad hon kan, med vad, och vad hon söker. Bara sådant som står i underlaget.`,
      ]
        .filter(Boolean)
        .join('\n'),
      schema: { type: 'object', properties: { profil: { type: 'string' } }, required: ['profil'] },
    }
  }
  return {
    prompt: [
      `Föreslå kompetenser till ett svenskt CV.`,
      yrke ? `Hon söker jobb som: ${yrke}` : '',
      jobb ? `Jobb:\n${jobb}` : '',
      komp ? `Redan med (föreslå inte igen): ${komp}` : '',
      `Regler: åtta kompetenser, var och en högst tre ord, sådant som rekryterare och rekryteringssystem söker på för yrket: ` +
        `yrkeskunskaper, system, verktyg och metoder. Inga personliga egenskaper som "noggrann".`,
    ]
      .filter(Boolean)
      .join('\n'),
    schema: {
      type: 'object',
      properties: { kompetenser: { type: 'array', items: { type: 'string' } } },
      required: ['kompetenser'],
    },
  }
}

/** Platshållare och rester bort, en rad per punkt. */
const tvatt = (t: string) =>
  t
    .replace(/\[[A-ZÅÄÖ_ -]+\]/g, '')
    .replace(/[—–]/g, ',')
    .replace(/^[-•*\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()

export async function POST(request: Request) {
  let d: Indata
  try {
    d = (await request.json()) as Indata
  } catch {
    return NextResponse.json({ error: 'ogiltig' }, { status: 400 })
  }
  const typ = d.typ
  if (typ !== 'punkter' && typ !== 'profil' && typ !== 'kompetenser') {
    return NextResponse.json({ error: 'ogiltig' }, { status: 400 })
  }
  if (typ === 'punkter' && (!text(d.titel) || !text(d.arbetsgivare))) {
    return NextResponse.json({ error: 'titel_och_arbetsgivare' }, { status: 400 })
  }

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'utloggad' }, { status: 401 })

  const kvot = await checkCvByggAiQuota(supabase, user.id)
  if (!kvot.allowed) {
    return NextResponse.json({ ...quotaExceededBody('cv_bygg', kvot, kvot.isPremium ? 'Dagens förslag från Jobbcoachen är använda.' : 'Gratisförslagen från Jobbcoachen är använda.'), isPremium: kvot.isPremium }, { status: 429 })
  }

  // Namnheuristiken är av: korta fält som "Nordvik Service AB" ser ut som namn.
  // Kända namn (profilens och CV:ts) maskas ordagrant i stället.
  const { data: profil } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle()
  const p0 = profil as { full_name?: string | null; phone?: string | null } | null
  const mask = (t: string) =>
    t
      ? maskForModel(t, {
          detectNameHeuristically: false,
          fullName: p0?.full_name ?? null,
          extraNames: [text(d.namn, 120)],
          knownPhones: [p0?.phone],
        }).text
      : ''
  const { prompt: p, schema } = prompt(typ, d, mask)
  const start = Date.now()
  try {
    const svar = await Promise.race([
      generateJSON<{ punkter?: unknown; profil?: unknown; kompetenser?: unknown }>({
        model: GEMINI_MODELS.fast,
        systemInstruction: SYSTEM,
        prompt: p,
        schema,
        temperature: 0.4,
        maxOutputTokens: 600,
        thinkingBudget: 0,
      }),
      new Promise<never>((_, nej) => setTimeout(() => nej(new Error('tidsgrans')), TIDSGRANS_MS)),
    ])

    let ut: Record<string, unknown>
    if (typ === 'punkter') {
      const punkter = (Array.isArray(svar.data.punkter) ? svar.data.punkter : []).map((x) => tvatt(String(x))).filter(Boolean).slice(0, 4)
      if (!punkter.length) throw new Error('tomt')
      ut = { punkter }
    } else if (typ === 'profil') {
      const profil = tvatt(String(svar.data.profil ?? ''))
      if (!profil) throw new Error('tomt')
      ut = { profil }
    } else {
      const redan = new Set(lista(d.kompetenser, 30, 60).map((k) => k.toLowerCase()))
      const kompetenser = (Array.isArray(svar.data.kompetenser) ? svar.data.kompetenser : [])
        .map((x) => tvatt(String(x)).replace(/\.$/, ''))
        .filter((k) => k && k.length <= 40 && !redan.has(k.toLowerCase()))
        .slice(0, 8)
      if (!kompetenser.length) throw new Error('tomt')
      ut = { kompetenser }
    }

    await trackAIUsage({
      supabase,
      userId: user.id,
      featureName: `cv_bygg_${typ}`,
      endpoint: '/api/cv/bygg/forslag',
      model: svar.model,
      promptTokens: svar.usage?.prompt ?? 0,
      completionTokens: svar.usage?.completion ?? 0,
      costUsd: svar.cost ?? 0,
      generationTimeMs: Date.now() - start,
      metadata: { typ },
    })
    // Gratis: hur många förslag som är kvar, så att hon lägger det sista rätt.
    const kvar = kvot.isPremium ? null : Math.max(0, kvot.limit - kvot.used - 1)
    return NextResponse.json({ ...ut, kvar })
  } catch (e) {
    const tid = (e as Error)?.message === 'tidsgrans'
    if (!tid) console.error('[cv/bygg/forslag] fel:', e)
    return NextResponse.json({ error: tid ? 'tidsgrans' : 'fel' }, { status: tid ? 504 : 502 })
  }
}
