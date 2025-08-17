import { Router } from "express";
import { db } from "../../db/index";
import { whatsNew as whatsNewTable } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Get all what's new items - data from whats_new table with stored image URLs
router.get("/", async (req, res) => {
  try {
    const country = req.query.country || "IT";
    
    console.log(`🔍 Fetching what's new data from whats_new table for country: ${country}`);
    
    // Get card data from the whats_new database table (includes stored image_url)
    let newsData = await db
      .select()
      .from(whatsNewTable)
      .where(eq(whatsNewTable.country_code, country as string));
    
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