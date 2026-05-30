import React from 'react';
import { MapPin, Share2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const CarSummaryCard = ({ vehicle }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 w-full flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            {vehicle.year} {vehicle.brand} {vehicle.model}
          </h1>
        </div>
        
        <p className="text-sm text-slate-500 mb-4">{vehicle.type} • Variant Details Missing</p>

        {/* Small Info Row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-600 mb-6 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
            <span>{vehicle.transmission || 'Automatic'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
            <span>{vehicle.fuel || 'Petrol'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
            <span>1st Owner</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
            <span>{vehicle.mileage || '15,000 km'}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[18px] font-bold text-slate-600">Rs.</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight">{vehicle.pricePerDay}</span>
          </div>
        </div>


      </div>

      <div>
        {/* Primary CTA */}
        <Button 
          className="w-full py-4 bg-gradient-to-r from-[#2170ed] to-[#3ca0f0] hover:from-[#1b5bbf] hover:to-[#2e7dd1] text-white font-bold text-sm rounded-lg shadow-md shadow-blue-500/20 transition-all mb-4 border-0"
          onClick={() => {
            const token = localStorage.getItem("token");
            if (!token) {
              navigate('/signup');
            } else {
              navigate(`/book/${vehicle._id}`);
            }
          }}
        >
          Rent Now
        </Button>

        {/* Location & Compare */}
        <div className="flex items-center justify-between text-[12px] text-slate-500 font-medium pt-4 border-t border-slate-100">
           <div className="flex items-center gap-1.5">
             <MapPin size={14} className="text-slate-400" />
             <span>{vehicle.location || 'Kathmandu, Nepal'}</span>
           </div>
           <label className="flex items-center gap-1.5 cursor-pointer">
             <input type="checkbox" className="accent-orange-500 w-3.5 h-3.5 rounded-sm" />
             <span>Compare</span>
           </label>
        </div>
      </div>
    </div>
  );
};

export default CarSummaryCard;
