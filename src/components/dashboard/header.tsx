'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';
import { IconEld } from './illustrations/DashboardIcons';
import NotificationBell from './NotificationBell';
import MessagesHeaderButton from './MessagesHeaderButton';

interface DashboardHeaderProps {
  user: any;
  onMenuClick?: () => void;
}

interface ProfileInfo {
  full_name: string | null;
  profile_photo_url: string | null;
  daily_streak: number;
}

export default function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({
    full_name: null,
    profile_photo_url: null,
    daily_streak: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        const [profileRes, streakRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, profile_photo_url')
            .eq('id', user.id)
            .single(),
          supabase
            .from('global_user_stats')
            .select('daily_streak')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        setProfileInfo({
          full_name: profileRes.data?.full_name || null,
          profile_photo_url: profileRes.data?.profile_photo_url || null,
          daily_streak: streakRes.data?.daily_streak || 0,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const getUserName = () => {
    if (profileInfo.full_name) return profileInfo.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Användare';
  };

  const getFirstName = () => getUserName().split(' ')[0];

  const getAvatarUrl = () => {
    return profileInfo.profile_photo_url || user?.user_metadata?.avatar_url || null;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 5) return 'God natt';
    if (h < 10) return 'God morgon';
    if (h < 17) return 'Hej';
    if (h < 22) return 'God kväll';
    return 'God natt';
  };

  const getTodayLabel = () => {
    return new Date().toLocaleDateString('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const avatarUrl = getAvatarUrl();
  const userName = getUserName();
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-orange-100 px-3 sm:px-4 md:px-6 py-3 md:py-4 sticky top-0 lg:relative z-30 lg:z-10">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 sm:p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            aria-label="Öppna meny"
          >
            <Menu className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}

        {/* Vanster: Halsning + datum (desktop) */}
        <div className="flex-1 min-w-0 hidden lg:flex items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
                aria-hidden="true"
              />
              Din dashboard
            </div>
            <h1 className="text-base font-black text-slate-900 truncate leading-tight">
              {getGreeting()}, {getFirstName()}
            </h1>
            <p className="text-xs text-slate-500 capitalize">{getTodayLabel()}</p>
          </div>
        </div>

        {/* Mobil: tom flex */}
        <div className="flex-1 lg:hidden" />

        {/* Hoger: Meddelanden + Notiser + Streak-pill + Profil */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Meddelanden från rekryterare (indigo, skild från notisklockan) */}
          <MessagesHeaderButton />

          {/* Notisklocka */}
          <NotificationBell />

          {/* Streak-pill - bara om streak > 0 */}
          {profileInfo.daily_streak > 0 && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
              }}
            >
              <IconEld className="w-3.5 h-3.5" />
              <span className="tabular-nums">{profileInfo.daily_streak}</span>
              <span className="opacity-90 font-bold">
                {profileInfo.daily_streak === 1 ? 'dag' : 'dgr'}
              </span>
            </Link>
          )}

          {/* Mobile: kompakt profil-lank */}
          <Link
            href="/dashboard/profil"
            className="lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Min profil"
          >
            <AvatarFrame avatarUrl={avatarUrl} initial={initial} size="md" />
          </Link>

          {/* Desktop: Profil-block */}
          <Link
            href="/dashboard/profil"
            className="hidden lg:flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl border border-orange-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all duration-200 group"
          >
            <AvatarFrame avatarUrl={avatarUrl} initial={initial} size="lg" />
            <div className="text-left min-w-0">
              <p className="text-sm font-black text-slate-900 truncate leading-tight">
                {userName}
              </p>
              <p className="text-[11px] text-orange-700 font-bold truncate">
                Min profil
              </p>
            </div>
            <ChevronRight
              className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * AvatarFrame - avatar med subtil orange/rod-gradient-ring.
 * Knyter avataren till sidans DNA istallet for att kanns urklippt.
 */
function AvatarFrame({
  avatarUrl,
  initial,
  size = 'md',
}: {
  avatarUrl: string | null;
  initial: string;
  size?: 'md' | 'lg';
}) {
  const dimensions = size === 'lg' ? 'w-9 h-9' : 'w-9 h-9';
  const padding = 'p-[2px]';

  return (
    <div
      className={`relative ${dimensions} rounded-full ${padding} flex-shrink-0`}
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
      }}
    >
      <div className="w-full h-full rounded-full bg-white p-[2px]">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
          >
            <span className="font-black text-xs">{initial}</span>
          </div>
        )}
      </div>
    </div>
  );
}
