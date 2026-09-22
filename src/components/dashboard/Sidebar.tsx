'use client';

/**
 * Sidomenyn (docs/designsystem.md, "Informationsarkitektur", och
 * docs/design/spec-onboarding-2026-09-22.html, sektion 3 och 5).
 *
 * 256 px panel på mark. Överst menyhuvudet i ink-1: vilket paket man har,
 * när det förnyas och vad det kostar, med "Vad ingår?". Tre grupper:
 * Översikt/Ansökningar/CV/Brev utan rubrik, Verktyg, Konto. Varje val bär
 * en underrad som säger vad som ingår ("3 mallar, en nedladdning") eller att
 * det inte ingår och i vilket paket det finns. Det som inte ingår är grått
 * med lås, och trycket öppnar betalväggen för rätt paket med
 * mellanskillnaden. Längst ned hjälpredan Kom igång, sedan Hjälp.
 *
 * Talen kommer ur summeringen (scope och kvoter), aldrig hårdkodade.
 */

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { scheduleIdle } from '@/lib/scheduleIdle';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_BY_KEY } from '@/lib/plans/plans';
import { menyFot, menyHuvud, menyRad, type MenyVal, type PaketLage } from '@/lib/onboarding/paket-rader';
import type { Feature } from '@/lib/access/features';
import type { PaywallVariant } from '@/components/paywall/paywall-copy';
import GraValSheet from '@/components/paywall/GraValSheet';
import KomIgangRad from './KomIgangRad';

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
  IkonSynlig,
} from '@/components/illustrations/Ikoner';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

/** Gratisnivån innan summeringen hunnit fram: allt ingår-texter blir gratisnivåns. */
const TOM_PAKET: PaketLage = {
  scope: null,
  track: null,
  planKey: null,
  fornyasAt: null,
  dayPassOnly: false,
  chatUsed: 0,
  chatLimit: null,
  lettersUsed: 0,
  lettersLimit: null,
};

export default function DashboardSidebar({ onClose, isMobile }: DashboardSidebarProps = {}) {
  // Profilen och paketet kommer ur den delade summeringen. Ingen egen
  // rundtur: menyn renderas på varje sida och har hemskärmens LCP-budget.
  const { summary } = useDashboardData();
  const profile = (summary?.profile ?? null) as {
    premium_until?: string | null;
    subscription_tier?: string | null;
    subscription_status?: string | null;
    subscription_id?: string | null;
  } | null;
  const paket: PaketLage = summary?.paket ?? TOM_PAKET;
  const huvud = menyHuvud(paket);
  const fot = menyFot(paket);

  // Kort status bredvid raden Profil och prenumeration: "Aktiv" / "5 dagar
  // kvar" / "Från 49 kr". Kanten tänds bara när paketet behöver
  // uppmärksamhet: gratis, eller snart slut.
  let premiumLabel: string | null = null;
  let premiumNeedsAttention = false;
  if (profile) {
    const hasPremiumUntil =
      Boolean(profile.premium_until) && new Date(profile.premium_until as string) > new Date();
    const hasPremiumTier = profile.subscription_tier === 'premium';
    const liveSub =
      !!profile.subscription_id &&
      !String(profile.subscription_id).startsWith('sub_test') &&
      ['active', 'trialing', 'past_due', 'unpaid'].includes(profile.subscription_status ?? '');

    if (liveSub) {
      premiumLabel = 'Aktiv';
    } else if (hasPremiumTier && hasPremiumUntil) {
      const daysLeft = Math.max(
        1,
        Math.ceil((new Date(profile.premium_until as string).getTime() - Date.now()) / 86400000)
      );
      premiumLabel = `${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar`;
      premiumNeedsAttention = daysLeft <= 2;
    } else if (hasPremiumTier) {
      premiumLabel = 'Aktiv';
    } else {
      // Priset läses ur PLANS. Allt-dagen är lägsta priset i stegen, och
      // skrivs alltid som "från" (ägarens beslut 4).
      premiumLabel = `Från ${PLAN_BY_KEY.all_day.amount} kr`;
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

  // Ett grått val tryckt: betalväggen för rätt paket.
  const [sparr, setSparr] = useState<{ feature: Feature; variant: PaywallVariant } | null>(null);

  useEffect(() => {
    if (!userId) return;
    const uid: string = userId;

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

    // Ingenting av det här behövs för första målningen.
    scheduleIdle(() => loadAdminAndCounts(), 3000);

    return () => {
      cancelled = true;
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase, userId]);

  const hasNoCv = cvCount !== null && cvCount === 0;

  /** Underraden för ett val, och det gråa läget om valet inte ingår. */
  const rad = (val: MenyVal) => menyRad(val, paket);
  const graProps = (val: MenyVal) => {
    const r = rad(val);
    if (r.ingar || !r.feature || !r.variant) return { sublabel: r.text };
    const feature = r.feature;
    const variant = r.variant;
    return {
      sublabel: r.text,
      locked: true,
      onLocked: () => setSparr({ feature, variant }),
    };
  };

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
        {/* Menyhuvudet: paketet, förnyelsen, priset. Ink-1 med vit text,
            samma yta som Kom igång-raden och Allt-kortet. */}
        <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-ink-1 px-3 py-3 text-white">
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5">{huvud.rubrik}</span>
            <span className="block truncate text-xs leading-4 text-ink-1-mjuk">{huvud.under}</span>
          </span>
          <a
            href={huvud.href}
            onClick={() => isMobile && onClose?.()}
            className="shrink-0 text-xs font-medium text-white underline decoration-ink-1-kant underline-offset-[3px] hover:decoration-white"
          >
            {huvud.lank}
          </a>
        </div>

        <SidebarSection>
          <SidebarLink
            href="/dashboard"
            label="Mitt jobbsök"
            icon={IkonHem}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/sokta-tjanster"
            label="Sökta tjänster"
            icon={IkonAnsokningar}
            count={applicationCount}
            sublabel={rad('sokta').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil/cv"
            label="Mina CV"
            icon={IkonCv}
            count={cvCount}
            sublabel={hasNoCv ? 'Ladda upp ditt första CV' : rad('cv').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/mina-brev"
            label="Personliga brev"
            icon={IkonBrev}
            count={letterCount}
            sublabel={rad('brev').text}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        <SidebarSection eyebrow="Verktyg">
          <SidebarLink
            href="/dashboard/skapa-brev"
            label="Skriv nytt brev"
            icon={IkonSkapa}
            sublabel="Klistra in annonsen, vi skriver"
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-analys"
            label="Analysera CV"
            icon={IkonAnalys}
            sublabel={rad('analys').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbmatchning"
            label="Matchade jobb"
            icon={IkonMatchning}
            sublabel={rad('matchning').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-mallar"
            label="CV-mallar"
            icon={IkonMallar}
            sublabel={rad('mallar').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/tester"
            label="Rekryteringstester"
            icon={IkonBalanserad}
            sublabel={rad('tester').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/linkedin-optimizer"
            label="LinkedIn-profilen"
            icon={IkonLank}
            {...graProps('linkedin')}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbcoachen"
            label="Jobbcoachen"
            icon={IkonEntusiastisk}
            sublabel={rad('coach').text}
            isMobile={isMobile}
            onClick={onClose}
          />
          {rad('bli_upptackt').ingar ? (
            <BliUpptacktSidebarLink isMobile={isMobile} onClose={onClose} />
          ) : (
            <SidebarLink
              href="/dashboard/bli-upptackt"
              label="Bli upptäckt"
              icon={IkonSynlig}
              {...graProps('bli_upptackt')}
              isMobile={isMobile}
              onClick={onClose}
            />
          )}
        </SidebarSection>

        <SidebarSection eyebrow="Konto">
          <SidebarLink
            href="/dashboard/profil/prenumeration"
            label="Profil och prenumeration"
            icon={IkonKrona}
            sublabel={premiumLabel ?? undefined}
            highlight={premiumNeedsAttention}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil"
            label="Profil"
            icon={IkonProfil}
            exact
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        {/* Spårkundens fotrad: vad Allt kostar till, och att det öppnar det gråa. */}
        {fot ? <p className="px-3 pt-4 text-xs leading-4 text-ink-3">{fot}</p> : null}
      </nav>

      {/* Hjälpredan Kom igång längst ned i sidomenyn (sektion 5). */}
      <div className="px-3 pb-2 empty:hidden">
        <KomIgangRad variant="sidomeny" />
      </div>

      <SidebarFooter
        isAdmin={isAdmin}
        isMobile={isMobile}
        onLinkClick={onClose}
      />

      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature={sparr.feature}
          variant={sparr.variant}
          scope={paket.scope}
          track={paket.track}
          planKey={paket.planKey}
          surface="sidomeny"
        />
      ) : null}
    </div>
  );
}
