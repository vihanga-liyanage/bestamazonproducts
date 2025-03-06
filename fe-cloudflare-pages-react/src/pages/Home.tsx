import React from 'react';
import Banner from '../components/Banner';
import '../styles/global.css';
import ProductGridWithSidebar from '../components/ProductGridWithSidebar';

const Home: React.FC = () => {

  return (
    <div className="app">
      <Banner title="🔥 Exclusive Deals Today!" subtitle="Hurry, these offers won’t last long!" />
      <ProductGridWithSidebar productType={''} />
    </div>
  );
};

export default Home;
