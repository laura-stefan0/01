import express from 'express';
import { db } from '../../db/index';
import { protests as protestsTable } from '../../shared/schema';
import { eq, desc, or, ilike } from 'drizzle-orm';

const router = express.Router();

// Get all protests filtered by user's country
router.get('/', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching protests from protests table for country:', userCountryCode);

    const protests = await db
      .select()
      .from(protestsTable)
      .where(eq(protestsTable.country_code, userCountryCode));

    console.log('✅ Successfully fetched protests for', userCountryCode + ':', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch protests:", error);
    res.status(500).json({ message: "Failed to fetch protests" });
  }
});

// Get featured protests filtered by user's country
router.get('/featured', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching featured protests from protests table for country:', userCountryCode);

    const protests = await db
      .select()
      .from(protestsTable)
      .where(eq(protestsTable.featured, true));

    console.log('✅ Successfully fetched featured protests for', userCountryCode + ':', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch featured protests:", error);
    res.status(500).json({ message: "Failed to fetch featured protests" });
  }
});

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Get nearby protests filtered by user's country and sorted by distance
router.get('/nearby', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : null;

    console.log('🔍 Fetching nearby protests from protests table for country:', userCountryCode);
    if (userLat && userLng) {
      console.log('📍 User coordinates:', { lat: userLat, lng: userLng });
    }

    const protests = await db
      .select()
      .from(protestsTable)
      .where(eq(protestsTable.country_code, userCountryCode));

    let processedProtests = protests || [];

    // If user coordinates are provided, calculate distances and sort by proximity
    if (userLat && userLng && processedProtests.length > 0) {
      console.log('📊 Calculating distances for', processedProtests.length, 'protests');
      
      processedProtests = processedProtests
        .map((protest) => {
          if (protest.latitude && protest.longitude) {
            const distance = calculateDistance(
              userLat, 
              userLng, 
              parseFloat(protest.latitude), 
              parseFloat(protest.longitude)
            );
            return {
              ...protest,
              calculatedDistance: distance,
              distance: `${distance.toFixed(1)} km` // Update the display distance
            } as any;
          }
          return {
            ...protest,
            calculatedDistance: 999999 // Put protests without coordinates at the end
          } as any;
        })
        .sort((a, b) => (a.calculatedDistance || 999999) - (b.calculatedDistance || 999999))
        .slice(0, 10); // Limit to 10 closest protests

      console.log('✅ Sorted protests by distance. Closest:', 
        processedProtests[0]?.calculatedDistance?.toFixed(1) + ' km');
    } else {
      // If no coordinates, just limit the results
      processedProtests = processedProtests.slice(0, 10);
      console.log('ℹ️ No user coordinates provided, returning recent protests');
    }

    console.log('✅ Successfully fetched nearby protests for', userCountryCode + ':', processedProtests.length);
    res.json(processedProtests);
  } catch (error) {
    console.error("Failed to fetch nearby protests:", error);
    res.status(500).json({ message: "Failed to fetch nearby protests" });
  }
});

// Get protests by category filtered by user's country
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching protests for category:', category, 'and country:', userCountryCode);

    const protests = await db
      .select()
      .from(protestsTable)
      .where(eq(protestsTable.category, category));

    console.log('✅ Successfully fetched protests for category', category, 'in', userCountryCode + ':', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch protests by category:", error);
    res.status(500).json({ message: "Failed to fetch protests by category" });
  }
});

// Search protests filtered by user's country
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    console.log('🔍 Searching protests for query:', query, 'in country:', userCountryCode);

    const protests = await db
      .select()
      .from(protestsTable)
      .where(
        or(
          ilike(protestsTable.title, `%${query}%`),
          ilike(protestsTable.description, `%${query}%`),
          ilike(protestsTable.category, `%${query}%`),
          ilike(protestsTable.city, `%${query}%`)
        )
      )
;

    console.log('✅ Successfully searched protests for', query, 'in', userCountryCode + ':', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to search protests:", error);
    res.status(500).json({ message: "Failed to search protests" });
  }
});

// Get single protest by ID (no country filtering needed for individual protest)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching protest by ID from protests table:', id);

    const [protest] = await db
      .select()
      .from(protestsTable)
      .where(eq(protestsTable.id, parseInt(id)));

    if (!protest) {
      return res.status(404).json({ message: "Protest not found" });
    }

    console.log('✅ Successfully fetched protest:', protest.id);
    res.json(protest);
  } catch (error) {
    console.error("Failed to fetch protest:", error);
    res.status(500).json({ message: "Failed to fetch protest" });
  }
});

// Create new protest
router.post('/', async (req, res) => {
  try {
    const { title, description, category, event_type, location, address, latitude, longitude, date, time, image_url, url } = req.body;

    if (!title || !category || !event_type || !location || !latitude || !longitude || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔄 Creating protest in protests table:', { title, category, location, country: userCountryCode });

    const insertData = {
      title,
      description,
      category,
      event_type,
      city: location, // Map location to city column
      address: address || '', // Default to empty string if not provided
      latitude,
      longitude,
      date,
      time: time || '18:00', // Default to 6 PM if not provided
      image_url: image_url || null,
      country_code: userCountryCode,
      attendees: 0,
      featured: false
    };

    console.log('📤 Inserting protest to database protests table');

    const [newProtest] = await db
      .insert(protestsTable)
      .values(insertData)
      .returning();

    console.log('✅ Protest created successfully in protests table:', newProtest.id);
    res.status(201).json({ 
      message: 'Event submitted successfully', 
      protest: newProtest,
      note: 'Your event has been submitted and is pending approval. We will review it shortly.'
    });
  } catch (error) {
    console.error("Failed to create protest:", error);
    res.status(500).json({ message: "Failed to create protest" });
  }
});

export default router;