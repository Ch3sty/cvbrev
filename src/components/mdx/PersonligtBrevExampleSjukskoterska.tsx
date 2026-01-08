'use client';

import React, { useState } from 'react';
import { Download, Copy } from 'lucide-react';

const EXEMPEL_BREV = `Maria Andersson
Sjukhusvägen 45
581 85 Linköping
maria.andersson@email.se
070-456 78 90

Universitetssjukhuset i Linköping
Rekryteringsenheten
581 85 Linköping

Linköping, 29 oktober 2026

Tjänsten som sjuksköterska på intensivvårdsavdelningen

Jag söker tjänsten som sjuksköterska på intensivvårdsavdelningen vid Universitetssjukhuset i Linköping. Ert arbete med avancerad intensivvård och möjligheten att utvecklas inom specialistområdet tilltalar mig särskilt. Med fyra års erfarenhet från akutsjukvård och legitimation sedan 2021 ser jag fram emot att ta nästa steg i min karriär inom intensivvård.

Under mina år på akutmottagningen på Vrinnevi sjukhus har jag arbetat med kritiskt sjuka patienter och utvecklat god förmåga att prioritera, bedöma och agera snabbt. Jag har gedigen erfarenhet av akut omhändertagande, venpunktering, EKG-tolkning och administrering av läkemedel. Dessutom har jag vidareutbildat mig inom traumasjukvård genom TNCC-kurs och påbörjat specialistsjuksköterskeutbildning i intensivvård på distans.

Jag trivs med det komplexa och oförutsägbara arbetet inom akutsjukvård där varje skift kräver full närvaro. Samarbetet med läkare, undersköterskor och annan vårdpersonal är för mig en självklarhet – i akuta situationer är tydlig kommunikation och teamwork avgörande. Jag är van vid att dokumentera i journalsystem, deltar aktivt i kvalitetsarbete och håller mig uppdaterad genom regelbunden kompetensutveckling.

Det jag värdesätter mest i mitt yrke är möjligheten att göra verklig skillnad i patienternas mest utsatta stund. Att genom kompetens och lugn kunna stabilisera en kritiskt sjuk patient och arbeta evidensbaserat för bästa möjliga utfall – det är det som driver mig. Jag tror att min erfarenhet från akutvård, kombinerat med min pågående specialistutbildning, gör att jag snabbt kan bli en värdefull del av ert intensivvårdsteam.

Jag ser fram emot möjligheten att bidra till Universitetssjukhusets arbete med högkvalitativ intensivvård. Hör gärna av er om ni vill veta mer.

Med vänlig hälsning,

Maria Andersson`;

export default function PersonligtBrevExampleSjukskoterska() {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EXEMPEL_BREV], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personligt-brev-sjukskoterska-exempel.txt';
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
          den specifika tjänsten du söker och avdelningens profil. Ett personligt brev ska alltid vara unikt!
        </p>
      </div>
    </div>
  );
}
