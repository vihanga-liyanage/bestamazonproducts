import React from 'react';
import Header from './components/Header';
import Banner from './components/Banner';
import ProductGrid from './components/ProductGrid';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <Banner />
      <div className="main-content">
        <Sidebar />
        <ProductGrid />
      </div>
      <Footer />
    </div>
  );
};

export default App;