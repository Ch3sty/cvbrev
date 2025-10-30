'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Stockholm, 15 januari 2025

Rekryteringsansvarig
Ekonomi & Redovisning Stockholm AB
Box 7890
114 56 Stockholm

Ansökan till tjänsten som ekonomiassistent

Hej,

Jag söker tjänsten som ekonomiassistent hos Ekonomi & Redovisning Stockholm AB. Med tre års erfarenhet från redovisning, goda kunskaper i Fortnox och Visma samt ett genuint intresse för siffror och struktur, tror jag att jag kan bidra till ert ekonomiteam.

Under min tid på Nordic Accounting Services har jag arbetat med löpande bokföring, fakturering, reskontra och månadsavstämningar för cirka 25 klienter. Jag har vana av att hantera leverantörsfakturor, utbetalningar och kontrollera att allt stämmer enligt verifikationer. Min noggrannhet har resulterat i noll fel vid de två senaste revisionsgenomgångarna.

Jag trivs med det strukturerade i ekonomiarbete – att varje siffra har sin plats och att allt ska gå ihop. Samtidigt uppskattar jag samarbetet med kollegor och klienter för att lösa frågor och förbättra rutiner. Min kunskap i Excel är god, och jag har byggt flera mallar för att effektivisera rapportering.

Era satsningar på digitalisering och moderna ekonomisystem är mycket tilltalande. Jag ser fram emot möjligheten att fortsätta utvecklas inom ekonomiområdet tillsammans med er.

Tack för att ni tar er tid att läsa min ansökan. Jag ser fram emot att höra från er.

Med vänliga hälsningar,
Anna Karlsson`;

export default function PersonligtBrevExampleEkonomiassistent() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([EXEMPEL_BREV], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'personligt-brev-ekonomiassistent.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXEMPEL_BREV);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kunde inte kopiera texten:', err);
    }
  };

  return (
    <div className="my-8">
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Exempel på personligt brev för ekonomiassistent
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Med erfarenhet från Fortnox och Visma
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                aria-label="Kopiera exempel på personligt brev för ekonomiassistent"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Kopierat!' : 'Kopiera'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                aria-label="Ladda ner exempel på personligt brev för ekonomiassistent"
              >
                <Download className="w-4 h-4" />
                Ladda ner
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
            {EXEMPEL_BREV}
          </pre>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Detta exempel lyfter konkreta system (Fortnox, Visma), kvantifierbara resultat (noll fel vid revision) och visar noggrannhet – viktiga egenskaper för ekonomiassistent-roller.
        </p>
      </div>
    </div>
  );
}
