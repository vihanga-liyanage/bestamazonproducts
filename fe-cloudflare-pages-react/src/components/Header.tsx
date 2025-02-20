import React from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">Amazon Affiliate</div>
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/deals">Deals</a>
        <a href="/categories">Categories</a>
      </nav>
      <div className="search-bar">
        <input type="text" placeholder="Search for deals..." />
        <button>Search</button>
      </div>
    </header>
  );
};

export default Header;