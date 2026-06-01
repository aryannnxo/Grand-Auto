import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Share2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:5000";

const CarSummaryCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [userBooking, setUserBooking] = useState(null);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${API}/api/bookings/vehicle/${vehicle._id}/availability`, { headers });
        setIsAvailable(res.data.isAvailable);
        setUserBooking(res.data.userBooking || null);
      } catch (err) {
        console.error("Failed to check availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };
    if (vehicle?._id) {
      checkAvailability();
    }
  }, [vehicle]);


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 w-full flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black text-slate-900 leading-tight flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{vehicle.year} {vehicle.brand} {vehicle.model}</span>
            {!loadingAvailability && (
              userBooking ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                  <ShieldCheck size={12} /> Booked by you
                </span>
              ) : isAvailable ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} /> Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                  <Clock size={12} /> Currently Unavailable
                </span>
              )
            )}
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
        {loadingAvailability ? (
          <Button disabled className="w-full py-4 text-slate-500 bg-slate-100 font-bold text-sm rounded-lg mb-4">
            Checking...
          </Button>
        ) : userBooking ? (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
              <ShieldCheck size={12} /> Your booking for this vehicle
            </h3>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-500 font-medium">Status</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">{userBooking.status}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-slate-500 font-medium">Payment</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${userBooking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {userBooking.paymentStatus}
              </span>
            </div>

            <div className="space-y-2 mt-4">

              {["confirmed", "active", "confirmed-awaiting-cash-payment", "completed"].includes(userBooking.status) && (
                <Button
                  className="w-full text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                  onClick={() => navigate(`/request-mechanic?vehicleId=${vehicle._id}&bookingId=${userBooking._id}`)}
                >
                  Request Mechanic Help
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <Button
              className={`w-full py-4 text-white font-bold text-sm rounded-lg shadow-md transition-all mb-1 border-0 ${!isAvailable
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-[#2170ed] to-[#3ca0f0] hover:from-[#1b5bbf] hover:to-[#2e7dd1] shadow-blue-500/20'
                }`}
              disabled={!isAvailable}
              onClick={() => {
                if (!isAvailable) return;
                const token = localStorage.getItem("token");
                if (!token) {
                  navigate('/signup');
                } else {
                  navigate(`/book/${vehicle._id}`);
                }
              }}
            >
              {isAvailable ? 'Rent Now' : 'Currently Unavailable'}
            </Button>

            {!isAvailable && (
              <p className="text-[11px] text-center text-rose-500 font-medium mb-3">
                This vehicle is currently booked and unavailable.
              </p>
            )}
            {isAvailable && <div className="mb-3"></div>}
          </>
        )}

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
