// src/lib/applications/shareTtl.ts
// Hur länge en delningslänk för Sökta tjänster gäller. Egen modul utan
// beroenden, så att publika sidor och deras data (klientsäkra) kan läsa talet
// utan att dra in crypto och adminklienten ur shareLinks.ts.

export const APPLICATION_SHARE_TTL_DAYS = 30;
