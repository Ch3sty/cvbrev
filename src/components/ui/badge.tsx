import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-pink-900/50 text-pink-400 border-pink-800/50',
      secondary: 'bg-navy-700 text-gray-300 border-navy-600',
      outline: 'bg-transparent text-gray-400 border-navy-600',
      success: 'bg-green-900/50 text-green-400 border-green-800/50',
      warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-800/50'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };