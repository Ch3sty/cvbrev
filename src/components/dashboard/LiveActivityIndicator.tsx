'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Sparkles } from 'lucide-react';

interface ActivityData {
  type: 'user_joined' | 'letter_created' | 'cv_analyzed' | 'premium_upgrade';
  message: string;
  timestamp: Date;
  icon: any;
  color: string;
}

interface LiveActivityIndicatorProps {
  className?: string;
  showBadge?: boolean;
}

export default function LiveActivityIndicator({
  className = '',
  showBadge = true
}: LiveActivityIndicatorProps) {
  const [isActive, setIsActive] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null);
  const [activeUsers, setActiveUsers] = useState(0);

  // Simulated live activity data
  const activities: ActivityData[] = [
    {
      type: 'user_joined',
      message: 'Ny användare registrerad från Stockholm',
      timestamp: new Date(),
      icon: Users,
      color: 'text-green-600'
    },
    {
      type: 'letter_created',
      message: 'Personligt brev skapat för Tech-position',
      timestamp: new Date(),
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      type: 'cv_analyzed',
      message: 'CV-analys slutförd med AI-rekommendationer',
      timestamp: new Date(),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      type: 'premium_upgrade',
      message: 'Premium-användare uppgraderad i Göteborg',
      timestamp: new Date(),
      icon: Sparkles,
      color: 'text-pink-600'
    }
  ];

  useEffect(() => {
    // Simulate active users count
    const updateActiveUsers = () => {
      setActiveUsers(Math.floor(Math.random() * 50) + 120); // 120-170 active users
    };

    updateActiveUsers();
    const usersInterval = setInterval(updateActiveUsers, 30000); // Update every 30 seconds

    // Simulate live activities
    const showActivity = () => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setCurrentActivity({
        ...randomActivity,
        timestamp: new Date()
      });

      setTimeout(() => {
        setCurrentActivity(null);
      }, 4000);
    };

    // Show first activity after 2 seconds
    const initialTimeout = setTimeout(showActivity, 2000);

    // Then show activities every 15-30 seconds
    const activityInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to show activity
        showActivity();
      }
    }, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(usersInterval);
      clearInterval(activityInterval);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Live indicator badge */}
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span>{activeUsers} aktiva användare</span>
        </motion.div>
      )}

      {/* Live activity notifications */}
      <AnimatePresence>
        {currentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl p-4 shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                className="bg-slate-50 p-2 rounded-lg"
              >
                <currentActivity.icon className={`w-4 h-4 ${currentActivity.color}`} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm font-medium text-slate-900 leading-tight"
                >
                  {currentActivity.message}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-slate-500 mt-1"
                >
                  Just nu
                </motion.p>
              </div>

              {/* Animated progress bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-b-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}