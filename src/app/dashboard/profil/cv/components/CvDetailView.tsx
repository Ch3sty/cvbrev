'use client';

import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import type {
  ParsedCV,
  ParsedRole,
  ParsedEducation,
} from '@/lib/cv/cv-parser';

interface UserContact {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface CvDetailViewProps {
  cvId: string;
  structuredData: ParsedCV | Record<string, any> | null;
  onStructured: (data: ParsedCV) => void;
  userContact?: UserContact;
}

function normalizeToParsedCV(data: any, userContact?: UserContact): ParsedCV | null {
  if (!data) return null;
  if (Array.isArray(data.roles)) return data as ParsedCV;
  if (data.experience || data.personalInfo) {
    return {
      name: userContact?.full_name || data.personalInfo?.fullName || '',
      profile: data.summary || '',
      contact: {
        email: userContact?.email || '',
        phone: userContact?.phone || '',
        address: userContact?.location || '',
      },
      roles: (data.experience || []).map((exp: any) => ({
        title: exp.position || '',
        company: exp.company || '',
        period: [exp.startDate, exp.endDate || 'Nuvarande'].filter(Boolean).join(' – '),
        description: Array.isArray(exp.description) ? exp.description.join(' ') : exp.description || '',
        responsibilities: Array.isArray(exp.description) ? exp.description : [],
        originalText: '',
      })),
      education: (data.education || []).map((edu: any) => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        period: edu.graduationYear || '',
        description: edu.description || '',
      })),
      skills: (data.skills || []).flatMap((s: any) =>
        typeof s === 'string' ? s : Array.isArray(s.skills) ? s.skills : []
      ),
    };
  }
  return null;
}

export default function CvDetailView({
  cvId,
  structuredData,
  onStructured,
  userContact,
}: CvDetailViewProps) {
  const normalized = normalizeToParsedCV(structuredData, userContact);

  if (!normalized) {
    return <UnstructuredPrompt cvId={cvId} onStructured={onStructured} />;
  }

  const { profile, roles, education, skills, contact } = normalized;
  const hasRoles = Array.isArray(roles) && roles.length > 0;
  const hasEducation = Array.isArray(education) && education.length > 0;
  const hasSkills = Array.isArray(skills) && skills.length > 0;
  const hasContact =
    contact && (contact.email || contact.phone || contact.address);

  return (
    <div className="space-y-5 sm:space-y-6">
      {profile && (
        <Section title="Profil" icon={UserIcon}>
          <p className="text-sm leading-relaxed text-ink-2">
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
        <p className="rounded-xl border border-kant bg-panel p-4 text-sm leading-snug text-ink-2">
          Vi kunde inte tolka detta CV strukturerat. Kontrollera att råtexten
          ser rimlig ut, eller ladda upp en ny version.
        </p>
      )}
    </div>
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
    <div className="rounded-xl border border-kant bg-panel p-4 text-center sm:p-5">
      <p className="mb-4 text-sm leading-relaxed text-ink-2">
        Vi har inte tolkat det här CV:t än. Strukturera det så visar vi
        erfarenhet, utbildning och kompetenser var för sig.
      </p>
      <button
        onClick={handleStructure}
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Strukturerar
          </>
        ) : (
          <>
            Strukturera nu
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </>
        )}
      </button>
      {error && <p className="mt-3 text-meta text-fel">{error}</p>}
    </div>
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
      <div className="mb-2.5 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-ink-3" strokeWidth={1.75} aria-hidden="true" />}
        <h4 className="text-steg uppercase text-ink-3">{title}</h4>
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
    <li className="relative border-l border-kant pl-5">
      <span
        className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-ink-3"
        aria-hidden="true"
      />
      <h5 className="text-kort leading-tight text-ink-1">{role.title}</h5>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-meta text-ink-3">
        <span className="font-medium">{role.company}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{role.period}</span>
      </div>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{description}</p>
      )}
      {responsibilities.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {responsibilities.map((r, i) => (
            <li
              key={i}
              className="rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta text-ink-2"
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
    <li className="flex items-start gap-3 rounded-xl border border-kant bg-panel p-3">
      <GraduationCap
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-ink-3"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-kort leading-tight text-ink-1">{education.degree}</p>
        <p className="mt-0.5 text-meta text-ink-3">
          {education.institution}
          {education.period ? (
            <>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span className="tabular-nums">{education.period}</span>
            </>
          ) : null}
        </p>
        {education.description && (
          <p className="mt-1 text-meta leading-snug text-ink-3">
            {education.description}
          </p>
        )}
      </div>
    </li>
  );
}

function SkillCloud({ skills }: { skills: (string | { category?: string; skills?: string[] })[] }) {
  const cleaned = skills
    .flatMap((s) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && Array.isArray(s.skills)) return s.skills;
      return [];
    })
    .filter((s) => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim());

  return (
    <ul className="flex flex-wrap gap-1.5">
      {cleaned.map((skill, i) => (
        <li
          key={`${skill}-${i}`}
          className="rounded-md border border-kant bg-insunken px-2.5 py-1 text-meta font-medium text-ink-2"
        >
          {skill}
        </li>
      ))}
    </ul>
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
        <li key={i} className="inline-flex items-center gap-2 text-sm text-ink-2">
          <Icon
            className="h-4 w-4 flex-shrink-0 text-ink-3"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {href ? (
            <a
              href={href}
              className="break-all underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
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
