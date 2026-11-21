'use client'

/**
 * Ifyllnad i efterhand: sparade personliga brev som inte är loggade som
 * sökta tjänster läggs in med ett tryck (POST /api/applications/backfill,
 * samma rutt och samma 30 dagars snooze som förut). Kandidaterna kommer
 * färdiga från servern. I tomt läge är importen sidans handling och kan inte
 * snoozas bort.
 */

import { useEffect, useState } from 'react'
import { useNotification } from '@/context/notificationcontext'
import { Kort, LitenKnapp, StorKnapp, TextLank, TomtLage, IkonDokument, IkonKryss } from '@/components/jobb3/kit'

const NYCKEL = 'sokta_tjanster_backfill_snoozed_until'
const SNOOZE_DAGAR = 30

function snoozad(): boolean {
  try {
    const raw = localStorage.getItem(NYCKEL)
    if (!raw) return false
    const t = new Date(raw).getTime()
    return Number.isFinite(t) && t > Date.now()
  } catch {
    return false
  }
}

function snooza(): void {
  try {
    localStorage.setItem(NYCKEL, new Date(Date.now() + SNOOZE_DAGAR * 86400000).toISOString())
  } catch {
    /* utan lagring visas bannern igen nästa gång */
  }
}

export interface BackfillKandidat {
  id: string
  title: string | null
  company: string | null
  job_title: string | null
  created_at: string
}

export default function Backfill({
  kandidater,
  inbaddad,
  onImporterat,
  onLogga,
}: {
  kandidater: BackfillKandidat[]
  inbaddad?: boolean
  onImporterat: () => void
  onLogga: () => void
}) {
  const { successWithActivity } = useNotification()
  const [dold, setDold] = useState(true)
  const [importerar, setImporterar] = useState(false)
  const [fel, setFel] = useState(false)

  useEffect(() => {
    if (inbaddad || !snoozad()) setDold(false)
  }, [inbaddad])

  const importera = async () => {
    if (importerar || kandidater.length === 0) return
    setImporterar(true)
    setFel(false)
    try {
      const res = await fetch('/api/applications/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds: kandidater.map((k) => k.id) }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error()
      snooza()
      setDold(true)
      const n = json.created as number
      successWithActivity(
        n === 1 ? '1 brev tillagt som sökt tjänst.' : `${n} brev tillagda som sökta tjänster.`,
        'application_logged',
        `Importerade ${n} brev till Sökta tjänster`,
        { imported: n },
        3500
      )
      onImporterat()
    } catch {
      setFel(true)
    } finally {
      setImporterar(false)
    }
  }

  if (kandidater.length === 0 || dold) return null
  const n = kandidater.length
  const knapptext = importerar ? 'Lägger in' : n === 1 ? 'Lägg in brevet som sökt tjänst' : `Lägg in ${n} brev som sökta tjänster`
  const felrad = fel ? <p className="j3-falt-fel">Det gick inte att lägga in breven just nu. Försök igen.</p> : null

  if (inbaddad) {
    return (
      <>
        <TomtLage
          ikon={<IkonDokument />}
          rubrik={n === 1 ? 'Vi hittade ett brev du kan lägga in' : `Vi hittade ${n} brev du kan lägga in`}
          text="Du har redan skrivit dem här. Lägg in dem som sökta tjänster, så har du hela historiken från start."
          handling={
            <div className="flex flex-col items-start gap-2">
              <StorKnapp storlek="lag" golv onClick={importera} disabled={importerar}>
                {knapptext}
              </StorKnapp>
              <TextLank onClick={onLogga}>Logga en sökt tjänst själv</TextLank>
            </div>
          }
        />
        {felrad}
      </>
    )
  }

  return (
    <Kort luft>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <p className="j3-h3">{n === 1 ? 'Ett av dina brev är inte loggat som sökt tjänst' : `${n} av dina brev är inte loggade som sökta tjänster`}</p>
          <p className="j3-text">Lägg in dem så är din historik komplett från start.</p>
          {felrad}
        </div>
        <div className="flex items-center gap-2">
          <LitenKnapp storlek={48} onClick={importera} disabled={importerar}>
            {importerar ? 'Lägger in' : 'Lägg in alla'}
          </LitenKnapp>
          <button
            type="button"
            className="j3-liten ikon"
            aria-label="Dölj i 30 dagar"
            onClick={() => {
              snooza()
              setDold(true)
            }}
          >
            <IkonKryss size={18} />
          </button>
        </div>
      </div>
    </Kort>
  )
}
