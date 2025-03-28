import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  paypalEmail: text("paypal_email"),
  createdAt: integer("created_at").notNull(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  asin: text("asin").notNull().unique(),
  title: text("title").notNull(),
  price: real("price").notNull(),
  image_url: text("image_url").notNull(),
  affiliate_url: text("affiliate_url").notNull(),
  customerReviews: real("customer_reviews").default(0.0),
  bestSellersRank: integer("best_sellers_rank").default(0),
  isReward: integer("is_reward").default(0).notNull(),
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
  paypalEmail: text("paypal_email").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const rewardComments = sqliteTable("reward_comments", {
  id: text("id").primaryKey(),
  rewardRequestId: integer("reward_request_id").notNull().references(() => rewardRequests.id),
  userId: text("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  createdAt: integer("created_at").notNull(),
});
