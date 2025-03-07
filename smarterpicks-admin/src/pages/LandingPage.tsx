import React from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage: React.FC = () => {
  const { user } = useUser();
  const userHasAdminRole = user?.publicMetadata?.role === "admin";

  if (user && userHasAdminRole) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="landing-container">
      <h1>Smarter Picks</h1>
      <h2>Sign in to the admin panel!</h2>
      {!user ? (
        <SignInButton />
      ) : (
        <div className="error-message">
          <p>Access Denied: You do not have admin privileges.</p>
          <SignOutButton />
        </div>
      )}
    </div>
  );
};

export default LandingPage;
