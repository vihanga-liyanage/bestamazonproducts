import React, { useState } from 'react';
import '../styles/ProductCard.css';
import Sidebar from './Sidebar';
import ProductGrid from './ProductGrid';
import { filterProducts, sortProducts } from '../utils/productUtils';
import useProducts from '../hooks/useProducts';

interface Props {
  productType: string;
}

const ProductGridWithSidebar: React.FC<Props> = ({ productType }) => {

  const { products, maxPrice, error, loading } = useProducts(productType);
  const [sortBy, setSortBy] = useState<string>('priceHighLow');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPrice]);

  const sortedProducts = sortProducts(products, sortBy);
  const filteredProducts = filterProducts(sortedProducts, priceRange);
  
  return (
    <div className="main-content">
      <Sidebar 
        tempPriceRange={tempPriceRange} 
        setTempPriceRange={setTempPriceRange} 
        applyFilters={() => setPriceRange(tempPriceRange)}
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
