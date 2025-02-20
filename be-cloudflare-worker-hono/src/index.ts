import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { products } from './schema';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// Enable CORS
app.use('*', cors());

// Get all products
app.get('/products', async (c) => {
  const db = drizzle(c.env.DB); // Use the correct binding here
  const result = await db.select().from(products).all();
  return c.json(result);
});

// Add a new product
app.post('/products', async (c) => {
  const db = drizzle(c.env.DB); // Use the correct binding here
  const { title, description, price, image_url, affiliate_url } = await c.req.json();
  const result = await db.insert(products).values({
    title,
    description,
    price,
    image_url,
    affiliate_url,
  }).returning();
  return c.json(result);
});

export default app;