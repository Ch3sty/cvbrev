'use client';

/**
 * Varningsrad i provet: ett svar kunde inte sparas, eller något gick fel vid
 * slutförandet. En rad i varning-mjuk, ingen rörelse, aldrig ett helt kort i
 * färg. Standardtexten gäller osparade svar; `message` kan ersätta den.
 */
export function UnsavedAnswerBanner({
  message = 'Ett svar kunde inte sparas. Vi försöker igen automatiskt.',
  className = '',
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`flex min-h-11 items-center gap-2 rounded-lg border border-kant bg-varning-mjuk px-3 ${className}`}
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-varning" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-1">{message}</p>
    </div>
  );
}
