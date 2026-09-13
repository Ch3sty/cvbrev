'use client';

/**
 * Toppraden (docs/designsystem.md, "Informationsarkitektur").
 *
 * Hälsning till vänster, meddelanden, notisklocka och profilmeny till höger.
 * Klockan flyttar sig aldrig. Panel på mark, hårlinje under. Ingen
 * streak-pill, inget datum.
 */

import { Menu } from 'lucide-react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import NotificationBell from './NotificationBell';
import MessagesHeaderButton from './MessagesHeaderButton';
import ProfileMenu from './ProfileMenu';

interface DashboardHeaderProps {
  user: any;
  onMenuClick?: () => void;
}

/** Triggerns gamla platshållare räknas som saknat namn. */
function isMissingName(value: string | null | undefined): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.toLowerCase() === 'ej angivet';
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  // Profilfälten ligger i den delade summaryn, så raden kostar inget eget
  // nätverksanrop.
  const { summary } = useDashboardData();
  const data = (summary?.profile ?? null) as {
    full_name?: string | null;
    profile_photo_url?: string | null;
    premium_until?: string | null;
    subscription_tier?: string | null;
    subscription_status?: string | null;
    subscription_id?: string | null;
  } | null;

  // Samma härledning som sidomenyn, så statusen aldrig säger emot sig själv.
  let premiumLabel: string | null = null;
  if (data) {
    const hasPremiumUntil =
      Boolean(data.premium_until) && new Date(data.premium_until as string) > new Date();
    const hasPremiumTier = data.subscription_tier === 'premium';
    const liveSub =
      Boolean(data.subscription_id) &&
      !String(data.subscription_id).startsWith('sub_test') &&
      ['active', 'trialing', 'past_due', 'unpaid'].includes(
        data.subscription_status ?? ''
      );

    if (liveSub) {
      premiumLabel = 'Aktiv';
    } else if (hasPremiumTier && hasPremiumUntil) {
      const daysLeft = Math.max(
        1,
        Math.ceil(
          (new Date(data.premium_until as string).getTime() - Date.now()) / 86400000
        )
      );
      premiumLabel = `${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagar'} kvar`;
    } else if (hasPremiumTier) {
      premiumLabel = 'Aktiv';
    } else {
      premiumLabel = 'Gratis';
    }
  }

  const profileInfo = {
    full_name: data?.full_name || null,
    profile_photo_url: data?.profile_photo_url || null,
    premiumLabel,
  };

  const getUserName = () => {
    if (!isMissingName(profileInfo.full_name)) return profileInfo.full_name as string;
    const metaName = user?.user_metadata?.full_name ?? user?.user_metadata?.name;
    if (!isMissingName(metaName)) return metaName as string;
    if (user?.email) return String(user.email).split('@')[0];
    return 'Användare';
  };

  const getFirstName = () => getUserName().split(' ')[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5) return 'God natt';
    if (h < 10) return 'God morgon';
    if (h < 17) return 'Hej';
    if (h < 22) return 'God kväll';
    return 'God natt';
  };

  const avatarUrl =
    profileInfo.profile_photo_url || user?.user_metadata?.avatar_url || null;
  const userName = getUserName();

  return (
    <header
      data-dashboard-header
      className="sticky top-0 z-30 border-b border-kant bg-panel px-2 sm:px-4 lg:relative lg:z-10 lg:px-6"
    >
      <div className="flex h-14 items-center gap-1">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-1 transition-colors hover:bg-insunken lg:hidden"
            aria-label="Öppna meny"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>
        )}

        <div className="min-w-0 flex-1 px-2 lg:px-0">
          <p className="truncate text-base font-semibold tracking-[-0.01em] text-ink-1">
            {getGreeting()}, {getFirstName()}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <MessagesHeaderButton />
          <NotificationBell />
          <ProfileMenu
            name={userName}
            email={user?.email ?? ''}
            avatarUrl={avatarUrl}
            premiumLabel={profileInfo.premiumLabel}
          />
        </div>
      </div>
    </header>
  );
}
