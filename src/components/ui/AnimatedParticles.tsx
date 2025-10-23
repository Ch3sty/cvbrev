// src/components/ui/AnimatedParticles.tsx
'use client';

import React from 'react';

interface AnimatedParticlesProps {
  count?: number;
  color?: string;
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'down' | 'up';
}

const AnimatedParticles: React.FC<AnimatedParticlesProps> = ({
  count = 5,
  color = '#60a5fa', // blue-400
  speed = 'medium',
  direction = 'down'
}) => {
  const speedMap = {
    slow: 4000,
    medium: 2500,
    fast: 1500
  };

  const duration = speedMap[speed];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, index) => {
        const delay = (index * duration) / count;
        const leftPosition = 40 + (index * 10); // Spread particles horizontally

        return (
          <div
            key={index}
            className="absolute w-1.5 h-1.5 rounded-full opacity-60"
            style={{
              backgroundColor: color,
              left: `${leftPosition}%`,
              top: direction === 'down' ? '0%' : '100%',
              animation: `particleFlow ${duration}ms linear ${delay}ms infinite`,
              boxShadow: `0 0 8px ${color}`
            }}
          />
        );
      })}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes particleFlow {
            0% {
              transform: translateY(${direction === 'down' ? '0' : '0'}) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 0.6;
              transform: scale(1);
            }
            90% {
              opacity: 0.4;
            }
            100% {
              transform: translateY(${direction === 'down' ? '100%' : '-100%'}) scale(0.5);
              opacity: 0;
            }
          }
        `
      }} />
    </div>
  );
};

export default AnimatedParticles;
