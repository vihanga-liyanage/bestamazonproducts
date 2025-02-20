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
    </aside>
  );
};

export default Sidebar;