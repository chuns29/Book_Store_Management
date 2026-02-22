import React, { useState, useEffect } from 'react';
import ReviewModal from '../components/ReviewModal';

const API_BASE_URL = 'http://localhost:5000';

const OrdersPage = ({ onViewDetail }) => {
  const [orders, setOrders] = useState([]);
  const [reviewProduct, setReviewProduct] = useState(null);

  // Hàm load dữ liệu (tách ra để gọi lại sau khi review xong)
  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">Order History</h1>
      
      {orders.length <= 0 ? ( 
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            No orders found.
        </div> 
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const totalOrderPrice = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const orderDate = order.date ? new Date(order.date).toLocaleString('en-US') : 'Unknown Date';
            
            return (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
                <div className="border-b pb-4 mb-4 flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                        <h2 className="font-bold text-lg text-slate-700">Order #{order._id.toString().slice(-6).toUpperCase()}</h2>
                        <p className="text-sm text-gray-500">{orderDate}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-2xl text-slate-800">${totalOrderPrice.toFixed(2)}</div>
                        <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Completed</span>
                    </div>
                </div>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {order.items.map(item => ( 
                      <div key={item._id} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                          <div className="flex flex-col">
                              {/* CLick vào tên để xem chi tiết */}
                              <span 
                                onClick={() => onViewDetail(item._id)}
                                className="font-medium text-slate-700 text-base cursor-pointer hover:text-blue-600 hover:underline transition"
                              >
                                {item.title}
                              </span> 
                              <span className="text-gray-500">{item.quantity} x ${item.price}</span>
                          </div>
                          
                          {/* LOGIC ẨN HIỆN NÚT REVIEW */}
                          {item.hasReviewed ? (
                              <span className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded border border-green-200">
                                  ✓ Reviewed
                              </span>
                          ) : (
                              <button 
                                onClick={() => setReviewProduct({ id: item._id, title: item.title })}
                                className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 px-3 py-1 rounded transition text-xs font-bold"
                              >
                                  Write Review
                              </button>
                          )}
                      </div> 
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewProduct && (
          <ReviewModal 
            productId={reviewProduct.id} 
            productName={reviewProduct.title}
            onClose={() => setReviewProduct(null)} 
            onReviewSubmitted={() => {
                setReviewProduct(null);
                fetchOrders(); // Load lại danh sách để cập nhật trạng thái 'Reviewed'
            }} 
          />
      )}
    </main>
  );
};

export default OrdersPage;