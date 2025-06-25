import { pgTable, uuid, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultSql("gen_random_uuid()"),
  username: text("username").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  password_hash: text("password_hash").notNull(),
  role: text("role").nullable(),
  bio: text("bio").nullable(),
  avatar_url: text("avatar_url").nullable(),
  location: text("location").nullable(),
  is_verified: boolean("is_verified").default(false),
  can_create_events: boolean("can_create_events").default(false),
  joined_via: text("joined_via").nullable(),
  last_login: timestamp("last_login").nullable(),
  preferences: jsonb("preferences").nullable(),
});