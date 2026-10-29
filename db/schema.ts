import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price").notNull().default(0),
  image: text("image").notNull(),
  category: text("category").notNull().default("عام"),
  description: text("description").notNull().default(""),
  badge: text("badge").notNull().default("מבצע"),
  featured: integer("featured").notNull().default(0),
  dealEnd: integer("deal_end"),
  active: integer("active").notNull().default(1),
  sort: integer("sort").notNull().default(0),
  updated: text("updated").notNull(),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  hash: text("hash").notNull(),
  salt: text("salt").notNull(),
});
export const sessions = sqliteTable("sessions", {
  token: text("token").primaryKey(),
  expires: integer("expires").notNull(),
});
export const attempts = sqliteTable("attempts", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expires: integer("expires").notNull(),
});
