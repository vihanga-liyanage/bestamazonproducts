import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Rewards from './pages/Rewards';
import './styles/global.css';
import Home from './pages/Home';
import Deals from './pages/Deals';

const App: React.FC = () => {

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/rewards" 
            element={<Rewards />} 
          />
          <Route 
            path="/deals" 
            element={<Deals />} 
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
