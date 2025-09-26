'use client';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'hero' | 'stats' | 'list';
  count?: number;
}

const shimmer = {
  background: `linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s infinite'
};

export default function LoadingSkeleton({
  variant = 'card',
  count = 1
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'hero':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-lg p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="flex-1 space-y-4">
                <div className="h-4 bg-slate-200 rounded-lg w-32 animate-pulse" />
                <div className="h-10 bg-slate-200 rounded-lg w-96 animate-pulse" />
                <div className="h-6 bg-slate-200 rounded-lg w-80 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded-full w-48 animate-pulse" />
              </div>
              <div className="mt-6 lg:mt-0">
                <div className="h-32 w-48 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
              </div>
              <div className="h-12 w-12 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </motion.div>
        );

      case 'card':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg p-6"
          >
            <div className="space-y-4">
              <div className="h-16 w-16 bg-slate-200 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </motion.div>
        );

      case 'list':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-64 animate-pulse" />
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>

      {count === 1 ? (
        renderSkeleton()
      ) : (
        <div className="space-y-6">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {renderSkeleton()}
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}