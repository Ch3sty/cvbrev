'use client';

/**
 * Inställningarnas interaktiva del (skiss-installningar-2026-10-12).
 *
 * Fyra kort i den ordning skissen ritar dem: Utseende (segmentet och
 * hjälpväxeln), Mejl från oss (växlarna direkt på sidan), Prenumeration (en
 * rad med läget) och Konto (inloggningen, Logga ut, Radera mitt konto).
 * Ankarna #utseende, #mejl, #prenumeration och #konto används av Hoppa till
 * och av omstyrningen från profilens gamla ankare.
 *
 * Profilen läses ur den summary som dashboard-layouten redan hämtat på
 * servern, så växlarna står i rätt läge i den HTML som når mobilen.
 */

import { useEffect } from 'react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import { RUBRIK } from '@/lib/rum/copy';
import { hjalpDoldUrProfil } from '@/lib/traning/hjalp';
import { menyHuvud } from '@/lib/onboarding/paket-rader';
import { paketKort, paketMedPris } from '@/lib/plans/plans';
import HoppaTill from '../profil/components/HoppaTill';
import { INSTALLNINGAR, KONTO_SEKTION } from '../profil/profil-copy';
import UtseendeSection from './components/UtseendeSection';
import KontoSection, { MejlSection, PrenumerationSection } from './components/KontoSection';
import { useKontoHandlingar } from './components/useKontoHandlingar';

const SEKTIONER = [
  { id: 'utseende', etikett: INSTALLNINGAR.hopp.utseende },
  { id: 'mejl', etikett: INSTALLNINGAR.hopp.mejl },
  { id: 'prenumeration', etikett: INSTALLNINGAR.hopp.prenumeration },
  { id: 'konto', etikett: INSTALLNINGAR.hopp.konto },
] as const;

export default function InstallningarClient({ epost, inloggningSatt }: { epost: string; inloggningSatt: string }) {
  const { summary } = useDashboardData();
  const profil = (summary?.profile as Record<string, unknown> | null) ?? null;
  const { handleLogout, handleDeleteAccount, harPaket } = useKontoHandlingar();

  // Ankaret vid klientnavigering: Next scrollar innan sektionen finns. En
  // gång vid mount, och bara om rubriken inte redan syns (som på profilen).
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!SEKTIONER.some((s) => s.id === id) && id !== 'hjalp') return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight / 2) el.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const paket = summary?.paket ?? null;
  const medPaket = Boolean(paket?.scope && paket.planKey);
  const prenumeration = medPaket && paket?.planKey
    ? { titel: paketMedPris(paket.planKey), text: menyHuvud(paket).under, chip: paketKort() }
    : { titel: KONTO_SEKTION.gratisRubrik, text: KONTO_SEKTION.gratis, chip: null };

  return (
    <>
      <RumHuvud title={RUBRIK.installningar} description={INSTALLNINGAR.under} />
      <Golv>
        <div className="w-full max-w-[768px] space-y-4 lg:space-y-6">
          <HoppaTill sektioner={SEKTIONER} />

          <UtseendeSection initialHjalpDold={hjalpDoldUrProfil(profil)} />

          <MejlSection
            initialDigestOptOut={profil?.weekly_digest_opt_out === true}
            initialQuotaOptOut={profil?.quota_emails_opt_out === true}
          />

          <PrenumerationSection titel={prenumeration.titel} text={prenumeration.text} chip={prenumeration.chip} />

          <KontoSection
            epost={epost || String(profil?.email ?? '')}
            inloggningSatt={inloggningSatt}
            harPaket={harPaket}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        </div>
      </Golv>
    </>
  );
}
