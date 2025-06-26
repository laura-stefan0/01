
import express from 'express';
import { supabase, supabaseAdmin } from '../../db/index';

const router = express.Router();

// Get all protests (for now showing all until approval column is added)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching protests from protests table');
    
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching protests:', error);
      return res.status(500).json({ message: "Failed to fetch protests" });
    }

    console.log('✅ Successfully fetched protests:', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch protests:", error);
    res.status(500).json({ message: "Failed to fetch protests" });
  }
});

// Get featured protests
router.get('/featured', async (req, res) => {
  try {
    console.log('🔍 Fetching featured protests from protests table');
    
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching featured protests:', error);
      return res.status(500).json({ message: "Failed to fetch featured protests" });
    }

    console.log('✅ Successfully fetched featured protests:', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch featured protests:", error);
    res.status(500).json({ message: "Failed to fetch featured protests" });
  }
});

// Get nearby protests
router.get('/nearby', async (req, res) => {
  try {
    console.log('🔍 Fetching nearby protests from protests table');
    
    const { data: protests, error } = await supabase
      .from('protests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching nearby protests:', error);
      return res.status(500).json({ message: "Failed to fetch nearby protests" });
    }

    console.log('✅ Successfully fetched nearby protests:', protests?.length || 0);
    res.json(protests || []);
  } catch (error) {
    console.error("Failed to fetch nearby protests:", error);
    res.status(500).json({ message: "Failed to fetch nearby protests" });
  }
});

// Get single protest by ID
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
    const { title, description, category, location, address, latitude, longitude, date, time, image_url, approved } = req.body;

    if (!title || !description || !category || !location || !address || !latitude || !longitude || !date || !time) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    console.log('🔄 Creating protest in protests table:', { title, category, location });

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
      image_url: image_url || null,
      attendees: 0,
      featured: false
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
