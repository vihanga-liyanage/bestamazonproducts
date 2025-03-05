import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  price: integer("price").notNull(),
  image_url: text("image_url").notNull(),
  affiliate_url: text("affiliate_url").notNull(),
  customerReviews: real("customer_reviews").default(0.0),
  bestSellersRank: integer("best_sellers_rank").default(0),
});

export const rewardRequests = sqliteTable("reward_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  status: text("status").notNull().default("Pending Verification"),
  orderScreenshot: text("order_screenshot").notNull(),
  reviewScreenshot: text("review_screenshot"),
  reviewLink: text("review_link"),
  proofOfPayment: text("proof_of_payment"),
  comments: text("comments"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});
