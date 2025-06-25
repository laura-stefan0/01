import express from 'express';
import { db } from '../../db/index';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get current user profile (for demo purposes, returns sample user)
router.get('/profile', async (req, res) => {
  try {
    // For demo purposes, we'll return a sample user
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

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Check if user already exists by username
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if user already exists by email
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        password_hash,
        name,
      })
      .returning();

    // Don't return password hash
    const { password_hash: _, ...userResponse } = newUser[0];
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Get user by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password hash
    const { password_hash, ...userResponse } = userResult[0];
    res.json(userResponse);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;