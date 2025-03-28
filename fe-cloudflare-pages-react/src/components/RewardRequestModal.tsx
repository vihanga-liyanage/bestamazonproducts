import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";
import Select from "react-select";
import "../styles/Modal.css";
import { Product } from "../types/Product";

interface RewardRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (productId: number, orderScreenshot: File | null, paypalEmail: string) => void;
}

const RewardRequestModal: React.FC<RewardRequestModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmit,
}) => {
  const { user } = useUser();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderScreenshot, setOrderScreenshot] = useState<File | null>(null);
  const [paypalEmail, setPaypalEmail] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Get user data from backend
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        });
        
        if (response.ok) {
          const userData = await response.json();
          setPaypalEmail(userData.paypalEmail || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (isOpen) {
      setSelectedProduct(null);
      setOrderScreenshot(null);
      fetchUserData();
    }
  }, [isOpen, user]);

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
    if (!paypalEmail) {
      alert("Please enter the paypal email address to receive refund.");
      return;
    }

    onSubmit(selectedProduct.id, orderScreenshot, paypalEmail);
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

        <div className="form-group">
          <label htmlFor="paypalEmail">PayPal Email</label>
          <input
            type="email"
            id="paypalEmail"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            required
            placeholder="Enter your PayPal email"
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={handleSubmit} className="submit-button">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default RewardRequestModal;
