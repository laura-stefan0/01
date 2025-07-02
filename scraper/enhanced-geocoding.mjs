
import * as turf from '@turf/turf';
import axios from 'axios';

/**
 * Enhanced Geocoding Module with Geometry Support
 * Uses Nominatim API with polygon_geojson=1 to get street/area geometry
 * Implements caching and geometry-based coordinate calculation using Turf.js
 */

// Cache for storing geocoding results to reduce API calls
const geocodeCache = new Map();

// Fallback coordinates (Milan, Italy)
const FALLBACK_COORDINATES = { lat: 45.4642, lng: 9.1900 };

/**
 * Calculate centroid for polygon geometry using Turf.js
 * @param {Object} polygon - GeoJSON polygon geometry
 * @returns {Object} - Coordinates {lat, lng}
 */
function calculatePolygonCentroid(polygon) {
  try {
    const centroid = turf.centroid(polygon);
    return {
      lat: centroid.geometry.coordinates[1],
      lng: centroid.geometry.coordinates[0]
    };
  } catch (error) {
    console.log('❌ Error calculating polygon centroid:', error.message);
    return null;
  }
}

/**
 * Calculate midpoint for LineString geometry using Turf.js
 * @param {Object} lineString - GeoJSON LineString geometry
 * @returns {Object} - Coordinates {lat, lng}
 */
function calculateLineStringMidpoint(lineString) {
  try {
    const line = turf.lineString(lineString.coordinates);
    const length = turf.length(line);
    const midpoint = turf.along(line, length / 2);
    
    return {
      lat: midpoint.geometry.coordinates[1],
      lng: midpoint.geometry.coordinates[0]
    };
  } catch (error) {
    console.log('❌ Error calculating LineString midpoint:', error.message);
    return null;
  }
}

/**
 * Process geometry data from Nominatim response
 * @param {Object} geojson - GeoJSON geometry from Nominatim
 * @returns {Object|null} - Calculated coordinates or null
 */
function processGeometry(geojson) {
  if (!geojson || !geojson.type || !geojson.coordinates) {
    return null;
  }

  console.log(`🗺️ Processing ${geojson.type} geometry`);

  switch (geojson.type) {
    case 'Polygon':
    case 'MultiPolygon':
      return calculatePolygonCentroid(geojson);
    
    case 'LineString':
    case 'MultiLineString':
      return calculateLineStringMidpoint(geojson);
    
    case 'Point':
      return {
        lat: geojson.coordinates[1],
        lng: geojson.coordinates[0]
      };
    
    default:
      console.log(`⚠️ Unsupported geometry type: ${geojson.type}`);
      return null;
  }
}

/**
 * Enhanced geocoding function with geometry support and caching
 * @param {string} address - Street address to geocode
 * @param {string} city - City name for context
 * @returns {Promise<Object|null>} - Coordinates {lat, lng} or null
 */
export async function geocodeAddress(address, city) {
  // Create cache key
  const cacheKey = `${address}, ${city}`.toLowerCase().trim();
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    console.log(`🎯 Using cached geocoding result for: "${cacheKey}"`);
    return geocodeCache.get(cacheKey);
  }

  // Construct full address for query
  const fullAddress = address ? `${address}, ${city}, Italy` : `${city}, Italy`;
  
  console.log(`🌍 Geocoding with geometry: "${fullAddress}"`);

  try {
    // Make request to Nominatim with polygon_geojson=1 for geometry data
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: fullAddress,
        format: 'json',
        limit: 1,
        addressdetails: 1,
        polygon_geojson: 1, // Request geometry data
        countrycodes: 'it'  // Limit to Italy
      },
      headers: {
        'User-Agent': 'Enhanced-Italian-Scraper/1.0 (contact@corteo.app)'
      },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      let coordinates = null;

      // Try to use geometry for more accurate positioning
      if (result.geojson) {
        coordinates = processGeometry(result.geojson);
        
        if (coordinates) {
          console.log(`✨ Using geometry-based coordinates: ${coordinates.lat}, ${coordinates.lng}`);
        }
      }

      // Fallback to basic lat/lon if geometry processing failed
      if (!coordinates) {
        coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        console.log(`📍 Using basic coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      }

      // Cache the successful result
      geocodeCache.set(cacheKey, coordinates);
      
      console.log(`✅ Geocoded "${fullAddress}" successfully`);
      return coordinates;
      
    } else {
      console.log(`⚠️ No geocoding results for: "${fullAddress}"`);
      
      // Cache null result to avoid repeated failed requests
      geocodeCache.set(cacheKey, null);
      return null;
    }

  } catch (error) {
    console.log(`❌ Geocoding failed for "${fullAddress}":`, error.message);
    
    // Cache null result for failed requests
    geocodeCache.set(cacheKey, null);
    
    // Return fallback coordinates on error
    console.log(`🔄 Returning fallback coordinates (Milan)`);
    return FALLBACK_COORDINATES;
  }
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
  console.log('🧹 Geocoding cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export function getCacheStats() {
  return {
    size: geocodeCache.size,
    keys: Array.from(geocodeCache.keys())
  };
}

/**
 * Example usage demonstrating the enhanced geocoding function
 */
export async function exampleUsage() {
  console.log('🚀 Enhanced Geocoding Example Usage\n');

  // Example 1: Specific street address
  console.log('Example 1: Specific street address');
  const coords1 = await geocodeAddress('Via del Corso 123', 'Roma');
  console.log('Result:', coords1);
  console.log('');

  // Example 2: Piazza (should return polygon centroid)
  console.log('Example 2: Piazza (polygon geometry)');
  const coords2 = await geocodeAddress('Piazza San Marco', 'Venezia');
  console.log('Result:', coords2);
  console.log('');

  // Example 3: Via (should return LineString midpoint)
  console.log('Example 3: Via (LineString geometry)');
  const coords3 = await geocodeAddress('Via Dante', 'Milano');
  console.log('Result:', coords3);
  console.log('');

  // Example 4: City only (fallback)
  console.log('Example 4: City only');
  const coords4 = await geocodeAddress(null, 'Firenze');
  console.log('Result:', coords4);
  console.log('');

  // Example 5: Invalid address (should return fallback)
  console.log('Example 5: Invalid address');
  const coords5 = await geocodeAddress('Non-existent street', 'Non-existent city');
  console.log('Result:', coords5);
  console.log('');

  // Show cache statistics
  console.log('Cache Statistics:', getCacheStats());
}

// Export fallback coordinates for use in other modules
export { FALLBACK_COORDINATES };
