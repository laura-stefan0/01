import express from 'express';
import { supabase, supabaseAdmin } from '../../db/index';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get current user profile (for demo purposes, returns sample user)
router.get('/profile', async (req, res) => {
  try {
    // For demo purposes, we'll return a sample user
    // In a real app, this would be based on session/auth
    const sampleUser = {
      id: 1,
      username: "janedoe",
      email: "jane@example.com",
      name: "Jane",
      avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face",
      country_code: "US", // User's selected country
      notifications: true,
      location: true,
      emails: false,
      language: "en",
      theme: "system",
      background: "white",
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    console.log('🔄 Creating user in users table with data:', { username, email });

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
      notifications: true,
      location: true,
      emails: false,
      language: 'en'
    };

    console.log('📤 Inserting to Supabase:', { ...insertData, password_hash: '[REDACTED]' });
    console.log('🔑 Using admin client with service key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

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

      // Provide specific guidance based on error type
      if (insertError.code === '42501') {
        console.error('🚨 PERMISSION DENIED: This usually means the service role key is missing or incorrect');
        console.error('   Check that SUPABASE_SERVICE_ROLE_KEY is set in Replit secrets');
      } else if (insertError.code === '23505') {
        console.error('🚨 DUPLICATE KEY: User with this username or email already exists');
      }

      return res.status(500).json({ 
        message: "Failed to create user", 
        error: insertError.message,
        code: insertError.code
      });
    }

    console.log('✅ User created successfully in Supabase:', newUser.id);

    // Verify the user was actually inserted
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', newUser.id)
      .single();

    if (verifyError) {
      console.error('⚠️  Could not verify user creation:', verifyError.message);
    } else {
      console.log('✅ User verified in database:', verifyUser);
    }

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

// Update user theme settings
router.patch('/:id/theme', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { theme, background, custom_background_url } = req.body;

    console.log(`🎨 Updating theme for user ${id}:`, { theme, background, custom_background_url });

    const updateData: any = {
      theme: theme || 'system',
      background: background || 'white'
    };

    // Only update custom_background_url if it's provided
    if (custom_background_url !== undefined) {
      updateData.custom_background_url = custom_background_url;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error updating theme:', error);
      return res.status(500).json({ message: 'Failed to update theme settings' });
    }

    console.log('✅ Theme updated successfully:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ Error updating theme:', error);
    res.status(500).json({ message: 'Failed to update theme settings' });
  }
});

export default router;