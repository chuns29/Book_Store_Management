import React from 'react';

const ProductCard = ({ product, isAdmin, onAddToCart, onEdit, onDelete, onViewDetail }) => {
  
  const handleDetailClick = () => {
    if (onViewDetail) {
      onViewDetail(product._id);
    }
  };

  return (
    <article className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      
      <div 
        onClick={handleDetailClick}
        className="relative h-64 w-full overflow-hidden bg-gray-100 flex items-center justify-center p-4 cursor-pointer"
      >
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="object-contain h-full w-full shadow-md transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {e.target.src='https://via.placeholder.com/300x400?text=No+Cover'}}
        />
        {!product.stock && !isAdmin && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-red-600 text-white px-3 py-1 font-bold rounded transform -rotate-12">OUT OF STOCK</span>
            </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2 flex justify-between items-start">
            <span className="text-xs uppercase font-bold text-blue-600 tracking-wide bg-blue-50 px-2 py-1 rounded">{product.genre || 'General'}</span>
            
            {/* HIỂN THỊ RATING & SOLD */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center text-yellow-500">
                    <span>★</span>
                    <span className="text-slate-700 ml-0.5 font-bold">{product.rating || 0}</span>
                </div>
                <span>|</span>
                <span>Sold: {product.sold || 0}</span>
            </div>
        </div>
        
        <h1 
            onClick={handleDetailClick}
            className="text-lg font-bold text-gray-800 line-clamp-2 mb-1 min-h-[3.5rem] cursor-pointer hover:text-blue-600 transition-colors" 
            title={product.title}
        >
            {product.title}
        </h1>
        
        <p className="text-gray-500 text-sm mb-3 italic">by {product.author || 'Unknown'}</p>
        
        <div className="mt-auto flex justify-between items-end border-t pt-3 border-gray-100">
            <div>
              <span className="text-xl font-bold text-slate-800">${product.price}</span>
            </div>
            {isAdmin && (
                <div className={`text-xs font-bold px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Stock: {product.stock || 0}
                </div>
            )}
        </div>
      </div>

      <div className="p-3 bg-gray-50 flex gap-2">
        {isAdmin ? (
          <>
            <button onClick={() => onEdit(product._id)} className="flex-1 py-2 bg-yellow-500 text-white text-sm font-medium rounded hover:bg-yellow-600 transition">Edit</button>
            <button onClick={() => onDelete(product._id)} className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition">Delete</button>
          </>
        ) : (
          <button 
              onClick={() => onAddToCart(product._id)}
              disabled={!product.stock || product.stock <= 0}
              className={`w-full py-2 text-white text-sm font-medium rounded transition flex items-center justify-center gap-2
                  ${(!product.stock || product.stock <= 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg'}
              `}
          >
            {(!product.stock || product.stock <= 0) ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;