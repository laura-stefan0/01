import express from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      bio: users.bio,
      avatar_url: users.avatar_url,
      location: users.location,
      is_verified: users.is_verified,
      can_create_events: users.can_create_events,
      created_at: users.created_at,
    }).from(users);
    res.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Add a user
router.post('/', async (req, res) => {
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
    res.status(201).json({ message: 'User added', user: userResponse });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Get current user profile (for demo purposes, returns sample user)
router.get('/profile', async (req, res) => {
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

// Get user by username
router.get('/:username', async (req, res) => {
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

export default router;