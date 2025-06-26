import express from 'express';
import { supabase } from '../../db/index';

const router = express.Router();

// Get all laws filtered by user's country
router.get('/', async (req, res) => {
  try {
    // For now, assume user country is IT (as requested)
    const userCountryCode = 'IT';
    
    console.log('🔍 Fetching laws for country:', userCountryCode);
    
    const { data: laws, error } = await supabase
      .from('laws')
      .select('*')
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching laws:', error);
      return res.status(500).json({ message: "Failed to fetch laws" });
    }

    console.log('✅ Successfully fetched laws for', userCountryCode + ':', laws?.length || 0);
    res.json(laws || []);
  } catch (error) {
    console.error("Failed to fetch laws:", error);
    res.status(500).json({ message: "Failed to fetch laws" });
  }
});

// Get laws by category filtered by user's country
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // For now, assume user country is IT (as requested)
    const userCountryCode = 'IT';
    
    console.log('🔍 Fetching laws for category:', category, 'and country:', userCountryCode);
    
    const { data: laws, error } = await supabase
      .from('laws')
      .select('*')
      .eq('category', category)
      .eq('country_code', userCountryCode)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching laws by category:', error);
      return res.status(500).json({ message: "Failed to fetch laws by category" });
    }

    console.log('✅ Successfully fetched laws for category', category, 'in', userCountryCode + ':', laws?.length || 0);
    res.json(laws || []);
  } catch (error) {
    console.error("Failed to fetch laws by category:", error);
    res.status(500).json({ message: "Failed to fetch laws by category" });
  }
});

// Get single law by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching law by ID from laws table:', id);

    const { data: law, error } = await supabase
      .from('laws')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching law:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: "Law not found" });
      }
      return res.status(500).json({ message: "Failed to fetch law" });
    }

    console.log('✅ Successfully fetched law:', law.id);
    res.json(law);
  } catch (error) {
    console.error("Failed to fetch law:", error);
    res.status(500).json({ message: "Failed to fetch law" });
  }
});

export default router;