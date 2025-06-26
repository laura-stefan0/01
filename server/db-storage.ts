import { supabase } from "../db/index";
import type { User, InsertUser, Protest, InsertProtest } from "../shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Return demo user for development
      if (id === 1) {
        return {
          id: 1,
          username: "alex_rodriguez",
          email: "alex@example.com", 
          password_hash: "$2b$10$hashedpassword",
          name: "Alex Rodriguez",
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
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching user by id:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Return demo user for development
      if (username === "alex_rodriguez") {
        return {
          id: 1,
          username: "alex_rodriguez",
          email: "alex@example.com",
          password_hash: "$2b$10$hashedpassword", 
          name: "Alex Rodriguez",
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
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Since the database tables don't exist yet, create a mock user for now
      // This maintains the interface while allowing the app to function
      const mockUser: User = {
        id: Math.floor(Math.random() * 10000) + 1000,
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

      console.log("Created mock user for demo:", mockUser.username);
      return mockUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Protest methods remain the same for now since we're focusing on user schema
  async getAllProtests(): Promise<Protest[]> {
    return this.getSampleProtests();
  }

  async getFeaturedProtests(): Promise<Protest[]> {
    return this.getSampleProtests().filter(protest => protest.featured);
  }

  async getNearbyProtests(): Promise<Protest[]> {
    return this.getSampleProtests().filter(protest => !protest.featured);
  }

  async getProtestById(id: number): Promise<Protest | undefined> {
    return this.getSampleProtests().find(protest => protest.id === id);
  }

  async getProtestsByCategory(category: string): Promise<Protest[]> {
    if (category === "all") {
      return this.getAllProtests();
    }
    return this.getSampleProtests().filter(
      protest => protest.category.toLowerCase() === category.toLowerCase()
    );
  }

  async searchProtests(query: string): Promise<Protest[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.getSampleProtests().filter(
      protest =>
        protest.title.toLowerCase().includes(lowercaseQuery) ||
        protest.description.toLowerCase().includes(lowercaseQuery) ||
        protest.category.toLowerCase().includes(lowercaseQuery) ||
        protest.location.toLowerCase().includes(lowercaseQuery)
    );
  }

  private getSampleProtests(): Protest[] {
    // Date formatting functions - pretending today is June 25th
    const formatDate = (date: Date) => {
      const today = new Date(2024, 5, 25); // June 25th, 2024 (month is 0-indexed)
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      }

      if (diffDays > 0 && diffDays <= 7) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `Next ${dayNames[date.getDay()]}`;
      }

      const monthNames = ["January", "February", "March", "April", "May", "June", 
                         "July", "August", "September", "October", "November", "December"];
      const day = date.getDate();
      let dayStr = String(day);
      if (day === 1 || day === 21 || day === 31) {
          dayStr += "st";
      } else if (day === 2 || day === 22) {
          dayStr += "nd";
      } else if (day === 3 || day === 23) {
          dayStr += "rd";
      } else {
          dayStr += "th";
      }
      return `on ${monthNames[date.getMonth()]} ${dayStr}`;
    };

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

    const specificDates = getSpecificDates();

    return [
      {
        id: 1,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1573152958734-1922c188fba3.jpeg",
        featured: true,
      },
      {
        id: 2,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1559827260-dc66d52bef19.jpeg",
        featured: true,
      },
      {
        id: 3,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1569098644584-210bcd375b59.jpeg",
        featured: false,
      },
      {
        id: 4,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1571019613454-1cb2f99b2d8b.jpeg",
        featured: false,
      },
      {
        id: 5,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1542601906990-b4d3fb778b09.jpeg",
        featured: false,
      },
      {
        id: 6,
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
        imageUrl: "https://mfzlajgnahbhwswpqzkj.supabase.co/storage/v1/object/public/protest-images/photo-1544717297-fa95b6ee9643.jpeg",
        featured: false,
      },
    ];
  }
}