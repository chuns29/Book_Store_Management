import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const ProductForm = ({ editing, productToEdit, onFinish }) => {
  const [formData, setFormData] = useState({
    title: '', imageUrl: '', price: '', description: '', productId: '',
    author: '', isbn: '', genre: '', publisher: '', stock: ''
  });

  useEffect(() => {
    if (editing && productToEdit) {
      setFormData({
        title: productToEdit.title,
        imageUrl: productToEdit.imageUrl,
        price: productToEdit.price,
        description: productToEdit.description,
        productId: productToEdit._id,
        author: productToEdit.author || '',
        isbn: productToEdit.isbn || '',
        genre: productToEdit.genre || '',
        publisher: productToEdit.publisher || '',
        stock: (productToEdit.stock !== undefined && productToEdit.stock !== null) ? productToEdit.stock : ''
      });
    }
  }, [editing, productToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editing ? `${API_BASE_URL}/admin/edit-product` : `${API_BASE_URL}/admin/add-product`;
    
    const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
    };

    const token = localStorage.getItem('token'); // Lấy Token

    fetch(url, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token // Gửi Token
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      onFinish();
    })
    .catch(err => console.error(err));
  };

  return (
    <main className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold mb-8 text-center text-slate-800 border-b pb-4">
            {editing ? 'Edit Book Details' : 'Add New Book'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Book Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                  <input type="text" name="author" required value={formData.author} onChange={handleChange} placeholder="e.g. J.K. Rowling"
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Genre</label>
                  <input type="text" name="genre" list="genres" value={formData.genre} onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                  <datalist id="genres">
                      <option value="Fiction"/>
                      <option value="Non-Fiction"/>
                      <option value="Technology"/>
                      <option value="Science"/>
                      <option value="History"/>
                      <option value="Fantasy"/>
                      <option value="Romance"/>
                      <option value="Thriller"/>
                      <option value="Business"/>
                      <option value="Self-Help"/>
                  </datalist>
              </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                  <input type="number" name="price" step="0.01" required value={formData.price} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock Qty</label>
                  <input type="number" name="stock" required value={formData.stock} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Publisher</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                  <input type="text" name="imageUrl" required value={formData.imageUrl} onChange={handleChange} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"/>
              </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea name="description" rows="5" required value={formData.description} onChange={handleChange} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          {editing && <input type="hidden" name="productId" value={formData.productId} />}
          
          <div className="flex gap-4 pt-4">
              <button type="button" onClick={onFinish} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition">Cancel</button>
              <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
              {editing ? 'Update Book' : 'Add Book'}
              </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProductForm;