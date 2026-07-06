'use client'

/**
 * /rekryterare/registrera — ansökan om rekryterarkonto (beta, utan betalning).
 *
 * Sidan hanterar fyra fall:
 *  1. EJ inloggad: fullt formulär (företag + kontakt + e-post/lösenord).
 *     Vi kör supabase.auth.signUp och:
 *     a) Får vi en session direkt → insert i recruiter_profiles → klarvy.
 *     b) Kräver projektet e-postbekräftelse (session saknas i svaret) kan vi
 *        INTE inserta recruiter_profiles ännu (RLS kräver inloggad användare).
 *        Då sparas formulärdatat i localStorage (nyckel
 *        RECRUITER_DRAFT_KEY) och en "Bekräfta din e-post"-vy visas. När
 *        användaren senare öppnar den här sidan MED session plockar
 *        mount-effekten upp utkastet, fullföljer inserten och rensar
 *        localStorage. Bekräftelsemailets länk leder in på sajten, så
 *        användaren instrueras att gå tillbaka hit efter bekräftelsen.
 *  2. REDAN inloggad utan recruiter_profiles-rad: förifylld kontaktinfo,
 *     bara företagsfälten + "Ansök med inloggat konto".
 *  3. Befintlig recruiter_profiles-rad: statusvy (pending/approved/rejected).
 *  4. Efter lyckad ansökan: bekräftelsevy, vi verifierar företag manuellt.
 *
 * OBS: sidan får INTE kräva godkänt rekryterarkonto. Om en guard läggs i
 * src/app/rekryterare/layout.tsx måste /rekryterare/registrera undantas.
 * Sidan renderar hela sin egen yta (min-h-screen) och tål att stå fristående.
 *
 * recruiter_profiles saknas i DB-typerna, därför kastas klienten till any
 * vid tabellanropen.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  MailCheck,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { getSupabaseClient } from '@/lib/supabase/client-manager'

const RECRUITER_DRAFT_KEY = 'jobbcoach_recruiter_application_draft'

type ProfileStatus = 'pending' | 'approved' | 'rejected'

type View =
  | 'loading'
  | 'guest-form'
  | 'authed-form'
  | 'confirm-email'
  | 'status'
  | 'done'

interface CompanyFields {
  companyName: string
  orgNumber: string
  contactName: string
  contactRole: string
  recruitingRoles: string
  phone: string
  website: string
}

const EMPTY_FIELDS: CompanyFields = {
  companyName: '',
  orgNumber: '',
  contactName: '',
  contactRole: '',
  recruitingRoles: '',
  phone: '',
  website: '',
}

/** Normalisera "5566778899" → "556677-8899", trimma bort mellanslag. */
function normalizeOrgNumber(value: string): string {
  const cleaned = value.replace(/\s/g, '')
  if (/^\d{10}$/.test(cleaned)) {
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`
  }
  return cleaned
}

function isValidOrgNumber(value: string): boolean {
  return /^\d{6}-\d{4}$/.test(value)
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300 transition-colors min-h-[46px]'

const labelClass = 'block text-sm font-bold text-slate-800 mb-1.5'

export default function RekryterareRegistreraSida() {
  const supabase = getSupabaseClient()

  const [view, setView] = useState<View>('loading')
  const [fields, setFields] = useState<CompanyFields>(EMPTY_FIELDS)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setField = (key: keyof CompanyFields, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }))

  /** Läs status på befintlig ansökan. Returnerar status eller null. */
  const fetchProfileStatus = useCallback(
    async (uid: string): Promise<ProfileStatus | null> => {
      const { data } = await (supabase as any)
        .from('recruiter_profiles')
        .select('status')
        .eq('user_id', uid)
        .maybeSingle()
      return (data?.status as ProfileStatus) ?? null
    },
    [supabase]
  )

  /** Insert i recruiter_profiles. Status sätts av databasen (pending). */
  const insertProfile = useCallback(
    async (uid: string, f: CompanyFields) => {
      const { error: insertError } = await (supabase as any)
        .from('recruiter_profiles')
        .insert({
          user_id: uid,
          company_name: f.companyName.trim(),
          org_number: normalizeOrgNumber(f.orgNumber),
          contact_name: f.contactName.trim() || null,
          contact_role: f.contactRole.trim() || null,
          recruiting_roles: f.recruitingRoles.trim() || null,
          phone: f.phone.trim() || null,
          website: f.website.trim() || null,
        })
      return insertError
    },
    [supabase]
  )

  // Mount: avgör läge utifrån session, befintlig ansökan och ev. sparat utkast
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (!session?.user) {
        setView('guest-form')
        return
      }

      setUserId(session.user.id)
      setUserEmail(session.user.email ?? null)

      // Finns redan en ansökan? Visa status i stället.
      const status = await fetchProfileStatus(session.user.id)
      if (cancelled) return
      if (status) {
        setProfileStatus(status)
        setView('status')
        return
      }

      // Fullfölj ev. utkast som sparades före e-postbekräftelsen (fall 1b)
      let draft: CompanyFields | null = null
      try {
        const raw = window.localStorage.getItem(RECRUITER_DRAFT_KEY)
        if (raw) draft = JSON.parse(raw) as CompanyFields
      } catch {
        // Trasigt utkast ignoreras, användaren får fylla i formuläret igen
      }

      if (draft?.companyName && isValidOrgNumber(normalizeOrgNumber(draft.orgNumber))) {
        const insertError = await insertProfile(session.user.id, draft)
        if (cancelled) return
        window.localStorage.removeItem(RECRUITER_DRAFT_KEY)
        if (!insertError) {
          setView('done')
          return
        }
        if (insertError.code === '23505') {
          // Raden hann skapas i en annan flik — visa status
          const existing = await fetchProfileStatus(session.user.id)
          if (cancelled) return
          setProfileStatus(existing ?? 'pending')
          setView('status')
          return
        }
        // Inserten misslyckades: fyll formuläret med utkastet och låt
        // användaren skicka igen
        setFields(draft)
        setError('Vi kunde inte slutföra din ansökan automatiskt. Kontrollera uppgifterna och skicka igen.')
      }

      // Inloggad utan ansökan: förifyll kontaktinfo från kontot
      const meta = session.user.user_metadata as Record<string, unknown> | null
      setFields((prev) => ({
        ...prev,
        contactName:
          prev.contactName || ((meta?.full_name as string | undefined) ?? ''),
      }))
      setView('authed-form')
    }

    init()
    return () => {
      cancelled = true
    }
  }, [supabase, fetchProfileStatus, insertProfile])

  const validateCompanyFields = (): string | null => {
    if (fields.companyName.trim().length < 2) {
      return 'Fyll i företagets namn.'
    }
    if (!isValidOrgNumber(normalizeOrgNumber(fields.orgNumber))) {
      return 'Organisationsnumret ska ha formatet NNNNNN-NNNN, till exempel 556677-8899.'
    }
    return null
  }

  /** Fall 1: ej inloggad — skapa konto och ansök. */
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const fieldError = validateCompanyFields()
    if (fieldError) {
      setError(fieldError)
      return
    }
    if (fields.contactName.trim().length < 2) {
      setError('Fyll i namnet på kontaktpersonen.')
      return
    }
    if (!email.includes('@')) {
      setError('Fyll i en giltig e-postadress.')
      return
    }
    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt.')
      return
    }

    setSubmitting(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fields.contactName.trim(),
          },
        },
      })

      if (signUpError) {
        if (
          signUpError.message?.includes('already registered') ||
          signUpError.message?.includes('already exists')
        ) {
          setError(
            'Det finns redan ett konto med den här e-postadressen. Logga in först och öppna sidan igen, så ansöker du med ditt befintliga konto.'
          )
        } else {
          setError(signUpError.message || 'Kontot kunde inte skapas. Försök igen.')
        }
        return
      }

      if (!data.user) {
        setError('Kontot kunde inte skapas. Försök igen.')
        return
      }

      // Samma bekräftelsemail som övriga registreringar (fire-and-forget)
      fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.user.email,
          fullName: fields.contactName.trim(),
          userId: data.user.id,
          isInvitation: false,
        }),
      }).catch(() => {
        // Mailfel får inte stoppa ansökan
      })

      if (data.session) {
        // Session direkt → vi kan inserta på en gång
        const insertError = await insertProfile(data.user.id, fields)
        if (insertError) {
          setError(
            'Kontot skapades men ansökan kunde inte sparas. Ladda om sidan och försök igen, dina kontouppgifter finns kvar.'
          )
          return
        }
        setUserId(data.user.id)
        setUserEmail(data.user.email ?? null)
        setView('done')
      } else {
        // E-postbekräftelse krävs: spara utkastet och fullfölj efter inloggning
        try {
          window.localStorage.setItem(
            RECRUITER_DRAFT_KEY,
            JSON.stringify(fields)
          )
        } catch {
          // Utan localStorage får användaren fylla i igen efter bekräftelsen
        }
        setUserEmail(data.user.email ?? null)
        setView('confirm-email')
      }
    } finally {
      setSubmitting(false)
    }
  }

  /** Fall 2: inloggad utan ansökan — inserta för aktuell användare. */
  const handleAuthedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!userId) return

    const fieldError = validateCompanyFields()
    if (fieldError) {
      setError(fieldError)
      return
    }

    setSubmitting(true)
    try {
      const insertError = await insertProfile(userId, fields)
      if (insertError) {
        if (insertError.code === '23505') {
          const existing = await fetchProfileStatus(userId)
          setProfileStatus(existing ?? 'pending')
          setView('status')
          return
        }
        setError('Ansökan kunde inte sparas. Försök igen om en stund.')
        return
      }
      window.localStorage.removeItem(RECRUITER_DRAFT_KEY)
      setView('done')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-white">
      {/* Enkel topprad — sidan ska fungera fristående, utan portal-layout */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Logo href="/" variant="compact" height={36} />
        <Link
          href="/for-rekryterare"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-orange-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          För rekryterare
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-24">
        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
            <p className="text-sm font-semibold">Laddar...</p>
          </div>
        )}

        {(view === 'guest-form' || view === 'authed-form') && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  }}
                />
                Tidig åtkomst · Gratis under betan
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
                Skapa rekryterarkonto
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
                Fyll i uppgifterna så verifierar vi ert företag manuellt,
                oftast inom en till två arbetsdagar. Inget kostar något under
                betan.
              </p>
            </div>

            {/* Formulärkort */}
            <div
              className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8"
              style={{
                boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
              }}
            >
              {view === 'authed-form' && (
                <div className="flex items-start gap-3 rounded-2xl bg-orange-50/70 border border-orange-100 p-4 mb-6">
                  <BadgeCheck
                    className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                    strokeWidth={2.2}
                  />
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Du är inloggad som{' '}
                    <span className="font-bold">{userEmail}</span>. Ansökan
                    kopplas till det kontot, du behöver inget nytt.
                  </p>
                </div>
              )}

              <form
                onSubmit={
                  view === 'guest-form' ? handleGuestSubmit : handleAuthedSubmit
                }
                className="space-y-5"
                noValidate
              >
                {/* Företagsuppgifter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="companyName" className={labelClass}>
                      Företagsnamn
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={fields.companyName}
                      onChange={(e) => setField('companyName', e.target.value)}
                      placeholder="Exempel AB"
                      autoComplete="organization"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="orgNumber" className={labelClass}>
                      Organisationsnummer
                    </label>
                    <input
                      id="orgNumber"
                      type="text"
                      inputMode="numeric"
                      value={fields.orgNumber}
                      onChange={(e) => setField('orgNumber', e.target.value)}
                      placeholder="556677-8899"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contactName" className={labelClass}>
                      Kontaktperson
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      value={fields.contactName}
                      onChange={(e) => setField('contactName', e.target.value)}
                      placeholder="För- och efternamn"
                      autoComplete="name"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactRole" className={labelClass}>
                      Din roll{' '}
                      <span className="font-medium text-slate-400">
                        (valfritt)
                      </span>
                    </label>
                    <input
                      id="contactRole"
                      type="text"
                      value={fields.contactRole}
                      onChange={(e) => setField('contactRole', e.target.value)}
                      placeholder="T.ex. HR-chef, rekryterare"
                      autoComplete="organization-title"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="recruitingRoles" className={labelClass}>
                    Vilka roller rekryterar ni?{' '}
                    <span className="font-medium text-slate-400">
                      (valfritt)
                    </span>
                  </label>
                  <textarea
                    id="recruitingRoles"
                    value={fields.recruitingRoles}
                    onChange={(e) =>
                      setField('recruitingRoles', e.target.value)
                    }
                    placeholder="T.ex. utvecklare, ekonomer, kundtjänst i Stockholmsområdet"
                    rows={3}
                    className={`${inputClass} resize-y min-h-[80px]`}
                  />
                </div>

                {/* Kontaktvägar som delas med kandidaten först efter accept */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Telefon{' '}
                      <span className="font-medium text-slate-400">(valfritt)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={fields.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="070-123 45 67"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className={labelClass}>
                      Webbplats{' '}
                      <span className="font-medium text-slate-400">(valfritt)</span>
                    </label>
                    <input
                      id="website"
                      type="url"
                      value={fields.website}
                      onChange={(e) => setField('website', e.target.value)}
                      placeholder="foretaget.se"
                      autoComplete="url"
                      className={inputClass}
                    />
                  </div>
                </div>
                <p className="-mt-2 text-[12px] text-slate-400 leading-relaxed">
                  Kontaktuppgifterna visas för kandidaten först när hen accepterat
                  er kontakt. Din e-postadress används som standard.
                </p>

                {/* Kontouppgifter — bara för utloggade besökare */}
                {view === 'guest-form' && (
                  <div className="pt-2 border-t border-orange-100/80">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mt-4 mb-4">
                      Ditt konto
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="email" className={labelClass}>
                          E-postadress
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="namn@foretaget.se"
                          autoComplete="email"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className={labelClass}>
                          Lösenord
                        </label>
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minst 6 tecken"
                          autoComplete="new-password"
                          required
                          minLength={6}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fel */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 leading-relaxed"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                    boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Skickar...
                    </>
                  ) : (
                    <>
                      {view === 'guest-form'
                        ? 'Skapa konto och ansök'
                        : 'Ansök med inloggat konto'}
                      <ArrowRight
                        className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                        strokeWidth={2.5}
                      />
                    </>
                  )}
                </button>

                {view === 'guest-form' && (
                  <p className="text-center text-xs text-slate-500">
                    Har du redan ett konto?{' '}
                    <Link
                      href="/login"
                      className="font-bold text-orange-700 hover:text-orange-800"
                    >
                      Logga in
                    </Link>{' '}
                    och öppna sedan /rekryterare/registrera igen, så ansöker
                    du med det kontot.
                  </p>
                )}
              </form>
            </div>

            {/* Trust-rad under kortet */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-orange-500"
                  strokeWidth={2.5}
                />
                Manuell verifiering av företag
              </span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span>Gratis under betan</span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span>Ingen bindningstid</span>
            </div>
          </motion.div>
        )}

        {view === 'confirm-email' && (
          <StatusCard
            icon={
              <MailCheck className="w-8 h-8 text-orange-600" strokeWidth={2} />
            }
            title="Bekräfta din e-post"
            body={
              <>
                Vi har skickat ett bekräftelsemail till{' '}
                <span className="font-bold text-slate-800">
                  {userEmail ?? 'din e-postadress'}
                </span>
                . Klicka på länken i mailet och öppna sedan den här sidan
                igen, så slutför vi ansökan automatiskt. Dina uppgifter är
                sparade i den här webbläsaren.
              </>
            }
          />
        )}

        {view === 'done' && (
          <StatusCard
            icon={
              <CheckCircle2
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            }
            title="Ansökan mottagen"
            body={
              <>
                Tack! Vi verifierar företag manuellt, oftast inom en till två
                arbetsdagar. När kontot är godkänt ser du det på din
                rekryterarsida, och vi hör av oss via mail.
              </>
            }
            action={{ href: '/rekryterare', label: 'Till rekryterarsidan' }}
          />
        )}

        {view === 'status' && profileStatus === 'pending' && (
          <StatusCard
            icon={<Clock className="w-8 h-8 text-orange-600" strokeWidth={2} />}
            title="Din ansökan väntar på godkännande"
            body={
              <>
                Vi har tagit emot ansökan och verifierar företaget manuellt,
                oftast inom en till två arbetsdagar. Du behöver inte göra
                något mer, vi hör av oss via mail när kontot är klart.
              </>
            }
            action={{ href: '/rekryterare', label: 'Till rekryterarsidan' }}
          />
        )}

        {view === 'status' && profileStatus === 'approved' && (
          <StatusCard
            icon={
              <BadgeCheck
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            }
            title="Ert konto är godkänt"
            body={
              <>Företaget är verifierat och kontot är aktivt. Välkommen in.</>
            }
            action={{ href: '/rekryterare', label: 'Öppna rekryterarsidan' }}
          />
        )}

        {view === 'status' && profileStatus === 'rejected' && (
          <StatusCard
            icon={<XCircle className="w-8 h-8 text-red-500" strokeWidth={2} />}
            title="Ansökan godkändes inte"
            body={
              <>
                Vi kunde tyvärr inte verifiera företaget den här gången. Tror
                du att något blivit fel? Mejla{' '}
                <a
                  href="mailto:support@jobbcoach.ai"
                  className="font-bold text-orange-700 hover:text-orange-800"
                >
                  support@jobbcoach.ai
                </a>{' '}
                så tittar vi på det tillsammans.
              </>
            }
          />
        )}
      </div>
    </main>
  )
}

/** Gemensam vy för bekräftelser och statusbesked. */
function StatusCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
  action?: { href: string; label: string }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-xl mx-auto bg-white rounded-3xl border border-orange-100 p-8 sm:p-10 text-center"
      style={{ boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
          }}
        >
          {action.label}
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      )}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <Building2 className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
        Vi verifierar alla företag manuellt mot organisationsnummer.
      </div>
    </motion.div>
  )
}
