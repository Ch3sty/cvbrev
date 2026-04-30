'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Save, FileDown, Sparkles } from 'lucide-react';

interface SaveProgressIllustrationProps {
  progress: number; // 0-100
  stage: 0 | 1 | 2; // 0=spara, 1=PDF, 2=klar
}

/**
 * Animerad illustration för spara-steget.
 * Ett papper byggs upp i tre faser: tomt → fyllt → klart med stjärna.
 * Inga maskoter, bara papper + stages.
 */
export default function SaveProgressIllustration({
  progress,
  stage,
}: SaveProgressIllustrationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto" style={{ width: 200, height: 220 }}>
      {/* Glow-bakgrund */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 65%)',
            filter: 'blur(28px)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Pulserande ring */}
      {!reduceMotion && stage < 2 && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-orange-200"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Pappers-stack */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: 130, height: 170 }}>
          {/* Bakre papper (skugga) */}
          <motion.div
            className="absolute bg-white rounded-xl"
            style={{
              top: 8,
              left: 8,
              width: 130,
              height: 170,
              border: '1px solid rgba(203, 213, 225, 0.8)',
              boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.1)',
            }}
            animate={
              !reduceMotion
                ? { rotate: [-3, -4, -3] }
                : { rotate: -3 }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Främre papper med innehåll */}
          <motion.div
            className="absolute bg-white rounded-xl overflow-hidden"
            style={{
              top: 0,
              left: 0,
              width: 130,
              height: 170,
              boxShadow:
                '0 16px 32px -12px rgba(220, 38, 38, 0.25), 0 4px 12px -4px rgba(15, 23, 42, 0.1)',
            }}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Topp-band */}
            <div
              className="h-1.5 w-full"
              style={{
                background:
                  'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            />

            {/* Innehåll som "byggs upp" baserat på progress */}
            <div className="p-3 space-y-1.5">
              <motion.div
                className="h-2 w-3/4 rounded-full bg-slate-300"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 5 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-1/2 rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 12 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <div className="h-2" />
              <motion.div
                className="h-1 w-3/4 rounded-full"
                style={{ background: '#FB923C' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 25 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-full rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 35 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-5/6 rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 45 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <div className="h-2" />
              <motion.div
                className="h-1 w-2/3 rounded-full"
                style={{ background: '#FB923C' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 55 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-full rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 65 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-3/4 rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 75 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="h-1 w-5/6 rounded-full bg-slate-200"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: progress > 85 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          {/* Status-ikon i höger nederkant */}
          <motion.div
            className="absolute z-10 w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{
              right: -10,
              bottom: -10,
              background:
                stage === 2
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow:
                stage === 2
                  ? '0 8px 20px -4px rgba(16, 185, 129, 0.5)'
                  : '0 8px 20px -4px rgba(220, 38, 38, 0.5)',
            }}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.3,
            }}
            key={stage}
          >
            {stage === 0 && <Save className="w-5 h-5" strokeWidth={2.5} />}
            {stage === 1 && <FileDown className="w-5 h-5" strokeWidth={2.5} />}
            {stage === 2 && <Sparkles className="w-5 h-5" strokeWidth={2.5} />}

            {/* Pulserande halo */}
            {!reduceMotion && stage < 2 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316, #DC2626)',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
