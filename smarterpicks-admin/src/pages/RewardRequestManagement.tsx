import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/RewardRequestManagement.css";
import { useUser } from "@clerk/clerk-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface RewardRequest {
  id: number;
  userId: string;
  userName: string;
  status: string;
  orderScreenshot: string;
  reviewScreenshot?: string | null;
  reviewLink?: string | null;
  proofOfPayment?: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  isLoadingComments?: boolean;
  product: {
    id: number;
    title: string;
    price: number;
    image_url: string;
    affiliate_url: string;
  };
}

interface Comment {
  id: number;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

const RewardRequestManagement: React.FC = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});

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

  const fetchComments = async (requestId: number) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, isLoadingComments: true } : req
      )
    );
  
    try {
      const response = await axios.get(`${API_BASE_URL}/reward-requests/${requestId}/comments`);
      const sortedComments = response.data.sort(
        (a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(`${API_BASE_URL}/reward-requests/${id}/approve`);
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(`${API_BASE_URL}/reward-requests/${id}/reject`);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
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
            <th>Product Name</th>
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
                <tr>
                  <td colSpan={5}>
                    <div className="expanded-view">
                      <h4>Details</h4>
                      <img src={request.orderScreenshot} alt="Order Proof" width="150" />

                      {request.reviewScreenshot && (
                        <>
                          <h4>Review Screenshot</h4>
                          <img src={request.reviewScreenshot} alt="Review Proof" width="150" />
                        </>
                      )}

                      {request.reviewLink && (
                        <p>
                          <a href={request.reviewLink} target="_blank" rel="noopener noreferrer">
                            View Review
                          </a>
                        </p>
                      )}

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
                        <button onClick={() => handleApprove(request.id)}>Approve</button>
                        <button onClick={() => handleReject(request.id)}>Reject</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardRequestManagement;
