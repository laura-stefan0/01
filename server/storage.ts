import { protests, users, type User, type InsertUser, type Protest, type InsertProtest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllProtests(): Promise<Protest[]>;
  getFeaturedProtests(): Promise<Protest[]>;
  getNearbyProtests(): Promise<Protest[]>;
  getProtestById(id: number): Promise<Protest | undefined>;
  getProtestsByCategory(category: string): Promise<Protest[]>;
  searchProtests(query: string): Promise<Protest[]>;
}

class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private protests = new Map<number, Protest>();
  private currentUserId: number;
  private currentProtestId: number;

  constructor() {
    this.users = new Map();
    this.protests = new Map();
    this.currentUserId = 1;
    this.currentProtestId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username,
      email: insertUser.email,
      password_hash: insertUser.password_hash,
      name: insertUser.name || insertUser.username,
      notifications: true,
      location: true,
      emails: false,
      language: "en",
      created_at: new Date(),
      role: null,
      bio: null,
      avatar_url: null,
      is_verified: false,
      can_create_events: false,
      joined_via: null,
      last_login: null,
      preferences: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getAllProtests(): Promise<Protest[]> {
    return Array.from(this.protests.values());
  }

  async getFeaturedProtests(): Promise<Protest[]> {
    return Array.from(this.protests.values()).filter(protest => protest.featured);
  }

  async getNearbyProtests(): Promise<Protest[]> {
    return Array.from(this.protests.values()).filter(protest => !protest.featured);
  }

  async getProtestById(id: number): Promise<Protest | undefined> {
    return this.protests.get(id);
  }

  async getProtestsByCategory(category: string): Promise<Protest[]> {
    if (category === "all") {
      return this.getAllProtests();
    }
    return Array.from(this.protests.values()).filter(
      protest => protest.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchProtests(query: string): Promise<Protest[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.protests.values()).filter(
      protest =>
        protest.title.toLowerCase().includes(lowercaseQuery) ||
        protest.description.toLowerCase().includes(lowercaseQuery) ||
        protest.category.toLowerCase().includes(lowercaseQuery) ||
        protest.location.toLowerCase().includes(lowercaseQuery)
    );
  }
}

import { DatabaseStorage } from "./db-storage";

// Use in-memory storage for development since database tables don't exist yet
export const storage = new MemStorage();