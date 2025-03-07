import React from "react";
import { Link } from "react-router-dom";
import "../styles/AdminDashboard.css";

const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/reward-requests">Reward Requests</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
