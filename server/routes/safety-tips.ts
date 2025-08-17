import express from 'express';
import { db } from '../../db/index';
import { safetyTips as safetyTipsTable } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all resources filtered by user's country
router.get('/', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching safety tips for country:', userCountryCode);

    const safetyTips = await db
      .select()
      .from(safetyTipsTable)
      .where(eq(safetyTipsTable.country_code, userCountryCode));

    console.log('✅ Successfully fetched safety tips for', userCountryCode + ':', safetyTips?.length || 0);
    res.json(safetyTips || []);
  } catch (error) {
    console.error("Failed to fetch safety tips:", error);
    res.status(500).json({ message: "Failed to fetch safety tips" });
  }
});

// Get resources by category (protesters/organizers) filtered by user's country
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching safety tips for category:', category, 'and country:', userCountryCode);

    const safetyTips = await db
      .select()
      .from(safetyTipsTable)
      .where(eq(safetyTipsTable.category, category));

    console.log('✅ Successfully fetched safety tips for category', category, 'in', userCountryCode + ':', safetyTips?.length || 0);
    res.json(safetyTips || []);
  } catch (error) {
    console.error("Failed to fetch safety tips by category:", error);
    res.status(500).json({ message: "Failed to fetch safety tips by category" });
  }
});

// Get resources by type filtered by user's country
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching safety tips for type:', type, 'and country:', userCountryCode);

    const safetyTips = await db
      .select()
      .from(safetyTipsTable)
      .where(eq(safetyTipsTable.type, type));

    console.log('✅ Successfully fetched safety tips for type', type, 'in', userCountryCode + ':', safetyTips?.length || 0);
    res.json(safetyTips || []);
  } catch (error) {
    console.error("Failed to fetch safety tips by type:", error);
    res.status(500).json({ message: "Failed to fetch safety tips by type" });
  }
});

export default router;