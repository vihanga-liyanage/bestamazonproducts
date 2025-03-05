import { Hono } from "hono";
import { connectDB } from "../db/db";
import { rewardRequests } from "../db/schema";
import { eq, and } from "drizzle-orm";

type Bindings = { DB: D1Database };
type Variables = { DB: ReturnType<typeof connectDB> };

const rewardRequestsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

rewardRequestsRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Fetch all reward requests for a user
rewardRequestsRoute.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const db = c.get("DB");

  const results = await db.select().from(rewardRequests).where(eq(rewardRequests.userId, userId));

  if (results.length === 0) {
    return c.json({ error: "No reward requests found for this user" }, 404);
  }

  return c.json(results);
});

// Create a new reward request (Check for existing requests)
rewardRequestsRoute.post("/", async (c) => {
  const { userId, productId, orderScreenshot } = await c.req.json();
  const db = c.get("DB");

  if (!userId || !productId || !orderScreenshot) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if a request already exists for this user and product
  const existingRequest = await db
    .select()
    .from(rewardRequests)
    .where(and(eq(rewardRequests.userId, userId), eq(rewardRequests.productId, productId)))
    .limit(1);

  if (existingRequest.length > 0) {
    return c.json({ error: "A reward request already exists for this product and user" }, 409);
  }

  // Insert new reward request
  await db.insert(rewardRequests).values({
    userId,
    productId,
    orderScreenshot,
  });

  return c.json({ success: true });
});

// Update an existing reward request
rewardRequestsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const { status, reviewScreenshot, reviewLink, proofOfPayment, comments } = await c.req.json();
  const db = c.get("DB");

  // Check if the reward request exists
  const existingRequest = await db.select().from(rewardRequests).where(eq(rewardRequests.id, id)).limit(1);
  
  if (existingRequest.length === 0) {
    return c.json({ error: "Reward request not found" }, 404);
  }

  // Update the reward request
  await db
    .update(rewardRequests)
    .set({
      status: status ?? existingRequest[0].status,
      reviewScreenshot: reviewScreenshot ?? existingRequest[0].reviewScreenshot,
      reviewLink: reviewLink ?? existingRequest[0].reviewLink,
      proofOfPayment: proofOfPayment ?? existingRequest[0].proofOfPayment,
      comments: comments ?? existingRequest[0].comments,
    })
    .where(eq(rewardRequests.id, id));

  return c.json({ success: true });
});

export default rewardRequestsRoute;
