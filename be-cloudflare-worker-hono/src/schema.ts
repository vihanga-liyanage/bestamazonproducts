import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// Define the "products" table
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  price: real('price'),
  image_url: text('image_url'),
  affiliate_url: text('affiliate_url'),
});

// Generate TypeScript types for the "products" table
export type Product = typeof products.$inferSelect; // Type for SELECT queries
export type NewProduct = typeof products.$inferInsert; // Type for INSERT queries