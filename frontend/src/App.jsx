import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }         from './context/AuthContext';
import { CartProvider }         from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute           from './components/common/ProtectedRoute';
import Navbar                   from './components/common/Navbar';
import LoginPage                from './pages/LoginPage';
import DashboardPage            from './pages/DashboardPage';
import SalesPage                from './pages/SalesPage';
import ReturnsPage              from './pages/ReturnsPage';
import ReportsPage              from './pages/ReportsPage';
import ProductsPage             from './pages/ProductsPage';
import CustomersPage            from './pages/CustomersPage';

// Layout wraps every protected page — adds the top navbar
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    // AuthProvider must wrap everything — login state is needed everywhere
    <AuthProvider>
      {/* NotificationProvider lets any component show toast messages */}
      <NotificationProvider>
        {/* CartProvider manages the active sale cart */}
        <CartProvider>
          <BrowserRouter>
            <Routes>

              {/* Public route — no login needed */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected routes — redirect to /login if not authenticated */}
              <Route path="/sales" element={
                <ProtectedRoute>
                  <Layout><SalesPage /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/returns" element={
                <ProtectedRoute>
                  <Layout><ReturnsPage /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout><ReportsPage /></Layout>
                </ProtectedRoute>
              } />

              {/* Manager-only route */}
              <Route path="/products" element={
                <ProtectedRoute requireManager>
                  <Layout><ProductsPage /></Layout>
                </ProtectedRoute>
              } />

              {/* Customers route */}
              <Route path="/customers" element={
                <ProtectedRoute>
                  <Layout><CustomersPage /></Layout>
                </ProtectedRoute>
              } />

              {/* Any unknown URL goes to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}