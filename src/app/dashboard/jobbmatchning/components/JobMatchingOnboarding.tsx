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
      {/* 1. HERO */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-neutral-200">
        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="max-w-xl">
            <div className="text-xs sm:text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-3">
              Jobbmatchning
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-3 text-neutral-900">
              Hitta jobb som matchar ditt CV, på sekunder
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
              Vi läser ditt CV, identifierar dina yrkesroller och kompetenser
              och visar exakt hur väl varje jobb passar dig. Inga manuella
              sökningar.
            </p>

            <Link
              href="/dashboard/profil/cv"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Ladda upp ditt första CV
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TRE STEG SOM FORKLARAR VARDET */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Så fungerar det
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <ValueStep
            n={1}
            icon={FileText}
            title="Vi läser ditt CV"
            body="Algoritmen extraherar yrkesroller, kompetenser och utbildningar, automatiskt."
          />
          <ValueStep
            n={2}
            icon={Search}
            title="Vi matchar mot tusentals jobb"
            body="Inte bara senaste titeln, också närliggande roller och dolda möjligheter."
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
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Så här kommer dina träffar att se ut
          </span>
        </div>

        <div className="relative rounded-xl overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Link
              href="/dashboard/profil/cv"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base transition-all"
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
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 pt-2">
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
        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-orange-600 text-white text-xs font-bold">
          {n}
        </span>
        <Icon className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
      </div>
      <h4 className="text-sm font-semibold text-neutral-900 mb-1 leading-tight">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-neutral-600 leading-snug">{body}</p>
    </div>
  );
}

/**
 * Statisk preview-version av ett jobbkort, bara for visuell preview,
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
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="mb-3">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full ${badgeColor}`}
        >
          <span className="text-xs font-bold tabular-nums">{relevance}%</span>
          <span className="text-xs font-medium">matchar ditt CV</span>
        </div>
      </div>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center text-white">
          <Briefcase className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 leading-snug">
            {role}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-neutral-600 flex-wrap mt-0.5">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">{employer}</span>
            <span className="text-neutral-400">·</span>
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded text-xs font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
