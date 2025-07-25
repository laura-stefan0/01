import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  name: text("name"),
  country_code: text("country_code").notNull().default("IT"),
  user_location: text("user_location").default("Milan, IT"),
  notifications: boolean("notifications").notNull().default(true),
  location: boolean("location").notNull().default(true),
  emails: boolean("emails").notNull().default(false),
  language: text("language").notNull().default("en"),
  theme: text("theme").notNull().default("system"),
  background: text("background").notNull().default("white"),
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
  city: text("city").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  attendees: integer("attendees").notNull().default(0),
  distance: text("distance").notNull().default(""),
  image_url: text("image_url"),
  event_type: text("event_type").notNull().default("Protest"), // Protest, Workshop, Assembly, Talk, Other
  country_code: text("country_code").notNull().default("IT"),
  featured: boolean("featured").notNull().default(false),
});

export const safetyTips = pgTable("safety-tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // "protesters" or "organizers"
  type: text("type").notNull(), // "rights", "safety", "digital_security", "glossary", "organizing", "printables"
  country_code: text("country_code").notNull().default("IT"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const laws = pgTable("laws", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "protest_rights", "assembly", "free_speech", etc.
  content: text("content").notNull(),
  country_code: text("country_code").notNull().default("IT"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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

export const insertProtestSchema = createInsertSchema(protests).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password_hash: true,
  name: true,
  country_code: true,
});

export const insertSafetyTipSchema = createInsertSchema(safetyTips).omit({
  id: true,
  created_at: true,
});

export const insertLawSchema = createInsertSchema(laws).omit({
  id: true,
  created_at: true,
});

export const insertWhatsNewSchema = createInsertSchema(whatsNew).omit({
  id: true,
  created_at: true,
});

export type InsertProtest = z.infer<typeof insertProtestSchema>;
export type Protest = typeof protests.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSafetyTip = z.infer<typeof insertSafetyTipSchema>;
export type SafetyTip = typeof safetyTips.$inferSelect;
export type InsertLaw = z.infer<typeof insertLawSchema>;
export type Law = typeof laws.$inferSelect;
export type InsertWhatsNew = z.infer<typeof insertWhatsNewSchema>;
export type WhatsNew = typeof whatsNew.$inferSelect;