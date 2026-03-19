import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Public Pages
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MenuSection from "./components/MenuSection";
import OrderSection from "./components/OrderSection";
import TrackerSection from "./components/TrackerSection";
import Footer from "./components/Footer";

// Admin Pages
import Login from "./pages/admin/Login";
import DashboardLayout from "./pages/admin/DashboardLayout";
import Overview from "./pages/admin/Overview";
import Orders from "./pages/admin/Orders";
import Menu from "./pages/admin/Menu";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0804] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// Public Store Page
function Store() {
  const [latestOrder, setLatestOrder] = useState<{ orderId: string; customerName: string } | null>(null);

  return (
    <CartProvider>
      <main>
        <Navbar />
        <HeroSection />
        <MenuSection />
        <OrderSection
          onOrderPlaced={(order) =>
            setLatestOrder({ orderId: order.orderId, customerName: order.customerName })
          }
        />
        <TrackerSection latestOrder={latestOrder} />
        <Footer />
      </main>
    </CartProvider>
  );
}

import { useState } from "react";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Store */}
          <Route path="/" element={<Store />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu" element={<Menu />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
