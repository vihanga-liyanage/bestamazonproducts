import { Hono } from "hono";
import { connectDB } from "../db/db";
import { products } from "../db/schema";
import { eq } from "drizzle-orm";

type Bindings = { DB: D1Database };
type Variables = { DB: ReturnType<typeof connectDB> };

const productsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

productsRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Fetch all products
productsRoute.get("/", async (c) => {
  const db = c.get("DB");

  const results = await db.select().from(products);

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
  const { title, price, image_url, affiliate_url, customerReviews, bestSellersRank } = await c.req.json();
  const db = c.get("DB");

  if (!title || !price || !image_url || !affiliate_url) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if product already exists (based on title and affiliate_url)
  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.title, title))
    .limit(1);

  if (existingProduct.length > 0) {
    return c.json({ error: "Product already exists" }, 409);
  }

  // Insert new product
  const [newProduct] = await db
    .insert(products)
    .values({
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

export default productsRoute;
