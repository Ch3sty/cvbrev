'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { useAuth } from '@/contexts/AuthContext';

import SidebarLogo from './sidebar/SidebarLogo';
import SidebarSection from './sidebar/SidebarSection';
import SidebarLink from './sidebar/SidebarLink';
import BliUpptacktSidebarLink from './sidebar/BliUpptacktSidebarLink';
import SidebarFooter from './sidebar/SidebarFooter';
import {
  OversiktIcon,
  CvIcon,
  BrevIcon,
  SoktaTjansterIcon,
  MallIcon,
  ForbattraIcon,
  JobbmatchningIcon,
  JobbcoachenIcon,
  LinkedinIcon,
  TesterIcon,
  ProfilIcon,
  KronaIcon,
} from './sidebar/illustrations/MenuIcons';

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
  // Ramen tänds bara när Premium betyder något: gratis, eller snart slut.
  // Härledningen är ordagrant densamma som förut, bara datakällan är flyttad,
  // och den speglar headern så statusen aldrig säger emot sig själv.
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

    // Kanaler skapas async (efter att userId hamtats) men maste stadas i en
    // synkront korande cleanup. Hall dem i en array + en cancelled-flagga.
    const channels: ReturnType<typeof supabase.channel>[] = [];
    let cancelled = false;

    // userId kommer från AuthContext, som redan har hämtat användaren. Det egna
    // auth.getUser() här var en extra rundtur för ett värde vi redan hade.
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

        // Om komponenten unmountats medan vi laddade: hoppa over realtime.
        if (cancelled) return;

        // Realtime: lyssna pa cv_texts + letters sa countarna uppdateras direkt
        // efter att anvandaren laddar upp CV / sparar brev (utan ctrl+shift+r).
        // Filtrerat pa den inloggade anvandaren, annars triggas refreshCounts
        // av ALLA anvandares andringar (onodiga queries + integritetslackage).
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

    loadAdminAndCounts();

    return () => {
      cancelled = true;
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase, userId]);

  const hasNoCv = cvCount !== null && cvCount === 0;

  return (
    <div
      className={`bg-white h-full ${
        isMobile ? 'w-full' : 'w-72'
      } border-r border-orange-100 flex flex-col relative z-10`}
    >
      {/* Logo */}
      <SidebarLogo isMobile={isMobile} onClose={onClose} />

      {/* Navigation */}
      <nav
        className="flex-1 px-2 py-4 space-y-5 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      >
        {/* MITT JOBBSÖK: det som används dagligen, utan rubrik.
            Ansökningar ligger först efter Översikt eftersom de är den nya
            kärnan: det är det enda som förändras utan att användaren gör
            något, och därmed den enda naturliga dagliga rytmen vi har. */}
        <SidebarSection>
          <SidebarLink
            href="/dashboard"
            label="Översikt"
            icon={OversiktIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/sokta-tjanster"
            label="Ansökningar"
            icon={SoktaTjansterIcon}
            count={applicationCount}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil/cv"
            label="CV"
            icon={CvIcon}
            count={cvCount}
            sublabel={hasNoCv ? 'Ladda upp ditt första CV' : undefined}
            highlight={hasNoCv}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/mina-brev"
            label="Brev"
            icon={BrevIcon}
            count={letterCount}
            sublabel={hasNoCv ? 'Ladda upp CV först' : undefined}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* VERKTYG: värdefullt men inte dagligt. Ordningen följer planen:
            de två som leder till en färdig handling först. */}
        <SidebarSection eyebrow="Verktyg">
          <SidebarLink
            href="/dashboard/skapa-brev"
            label="Skriv brev"
            icon={BrevIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-analys"
            label="Analysera CV"
            icon={ForbattraIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbmatchning"
            label="Jobbmatchning"
            icon={JobbmatchningIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-mallar"
            label="CV-mallar"
            icon={MallIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/tester"
            label="Rekryteringstester"
            icon={TesterIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/linkedin-optimizer"
            label="LinkedIn"
            icon={LinkedinIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbcoachen"
            label="Jobbcoachen"
            icon={JobbcoachenIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <BliUpptacktSidebarLink isMobile={isMobile} onClose={onClose} />
        </SidebarSection>

        {/* KONTO: Premium först, sedan profilen */}
        <SidebarSection eyebrow="Konto">
          {/* Premium-raden är en rad som alla andra. Den får en tunn
              orange ram bara när kontot är gratis eller nära slutet, så
              att den syns när den betyder något. Aldrig fylld orange yta:
              den primära handlingen ligger i innehållet, inte i menyn. */}
          <SidebarLink
            href="/dashboard/profil/prenumeration"
            label="Premium"
            icon={KronaIcon}
            sublabel={premiumLabel ?? undefined}
            highlight={premiumNeedsAttention}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil"
            label="Profil"
            icon={ProfilIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>
      </nav>

      {/* Footer */}
      <SidebarFooter
        isAdmin={isAdmin}
        isMobile={isMobile}
        onLinkClick={onClose}
      />
    </div>
  );
}
