import React, { useState } from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductGrid from './components/ProductGrid';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import './styles/global.css';
import useProducts from './hooks/useProducts';
import { sortProducts, filterProducts } from './utils/productUtils';

const App: React.FC = () => {
  const { products, maxPrice, error, loading } = useProducts();
  const [sortBy, setSortBy] = useState<string>('priceHighLow');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPrice]);

  const sortedProducts = sortProducts(products, sortBy);
  const filteredProducts = filterProducts(sortedProducts, priceRange);

  return (
    <div className="app">
      <Header />
      <Banner />
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
      <Footer />
    </div>
  );
};

export default App;
