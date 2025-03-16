import { Hono } from "hono";
import { connectDB } from "../db/db";
import { products } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { fetchAmazonProductDetails } from "../utils/fetchAmazonProductDetails";

type Bindings = {
  DB: D1Database;
  AMAZON_ACCESS_KEY: string;
  AMAZON_SECRET_KEY: string;
  AMAZON_ASSOCIATE_TAG: string;
};
type Variables = { DB: ReturnType<typeof connectDB> };

const productsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

productsRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Fetch all products with optional isReward filter
productsRoute.get("/", async (c) => {
  const db = c.get("DB");
  const isRewardParam = Number(c.req.query("isReward"));

  let query = db.select().from(products);

  const results = (isRewardParam !== null)
    ? await query.where(eq(products.isReward, isRewardParam))
    : await query;

  if (results.length === 0) {
    return c.json({ error: "No products found" }, 404);
  }

  return c.json(results);
});

// Fetch a single product by ID
productsRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = c.get("DB");

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (result.length === 0) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(result[0]);
});

// Create a new product
productsRoute.post("/", async (c) => {
  const { asin, title, price, image_url, affiliate_url, customerReviews, bestSellersRank } = await c.req.json();
  const db = c.get("DB");

  if (!asin || !title || !price || !image_url || !affiliate_url) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if ASIN already exists
  const existingProduct = await db.select().from(products).where(eq(products.asin, asin)).limit(1);

  if (existingProduct.length > 0) {
    return c.json({ error: "Product already exists" }, 409);
  }

  // Insert new product
  const [newProduct] = await db
    .insert(products)
    .values({
      asin,
      title,
      price,
      image_url,
      affiliate_url,
      customerReviews: customerReviews ?? 0,
      bestSellersRank: bestSellersRank ?? 0,
    })
    .returning();

  return c.json(newProduct);
});

// Update a product
productsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { title, price, image_url, affiliate_url, customerReviews, bestSellersRank } = await c.req.json();
  const db = c.get("DB");

  // Check if product exists
  const existingProduct = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (existingProduct.length === 0) {
    return c.json({ error: "Product not found" }, 404);
  }

  // Update product details
  await db
    .update(products)
    .set({
      title: title ?? existingProduct[0].title,
      price: price ?? existingProduct[0].price,
      image_url: image_url ?? existingProduct[0].image_url,
      affiliate_url: affiliate_url ?? existingProduct[0].affiliate_url,
      customerReviews: customerReviews ?? existingProduct[0].customerReviews,
      bestSellersRank: bestSellersRank ?? existingProduct[0].bestSellersRank,
    })
    .where(eq(products.id, id));

  return c.json({ success: true });
});

/**
 * Preview Add Reward Products
 */
productsRoute.post("/preview-add-reward-products", async (c) => {
  const db = c.get("DB");
  const env = c.env as Bindings;
  const { asins } = await c.req.json();

  if (!Array.isArray(asins) || asins.length === 0) {
    return c.json({ error: "Invalid ASIN list" }, 400);
  }

  const existingProducts = await db.select().from(products).where(inArray(products.asin, asins));

  const existingASINs = existingProducts.map((p) => p.asin);
  const missingASINs = asins.filter((asin: string) => !existingASINs.includes(asin));
  const newProducts = await fetchAmazonProductDetails(missingASINs, env);

  const productsToUpdate = existingProducts.filter((p) => asins.includes(p.asin) && p.isReward === 0);

  return c.json({ newProducts, productsToUpdate });
});

/**
 * Confirm Add Reward Products
 */
productsRoute.post("/update-add-reward-products", async (c) => {
  const db = c.get("DB");
  const env = c.env as Bindings;
  const { asins } = await c.req.json();

  if (!Array.isArray(asins) || asins.length === 0) {
    return c.json({ error: "Invalid ASIN list" }, 400);
  }

  // Check existing ASINs in the database
  const existingProducts = await db.select().from(products).where(inArray(products.asin, asins));

  const existingASINs = existingProducts.map((p) => p.asin);
  const newASINs = asins.filter((asin: string) => !existingASINs.includes(asin));

  // Fetch details only for new ASINs
  let newProducts = [];
  if (newASINs.length > 0) {
    newProducts = await fetchAmazonProductDetails(newASINs, env);
  }

  // Insert only missing ASINs
  if (newProducts.length > 0) {
    await db.insert(products).values(newProducts);
  }

  // Update `isReward = 1` for ASINs already in DB
  await db.update(products).set({ isReward: 1 }).where(inArray(products.asin, existingASINs));

  return c.json({ message: "Reward products updated successfully!" });
});

/**
 * Preview Remove Reward Products
 */
productsRoute.post("/preview-remove-reward-products", async (c) => {
  const db = c.get("DB");
  const { asins } = await c.req.json();

  const existingProducts = await db.select().from(products).where(inArray(products.asin, asins));

  const productsToRemove = existingProducts.filter((p) => p.isReward === 1);

  return c.json({ productsToRemove });
});

/**
 * Confirm Remove Reward Products
 */
productsRoute.post("/update-remove-reward-products", async (c) => {
  const db = c.get("DB");
  const { asins } = await c.req.json();

  await db.update(products).set({ isReward: 0 }).where(inArray(products.asin, asins));

  return c.json({ message: "Reward products removed successfully!" });
});

export default productsRoute;
