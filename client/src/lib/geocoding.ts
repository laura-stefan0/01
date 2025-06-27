
// Geocoding service for finding locations
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  country?: string;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  try {
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ActivistApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const results = await response.json();
    
    if (results && results.length > 0) {
      const result = results[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Italian cities database for quick lookup
export const italianCities: Record<string, { lat: number; lng: number; name: string }> = {
  'milano': { lat: 45.4642, lng: 9.1900, name: 'Milano' },
  'roma': { lat: 41.9028, lng: 12.4964, name: 'Roma' },
  'napoli': { lat: 40.8518, lng: 14.2681, name: 'Napoli' },
  'torino': { lat: 45.0703, lng: 7.6869, name: 'Torino' },
  'palermo': { lat: 38.1157, lng: 13.3615, name: 'Palermo' },
  'genova': { lat: 44.4056, lng: 8.9463, name: 'Genova' },
  'bologna': { lat: 44.4949, lng: 11.3426, name: 'Bologna' },
  'firenze': { lat: 43.7696, lng: 11.2558, name: 'Firenze' },
  'bari': { lat: 41.1171, lng: 16.8719, name: 'Bari' },
  'catania': { lat: 37.5079, lng: 15.0830, name: 'Catania' },
  'venezia': { lat: 45.4408, lng: 12.3155, name: 'Venezia' },
  'verona': { lat: 45.4384, lng: 10.9916, name: 'Verona' },
  'messina': { lat: 38.1938, lng: 15.5540, name: 'Messina' },
  'padova': { lat: 45.4064, lng: 11.8768, name: 'Padova' },
  'trieste': { lat: 45.6495, lng: 13.7768, name: 'Trieste' },
  'brescia': { lat: 45.5416, lng: 10.2118, name: 'Brescia' },
  'taranto': { lat: 40.4668, lng: 17.2725, name: 'Taranto' },
  'prato': { lat: 43.8777, lng: 11.1023, name: 'Prato' },
  'parma': { lat: 44.8015, lng: 10.3279, name: 'Parma' },
  'modena': { lat: 44.6471, lng: 10.9252, name: 'Modena' },
  'reggio emilia': { lat: 44.6989, lng: 10.6308, name: 'Reggio Emilia' },
  'perugia': { lat: 43.1122, lng: 12.3888, name: 'Perugia' },
  'livorno': { lat: 43.5423, lng: 10.3155, name: 'Livorno' },
  'cagliari': { lat: 39.2238, lng: 9.1216, name: 'Cagliari' },
  'foggia': { lat: 41.4621, lng: 15.5444, name: 'Foggia' },
  'rimini': { lat: 44.0678, lng: 12.5695, name: 'Rimini' },
  'salerno': { lat: 40.6824, lng: 14.7681, name: 'Salerno' },
  'ferrara': { lat: 44.8378, lng: 11.6196, name: 'Ferrara' },
  'sassari': { lat: 40.7259, lng: 8.5567, name: 'Sassari' },
  'latina': { lat: 41.4677, lng: 12.9036, name: 'Latina' }
};

export function findItalianCity(query: string): { lat: number; lng: number; name: string } | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (italianCities[normalizedQuery]) {
    return italianCities[normalizedQuery];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(italianCities)) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      return value;
    }
  }
  
  return null;
}
