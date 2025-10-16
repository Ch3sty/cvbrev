'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface FeatureSectionProps {
  icon: LucideIcon;
  title: string;
  shortDescription: string;
  fullDescription: string;
  href: string;
  actionText: string;
  color: string;
  index: number;
}

export default function FeatureSection({
  icon: Icon,
  title,
  shortDescription,
  fullDescription,
  href,
  actionText,
  color,
  index
}: FeatureSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/30 transition-all duration-300 overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-blue-50/20 transition-all duration-300"
        >
          <div className="flex items-start gap-4 flex-1">
            {/* Icon */}
            <motion.div
              className={`p-3 bg-gradient-to-br ${color} rounded-xl flex-shrink-0`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Title & Short Description */}
            <div className="flex-1 text-left">
              <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
              <p className="text-sm text-slate-600">{shortDescription}</p>
            </div>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 ml-4"
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </button>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                {/* Full Description */}
                <div
                  className="prose prose-sm max-w-none text-slate-700 mb-4"
                  dangerouslySetInnerHTML={{ __html: fullDescription }}
                />

                {/* CTA Button */}
                <Link href={href}>
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-5 py-2.5 bg-gradient-to-r ${color} text-white rounded-lg
                      text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-blue-200/40
                      transition-all duration-300 flex items-center gap-2
                    `}
                  >
                    {actionText}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
