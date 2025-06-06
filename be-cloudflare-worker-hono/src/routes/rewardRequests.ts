import { Hono } from "hono";
import { connectDB } from "../db/db";
import { products, rewardComments, rewardRequests, users } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { RewardRequestStatus } from "../types/rewardRequests";
import { generateStatusChangeComment } from "../utils/utils";

type Bindings = { DB: D1Database; R2_BUCKET: R2Bucket; R2_BUCKET_URL: string; };
type Variables = { DB: ReturnType<typeof connectDB> };

const rewardRequestsRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>();

rewardRequestsRoute.use("*", async (c, next) => {
  c.set("DB", connectDB(c.env));
  await next();
});

// Helper function to upload an image to Cloudflare R2 and return the public URL
const uploadImageToR2 = async (
  bucket: R2Bucket,
  file: File | null,
  bucketBaseUrl: string
): Promise<string | undefined> => {
  if (!file) {
    console.warn("No file provided for upload.");
    return undefined;
  }

  const imageId = uuidv4();
  const fileExtension = file.name.split(".").pop() || "jpg"; // Default to jpg if no extension
  const fileName = `${imageId}.${fileExtension}`;

  try {
    const result = await bucket.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    if (!result) {
      console.error("Upload failed: No result from put()");
      return undefined;
    }

    return `${bucketBaseUrl}${fileName}`;
  } catch (error) {
    console.error(`Error uploading ${fileName} to R2:`, error);
    return undefined;
  }
};

// Helper function to delete an image from Cloudflare R2
const deleteImageFromR2 = async (bucket: R2Bucket, imageUrl: string | null): Promise<void> => {
  if (!imageUrl) {
    console.log("No image URL provided for deletion. Skipping...");
    return;
  }

  try {
    const imageKey = imageUrl.split("/").pop();
    if (!imageKey) {
      console.error("Invalid image URL format:", imageUrl);
      return;
    }

    await bucket.delete(imageKey);
    console.log(`Deleted image: ${imageKey}`);
  } catch (error) {
    console.error(`Error deleting image ${imageUrl} from R2:`, error);
  }
};

rewardRequestsRoute.get("/", async (c) => {
  const db = c.get("DB");
  const userId = c.req.query("userId");

  try {
    const baseQuery = db
      .select({
        id: rewardRequests.id,
        userId: rewardRequests.userId,
        userName: users.name,
        status: rewardRequests.status,
        paypalEmail: rewardRequests.paypalEmail,
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
      .innerJoin(users, eq(rewardRequests.userId, users.id));

    // Apply userId filter if provided
    const results = userId
      ? await baseQuery.where(eq(rewardRequests.userId, userId))
      : await baseQuery;

    if (results.length === 0) {
      return c.json({ error: "No reward requests found" }, 404);
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
  const paypalEmail = formData.get("paypalEmail") as string;
  const db = c.get("DB");
  const bucket = c.env.R2_BUCKET;

  if (!userId || !productId || !orderScreenshot || !paypalEmail) {
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

  // Update user's PayPal email if not set
  await db.update(users)
    .set({ paypalEmail })
    .where(eq(users.id, userId));

  // Create reward request
  await db.insert(rewardRequests).values({
    userId,
    productId: Number(productId),
    orderScreenshot: orderScreenshotUrl || "",
    paypalEmail,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return c.json({ success: true, orderScreenshotUrl });
});

// Update an existing reward request (Handles review screenshot and proof of payment uploads)
rewardRequestsRoute.put("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const formData = await c.req.formData();
  const db = c.get("DB");
  const bucket = c.env.R2_BUCKET;

  // Extract values from form data
  const status = formData.get("status") as string | null;
  const reviewScreenshot = formData.get("reviewScreenshot") as File | null;
  const reviewLink = formData.get("reviewLink") as string | null;
  const proofOfPayment = formData.get("proofOfPayment") as File | null;
  const comments = formData.get("comments") as string | null;

  // Check if the reward request exists
  const existingRequest = await db.select().from(rewardRequests).where(eq(rewardRequests.id, id)).limit(1);
  if (existingRequest.length === 0) {
    return c.json({ error: "Reward request not found" }, 404);
  }

  let updateData: Record<string, any> = { updatedAt: Date.now() };

  // Update status if provided
  if (status) updateData.status = status;

  // Update review link if provided
  if (reviewLink !== null) updateData.reviewLink = reviewLink;

  // Upload images if provided
  if (reviewScreenshot) {
    updateData.reviewScreenshot = await uploadImageToR2(bucket, reviewScreenshot, c.env.R2_BUCKET_URL);
  }
  if (proofOfPayment) {
    updateData.proofOfPayment = await uploadImageToR2(bucket, proofOfPayment, c.env.R2_BUCKET_URL);
  }

  // Update comments if provided
  if (comments !== null) updateData.comments = comments;

  // Update the reward request in the database
  await db.update(rewardRequests).set(updateData).where(eq(rewardRequests.id, id));

  return c.json({ success: true, updatedFields: updateData });
});

// Update the status of a reward request
rewardRequestsRoute.put("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const { userId, status } = await c.req.json();
  const db = c.get("DB");

  if (!userId) {
    return c.json({ error: "Invalid data" }, 400);
  }
  // Ensure the status is a valid RewardStatus value
  if (!Object.values(RewardRequestStatus).includes(status as RewardRequestStatus)) {
    return c.json({ error: "Invalid status value" }, 400);
  }

  // Check if the reward request exists
  const existingRequest = await db.select().from(rewardRequests).where(eq(rewardRequests.id, id)).limit(1);
  
  if (existingRequest.length === 0) {
    return c.json({ error: "Reward request not found" }, 404);
  } else if (existingRequest[0].status == status) {
    return c.json({ error: "Reward request already has this status" }, 400);
  } 

  try {
    // Update the reward request in the database
    await db.update(rewardRequests)
      .set({
        status: status,
        updatedAt: Date.now()
      })
      .where(eq(rewardRequests.id, id));

    // Get user name for the comment
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0) {
      console.error("User not found with the ID: " + userId);
    } else {
      // Add a comment to specify the status change
      await db.insert(rewardComments).values({
        id: crypto.randomUUID(),
        rewardRequestId: id,
        userId: "SYSTEM",
        comment: generateStatusChangeComment(existingRequest[0].status, status, result[0].name),
        createdAt: Date.now()
      });
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to save comment" }, 500);
  }
});

rewardRequestsRoute.delete("/:id", async (c) => {
  const db = c.get("DB");
  const bucket = c.env.R2_BUCKET;
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    return c.json({ error: "Invalid reward request ID" }, 400);
  }

  try {
    // Fetch reward request details (for image deletion)
    const existingRequest = await db
      .select({
        orderScreenshot: rewardRequests.orderScreenshot,
        reviewScreenshot: rewardRequests.reviewScreenshot,
        proofOfPayment: rewardRequests.proofOfPayment,
      })
      .from(rewardRequests)
      .where(eq(rewardRequests.id, id));

    if (existingRequest.length === 0) {
      return c.json({ error: "Reward request not found" }, 404);
    }

    const { orderScreenshot, reviewScreenshot, proofOfPayment } = existingRequest[0];

    // Delete images from R2
    await Promise.all([
      deleteImageFromR2(bucket, orderScreenshot),
      deleteImageFromR2(bucket, reviewScreenshot),
      deleteImageFromR2(bucket, proofOfPayment),
    ]);

    // Delete the reward request
    await db.delete(rewardRequests).where(eq(rewardRequests.id, id));

    return c.json({ success: true, message: "Reward request and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward request:", error);
    return c.json({ error: "Failed to delete reward request" }, 500);
  }
});

rewardRequestsRoute.get("/:id/comments", async (c) => {
  const id = Number(c.req.param("id"));
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
  const id = Number(c.req.param("id"));
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
          createdAt: Date.now()
      });

      return c.json({ success: true });
  } catch (error) {
      return c.json({ error: "Failed to save comment" }, 500);
  }
});

export default rewardRequestsRoute;
