import { Hono } from "hono";
import { connectDB } from "../db/db";
import { products, rewardComments, rewardRequests, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

type Bindings = { DB: D1Database; R2_BUCKET: R2Bucket; R2_BUCKET_URL: string; };
type Variables = { DB: ReturnType<typeof connectDB> };

const rewardRequestsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

rewardRequestsRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Helper function to upload an image to Cloudflare R2 and return the public URL
const uploadImageToR2 = async (bucket: R2Bucket, file: File | null, bucketBaseUrl: string): Promise<string | undefined> => {
  if (!file) {
    return undefined;
  }

  const imageId = uuidv4();
  const fileExtension = file.name.split(".").pop();
  const fileName = `${imageId}.${fileExtension}`;

  try {
    const result = await bucket.put(fileName, file.stream(), { httpMetadata: { contentType: file.type } });

    if (!result) {
      console.error("Upload failed: No result from put()");
      return undefined;
    }

    return `${bucketBaseUrl}${fileName}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return undefined;
  }
};

// Fetch all reward requests for a user with product details
rewardRequestsRoute.get("/", async (c) => {
  const db = c.get("DB");

  try {
    const results = await db
      .select({
        id: rewardRequests.id,
        userId: rewardRequests.userId,
        userName: users.name,
        status: rewardRequests.status,
        orderScreenshot: rewardRequests.orderScreenshot,
        reviewScreenshot: rewardRequests.reviewScreenshot,
        reviewLink: rewardRequests.reviewLink,
        proofOfPayment: rewardRequests.proofOfPayment,
        comments: rewardRequests.comments,
        createdAt: rewardRequests.createdAt,
        updatedAt: rewardRequests.updatedAt,
        product: {
          id: products.id,
          title: products.title,
          price: products.price,
          image_url: products.image_url,
          affiliate_url: products.affiliate_url,
        },
      })
      .from(rewardRequests)
      .innerJoin(products, eq(rewardRequests.productId, products.id))
      .innerJoin(users, eq(rewardRequests.userId, users.id))

    if (results.length === 0) {
      return c.json({ error: "No reward requests found for this user" }, 404);
    }

    return c.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    return c.json({ error: "Failed to fetch reward requests" }, 500);
  }
});

// Fetch all reward requests for a user with product details
rewardRequestsRoute.get("/", async (c) => {
  const userId = c.req.query("userId");
  const db = c.get("DB");

  if (!userId) {
    return c.json({ error: "Missing userId query parameter" }, 400);
  }

  try {
    const results = await db
      .select({
        id: rewardRequests.id,
        userId: rewardRequests.userId,
        status: rewardRequests.status,
        orderScreenshot: rewardRequests.orderScreenshot,
        reviewScreenshot: rewardRequests.reviewScreenshot,
        reviewLink: rewardRequests.reviewLink,
        proofOfPayment: rewardRequests.proofOfPayment,
        comments: rewardRequests.comments,
        createdAt: rewardRequests.createdAt,
        updatedAt: rewardRequests.updatedAt,
        product: {
          id: products.id,
          title: products.title,
          price: products.price,
          image_url: products.image_url,
          affiliate_url: products.affiliate_url,
        },
      })
      .from(rewardRequests)
      .innerJoin(products, eq(rewardRequests.productId, products.id))
      .where(eq(rewardRequests.userId, userId));

    if (results.length === 0) {
      return c.json({ error: "No reward requests found for this user" }, 404);
    }

    return c.json(results);
  } catch (error) {
    console.error("Database query error:", error);
    return c.json({ error: "Failed to fetch reward requests" }, 500);
  }
});

// Create a new reward request (Handles multiple image uploads)
rewardRequestsRoute.post("/", async (c) => {
  const formData = await c.req.formData();
  const userId = formData.get("userId") as string;
  const productId = formData.get("productId") as string;
  const orderScreenshot = formData.get("orderScreenshot") as File | null;
  const db = c.get("DB");
  const bucket = c.env.R2_BUCKET;

  if (!userId || !productId || !orderScreenshot) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check if request already exists for this user and product
  const existingRequest = await db
    .select()
    .from(rewardRequests)
    .where(and(eq(rewardRequests.userId, userId), eq(rewardRequests.productId, Number(productId))))
    .limit(1);

  if (existingRequest.length > 0) {
    return c.json({ error: "A reward request already exists for this product and user" }, 409);
  }

  // Upload order screenshot
  const orderScreenshotUrl = await uploadImageToR2(bucket, orderScreenshot, c.env.R2_BUCKET_URL);

  // Store reward request in the database
  await db.insert(rewardRequests).values({
    userId,
    productId: Number(productId),
    orderScreenshot: orderScreenshotUrl || "", // Ensure a string value
  });

  return c.json({ success: true, orderScreenshotUrl });
});

// Update an existing reward request (Handles review screenshot and proof of payment uploads)
rewardRequestsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const status = formData.get("status") as string;
  const reviewScreenshot = formData.get("reviewScreenshot") as File | null;
  const reviewLink = formData.get("reviewLink") as string | null;
  const proofOfPayment = formData.get("proofOfPayment") as File | null;
  const comments = formData.get("comments") as string | null;
  const db = c.get("DB");
  const bucket = c.env.R2_BUCKET;

  // Check if the reward request exists
  const existingRequest = await db.select().from(rewardRequests).where(eq(rewardRequests.id, id)).limit(1);
  
  if (existingRequest.length === 0) {
    return c.json({ error: "Reward request not found" }, 404);
  }

  // Upload images if provided
  const reviewScreenshotUrl = await uploadImageToR2(bucket, reviewScreenshot, c.env.R2_BUCKET_URL);
  const proofOfPaymentUrl = await uploadImageToR2(bucket, proofOfPayment, c.env.R2_BUCKET_URL);

  // Update the reward request in the database
  await db
    .update(rewardRequests)
    .set({
      status: status ?? existingRequest[0].status,
      reviewScreenshot: reviewScreenshotUrl ?? (existingRequest[0].reviewScreenshot || ""),
      reviewLink: reviewLink ?? (existingRequest[0].reviewLink || ""),
      proofOfPayment: proofOfPaymentUrl ?? (existingRequest[0].proofOfPayment || ""),
      comments: comments ?? (existingRequest[0].comments || ""),
    })
    .where(eq(rewardRequests.id, id));

  return c.json({ success: true, reviewScreenshotUrl, proofOfPaymentUrl });
});

rewardRequestsRoute.get("/:id/comments", async (c) => {
  const { id } = c.req.param();
  const db = c.get("DB");

  try {
    const comments = await db
      .select({
        id: rewardComments.id,
        comment: rewardComments.comment,
        createdAt: rewardComments.createdAt,
        userId: rewardComments.userId,
        userName: users.name, // Fetch user name
      })
      .from(rewardComments)
      .innerJoin(users, eq(rewardComments.userId, users.id)) // Join users table
      .where(eq(rewardComments.rewardRequestId, id))
      .orderBy(desc(rewardComments.createdAt));

    if (comments.length === 0) {
      return c.json({ error: "No comments found for this reward request" }, 404);
    }
    
    return c.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

rewardRequestsRoute.post("/:id/comments", async (c) => {
  const { id } = c.req.param();
  const { userId, comment } = await c.req.json();
  const db = c.get("DB");

  if (!userId || !comment.trim()) {
      return c.json({ error: "Invalid data" }, 400);
  }

  try {
      await db.insert(rewardComments).values({
          id: crypto.randomUUID(),
          rewardRequestId: id,
          userId: userId,
          comment,
      });

      return c.json({ success: true });
  } catch (error) {
      return c.json({ error: "Failed to save comment" }, 500);
  }
});

export default rewardRequestsRoute;
