import { protests, users, type User, type InsertUser, type Protest, type InsertProtest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllProtests(): Promise<Protest[]>;
  getFeaturedProtests(): Promise<Protest[]>;
  getNearbyProtests(): Promise<Protest[]>;
  getProtestsByCategory(category: string): Promise<Protest[]>;
  searchProtests(query: string): Promise<Protest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private protests: Map<number, Protest>;
  private currentUserId: number;
  private currentProtestId: number;

  constructor() {
    this.users = new Map();
    this.protests = new Map();
    this.currentUserId = 1;
    this.currentProtestId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed with sample protests
    const sampleProtests: Omit<Protest, 'id'>[] = [
      {
        title: "Global Climate Strike",
        description: "Join thousands demanding immediate climate action",
        category: "Environment",
        location: "City Hall Plaza",
        address: "100 City Hall Plaza, Downtown",
        latitude: "40.7128",
        longitude: "-74.0060",
        date: "Today",
        time: "2:00 PM",
        attendees: 1250,
        distance: "0.8 mi",
        imageUrl: "https://images.unsplash.com/photo-1573152958734-1922c188fba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: true,
      },
      {
        title: "Pride Rights March",
        description: "Celebrating equality and fighting discrimination",
        category: "LGBTQ+",
        location: "Main Street",
        address: "Main Street & 1st Ave",
        latitude: "40.7589",
        longitude: "-73.9851",
        date: "Tomorrow",
        time: "11:00 AM",
        attendees: 892,
        distance: "1.2 mi",
        imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: true,
      },
      {
        title: "Fair Wage Strike",
        description: "Workers demanding fair compensation and benefits",
        category: "Labor",
        location: "Downtown Square",
        address: "Downtown Square, Business District",
        latitude: "40.7505",
        longitude: "-73.9934",
        date: "Today",
        time: "3:00 PM - 6:00 PM",
        attendees: 247,
        distance: "0.5 mi",
        imageUrl: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: false,
      },
      {
        title: "Justice for All Rally",
        description: "Standing up for social justice and equality",
        category: "Justice",
        location: "Central Park",
        address: "Central Park South Entrance",
        latitude: "40.7829",
        longitude: "-73.9654",
        date: "Tomorrow",
        time: "1:00 PM",
        attendees: 156,
        distance: "1.1 mi",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: false,
      },
      {
        title: "Tree Planting Action",
        description: "Environmental action through community tree planting",
        category: "Environment",
        location: "Riverside Park",
        address: "Riverside Park, West Side",
        latitude: "40.8021",
        longitude: "-73.9708",
        date: "Saturday",
        time: "9:00 AM",
        attendees: 89,
        distance: "2.1 mi",
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: false,
      },
      {
        title: "Education Reform March",
        description: "Students and educators demanding education reform",
        category: "Education",
        location: "University Campus",
        address: "University Campus, Academic Quad",
        latitude: "40.8075",
        longitude: "-73.9626",
        date: "Friday",
        time: "4:00 PM",
        attendees: 312,
        distance: "0.9 mi",
        imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200",
        featured: false,
      },
    ];

    sampleProtests.forEach((protest) => {
      const id = this.currentProtestId++;
      this.protests.set(id, { ...protest, id });
    });

    // Seed with sample user
    const sampleUser: Omit<User, 'id'> = {
      username: "alex_rodriguez",
      password: "password123",
      email: "alex@example.com",
      name: "Alex Rodriguez",
      notifications: true,
      location: true,
      emails: false,
      language: "en",
    };
    
    const userId = this.currentUserId++;
    this.users.set(userId, { ...sampleUser, id: userId });
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
      ...insertUser, 
      id,
      notifications: true,
      location: true,
      emails: false,
      language: "en",
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

export const storage = new MemStorage();
