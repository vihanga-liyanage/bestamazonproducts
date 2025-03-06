import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import rewardRequests from './routes/rewardRequests';
import users from './routes/users';
import products from './routes/products';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database; // Cloudflare D1 Database type
};

type Variables = {
  DB: ReturnType<typeof drizzle>; // Store Drizzle instance in context
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Enable CORS
app.use('*', cors());

// Middleware: Attach database instance
app.use('*', async (c, next) => {
  c.set('DB', drizzle(c.env.DB));
  await next();
});

// Mount routes
app.route('/reward-requests', rewardRequests);
app.route('/users', users);
app.route('/products', products);

export default app;
