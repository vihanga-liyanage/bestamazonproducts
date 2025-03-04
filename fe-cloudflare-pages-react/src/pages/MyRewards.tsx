import React, { useState } from "react";
import "../styles/MyRewards.css";
import RewardRequestModal from "../components/RewardRequestModal";
import { Product } from "../types/Product";
import useProducts from "../hooks/useProducts";

interface RewardRequest {
  id: string;
  product: Product;
  status: string;
  orderScreenshot?: string;
  reviewScreenshot?: string;
  reviewLink?: string;
  proofOfPayment?: string;
  comments: string[];
}

const MyRewards: React.FC = () => {
  const { products, error, loading } = useProducts("rewards");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState<RewardRequest[]>([
    {
      id: "1",
      product: {
        id: 101,
        title: "Wireless Earbuds",
        price: 29.99,
        image_url: "/images/earbuds.jpg",
        affiliate_url: "#",
      },
      status: "Pending Verification",
      orderScreenshot: "/images/order1.jpg",
      comments: ["Waiting for admin verification"],
    },
    {
      id: "2",
      product: {
        id: 102,
        title: "Smartwatch",
        price: 49.99,
        image_url: "/images/smartwatch.jpg",
        affiliate_url: "#",
      },
      status: "Review Submitted",
      orderScreenshot: "/images/order2.jpg",
      reviewScreenshot: "/images/review2.jpg",
      reviewLink: "https://amazon.com/review/123",
      comments: ["Review submitted. Awaiting admin approval."],
    },
  ]);

  const handleSubmitRequest = (productId: number, orderScreenshot: File | null) => {
    if (!orderScreenshot) return;
    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) return;

    const newRequest: RewardRequest = {
      id: String(requests.length + 1),
      product: selectedProduct,
      status: "Pending Verification",
      orderScreenshot: URL.createObjectURL(orderScreenshot),
      comments: ["Waiting for admin verification"],
    };

    setRequests([...requests, newRequest]);
  };

  return (
    <div className="my-rewards-page">
      <h1>My Rewards</h1>
      <button className="submit-reward-btn" onClick={() => setIsModalOpen(true)}>
        Submit Reward Request
      </button>

      <RewardRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products} // Dynamically fetched reward products
        onSubmit={handleSubmitRequest}
      />

      {loading && <p>Loading reward products...</p>}
      {error && <p>Error loading products: {error}</p>}

      <div className="requests-list">
        {requests.map((request) => (
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
        ))}
      </div>
    </div>
  );
};

export default MyRewards;
