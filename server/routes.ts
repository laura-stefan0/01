import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { supabase, supabaseAdmin } from "../db/index";
import users from "./routes/users";
import protests from "./routes/protests";
import upload from "./routes/upload";
import safetyTips from "./routes/safety-tips";
import laws from "./routes/laws";
import whatsNew from "./routes/whats-new";
import imageUpdater from "./routes/image-updater";

// Protests data (using local data for now as fallback)
const protestsData = [
  {
    id: 1,
    title: "Global Climate Strike",
    description: "Join millions worldwide in demanding action on climate change. Bring signs, bring friends, bring hope for our planet's future.",
    category: "Environment",
    location: "Madrid, Spain",
    address: "Puerta del Sol, 28013 Madrid",
    latitude: "40.4168",
    longitude: "-3.7038",
    date: "2024-04-22",
    time: "14:00",
    attendees: 15420,
    distance: "2.3 km",
    imageUrl: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=500&h=300&fit=crop",
    featured: true
  },
];

export function registerRoutes(app: Express) {
  // Users routes - only interact with users table
  app.use("/api/users", users);

  // Protests routes - only interact with protests table
  app.use("/api/protests", protests);

  // Safety Tips routes - country-filtered content
  app.use("/api/safety-tips", safetyTips);

  // Laws routes - country-filtered legal information
  app.use("/api/laws", laws);

  // What's New routes - country-filtered news and updates
  app.use("/api/whats-new", whatsNew);

  // Upload routes - handle file uploads
  app.use("/api/upload", upload);

  // Image updater routes - fetch and update protest images
  app.use("/api/images", imageUpdater);

  // User profile route (demo)
  app.get("/api/user/profile", (req, res) => {
    const countryCode = (req.query.country as string) || "IT";
    res.json({
      id: 1,
      username: "janedoe",
      email: "jane@example.com",
      name: "Jane",
      country_code: countryCode,
      notifications: true,
      location: true,
      emails: false,
      language: "en",
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}