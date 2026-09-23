'use client';

/**
 * Toppraden (docs/designsystem.md, "Informationsarkitektur").
 *
 * Var man är till vänster ("Träna · Rekryteringstester"), meddelanden,
 * notisklocka och profilmeny till höger. Hälsningen flyttade in i
 * hemskärmens display-h1 (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 3), så toppraden säger bara platsen. Klockan flyttar sig aldrig.
 * Panel på mark, hårlinje under.
 */

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
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

/** Toppradens plats: gruppen i sidomenyn och sidans namn. */
const PLATSER: Array<[string, string]> = [
  ['/dashboard/sokta-tjanster', 'Sökta tjänster'],
  ['/dashboard/profil/cv', 'Mina CV'],
  ['/dashboard/mina-brev', 'Personliga brev'],
  ['/dashboard/skapa-brev', 'Skriv och förbättra · Skriv nytt brev'],
  ['/dashboard/cv-analys', 'Skriv och förbättra · Analysera CV'],
  ['/dashboard/cv-mallar', 'Skriv och förbättra · CV-mallar'],
  ['/dashboard/linkedin-optimizer', 'Skriv och förbättra · LinkedIn-profilen'],
  ['/dashboard/jobbmatchning', 'Hitta jobb · Matchade jobb'],
  ['/dashboard/bli-upptackt', 'Hitta jobb · Bli upptäckt'],
  ['/dashboard/tester', 'Träna · Rekryteringstester'],
  ['/dashboard/jobbcoachen', 'Träna · Jobbcoachen'],
  ['/dashboard/profil/prenumeration', 'Konto · Profil och prenumeration'],
  ['/dashboard/profil', 'Konto · Profil'],
];

function plats(pathname: string): string {
  if (pathname === '/dashboard') return 'Mitt jobbsök';
  return PLATSER.find(([p]) => pathname === p || pathname.startsWith(p + '/'))?.[1] ?? 'Jobbcoach.ai';
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname() ?? '/dashboard';
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
          <p className="truncate text-sm font-medium text-ink-2">{plats(pathname)}</p>
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
