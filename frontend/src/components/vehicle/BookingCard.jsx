import React from 'react';
import { Button } from '../ui/Button';
import { ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingCard = ({ vehicle, dates, setDates, totalPrice }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-[140px]">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Pricing Details</h3>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[18px] font-bold text-slate-600">Rs.</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{vehicle.pricePerDay}</span>
        </div>
      </div>

      {/* Simplified Date Picker (Optional for Marketplace, but keeping functionality) */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 mb-1">Pick-up Date</label>
          <input type="date" className="border border-slate-200 rounded-md p-2 text-sm text-slate-800 focus:outline-none focus:border-orange-500" min={new Date().toISOString().split('T')[0]} value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 mb-1">Return Date</label>
          <input type="date" className="border border-slate-200 rounded-md p-2 text-sm text-slate-800 focus:outline-none focus:border-orange-500" min={dates.start || new Date().toISOString().split('T')[0]} value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} />
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-slate-500">Rental Total</span>
            <span className="font-bold text-slate-800">Rs. {totalPrice}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-emerald-600 font-medium">
            <span>Taxes Included</span>
          </div>
        </div>
      )}

      <Button 
        className="w-full py-3.5 bg-gradient-to-r from-[#2170ed] to-[#3ca0f0] hover:from-[#1b5bbf] hover:to-[#2e7dd1] text-white font-bold text-sm rounded-lg shadow-md shadow-blue-500/20 transition-all mb-4 border-0"
        disabled={!vehicle.available}
        onClick={() => {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate('/signup');
          } else {
            navigate(`/book/${vehicle._id}`);
          }
        }}
      >
        {vehicle.available ? 'Rent Now' : 'Currently Unavailable'}
      </Button>

      <div className="space-y-3 pt-4 border-t border-slate-100">
         <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <MapPin size={16} className="text-slate-400" />
            <span>{vehicle.location || 'Kathmandu, Nepal'}</span>
         </div>

      </div>
    </div>
  );
};

export default BookingCard;
