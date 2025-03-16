import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ProductManagement: React.FC = () => {
  const [asinList, setAsinList] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"add" | "remove">("add");

  const handlePreviewChanges = async () => {
    setLoading(true);
    setMessage("");
    setSummary(null);

    try {
      const asins = asinList.split("\n").map((asin) => asin.trim()).filter(Boolean);
      const endpoint = mode === "add" ? "preview-add-reward-products" : "preview-remove-reward-products";
      const response = await axios.post(`${API_BASE_URL}/products/${endpoint}`, { asins });

      setSummary(response.data);
    } catch (error) {
      setMessage("Failed to generate preview.");
    }

    setLoading(false);
  };

  const handleConfirmChanges = async () => {
    setLoading(true);
    setMessage("");

    try {
      const asins = asinList.split("\n").map((asin) => asin.trim()).filter(Boolean);
      const endpoint = mode === "add" ? "update-add-reward-products" : "update-remove-reward-products";
      const response = await axios.post(`${API_BASE_URL}/products/${endpoint}`, { asins });

      setMessage(response.data.message);
      setSummary(null);
    } catch (error) {
      setMessage("Failed to update reward products.");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Manage Reward Products</h1>

      <div>
        <button onClick={() => setMode("add")} disabled={mode === "add"}>Add Reward Products</button>
        <button onClick={() => setMode("remove")} disabled={mode === "remove"}>Remove Reward Products</button>
      </div>

      <h3>{mode === "add" ? "Add Products to Rewards" : "Remove Products from Rewards"}</h3>
      <textarea
        value={asinList}
        onChange={(e) => setAsinList(e.target.value)}
        placeholder="Paste ASINs, one per line..."
        rows={5}
        cols={50}
      />

      <button onClick={handlePreviewChanges} disabled={loading}>
        {loading ? "Processing..." : "Preview Changes"}
      </button>

      {summary && (
        <div>
          <h3>Summary of Changes</h3>
          {mode === "add" ? (
            <>
              <p>New Products to be Added: {summary.newProducts.length}</p>
              <p>Products to be Updated (isReward = 1): {summary.productsToUpdate.length}</p>
            </>
          ) : (
            <p>Products to be Removed from Rewards: {summary.productsToRemove.length}</p>
          )}

          <button onClick={handleConfirmChanges} disabled={loading}>
            {loading ? "Processing..." : "Confirm & Apply Changes"}
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default ProductManagement;
