import React, { useState } from "react";
import { RewardRequest } from "../types/RewardRequest";
import { FaTrash } from "react-icons/fa";

interface RewardRequestCardProps {
  request: RewardRequest;
  handleAddComment: (rewardRequestId: number, comment: string) => void;
  handleDeleteRequest: (rewardRequestId: number) => void;
  handleReviewUpdate: (rewardRequestId: number, reviewLink: string, imageFile: File) => void;
}

const RewardRequestCard: React.FC<RewardRequestCardProps> = ({
  request,
  handleAddComment,
  handleDeleteRequest,
  handleReviewUpdate,
}) => {
  const [commentInput, setCommentInput] = useState("");
  const [reviewLink, setReviewLink] = useState(request.reviewLink || "");
  const [reviewScreenshot, setReviewScreenshot] = useState<File | null>(null);

  // Helper function to format timestamps
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleString();
  };

  const handleReviewUpdateInternal = () => {
    if (reviewScreenshot && reviewLink != "") {
      handleReviewUpdate(request.id, reviewLink, reviewScreenshot); 
      setReviewLink("");
      setReviewScreenshot(null);
    }
  }
  return (
    <div className="request-card">
      <div className="request-summary" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle("expanded")}>
        {request.product?.image_url ? (
          <img src={request.product.image_url} alt={request.product.title} />
        ) : (
          <p>No Image Available</p>
        )}
        <div className="request-info">
          <h3>{request.product?.title ?? "Unknown Product"}</h3>
          <p>Status: <span className={`status ${request.status.replace(" ", "-").toLowerCase()}`}>{request.status}</span></p>
        </div>

        <button className="delete-btn" onClick={() => handleDeleteRequest(request.id)} title="Delete Request">
          <FaTrash />
        </button>
      </div>

      <div className="request-details">
        <table className="image-table">
          <tbody>
            <tr>
              <td>
                <p>Order Screenshot</p>
                {request.orderScreenshot ? (
                  <img src={request.orderScreenshot} alt="Order Screenshot" />
                ) : (
                  <small>Unabel to find the order screen shot</small>
                )}
              </td>
              <td>
                <p>Review Screenshot</p>
                {request.reviewScreenshot ? (
                  <>
                    <img src={request.reviewScreenshot} alt="Review Screenshot" />
                    <br></br>
                    <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">View Review</a>
                  </>
                ) : (
                  <div className="review-input">
                    <p>Please upload the review screenshot and update the URL</p>
                    <input type="file" accept="image/*" 
                      onChange={(e) => e.target.files && e.target.files[0] && setReviewScreenshot(e.target.files[0])} />
                    <br /><br />
                    <input
                      type="url"
                      placeholder="Enter review link"
                      value={reviewLink}
                      onChange={(e) => setReviewLink(e.target.value)}
                    />
                    <br /><br />
                    <button onClick={() => { handleReviewUpdateInternal() }}>Update</button>
                  </div>
                )}
              </td>
              <td>
                <p>Proof of Payment</p>
                {request.proofOfPayment ? (
                  <img src={request.proofOfPayment} alt="Proof of Payment" />
                ) : (
                  <small>Waiting for the payment.</small>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="comments">
          <h4>Comments</h4>
          {request.comments?.length > 0 ? (
            request.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p><strong>{comment.userName}</strong> - <small>{formatTimeAgo(comment.createdAt)}</small></p>
                <p>{comment.comment}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          <div className="comment-input">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button onClick={() => { handleAddComment(request.id, commentInput); setCommentInput(""); }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardRequestCard;
