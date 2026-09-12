'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import BeforeAfterFlow from './BeforeAfterFlow';

export type ChangeLogItemType = 'profile' | 'role' | 'skills' | 'auto';

interface BaseProps {
  type: ChangeLogItemType;
  /** Stabil ID för scroll-target */
  id: string;
  title: string;
  subtitle?: string;
  /** Stat-tags till höger (t.ex. "+10 ATS", "+3 nyckelord") */
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
  const isAuto = type === 'auto';

  return (
    <motion.div
      id={`changelog-${id}`}
      layout="position"
      className="rounded-xl bg-white overflow-hidden"
      style={{
        border: isAuto
          ? '1px solid rgba(16, 185, 129, 0.22)'
          : '1px solid rgba(249, 115, 22, 0.25)',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-orange-50/30 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${isAuto ? 'text-emerald-600' : 'text-neutral-700'}`} strokeWidth={2.25} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-tight">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <Tag key={i} label={t.label} tone={t.tone} />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 self-center">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" strokeWidth={2.25} />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" strokeWidth={2.25} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 pt-0">
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
                      className="flex items-start gap-2 text-sm text-neutral-700 leading-relaxed"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 bg-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Tag({ label, tone }: { label: string; tone: 'emerald' | 'orange' }) {
  const styles =
    tone === 'emerald'
      ? {
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#047857',
        }
      : {
          background: 'rgba(249, 115, 22, 0.08)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          color: '#9A3412',
        };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
      style={styles}
    >
      {label}
    </span>
  );
}

function SkillChip({
  skill,
  relevance,
}: {
  skill: string;
  relevance: 'high' | 'medium' | 'low';
}) {
  const styles =
    relevance === 'high'
      ? {
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#047857',
        }
      : relevance === 'medium'
      ? {
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.4)',
          color: '#C2410C',
        }
      : {
          background: 'rgba(148, 163, 184, 0.12)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          color: '#475569',
        };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={styles}
    >
      {skill}
    </span>
  );
}
