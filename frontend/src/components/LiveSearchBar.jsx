import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:5000";

const LiveSearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search by car name, brand, model, location...",
  useDropdown = false,
  className = ""
}) => {
  const [internalValue, setInternalValue] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sync prop with internal state if it changes externally
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!useDropdown) return;
    
    if (!internalValue.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/vehicles?search=${internalValue}&limit=5&available=true`);
        setResults(res.data.vehicles || res.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [internalValue, useDropdown]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    if (onChange) onChange(val);
  };

  const handleClear = () => {
    setInternalValue("");
    if (onChange) onChange("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      if (onSubmit) {
        onSubmit(internalValue);
      } else if (useDropdown) {
        navigate(`/listings?search=${internalValue}`);
      }
    }
  };

  const handleSelectResult = (car) => {
    setShowDropdown(false);
    navigate(`/vehicle/${car._id}`); // Navigating directly to vehicle details is a nice touch
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`} ref={dropdownRef}>
      <div className="relative group flex items-center">
        <div className="absolute left-4 lg:left-6 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
          <Search size={22} strokeWidth={2.5} />
        </div>
        
        <input
          type="text"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (useDropdown && internalValue.trim()) setShowDropdown(true); }}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-[#0B1120] border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 dark:focus:border-primary-500 rounded-[2rem] py-4 lg:py-5 pl-14 lg:pl-16 pr-14 text-sm lg:text-base font-semibold text-slate-900 dark:text-white shadow-lg focus:shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <div className="absolute right-4 lg:right-6 flex items-center gap-2">
          {loading && useDropdown && (
            <Loader2 size={20} className="text-primary-500 animate-spin" />
          )}
          {internalValue && (
            <button 
              onClick={handleClear}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {useDropdown && showDropdown && (
        <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          {!loading && results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
              No vehicles found matching "{internalValue}"
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((car) => (
                <div 
                  key={car._id}
                  onClick={() => handleSelectResult(car)}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer border-b border-slate-100 dark:border-slate-800/80 last:border-0 transition-colors"
                >
                  <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {(car.images && car.images.length > 0) || car.image ? (
                      <img src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} alt={car.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{car.brand} {car.model}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {car.location}</span>
                      <span>•</span>
                      <span>{car.type}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pr-2">
                    <span className="text-sm font-black text-primary-600 dark:text-primary-400">Rs. {car.pricePerDay}</span>
                    <span className="text-[10px] block text-slate-500 font-bold uppercase">/ day</span>
                  </div>
                </div>
              ))}
              <div 
                onClick={() => { setShowDropdown(false); navigate(`/listings?search=${internalValue}`); }}
                className="p-4 bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 text-center text-sm font-bold text-primary-600 dark:text-primary-400 cursor-pointer flex items-center justify-center gap-1 transition-colors"
              >
                View all results <ChevronRight size={16} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSearchBar;
