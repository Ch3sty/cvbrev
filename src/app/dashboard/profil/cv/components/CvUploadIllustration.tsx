'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Lock } from 'lucide-react';

export default function CvUploadIllustration() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/50 p-6 sm:p-8"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <DotPatternBg />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        <div className="flex justify-center order-2 md:order-1">
          <ScanningDocument />
        </div>

        <div className="text-center md:text-left order-1 md:order-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
            Så här går det till
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Lämna det till oss
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto md:mx-0">
            Vi tolkar yrkesroller, kompetenser, utbildningar och plats. Du
            laddar upp, vi gör resten.
          </p>

          <ul className="mt-5 space-y-2.5 text-left max-w-md mx-auto md:mx-0">
            <Bullet text="PDF, Word eller text — upp till 10 MB" />
            <Bullet text="Klart på under en minut" />
            <Bullet text="Du kan radera CV:t när du vill" />
          </ul>

          <PrivacyNote />
        </div>
      </div>
    </motion.section>
  );
}

function ScanningDocument() {
  return (
    <div className="relative w-[260px] sm:w-[300px] h-[260px] sm:h-[300px]">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(249, 115, 22, 0.18), transparent 60%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border-2 border-orange-200"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border-2 border-orange-300"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.4,
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden"
          style={{
            width: 156,
            height: 200,
            boxShadow:
              '0 18px 36px -12px rgba(220, 38, 38, 0.25), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            className="h-2 w-full"
            style={{
              background:
                'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
          />

          <div className="px-5 pt-5 pb-4 flex flex-col gap-2">
            <div className="h-2.5 w-3/4 rounded-full bg-slate-300" />
            <div className="h-2 w-1/2 rounded-full bg-slate-200" />
          </div>

          <div className="px-5 mt-1 flex flex-col gap-1.5">
            {[
              'w-full',
              'w-5/6',
              'w-full',
              'w-2/3',
              'w-full',
              'w-3/4',
              'w-5/6',
            ].map((w, i) => (
              <div key={i} className={`h-1.5 ${w} rounded-full bg-slate-100`} />
            ))}
          </div>

          <motion.div
            className="absolute left-0 right-0 h-[3px] pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.85) 50%, transparent 100%)',
              boxShadow: '0 0 12px rgba(249, 115, 22, 0.7)',
            }}
            animate={{ top: ['12%', '90%', '12%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
        {[0, 0.4, 0.8].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background:
                'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-700">
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 5.5L4 7.5L8 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{text}</span>
    </li>
  );
}

function PrivacyNote() {
  const items: { Icon: typeof ShieldCheck; label: string; sub: string }[] = [
    {
      Icon: MapPin,
      label: 'Lagrat på servrar i EU',
      sub: 'Dina personuppgifter lämnar aldrig EU.',
    },
    {
      Icon: ShieldCheck,
      label: 'Skickas aldrig till en språkmodell',
      sub: 'Vi sparar uppgifter direkt i vår databas. Ingen AI får se dem.',
    },
    {
      Icon: Lock,
      label: 'Du äger datan',
      sub: 'Krypterat under transport och i vila. Radera när du vill.',
    },
  ];

  return (
    <div className="mt-6 pt-5 border-t border-slate-100 max-w-md mx-auto md:mx-0 text-left">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck
          className="w-4 h-4 text-emerald-600"
          strokeWidth={2.25}
        />
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          Dina uppgifter stannar hos dig
        </p>
      </div>

      <ul className="space-y-2">
        {items.map(({ Icon, label, sub }) => (
          <li key={label} className="flex items-start gap-2.5">
            <Icon
              className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1"
              strokeWidth={2.25}
            />
            <p className="text-[13px] text-slate-600 leading-snug">
              <span className="font-semibold text-slate-900">{label}.</span>{' '}
              {sub}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
      aria-hidden="true"
    >
      <pattern
        id="cv-illustration-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#cv-illustration-dots)" opacity="0.4" />
    </svg>
  );
}
