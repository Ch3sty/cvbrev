'use client';

/**
 * Dashboardens header (docs/plan-inloggat-saljflode.md, punkt 9).
 *
 * Bantad enligt planen: datumraden och streak-pillen är borta. Streaken hör
 * hemma i dashboardens statusrad där siffran har sammanhang, inte i headern
 * som en färgad dekoration. Profilblocket är numera en meny, så kontoåtgärder
 * har en samlad plats och dubbletten mot sidebar och mobilnav försvinner.
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
  // Tidigare gjorde headern en egen profilhämtning här: ett auth-anrop och en
  // select mot profiles. Exakt samma fält ligger i den delade summaryn, så
  // raden kostar numera inget eget nätverksanrop.
  const { summary } = useDashboardData();
  const data = (summary?.profile ?? null) as {
    full_name?: string | null;
    profile_photo_url?: string | null;
    premium_until?: string | null;
    subscription_tier?: string | null;
    subscription_status?: string | null;
    subscription_id?: string | null;
  } | null;

  // Samma härledning som sidebaren, så statusen aldrig säger emot sig själv.
  // Innan summaryn landat är etiketten null, precis som det tomma
  // starttillståndet var förut. Ingen ny layoutförskjutning.
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
      className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 sticky top-0 lg:relative z-30 lg:z-10"
    >
      <div className="flex items-center justify-between gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden h-11 w-11 -ml-2 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
            aria-label="Öppna meny"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {getGreeting()}, {getFirstName()}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
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
