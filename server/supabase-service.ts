
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
  // Create user in Supabase
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<SupabaseUser> {
    const { username, email, password, name } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash,
        name: name || null,
        notifications: true,
        location: true,
        emails: false,
        language: 'en'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

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
