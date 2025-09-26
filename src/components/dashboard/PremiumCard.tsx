'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function PremiumCard({
  children,
  className = '',
  hover = true,
  gradient = false,
  glow = false,
  onClick
}: PremiumCardProps) {
  const baseClasses = gradient
    ? 'bg-gradient-to-br from-white via-slate-50/50 to-blue-50/20'
    : 'bg-white/90';

  const glowClasses = glow
    ? 'shadow-xl shadow-pink-500/20'
    : 'shadow-lg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={hover ? {
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : undefined}
      onClick={onClick}
      className={`
        ${baseClasses}
        backdrop-blur-md
        border border-slate-200/60
        ${glowClasses}
        rounded-xl
        transition-all duration-300
        ${hover ? 'hover:border-slate-300/80 hover:shadow-xl' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}