import React from 'react';
import '../styles/ProductCard.css';
import { Product } from '../types/Product';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <img src={product.image_url} alt={product.title} />
      </div>
      <h3>{product.title}</h3>
      <p>${product.price}</p>
      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
        Buy On Amazon
      </a>
    </div>
  );
};

export default ProductCard;