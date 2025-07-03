/**
 * Geolocation utility for getting user's current location and reverse geocoding
 * Uses native browser geolocation API and OpenStreetMap Nominatim for reverse geocoding
 */

// TypeScript interfaces for type safety
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  county?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationResult {
  city: string;
  region: string;
  formatted: string;
  coordinates: Coordinates;
}

interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get user's current position using browser geolocation API
 * @param forceRefresh - If true, forces fresh GPS reading
 * @returns Promise<Coordinates> - User's latitude and longitude
 */
export const getCurrentPosition = (forceRefresh = false): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Options for geolocation request
    const options: PositionOptions = {
      enableHighAccuracy: true, // Request high accuracy
      timeout: forceRefresh ? 15000 : 10000, // Longer timeout for forced refresh
      maximumAge: forceRefresh ? 0 : 0 // Always force fresh position
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        resolve(coordinates);
      },
      (error: GeolocationPositionError) => {
        const geolocationError: GeolocationError = {
          code: error.code,
          message: error.message
        };
        reject(geolocationError);
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get readable address using Nominatim API
 * @param coordinates - Latitude and longitude
 * @returns Promise<LocationResult> - Formatted location string
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<LocationResult> => {
  const { latitude, longitude } = coordinates;
  
  // Construct Nominatim API URL
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  
  try {
    // Make API request with proper User-Agent header (required by Nominatim)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Corteo/1.0 (contact@corteo.app)' // Required by Nominatim API
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const data: NominatimResponse = await response.json();
    
    // Extract city information with fallback hierarchy
    const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 'Unknown';
    
    // Extract region/state information with fallback
    const region = data.address.state || 
                   data.address.county || 
                   'Unknown';
    
    // Format the final location string
    const formatted = `${city}, ${region}`;
    
    return {
      city,
      region,
      formatted,
      coordinates
    };
    
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    
    // Return fallback location on error
    return {
      city: 'Unknown',
      region: 'Unknown', 
      formatted: 'Unknown, Unknown',
      coordinates
    };
  }
};

/**
 * Complete geolocation workflow: get position and reverse geocode
 * @param forceRefresh - If true, forces fresh GPS reading
 * @returns Promise<LocationResult> - Complete location information
 */
export const getUserLocation = async (forceRefresh = false): Promise<LocationResult> => {
  try {
    // Step 1: Get user's current coordinates
    console.log(`📍 Getting user coordinates... (forceRefresh: ${forceRefresh})`);
    const coordinates = await getCurrentPosition(forceRefresh);
    console.log('✅ Fresh coordinates obtained:', coordinates);
    
    // Step 2: Reverse geocode coordinates to readable address
    console.log('🌍 Reverse geocoding coordinates...');
    const location = await reverseGeocode(coordinates);
    console.log('✅ Location resolved:', location.formatted);
    
    return location;
    
  } catch (error) {
    console.error('❌ Geolocation failed:', error);
    
    // Return fallback location on any error
    return {
      city: 'Unknown',
      region: 'Unknown',
      formatted: 'Unknown, Unknown',
      coordinates: { latitude: 0, longitude: 0 }
    };
  }
};

/**
 * Get user's location with caching to avoid repeated API calls
 * Caches result in localStorage for 1 hour
 */
export const getCachedUserLocation = async (): Promise<LocationResult> => {
  const CACHE_KEY = 'corteo_user_location_cache';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  
  try {
    // Check for cached location
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { location, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      // Use cached location if less than 1 hour old
      if (age < CACHE_DURATION) {
        console.log('📍 Using cached location:', location.formatted);
        return location;
      }
    }
    
    // Get fresh location
    const location = await getUserLocation();
    
    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      location,
      timestamp: Date.now()
    }));
    
    return location;
    
  } catch (error) {
    console.error('❌ Failed to get cached location:', error);
    return {
      city: 'Unknown',
      region: 'Unknown',
      formatted: 'Unknown, Unknown',
      coordinates: { latitude: 0, longitude: 0 }
    };
  }
};