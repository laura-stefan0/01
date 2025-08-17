
import { db } from '../db/index';
import { users as usersTable } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface SupabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name?: string | null;
  notifications: boolean;
  location: boolean;
  emails: boolean;
  language: string;
  created_at?: Date | string | null;
}

export class SupabaseService {
  public db = db;
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
    
    console.log('📤 Inserting to database:', { ...insertData, password_hash: '[REDACTED]' });
    
    try {
      const [data] = await this.db
        .insert(usersTable)
        .values(insertData)
        .returning();

      console.log('✅ User created successfully in database:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Database insert error:', error);
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<SupabaseUser | null> {
    try {
      const [data] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username));

      return data || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    try {
      const [data] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      return data || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<SupabaseUser | null> {
    try {
      const [data] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id));

      return data || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<SupabaseUser[]> {
    try {
      const data = await this.db
        .select()
        .from(usersTable);

      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }
}

export const supabaseService = new SupabaseService();
