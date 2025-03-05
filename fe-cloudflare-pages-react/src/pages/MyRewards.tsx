import React, { useEffect, useState } from "react";
import "../styles/MyRewards.css";
import RewardRequestModal from "../components/RewardRequestModal";
import { Product } from "../types/Product";
import useProducts from "../hooks/useProducts";
import { useUser } from "@clerk/clerk-react";
import { syncUser } from "../utils/authUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface RewardRequest {
  id: string;
  userId: string;
  product: Product;
  status: string;
  orderScreenshot?: string;
  reviewScreenshot?: string;
  reviewLink?: string;
  proofOfPayment?: string;
  comments: string[];
}

const MyRewards: React.FC = () => {
  const { user } = useUser();
  const { products, error, loading } = useProducts("rewards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<RewardRequest[]>([]);

  // Ensure the user exists in the local database before fetching reward requests
  useEffect(() => {
    console.log(user);
    
    if (user) {
      syncUser(user).then(fetchRewardRequests);
    }
  }, [user]);

  // Fetch reward requests from the backend
  const fetchRewardRequests = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching reward requests:", error);
    }
  };

  // Submit a new reward request
  const handleSubmitRequest = async (productId: number, orderScreenshot: File | null) => {
    if (!orderScreenshot || !user) return;

    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("productId", String(productId));
    formData.append("orderScreenshot", orderScreenshot);

    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchRewardRequests(); // Refresh reward requests after submitting
      }
    } catch (error) {
      console.error("Error submitting reward request:", error);
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
            onSubmit={handleSubmitRequest}
          />

          {loading && <p>Loading reward products...</p>}
          {error && <p>Error loading products: {error}</p>}

          <div className="requests-list">
            {requests.length > 0 ? (
              requests
                .filter((request) => request.userId === user.id) // Ensure only the logged-in user's requests are displayed
                .map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-summary" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle("expanded")}>
                      <img src={request.product.image_url} alt={request.product.title} />
                      <div className="request-info">
                        <h3>{request.product.title}</h3>
                        <p>Status: <span className={`status ${request.status.replace(" ", "-").toLowerCase()}`}>{request.status}</span></p>
                      </div>
                    </div>

                    <div className="request-details">
                      {request.orderScreenshot && <img src={request.orderScreenshot} alt="Order Screenshot" />}
                      {request.reviewScreenshot && (
                        <>
                          <img src={request.reviewScreenshot} alt="Review Screenshot" />
                          <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">View Review</a>
                        </>
                      )}
                      {request.proofOfPayment && <img src={request.proofOfPayment} alt="Proof of Payment" />}
                      <div className="comments">
                        <h4>Comments</h4>
                        {request.comments.map((comment, index) => <p key={index}>{comment}</p>)}
                      </div>
                    </div>
                  </div>
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
