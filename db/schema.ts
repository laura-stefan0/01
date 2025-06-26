import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  country_code: text("country_code").notNull().default("IT"),
  notifications: boolean("notifications").notNull().default(true),
  location: boolean("location").notNull().default(true),
  emails: boolean("emails").notNull().default(false),
  language: text("language").notNull().default("en"),
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
  country_code: text("country_code").notNull().default("IT"),
  attendees: integer("attendees").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Resources table for country-specific content
export const resources = pgTable("resources", {
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

// Type exports for compatibility
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Protest = typeof protests.$inferSelect;
export type InsertProtest = typeof protests.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
export type Law = typeof laws.$inferSelect;
export type InsertLaw = typeof laws.$inferInsert;