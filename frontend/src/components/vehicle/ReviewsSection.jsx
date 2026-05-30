import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import { Button } from '../ui/Button';

const API = "http://localhost:5000";

const ReviewsSection = ({ vehicle }) => {
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!vehicle?._id) return;
    fetchReviews();
    if (isLoggedIn) {
      checkCanReview();
    }
  }, [vehicle?._id, isLoggedIn]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/listing/${vehicle._id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/reviews/can-review/${vehicle._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(res.data.canReview);
    } catch (err) {
      console.error("Failed to check review eligibility", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError("Please provide a rating and a comment.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/reviews`, {
        vehicleId: vehicle._id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess("Your review has been submitted successfully!");
      setCanReview(false);
      setComment("");
      setRating(5);
      fetchReviews(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = vehicle?.averageRating || 0;
  const totalReviews = vehicle?.totalReviews || 0;

  // Calculate rating breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  if (loading) {
    return <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse h-48"></div>;
  }

  return (
    <div id="reviews" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-black text-slate-900 mb-6">Reviews & Ratings</h2>

      {/* Summary Box */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-slate-50 border border-slate-100 rounded-lg p-6">
        <div className="text-center md:text-left md:border-r border-slate-200 md:pr-8">
           <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
             <span className="text-4xl font-black text-slate-900">{avgRating.toFixed(1)}</span>
             <Star className="fill-amber-400 text-amber-400" size={28} />
           </div>
           <p className="text-sm text-slate-500 font-medium">Based on {totalReviews} reviews</p>
        </div>
        
        <div className="flex-1 w-full grid gap-2">
           {[5, 4, 3, 2, 1].map((star) => {
             const count = ratingCounts[star];
             const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
             return (
               <div key={star} className="flex items-center gap-3">
                 <div className="flex items-center gap-1 w-10 text-xs font-bold text-slate-600">
                   {star} <Star size={10} className="fill-slate-400 text-slate-400" />
                 </div>
                 <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                   <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                 </div>
                 <div className="w-8 text-right text-xs text-slate-500 font-medium">{count}</div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Review Form or Eligibility Message */}
      <div className="mb-8">
        {canReview ? (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-orange-500" />
              Write a Review
            </h3>
            
            {error && <div className="p-3 mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}
            {success && <div className="p-3 mb-4 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg">{success}</div>}
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star size={24} className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Comment</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this vehicle..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none min-h-[100px] resize-y"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={submitting} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20">
                {submitting ? "Submitting..." : "Submit Review"} <Send size={14} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-center">
            <p className="text-sm text-slate-500 font-medium">
              You can review this car only after completing a booking.
            </p>
          </div>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-6">
         {reviews.length === 0 ? (
           <p className="text-sm text-slate-500 text-center py-4">No reviews yet for this vehicle.</p>
         ) : (
           reviews.map((review) => {
             const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
             return (
               <div key={review._id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                       {review.user?.name ? review.user.name.substring(0, 1) : "U"}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-900">{review.user?.name || "Anonymous User"}</h4>
                        <p className="text-[11px] text-slate-500">{date}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <div className="flex gap-0.5 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold items-center">
                        {review.rating} <Star size={10} className="fill-white" />
                     </div>
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-3">"{review.comment}"</p>
               </div>
             )
           })
         )}
      </div>
    </div>
  );
};

export default ReviewsSection;
