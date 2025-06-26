import { Router } from "express";
import { supabase } from "../../db/index.js";

const router = Router();

// Get all what's new items - data from whats_new table, images from whats-new bucket
router.get("/", async (req, res) => {
  try {
    const country = req.query.country || "IT";
    
    console.log(`🔍 Fetching what's new data from whats_new table for country: ${country}`);
    
    // Get card data from the whats_new database table
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
    
    console.log(`✅ Successfully fetched ${newsData?.length || 0} what's new items from table for ${country}`);
    
    // If we have news data, try to get corresponding images from whats-new bucket
    if (newsData && newsData.length > 0) {
      console.log(`🔍 Fetching images from whats-new bucket for ${newsData.length} items`);
      
      // Get available images from the whats-new bucket
      const { data: bucketData, error: bucketError } = await supabase.storage
        .from('whats-new')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (!bucketError && bucketData) {
        console.log(`📸 Found ${bucketData.length} images in whats-new bucket:`, bucketData.map(img => img.name));
        
        // Add image URLs to news items where available
        const newsWithImages = newsData.map((newsItem, index) => {
          // Try to match by ID or use index-based assignment
          const matchingImage = bucketData[index % bucketData.length];
          let imageUrl = null;
          
          if (matchingImage) {
            const { data: urlData } = supabase.storage
              .from('whats-new')
              .getPublicUrl(matchingImage.name);
            imageUrl = urlData.publicUrl;
            console.log(`🖼️ Generated URL for ${matchingImage.name}: ${imageUrl}`);
          }
          
          return {
            ...newsItem,
            image_url: imageUrl
          };
        });
        
        console.log(`✅ Enhanced ${newsWithImages.length} news items with images from bucket`);
        res.json(newsWithImages);
      } else {
        console.log(`⚠️ Could not fetch images from bucket, returning news data without images`);
        res.json(newsData);
      }
    } else {
      console.log(`📭 No news data found in whats_new table for ${country}`);
      res.json([]);
    }
  } catch (error) {
    console.error("❌ Error in what's new route:", error);
    res.status(500).json({ error: "Failed to fetch what's new items" });
  }
});

export default router;