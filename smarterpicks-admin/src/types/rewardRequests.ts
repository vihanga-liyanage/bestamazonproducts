export interface RewardRequest {
  id: number;
  userId: string;
  userName: string;
  status: RewardRequestStatus;
  orderScreenshot: string;
  reviewScreenshot?: string | null;
  reviewLink?: string | null;
  proofOfPayment?: string | null;
  createdAt: string;
  updatedAt: string;
  comments: RewardComment[];
  isLoadingComments?: boolean;
  product: {
    id: number;
    title: string;
    price: number;
    image_url: string;
    affiliate_url: string;
  };
}

export interface RewardComment {
  id: number;
  userId: string;
  userName: string;
  comment: string;
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

export const statusTransitions: Record<RewardRequestStatus, RewardRequestStatus[]> = {
  [RewardRequestStatus.PendingVerification]: [
    RewardRequestStatus.ApprovedReviewPending,
    RewardRequestStatus.Rejected,
  ],
  [RewardRequestStatus.ApprovedReviewPending]: [
    RewardRequestStatus.Rejected,
  ],
  [RewardRequestStatus.ReviewSubmitted]: [
    RewardRequestStatus.PaymentPending,
    RewardRequestStatus.Rejected,
  ],
  [RewardRequestStatus.PaymentPending]: [
    RewardRequestStatus.Rejected,
  ],
  [RewardRequestStatus.PaymentCompleted]: [], // No further changes
  [RewardRequestStatus.Rejected]: [], // No further changes
};
