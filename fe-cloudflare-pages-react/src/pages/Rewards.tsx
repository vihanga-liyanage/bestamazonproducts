import React from 'react';
import '../styles/Rewards.css';
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react';
import Banner from '../components/Banner';
import ProductGridWithSidebar from '../components/ProductGridWithSidebar';

const Rewards: React.FC = () => {

  return (
    <>
      <Banner title="Get Free Amazon Products!" subtitle="Order a product, leave a 5-star review, and get your money back!" />
      
      <SignedIn>
        <ProductGridWithSidebar productType='rewards' />
      </SignedIn>

      <SignedOut>
        <div className="rewards-page">
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

          <section className="cta">
            <h2>Ready to Get Free Products?</h2>
            <p>Start now and claim your first reward!</p>
            <SignUpButton mode='modal'>
              <button className="cta-button">Get Started</button>
            </SignUpButton>
          </section>
        </div>
      </SignedOut>
    </>
  );
};

export default Rewards;
