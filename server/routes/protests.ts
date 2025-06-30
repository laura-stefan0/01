import express from 'express';
import { supabase, supabaseAdmin } from '../../db/index';

const router = express.Router();

// Get all protests filtered by user's country
router.get('/', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching protests from protests table for country:', userCountryCode);

    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching protests:', error);
      return res.status(500).json({ message: "Failed to fetch protests" });
    }

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

    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('featured', true)
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching featured protests:', error);
      return res.status(500).json({ message: "Failed to fetch featured protests" });
    }

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

    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching nearby protests:', error);
      return res.status(500).json({ message: "Failed to fetch nearby protests" });
    }

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
            };
          }
          return {
            ...protest,
            calculatedDistance: 999999 // Put protests without coordinates at the end
          };
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

    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('category', category)
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching protests by category:', error);
      return res.status(500).json({ message: "Failed to fetch protests by category" });
    }

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

    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('country_code', userCountryCode)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error searching protests:', error);
      return res.status(500).json({ message: "Failed to search protests" });
    }

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

    const { data: protest, error } = await supabase
      .from('protests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching protest:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: "Protest not found" });
      }
      return res.status(500).json({ message: "Failed to fetch protest" });
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
    const { title, description, category, location, address, latitude, longitude, date, time, imageUrl, eventUrl } = req.body;

    if (!title || !description || !category || !location || !address || !latitude || !longitude || !date || !time) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔄 Creating protest in protests table:', { title, category, location, country: userCountryCode });

    const insertData = {
      title,
      description,
      category,
      location,
      address,
      latitude,
      longitude,
      date,
      time,
      image_url: imageUrl || `https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/teemu-paananen-rd5uNIUJCF0-unsplash.jpg`,
      country_code: userCountryCode,
      attendees: 0,
      distance: "0.5 mi",
      featured: false,
      event_url: eventUrl || null
    };

    console.log('📤 Inserting protest to Supabase protests table');

    const { data: newProtest, error } = await supabaseAdmin
      .from('protests')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase protest insert error:', error);
      return res.status(500).json({ 
        message: "Failed to create protest", 
        error: error.message 
      });
    }

    console.log('✅ Protest created successfully in protests table:', newProtest.id);
    res.status(201).json({ 
      message: 'Protest submitted successfully', 
      protest: newProtest,
      note: 'Your protest has been created and is now visible to users.'
    });
  } catch (error) {
    console.error("Failed to create protest:", error);
    res.status(500).json({ message: "Failed to create protest" });
  }
});

export default router;