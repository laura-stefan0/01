import type { Protest, User } from "@shared/schema";

export class DatabaseStorage {
  private users = new Map<number, User>();

  constructor() {
    // Initialize with a single admin user for development
    this.users.set(1, {
      id: 1,
      username: "janedoe",
      email: "jane@example.com",
      name: "Jane Doe",
    });
  }

  // User methods
  getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  createUser(userData: Omit<User, "id">): User {
    const id = Math.max(...Array.from(this.users.keys()), 0) + 1;
    const user: User = { id, ...userData };
    this.users.set(id, user);
    return user;
  }

  // Protest methods - now empty since we use database
  getProtests(): Protest[] {
    return [];
  }

  getFeaturedProtests(): Protest[] {
    return [];
  }

  getNearbyProtests(): Protest[] {
    return [];
  }

  getProtest(id: number): Protest | undefined {
    return undefined;
  }

  createProtest(protestData: Omit<Protest, "id">): Protest {
    throw new Error("Use database for protest creation");
  }

  getProtestsByCategory(category: string): Protest[] {
    return [];
  }

  searchProtests(query: string): Protest[] {
    return [];
  }
}