import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = 'http://localhost:5000';

const AdminPage = ({ onEditProduct, onNavigateToAdd }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  // Hàm lấy token từ bộ nhớ
  const getToken = () => localStorage.getItem('token');

  const fetchProducts = () => {
    const token = getToken();
    // Gửi kèm Token để chứng minh là Admin
    fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (productId) => {
    if (!window.confirm("Are you sure you want to delete this book completely?")) return;
    
    const token = getToken();
    fetch(`${API_BASE_URL}/admin/delete-product`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token // Gửi kèm Token
      },
      body: JSON.stringify({ productId: productId })
    })
    .then(res => {
      if (res.ok) {
        fetchProducts();
      } else {
          alert("Failed to delete product. You might not have permission.");
      }
    })
    .catch(err => console.error(err));
  };

  const handleImportClick = () => {
      fileInputRef.current.click(); 
  };

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      
      const token = getToken();

      fetch(`${API_BASE_URL}/admin/import-products`, {
          method: 'POST',
          headers: {
              'Authorization': 'Bearer ' + token // Gửi kèm Token
          },
          body: formData, 
      })
      .then(res => res.json())
      .then(data => {
          alert(data.message);
          fetchProducts(); 
      })
      .catch(err => {
          console.error(err);
          alert("Import failed!");
      });
      
      event.target.value = null; 
  };

  return (
    <main className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Library Management</h1>
            <p className="text-gray-500">Manage your inventory, update stock, or add new books.</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept=".xlsx, .xls"
            />

            <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition font-bold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Import Excel
            </button>

            <button 
                onClick={onNavigateToAdd}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition font-bold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Manual
            </button>
          </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading inventory...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map(prod => (
            <ProductCard 
              key={prod._id} 
              product={prod} 
              isAdmin={true} 
              onEdit={onEditProduct} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h2 className="text-xl font-bold text-gray-400">Inventory is empty</h2>
            <p className="text-gray-400 mb-4">Start by adding your first book manually or import via Excel.</p>
        </div>
      )}
    </main>
  );
};

export default AdminPage;