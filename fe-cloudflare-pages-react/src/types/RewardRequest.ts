import { Product } from "./Product";
import { RewardComment } from "./RewardComment";

export interface RewardRequest {
  id: string;
  userId: string;
  product: Product;
  status: string;
  orderScreenshot?: string;
  reviewScreenshot?: string;
  reviewLink?: string;
  proofOfPayment?: string;
  comments: RewardComment[];
}
