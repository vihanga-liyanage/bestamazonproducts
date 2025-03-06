import React, { useState, useEffect } from "react";
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setOrderScreenshot(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }
    if (!orderScreenshot) {
      alert("Please upload an order screenshot.");
      return;
    }

    onSubmit(selectedProduct.id, orderScreenshot);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Submit a Reward Request</h2>

        <label>Select a Product</label>
        <Select
          options={products.map((product) => ({
            value: product.id,
            label: `${product.title} ($${product.price.toFixed(2)})`,
          }))}
          value={
            selectedProduct
              ? { value: selectedProduct.id, label: `${selectedProduct.title} ($${selectedProduct.price.toFixed(2)})` }
              : null
          }
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
