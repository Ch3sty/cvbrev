'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Dr. Erik Bergström
Läkarvägen 8
171 77 Stockholm
erik.bergstrom@email.se
070-345 67 89

Karolinska Universitetssjukhuset
Rekryteringsenheten
171 76 Stockholm

Stockholm, 29 oktober 2025

Tjänsten som ST-läkare i internmedicin

Jag söker tjänsten som ST-läkare i internmedicin på Karolinska Universitetssjukhuset. Ert fokus på akademisk medicin och möjligheten att kombinera kliniskt arbete med forskning tilltalar mig särskilt. Med tre års erfarenhet som AT-läkare och legitimation sedan 2023 ser jag fram emot att utvecklas inom internmedicin på en av landets ledande universitetssjukhus.

Under min AT-tjänstgöring på Danderyds sjukhus har jag roterat genom internmedicin, kirurgi, psykiatri och primärvård. Jag har gedigen erfarenhet av akut omhändertagande, diagnostik och behandling av komplexa internmedicinska tillstånd. Mitt särskilda intresse för hjärt-kärlsjukdomar har lett till deltagande i ett forskningsprojekt om prevention av stroke hos äldre patienter, vilket resulterade i en publikation i Läkartidningen.

Jag trivs med det varierade arbetet inom internmedicin där varje patient utgör ett diagnostiskt pussel. Samarbetet i multiprofessionella team är för mig en självklarhet – genom god kommunikation med sjuksköterskor, dietister, fysioterapeuter och andra specialister skapar vi bästa möjliga vård. Jag är van vid att arbeta evidensbaserat och att hålla mig uppdaterad genom regelbunden litteraturgenomgång och deltagande i kvalitetsarbete.

Det jag värdesätter mest i mitt yrke är möjligheten att göra skillnad för patienter med komplexa sjukdomstillstånd. Att genom noggrann anamnes och undersökning komma fram till rätt diagnos, och sedan se patienten förbättras genom evidensbaserad behandling – det är det som driver mig. Jag tror att min erfarenhet från akutvård, kombinerat med mitt forskningsintresse, passar väl in på Karolinska där klinisk excellens och akademisk utveckling går hand i hand.

Jag ser fram emot möjligheten att bidra till Karolinska Universitetssjukhusets arbete med att utveckla framtidens internmedicin. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Erik Bergström`;

export default function PersonligtBrevExampleLakare() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-lakare-exempel.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(EXEMPEL_BREV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-800 bg-gray-50 p-8 rounded-lg border border-gray-200">
            {EXEMPEL_BREV}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-5 h-5" />
          Ladda ned exempel (.txt)
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-200 transition-colors"
        >
          <Copy className="w-5 h-5" />
          {copied ? 'Kopierat!' : 'Kopiera text'}
        </button>
      </div>

      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Tips:</strong> Detta är ett exempel. Anpassa innehållet efter din egen erfarenhet,
          den specifika tjänsten du söker och sjukhusets profil. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
