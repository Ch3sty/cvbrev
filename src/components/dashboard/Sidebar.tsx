'use client';

/**
 * Sidomenyn (docs/designsystem.md, "Informationsarkitektur", och
 * docs/design/spec-onboarding-2026-09-22.html, sektion 3 och 5).
 *
 * 256 px panel på mark. Överst menyhuvudet i ink-1: vilket paket man har,
 * när det förnyas och vad det kostar, med "Vad ingår?". Sedan fyra tunga
 * val med antal (Mitt jobbsök, Sökta tjänster, Mina CV, Personliga brev),
 * verktygen i tre namngivna grupper i lättare vikt (Skriv och förbättra,
 * Hitta jobb, Träna) och Konto (regel 8 i
 * docs/design/analys-visuell-linje-2026-09-22.html). Inga underrader: vad
 * som ingår står i sidhuvudet på respektive sida och i "Vad ingår?". Det
 * som inte ingår är grått med lås, och trycket öppnar betalväggen för rätt
 * paket med mellanskillnaden. Längst ned hjälpredan Kom igång, sedan Hjälp.
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
  IkonSynlig,
  IkonIntervju,
} from '@/components/illustrations/Ikoner';

/** Nyhet-etiketten på Inför intervjun tas bort 2026-10-22, svensk midnatt. */
const NYHET_INFOR_INTERVJUN_TILL = Date.parse('2026-10-22T00:00:00+02:00');

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
  const { summary, refresh } = useDashboardData();
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
      // Priset läses ur PLANS. Dagspasset är lägsta priset i stegen, och
      // skrivs alltid som "från" (ägarens beslut 4).
      premiumLabel = `Från ${PLAN_BY_KEY.all_day.amount} kr`;
      premiumNeedsAttention = true;
    }
  }

  const { user } = useAuth();
  const userId = user?.id ?? null;

  // Antalen och adminlänken kommer ur den delade summeringen, som layouten
  // läser på servern. Menyn gjorde förut en adminfråga och tre count-frågor
  // efter mount, på varje sida.
  const isAdmin = Boolean(summary?.arAdmin);
  const cvCount = summary?.sidomeny?.cv ?? summary?.cv.count ?? null;
  const letterCount = summary?.sidomeny?.brev ?? null;
  const applicationCount = summary?.sidomeny?.ansokningar ?? null;
  const supabase = getSupabaseClient();

  // Ett grått val tryckt: betalväggen för rätt paket.
  const [sparr, setSparr] = useState<{ feature: Feature; variant: PaywallVariant } | null>(null);

  // Antalen hålls levande: ändras CV, brev eller ansökningar i en annan flik
  // eller i ett flöde hämtas summeringen om, en gång per skur av ändringar.
  // Kanalerna öppnas först när sidan är ledig; ingen av dem behövs för
  // första målningen.
  useEffect(() => {
    if (!userId) return;
    const uid: string = userId;
    const channels: ReturnType<typeof supabase.channel>[] = [];
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const hamtaOm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void refresh(), 800);
    };

    const oppna = () => {
      if (cancelled) return;
      for (const table of ['cv_texts', 'letters', 'job_applications']) {
        channels.push(
          supabase
            .channel(`sidebar_${table}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table, filter: `user_id=eq.${uid}` }, hamtaOm)
            .subscribe()
        );
      }
    };

    const avbryt = scheduleIdle(oppna, 3000);

    return () => {
      cancelled = true;
      avbryt?.();
      if (timer) clearTimeout(timer);
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [supabase, userId, refresh]);


  /**
   * Det gråa läget om valet inte ingår. menyRad levererar fortfarande
   * texten ("Ingår i CV-paketet"), men den läses bara upp för skärmläsare
   * på den låsta raden; menyn visar inga underrader.
   */
  const rad = (val: MenyVal) => menyRad(val, paket);
  const graProps = (val: MenyVal) => {
    const r = rad(val);
    if (r.ingar || !r.feature || !r.variant) return {};
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
        <div className="mb-2 flex items-start justify-between gap-3 rounded-xl bg-ink-1 px-3 py-3 text-white">
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-5 break-words">{huvud.rubrik}</span>
            <span className="mt-0.5 block text-xs leading-4 text-ink-1-mjuk">{huvud.under}</span>
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
            tung
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/sokta-tjanster"
            label="Sökta tjänster"
            icon={IkonAnsokningar}
            count={applicationCount}
            tung
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/profil/cv"
            label="Mina CV"
            icon={IkonCv}
            count={cvCount}
            tung
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/mina-brev"
            label="Personliga brev"
            icon={IkonBrev}
            count={letterCount}
            tung
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        <SidebarSection eyebrow="Skriv och förbättra">
          <SidebarLink
            href="/dashboard/skapa-brev"
            label="Skriv nytt brev"
            icon={IkonSkapa}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-analys"
            label="Analysera CV"
            icon={IkonAnalys}
            {...graProps('analys')}
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/cv-mallar"
            label="CV-mallar"
            icon={IkonMallar}
            {...graProps('mallar')}
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
        </SidebarSection>

        <SidebarSection eyebrow="Hitta jobb">
          <SidebarLink
            href="/dashboard/jobbmatchning"
            label="Matchade jobb"
            icon={IkonMatchning}
            {...graProps('matchning')}
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

        <SidebarSection eyebrow="Träna">
          <SidebarLink
            href="/dashboard/tester"
            label="Rekryteringstester"
            icon={IkonBalanserad}
            {...graProps('tester')}
            isMobile={isMobile}
            onClick={onClose}
          />
          {/* Inför intervjun (docs/design/rod-trad-prov-spec-2026-09-24.md). Ingår i
              alla nivåer, så raden är aldrig grå. Nyhet i fyra veckor, till
              och med 2026-10-21 (ägarens beslut 8): efter det faller etiketten
              bort av sig själv. */}
          <SidebarLink
            href="/dashboard/intervju"
            label="Inför intervjun"
            icon={IkonIntervju}
            badge={
              Date.now() < NYHET_INFOR_INTERVJUN_TILL ? (
                <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.04em] text-accent-ink">Nyhet</span>
              ) : undefined
            }
            isMobile={isMobile}
            onClick={onClose}
          />
          <SidebarLink
            href="/dashboard/jobbcoachen"
            label="Jobbcoachen"
            icon={IkonEntusiastisk}
            {...graProps('coach')}
            isMobile={isMobile}
            onClick={onClose}
          />
        </SidebarSection>

        <SidebarSection eyebrow="Konto">
          <SidebarLink
            href="/dashboard/profil/prenumeration"
            label="Profil och prenumeration"
            icon={IkonKrona}
            badge={
              premiumLabel ? <span className="text-meta text-ink-3">{premiumLabel}</span> : undefined
            }
            highlight={premiumNeedsAttention}
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
