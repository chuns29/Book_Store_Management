import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok) {
            // Đăng nhập thành công -> Gọi hàm onLogin từ App.jsx
            onLogin(data.token, data.userId, data.role);
        } else {
            setError(data.message);
        }
    })
    .catch(err => {
        console.error(err);
        setError('Login failed. Server error.');
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Login</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" name="username" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-bold">Login</button>
        </form>
        
        <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Don't have an account?</p>
            <button onClick={onSwitchToSignup} className="text-blue-600 hover:underline text-sm font-medium">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;