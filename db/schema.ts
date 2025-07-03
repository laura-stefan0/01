import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  avatar_url: text("avatar_url"),
  country_code: text("country_code").notNull().default("IT"),
  notifications: boolean("notifications").notNull().default(true),
  location: boolean("location").notNull().default(true),
  emails: boolean("emails").notNull().default(false),
  language: text("language").notNull().default("en"),
  theme: text("theme").notNull().default("system"),
  background: text("background").notNull().default("white"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Protests table schema matching Supabase structure
export const protests = pgTable("protests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  image_url: text("image_url"),
  event_type: text("event_type").notNull().default("Protest"), // Protest, Workshop, Assembly, Talk, Other
  country_code: text("country_code").notNull().default("IT"),
  attendees: integer("attendees").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  approved: boolean("approved").notNull().default(false), // New submissions require approval
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Safety Tips table for country-specific content
export const safetyTips = pgTable("safety-tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // "protesters" or "organizers"
  type: text("type").notNull(), // "rights", "safety", "digital_security", "glossary", "organizing", "printables"
  country_code: text("country_code").notNull().default("IT"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Laws table for country-specific legal information
export const laws = pgTable("laws", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "protest_rights", "assembly", "free_speech", etc.
  content: text("content").notNull(),
  country_code: text("country_code").notNull().default("IT"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// What's New table for news and updates
export const whatsNew = pgTable("whats_new", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content"),
  image_url: text("image_url"),
  cta_text: text("cta_text"),
  cta_url: text("cta_url"),
  country_code: text("country_code").notNull().default("IT"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Type exports for compatibility
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Protest = typeof protests.$inferSelect;
export type InsertProtest = typeof protests.$inferInsert;
export type SafetyTip = typeof safetyTips.$inferSelect;
export type InsertSafetyTip = typeof safetyTips.$inferInsert;
export type Law = typeof laws.$inferSelect;
export type InsertLaw = typeof laws.$inferInsert;
export type WhatsNew = typeof whatsNew.$inferSelect;
export type InsertWhatsNew = typeof whatsNew.$inferInsert;