import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Car, 
  Shield, 
  Zap, 
  Users, 
  LayoutGrid, 
  Gauge, 
  Fuel, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Briefcase
} from 'lucide-react';
import { Button } from './ui/Button';

const FilterSection = ({ children, title, icon: Icon, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100/80 dark:border-slate-800/60 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group outline-none"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={16} className="text-slate-400 group-hover:text-primary-500 transition-colors" />}
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800/80">
          {isOpen ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>
      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

const ListingsFilter = ({ filters, setFilters, handleSearch, resetFilters, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  // Debounced effect for dynamic search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [
    filters.type, 
    filters.transmission, 
    filters.fuel, 
    filters.seats, 
    filters.minPrice, 
    filters.maxPrice,
    filters.search 
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'type') {
      let currentTypes = filters.type ? filters.type.split(',') : [];
      if (checked) currentTypes.push(value);
      else currentTypes = currentTypes.filter(t => t !== value);
      setFilters(prev => ({ ...prev, type: currentTypes.join(',') }));
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    handleSearch();
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const categories = [
    { id: 'Sedan', icon: Car },
    { id: 'SUV', icon: Shield },
    { id: 'Hatchback', icon: LayoutGrid },
    { id: 'Coupe', icon: Zap },
    { id: 'Convertible', icon: Briefcase },
    { id: 'Van', icon: Users },
    { id: 'EV', icon: Zap }
  ];

  const activeFiltersCount = [
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.transmission,
    filters.fuel,
    filters.seats,
    filters.type
  ].filter(Boolean).length;

  return (
    <div className={`
      bg-white dark:bg-[#0B1120] rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden
      flex flex-col h-full
      ${isMobileMenuOpen ? 'fixed inset-0 z-[120] rounded-none overflow-y-auto' : 'hidden lg:flex sticky top-28'}
    `}>
      {/* Header */}
      <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
               <Filter size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white leading-none">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase mt-2.5 tracking-widest border border-primary-100 dark:border-primary-500/20">
                  {activeFiltersCount} Active
                </span>
              )}
            </div>
          </div>
          {isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full hover:text-slate-900 dark:hover:text-white transition-colors">
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-8 flex-1 custom-scrollbar overflow-y-auto">
        <form onSubmit={handleApply} className="space-y-0">
          
          <FilterSection title="Search Keyword" icon={Search}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input 
                type="text" 
                name="search" 
                placeholder="Brand, Model, Year..." 
                value={filters.search} 
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
              />
            </div>
          </FilterSection>

          <FilterSection title="Price Range" icon={Tag}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Min (NPR)</span>
                <input 
                  type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Max (NPR)</span>
                <input 
                  type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="MAX"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Vehicle Details" icon={Gauge}>
            <div className="space-y-4">
              <div className="relative group">
                <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 pointer-events-none transition-colors" size={18} />
                <select 
                  name="transmission" value={filters.transmission} onChange={handleChange} 
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl py-3.5 pl-12 pr-10 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
                >
                  <option value="">Any Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative group">
                <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 pointer-events-none transition-colors" size={18} />
                <select 
                  name="fuel" value={filters.fuel} onChange={handleChange} 
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl py-3.5 pl-12 pr-10 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white"
                >
                  <option value="">Any Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Car Category" icon={LayoutGrid}>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isActive = (filters.type || '').includes(cat.id);
                return (
                  <label 
                    key={cat.id} 
                    className={`
                      flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer group
                      ${isActive 
                        ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}
                    `}
                  >
                    <input 
                      type="checkbox" name="type" value={cat.id} 
                      checked={isActive}
                      onChange={handleCheckboxChange}
                      className="hidden" 
                    />
                    <cat.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                      {cat.id}
                    </span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Seating Capacity" icon={Users}>
            <div className="grid grid-cols-4 gap-2">
              {['2', '4', '5', '7'].map(num => {
                const isActive = filters.seats === num;
                return (
                  <button 
                    key={num} type="button"
                    onClick={() => setFilters(prev => ({ ...prev, seats: isActive ? '' : num }))}
                    className={`
                      py-3 rounded-xl font-black text-xs transition-all border-2
                      ${isActive 
                        ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}
                    `}
                  >
                    {num}{num === '7' && '+'}
                  </button>
                );
              })}
            </div>
          </FilterSection>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
        <button 
          onClick={resetFilters}
          className="flex justify-between items-center px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors w-full"
        >
          <span>Reset Settings</span>
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

export default ListingsFilter;
