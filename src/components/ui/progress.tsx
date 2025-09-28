'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  className?: string;
  indicatorClassName?: string;
  animated?: boolean;
  showValue?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, indicatorClassName, animated = true, showValue = false, ...props }, ref) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-gray-200',
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-500 ease-out',
            'bg-gradient-to-r from-pink-600 to-purple-600',
            indicatorClassName
          )}
          style={{
            transform: `translateX(-${100 - clampedValue}%)`,
            transition: animated ? 'transform 0.5s ease-out' : 'none'
          }}
        />

        {/* Animated overlay for premium effect */}
        {animated && clampedValue > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1
            }}
            style={{
              width: `${clampedValue}%`
            }}
          />
        )}
      </ProgressPrimitive.Root>

      {/* Optional value display */}
      {showValue && (
        <motion.div
          className="absolute -top-8 right-0 text-xs font-medium text-gray-600"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(clampedValue)}%
        </motion.div>
      )}
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };