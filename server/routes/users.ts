import type { Express } from "express";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export function registerUserRoutes(app: Express) {
  // Get current user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      // For demo purposes, we'll return a sample user
      // In a real app, this would be based on session/auth
      const sampleUser = {
        id: 1,
        username: "alex_rodriguez",
        password: "password123",
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

  // Create new user (registration)
  app.post("/api/user/register", async (req, res) => {
    try {
      const { username, email, password_hash, role } = req.body;
      
      if (!username || !email || !password_hash) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          username,
          email,
          password_hash,
          role: role || null,
          is_verified: false,
          can_create_events: false,
        })
        .returning();

      // Don't return password hash
      const { password_hash: _, ...userResponse } = newUser[0];
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    try {
      const { id, bio, avatar_url, location, preferences } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const updatedUser = await db
        .update(users)
        .set({
          bio,
          avatar_url,
          location,
          preferences,
          last_login: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (updatedUser.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password hash
      const { password_hash: _, ...userResponse } = updatedUser[0];
      res.json(userResponse);
    } catch (error) {
      console.error("Failed to update user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Get user by username
  app.get("/api/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      const user = await db
        .select({
          id: users.id,
          username: users.username,
          bio: users.bio,
          avatar_url: users.avatar_url,
          location: users.location,
          is_verified: users.is_verified,
          can_create_events: users.can_create_events,
          created_at: users.created_at,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user[0]);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}