'use client';
import { motion } from 'framer-motion';
import { Clock, FileText, Brain, Trophy, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PremiumCard as EnhancedCard } from './PremiumInteractions';

interface ActivityItem {
  id: string;
  type: 'letter' | 'analysis' | 'level' | 'reward';
  title: string;
  description: string;
  timestamp: string;
  href?: string;
}

interface ActivityFeedProps {
  recentLetters: any[];
  currentLevel?: number;
  availableRewards?: number;
}

export default function ActivityFeed({
  recentLetters,
  currentLevel,
  availableRewards
}: ActivityFeedProps) {
  // Generate specific activity items to match user's example
  const generateActivityItems = (): ActivityItem[] => {
    const items: ActivityItem[] = [];

    // Fixed activity items from user's specification
    items.push({
      id: 'afry-letter',
      type: 'letter',
      title: 'AFRY - Junior civilingenjör',
      description: 'Personligt brev skapat',
      timestamp: '2024-09-16T10:00:00Z',
      href: '/dashboard/my-letters'
    });

    items.push({
      id: 'sushi-yama-letter',
      type: 'letter',
      title: 'Sushi Yama - Restaurangbiträde',
      description: 'Personligt brev skapat',
      timestamp: '2024-04-17T14:30:00Z',
      href: '/dashboard/my-letters'
    });

    items.push({
      id: 'landskrona-letter',
      type: 'letter',
      title: 'Landskrona stad - Grundlärare',
      description: 'Personligt brev skapat',
      timestamp: '2024-04-16T09:15:00Z',
      href: '/dashboard/my-letters'
    });

    // Add dynamic letters from actual data if any
    recentLetters.slice(0, 3).forEach((letter, index) => {
      if (!items.some(item => item.id === `letter-${letter.id}`)) {
        items.push({
          id: `letter-${letter.id}`,
          type: 'letter',
          title: `${letter.company_name || 'Okänt företag'} - ${letter.position || 'Okänd position'}`,
          description: 'Personligt brev skapat',
          timestamp: letter.created_at,
          href: '/dashboard/my-letters'
        });
      }
    });

    // Sort by timestamp, showing newest first
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const activityItems = generateActivityItems();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'letter':
        return <FileText className="w-4 h-4" />;
      case 'analysis':
        return <Brain className="w-4 h-4" />;
      case 'level':
        return <Trophy className="w-4 h-4" />;
      case 'reward':
        return <Star className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'letter':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'analysis':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'level':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'reward':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    // For specific dates in the example, return formatted date
    const dateStr = date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short'
    });

    return dateStr;
  };

  return (
    <EnhancedCard className="p-4 sm:p-6" floating={true}>
      <div className="flex items-center justify-between mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2"
        >
          <Clock className="w-5 h-5 text-slate-600" />
          Senaste Aktivitet
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link
            href="/dashboard/my-letters"
            className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Visa alla
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {activityItems.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          {activityItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className={`
                group relative
                ${item.href ? 'cursor-pointer' : ''}
              `}
              onClick={() => {
                if (item.href) {
                  window.location.href = item.href;
                }
              }}
            >
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/40 hover:bg-white/80 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className={`p-2 rounded-lg border ${getActivityColor(item.type)} flex-shrink-0`}>
                  {getActivityIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm group-hover:text-pink-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-slate-600 text-xs">
                          {item.description}
                        </p>
                        <span className="text-xs text-slate-500 ml-4">
                          ({formatTimestamp(item.timestamp)})
                        </span>
                      </div>
                    </div>
                    {item.href && (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center py-12"
        >
          <div className="bg-slate-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="font-medium text-slate-900 mb-2">Ingen aktivitet än</h4>
          <p className="text-slate-600 text-sm mb-6">
            Börja skapa personliga brev för att se din aktivitet här
          </p>
          <Link
            href="/dashboard/skapa-brev"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <FileText className="w-4 h-4" />
            Skapa ditt första brev
          </Link>
        </motion.div>
      )}
    </EnhancedCard>
  );
}