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
    // Date formatting functions - pretending today is June 25th
    const formatDate = (date: Date) => {
      const today = new Date(2024, 5, 25); // June 25th, 2024 (month is 0-indexed)
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }
      
      // Check if it's tomorrow
      if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      }
      
      // Check if it's within the next week
      if (diffDays > 0 && diffDays <= 7) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `Next ${dayNames[date.getDay()]}`;
      }
      
      // For dates over a week away
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"];
      return `on ${monthNames[date.getMonth()]} ${date.getDate()}`;
    };

    // Generate specific dates for testing
    const getSpecificDates = () => {
      const today = new Date(2024, 5, 25); // June 25th, 2024
      return [
        formatDate(today), // Today
        formatDate(new Date(2024, 5, 26)), // Tomorrow
        formatDate(new Date(2024, 5, 27)), // Next Thursday
        formatDate(new Date(2024, 5, 29)), // Next Saturday
        formatDate(new Date(2024, 6, 2)), // Over a week - July 2nd
        formatDate(new Date(2024, 6, 15)), // Over a week - July 15th
      ];
    };

    const getRandomTime = () => {
      const hours = Math.floor(Math.random() * 12) + 9; // 9 AM to 8 PM
      const minutes = Math.random() < 0.5 ? "00" : "30";
      const ampm = hours < 12 ? "AM" : "PM";
      const displayHour = hours > 12 ? hours - 12 : hours;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    // Seed with sample protests
    const specificDates = getSpecificDates();
    
    const sampleProtests: Omit<Protest, 'id'>[] = [
      {
        title: "Global Climate Strike",
        description: "Join thousands demanding immediate climate action",
        category: "Environment",
        location: "City Hall Plaza",
        address: "100 City Hall Plaza, Downtown",
        latitude: "40.7128",
        longitude: "-74.0060",
        date: specificDates[0], // Today
        time: getRandomTime(),
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
        date: specificDates[4], // Over a week - July 2nd
        time: getRandomTime(),
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
        date: specificDates[1], // Tomorrow
        time: getRandomTime(),
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
        date: specificDates[2], // Next Thursday
        time: getRandomTime(),
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
        date: specificDates[5], // Over a week - July 15th
        time: getRandomTime(),
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
        date: specificDates[3], // Next Saturday
        time: getRandomTime(),
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