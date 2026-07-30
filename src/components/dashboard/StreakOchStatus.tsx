'use client';

/**
 * StreakOchStatus
 * ---------------
 * Ersätter gamla StreakHero. Två lager efter vikt:
 *
 * 1. Streak: en KOMPAKT remsa som standard (flamma, tal, momentum-remsa,
 *    level-crest). Den stora firande gradientvarianten renderas bara när
 *    streaken faktiskt är värd att fira (7+ dagar), med IconEldMilstolpe
 *    som bakgrund i stället för en generisk Lucide-ikon.
 * 2. Din status: kvoter/premium i en egen ljus widget, faktainfo skild
 *    från gamification. Premium-CTA:n är outline, inte gradient
 *    (hero-gradienten är reserverad för vyns primära handling).
 *
 * Streaksiffran kvitterar förändringar: key-baserad remount med kort
 * scale-anim när talet ändras.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight } from 'lucide-react';
import { IconEld, IconEldMilstolpe, LevelCrest } from './illustrations/DashboardIcons';
import InfoPopover from '@/components/ui/InfoPopover';

const FREE_LIMITS = { letters: 7, analyses: 1, linkedin: 1 };
const CELEBRATE_FROM = 7;

interface StreakOchStatusProps {
  dailyStreak: number;
  longestStreak: number;
  dailyXpEarned: number;
  currentLevel: number;
  levelTitle: string;
  /** Senaste 28 dagarnas XP; de sista 7 driver momentum-remsan. */
  dailyXp: { date: string; xp: number }[];
  isPremium: boolean;
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  weeklyLinkedInCount: number;
  letterResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
}

export default function StreakOchStatus(props: StreakOchStatusProps) {
  const celebrate = props.dailyStreak >= CELEBRATE_FROM;

  if (celebrate) {
    return (
      <div className="space-y-4">
        <StreakCelebration {...props} />
        <DinStatusWidget {...props} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 items-stretch">
      <StreakStrip {...props} />
      <DinStatusWidget {...props} />
    </div>
  );
}

// =============================================================
// Kompakt streakremsa (standardläget)
// =============================================================

function StreakStrip({
  dailyStreak,
  longestStreak,
  dailyXpEarned,
  currentLevel,
  levelTitle,
  dailyXp,
}: StreakOchStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 flex flex-col justify-between gap-4"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <IconEld className="w-9 h-9 flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              {/* key-remount kvitterar en ändrad streak med en kort skalning */}
              <motion.span
                key={dailyStreak}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                className="text-2xl font-black text-slate-900 tabular-nums leading-none"
              >
                {dailyStreak}
              </motion.span>
              <span className="text-sm font-bold text-slate-600">
                {dailyStreak === 1 ? 'dag i rad' : 'dagar i rad'}
              </span>
              <InfoPopover title="Din streak">
                <p>
                  Gör något hos oss under en dag så växer din streak med en dag.
                  XP samlar du genom att använda verktygen, och din level visar
                  den samlade aktiviteten över tid.
                </p>
                <p>Rutorna nedanför visar vilka av veckans dagar du varit igång.</p>
              </InfoPopover>
            </div>
            <div className="text-[11.5px] text-slate-500 mt-0.5">
              {dailyStreak === 0
                ? 'Gör en sak idag så börjar räkningen.'
                : longestStreak > dailyStreak
                  ? `Bästa: ${longestStreak} dagar · ${dailyXpEarned} XP idag`
                  : `Nytt rekord på gång · ${dailyXpEarned} XP idag`}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 flex-shrink-0">
          <LevelCrest className="w-6 h-6" />
          <span className="tabular-nums">Level {currentLevel}</span>
          <span className="hidden sm:inline text-orange-600/70 font-semibold">{levelTitle}</span>
        </span>
      </div>

      <MomentumRemsa dailyXp={dailyXp} />
    </motion.div>
  );
}

/** Veckans momentum: sju dagrutor, fyllda när dagen gav XP. */
function MomentumRemsa({ dailyXp }: { dailyXp: { date: string; xp: number }[] }) {
  const lastSeven = dailyXp.slice(-7);
  if (lastSeven.length < 7) return null;

  return (
    <div className="flex items-center gap-1.5" aria-label="Aktivitet senaste sju dagarna">
      {lastSeven.map((day, i) => {
        const active = day.xp > 0;
        const weekday = new Intl.DateTimeFormat('sv-SE', { weekday: 'narrow' }).format(
          new Date(day.date)
        );
        const isToday = i === lastSeven.length - 1;
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-5 rounded-md ${active ? '' : 'bg-orange-50 border border-orange-100'} ${isToday && !active ? 'border-dashed border-orange-300' : ''}`}
              style={active ? { background: 'var(--jc-gradient-warm)' } : undefined}
              title={`${day.date}: ${day.xp} XP`}
            />
            <span className="text-[9px] font-bold uppercase text-slate-400">{weekday}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================
// Firande varianten (7+ dagars streak)
// =============================================================

function StreakCelebration({
  dailyStreak,
  longestStreak,
  dailyXpEarned,
  currentLevel,
  levelTitle,
  dailyXp,
}: StreakOchStatusProps) {
  const isMilestoneDay = [7, 14, 30, 50, 100].includes(dailyStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white"
      style={{
        background: 'var(--jc-gradient-hero)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      {/* Husets handritade eld som bakgrund, inte en stock-ikon */}
      <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
        <IconEldMilstolpe className="w-56 h-56 sm:w-64 sm:h-64" />
      </div>

      <div className="relative">
        <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-85 mb-2">
          {isMilestoneDay ? 'Milstolpe nådd' : 'Din streak lever'}
        </div>
        <div className="flex items-end gap-3">
          <motion.div
            key={dailyStreak}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
            className="text-6xl sm:text-7xl font-black leading-none tabular-nums"
          >
            {dailyStreak}
          </motion.div>
          <div className="pb-1.5 text-base sm:text-lg font-bold opacity-95">dagar i rad</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="font-bold tabular-nums">
            <span className="opacity-70 uppercase text-[10.5px] tracking-wider mr-1.5">Bästa</span>
            {Math.max(longestStreak, dailyStreak)} dagar
          </span>
          <span className="font-bold tabular-nums">
            <span className="opacity-70 uppercase text-[10.5px] tracking-wider mr-1.5">Idag</span>
            {dailyXpEarned} XP
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold">
            <LevelCrest className="w-5 h-5" />
            Level {currentLevel} · {levelTitle}
          </span>
        </div>

        <div className="mt-5 max-w-sm [&_span]:text-white/60">
          <MomentumRemsaLjus dailyXp={dailyXp} />
        </div>
      </div>
    </motion.div>
  );
}

/** Momentum-remsan på mörk gradientbakgrund. */
function MomentumRemsaLjus({ dailyXp }: { dailyXp: { date: string; xp: number }[] }) {
  const lastSeven = dailyXp.slice(-7);
  if (lastSeven.length < 7) return null;
  return (
    <div className="flex items-center gap-1.5" aria-label="Aktivitet senaste sju dagarna">
      {lastSeven.map((day) => {
        const active = day.xp > 0;
        const weekday = new Intl.DateTimeFormat('sv-SE', { weekday: 'narrow' }).format(
          new Date(day.date)
        );
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-5 rounded-md ${active ? 'bg-white' : 'bg-white/20'}`}
              title={`${day.date}: ${day.xp} XP`}
            />
            <span className="text-[9px] font-bold uppercase">{weekday}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================
// Din status: kvoter eller premium, faktabaserad widget
// =============================================================

function DinStatusWidget({
  isPremium,
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  letterResetDate,
  premiumUntil,
  premiumSource,
}: StreakOchStatusProps) {
  const isTrialUser =
    premiumSource === 'signup_trial' ||
    premiumSource === 'oauth_signup_trial' ||
    premiumSource === 'onboarding_completion' ||
    premiumSource === 'guest_invitation';
  const daysRemaining = getDaysRemaining(premiumUntil);

  const rows = [
    { label: 'Brev', used: weeklyLetterCount, limit: FREE_LIMITS.letters },
    { label: 'CV-analys', used: weeklyAnalysisCount, limit: FREE_LIMITS.analyses },
    { label: 'LinkedIn', used: weeklyLinkedInCount, limit: FREE_LIMITS.linkedin },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="bg-white rounded-3xl border border-orange-100 p-4 sm:p-5 flex flex-col"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
          <span>Din status</span>
          <InfoPopover title="Din status">
            {isPremium ? (
              <p>
                Med Premium har du obegränsad tillgång till personliga brev,
                CV-analys och LinkedIn-optimering. Här ser du när perioden
                förnyas eller löper ut.
              </p>
            ) : (
              <p>
                Så mycket har du kvar av veckans gratiskvot. Den nollställs
                varje vecka, och med Premium slipper du taket helt.
              </p>
            )}
          </InfoPopover>
        </div>
        {isPremium && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Crown className="w-3 h-3" strokeWidth={2.5} />
            Premium
          </span>
        )}
      </div>

      {isPremium ? (
        <>
          <div className="flex-1 space-y-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-slate-700">{row.label}</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  Obegränsat
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11.5px] text-slate-500">
            {isTrialUser && daysRemaining !== null
              ? `${daysRemaining} ${daysRemaining === 1 ? 'dag' : 'dagar'} kvar av provperioden`
              : premiumUntil
                ? `Förnyas ${formatDate(premiumUntil)}`
                : 'Obegränsad åtkomst'}
            {isTrialUser && (
              <>
                {' · '}
                <Link
                  href="/dashboard/profil/prenumeration"
                  className="font-bold text-orange-700 hover:text-orange-800"
                >
                  Hantera
                </Link>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 space-y-2.5">
            {rows.map((row) => {
              const pct =
                row.limit === 0 ? 0 : Math.min(100, Math.round((row.used / row.limit) * 100));
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-slate-700">{row.label}</span>
                    <span className="text-[11.5px] font-black text-slate-500 tabular-nums">
                      {row.used}
                      <span className="text-slate-400">/{row.limit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-orange-50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: 'var(--jc-gradient-warm)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              {letterResetDate ? `Nollställs ${relativeDateLabel(letterResetDate)}` : 'Veckans gratiskvot'}
            </span>
            <Link
              href="/dashboard/profil/prenumeration"
              className="group inline-flex items-center gap-1 text-[12px] font-black text-orange-700 hover:text-orange-800"
            >
              Lås upp obegränsat
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}

function getDaysRemaining(premiumUntil?: string | null): number | null {
  if (!premiumUntil) return null;
  const diff = new Date(premiumUntil).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

function relativeDateLabel(date: Date): string {
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'idag';
  if (days === 1) return 'imorgon';
  if (days < 7) return `om ${days} dagar`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
