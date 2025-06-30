
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

// US cities database for quick lookup
export const usCities: Record<string, { lat: number; lng: number; name: string }> = {
  // California
  'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
  'san francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
  'san diego': { lat: 32.7157, lng: -117.1611, name: 'San Diego' },
  'sacramento': { lat: 38.5816, lng: -121.4944, name: 'Sacramento' },
  'fresno': { lat: 36.7378, lng: -119.7871, name: 'Fresno' },
  'oakland': { lat: 37.8044, lng: -122.2711, name: 'Oakland' },
  
  // New York
  'new york city': { lat: 40.7128, lng: -74.0060, name: 'New York City' },
  'buffalo': { lat: 42.8864, lng: -78.8784, name: 'Buffalo' },
  'rochester': { lat: 43.1566, lng: -77.6088, name: 'Rochester' },
  'syracuse': { lat: 43.0481, lng: -76.1474, name: 'Syracuse' },
  'albany': { lat: 42.6526, lng: -73.7562, name: 'Albany' },
  
  // Texas
  'houston': { lat: 29.7604, lng: -95.3698, name: 'Houston' },
  'san antonio': { lat: 29.4241, lng: -98.4936, name: 'San Antonio' },
  'dallas': { lat: 32.7767, lng: -96.7970, name: 'Dallas' },
  'austin': { lat: 30.2672, lng: -97.7431, name: 'Austin' },
  'fort worth': { lat: 32.7555, lng: -97.3308, name: 'Fort Worth' },
  'el paso': { lat: 31.7619, lng: -106.4850, name: 'El Paso' },
  
  // Florida
  'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami' },
  'tampa': { lat: 27.9506, lng: -82.4572, name: 'Tampa' },
  'orlando': { lat: 28.5383, lng: -81.3792, name: 'Orlando' },
  'jacksonville': { lat: 30.3322, lng: -81.6557, name: 'Jacksonville' },
  
  // Illinois
  'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago' },
  'aurora': { lat: 41.7606, lng: -88.3200, name: 'Aurora' },
  'peoria': { lat: 40.6936, lng: -89.5890, name: 'Peoria' },
  
  // Pennsylvania
  'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia' },
  'pittsburgh': { lat: 40.4406, lng: -79.9959, name: 'Pittsburgh' },
  
  // Ohio
  'columbus': { lat: 39.9612, lng: -82.9988, name: 'Columbus' },
  'cleveland': { lat: 41.4993, lng: -81.6944, name: 'Cleveland' },
  'cincinnati': { lat: 39.1031, lng: -84.5120, name: 'Cincinnati' },
  
  // Georgia
  'atlanta': { lat: 33.7490, lng: -84.3880, name: 'Atlanta' },
  
  // Michigan
  'detroit': { lat: 42.3314, lng: -83.0458, name: 'Detroit' }
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

export function findUSCity(query: string): { lat: number; lng: number; name: string } | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (usCities[normalizedQuery]) {
    return usCities[normalizedQuery];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(usCities)) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      return value;
    }
  }
  
  return null;
}

export function findCityCoordinates(cityName: string, country: string): { lat: number; lng: number; name: string } | null {
  if (country === 'it') {
    return findItalianCity(cityName);
  } else if (country === 'us') {
    return findUSCity(cityName);
  }
  return null;
}
