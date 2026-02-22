import React, { useState } from 'react';

const Navigation = ({ currentView, onViewChange, cartCount, onSearch, isAdmin, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getLinkClass = (viewName) => {
    const isActive = viewName === 'admin' 
        ? currentView.startsWith('admin') && currentView !== 'admin-stats' // Highlight khi ở trang quản lý sản phẩm
        : currentView === viewName;

    const baseClass = "px-4 py-2 hover:text-yellow-300 transition-colors cursor-pointer font-medium";
    return isActive ? `${baseClass} text-yellow-300 border-b-2 border-yellow-300` : `${baseClass} text-white`;
  };

  // Helper riêng cho nút Stats
  const getStatsLinkClass = () => {
      const baseClass = "px-4 py-2 hover:text-yellow-300 transition-colors cursor-pointer font-medium";
      return currentView === 'admin-stats' ? `${baseClass} text-yellow-300 border-b-2 border-yellow-300` : `${baseClass} text-white`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
        {/* Logo */}
        <div 
            className="text-2xl font-bold tracking-wider cursor-pointer flex items-center gap-2"
            onClick={() => { onViewChange('shop'); onSearch(''); setSearchTerm(''); }}
        >
            📚 BOOKSTORE
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-lg mx-4 hidden md:block">
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search by Title or Author..." 
                    className="w-full py-2 px-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-slate-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>
        </form>
        
        {/* Menu Items */}
        <nav className="flex items-center">
          <ul className="flex list-none m-0 p-0 gap-1 items-center">
            <li onClick={() => onViewChange('shop')} className={getLinkClass('shop')}>Shop</li>
            <li onClick={() => onViewChange('cart')} className={getLinkClass('cart')}>
              Cart {cartCount > 0 && <span className="bg-yellow-500 text-slate-900 font-bold text-xs px-2 py-0.5 rounded-full ml-1">{cartCount}</span>}
            </li>
            <li onClick={() => onViewChange('orders')} className={getLinkClass('orders')}>Orders</li>
            
            {/* Admin Links */}
            {isAdmin && (
                <>
                    <li onClick={() => onViewChange('admin-products')} className={getLinkClass('admin')}>Manage Products</li>
                    <li onClick={() => onViewChange('admin-stats')} className={getStatsLinkClass()}>Statistics</li>
                </>
            )}

            {/* Logout */}
            <li onClick={onLogout} className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded cursor-pointer transition text-sm font-bold">
                Logout
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;