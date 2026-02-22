import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const CartPage = ({ onCartChange }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Hàm helper để lấy token
  const getToken = () => localStorage.getItem('token');

  const fetchCart = () => {
    fetch(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
    })
      .then(res => res.json())
      .then(data => {
        setCartItems(data.products || []);
        setLoading(false);
        if (onCartChange) onCartChange();
      })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQuantity = (prodId, newQty) => {
      if (newQty < 1) return; 
      setCartItems(prev => prev.map(item => item._id === prodId ? { ...item, quantity: newQty } : item));

      fetch(`${API_BASE_URL}/cart-update-quantity`, {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + getToken() // Thêm Token
          },
          body: JSON.stringify({ productId: prodId, quantity: newQty })
      }).then(res => {
          if(res.ok) { if (onCartChange) onCartChange(); } else { fetchCart(); }
      });
  };

  // ... (handleToggleSelect, handleSelectAll giữ nguyên)
  const handleToggleSelect = (prodId) => {
      setSelectedIds(prev => prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]);
  };
  const handleSelectAll = (e) => {
      setSelectedIds(e.target.checked ? cartItems.map(item => item._id) : []);
  };

  const handleDeleteItem = (prodId) => {
    fetch(`${API_BASE_URL}/cart-delete-item`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken() 
      },
      body: JSON.stringify({ productId: prodId })
    }).then(res => { 
        if(res.ok) { setSelectedIds(prev => prev.filter(id => id !== prodId)); fetchCart(); }
    });
  };

  const handleDeleteSelected = () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Remove ${selectedIds.length} item(s)?`)) {
        fetch(`${API_BASE_URL}/cart-delete-items`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken() 
            },
            body: JSON.stringify({ productIds: selectedIds })
          }).then(res => { if(res.ok) { setSelectedIds([]); fetchCart(); } });
      }
  };

  const handleOrder = () => {
    if (selectedIds.length === 0) { alert("Please select items."); return; }

    fetch(`${API_BASE_URL}/create-order`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken() 
      },
      body: JSON.stringify({ productIds: selectedIds })
    })
    .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
            alert("Order placed successfully!");
            setSelectedIds([]); 
            fetchCart(); 
        } else {
            alert(`ORDER FAILED:\n${data.message}`);
        }
    })
    .catch(err => alert("Network error"));
  };

  // ... (Phần render UI giữ nguyên)
  const totalAmount = cartItems
    .filter(item => selectedIds.includes(item._id))
    .reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (loading) return <div className="text-center mt-10">Loading cart...</div>;

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">Your Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <input type="checkbox" className="w-5 h-5 cursor-pointer accent-blue-600" onChange={handleSelectAll} checked={cartItems.length > 0 && selectedIds.length === cartItems.length} />
                  <span className="font-semibold text-gray-700">Select All ({cartItems.length})</span>
              </div>
              {selectedIds.length > 0 && (
                  <button onClick={handleDeleteSelected} className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold text-sm transition">
                      Delete Selected
                  </button>
              )}
          </div>
          <ul className="divide-y divide-gray-100">
            {cartItems.map(p => (
              <li key={p._id} className="flex flex-col sm:flex-row items-center p-6 gap-4 hover:bg-slate-50 transition">
                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-blue-600" checked={selectedIds.includes(p._id)} onChange={() => handleToggleSelect(p._id)} />
                <div className="flex items-center gap-6 w-full">
                  <img src={p.imageUrl} alt={p.title} className="w-20 h-28 object-cover rounded shadow-md"/>
                  <div className="flex-grow">
                      <h1 className="text-lg font-bold text-slate-800">{p.title}</h1>
                      <p className="text-gray-500 text-sm mb-2">{p.author}</p>
                      <div className="flex items-center gap-2">
                          <button className="bg-gray-200 text-gray-600 w-8 h-8 rounded hover:bg-gray-300 font-bold" onClick={() => handleUpdateQuantity(p._id, p.quantity - 1)} disabled={p.quantity <= 1}>-</button>
                          <input type="number" className="w-12 text-center border border-gray-300 rounded py-1" value={p.quantity} onChange={(e) => handleUpdateQuantity(p._id, parseInt(e.target.value) || 1)} min="1"/>
                          <button className="bg-gray-200 text-gray-600 w-8 h-8 rounded hover:bg-gray-300 font-bold" onClick={() => handleUpdateQuantity(p._id, p.quantity + 1)}>+</button>
                          <span className="text-sm text-gray-500 ml-2">x ${p.price}</span>
                      </div>
                  </div>
                  <div className="text-right min-w-[100px]"><div className="font-bold text-lg">${(p.price * p.quantity).toFixed(2)}</div></div>
                </div>
                <button onClick={() => handleDeleteItem(p._id)} className="text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded transition">Remove</button>
              </li>
            ))}
          </ul>
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-lg text-slate-700">Selected: <span className="font-bold">{selectedIds.length}</span> items</div>
            <div className="flex items-center gap-6">
                <span className="text-2xl font-bold text-slate-800">Total: ${totalAmount.toFixed(2)}</span>
                <button onClick={handleOrder} disabled={selectedIds.length === 0} className={`font-bold py-3 px-8 rounded-lg shadow-lg transition ${selectedIds.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'}`}>Checkout Selected</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300"><p className="text-gray-500 text-lg">Your cart is empty.</p></div>
      )}
    </main>
  );
};

export default CartPage;