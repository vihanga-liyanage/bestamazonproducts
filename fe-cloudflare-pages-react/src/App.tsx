import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductGrid from './components/ProductGrid';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import './styles/global.css';

export interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  affiliate_url: string;
  customerReviews: number;
  bestSellersRank: number;
}

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [sortBy, setSortBy] = useState<string>('priceHighLow');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        const newMaxPrice = Math.max(...data.map((p: Product) => p.price), 0) + 100;
        setMaxPrice(newMaxPrice);
        setPriceRange([0, newMaxPrice]);
        setTempPriceRange([0, newMaxPrice]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'priceLowHigh':
        return a.price - b.price;
      case 'priceHighLow':
        return b.price - a.price;
      case 'customerReviews':
        return b.customerReviews - a.customerReviews;
      case 'bestSellers':
        return a.bestSellersRank - b.bestSellersRank;
      default:
        return 0;
    }
  });

  const filteredProducts = sortedProducts.filter(
    (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
  );

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
        <ProductGrid products={filteredProducts} loading={loading} error={error}/>
      </div>
      <Footer />
    </div>
  );
};

export default App;
