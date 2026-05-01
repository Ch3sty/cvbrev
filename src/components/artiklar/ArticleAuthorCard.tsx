'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { VerifieradExpertCheckmark } from './illustrations/ArticleIcons';
import type { Author } from '@/lib/authors';

interface ArticleAuthorCardProps {
  author: Author;
}

export default function ArticleAuthorCard({ author }: ArticleAuthorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5 sm:p-6 md:p-7 my-8"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Gradient-strip topp */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
        {/* Avatar med orange ring + checkmark-badge */}
        <div className="relative flex-shrink-0">
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-orange-100"
            style={{ boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.25)' }}
          >
            <Image
              src={author.image}
              alt={`${author.name} - ${author.title}`}
              fill
              className="object-cover"
              sizes="96px"
              priority
              quality={90}
            />
          </div>
          {/* Verifierad expert checkmark */}
          <div className="absolute -bottom-1 -right-1">
            <VerifieradExpertCheckmark className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Namn + verifierad-pill */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
              {author.name}
            </h3>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              }}
            >
              <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
              Verifierad expert
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-orange-700 mb-2">
            {author.title}
          </p>

          {/* Bio */}
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            {author.bio}
          </p>

          {/* Expertise-pills */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {author.expertise.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Trust-rad */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-600">
            <div className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-orange-600" strokeWidth={2.5} />
              <span>
                {author.articleCount && author.articleCount > 0
                  ? `${author.articleCount} artiklar publicerade`
                  : 'Expert inom jobbcoach.ai'}
              </span>
            </div>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="font-semibold text-orange-700">
              Artikel granskad av HR-experter
            </span>
          </div>
        </div>
      </div>

      {/* Bottom trust-rad */}
      <div className="mt-5 pt-4 border-t border-orange-100 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <span>Del av</span>
          <a
            href="/"
            className="font-bold text-orange-700 hover:text-orange-800 transition-colors"
          >
            jobbcoach.ai
          </a>
          <span>expertteam</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-slate-500">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            aria-hidden="true"
          />
          Kvalitetssäkrad artikel
        </div>
      </div>
    </motion.div>
  );
}
