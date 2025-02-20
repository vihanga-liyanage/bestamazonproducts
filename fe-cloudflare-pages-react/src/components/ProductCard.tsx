import React from 'react';

// Define the Product interface
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_url: string;
}

// Define the props for the ProductCard component
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <img src={product.image_url} alt={product.title} style={{ width: '100px' }} />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
        Buy Now
      </a>
    </div>
  );
};

export default ProductCard;
