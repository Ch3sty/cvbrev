'use client';
import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  duration: number;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

const SIZE_MAP = {
  sm: { min: 2, max: 4 },
  md: { min: 3, max: 6 },
  lg: { min: 4, max: 8 }
} as const;

const SPEED_MAP = {
  slow: { min: 8, max: 15 },
  medium: { min: 6, max: 12 },
  fast: { min: 4, max: 8 }
} as const;

export default function FloatingParticles({
  count = 8,
  colors = ['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-indigo-400'],
  size = 'md',
  speed = 'medium',
  className = ''
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * (SIZE_MAP[size].max - SIZE_MAP[size].min) + SIZE_MAP[size].min,
          opacity: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: Math.random() * (SPEED_MAP[speed].max - SPEED_MAP[speed].min) + SPEED_MAP[speed].min
        });
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, [count, colors, size, speed]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity
          }}
          animate={{
            y: [-20, -40, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.3, particle.opacity]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}