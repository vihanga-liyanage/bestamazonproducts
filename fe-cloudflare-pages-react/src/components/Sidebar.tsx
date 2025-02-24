import React from 'react';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <h3>Filters</h3>
      <ul>
        <li>Price Range</li>
        <li>Categories</li>
        <li>Top Deals</li>
      </ul>
      <div className="message-box">
        This site is supported by Amazon affiliate links - your support helps us keep going! 💕
      </div>
    </aside>
  );
};

export default Sidebar;