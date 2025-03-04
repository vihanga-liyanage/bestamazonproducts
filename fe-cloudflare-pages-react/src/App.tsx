import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Rewards from './pages/Rewards';
import Home from './pages/Home';
import Deals from './pages/Deals';
import './styles/global.css';
import MyRewards from './pages/MyRewards';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App: React.FC = () => {
  return (
    <ClerkProvider 
      publishableKey={clerkPublishableKey}
      appearance={{
        variables: {
          colorPrimary: '#ff9900'
        }
      }}
    >
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/my-rewards" element={<MyRewards />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ClerkProvider>
  );
};

export default App;
