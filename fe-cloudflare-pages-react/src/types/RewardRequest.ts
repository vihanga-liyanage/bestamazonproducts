import { Product } from "./Product";
import { RewardComment } from "./RewardComment";

export interface RewardRequest {
  id: number;
  userId: string;
  product: Product;
  status: string;
  orderScreenshot?: string;
  reviewScreenshot?: string;
  reviewLink?: string;
  proofOfPayment?: string;
  comments: RewardComment[];
  createdAt: string;
}

export enum RewardRequestStatus {
  PendingVerification = "Pending Verification",
  ApprovedReviewPending = "Approved - Review Pending",
  ReviewSubmitted = "Review Submitted",
  PaymentPending = "Payment Pending",
  PaymentCompleted = "Payment Completed",
  Rejected = "Rejected",
}
