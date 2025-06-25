import express from 'express';
import { supabase } from '../../db/index';
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

    console.log('🔄 Creating user with data:', { username, email, name });

    // Check if user already exists by username
    const { data: existingUserByUsername, error: usernameCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (usernameCheckError) {
      console.error('❌ Username check error:', usernameCheckError);
      return res.status(500).json({ message: "Failed to check username availability" });
    }

    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Check if user already exists by email
    const { data: existingUserByEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailCheckError) {
      console.error('❌ Email check error:', emailCheckError);
      return res.status(500).json({ message: "Failed to check email availability" });
    }

    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    console.log('🔒 Password hashed successfully');

    const insertData = {
      username,
      email,
      password_hash,
      name: name || null,
      notifications: true,
      location: true,
      emails: false,
      language: 'en'
    };

    console.log('📤 Inserting to Supabase:', { ...insertData, password_hash: '[REDACTED]' });

    // Create new user in Supabase
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Supabase insert error:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        hint: insertError.hint,
        details: insertError.details,
        code: insertError.code
      });
      return res.status(500).json({ 
        message: "Failed to create user", 
        error: insertError.message 
      });
    }

    console.log('✅ User created successfully in Supabase:', newUser.id);

    // Don't return password hash
    const { password_hash: _, ...userResponse } = newUser;
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ 
      message: "Failed to create user", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }

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