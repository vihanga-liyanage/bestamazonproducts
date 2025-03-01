import React from 'react';
import '../styles/Rewards.css';
import ProductGrid from '../components/ProductGrid';
import useProducts from '../hooks/useProducts';

const Rewards: React.FC = () => {
  const { products, loading, error } = useProducts();

  return (
    <div className="rewards-page">
      <section className="hero">
        <h1>Get Free Amazon Products!</h1>
        <p>Order a product, leave a 5-star review, and get your money back!</p>
      </section>

      <section className="steps">
        <h2>How It Works</h2>
        <div className="step">
          <span>1️⃣</span> Pick a product from our list.
        </div>
        <div className="step">
          <span>2️⃣</span> Order using our provided Amazon link.
        </div>
        <div className="step">
          <span>3️⃣</span> Once delivered, submit a 5-star review with photos.
        </div>
        <div className="step">
          <span>4️⃣</span> Send us proof, and we’ll refund you 100% (including shipping & tax)!
        </div>
      </section>

      <section className="product-list">
        <h2>Available Products</h2>
        <ProductGrid products={products} loading={loading} error={error} />
      </section>

      <section className="cta">
        <h2>Ready to Get Free Products?</h2>
        <p>Start now and claim your first reward!</p>
        <button className="cta-button">Get Started</button>
      </section>
    </div>
  );
};

export default Rewards;
