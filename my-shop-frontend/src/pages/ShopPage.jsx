import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx';

const API_BASE_URL = 'http://localhost:5000';

const CATEGORIES = [
  { id: 'All', name: 'All', icon: '📚' },
  { id: 'Fiction', name: 'Fiction', icon: '🎭' },
  { id: 'Non-Fiction', name: 'Non-Fiction', icon: '🧠' },
  { id: 'Technology', name: 'Technology', icon: '💻' },
  { id: 'Science', name: 'Science', icon: '🔬' },
  { id: 'History', name: 'History', icon: '🏛️' },
  { id: 'Fantasy', name: 'Fantasy', icon: '🐉' },
  { id: 'Romance', name: 'Romance', icon: '💘' },
  { id: 'Thriller', name: 'Thriller', icon: '🕵️' },
  { id: 'Business', name: 'Business', icon: '💼' },
  { id: 'Self-help', name: 'Self-Help', icon: '🌱' },
];

const ShopPage = ({ addToCart, searchQuery, onViewDetail }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  // State mới cho việc sắp xếp
  const [sortBy, setSortBy] = useState('latest'); 

  useEffect(() => {
    setLoading(true);
    
    let url = `${API_BASE_URL}/products?`;
    
    // Ghép các tham số vào URL
    if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
    }
    
    if (selectedCategory && selectedCategory !== 'All') {
        url += `genre=${encodeURIComponent(selectedCategory)}&`;
    }

    if (sortBy && sortBy !== 'latest') {
        url += `sort=${sortBy}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory, sortBy]); // Chạy lại khi bộ lọc thay đổi

  const handleCategoryClick = (categoryId) => {
      setSelectedCategory(categoryId);
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 animate-pulse">Loading library...</div>;

  return (
    <main className="container mx-auto p-6">
      
      {/* --- CATEGORIES --- */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-700 mb-4 px-2 border-l-4 border-blue-600">Explore Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
                <div 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group"
                >
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all duration-300 border-2
                        ${selectedCategory === cat.id 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-blue-300 scale-110' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:shadow-md'
                        }
                    `}>
                        {cat.icon}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-500'}`}>
                        {cat.name}
                    </span>
                </div>
            ))}
        </div>
      </section>

      {/* --- SORT BAR (THANH BỘ LỌC) --- */}
      <section className="mb-6 bg-gray-100 p-3 rounded-lg flex flex-wrap items-center gap-4">
          <span className="text-gray-600 font-medium">Sắp xếp theo:</span>
          
          <button 
            onClick={() => setSortBy('latest')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${sortBy === 'latest' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-gray-200'}`}
          >
            Mới Nhất
          </button>

          <button 
            onClick={() => setSortBy('sold')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${sortBy === 'sold' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-gray-200'}`}
          >
            Bán Chạy
          </button>

          <button 
            onClick={() => setSortBy('rating')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${sortBy === 'rating' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-gray-200'}`}
          >
            Đánh Giá Cao
          </button>

          <div className="relative">
              <select 
                value={sortBy.startsWith('price') ? sortBy : ''}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded text-sm font-medium border-none outline-none cursor-pointer ${sortBy.startsWith('price') ? 'bg-orange-500 text-white' : 'bg-white text-slate-700'}`}
              >
                  <option value="" disabled hidden>Giá</option>
                  <option value="price_asc" className="text-slate-800 bg-white">Giá: Thấp đến Cao</option>
                  <option value="price_desc" className="text-slate-800 bg-white">Giá: Cao đến Thấp</option>
              </select>
          </div>
      </section>

      {/* --- PRODUCT GRID --- */}
      {(searchQuery || selectedCategory !== 'All') && (
          <div className="mb-6 flex items-center gap-2">
              <span className="text-gray-500">Viewing:</span>
              {selectedCategory !== 'All' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                      Category: {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </span>
              )}
              {searchQuery && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                      Search: "{searchQuery}"
                  </span>
              )}
          </div>
      )}
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map(prod => (
            <ProductCard 
              key={prod._id} 
              product={prod} 
              isAdmin={false} 
              onAddToCart={addToCart}
              onViewDetail={onViewDetail} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 py-10 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-600 mb-2">No books found!</h1>
            <p className="text-gray-400">Try a different category or search term.</p>
            <button 
                onClick={() => { setSelectedCategory('All'); setSortBy('latest'); }}
                className="mt-4 text-blue-600 hover:underline font-medium"
            >
                View All Books
            </button>
        </div>
      )}
    </main>
  );
};

export default ShopPage;