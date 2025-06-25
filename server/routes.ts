import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerUserRoutes } from "./routes/users";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register user routes
  registerUserRoutes(app);
  // Get all protests
  app.get("/api/protests", async (req, res) => {
    try {
      const protests = await storage.getAllProtests();
      res.json(protests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protests" });
    }
  });

  // Get featured protests
  app.get("/api/protests/featured", async (req, res) => {
    try {
      const protests = await storage.getFeaturedProtests();
      res.json(protests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured protests" });
    }
  });

  // Get nearby protests
  app.get("/api/protests/nearby", async (req, res) => {
    try {
      const protests = await storage.getNearbyProtests();
      res.json(protests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nearby protests" });
    }
  });

  // Get protests by category
  app.get("/api/protests/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const protests = await storage.getProtestsByCategory(category);
      res.json(protests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protests by category" });
    }
  });

  // Get single protest by ID
  app.get("/api/protests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const protestId = parseInt(id);
      if (isNaN(protestId)) {
        return res.status(400).json({ message: "Invalid protest ID" });
      }
      const protest = await storage.getProtestById(protestId);
      if (!protest) {
        return res.status(404).json({ message: "Protest not found" });
      }
      res.json(protest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch protest" });
    }
  });



  // Search protests
  app.get("/api/protests/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const protests = await storage.searchProtests(q);
      res.json(protests);
    } catch (error) {
      res.status(500).json({ message: "Failed to search protests" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
