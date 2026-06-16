import {
  Brain,
  Sparkles,
  MessageSquare,
  FileText,
  FileCheck2,
  Linkedin,
  Activity,
} from 'lucide-react';

// Delad metadata per funktion: ikon, text-/bg-färgklasser och en hex-färg för
// Recharts. Används av activity-sidan + chart-komponenterna så färgkodningen är
// konsekvent tvärs KPI-kort, flöde och grafer.
export interface FuncMeta {
  icon: React.ReactNode;
  color: string;      // tailwind text+bg för pills/ikoner
  iconBg: string;     // StatsCard iconBgColor
  iconColor: string;  // StatsCard iconColor
  hex: string;        // Recharts-färg
}

export const FUNC_META: Record<string, FuncMeta> = {
  Brev: { icon: <FileText className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', hex: '#3b82f6' },
  Logiktest: { icon: <Brain className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', hex: '#6366f1' },
  'CV-mall': { icon: <FileText className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', hex: '#a855f7' },
  'CV-analys': { icon: <FileCheck2 className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', hex: '#f59e0b' },
  'LinkedIn-opt': { icon: <Linkedin className="w-4 h-4" />, color: 'text-sky-600 bg-sky-50', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', hex: '#0ea5e9' },
  Jobbcoach: { icon: <MessageSquare className="w-4 h-4" />, color: 'text-teal-600 bg-teal-50', iconBg: 'bg-teal-100', iconColor: 'text-teal-600', hex: '#14b8a6' },
  Personlighetstest: { icon: <Sparkles className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', hex: '#f43f5e' },
};

// Funktioner i en stabil ordning (störst → minst typiskt). Används för
// staplad area + KPI-kort-ordning.
export const FUNKTIONER = Object.keys(FUNC_META);

export function metaFor(funktion: string): FuncMeta {
  return (
    FUNC_META[funktion] || {
      icon: <Activity className="w-4 h-4" />,
      color: 'text-gray-600 bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      hex: '#6b7280',
    }
  );
}
