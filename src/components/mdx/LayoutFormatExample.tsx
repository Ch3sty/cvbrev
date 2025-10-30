'use client';

import React from 'react';

interface LayoutFormatExampleProps {
  variant: 'spacing' | 'accent' | 'conservative' | 'modern' | 'balanced';
}

export default function LayoutFormatExample({ variant }: LayoutFormatExampleProps) {
  const examples = {
    spacing: {
      title: 'Exempel på rätt radavstånd',
      content: `Anna Andersson
070-123 45 67 | anna.andersson@email.com

[Tom rad]

Stockholm, 30 januari 2025

[Tom rad]

Innovate AB
Att: Maria Svensson, HR-chef
Box 123
111 22 Stockholm

[Tom rad]

Jag söker tjänsten som marknadskoordinator på Innovate AB...
[1,15 eller 1,5 radavstånd här]

[Tom rad mellan stycken]

Under mina tre år på Digital Growth har jag...`
    },
    accent: {
      title: 'Exempel på diskret accentfärg',
      content: `ANNA ANDERSSON [mörkblå, 16pt, fet]
070-123 45 67 | anna.andersson@email.com [grå, 11pt]

[Resten av texten svart på vit bakgrund]`
    },
    conservative: {
      title: 'Konservativ layout – för traditionella branscher',
      subtitle: 'Passar för: Juridik, finans, revision, offentlig sektor, försäkring',
      content: `Anna Andersson
Storgatan 12, 111 22 Stockholm
070-123 45 67 | anna.andersson@email.com

Stockholm, 30 januari 2025

Advokatfirman Lindahl KB
Att: Maria Svensson, HR-chef
Box 14240
104 40 Stockholm

Ansökan till tjänsten som juridisk assistent

Jag söker tjänsten som juridisk assistent på Advokatfirman Lindahl...`
    },
    modern: {
      title: 'Modern layout – för tech och startup',
      subtitle: 'Passar för: IT, tech, startup, kreativa byråer, digitala bolag',
      content: `ANNA ANDERSSON [mörkblå, fet]
070-123 45 67 | anna.andersson@email.com | linkedin.com/in/annaandersson

Jag söker tjänsten som produktdesigner på Spotify. Med fem års erfarenhet
från UX-design och en passion för användarcentrerad produktutveckling...`
    },
    balanced: {
      title: 'Balanserad layout – för de flesta branscher',
      subtitle: 'Passar för: Marknadsföring, HR, försäljning, administration, vård, utbildning',
      content: `Anna Andersson
070-123 45 67 | anna.andersson@email.com

Stockholm, 30 januari 2025

Nordic Consulting Group
Att: Maria Svensson, Rekryteringsansvarig
Storgatan 10
111 22 Stockholm

Jag söker tjänsten som marknadskoordinator på Nordic Consulting Group...`
    }
  };

  const example = examples[variant];

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {example.title}
        </h3>
        {example.subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {example.subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {example.content}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">OBS:</strong> Detta är ett format-exempel som visar struktur och layout. Anpassa alltid till din egen situation.
        </p>
      </div>
    </div>
  );
}
