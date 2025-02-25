import React from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductGrid.css';
import { Product } from '../App';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: any;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, error }) => {

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;