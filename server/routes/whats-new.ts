import { Router } from "express";
import { supabase } from "../../db/index.js";

const router = Router();

// Get all what's new items - data from whats_new table with stored image URLs
router.get("/", async (req, res) => {
  try {
    const country = req.query.country || "IT";
    
    console.log(`🔍 Fetching what's new data from whats_new table for country: ${country}`);
    
    // Get card data from the whats_new database table (includes stored image_url)
    // First try with country_code, if that fails, get all items
    let { data: newsData, error: tableError } = await supabase
      .from("whats_new")
      .select("*")
      .eq("country_code", country)
      .order("created_at", { ascending: false });
    
    // If country_code column doesn't exist, try without it
    if (tableError && tableError.code === '42703') {
      console.log("⚠️ country_code column not found, fetching all items");
      const { data: allData, error: fallbackError } = await supabase
        .from("whats_new")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (fallbackError) {
        console.error("❌ Error fetching from whats_new table:", fallbackError);
        res.status(500).json({ error: "Failed to fetch what's new items from database" });
        return;
      }
      
      newsData = allData;
      tableError = null;
    } else if (tableError) {
      console.error("❌ Error fetching from whats_new table:", tableError);
      res.status(500).json({ error: "Failed to fetch what's new items from database" });
      return;
    }
    
    console.log(`✅ Successfully fetched ${newsData?.length || 0} what's new items from table`);
    
    // Log image URLs for debugging
    if (newsData) {
      newsData.forEach((item, index) => {
        console.log(`📰 Item ${index + 1}: "${item.title}" - Image URL: ${item.image_url || 'null'}`);
      });
    }
    
    // Return the news data with stored image URLs
    res.json(newsData || []);
    
  } catch (error) {
    console.error("❌ Error in what's new route:", error);
    res.status(500).json({ error: "Failed to fetch what's new items" });
  }
});

export default router;