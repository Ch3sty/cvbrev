// Svensk kommun-till-region mapping för CV-vänliga adresser
const SWEDISH_MUNICIPALITY_MAPPING: { [key: string]: string } = {
  // Stockholm län
  'huddinge': 'Stockholm',
  'stockholm': 'Stockholm', 
  'södermalm': 'Stockholm',
  'norrmalm': 'Stockholm',
  'östermalm': 'Stockholm',
  'vasastan': 'Stockholm',
  'solna': 'Stockholm',
  'sundbyberg': 'Stockholm',
  'nacka': 'Stockholm',
  'danderyd': 'Stockholm',
  'täby': 'Stockholm',
  'lidingö': 'Stockholm',
  'värmdö': 'Stockholm',
  'tyresö': 'Stockholm',
  'haninge': 'Stockholm',
  'botkyrka': 'Stockholm',
  'salem': 'Stockholm',
  'ekerö': 'Stockholm',
  'upplands väsby': 'Stockholm',
  'vallentuna': 'Stockholm',
  'järfälla': 'Stockholm',
  'norrtälje': 'Stockholm',
  
  // Göteborg
  'göteborg': 'Göteborg',
  'partille': 'Göteborg', 
  'mölndal': 'Göteborg',
  'lerum': 'Göteborg',
  'alingsås': 'Göteborg',
  'kungsbacka': 'Göteborg',
  
  // Malmö
  'malmö': 'Malmö',
  'lund': 'Malmö',
  'landskrona': 'Malmö',
  'trelleborg': 'Malmö',
  'vellinge': 'Malmö',
  'svedala': 'Malmö',
  'staffanstorp': 'Malmö',
  
  // Uppsala
  'uppsala': 'Uppsala',
  'enköping': 'Uppsala',
  'håbo': 'Uppsala',
  'knivsta': 'Uppsala',
  'tierp': 'Uppsala',
  
  // Övriga större städer/regioner  
  'västerås': 'Västerås',
  'örebro': 'Örebro',
  'linköping': 'Linköping',
  'helsingborg': 'Helsingborg',
  'jönköping': 'Jönköping',
  'norrköping': 'Norrköping',
  'luleå': 'Luleå',
  'umeå': 'Umeå',
  'gävle': 'Gävle',
  'borås': 'Borås',
  'eskilstuna': 'Eskilstuna',
  'sundsvall': 'Sundsvall',
  'halmstad': 'Halmstad',
  'växjö': 'Växjö',
  'karlstad': 'Karlstad',
  'kristianstad': 'Kristianstad'
};

/**
 * Formaterar svensk adress för CV - tar bort gatuadress och konverterar kommun till större stad/region
 */
export function formatSwedishAddress(address: string): string {
  if (!address) return '';
  
  // Ta bort extra whitespace
  address = address.trim();
  
  // Regex för att hitta postnummer (5 siffror) + kommun
  const postalCodeMatch = address.match(/(\d{3}\s?\d{2})\s+(.+?)(?:,|$)/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1].replace(/(\d{3})(\d{2})/, '$1 $2'); // Formatera med mellanslag
    const municipality = postalCodeMatch[2].toLowerCase().trim();
    
    // Hitta rätt stad/region för kommunen
    const city = SWEDISH_MUNICIPALITY_MAPPING[municipality] || 
                 municipality.charAt(0).toUpperCase() + municipality.slice(1);
    
    return `${postalCode} ${city}, Sverige`;
  }
  
  // Om ingen postkod hittades, kolla om det bara är ett ortsnamn
  const lowerAddress = address.toLowerCase();
  for (const [municipality, city] of Object.entries(SWEDISH_MUNICIPALITY_MAPPING)) {
    if (lowerAddress.includes(municipality)) {
      return `${city}, Sverige`;
    }
  }
  
  // Fallback - returnera originaladress med Sverige tillagt om den inte redan finns
  return address.includes('Sverige') ? address : `${address}, Sverige`;
}