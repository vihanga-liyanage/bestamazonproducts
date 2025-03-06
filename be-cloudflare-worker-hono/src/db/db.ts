import { drizzle } from "drizzle-orm/d1";
import { users, products, rewardRequests } from "./schema";

export const connectDB = (env: any) => drizzle(env.DB, {
  schema: { users, products, rewardRequests }
});
