// Sökvägen som proxyn lägger på requesten för /dashboard, så att
// dashboard-layouten kan räkna rummet på servern (spec-rummen avsnitt 5).
export const PATHNAME_HEADER = 'x-pathname'

// Frågesträngen för samma requests (?visa=hem och liknande), så att en layout
// kan fatta ett beslut som annars bara sidan ser. Sätts och skrivs över av
// proxyn, kan alltså inte komma utifrån.
export const SOK_HEADER = 'x-sok'
