import express from 'express';
import { supabase } from '../../db/index';

const router = express.Router();

// Get all resources filtered by user's country
router.get('/', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching resources for country:', userCountryCode);

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching resources:', error);
      return res.status(500).json({ message: "Failed to fetch resources" });
    }

    console.log('✅ Successfully fetched resources for', userCountryCode + ':', resources?.length || 0);
    res.json(resources || []);
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// Get resources by category (protesters/organizers) filtered by user's country
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching resources for category:', category, 'and country:', userCountryCode);

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching resources by category:', error);
      return res.status(500).json({ message: "Failed to fetch resources by category" });
    }

    console.log('✅ Successfully fetched resources for category', category, 'in', userCountryCode + ':', resources?.length || 0);
    res.json(resources || []);
  } catch (error) {
    console.error("Failed to fetch resources by category:", error);
    res.status(500).json({ message: "Failed to fetch resources by category" });
  }
});

// Get resources by type filtered by user's country
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching resources for type:', type, 'and country:', userCountryCode);

    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('type', type)
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching resources by type:', error);
      return res.status(500).json({ message: "Failed to fetch resources by type" });
    }

    console.log('✅ Successfully fetched resources for type', type, 'in', userCountryCode + ':', resources?.length || 0);
    res.json(resources || []);
  } catch (error) {
    console.error("Failed to fetch resources by type:", error);
    res.status(500).json({ message: "Failed to fetch resources by type" });
  }
});

export default router;