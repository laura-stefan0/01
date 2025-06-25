import express from 'express';
import { supabaseService } from '../supabase-service';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await supabaseService.getAllUsers();
    res.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Add a user (duplicate of main registration endpoint, but keeping for API consistency)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Check if user already exists
    const existingUserByUsername = await supabaseService.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingUserByEmail = await supabaseService.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Create new user
    const newUser = await supabaseService.createUser({
      username,
      email,
      password,
      name
    });

    // Don't return password hash
    const { password_hash, ...userResponse } = newUser;
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

    const user = await supabaseService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password hash
    const { password_hash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;