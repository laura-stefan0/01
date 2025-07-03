import { Router } from "express";
import { supabase } from "../../db/index.js";

const router = Router();

// Initialize tables on first request
let tablesInitialized = false;

async function initializeTables() {
  if (tablesInitialized) return;
  
  try {
    // For now, we'll handle the table creation manually in Supabase
    // The tables should exist: saved_protests and archived_protests
    console.log('📝 Tables should be created manually in Supabase if not existing');
    tablesInitialized = true;
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
  }
}

// Get saved protests for a user
router.get("/saved", async (req, res) => {
  try {
    await initializeTables();
    const userId = 1; // For now using default user ID
    
    // Get saved protest IDs
    const { data: savedData, error: savedError } = await supabase
      .from('saved_protests')
      .select('protest_id')
      .eq('user_id', userId);

    if (savedError) {
      console.error('❌ Error fetching saved protests:', savedError);
      return res.status(500).json({ error: "Failed to fetch saved protests" });
    }

    if (!savedData || savedData.length === 0) {
      return res.json([]);
    }

    // Get the actual protest data
    const protestIds = savedData.map(item => item.protest_id);
    const { data: protests, error: protestsError } = await supabase
      .from('protests')
      .select('*')
      .in('id', protestIds)
      .eq('approved', true);

    if (protestsError) {
      console.error('❌ Error fetching protest details:', protestsError);
      return res.status(500).json({ error: "Failed to fetch protest details" });
    }

    console.log(`✅ Successfully fetched ${protests?.length || 0} saved protests for user ${userId}`);
    res.json(protests || []);
  } catch (error) {
    console.error('❌ Error in /saved route:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save a protest
router.post("/save", async (req, res) => {
  try {
    const userId = 1; // For now using default user ID
    const { protestId } = req.body;

    if (!protestId) {
      return res.status(400).json({ error: "Protest ID is required" });
    }

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_protests')
      .select('id')
      .eq('user_id', userId)
      .eq('protest_id', protestId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Protest already saved" });
    }

    // Save the protest
    const { error } = await supabase
      .from('saved_protests')
      .insert({
        user_id: userId,
        protest_id: protestId
      });

    if (error) {
      console.error('❌ Error saving protest:', error);
      return res.status(500).json({ error: "Failed to save protest" });
    }

    console.log(`✅ Successfully saved protest ${protestId} for user ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /save route:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unsave a protest
router.delete("/save/:protestId", async (req, res) => {
  try {
    const userId = 1; // For now using default user ID
    const { protestId } = req.params;

    const { error } = await supabase
      .from('saved_protests')
      .delete()
      .eq('user_id', userId)
      .eq('protest_id', protestId);

    if (error) {
      console.error('❌ Error unsaving protest:', error);
      return res.status(500).json({ error: "Failed to unsave protest" });
    }

    console.log(`✅ Successfully unsaved protest ${protestId} for user ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /save delete route:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get archived protests (check-ins) for a user
router.get("/archived", async (req, res) => {
  try {
    const userId = 1; // For now using default user ID
    
    // Get archived protest data with details
    const { data: archivedData, error: archivedError } = await supabase
      .from('archived_protests')
      .select('protest_id, checked_in_at, notes')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (archivedError) {
      console.error('❌ Error fetching archived protests:', archivedError);
      return res.status(500).json({ error: "Failed to fetch archived protests" });
    }

    if (!archivedData || archivedData.length === 0) {
      return res.json([]);
    }

    // Get the actual protest data
    const protestIds = archivedData.map(item => item.protest_id);
    const { data: protests, error: protestsError } = await supabase
      .from('protests')
      .select('*')
      .in('id', protestIds);

    if (protestsError) {
      console.error('❌ Error fetching archived protest details:', protestsError);
      return res.status(500).json({ error: "Failed to fetch protest details" });
    }

    // Combine protest data with archive metadata
    const archivedProtests = protests?.map(protest => {
      const archiveInfo = archivedData.find(item => item.protest_id === protest.id);
      return {
        ...protest,
        checked_in_at: archiveInfo?.checked_in_at,
        notes: archiveInfo?.notes
      };
    }) || [];

    console.log(`✅ Successfully fetched ${archivedProtests.length} archived protests for user ${userId}`);
    res.json(archivedProtests);
  } catch (error) {
    console.error('❌ Error in /archived route:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check in to a protest (archive it)
router.post("/checkin", async (req, res) => {
  try {
    const userId = 1; // For now using default user ID
    const { protestId, notes } = req.body;

    if (!protestId) {
      return res.status(400).json({ error: "Protest ID is required" });
    }

    // Check if already checked in
    const { data: existing } = await supabase
      .from('archived_protests')
      .select('id')
      .eq('user_id', userId)
      .eq('protest_id', protestId)
      .single();

    if (existing) {
      return res.status(400).json({ error: "Already checked in to this protest" });
    }

    // Archive the protest
    const { error } = await supabase
      .from('archived_protests')
      .insert({
        user_id: userId,
        protest_id: protestId,
        notes: notes || null
      });

    if (error) {
      console.error('❌ Error checking in to protest:', error);
      return res.status(500).json({ error: "Failed to check in to protest" });
    }

    // Remove from saved protests if it was saved
    await supabase
      .from('saved_protests')
      .delete()
      .eq('user_id', userId)
      .eq('protest_id', protestId);

    console.log(`✅ Successfully checked in to protest ${protestId} for user ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /checkin route:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;