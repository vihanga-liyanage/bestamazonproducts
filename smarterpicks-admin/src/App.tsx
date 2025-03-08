import React, { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, RedirectToSignIn, useUser } from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardHome from "./pages/DashboardHome";
import ProductManagement from "./pages/ProductManagement";
import UserManagement from "./pages/UserManagement";
import RewardRequestManagement from "./pages/RewardRequestManagement";
import LandingPage from "./pages/LandingPage";
import "./styles/AdminDashboard.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AdminAuth: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const userHasAdminRole = user?.publicMetadata?.role === "admin";

  if (!user) {
    return <RedirectToSignIn />;
  }

  if (!userHasAdminRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-dashboard">
      <Header />
      <div className="admin-container">
        <Sidebar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminAuth><DashboardHome /></AdminAuth>} />
          <Route path="/products" element={<AdminAuth><ProductManagement /></AdminAuth>} />
          <Route path="/users" element={<AdminAuth><UserManagement /></AdminAuth>} />
          <Route path="/reward-requests" element={<AdminAuth><RewardRequestManagement /></AdminAuth>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ClerkProvider>
  );
};

export default App;
