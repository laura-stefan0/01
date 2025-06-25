
import { supabase } from '../db/index';
import bcrypt from 'bcrypt';

export interface SupabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name?: string;
  notifications: boolean;
  location: boolean;
  emails: boolean;
  language: string;
  created_at?: string;
}

export class SupabaseService {
  public supabase = supabase;
  // Create user in Supabase
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<SupabaseUser> {
    const { username, email, password, name } = userData;
    
    console.log('🔄 Creating user with data:', { username, email, name });
    
    // Hash password
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
    
    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('Error details:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log('✅ User created successfully in Supabase:', data.id);
    return data;
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  // Get user by ID
  async getUserById(id: number): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<SupabaseUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, name, notifications, location, emails, language, created_at');

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }
}

export const supabaseService = new SupabaseService();
