import React from "react";
import { UserButton } from "@clerk/clerk-react";

const Header: React.FC = () => {
  return (
    <header className="admin-header">
      <h1>Admin Dashboard</h1>
      <div className="user-section">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
};

export default Header;
