import { Router } from "express";
import { supabase } from "../../db/index.js";

const router = Router();

// Get all what's new items for a specific country
router.get("/", async (req, res) => {
  try {
    const country = req.query.country || "IT";
    
    console.log(`🔍 Fetching what's new items for country: ${country}`);
    
    const { data, error } = await supabase
      .from("whats-new")
      .select("*")
      .eq("country_code", country)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("❌ Error fetching what's new items:", error);
      throw error;
    }
    
    console.log(`✅ Successfully fetched ${data?.length || 0} what's new items for ${country}`);
    res.json(data || []);
  } catch (error) {
    console.error("❌ Error in what's new route:", error);
    res.status(500).json({ error: "Failed to fetch what's new items" });
  }
});

export default router;