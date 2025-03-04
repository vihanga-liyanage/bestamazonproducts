import React, { useState } from "react";
import Select from "react-select"; // Import react-select
import "../styles/Modal.css";
import { Product } from "../types/Product";

interface RewardRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (productId: number, orderScreenshot: File | null) => void;
}

const RewardRequestModal: React.FC<RewardRequestModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderScreenshot, setOrderScreenshot] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedProduct && orderScreenshot) {
      onSubmit(selectedProduct.id, orderScreenshot);
      onClose();
    } else {
      alert("Please select a product and upload an order screenshot.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Submit a Reward Request</h2>

        <label>Select a Product</label>
        <Select
          options={products.map((product) => ({
            value: product.id,
            label: `${product.title} ($${product.price})`,
          }))}
          onChange={(selectedOption) => {
            const product = products.find((p) => p.id === selectedOption?.value) || null;
            setSelectedProduct(product);
          }}
          isSearchable
          placeholder="Search for a product..."
          className="product-select"
        />

        <label>Upload Order Screenshot</label>
        <input
          type="file"
          className="file-upload"
          accept="image/*"
          onChange={(e) => setOrderScreenshot(e.target.files?.[0] || null)}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="submit-button">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default RewardRequestModal;
