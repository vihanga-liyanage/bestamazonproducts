import React, { useEffect, useState } from "react";
import "../styles/MyRewards.css";
import RewardRequestModal from "../components/RewardRequestModal";
import RewardRequestCard from "../components/RewardRequestCard";
import { RewardRequest, RewardRequestStatus } from "../types/RewardRequest";
import useProducts from "../hooks/useProducts";
import { useUser } from "@clerk/clerk-react";
import { syncUser } from "../utils/authUtils";
import { RewardComment } from "../types/RewardComment";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const MyRewards: React.FC = () => {
  const { user } = useUser();
  const { products, error, loading } = useProducts(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<RewardRequest[]>([]);

  useEffect(() => {
    if (user) {
      syncUser(user).then(fetchRewardRequests);
    }
  }, [user]);

  const fetchRewardRequests = async () => {
    if (!user) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch comments for each request
        const updatedRequests = await Promise.all(
          data.map(async (request: RewardRequest) => ({
            ...request,
            comments: await fetchComments(request.id),
          }))
        );
  
        setRequests(updatedRequests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching reward requests:", error);
    }
  };  

  const handleSubmitRequest = async (productId: number, orderScreenshot: File | null, paypalEmail: string) => {
    if (!orderScreenshot || !user || !paypalEmail) return;
  
    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) return;
  
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("productId", String(productId));
    formData.append("orderScreenshot", orderScreenshot);
    formData.append("paypalEmail", paypalEmail);
  
    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        fetchRewardRequests(); // Refresh the list
      } else {
        console.error("Error creating reward request:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting reward request:", error);
    }
  };  

  const handleDeleteRequest = async (rewardRequestId: number) => {
    if (!user) return;
  
    const confirmDelete = window.confirm("Are you sure you want to delete this reward request? This action cannot be undone.");
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setRequests((prevRequests) => prevRequests.filter((req) => req.id !== rewardRequestId));
      } else {
        console.error("Error deleting reward request:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting reward request:", error);
    }
  };

  const handleReviewUpdate = async (rewardRequestId: number, reviewLink: string, imageFile: File) => {
    if (!reviewLink.trim() || imageFile == null) return; // Prevent empty values
  
    try {
      const formData = new FormData();
      formData.append("reviewLink", reviewLink);
      formData.append("reviewScreenshot", imageFile);
  
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}`, {
        method: "PUT",
        body: formData,
      });
  
      if (response.ok) {
        changeRequestStatus(rewardRequestId, RewardRequestStatus.ReviewSubmitted);
      } else {
        console.error(`Failed to update review.`, await response.text());
      }
  
    } catch (error) {
      console.error("Error updating review link:", error);
    }
  };

  const changeRequestStatus = async (rewardRequestId: number, status: RewardRequestStatus) => {    
    if (!user?.id) return; // Ensure user is logged in

    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}/status`, {
        method: "PUT",
        body: JSON.stringify({ userId: user.id, status }),
      });
      if (response.ok) {
        fetchRewardRequests();
      } else {
        console.error(`Failed to update request status.`, await response.text());
      }
    } catch (error) {
      console.error("Error changing request status:", error);
    }
  };

  const handleAddComment = async (rewardRequestId: number, comment: string) => {
    if (!user || !comment.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, comment }),
      });

      if (response.ok) {
        fetchRewardRequests();
      } else {
        console.error("Error adding comment:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const fetchComments = async (rewardRequestId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}/comments`);
       
      if (response.ok) {
        const comments = await response.json();
        const sortedComments = comments.sort(
          (a: RewardComment, b: RewardComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return sortedComments;
      }
      return []; // Ensure it returns an empty array if no comments are found
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };
  
  return (
    <div className="my-rewards-page">
      <h1>My Rewards</h1>
      {user ? (
        <>
          <button className="submit-reward-btn" onClick={() => setIsModalOpen(true)}>
            Submit Reward Request
          </button>

          <RewardRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            products={products}
            onSubmit={(productId, orderScreenshot, paypalEmail) => handleSubmitRequest(productId, orderScreenshot, paypalEmail)}
          />

          {loading && <p>Loading reward products...</p>}
          {error && <p>Error loading products: {error}</p>}

          <div className="requests-list">
            {requests.length > 0 ? (
              requests.map((request) => (
                <RewardRequestCard
                  key={request.id}
                  request={request}
                  handleAddComment={handleAddComment}
                  handleDeleteRequest={handleDeleteRequest}
                  handleReviewUpdate={handleReviewUpdate}
                />
              ))
            ) : (
              <p>No reward requests found.</p>
            )}
          </div>
        </>
      ) : (
        <p>Please sign in to submit and view reward requests.</p>
      )}
    </div>
  );
};

export default MyRewards;
