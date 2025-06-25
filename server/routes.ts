import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { supabase, supabaseAdmin } from "../db/index";

export async function registerRoutes(app: Express): Promise<Server> {
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

  

  // User sign-in endpoint - simplified for demo
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log("Demo sign-in for email:", email);

      // For demo purposes, create a user session with any valid email/password
      const userData = {
        id: `demo-user-${email.split('@')[0]}`,
        email,
        username: email.split('@')[0],
        name: email.split('@')[0]
      };

      console.log("Demo user authenticated:", userData.id);

      res.json({
        message: "Sign-in successful",
        user: userData,
        session: { access_token: "demo-token", user: userData }
      });

    } catch (error) {
      console.error("Failed to sign in user:", error);
      res.status(500).json({ 
        message: "Failed to sign in", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user profile endpoint
  app.get("/api/users/profile", async (req, res) => {
    try {
      // For demo purposes, return a sample user
      // In a real app, this would be based on session/auth
      const sampleUser = {
        id: 1,
        username: "alex_rodriguez",
        email: "alex@example.com",
        name: "Alex Rodriguez",
        notifications: true,
        location: true,
        emails: false,
        language: "en",
      };

      res.json(sampleUser);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}