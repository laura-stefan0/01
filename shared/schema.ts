import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  name: text("name"),
  notifications: boolean("notifications").notNull().default(true),
  location: boolean("location").notNull().default(true),
  emails: boolean("emails").notNull().default(false),
  language: text("language").notNull().default("en"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  role: text("role"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  is_verified: boolean("is_verified").default(false),
  can_create_events: boolean("can_create_events").default(false),
  joined_via: text("joined_via"),
  last_login: timestamp("last_login"),
  preferences: jsonb("preferences"),
});

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

export const insertProtestSchema = createInsertSchema(protests).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password_hash: true,
  name: true,
});

export type InsertProtest = z.infer<typeof insertProtestSchema>;
export type Protest = typeof protests.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;