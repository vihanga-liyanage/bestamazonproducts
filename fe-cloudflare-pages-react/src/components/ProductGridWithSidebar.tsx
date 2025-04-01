import React, { useState } from 'react';
import '../styles/ProductCard.css';
import Sidebar from './Sidebar';
import ProductGrid from './ProductGrid';
import { filterProducts, sortProducts } from '../utils/productUtils';
import useProducts from '../hooks/useProducts';

interface Props {
  isReward: number;
}

const ProductGridWithSidebar: React.FC<Props> = ({ isReward }) => {
  const { products, maxPrice, error, loading } = useProducts(isReward);
  const [sortBy, setSortBy] = useState<string>('priceHighLow');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedProducts = sortProducts(products, sortBy);
  const filteredProducts = filterProducts(sortedProducts, priceRange, searchQuery);
  
  return (
    <div className="main-content">
      <Sidebar 
        tempPriceRange={tempPriceRange} 
        setTempPriceRange={setTempPriceRange} 
        applyFilters={(query: string) => {
          setPriceRange(tempPriceRange);
          setSearchQuery(query);
        }}
        maxPrice={maxPrice}
        setSortBy={setSortBy}
      />
      <div className="scrollable-grid">
        <ProductGrid products={filteredProducts} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default ProductGridWithSidebar;
