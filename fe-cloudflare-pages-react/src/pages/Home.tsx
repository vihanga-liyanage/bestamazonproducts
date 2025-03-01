import React, { useState } from 'react';
import ProductGrid from '../components/ProductGrid';
import Banner from '../components/Banner';
import Sidebar from '../components/Sidebar';
import '../styles/global.css';
import useProducts from '../hooks/useProducts';
import { sortProducts, filterProducts } from '../utils/productUtils';

const Home: React.FC = () => {

  const { products, maxPrice, error, loading } = useProducts();
  const [sortBy, setSortBy] = useState<string>('priceHighLow');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPrice]);

  const sortedProducts = sortProducts(products, sortBy);
  const filteredProducts = filterProducts(sortedProducts, priceRange);

  return (
    <div className="app">
      <Banner title="🔥 Exclusive Deals Today!" subtitle="Hurry, these offers won’t last long!" />
      <div className="main-content">
        <Sidebar 
          tempPriceRange={tempPriceRange} 
          setTempPriceRange={setTempPriceRange} 
          applyFilters={() => setPriceRange(tempPriceRange)}
          maxPrice={maxPrice}
          setSortBy={setSortBy}
        />
        <ProductGrid products={filteredProducts} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default Home;
