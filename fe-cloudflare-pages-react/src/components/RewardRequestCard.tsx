import React, { useState } from "react";
import { RewardRequest } from "../types/RewardRequest";

interface RewardRequestCardProps {
  request: RewardRequest;
  handleImageUpload: (rewardRequestId: string, imageFile: File, imageType: string) => void;
  handleAddComment: (rewardRequestId: string, comment: string) => void;
}

const RewardRequestCard: React.FC<RewardRequestCardProps> = ({ request, handleImageUpload, handleAddComment }) => {
  const [commentInput, setCommentInput] = useState("");

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
      </div>

      <div className="request-details">
        {request.orderScreenshot ? (
          <img src={request.orderScreenshot} alt="Order Screenshot" />
        ) : (
          <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(request.id, e.target.files[0], "orderScreenshot")} />
        )}

        {request.reviewScreenshot ? (
          <>
            <img src={request.reviewScreenshot} alt="Review Screenshot" />
            <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">View Review</a>
          </>
        ) : (
          <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(request.id, e.target.files[0], "reviewScreenshot")} />
        )}

        {request.proofOfPayment ? (
          <img src={request.proofOfPayment} alt="Proof of Payment" />
        ) : (
          <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(request.id, e.target.files[0], "proofOfPayment")} />
        )}

        <div className="comments">
          <h4>Comments</h4>
          {request.comments?.length > 0 ? (
            request.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p><strong>{comment.userName}</strong> - {new Date(comment.createdAt).toLocaleString()}</p>
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
