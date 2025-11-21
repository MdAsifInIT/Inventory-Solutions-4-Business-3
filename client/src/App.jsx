import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ToastContainer from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminLayout from './layouts/AdminLayout';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import AdminDashboard from './pages/admin/Dashboard';
import CustomerList from './pages/admin/CustomerList';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/" />;
    }
    
    return children;
};

function Dashboard() {
    const { user, logout } = useAuth();
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.name}</h1>
            <p className="mb-4">Role: {user.role}</p>
            <button 
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Logout
            </button>
        </div>
    );
}

function App() {
  return (
    <AuthProvider>
        <CartProvider>
            <Router>
                <ToastContainer />
                <AnimatePresence mode="wait">
                    <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Public Storefront Routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductCatalog />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route 
                            path="/checkout" 
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/order-success" 
                            element={
                                <ProtectedRoute>
                                    <OrderSuccess />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                    </Route>

                    {/* Admin Routes */}
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute roles={['Admin', 'Staff']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="orders" element={<div>Orders Management (Coming Soon)</div>} />
                        <Route path="customers" element={<CustomerList />} />
                    </Route>
                </Routes>
                </AnimatePresence>
            </Router>
        </CartProvider>
    </AuthProvider>
  );
}

export default App;
