import React, { useState } from "react";
import { RewardRequest } from "../types/RewardRequest";
import { FaTrash } from "react-icons/fa";

interface RewardRequestCardProps {
  request: RewardRequest;
  handleImageUpload: (rewardRequestId: number, imageFile: File, imageType: string) => void;
  handleAddComment: (rewardRequestId: number, comment: string) => void;
  handleDeleteRequest: (rewardRequestId: number) => void;
}

const RewardRequestCard: React.FC<RewardRequestCardProps> = ({
  request,
  handleImageUpload,
  handleAddComment,
  handleDeleteRequest,
}) => {
  const [commentInput, setCommentInput] = useState("");

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
    
    return date.toLocaleString(); // Use default locale format for older comments
  };
  
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
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(request.id, e.target.files[0], "orderScreenshot")} />
                )}
              </td>
              <td>
                <p>Review Screenshot</p>
                {request.reviewScreenshot ? (
                  <>
                    <img src={request.reviewScreenshot} alt="Review Screenshot" />
                    <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">View Review</a>
                  </>
                ) : (
                  <>
                    <small>Please upload the review screen shot and update the URL</small>
                    <br></br>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(request.id, e.target.files[0], "reviewScreenshot")} />
                  </>
                )}
              </td>
              <td>
                <p>Proof of Payment</p>
                {request.proofOfPayment ? (
                  <img src={request.proofOfPayment} alt="Proof of Payment" />
                ): (<small>Waiting for the payment.</small>)}
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
