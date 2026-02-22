import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const ProductDetailPage = ({ productId, onAddToCart, onBack }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetail = () => {
    fetch(`${API_BASE_URL}/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const handleQuantityChange = (val) => {
      let newQty = Math.max(1, val);
      if (product.stock && newQty > product.stock) newQty = product.stock;
      setQuantity(newQty);
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  if (!product) return <div className="text-center mt-20 text-red-500">Book not found!</div>;

  return (
    <main className="container mx-auto p-6 max-w-5xl">
      <button onClick={onBack} className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Shop
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          <div className="bg-gray-50 p-8 flex items-center justify-center border-r border-gray-100">
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="max-h-[500px] shadow-2xl rounded-lg object-contain"
              onError={(e) => {e.target.src='https://via.placeholder.com/400x600?text=No+Cover'}}
            />
          </div>

          <div className="p-8 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {product.genre || 'General'}
                </span>
                
                {/* --- PHẦN RATING & SOLD --- */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                        <span>★</span>
                        <span>{product.rating || 0}</span>
                        <span className="text-gray-400 text-sm font-normal">({product.reviews ? product.reviews.length : 0} reviews)</span>
                    </div>
                    
                    <span className="text-gray-300 text-xl">|</span>
                    
                    <div className="text-gray-500 font-medium text-sm">
                        Sold: <span className="text-slate-800 font-bold text-lg">{product.sold || 0}</span>
                    </div>
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 leading-tight">{product.title}</h1>
            <p className="text-xl text-gray-500 mb-6 italic">by <span className="text-slate-700 font-semibold">{product.author}</span></p>

            <div className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-4">
              ${product.price}
              {product.stock > 0 ? (
                <span className="text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">In Stock ({product.stock})</span>
              ) : (
                <span className="text-sm font-normal bg-red-100 text-red-700 px-3 py-1 rounded-full">Out of Stock</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-t border-b border-gray-100 py-6">
              {product.description}
            </p>

            <div className="mt-auto">
                <div className="flex items-center gap-4 mb-4">
                    <label className="font-bold text-gray-700">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>-</button>
                        <input type="number" className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none" value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} min="1" max={product.stock}/>
                         <button className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-bold" onClick={() => handleQuantityChange(quantity + 1)} disabled={product.stock && quantity >= product.stock}>+</button>
                    </div>
                </div>

              <button 
                onClick={() => onAddToCart(product._id, quantity)} 
                disabled={!product.stock || product.stock <= 0}
                className={`w-full py-4 text-white text-lg font-bold rounded-lg transition shadow-lg
                  ${(!product.stock || product.stock <= 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}
                `}
              >
                {(!product.stock || product.stock <= 0) ? 'Out of Stock' : `Add ${quantity} Item(s) to Cart`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-gray-100">Customer Reviews</h2>
          
          <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.slice().reverse().map((review, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-800">{review.username || 'Anonymous'}</span>
                              <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('en-US')}</span>
                          </div>
                          <div className="text-yellow-500 mb-2">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                      </div>
                  ))
              ) : (
                  <p className="text-gray-500 italic text-center py-4">No reviews yet. Be the first to review!</p>
              )}
          </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;