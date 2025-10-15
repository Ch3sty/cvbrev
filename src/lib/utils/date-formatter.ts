/**
 * Formaterar datum till svenskt format med relativa datum
 * @param dateString - ISO datum-sträng
 * @returns Formaterad datum-sträng (t.ex. "Idag", "Igår", "3 dagar sedan")
 */
export const formatCVDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();

    // Kontrollera om datumet är giltigt
    if (isNaN(date.getTime())) {
      return 'Okänt datum';
    }

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor sedan`;

    return date.toLocaleDateString('sv-SE');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Okänt datum';
  }
};
