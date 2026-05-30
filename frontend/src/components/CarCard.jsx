import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, CircleGauge, MapPin, Star, Bookmark, CarFront, Scale } from 'lucide-react';

const API = "http://localhost:5000";

const CarCard = ({ car, onToggleCompare, isCompared, compareDisabled }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vehicles/${car._id}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation(); // prevent card click
    if (!compareDisabled || isCompared) {
      if (onToggleCompare) onToggleCompare(car);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-[#f8f9fa] dark:bg-slate-900 rounded-[1.5rem] p-5 flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer h-full border border-slate-200 dark:border-slate-800"
    >
      {/* Header section */}
      <div className="flex justify-between items-start mb-2">
         <div>
           <h3 className="text-[17px] font-bold text-slate-800 dark:text-white tracking-tight leading-tight">{car.brand} {car.model}</h3>
           <p className="text-[13px] text-slate-500 mt-1">The {car.brand} {car.type || 'Sedan'}</p>
         </div>
         <div className="flex items-center gap-1 group relative">
           {/* Star rating - Mock data for UI polish as requested */}
           <Star size={14} className="text-amber-500" fill="currentColor" />
           <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">4.9</span>
           <span className="text-[11px] text-slate-400">(100+)</span>
         </div>
      </div>

      {/* Image Section */}
      <div className="flex-1 h-[180px] min-h-[180px] flex items-center justify-center py-2 relative group transition-transform duration-500 w-full">
         {onToggleCompare && (
           <button 
             onClick={handleBookmarkClick}
             className={`absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm border backdrop-blur-sm ${
               isCompared 
                 ? 'bg-indigo-600 text-white border-indigo-700' 
                 : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300'
             } ${(compareDisabled && !isCompared) ? 'opacity-50 cursor-not-allowed' : ''}`}
             disabled={compareDisabled && !isCompared}
           >
             <Scale size={14} className={isCompared ? "text-white" : "text-current"} strokeWidth={isCompared ? 2.5 : 2} />
             <span className="text-[11px] font-bold tracking-wide uppercase">{isCompared ? 'Added' : 'Compare'}</span>
           </button>
         )}
         {(car.images && car.images.length > 0) || car.image ? (
            <img 
              src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
               alt={`${car.brand} ${car.model}`}
               className="h-[160px] w-full object-cover rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
            />
         ) : (
            <div className="h-[160px] w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm opacity-50">
               <CarFront size={48} className="mb-2"/>
            </div>
         )}
      </div>

      {/* Location Row */}
      <div className="flex justify-between items-center mt-2 mb-3 px-1 gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
           <MapPin size={14} className="shrink-0" />
           <span className="text-[13px] font-medium truncate" title={car.location || "Location unavailable"}>{car.location || "Kathmandu"}</span>
        </div>
        <div className="text-right whitespace-nowrap shrink-0">
          <span className="text-[16px] font-black text-slate-900 dark:text-white">
            NPR {car.pricePerDay || car.price}
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-bold ml-0.5">/Day</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-3"></div>

      {/* Four Specs Row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
         <div className="flex flex-col items-center text-center p-1">
           <Settings size={18} className="text-slate-400 mb-1" strokeWidth={1.5} />
           <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 capitalize w-full leading-tight">{car.transmission?.toLowerCase() === 'automatic' ? 'Auto' : (car.transmission || 'Auto')}</span>
         </div>
         
         <div className="flex flex-col items-center text-center p-1">
           <CircleGauge size={18} className="text-slate-400 mb-1" strokeWidth={1.5} />
           <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 w-full leading-tight" title={car.mileage || '250km'}>{car.mileage || '250km'}</span>
         </div>

         <div className="flex flex-col items-center text-center p-1">
           <CarFront size={18} className="text-slate-400 mb-1" strokeWidth={1.5} />
           <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 w-full leading-tight">Premium</span>
         </div>

         <div className="flex flex-col items-center text-center p-1">
           <Users size={18} className="text-slate-400 mb-1" strokeWidth={1.5} />
           <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 w-full leading-tight">{car.seats || 4} Seat</span>
         </div>
      </div>

      {/* Rent Now Button */}
      <button 
        className="w-full bg-[#2B2B2B] hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-500 text-white rounded-xl py-3 text-[15px] font-bold transition-colors mt-auto"
        onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
      >
         Rent Now
      </button>
    </div>
  );
};

export default CarCard;
