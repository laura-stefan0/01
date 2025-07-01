#!/usr/bin/env node

function cleanTitle(title) {
  if (!title) return '';
  
  let cleanedTitle = title.trim();
  
  // Remove date patterns at the beginning (DD/MM, DD-MM, DD.MM, DD/MM/YYYY, etc.)
  cleanedTitle = cleanedTitle.replace(/^\d{1,2}[\/\-\.]\d{1,2}(\/{1,2}\d{2,4})?\s*[\-–]?\s*/, '');
  
  // Remove city/location patterns at the beginning followed by dash
  // Common Italian cities and regions
  const italianCities = [
    'roma', 'milano', 'napoli', 'torino', 'palermo', 'genova', 'bologna', 'firenze', 'bari', 'catania',
    'venezia', 'verona', 'messina', 'padova', 'trieste', 'brescia', 'taranto', 'prato', 'reggio calabria',
    'modena', 'parma', 'perugia', 'livorno', 'cagliari', 'foggia', 'salerno', 'ravenna', 'ferrara',
    'rimini', 'syrakuse', 'sassari', 'monza', 'bergamo', 'pescara', 'vicenza', 'terni', 'forlì',
    'trento', 'novara', 'piacenza', 'ancona', 'andria', 'arezzo', 'udine', 'cesena', 'lecce', 'pesaro'
  ];
  
  // Create regex pattern for cities
  const cityPattern = new RegExp(`^(${italianCities.join('|')})\\s*[\\-–]?\\s*`, 'i');
  cleanedTitle = cleanedTitle.replace(cityPattern, '');
  
  // Remove generic location patterns like "Piazza X -" or "Via Y -"
  cleanedTitle = cleanedTitle.replace(/^(piazza|via|corso|viale|largo|ponte)\s+[^-–]+[\-–]\s*/i, '');
  
  // Remove double quotes at the beginning and end of title
  cleanedTitle = cleanedTitle.replace(/^["""]/, '').replace(/["""]$/, '');
  
  // Remove extra spaces and dashes at the beginning
  cleanedTitle = cleanedTitle.replace(/^[\s\-–]+/, '');
  
  // Capitalize first letter
  if (cleanedTitle.length > 0) {
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);
  }
  
  return cleanedTitle.trim();
}

// Test cases
const testTitles = [
  '15/07 Venezia - Assemblea',
  '"Fermiamo la guerra!"',
  'Milano - Manifestazione per il clima',
  '22/08 Roma - Corteo studentesco',
  'Venezia - "No Space For Bezos". Assemblea pubblica',
  '"Andiamo verso il Parlamento" – Il 26 maggio la piazza sfida il Decreto Sicurezza',
  'Piazza Duomo - Presidio per i diritti',
  'Via Roma - Sit-in contro la guerra'
];

console.log('🧪 Testing title cleaning function:');
console.log('=====================================');

testTitles.forEach(title => {
  const cleaned = cleanTitle(title);
  console.log(`Input:  "${title}"`);
  console.log(`Output: "${cleaned}"`);
  console.log('---');
});