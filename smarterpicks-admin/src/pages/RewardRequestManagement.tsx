import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/RewardRequestManagement.css";
import { useUser } from "@clerk/clerk-react";
import { RewardComment, RewardRequest, RewardRequestStatus, statusTransitions } from "../types/rewardRequests";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RewardRequestManagement: React.FC = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reward-requests`);
      setRequests(
        response.data.map((req: RewardRequest) => ({
          ...req,
          comments: req.comments || [],
          isLoadingComments: false,
        }))
      );
    } catch (error) {
      console.error("Error fetching reward requests:", error);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setEnlargedImage(null);
  };

  const getNextStatuses = (currentStatus: RewardRequestStatus): RewardRequestStatus[] => {
    return statusTransitions[currentStatus] || [];
  };

  const getStatusButtonText = (status: RewardRequestStatus): string => {
    switch (status) {
      case RewardRequestStatus.Rejected:
        return "Reject";
      case RewardRequestStatus.ApprovedReviewPending:
        return "Approve for Review";
      case RewardRequestStatus.PaymentPending:
        return "Approve Review";
      default:
        return status;
    }
  }

  const fetchComments = async (requestId: number) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, isLoadingComments: true } : req
      )
    );

    try {
      const response = await axios.get(`${API_BASE_URL}/reward-requests/${requestId}/comments`);
      const sortedComments = response.data.sort(
        (a: RewardComment, b: RewardComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, comments: sortedComments, isLoadingComments: false }
            : req
        )
      );
    } catch (error) {
      console.error(`Error fetching comments for request ${requestId}:`, error);
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, isLoadingComments: false } : req))
      );
    }
  };

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

  const toggleExpand = (id: number) => {
    if (expandedRequest === id) {
      setExpandedRequest(null);
    } else {
      setExpandedRequest(id);
      const request = requests.find((req) => req.id === id);
      if (request && request.comments.length === 0) {
        fetchComments(id);
      }
    }
  };

  const handleAddComment = async (requestId: number) => {
    if (!newComment[requestId]?.trim() || !user?.id) return; // Ensure user is logged in

    try {
      await axios.post(`${API_BASE_URL}/reward-requests/${requestId}/comments`, {
        userId: user.id, // Send userId from Clerk
        comment: newComment[requestId],
      });

      fetchComments(requestId); // Refresh comments after posting
      setNewComment((prev) => ({ ...prev, [requestId]: "" }));
    } catch (error) {
      console.error(`Error adding comment to request ${requestId}:`, error);
    }
  };

  const handleAddPaymentProof = async (rewardRequestId: number, paymentProofFile: File | null) => {
    if (paymentProofFile == null) return; // Prevent empty values

    try {
      const formData = new FormData();
      formData.append("proofOfPayment", paymentProofFile);

      const response = await fetch(`${API_BASE_URL}/reward-requests/${rewardRequestId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        changeRequestStatus(rewardRequestId, RewardRequestStatus.PaymentCompleted);
      } else {
        console.error(`Failed to upload payment proof.`, await response.text());
      }

    } catch (error) {
      console.error("Error uploading payment proof:", error);
    }
  };

  const changeRequestStatus = async (id: number, status: RewardRequestStatus) => {
    console.log(user);

    if (!user?.id) return; // Ensure user is logged in

    try {
      await axios.put(`${API_BASE_URL}/reward-requests/${id}/status`, {
        userId: user?.id,
        status: status
      });
      fetchRequests();
      fetchComments(id);
    } catch (error) {
      console.error("Error changing request status:", error);
    }
  };

  const filteredRequests = requests
    .filter((request) =>
      (filterStatus === "all" || request.status === filterStatus) &&
      (request.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) =>
      sortBy === "createdAt"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : 0
    );

  return (
    <div className="reward-requests-container">
      <h1>Manage Reward Requests</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by user or product"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="Pending Verification">Pending Verification</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Sort by Date</option>
        </select>
      </div>

      <table className="requests-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Product</th>
            <th>Status</th>
            <th>Submitted At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request) => (
            <React.Fragment key={request.id}>
              <tr>
                <td>{request.userName}</td>
                <td>{request.product.title}</td>
                <td>{request.status}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => toggleExpand(request.id)}>
                    {expandedRequest === request.id ? "Collapse" : "Expand"}
                  </button>
                </td>
              </tr>
              {expandedRequest === request.id && (
                <>
                  <tr>
                    <td colSpan={5}>
                      <table className="request-details-table">
                        <tr>
                          <td colSpan={3}>
                            <div className="payment-info">
                              <strong>PayPal Email:</strong> {request.paypalEmail}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <h4>Order Screenshot</h4>
                            <img
                              src={request.orderScreenshot}
                              alt="Order Proof"
                              width="150"
                              onClick={() => request.orderScreenshot && handleImageClick(request.orderScreenshot)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            {request.reviewScreenshot && (
                              <>
                                <h4>Review Screenshot</h4>
                                <img
                                  src={request.reviewScreenshot}
                                  alt="Review Proof"
                                  width="150"
                                  onClick={() => request.reviewScreenshot && handleImageClick(request.reviewScreenshot)}
                                  style={{ cursor: 'pointer' }}
                                />
                              </>
                            )}
                            {request.reviewLink && (
                              <p>
                                <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">View Review</a>
                              </p>
                            )}
                          </td>
                          <td>
                            <h4>Payment Proof</h4>
                            {request.proofOfPayment && (
                              <img
                                src={request.proofOfPayment}
                                alt="Payment Proof"
                                width="150"
                                onClick={() => request.proofOfPayment && handleImageClick(request.proofOfPayment)}
                                style={{ cursor: 'pointer' }}
                              />
                            )}
                            {request.status === RewardRequestStatus.PaymentPending && (
                              <div className="review-input">
                                <p>Please upload the payment proof.</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    e.target.files &&
                                    e.target.files[0] &&
                                    setPaymentProof(e.target.files[0])
                                  }
                                />
                                <br />
                                <br />
                                <button onClick={() => handleAddPaymentProof(request.id, paymentProof)}>
                                  Update
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5}>
                            <div className="expanded-view">
                              <h4>Comments</h4>
                              {request.isLoadingComments ? (
                                <p>Loading comments...</p>
                              ) : (
                                <ul>
                                  {request.comments.length ? (
                                    request.comments.map((comment) => (
                                      <li key={comment.id}>
                                        <strong>{comment.userName}:</strong> {comment.comment}
                                        <br />
                                        <small>{formatTimeAgo(comment.createdAt)}</small>
                                      </li>
                                    ))
                                  ) : (
                                    <p>No comments yet.</p>
                                  )}
                                </ul>
                              )}

                              <textarea
                                placeholder="Add a comment"
                                value={newComment[request.id] || ""}
                                onChange={(e) =>
                                  setNewComment((prev) => ({ ...prev, [request.id]: e.target.value }))
                                }
                              ></textarea>
                              <button onClick={() => handleAddComment(request.id)}>Add Comment</button>

                              <div className="actions">
                                { getNextStatuses(request.status).map((nextStatus) => (
                                  <button key={nextStatus} onClick={() => changeRequestStatus(request.id, nextStatus)}>
                                    {getStatusButtonText(nextStatus)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {expandedRequest !== null && enlargedImage && (
        <div className="modal" onClick={handleCloseModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <img src={enlargedImage} alt="Enlarged" style={{ maxWidth: '90%', maxHeight: '90%' }} />
        </div>
      )}
    </div>
  );
};

export default RewardRequestManagement;
