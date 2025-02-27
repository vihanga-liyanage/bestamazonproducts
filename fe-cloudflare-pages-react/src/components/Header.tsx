import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import '../styles/Header.css';
import logo from '../assets/sp-logo.png';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Smarter Picks Logo" className="logo" />
        <h1 className="site-title">Smarter Picks</h1>
      </div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/deals">Deals</Link>
        <Link to="/rewards">Rewards</Link>
      </nav>
      <div className="search-bar">
        <input type="text" placeholder="Search for deals..." />
        <button>Search</button>
      </div>
    </header>
  );
};

export default Header;
