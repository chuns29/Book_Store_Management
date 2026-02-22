import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const AdminStatsPage = () => {
  const [stats, setStats] = useState({ orders: [], topCustomers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading statistics...</div>;

  // Tính tổng doanh thu toàn hệ thống
  const totalRevenue = stats.orders.reduce((total, order) => {
      return total + order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, 0);

  return (
    <main className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Admin Dashboard</h1>

      {/* --- CARDS TỔNG QUAN --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium opacity-80">Total Revenue</h3>
              <p className="text-4xl font-bold mt-2">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium opacity-80">Total Orders</h3>
              <p className="text-4xl font-bold mt-2">{stats.orders.length}</p>
          </div>
          <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium opacity-80">Top Customer</h3>
              <p className="text-2xl font-bold mt-2 truncate">
                  {stats.topCustomers.length > 0 ? stats.topCustomers[0].name : 'N/A'}
              </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- TOP KHÁCH HÀNG (Cột trái - nhỏ hơn) --- */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow border border-gray-200 h-fit">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">🏆 Loyal Customers</h2>
              <div className="space-y-4">
                  {stats.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}>
                                  {index + 1}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-700">{customer.name}</p>
                                  <p className="text-xs text-gray-500">{customer.orderCount} orders</p>
                              </div>
                          </div>
                          <span className="font-bold text-green-600">${customer.totalSpent.toFixed(2)}</span>
                      </div>
                  ))}
                  {stats.topCustomers.length === 0 && <p className="text-gray-500">No data yet.</p>}
              </div>
          </div>

          {/* --- DANH SÁCH ĐƠN HÀNG (Cột phải - lớn hơn) --- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">📦 Recent Orders</h2>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="text-gray-500 text-sm border-b">
                              <th className="py-2">Order ID</th>
                              <th className="py-2">Customer</th>
                              <th className="py-2">Date</th>
                              <th className="py-2 text-right">Total</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm">
                          {stats.orders.map(order => {
                              const orderTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                              return (
                                  <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
                                      <td className="py-3 font-mono text-blue-600">#{order._id.toString().slice(-6).toUpperCase()}</td>
                                      <td className="py-3 font-medium">{order.user.name}</td>
                                      <td className="py-3 text-gray-500">
                                          {order.date ? new Date(order.date).toLocaleDateString('en-US') : 'N/A'}
                                      </td>
                                      <td className="py-3 text-right font-bold text-slate-800">${orderTotal.toFixed(2)}</td>
                                  </tr>
                              );
                          })}
                          {stats.orders.length === 0 && (
                              <tr><td colSpan="4" className="py-4 text-center text-gray-500">No orders found.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

      </div>
    </main>
  );
};

export default AdminStatsPage;