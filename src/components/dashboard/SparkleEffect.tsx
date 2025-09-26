'use client';
import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface Sparkle {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
}

interface SparkleEffectProps {
  density?: 'low' | 'medium' | 'high';
  colors?: string[];
  trigger?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DENSITY_MAP = {
  low: 3,
  medium: 6,
  high: 10
} as const;

export default function SparkleEffect({
  density = 'medium',
  colors = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981'],
  trigger = false,
  className = '',
  children
}: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const generateSparkles = useCallback(() => {
    const count = DENSITY_MAP[density];
    const newSparkles: Sparkle[] = [];

    for (let i = 0; i < count; i++) {
      newSparkles.push({
        id: `sparkle-${i}-${Date.now()}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setSparkles(newSparkles);

    // Clear sparkles after animation
    setTimeout(() => {
      setSparkles([]);
    }, 2000);
  }, [density, colors]);

  useEffect(() => {
    if (trigger) {
      generateSparkles();
    }
  }, [trigger, generateSparkles]);

  return (
    <div className={`relative ${className}`}>
      {children}

      {/* Sparkles container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              color: sparkle.color
            }}
            initial={{
              scale: 0,
              rotate: sparkle.rotation,
              opacity: 0
            }}
            animate={{
              scale: [0, sparkle.scale, 0],
              rotate: sparkle.rotation + 180,
              opacity: [0, sparkle.opacity, 0],
              y: [-20, -40]
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
              times: [0, 0.5, 1]
            }}
          >
            {/* Sparkle SVG */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M8 0l1.5 5.5L16 8l-6.5 1.5L8 16l-1.5-6.5L0 8l6.5-1.5L8 0z" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Hook for triggering sparkles on hover
export function useSparkleOnHover() {
  const [isTriggered, setIsTriggered] = useState(false);

  const triggerSparkles = () => {
    setIsTriggered(true);
    setTimeout(() => setIsTriggered(false), 100);
  };

  return {
    isTriggered,
    onMouseEnter: triggerSparkles,
    onMouseLeave: () => {}
  };
}