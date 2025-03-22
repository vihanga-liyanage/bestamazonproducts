import { RewardRequestStatus } from "../types/rewardRequests";

export const generateStatusChangeComment = (
  oldStatus: RewardRequestStatus|string,
  newStatus: RewardRequestStatus,
  userName: string
): string => {
  if (oldStatus === newStatus) {
    return ""; // No change, no comment needed
  }

  const statusComments: Record<string, string> = {
    // Step 1: Verification Decision
    [`${RewardRequestStatus.PendingVerification}->${RewardRequestStatus.ApprovedReviewPending}`]: 
      `Request has been approved by ${userName}.`,
    [`${RewardRequestStatus.PendingVerification}->${RewardRequestStatus.Rejected}`]: 
      `Request has been rejected by ${userName}.`,

    // Step 2: After Approval 
    [`${RewardRequestStatus.ApprovedReviewPending}->${RewardRequestStatus.Rejected}`]: 
      `Request was rejected by ${userName}.`,
    [`${RewardRequestStatus.ApprovedReviewPending}->${RewardRequestStatus.ReviewSubmitted}`]: 
      `Amazon review submitted by ${userName}.`,

    // Step 3: Review Submission Processing
    [`${RewardRequestStatus.ReviewSubmitted}->${RewardRequestStatus.PaymentPending}`]: 
      `Review has been verified by ${userName}. Payment is now pending.`,
    [`${RewardRequestStatus.ReviewSubmitted}->${RewardRequestStatus.Rejected}`]: 
      `Review submission was rejected by ${userName}.`,

    // Step 4: Payment Processing
    [`${RewardRequestStatus.PaymentPending}->${RewardRequestStatus.PaymentCompleted}`]: 
      `Payment has been successfully completed by ${userName}.`,
    [`${RewardRequestStatus.PaymentPending}->${RewardRequestStatus.Rejected}`]: 
      `Payment request has been rejected by ${userName}.`,
  };

  return statusComments[`${oldStatus}->${newStatus}`] || 
         `Status changed from ${oldStatus} to ${newStatus} by ${userName}.`;
};
