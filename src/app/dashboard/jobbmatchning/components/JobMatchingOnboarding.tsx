'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  Search,
  Target,
  ArrowRight,
  Building2,
  MapPin,
  CheckCircle2,
  Upload,
} from 'lucide-react';

/**
 * Onboarding-vy som visas pa /dashboard/jobbmatchning nar anvandaren inte
 * har nagot CV. Istallet for att redirect:a bort dem visar vi:
 *
 * 1. Hero-strip - samma DNA som CvHeroStrip, men med onboarding-meddelande
 * 2. Tre numrerade steg som forklarar vardet
 * 3. Blurrad preview av exempel-jobbkort med matchnings-procent
 * 4. Stor CTA-knapp till CV-uppladdningen
 *
 * Anvandaren ska forsta vad funktionen gor INNAN de behover ladda upp ett CV.
 */
export default function JobMatchingOnboarding() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* 1. HERO-STRIP — samma gradient och dokument-SVG som CvHeroStrip */}
      <div
        className="relative overflow-hidden rounded-3xl text-white"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
          boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
        }}
      >
        {/* Dokument-SVG-dekoration (samma stil som CvHeroStrip) */}
        <svg
          className="absolute -right-12 -top-8 opacity-15 pointer-events-none"
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="80"
            y="80"
            width="140"
            height="180"
            rx="14"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
            transform="rotate(-8 150 170)"
          />
          <rect
            x="100"
            y="70"
            width="140"
            height="180"
            rx="14"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
            transform="rotate(4 170 160)"
          />
          <rect
            x="120"
            y="60"
            width="140"
            height="180"
            rx="14"
            fill="white"
            fillOpacity="0.08"
            stroke="white"
            strokeWidth="2"
            opacity="0.9"
          />
          <line
            x1="138"
            y1="92"
            x2="240"
            y2="92"
            stroke="white"
            strokeWidth="2"
            opacity="0.4"
          />
          <line
            x1="138"
            y1="110"
            x2="220"
            y2="110"
            stroke="white"
            strokeWidth="2"
            opacity="0.3"
          />
          <line
            x1="138"
            y1="135"
            x2="240"
            y2="135"
            stroke="white"
            strokeWidth="2"
            opacity="0.3"
          />
          <line
            x1="138"
            y1="153"
            x2="210"
            y2="153"
            stroke="white"
            strokeWidth="2"
            opacity="0.25"
          />
          <line
            x1="138"
            y1="175"
            x2="235"
            y2="175"
            stroke="white"
            strokeWidth="2"
            opacity="0.25"
          />
          <circle cx="50" cy="240" r="3" fill="white" opacity="0.3" />
          <circle cx="65" cy="265" r="2" fill="white" opacity="0.25" />
          <circle cx="38" cy="215" r="2" fill="white" opacity="0.2" />
        </svg>

        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="max-w-xl">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80 mb-3">
              Jobbmatchning
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3">
              Hitta jobb som matchar ditt CV — på sekunder
            </h2>
            <p className="text-sm sm:text-base opacity-90 leading-relaxed mb-6">
              Vi läser ditt CV, identifierar dina yrkesroller och kompetenser
              och visar exakt hur väl varje jobb passar dig. Inga manuella
              sökningar.
            </p>

            <Link
              href="/dashboard/profil/cv"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Ladda upp ditt första CV
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TRE STEG SOM FORKLARAR VARDET */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Så fungerar det
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <ValueStep
            n={1}
            icon={FileText}
            title="Vi läser ditt CV"
            body="Algoritmen extraherar yrkesroller, kompetenser och utbildningar — automatiskt."
          />
          <ValueStep
            n={2}
            icon={Search}
            title="Vi matchar mot tusentals jobb"
            body="Inte bara senaste titeln — också närliggande roller och dolda möjligheter."
          />
          <ValueStep
            n={3}
            icon={Target}
            title="Du ser hur väl du passar"
            body="Procentuell matchning på varje jobb + möjlighet att skapa anpassat brev direkt."
          />
        </div>
      </div>

      {/* 3. BLURRAD PREVIEW AV EXEMPEL-RESULTAT */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Så här kommer dina träffar att se ut
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden">
          {/* Blurrade exempel-jobbkort */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none pointer-events-none"
            style={{ filter: 'blur(2px)' }}
            aria-hidden="true"
          >
            <PreviewJobCard
              relevance={94}
              role="Senior Projektledare"
              employer="Spotify Sverige"
              location="Stockholm"
              skills={['Scrum', 'Agile', 'Stakeholder Management']}
            />
            <PreviewJobCard
              relevance={87}
              role="IT-projektledare"
              employer="Klarna"
              location="Stockholm"
              skills={['SAFe', 'Jira', 'Cross-team']}
            />
            <PreviewJobCard
              relevance={78}
              role="Driftledare, IT"
              employer="Volvo Group"
              location="Göteborg"
              skills={['ITIL', 'Service Mgmt']}
            />
            <PreviewJobCard
              relevance={71}
              role="Programledare"
              employer="Ericsson"
              location="Stockholm"
              skills={['PMO', 'Roadmapping']}
            />
          </div>

          {/* Overlay med uppmaning */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/85 to-white/40">
            <Link
              href="/dashboard/profil/cv"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all"
              style={{
                background: 'linear-gradient(90deg, #F97316, #DC2626)',
                boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Ladda upp CV för att se dina riktiga träffar
              <ArrowRight
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. RAD MED FORTROENDE-MARKORER */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-2">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          Tar 30 sekunder
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          Helt gratis
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          Inget bindande
        </span>
      </div>
    </motion.div>
  );
}

function ValueStep({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="relative p-4 rounded-xl bg-orange-50/40 border border-orange-100">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
            boxShadow: '0 2px 6px -1px rgba(220, 38, 38, 0.35)',
          }}
        >
          {n}
        </span>
        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 mb-1 leading-tight">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-slate-600 leading-snug">{body}</p>
    </div>
  );
}

/**
 * Statisk preview-version av ett jobbkort — bara for visuell preview,
 * ej klickbar. Designat for att se ut som JobCard men utan logik.
 */
function PreviewJobCard({
  relevance,
  role,
  employer,
  location,
  skills,
}: {
  relevance: number;
  role: string;
  employer: string;
  location: string;
  skills: string[];
}) {
  const badgeColor =
    relevance >= 80
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : relevance >= 60
      ? 'bg-blue-50 border-blue-200 text-blue-700'
      : 'bg-amber-50 border-amber-200 text-amber-700';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-3">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full ${badgeColor}`}
        >
          <span className="text-xs font-bold tabular-nums">{relevance}%</span>
          <span className="text-[11px] font-medium">matchar ditt CV</span>
        </div>
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
          }}
        >
          <Briefcase className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            {role}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-600 flex-wrap mt-0.5">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">{employer}</span>
            <span className="text-slate-400">·</span>
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
