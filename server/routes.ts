` tags.

```text
The code has been modified to include necessary imports for Supabase and bcrypt, ensuring compatibility with the intended functionalities.
```

```
<replit_final_file>
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

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

  // User registration endpoint
  app.post("/api/users", async (req, res) => {
    try {
      console.log("Raw request body:", req.body);
      console.log("Request headers:", req.headers);

      const { username, email, password } = req.body;

      console.log("Registration request received:", { username, email, password: password ? "[REDACTED]" : "undefined" });

      if (!username || !email || !password) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists by username
      const existingUserByUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUserByUsername.length > 0) {
        console.log("Username already exists:", username);
        return res.status(409).json({ message: "Username already exists" });
      }

      // Check if user already exists by email
      const existingUserByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUserByEmail.length > 0) {
        console.log("Email already exists:", email);
        return res.status(409).json({ message: "Email already exists" });
      }

      // Hash the password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      console.log("Password hashed successfully");

      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          username,
          email,
          password_hash,
        })
        .returning();

      console.log("User created successfully:", newUser[0].id);

      // Don't return password hash in response
      const { password_hash: _, ...userResponse } = newUser[0];
      res.status(201).json({ 
        message: 'User created successfully', 
        user: userResponse 
      });
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ 
        message: "Failed to create user", 
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