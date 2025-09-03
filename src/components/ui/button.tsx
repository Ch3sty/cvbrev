import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:ring-pink-500 shadow-md hover:shadow-lg disabled:from-gray-600 disabled:to-gray-700',
      secondary: 'text-gray-300 bg-navy-700 border border-navy-600 hover:bg-navy-600 hover:text-white focus:ring-pink-500 shadow-sm',
      outline: 'text-gray-300 bg-transparent border border-navy-600 hover:bg-navy-700 hover:text-white focus:ring-pink-500',
      ghost: 'text-gray-300 bg-transparent hover:bg-navy-700/50 hover:text-white focus:ring-pink-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };