'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

import SidebarLogo from './sidebar/SidebarLogo';
import SidebarSection from './sidebar/SidebarSection';
import SidebarLink from './sidebar/SidebarLink';
import BliUpptacktSidebarLink from './sidebar/BliUpptacktSidebarLink';
import SidebarFooter from './sidebar/SidebarFooter';
import FeatureSpotlight from './sidebar/FeatureSpotlight';
import {
  OversiktIcon,
  CvIcon,
  BrevIcon,
  SoktaTjansterIcon,
  NyttCvIcon,
  NyttBrevIcon,
  MallIcon,
  ForbattraIcon,
  JobbmatchningIcon,
  JobbcoachenIcon,
  LinkedinIcon,
  TesterIcon,
  BeloningarIcon,
  ProfilIcon,
  KronaIcon,
} from './sidebar/illustrations/MenuIcons';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function DashboardSidebar({ onClose, isMobile }: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cvCount, setCvCount] = useState<number | null>(null);
  const [letterCount, setLetterCount] = useState<number | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const supabase = getSupabaseClient();


  useEffect(() => {
    // Kanaler skapas async (efter att userId hamtats) men maste stadas i en
    // synkront korande cleanup. Hall dem i en array + en cancelled-flagga.
    const channels: ReturnType<typeof supabase.channel>[] = [];
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user?.id) return;

        const userId = user.id;

        const { data: profile } = await supabase
          .from('profiles')
          .select('premium_until, subscription_tier')
          .eq('id', userId)
          .single();

        const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date();
        const hasPremiumTier = profile?.subscription_tier === 'premium';
        setIsPremium(hasPremiumUntil || hasPremiumTier);

        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', userId)
          .eq('role', 'super_admin')
          .maybeSingle();
        setIsAdmin(!!adminData);

        await refreshCounts(userId);

        // Om komponenten unmountats medan vi laddade: hoppa over realtime.
        if (cancelled) return;

        // Realtime: lyssna pa cv_texts + letters sa countarna uppdateras direkt
        // efter att anvandaren laddar upp CV / sparar brev (utan ctrl+shift+r).
        // Filtrerat pa den inloggade anvandaren — annars triggas refreshCounts
        // av ALLA anvandares andringar (onodiga queries + integritetslackage).
        channels.push(
          supabase
            .channel('sidebar_cv_texts_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'cv_texts', filter: `user_id=eq.${userId}` },
              () => refreshCounts(userId)
            )
            .subscribe(),
          supabase
            .channel('sidebar_letters_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'letters', filter: `user_id=eq.${userId}` },
              () => refreshCounts(userId)
            )
            .subscribe(),
          supabase
            .channel('sidebar_job_applications_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'job_applications', filter: `user_id=eq.${userId}` },
              () => refreshCounts(userId)
            )
            .subscribe()
        );
      } catch (error) {
        console.error('Sidebar: error loading profile', error);
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

    loadProfile();

    return () => {
      cancelled = true;
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const hasNoCv = cvCount !== null && cvCount === 0;
  const isProfilActive = pathname === '/dashboard/profil' || pathname.startsWith('/dashboard/profil/');

  return (
    <div
      className={`bg-gradient-to-b from-orange-50/40 via-white to-orange-50/30 h-full ${
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
        {/* HUVUDMENY */}
        <SidebarSection>
          <SidebarLink
            href="/dashboard"
            label="Översikt"
            icon={OversiktIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* MINA DOKUMENT */}
        <SidebarSection eyebrow="Mina dokument">
          <SidebarLink
            href="/dashboard/profil/cv"
            label="Mina CV:n"
            icon={CvIcon}
            count={cvCount}
            sublabel={hasNoCv ? 'Ladda upp ditt första CV' : undefined}
            highlight={hasNoCv}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/mina-brev"
            label="Sparade brev"
            icon={BrevIcon}
            count={letterCount}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/sokta-tjanster"
            label="Sökta tjänster"
            icon={SoktaTjansterIcon}
            count={applicationCount}
            badge={
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-orange-500 to-red-600">
                Nyhet
              </span>
            }
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* SKAPA NYTT */}
        <SidebarSection eyebrow="Skapa nytt">
          <SidebarLink
            href="/dashboard/skapa-cv"
            label="Nytt CV"
            icon={NyttCvIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/skapa-brev"
            label="Nytt personligt brev"
            icon={NyttBrevIcon}
            sublabel={hasNoCv ? 'Ladda upp CV först' : undefined}
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
        </SidebarSection>

        {/* UPPTÄCK */}
        <SidebarSection eyebrow="Upptäck">
          <SidebarLink
            href="/dashboard/cv-analys"
            label="Förbättra CV"
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
          <BliUpptacktSidebarLink isMobile={isMobile} onClose={onClose} />
          <SidebarLink
            href="/dashboard/jobbcoachen"
            label="Jobbcoachen"
            icon={JobbcoachenIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/linkedin-optimizer"
            label="Förbättra LinkedIn-profil"
            icon={LinkedinIcon}
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
            href="/dashboard/rewards"
            label="Belöningar"
            icon={BeloningarIcon}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* Feature spotlight */}
        <FeatureSpotlight isMobile={isMobile} onLinkClick={onClose} />

        {/* KONTO */}
        <SidebarSection eyebrow="Konto">
          <li>
            <Link
              href="/dashboard/profil"
              prefetch={true}
              onClick={() => isMobile && onClose?.()}
              className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 ${
                isMobile ? 'min-h-[56px]' : 'min-h-[44px]'
              } ${
                isProfilActive
                  ? 'bg-gradient-to-r from-orange-50 to-rose-50/60'
                  : 'hover:bg-orange-50/60'
              }`}
            >
              {isProfilActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                  style={{
                    background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                  }}
                />
              )}

              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                  isProfilActive ? 'text-white' : 'text-orange-700 bg-orange-50 group-hover:bg-orange-100'
                }`}
                style={
                  isProfilActive
                    ? {
                        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                      }
                    : undefined
                }
              >
                <ProfilIcon className="w-[18px] h-[18px]" />
                {isPremium && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <KronaIcon className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </motion.div>

              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span
                  className={`text-sm font-semibold leading-tight truncate ${
                    isProfilActive ? 'text-orange-900' : 'text-slate-700'
                  }`}
                >
                  Profil & prenumeration
                </span>
                {isPremium && (
                  <span
                    className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-amber-900"
                    style={{
                      background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    }}
                  >
                    Pro
                  </span>
                )}
              </div>
            </Link>
          </li>
        </SidebarSection>
      </nav>

      {/* Footer */}
      <SidebarFooter
        isAdmin={isAdmin}
        onLogout={handleLogout}
        isMobile={isMobile}
        onLinkClick={onClose}
      />
    </div>
  );
}
