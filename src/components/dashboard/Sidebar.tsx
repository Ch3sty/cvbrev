'use client';

/**
 * Sidomenyn (docs/designsystem.md, "Informationsarkitektur").
 *
 * 256 px panel på mark, tre grupper: Översikt/Ansökningar/CV/Brev utan
 * rubrik, Verktyg, Konto. Hjälp längst ner. Aktiv rad får tråden. Antal till
 * höger i metadata. Premium-raden i gratisläge får kant, inte orange ram.
 * Ikonerna är de tolv motiven ur Ikoner.tsx, nakna i 20 px.
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { scheduleIdle } from '@/lib/scheduleIdle';
import { useAuth } from '@/contexts/AuthContext';

import SidebarLogo from './sidebar/SidebarLogo';
import SidebarSection from './sidebar/SidebarSection';
import SidebarLink from './sidebar/SidebarLink';
import BliUpptacktSidebarLink from './sidebar/BliUpptacktSidebarLink';
import SidebarFooter from './sidebar/SidebarFooter';
import {
  IkonHem,
  IkonAnsokningar,
  IkonCv,
  IkonBrev,
  IkonSkapa,
  IkonAnalys,
  IkonMatchning,
  IkonMallar,
  IkonBalanserad,
  IkonLank,
  IkonEntusiastisk,
  IkonKrona,
  IkonProfil,
} from '@/components/illustrations/Ikoner';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function DashboardSidebar({ onClose, isMobile }: DashboardSidebarProps = {}) {
  // Profilen kommer ur den delade summaryn. Tidigare gjorde sidebaren ett eget
  // auth.getUser() plus en select mot profiles för exakt samma fält.
  const { summary } = useDashboardData();
  const profile = (summary?.profile ?? null) as {
    premium_until?: string | null;
    subscription_tier?: string | null;
    subscription_status?: string | null;
    subscription_id?: string | null;
  } | null;

  // Kort status bredvid Premium-raden: "5 dagar kvar" / "Aktiv" / "Gratis".
  // Kanten tänds bara när Premium betyder något: gratis, eller snart slut.
  // Härledningen speglar headern så statusen aldrig säger emot sig själv.
  let premiumLabel: string | null = null;
  let premiumNeedsAttention = false;
  if (profile) {
    const hasPremiumUntil =
      Boolean(profile.premium_until) && new Date(profile.premium_until as string) > new Date();
    const hasPremiumTier = profile.subscription_tier === 'premium';

    // En levande Stripe-prenumeration förnyas, så den visar "Aktiv"
    // i stället för en nedräkning.
    const liveSub =
      !!profile.subscription_id &&
      !String(profile.subscription_id).startsWith('sub_test') &&
      ['active', 'trialing', 'past_due', 'unpaid'].includes(profile.subscription_status ?? '');

    if (liveSub) {
      premiumLabel = 'Aktiv';
      premiumNeedsAttention = false;
    } else if (hasPremiumTier && hasPremiumUntil) {
      const daysLeft = Math.max(
        1,
        Math.ceil((new Date(profile.premium_until as string).getTime() - Date.now()) / 86400000)
      );
      premiumLabel = `${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar`;
      premiumNeedsAttention = daysLeft <= 2;
    } else if (hasPremiumTier) {
      premiumLabel = 'Aktiv';
      premiumNeedsAttention = false;
    } else {
      premiumLabel = 'Gratis';
      premiumNeedsAttention = true;
    }
  }

  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [isAdmin, setIsAdmin] = useState(false);
  const [cvCount, setCvCount] = useState<number | null>(null);
  const [letterCount, setLetterCount] = useState<number | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!userId) return;
    const uid: string = userId;

    // Kanaler skapas async (efter att userId hämtats) men måste städas i en
    // synkront körande cleanup. Håll dem i en array plus en cancelled-flagga.
    const channels: ReturnType<typeof supabase.channel>[] = [];
    let cancelled = false;

    const loadAdminAndCounts = async () => {
      try {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', uid)
          .eq('role', 'super_admin')
          .maybeSingle();
        setIsAdmin(!!adminData);

        await refreshCounts(uid);

        if (cancelled) return;

        // Realtime: lyssna på cv_texts, letters och job_applications så
        // antalen uppdateras direkt. Filtrerat på den inloggade användaren.
        channels.push(
          supabase
            .channel('sidebar_cv_texts_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'cv_texts', filter: `user_id=eq.${uid}` },
              () => refreshCounts(uid)
            )
            .subscribe(),
          supabase
            .channel('sidebar_letters_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'letters', filter: `user_id=eq.${uid}` },
              () => refreshCounts(uid)
            )
            .subscribe(),
          supabase
            .channel('sidebar_job_applications_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'job_applications', filter: `user_id=eq.${uid}` },
              () => refreshCounts(uid)
            )
            .subscribe()
        );
      } catch (error) {
        console.error('Sidebar: error loading admin and counts', error);
      }
    };

    const refreshCounts = async (uid: string) => {
      const [{ count: cvCountResult }, { count: letterCountResult }, { count: applicationCountResult }] = await Promise.all([
        supabase
          .from('cv_texts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
        supabase
          .from('letters')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('is_saved', true),
        supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
      ]);
      setCvCount(cvCountResult ?? 0);
      setLetterCount(letterCountResult ?? 0);
      setApplicationCount(applicationCountResult ?? 0);
    };

    // Adminflaggan, de tre räknarna och realtidskanalerna rör sidomenyns
    // siffror. Ingenting av det behövs för första målningen, så det körs
    // först när tråden är ledig.
    scheduleIdle(() => loadAdminAndCounts(), 3000);

    return () => {
      cancelled = true;
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase, userId]);

  const hasNoCv = cvCount !== null && cvCount === 0;

  return (
    <div
      className={`relative z-10 flex h-full flex-col border-r border-kant bg-panel ${
        isMobile ? 'w-full' : 'w-64'
      }`}
    >
      <SidebarLogo isMobile={isMobile} onClose={onClose} />

      <nav
        className="flex-1 overflow-y-auto px-3 pb-4"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        aria-label="Sidomeny"
      >
        {/* Det dagliga, utan rubrik. Ansökningar först efter Översikt: det
            är det enda som förändras utan att användaren gör något. */}
        <SidebarSection>
          <SidebarLink
            href="/dashboard"
            label="Översikt"
            icon={IkonHem}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/sokta-tjanster"
            label="Ansökningar"
            icon={IkonAnsokningar}
            count={applicationCount}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil/cv"
            label="CV"
            icon={IkonCv}
            count={cvCount}
            sublabel={hasNoCv ? 'Ladda upp ditt första CV' : undefined}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/mina-brev"
            label="Brev"
            icon={IkonBrev}
            count={letterCount}
            sublabel={hasNoCv ? 'Ladda upp CV först' : undefined}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* Verktyg: värdefullt men inte dagligt. De två som leder till en
            färdig handling först. */}
        <SidebarSection eyebrow="Verktyg">
          <SidebarLink
            href="/dashboard/skapa-brev"
            label="Skriv brev"
            icon={IkonSkapa}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-analys"
            label="Analysera CV"
            icon={IkonAnalys}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbmatchning"
            label="Jobbmatchning"
            icon={IkonMatchning}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-mallar"
            label="CV-mallar"
            icon={IkonMallar}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/tester"
            label="Rekryteringstester"
            icon={IkonBalanserad}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/linkedin-optimizer"
            label="LinkedIn"
            icon={IkonLank}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbcoachen"
            label="Jobbcoachen"
            icon={IkonEntusiastisk}
            isMobile={isMobile}
            onClick={onClose}
          />
          <BliUpptacktSidebarLink isMobile={isMobile} onClose={onClose} />
        </SidebarSection>

        {/* Konto: Premium först, sedan profilen. Premium-raden får kant när
            kontot är gratis eller nära slutet. Aldrig fylld orange yta. */}
        <SidebarSection eyebrow="Konto">
          <SidebarLink
            href="/dashboard/profil/prenumeration"
            label="Premium"
            icon={IkonKrona}
            badge={premiumLabel ? <span className="text-meta text-ink-3">{premiumLabel}</span> : undefined}
            highlight={premiumNeedsAttention}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil"
            label="Profil"
            icon={IkonProfil}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>
      </nav>

      <SidebarFooter
        isAdmin={isAdmin}
        isMobile={isMobile}
        onLinkClick={onClose}
      />
    </div>
  );
}
