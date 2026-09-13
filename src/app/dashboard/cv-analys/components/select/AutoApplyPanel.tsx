'use client';

interface AutoImprovement {
  area?: string;
  title?: string;
  suggestion?: string;
  description?: string;
  example?: string;
  category?: string;
}

interface AutoApplyPanelProps {
  improvements: AutoImprovement[];
}

/**
 * De allmänna förbättringarna, som tillämpas utan att man väljer dem.
 * Bort: gröna bockar på varje rad och gröna kanter. En panel, en lista.
 */
export default function AutoApplyPanel({ improvements }: AutoApplyPanelProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <h4 className="text-kort text-ink-1">Vi tar hand om resten åt dig</h4>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">
          De här förbättringarna är allmänna och tillämpas automatiskt när du
          går vidare. Du behöver inte välja något här.
        </p>
      </section>

      <section className="rounded-xl border border-kant bg-panel">
        <ul className="divide-y divide-kant">
          {improvements.map((improvement, index) => (
            <li key={index} className="px-4 py-3">
              <p className="text-kort leading-tight text-ink-1">
                {improvement.area || improvement.title || 'Förbättring'}
              </p>
              {(improvement.suggestion || improvement.description) && (
                <p className="mt-1 text-meta leading-relaxed text-ink-3">
                  {improvement.suggestion || improvement.description}
                </p>
              )}
              {improvement.example && (
                <p className="mt-1 text-meta italic text-ink-3">
                  Exempel: {improvement.example}
                </p>
              )}
              {improvement.category && !improvement.example && (
                <span className="mt-1.5 inline-flex items-center rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-2">
                  {improvement.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
