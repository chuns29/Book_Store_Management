import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';

// Import các trang
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ProductForm from './pages/ProductForm';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminStatsPage from './pages/AdminStatsPage'; // Import mới

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authView, setAuthView] = useState('login'); 

  const [currentView, setCurrentView] = useState('shop');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [editProductData, setEditProductData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // ... (Giữ nguyên các hàm useEffect, loginHandler, logoutHandler, fetchCartCount, addToCart, handleViewDetail, handleEditProductClick, handleSearch) ...
  useEffect(() => {
      const storedToken = localStorage.getItem('token');
      const storedExpiryDate = localStorage.getItem('expiryDate');
      const storedUserId = localStorage.getItem('userId');
      const storedRole = localStorage.getItem('role');

      if (!storedToken || !storedExpiryDate) return;
      if (new Date(storedExpiryDate) <= new Date()) {
          logoutHandler();
          return;
      }
      setToken(storedToken);
      setIsAuth(true);
      setUserId(storedUserId);
      setIsAdmin(storedRole === 'admin');
      fetchCartCount(storedToken);
  }, []);

  const loginHandler = (token, userId, role) => {
      setToken(token);
      setIsAuth(true);
      setUserId(userId);
      setIsAdmin(role === 'admin');
      
      const remainingMilliseconds = 60 * 60 * 1000; 
      const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('expiryDate', expiryDate.toISOString());
      
      setCurrentView('shop');
      fetchCartCount(token);
  };

  const logoutHandler = () => {
      setIsAuth(false);
      setToken(null);
      setIsAdmin(false);
      localStorage.removeItem('token');
      localStorage.removeItem('expiryDate');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      setCartCount(0);
  };

  const fetchCartCount = (tokenToUse) => {
    const activeToken = tokenToUse || token || localStorage.getItem('token');
    if (!activeToken) return;

    fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': 'Bearer ' + activeToken }
    })
      .then(res => res.json())
      .then(data => {
        const products = data.products || [];
        const totalItems = products.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalItems);
      })
      .catch(err => console.error(err));
  };

  const addToCart = (productId, quantity = 1) => {
    const activeToken = token || localStorage.getItem('token');
    
    fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + activeToken
      },
      body: JSON.stringify({ productId: productId, quantity: quantity })
    })
    .then(res => { 
        if(res.ok) { 
            alert(`Added ${quantity} item(s) to cart!`); 
            fetchCartCount(activeToken);
        } else {
            alert("Failed to add to cart. Please login again.");
        }
    })
    .catch(err => console.error(err));
  };

  const handleViewDetail = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  const handleEditProductClick = (productId) => {
    const activeToken = token || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/products/${productId}`, {
        headers: { 'Authorization': 'Bearer ' + activeToken } 
    })
      .then(res => res.json())
      .then(data => { 
          setEditProductData(data.product); 
          setCurrentView('admin-edit-product'); 
      });
  };

  const handleSearch = (term) => {
      setSearchQuery(term);
      setCurrentView('shop');
  };

  if (!isAuth) {
      if (authView === 'signup') {
          return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
      }
      return <LoginPage onLogin={loginHandler} onSwitchToSignup={() => setAuthView('signup')} />;
  }

  const renderView = () => {
    switch(currentView) {
      case 'shop':
        return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
      case 'product-detail':
        return <ProductDetailPage productId={selectedProductId} onAddToCart={addToCart} onBack={() => setCurrentView('shop')} />;
      case 'cart':
        return <CartPage onCartChange={() => fetchCartCount()} />;
      case 'orders':
        return <OrdersPage onViewDetail={handleViewDetail} />;
        
      // --- ROUTE ADMIN ---
      case 'admin-products':
        if (!isAdmin) return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
        return <AdminPage onEditProduct={handleEditProductClick} onNavigateToAdd={() => setCurrentView('admin-add-product')} />;
      case 'admin-add-product':
        if (!isAdmin) return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
        return <ProductForm editing={false} onFinish={() => setCurrentView('admin-products')} />;
      case 'admin-edit-product':
        if (!isAdmin) return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
        return <ProductForm editing={true} productToEdit={editProductData} onFinish={() => setCurrentView('admin-products')} />;
      
      // --- ROUTE MỚI: Admin Statistics ---
      case 'admin-stats':
        if (!isAdmin) return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
        return <AdminStatsPage />;

      default:
        return <ShopPage addToCart={addToCart} searchQuery={searchQuery} onViewDetail={handleViewDetail} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        cartCount={cartCount} 
        onSearch={handleSearch} 
        isAdmin={isAdmin} 
        onLogout={logoutHandler} 
      />
      {renderView()}
    </div>
  );
}