import { CheckCircle2, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface RichTextProps {
  text: string;
}

/**
 * Renderar exempel-data-text med:
 * - Paragraph-splitting på \n\n
 * - Markdown bold (**text**) → <strong>
 * - Emoji-prefix (❌ / ✅) → ikon-pill med färg (för "fel-exempel" / "bra-exempel")
 *
 * Datan i page.tsx innehåller fortfarande emojis och markdown men ska
 * renderas som professionella komponenter, inte rå text.
 */
export default function RichText({ text }: RichTextProps) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
      {paragraphs.map((paragraph, idx) => (
        <Paragraph key={idx} text={paragraph} />
      ))}
    </div>
  );
}

function Paragraph({ text }: { text: string }) {
  // Detektera "Exempel"-rader (`**Exempel på ...**:`) — rendera som rubrik
  const exempelMatch = text.match(/^\*\*(Exempel[^*]*)\*\*:?\s*$/);
  if (exempelMatch) {
    return (
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 pt-1">
        {exempelMatch[1]}
      </div>
    );
  }

  // Detektera ❌-rader (negativt exempel)
  if (text.startsWith('❌')) {
    const cleanText = text.replace(/^❌\s*/, '');
    return (
      <ExamplePill
        type="bad"
        text={cleanText}
      />
    );
  }

  // Detektera ✅-rader (positivt exempel)
  if (text.startsWith('✅')) {
    const cleanText = text.replace(/^✅\s*/, '');
    return (
      <ExamplePill
        type="good"
        text={cleanText}
      />
    );
  }

  // Normal paragraph med inline markdown bold
  return <p>{renderInline(text)}</p>;
}

function ExamplePill({ type, text }: { type: 'good' | 'bad'; text: string }) {
  const isGood = type === 'good';
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 sm:p-4 border ${
        isGood
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-rose-50/60 border-rose-200'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isGood ? (
          <CheckCircle2
            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"
            strokeWidth={2.5}
          />
        ) : (
          <XCircle
            className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500"
            strokeWidth={2.5}
          />
        )}
      </div>
      <div
        className={`text-sm leading-relaxed ${
          isGood ? 'text-emerald-900' : 'text-rose-900'
        }`}
      >
        {renderInline(text)}
      </div>
    </div>
  );
}

/**
 * Renderar inline markdown bold (**text**) som <strong>.
 * Stödjer också ren citationstecken-text utan ändring.
 */
function renderInline(text: string): ReactNode {
  if (!text.includes('**')) {
    return text;
  }

  // Splitta på **...** — match[0]=hela, match[1]=innehåll
  const parts: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-slate-900">
        {match[1]}
      </strong>
    );
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}
