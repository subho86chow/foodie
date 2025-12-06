import { pgTable, serial, varchar, decimal, boolean, date, timestamp, integer, unique } from "drizzle-orm/pg-core";

export const userRoles = pgTable("user_roles", {
    clerkUserId: varchar("clerk_user_id", { length: 255 }).primaryKey(),
    role: varchar("role", { length: 20 }).notNull().default("customer"),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 15 }),
    createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    mealName: varchar("meal_name", { length: 100 }).notNull(),
    date: date("date").notNull(),
    status: varchar("status", { length: 20 }).default("confirmed"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const mealRequests = pgTable("meal_requests", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    mealName: varchar("meal_name", { length: 100 }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    date: date("date").notNull(),
    status: varchar("status", { length: 20 }).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});
