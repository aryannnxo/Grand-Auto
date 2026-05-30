import React from "react";
import { RefreshCw } from "lucide-react";

const PillGroup = ({ title, options, selected, onChange }) => (
  <div className="mb-6">
    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3">{title}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
             selected === opt 
               ? 'bg-[#4B6BFB] text-white shadow-md shadow-blue-500/20' 
               : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const HomeFilter = ({ filters, setFilters, onReset }) => {
  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-transparent w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Filters</h3>
        <button 
          onClick={onReset}
          className="flex items-center text-[#4B6BFB] text-sm font-semibold hover:text-[#3A5CEA]"
        >
          <RefreshCw size={14} className="mr-1.5" />
          Reset All
        </button>
      </div>

      <PillGroup 
        title="Rental Type" 
        options={['Any', 'Per Day', 'Per Hour']} 
        selected={filters.rentalType || 'Per Day'} 
        onChange={(val) => updateFilter('rentalType', val)}
      />

      <div className="mb-6">
        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">Price Range</p>
        {/* Mock Chart & Sliders */}
        <div className="h-16 flex items-end gap-1 mb-2 px-1 relative">
           {/* Mock bars */}
           {[20, 30, 45, 60, 80, 100, 90, 75, 60, 40, 20].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-t-sm" style={{ height: `${h}%` }}></div>
           ))}
           {/* Active overlay simulation */}
           <div className="absolute inset-y-0 left-[20%] right-[30%] bg-[#4B6BFB]/20 pointer-events-none"></div>
        </div>
        <div className="px-2 relative h-1 mb-6 bg-slate-200 rounded">
           <div className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-[#4B6BFB] rounded"></div>
           <div className="absolute top-1/2 left-[20%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#4B6BFB] rounded-full shadow cursor-pointer"></div>
           <div className="absolute top-1/2 right-[30%] translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#4B6BFB] rounded-full shadow cursor-pointer"></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-800">
           <span>$1500</span>
           <span>$6000</span>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-4">Year</p>
        <div className="px-2 relative h-1 mb-6 bg-slate-200 rounded">
           <div className="absolute top-0 bottom-0 left-[30%] right-[10%] bg-[#4B6BFB] rounded"></div>
           <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#4B6BFB] rounded-full shadow cursor-pointer"></div>
           <div className="absolute top-1/2 right-[10%] translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#4B6BFB] rounded-full shadow cursor-pointer"></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-800">
           <span>2016</span>
           <span>2023</span>
        </div>
      </div>

      <PillGroup 
        title="Transmission" 
        options={['Any', 'Manual', 'Automatic']} 
        selected={filters.transmission || 'Any'} 
        onChange={(val) => updateFilter('transmission', val)}
      />

      <PillGroup 
        title="Fuel Type" 
        options={['Any', 'Manual', 'Petrol', 'Electric', 'LPG', 'Gas', 'Hybrid', 'Other']} 
        selected={filters.fuel || 'Any'} 
        onChange={(val) => updateFilter('fuel', val)}
      />

      <PillGroup 
        title="Seat" 
        options={['Any', '2 Seater', '4 Seater']} 
        selected={filters.seats || 'Any'} 
        onChange={(val) => updateFilter('seats', val)}
      />

      <PillGroup 
        title="Vehicle Condition" 
        options={['All', 'Brand New', 'Used']} 
        selected={filters.condition || 'All'} 
        onChange={(val) => updateFilter('condition', val)}
      />
      
      {/* Missing 'Availability' from design bottom */}
    </div>
  );
};

export default HomeFilter;
