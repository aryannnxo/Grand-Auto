import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Search, Fuel, Users, MapPin } from 'lucide-react';

const RentCarSearchPanel = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [fuel, setFuel] = useState('');
  const [passengers, setPassengers] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.append('search', location.trim());
    if (fuel) params.append('fuel', fuel);
    if (passengers) params.append('passengers', passengers);
    
    // Navigate to listings (fleet page) with the query parameters
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.1)]">
      {/* Top Active Tab */}
      <div className="flex mb-6">
        <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold shadow-md">
          <Car size={18} />
          <span>Rent a Car</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4">
        
        {/* Search Vehicle or Location */}
        <div className="flex-[1.5]">
          <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Search Vehicle or Location</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Brand, or Model..."
              className="w-full h-14 bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 rounded-xl pl-11 pr-4 text-sm font-semibold text-slate-900 transition-all outline-none placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        {/* Fuel Type */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Fuel Type</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Fuel size={18} />
            </div>
            <select
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="w-full h-14 bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 rounded-xl pl-11 pr-8 text-sm font-semibold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Fuel Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[13px] font-bold text-slate-900 mb-1.5">Passengers</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Users size={18} />
            </div>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full h-14 bg-[#f3f4f6] border border-transparent focus:bg-white focus:border-slate-300 focus:ring-0 rounded-xl pl-11 pr-8 text-sm font-semibold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Any</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="7">7+</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="w-full xl:w-auto flex items-end">
          <button
            type="submit"
            className="w-full xl:w-[180px] h-14 bg-slate-900 hover:bg-black text-white rounded-[14px] px-6 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.15)] group"
          >
            <Search size={18} className="group-hover:scale-110 transition-transform" />
            <span>Find Vehicle</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default RentCarSearchPanel;
