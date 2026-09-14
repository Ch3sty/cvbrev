'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, User, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import BeforeAfterFlow from './BeforeAfterFlow';

export type ChangeLogItemType = 'profile' | 'role' | 'skills' | 'auto';

interface BaseProps {
  type: ChangeLogItemType;
  /** Stabil ID för scroll-target */
  id: string;
  title: string;
  subtitle?: string;
  /** Stat-tags till höger (t.ex. "+10 läsbarhet", "+3 nyckelord") */
  tags?: Array<{ label: string; tone: 'emerald' | 'orange' }>;
}

interface TextProps extends BaseProps {
  type: 'profile' | 'role';
  currentText: string;
  improvedText: string;
  keywords?: string[];
  detectNumbers?: boolean;
}

interface SkillsProps extends BaseProps {
  type: 'skills';
  skills: Array<{ skill: string; relevance: 'high' | 'medium' | 'low' }>;
}

interface AutoProps extends BaseProps {
  type: 'auto';
  bullets: string[];
}

type ChangeLogItemProps = TextProps | SkillsProps | AutoProps;

const ICON_BY_TYPE = {
  profile: User,
  role: Briefcase,
  skills: Award,
  auto: CheckCircle2,
};

export default function ChangeLogItem(props: ChangeLogItemProps) {
  const { type, id, title, subtitle, tags = [] } = props;
  const [isOpen, setIsOpen] = useState(false);
  const Icon = ICON_BY_TYPE[type];

  return (
    <div
      id={`changelog-${id}`}
      className="overflow-hidden rounded-xl border border-kant bg-panel"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-insunken sm:gap-4 sm:p-5"
        aria-expanded={isOpen}
      >
        <Icon
          className="mt-0.5 h-6 w-6 flex-shrink-0 text-ink-2"
          strokeWidth={1.75}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <h4 className="text-kort leading-tight text-ink-1">{title}</h4>
          {subtitle && (
            <p className="mt-1 text-meta leading-relaxed text-ink-3">{subtitle}</p>
          )}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <Tag key={i} label={t.label} />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 self-center">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-5 w-5 text-ink-3" strokeWidth={1.75} aria-hidden="true" />
          )}
        </div>
      </button>

      {isOpen && (
          <div className="overflow-hidden">
            <div className="px-4 pb-5 pt-0 sm:px-5">
              {(props.type === 'profile' || props.type === 'role') && (
                <BeforeAfterFlow
                  currentText={props.currentText}
                  improvedText={props.improvedText}
                  keywords={props.keywords}
                  detectNumbers={props.detectNumbers}
                />
              )}

              {props.type === 'skills' && (
                <div className="flex flex-wrap gap-2">
                  {props.skills.map((s, i) => (
                    <SkillChip key={i} skill={s.skill} relevance={s.relevance} />
                  ))}
                </div>
              )}

              {props.type === 'auto' && (
                <ul className="space-y-1.5">
                  {props.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-ink-2"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-3"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
      )}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-2">
      {label}
    </span>
  );
}

function SkillChip({ skill }: { skill: string; relevance: 'high' | 'medium' | 'low' }) {
  return (
    <span className="inline-flex items-center rounded-md border border-kant bg-insunken px-3 py-1.5 text-sm font-medium text-ink-2">
      {skill}
    </span>
  );
}
