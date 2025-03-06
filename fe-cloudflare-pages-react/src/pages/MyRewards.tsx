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

  useEffect(() => {
    if (user) {
      syncUser(user).then(fetchRewardRequests);
    }
  }, [user]);

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

  // Create a new reward request
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
        fetchRewardRequests();
      } else {
        console.error("Error creating reward request:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting reward request:", error);
    }
  };

  // Handle image uploads for `reviewScreenshot` and `proofOfPayment`
  const handleImageUpload = async (rewardRequestId: string, imageFile: File, imageType: string) => {
    if (!user || !imageFile) return;

    const formData = new FormData();
    formData.append("id", rewardRequestId);
    formData.append(imageType, imageFile); // Dynamically append correct image type

    try {
      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        fetchRewardRequests();
      } else {
        console.error(`Error uploading ${imageType}:`, await response.text());
      }
    } catch (error) {
      console.error(`Error submitting ${imageType}:`, error);
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
            onSubmit={handleSubmitRequest} // ✅ Create a new reward request
          />

          {loading && <p>Loading reward products...</p>}
          {error && <p>Error loading products: {error}</p>}

          <div className="requests-list">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="request-card">
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
                        request.comments.map((comment, index) => <p key={index}>{comment}</p>)
                      ) : (
                        <p>No comments yet.</p>
                      )}
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
