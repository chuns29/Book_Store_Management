import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

const ReviewModal = ({ productId, productName, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login again.");
        return;
    }

    fetch(`${API_BASE_URL}/add-review`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ 
          productId: productId, 
          rating: rating, 
          comment: comment 
      })
    })
    .then(async res => {
        const data = await res.json();
        if (res.ok) {
            alert("Review submitted successfully!");
            onReviewSubmitted(); 
        } else {
            alert(`Error: ${data.message}`);
        }
    })
    .catch(err => alert("Server connection error."))
    .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-down">
        
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-white font-bold text-lg">Write a Review</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
            <p className="text-gray-600 mb-4">You are reviewing: <br/><span className="font-bold text-slate-800">{productName}</span></p>
            
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-4">
                    <select 
                        value={rating} 
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (Good)</option>
                        <option value="3">⭐⭐⭐ (Average)</option>
                        <option value="2">⭐⭐ (Poor)</option>
                        <option value="1">⭐ (Terrible)</option>
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
                <textarea 
                    rows="4" 
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="How was the product quality?..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                ></textarea>
            </div>

            <div className="flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-bold shadow
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;