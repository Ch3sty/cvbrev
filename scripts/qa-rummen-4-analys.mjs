// scripts/qa-rummen-4-analys.mjs
// Delat mellan qa-rummen-4.mjs och qa-rummen-klar3.mjs.

/** Ett sparat analysresultat i analysens form, med strukturerat CV (21.3 punkt 2). */
export const QA_ANALYS = {
  analysisType: 'premium',
  atsFriendliness: { score: 72, feedback: 'Sammanfattningen saknar yrkesroll och antal år.', missingKeywords: [] },
  profileSummary: { atsImpact: 9, changes: ['Yrkesroll och år först'], currentText: 'Driven person.', improvedText: 'Projektledare med sju år i offentlig sektor.' },
  roleBasedImprovements: [
    { roleTitle: 'Projektledare', company: 'Västra Götalandsregionen', period: '2019-2026', atsImpact: 5, currentText: 'Ansvarade för projekt.', suggestedText: 'Ledde åtta IT-projekt med budgetansvar på 12 miljoner kronor.', improvements: { keywords: [], grammarIssues: [], atsOptimization: true, hasQuantification: true } },
  ],
  skillSuggestions: [
    { skill: 'SAP', atsImpact: 4, source: 'annons', reasoning: 'Står i annonsen.', relevance: 'high' },
    { skill: 'Agil projektledning', atsImpact: 3, source: 'annons', reasoning: 'Står i annonsen.', relevance: 'high' },
  ],
  generalImprovements: [{ title: 'Datumformat', category: 'format', atsImpact: 2, description: 'Blandade datumformat i erfarenheten.' }],
  structuredCV: {
    personalInfo: { fullName: 'Anna Andersson', address: 'Göteborg' },
    summary: 'Driven person.',
    experience: [{ position: 'Projektledare', company: 'Västra Götalandsregionen', location: 'Göteborg', startDate: '2019', endDate: '2026', description: ['Ansvarade för projekt.'] }],
    education: [{ degree: 'Civilingenjör', institution: 'Chalmers', graduationYear: '2015' }],
    skills: [{ category: 'Färdigheter', skills: ['Projektledning', 'Upphandling'] }],
  },
}
