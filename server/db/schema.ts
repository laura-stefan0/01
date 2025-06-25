import { pgTable, uuid, text, timestamp, boolean, jsonb, serial, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default("gen_random_uuid()"),
  username: text("username").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  password_hash: text("password_hash").notNull(),
  role: text("role"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  location: text("location"),
  is_verified: boolean("is_verified").default(false),
  can_create_events: boolean("can_create_events").default(false),
  joined_via: text("joined_via"),
  last_login: timestamp("last_login"),
  preferences: jsonb("preferences"),
});

// Keep the protests table schema for compatibility with existing code
export const protests = pgTable("protests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  attendees: integer("attendees").notNull().default(0),
  distance: text("distance").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").notNull().default(false),
});

// Type exports for compatibility
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Protest = typeof protests.$inferSelect;
export type InsertProtest = typeof protests.$inferInsert;