'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Sparkles as _SparklesUnused,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import type {
  ParsedCV,
  ParsedRole,
  ParsedEducation,
} from '@/lib/cv/cv-parser';

void _SparklesUnused;

interface CvDetailViewProps {
  cvId: string;
  structuredData: ParsedCV | null;
  onStructured: (data: ParsedCV) => void;
}

export default function CvDetailView({
  cvId,
  structuredData,
  onStructured,
}: CvDetailViewProps) {
  if (!structuredData) {
    return <UnstructuredPrompt cvId={cvId} onStructured={onStructured} />;
  }

  const { profile, roles, education, skills, contact } = structuredData;
  const hasRoles = Array.isArray(roles) && roles.length > 0;
  const hasEducation = Array.isArray(education) && education.length > 0;
  const hasSkills = Array.isArray(skills) && skills.length > 0;
  const hasContact =
    contact && (contact.email || contact.phone || contact.address);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative space-y-5 sm:space-y-6"
    >
      <DotPatternBg />

      {profile && (
        <Section title="Profil" icon={UserIcon}>
          <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed">
            {profile}
          </p>
        </Section>
      )}

      {hasRoles && (
        <Section title="Erfarenhet" icon={Briefcase}>
          <ul className="space-y-4">
            {roles.map((role, i) => (
              <RoleItem key={i} role={role} />
            ))}
          </ul>
        </Section>
      )}

      {hasEducation && (
        <Section title="Utbildning" icon={GraduationCap}>
          <ul className="space-y-3">
            {education.map((edu, i) => (
              <EducationItem key={i} education={edu} />
            ))}
          </ul>
        </Section>
      )}

      {hasSkills && (
        <Section title="Kompetenser">
          <SkillCloud skills={skills} />
        </Section>
      )}

      {hasContact && (
        <Section title="Kontakt">
          <ContactRow contact={contact!} />
        </Section>
      )}

      {!hasRoles && !hasEducation && !hasSkills && !profile && !hasContact && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
          <AlertCircle
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            strokeWidth={2.25}
          />
          <p className="text-sm text-amber-900 leading-snug">
            Vi kunde inte tolka detta CV strukturerat. Kontrollera att råtexten
            ser rimlig ut, eller ladda upp en ny version.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function UnstructuredPrompt({
  cvId,
  onStructured,
}: {
  cvId: string;
  onStructured: (data: ParsedCV) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStructure = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cv/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Kunde inte strukturera CV:t.');
      }
      onStructured(json.data as ParsedCV);
    } catch (err: any) {
      setError(err.message || 'Något gick fel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-orange-200/60 bg-orange-50/30 p-5 sm:p-6 text-center"
    >
      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        Vi har inte tolkat det här CV:t än. Klicka för att strukturera det så
        kan vi visa det snyggt.
      </p>
      <button
        onClick={handleStructure}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all touch-manipulation min-h-[44px] disabled:opacity-60"
        style={{
          background: 'linear-gradient(90deg, #F97316, #DC2626)',
          boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.4)',
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Strukturerar...
          </>
        ) : (
          <>
            Strukturera nu
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </>
        )}
      </button>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs text-red-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Briefcase;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        {Icon && (
          <Icon className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
        )}
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

function RoleItem({ role }: { role: ParsedRole }) {
  const description = role.description?.trim();
  const responsibilities = (role.responsibilities || []).filter(
    (r) => r && r.trim().length > 0
  );

  return (
    <li className="relative pl-5 border-l-2 border-orange-200">
      <span
        className="absolute -left-[7px] top-1 w-3 h-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
          boxShadow: '0 2px 6px -1px rgba(220, 38, 38, 0.35)',
        }}
        aria-hidden="true"
      />
      <h5 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight">
        {role.title}
      </h5>
      <div className="text-xs sm:text-sm text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-1.5">
        <span className="font-medium">{role.company}</span>
        <span className="text-slate-300">·</span>
        <span className="tabular-nums">{role.period}</span>
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
          {description}
        </p>
      )}
      {responsibilities.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mt-2.5">
          {responsibilities.map((r, i) => (
            <li
              key={i}
              className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px]"
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function EducationItem({ education }: { education: ParsedEducation }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 flex items-start gap-3">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
        }}
      >
        <GraduationCap className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-tight">
          {education.degree}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          {education.institution}
          {education.period ? (
            <>
              <span className="text-slate-300 mx-1.5">·</span>
              <span className="tabular-nums">{education.period}</span>
            </>
          ) : null}
        </p>
        {education.description && (
          <p className="text-xs text-slate-500 leading-snug mt-1">
            {education.description}
          </p>
        )}
      </div>
    </li>
  );
}

function SkillCloud({ skills }: { skills: string[] }) {
  const cleaned = skills
    .filter((s) => s && s.trim().length > 0)
    .map((s) => s.trim());

  return (
    <div className="flex flex-wrap gap-1.5">
      {cleaned.map((skill, i) => {
        const isHighlighted = i < 5;
        return (
          <span
            key={`${skill}-${i}`}
            className={`px-2.5 py-1 rounded-full text-[12px] font-medium border ${
              isHighlighted
                ? 'bg-orange-100 border-orange-200 text-orange-700'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}

function ContactRow({
  contact,
}: {
  contact: NonNullable<ParsedCV['contact']>;
}) {
  const items: { Icon: typeof Mail; value: string; href?: string }[] = [];
  if (contact.email)
    items.push({ Icon: Mail, value: contact.email, href: `mailto:${contact.email}` });
  if (contact.phone)
    items.push({
      Icon: Phone,
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, '')}`,
    });
  if (contact.address) items.push({ Icon: MapPin, value: contact.address });

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map(({ Icon, value, href }, i) => (
        <li key={i} className="inline-flex items-center gap-2 text-sm text-slate-700">
          <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.25} />
          {href ? (
            <a
              href={href}
              className="hover:text-orange-700 transition-colors break-all"
            >
              {value}
            </a>
          ) : (
            <span className="break-all">{value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none -z-0"
      aria-hidden="true"
    >
      <pattern
        id="cv-detail-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#cv-detail-dots)" opacity="0.08" />
    </svg>
  );
}
