import { Hono } from "hono";
import { connectDB } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

type Bindings = { DB: D1Database };
type Variables = { DB: ReturnType<typeof connectDB> };

const usersRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

usersRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Fetch all users
usersRoute.get("/", async (c) => {
  const db = c.get("DB");

  const results = await db.select().from(users);

  if (results.length === 0) {
    return c.json({ error: "No users found" }, 404);
  }

  return c.json(results);
});

// Fetch user details by ID
usersRoute.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const db = c.get("DB");

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (result.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(result[0]);
});

// Create a new user
usersRoute.post("/", async (c) => {
  const { id, name, email } = await c.req.json();
  const db = c.get("DB");

  if (!id || !name || !email) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (existingUser.length > 0) {
    return c.json({ error: "User already exists" }, 409);
  }

  // Insert new user
  await db.insert(users).values({ id, name, email });

  return c.json({ success: true });
});

// Update user details
usersRoute.put("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const { name, email } = await c.req.json();
  const db = c.get("DB");

  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (existingUser.length === 0) {
    return c.json({ error: "User not found" }, 404);
  }

  // Update user details
  await db
    .update(users)
    .set({
      name: name ?? existingUser[0].name,
      email: email ?? existingUser[0].email,
    })
    .where(eq(users.id, userId));

  return c.json({ success: true });
});

export default usersRoute;
