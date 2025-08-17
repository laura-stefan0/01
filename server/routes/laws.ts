import express from 'express';
import { db } from '../../db/index';
import { laws as lawsTable } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all laws filtered by user's country
router.get('/', async (req, res) => {
  try {
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching laws for country:', userCountryCode);

    const laws = await db
      .select()
      .from(lawsTable)
      .where(eq(lawsTable.country_code, userCountryCode));

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
    // Get country code from query params or default to IT
    const userCountryCode = (req.query.country as string) || 'IT';

    console.log('🔍 Fetching laws for category:', category, 'and country:', userCountryCode);

    const laws = await db
      .select()
      .from(lawsTable)
      .where(eq(lawsTable.category, category));

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

    const [law] = await db
      .select()
      .from(lawsTable)
      .where(eq(lawsTable.id, parseInt(id)));

    if (!law) {
      return res.status(404).json({ message: "Law not found" });
    }

    console.log('✅ Successfully fetched law:', law.id);
    res.json(law);
  } catch (error) {
    console.error("Failed to fetch law:", error);
    res.status(500).json({ message: "Failed to fetch law" });
  }
});

export default router;