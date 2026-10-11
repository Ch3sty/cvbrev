// Minsta giltiga filer för validate-verbal-bank och validate-numerisk-bank.
// Testerna ändrar en sak i taget och ser att rätt regel fäller.

const meningar = (amne, n) => Array.from({ length: n }, (_, i) => `Avsnitt ${i + 1} om ${amne} beskriver hur arbetet fungerar i praktiken.`).join(' ');

function text(amne) {
  // 18 meningar om 10 ord plus en andra ståndpunkt: 188 ord
  return `${meningar(amne, 18)} Kritiker invänder däremot att många delar saknar stöd.`;
}

export function verbal() {
  const st = (cs) => [
    { text: 'Texten beskriver hur arbetet fungerar enligt författaren.', correctAnswer: 'true', typ: 'direkt', explanation: 'Det står i texten att avsnitten beskriver hur arbetet fungerar, så påståendet följer direkt av den.' },
    { text: 'Ingen kritik mot ordningen förekommer.', correctAnswer: 'false', typ: 'kvantor', explanation: 'Texten säger att kritiker invänder, så påståendet att ingen kritik förekommer motsägs av den sista meningen.' },
    { text: 'Ordningen infördes efter ett politiskt beslut i kommunen.', correctAnswer: 'cannot_say', typ: 'utanfor', explanation: 'Texten säger ingenting om hur ordningen infördes, så det går varken att bekräfta eller motsäga påståendet.' },
    cs
      ? { text: 'Kritikerna har själva arbetat med frågan tidigare.', correctAnswer: 'cannot_say', typ: 'slutledning', explanation: 'Texten nämner kritikerna men det står inte vad de har arbetat med, så påståendet går inte att avgöra.' }
      : { text: 'Det finns invändningar mot hur arbetet går till.', correctAnswer: 'true', typ: 'slutledning', explanation: 'Den sista meningen i texten säger att kritiker invänder, och därav följer att det finns invändningar.' },
  ];
  return [
    { id: 'va-90-fixtur-ett', title: 'Fixtur ett', difficulty: 2, topic: 'Arbetsliv', text: text('schemat'), statements: st(true) },
    { id: 'va-91-fixtur-tva', title: 'Fixtur två', difficulty: 2, topic: 'Samhälle', text: text('taxan'), statements: st(false) },
  ];
}

// Grundformatet: 13 meningar om 10 ord, 130 ord, en ståndpunkt, inget
// kvantorpåstående, ett cannot_say per text (25 procent i filen).
export function verbalGrund() {
  const st = () => [
    { text: 'Texten beskriver hur arbetet fungerar enligt författaren.', correctAnswer: 'true', typ: 'direkt', explanation: 'Det står i texten att avsnitten beskriver hur arbetet fungerar, så påståendet följer direkt av den.' },
    { text: 'Avsnitten handlar om något helt annat än arbetet.', correctAnswer: 'false', typ: 'direkt', explanation: 'Texten säger om avsnitt efter avsnitt att de beskriver hur arbetet fungerar, så påståendet motsägs och är falskt.' },
    { text: 'Ordningen infördes efter ett politiskt beslut i kommunen.', correctAnswer: 'cannot_say', typ: 'utanfor', explanation: 'Texten säger ingenting om hur ordningen infördes, så det går varken att bekräfta eller motsäga påståendet.' },
    { text: 'Arbetet beskrivs i mer än ett avsnitt.', correctAnswer: 'true', typ: 'slutledning', explanation: 'Texten har flera numrerade avsnitt som tar upp arbetet, och därav följer att det beskrivs i mer än ett.' },
  ];
  return [
    { id: 'vg-90-fixtur-ett', title: 'Fixtur ett', difficulty: 1, topic: 'Arbetsliv', text: meningar('schemat', 13), statements: st() },
    { id: 'vg-91-fixtur-tva', title: 'Fixtur två', difficulty: 1, topic: 'Samhälle', text: meningar('taxan', 13), statements: st() },
  ];
}

const opt = (id, text, isCorrect, misstag) => (misstag ? { id, text, isCorrect, misstag } : { id, text, isCorrect });

export function numerisk() {
  const pid = 'na-90-fixtur';
  const q = (n, questionText, options, correct, steg, precision) => ({
    id: `na-90-q0${n}`, passageId: pid, questionNumber: n, questionText, difficulty: 2, options, correctAnswerId: correct,
    berakning: { steg, visning: options.find((o) => o.isCorrect).text, precision }, explanation: 'Se stegen.',
  });
  return [{
    id: pid, title: 'Kommunens driftbudget', type: 'table', topic: 'Offentlig ekonomi', difficulty: 2,
    contextText: 'Tabellen visar driftbudgeten per förvaltning i tkr för två år.',
    dataTable: { headers: ['Förvaltning', '2024 (tkr)', '2025 (tkr)', 'Anställda'], rows: [['Skola', '1 240', '1 302', '85'], ['Omsorg', '2 150', '2 236', '140'], ['Kultur', '410', '395', '22']], caption: 'Driftbudget' },
    ovanvant: ['rad Kultur'],
    enhetsbyte: 'tkr till mkr',
    questions: [
      q(1, 'Hur många procent ökade skolans budget från 2024 till 2025?', [
        opt('a', '4,8 %', false, { typ: 'fel_bas', uttryck: '62 / 1302 * 100', varde: 4.762 }),
        opt('b', '5,0 %', true),
        opt('c', '4,0 %', false, { typ: 'fel_rad', uttryck: '(2236 - 2150) / 2150 * 100', varde: 4.0 }),
        opt('d', '62,0 %', false, { typ: 'steg_saknas', uttryck: '1302 - 1240', varde: 62 }),
      ], 'b', [{ text: 'Ökningen', uttryck: '1302 - 1240', varde: 62 }, { text: 'Andel', uttryck: '62 / 1240 * 100', varde: 5.0 }], 1),
      q(2, 'Hur mycket ökade omsorgens budget, i mkr?', [
        opt('a', '0,086 mkr', true),
        opt('b', '0,062 mkr', false, { typ: 'fel_rad', uttryck: '(1302 - 1240) / 1000', varde: 0.062 }),
        opt('c', '86 mkr', false, { typ: 'fel_enhet', uttryck: '2236 - 2150', varde: 86 }),
        opt('d', '2,236 mkr', false, { typ: 'fel_kolumn', uttryck: '2236 / 1000', varde: 2.236 }),
      ], 'a', [{ text: 'Ökningen', uttryck: '2236 - 2150', varde: 86 }, { text: 'I mkr', uttryck: '86 / 1000', varde: 0.086 }], 3),
      q(3, 'Hur stor är skolans och omsorgens budget 2025 tillsammans, i mkr?', [
        opt('a', '3,9 mkr', false, { typ: 'fel_rad', uttryck: '(1302 + 2236 + 395) / 1000', varde: 3.933 }),
        opt('b', '3,4 mkr', false, { typ: 'fel_kolumn', uttryck: '(1240 + 2150) / 1000', varde: 3.39 }),
        opt('c', '3,5 mkr', true),
        opt('d', '3 538 mkr', false, { typ: 'fel_enhet', uttryck: '1302 + 2236', varde: 3538 }),
      ], 'c', [{ text: 'Summa', uttryck: '1302 + 2236', varde: 3538 }, { text: 'I mkr', uttryck: '3538 / 1000', varde: 3.538 }], 1),
      q(4, 'Hur stor är skolans budget 2025 per anställd, i tkr?', [
        opt('a', '15,3 tkr', true),
        opt('b', '14,6 tkr', false, { typ: 'fel_kolumn', uttryck: '1240 / 85', varde: 14.588 }),
        opt('c', '16,0 tkr', false, { typ: 'fel_rad', uttryck: '2236 / 140', varde: 15.971 }),
        opt('d', '6,5 tkr', false, { typ: 'fel_operation', uttryck: '85 / 1302 * 100', varde: 6.528 }),
      ], 'a', [{ text: 'Per anställd', uttryck: '1302 / 85', varde: 15.318 }], 1),
    ],
  }];
}
