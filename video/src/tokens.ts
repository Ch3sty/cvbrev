// Färger och typsnitt ur produkten på main (globals.css, Träningens rum och
// publikt v2). Videon har inga egna kulörer.
export const C = {
  // Träningens rum
  golv: '#EBEDF6',
  vagg: '#1B2246',
  vagg2: '#2B3470',
  vagg3: '#121737',
  vaggInk: '#F5F6FC',
  vaggMjuk: '#AEB4DA',
  vaggSvag: '#6F78B0',
  vaggKant: 'rgba(255,255,255,0.12)',
  glas: 'rgba(255,255,255,0.05)',
  ljus: '#93A0EC',
  ton: '#DFE3F6',
  tonInk: '#3B4790',
  // papper och text
  papper: '#FFFFFF',
  papper2: '#F4F3F0',
  kant: '#E3E1DC',
  kantStark: '#C9C6BF',
  ink1: '#1A1A1F',
  ink2: '#4A4A55',
  ink3: '#65656E',
  // koppar
  koppar: '#E07A2F',
  kopparInk: '#A8491A',
  kopparDjup: '#C4621F',
  kopparLjus: '#F4B98A',
  kopparText: '#1A1206',
  kopparMjuk: '#FBE3D0',
  // figurerna i matriserna (geometri.json)
  figur: '#020617',
  figurRam: '#64748B',
};

export const VAGG_TONING = `linear-gradient(168deg, ${C.vagg2} 0%, ${C.vagg} 48%, ${C.vagg3} 100%)`;
export const KNAPP_TONING = `linear-gradient(180deg, #E8863B 0%, ${C.koppar} 45%, ${C.kopparDjup} 100%)`;
export const LYFT = '0 1px 2px rgba(20,20,40,0.05), 0 10px 24px -14px rgba(20,20,40,0.18)';

export const F = {
  display: "'Schibsted Grotesk', 'Inter', system-ui, sans-serif",
  text: "'Inter', system-ui, sans-serif",
};
