'use client';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface PremiumInteractionsProps extends MotionProps {
  children: ReactNode;
  variant?: 'gentle' | 'bounce' | 'scale' | 'glow' | 'float';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  sound?: boolean;
}

// Animation variants
const variants = {
  gentle: {
    hover: {
      scale: 1.02,
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    },
    tap: {
      scale: 0.98,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }
  },
  bounce: {
    hover: {
      scale: 1.05,
      y: -4,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    },
    tap: {
      scale: 0.95,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  },
  scale: {
    hover: {
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.97,
      transition: { type: "spring", stiffness: 600, damping: 30 }
    }
  },
  glow: {
    hover: {
      scale: 1.02,
      filter: "brightness(1.1)",
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: {
      scale: 0.98,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  },
  float: {
    hover: {
      y: -6,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    },
    tap: {
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  }
};

export default function PremiumInteractions({
  children,
  variant = 'gentle',
  disabled = false,
  className = '',
  onClick,
  sound = false,
  ...motionProps
}: PremiumInteractionsProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    // Simple click feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Sound effect (optional)
    if (sound && typeof window !== 'undefined') {
      // You can implement sound effects here
      // For now, we'll use a simple vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    if (onClick) {
      onClick();
    }
  };

  const animationVariant = variants[variant];

  return (
    <motion.div
      className={`${className} ${disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      whileHover={disabled ? undefined : animationVariant.hover}
      whileTap={disabled ? undefined : animationVariant.tap}
      onClick={handleClick}
      style={{ transformOrigin: 'center' }}
      {...motionProps}
    >
      {children}

      {/* Ripple effect on click */}
      {isPressed && !disabled && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-xl pointer-events-none"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </motion.div>
  );
}

// Specialized components for common use cases
export function PremiumButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
} & MotionProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg border-transparent',
    secondary: 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100/80 border-transparent'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <PremiumInteractions
      variant="bounce"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-xl
        transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </PremiumInteractions>
  );
}

export function PremiumCard({
  children,
  className = '',
  clickable = false,
  glowing = false,
  floating = false,
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  clickable?: boolean;
  glowing?: boolean;
  floating?: boolean;
  onClick?: () => void;
} & MotionProps) {
  const baseClasses = `
    bg-white/90 backdrop-blur-md
    border border-slate-200/60
    rounded-xl shadow-lg
    transition-all duration-300
    ${glowing ? 'shadow-pink-500/20 shadow-xl' : ''}
    ${clickable ? 'cursor-pointer hover:border-slate-300/80' : ''}
  `;

  if (clickable || onClick) {
    return (
      <PremiumInteractions
        variant={floating ? 'float' : 'gentle'}
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        {...props}
      >
        {children}
      </PremiumInteractions>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}