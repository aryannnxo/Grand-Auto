import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, ArrowRight } from "lucide-react";

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3">
    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 border-none"></div>
    </label>
  </div>
);

// Dynamic Text Input Field
const DynamicTextField = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col w-full h-full justify-end">
    {label ? (
      <label className="text-[13px] font-bold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
    ) : (
      <div className="h-[22px] mb-2 hidden md:block"></div>
    )}
    <div className="w-full h-[50px] bg-[#f4f5f7] dark:bg-slate-800/80 hover:bg-[#ebecef] transition-colors rounded-xl px-4 flex items-center focus-within:ring-2 focus-within:ring-slate-900/20">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[14px] font-semibold text-slate-900 dark:text-white placeholder-slate-500 truncate"
      />
    </div>
  </div>
);

// Dynamic Date Field
const DynamicDateField = ({ label, value, onChange }) => (
  <div className="flex flex-col w-full h-full justify-end">
    {label ? (
      <label className="text-[13px] font-bold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
    ) : (
      <div className="h-[22px] mb-2 hidden md:block"></div>
    )}
    <div className="w-full h-[50px] bg-[#f4f5f7] dark:bg-slate-800/80 hover:bg-[#ebecef] transition-colors rounded-xl px-4 flex items-center focus-within:ring-2 focus-within:ring-slate-900/20">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none text-[14px] font-semibold text-slate-900 dark:text-white cursor-pointer"
      />
    </div>
  </div>
);

// Dynamic Dropdown Field
const DynamicDropdownField = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col w-full h-full justify-end relative" ref={dropdownRef}>
      {label ? (
        <label className="text-[13px] font-bold text-slate-800 dark:text-slate-300 mb-2">{label}</label>
      ) : (
        <div className="h-[22px] mb-2 hidden md:block"></div>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[50px] bg-[#f4f5f7] dark:bg-slate-800/80 hover:bg-[#ebecef] transition-colors rounded-xl px-4 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-slate-900/20"
      >
        <span className={`text-[14px] font-semibold truncate ${value ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-500 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-[85px] left-0 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-[14px] font-bold transition-colors ${value === opt ? 'bg-primary-50 text-primary-600' : 'text-slate-700 dark:text-slate-200'}`}
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QuickSearchBar = ({ onSearch }) => {
  // const [returnElsewhere, setReturnElsewhere] = useState(false);
  const [withDriver, setWithDriver] = useState(true);

  const [departure, setDeparture] = useState("");
  const [carType, setCarType] = useState("");
  const [fuelType, setFuelType] = useState("");

  const carTypeOptions = ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Van", "EV"];
  const fuelTypeOptions = ["Petrol", "Diesel", "Electric", "Hybrid"];

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        location: departure,
        carType,
        fuelType,
        // returnElsewhere, 
        withDriver
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-5">

      {/* Top Row Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 lg:mb-5">

        {/* Departure */}
        <DynamicTextField label="Departure" value={departure} onChange={(e) => setDeparture(e.target.value)} placeholder="Kathmandu, Nepal" />

        {/* Car Type */}
        <DynamicDropdownField label="Car Type" value={carType} onChange={setCarType} options={carTypeOptions} placeholder="Any Type" />

        {/* Fuel Type */}
        <DynamicDropdownField label="Fuel Type" value={fuelType} onChange={setFuelType} options={fuelTypeOptions} placeholder="Any Fuel" />

        {/* Search Button */}
        <div className="flex flex-col w-full h-full justify-end">
          <button
            onClick={handleSearch}
            className="w-full h-[50px] bg-black dark:bg-white text-white dark:text-black font-semibold text-[14px] rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            Search cars <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Row Toggles */}
      <div className="flex flex-wrap items-center gap-8 lg:gap-14 pt-1 ml-1">
        {/* <ToggleSwitch label="Return elsewhere" checked={returnElsewhere} onChange={(e) => setReturnElsewhere(e.target.checked)} /> */}
        <ToggleSwitch label="With driver" checked={withDriver} onChange={(e) => setWithDriver(e.target.checked)} />

        <div className="flex items-center gap-3 cursor-pointer group">
          <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Add promocode</span>
          <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchBar;
