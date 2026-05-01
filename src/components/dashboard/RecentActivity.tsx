'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PenTool,
  CheckCircle,
  FileText,
  Briefcase,
  Linkedin,
  User,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  description: string | null;
  metadata: any;
  created_at: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * "Senaste aktivitet"-lista som visar de 5 senaste user_activities.
 * Datakontrakt: aktiviteter äldsta sist (vi får dem nyaste först från supabase).
 */
export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Senaste aktivitet</h3>
        <Link
          href="/dashboard/rewards"
          className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
        >
          Visa allt <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">
            Ingen aktivitet ännu. Skapa ett brev eller analys för att komma igång.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map(activity => {
            const meta = getActivityMeta(activity.activity_type);
            const Icon = meta.icon;
            const xp = inferXp(activity);
            const timeAgo = formatRelativeTime(activity.created_at);
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${meta.bgClass} ${meta.iconClass}`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium leading-snug">
                    {activity.description || meta.fallbackLabel}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs">
                    <span className="text-slate-500">{timeAgo}</span>
                    {xp > 0 && (
                      <span className="inline-flex items-center gap-0.5 font-semibold text-orange-600">
                        <Zap className="w-3 h-3" strokeWidth={2.5} />
                        +{xp} XP
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

function getActivityMeta(type: string): {
  icon: typeof PenTool;
  bgClass: string;
  iconClass: string;
  fallbackLabel: string;
} {
  switch (type) {
    case 'letter_created':
    case 'letter_saved':
    case 'letter_generation_started':
      return {
        icon: PenTool,
        bgClass: 'bg-pink-100',
        iconClass: 'text-pink-600',
        fallbackLabel: 'Skapade ett personligt brev',
      };
    case 'cv_analysis_completed':
    case 'cv_analysis_started':
    case 'competence_analysis_completed':
    case 'competence_analysis_started':
      return {
        icon: CheckCircle,
        bgClass: 'bg-emerald-100',
        iconClass: 'text-emerald-600',
        fallbackLabel: 'Slutförde CV-analys',
      };
    case 'cv_uploaded':
    case 'cv_generated':
      return {
        icon: FileText,
        bgClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        fallbackLabel: 'Laddade upp ett CV',
      };
    case 'job_match_searched':
    case 'jobs_searched':
      return {
        icon: Briefcase,
        bgClass: 'bg-orange-100',
        iconClass: 'text-orange-600',
        fallbackLabel: 'Sökte jobbmatchning',
      };
    case 'linkedin_optimization_completed':
    case 'linkedin_optimization_started':
      return {
        icon: Linkedin,
        bgClass: 'bg-cyan-100',
        iconClass: 'text-cyan-600',
        fallbackLabel: 'Optimerade LinkedIn-profil',
      };
    case 'login':
    case 'registered':
    case 'logout':
    case 'profile_updated':
      return {
        icon: User,
        bgClass: 'bg-slate-100',
        iconClass: 'text-slate-600',
        fallbackLabel: type === 'login' ? 'Loggade in' : 'Uppdaterade profil',
      };
    case 'milestone_reward_claimed':
      return {
        icon: Sparkles,
        bgClass: 'bg-yellow-100',
        iconClass: 'text-yellow-600',
        fallbackLabel: 'Hämtade en milstolpe-belöning',
      };
    default:
      return {
        icon: User,
        bgClass: 'bg-slate-100',
        iconClass: 'text-slate-500',
        fallbackLabel: 'Aktivitet',
      };
  }
}

function inferXp(activity: Activity): number {
  // Läs från metadata om det finns
  if (activity.metadata && typeof activity.metadata === 'object') {
    const m = activity.metadata as Record<string, any>;
    if (typeof m.xp_awarded === 'number') return m.xp_awarded;
    if (typeof m.xp === 'number') return m.xp;
  }
  // Fallback per activity_type baserat på faktiska XP-värden i live-DB
  switch (activity.activity_type) {
    case 'letter_created':
    case 'letter_saved':
      return 35;
    case 'cv_analysis_completed':
    case 'competence_analysis_completed':
      return 50;
    case 'cv_uploaded':
      return 25;
    case 'job_match_searched':
    case 'jobs_searched':
      return 10;
    case 'linkedin_optimization_completed':
      return 40;
    default:
      return 0;
  }
}

function formatRelativeTime(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Nyss';
  if (diffMin < 60) return `${diffMin} min sedan`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} h sedan`;
  const diffDays = Math.round(diffHrs / 24);
  if (diffDays === 1) return 'Igår';
  if (diffDays < 7) return `${diffDays} dagar sedan`;
  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} v sedan`;
  return then.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
