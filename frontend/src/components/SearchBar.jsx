import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';

const SearchBar = ({ initialParams = {} }) => {
  const navigate = useNavigate();
  const [differentDropoff, setDifferentDropoff] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    pickupLocation: initialParams.location || '',
    dropoffLocation: '',
    pickupDate: initialParams.pickupDate || '',
    pickupTime: '10:00',
    returnDate: initialParams.returnDate || '',
    returnTime: '10:00',
    driverAge: true, // "Driver aged 30-65?"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query params
    const query = new URLSearchParams();
    if (searchParams.pickupLocation) query.append('location', searchParams.pickupLocation);
    if (differentDropoff && searchParams.dropoffLocation) query.append('dropoffLocation', searchParams.dropoffLocation);
    if (searchParams.pickupDate) query.append('pickupDate', searchParams.pickupDate);
    if (searchParams.returnDate) query.append('returnDate', searchParams.returnDate);
    // Add times or age if we want to filter on backend, but typically these are UI fluff or passed to booking.
    
    navigate(`/listings?${query.toString()}`);
  };

  // Custom Input for the search bar to look like Booking.com
  const SearchInput = ({ icon: Icon, ...props }) => (
    <div className="relative flex-1 min-w-[200px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={20} />
      </div>
      <input
        {...props}
        className="block w-full pl-10 pr-3 py-3.5 bg-white border-2 border-transparent focus:border-primary-500 rounded-xl focus:ring-4 focus:ring-primary-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-500 outline-none"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto">
      {/* Top Toggles */}
      <div className="flex flex-wrap items-center gap-6 mb-3 px-2">
        <label className="flex items-center gap-2 cursor-pointer text-white/90 font-medium text-sm hover:text-white transition-colors">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-white/30 text-primary-500 focus:ring-primary-500/50 bg-white/10" 
            checked={differentDropoff}
            onChange={(e) => setDifferentDropoff(e.target.checked)}
          />
          Drop-off at different location
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-white/90 font-medium text-sm hover:text-white transition-colors">
          <input 
            type="checkbox" 
            name="driverAge"
            checked={searchParams.driverAge}
            onChange={handleChange}
            className="w-4 h-4 rounded border-white/30 text-primary-500 focus:ring-primary-500/50 bg-white/10" 
          />
          Driver aged 30 - 65?
        </label>
      </div>

      {/* Main Search Fields Container */}
      <div className="bg-amber-400/95 dark:bg-amber-500/90 p-2 sm:p-3 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl backdrop-blur-md border border-white/20">
        
        {/* Locations */}
        <div className="flex flex-col flex-[1.5] gap-2">
          <SearchInput 
            icon={MapPin} 
            name="pickupLocation"
            value={searchParams.pickupLocation}
            onChange={handleChange}
            placeholder="Pick-up Location (City, Airport...)" 
            required
          />
          {differentDropoff && (
            <SearchInput 
              icon={MapPin} 
              name="dropoffLocation"
              value={searchParams.dropoffLocation}
              onChange={handleChange}
              placeholder="Drop-off Location" 
              required
            />
          )}
        </div>

        {/* Dates & Times */}
        <div className="flex flex-col sm:flex-row flex-[1.5] gap-2">
          {/* Pickup Date & Time Grid */}
          <div className="flex flex-1 rounded-xl bg-white focus-within:ring-4 ring-primary-500/20 overflow-hidden border-2 border-transparent focus-within:border-primary-500 transition-all">
            <div className="relative flex-1 border-r border-slate-200">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar size={18}/></div>
               <input type="date" name="pickupDate" required value={searchParams.pickupDate} onChange={handleChange} className="w-full pl-9 pr-2 py-3.5 outline-none font-medium text-sm text-slate-900" />
            </div>
            <div className="relative w-[100px] sm:w-[80px]">
               <input type="time" name="pickupTime" value={searchParams.pickupTime} onChange={handleChange} className="w-full px-2 py-3.5 outline-none font-medium text-sm text-slate-900" />
            </div>
          </div>

          {/* Return Date & Time Grid */}
          <div className="flex flex-1 rounded-xl bg-white focus-within:ring-4 ring-primary-500/20 overflow-hidden border-2 border-transparent focus-within:border-primary-500 transition-all">
            <div className="relative flex-1 border-r border-slate-200">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Calendar size={18}/></div>
               <input type="date" name="returnDate" required value={searchParams.returnDate} onChange={handleChange} className="w-full pl-9 pr-2 py-3.5 outline-none font-medium text-sm text-slate-900" />
            </div>
            <div className="relative w-[100px] sm:w-[80px]">
               <input type="time" name="returnTime" value={searchParams.returnTime} onChange={handleChange} className="w-full px-2 py-3.5 outline-none font-medium text-sm text-slate-900" />
            </div>
          </div>
        </div>

        {/* Search CTA */}
        <Button type="submit" variant="primary" className="py-3.5 px-8 md:px-10 text-lg font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-transform flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-0">
          Search
        </Button>
        
      </div>
    </form>
  );
};

export default SearchBar;
