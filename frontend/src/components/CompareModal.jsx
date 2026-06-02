import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus, Car, Settings, Droplets, Users, MapPin, Star, Wind, Briefcase, CarFront, Bluetooth, Map, ShieldCheck, Ban, ThumbsUp } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:5000";

const CompareModal = ({ isOpen, onClose, cars }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => c.pricePerDay || c.price || 0)) : 0;

  const getMockData = (car, field) => {
    if (car[field] !== undefined) return car[field];
    
    // Generate realistic mock data based on car type or price
    const price = car.pricePerDay || car.price || 0;
    const isPremium = price > 15000;
    const type = (car.type || "").toLowerCase();
    
    switch (field) {
      case "luggage": return type.includes("suv") ? "4 Bags" : type.includes("hatchback") ? "2 Bags" : "3 Bags";
      case "doors": return type.includes("sports") ? "2 Doors" : "4 Doors";
      case "bluetooth": return true;
      case "gps": return isPremium;
      case "insurance": return isPremium ? "Comprehensive" : "Standard";
      case "mileage": return isPremium ? "Unlimited" : "250 km/day";
      case "condition": return "Excellent";
      case "cancellation": return "Free 48h prior";
      case "ac": return true;
      case "rating": return "4.9";
      default: return "N/A";
    }
  };

  const specs = [
    { section: "Basic Details" },
    { label: "Category", key: "type", icon: Car },
    { label: "Transmission", key: "transmission", icon: Settings },
    { label: "Fuel Type", key: "fuel", icon: Droplets },
    { label: "Seats", key: "seats", suffix: " Seats", icon: Users },
    { label: "Doors", key: "doors", icon: CarFront },
    { label: "Luggage", key: "luggage", icon: Briefcase },
    
    { section: "Features & Amenities" },
    { label: "Air Conditioning", key: "ac", icon: Wind, isBoolean: true },
    { label: "Bluetooth / Music", key: "bluetooth", icon: Bluetooth, isBoolean: true },
    { label: "GPS / Navigation", key: "gps", icon: Map, isBoolean: true },
    
    { section: "Policies & Extras" },
    { label: "Mileage Allowed", key: "mileage", icon: MapPin },
    { label: "Insurance", key: "insurance", icon: ShieldCheck },
    { label: "Cancellation", key: "cancellation", icon: Ban },
    { label: "Vehicle Condition", key: "condition", icon: ThumbsUp },
    { label: "Location", key: "location", icon: MapPin },
    { label: "Ratings", key: "rating", icon: Star, suffix: " / 5" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-x-24 xl:inset-x-32 z-[120] bg-white dark:bg-[#0f1115] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 backdrop-blur-xl dark:bg-[#0f1115]/80 relative z-30">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  Compare Vehicles
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded-full">
                    {cars.length} selected
                  </span>
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-[#0f1115] custom-scrollbar relative z-10">
              <div className="min-w-[900px]">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="bg-white dark:bg-[#0f1115] sticky top-0 z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    <tr>
                      <th className="w-[220px] p-6 font-medium text-slate-400 text-sm align-bottom sticky left-0 bg-white dark:bg-[#0f1115] z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                         Overview
                      </th>
                      {cars.map((car) => {
                        const price = car.pricePerDay || car.price || 0;
                        const isBestValue = price === minPrice && minPrice > 0;
                        return (
                          <th key={car._id} className="w-[calc((100%-220px)/3)] p-6 relative align-bottom group">
                            <div className="relative aspect-[16/10] mb-5 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform duration-300 group-hover:shadow-md">
                              <img 
                                src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              {isBestValue && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                  <Star size={12} className="fill-white text-white" />
                                  Best Value
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white truncate mb-1">
                              {car.brand} {car.model}
                            </h3>
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-baseline gap-1">
                               NPR {price} 
                               <span className="text-sm text-slate-400 font-medium">/ day</span>
                            </div>
                            <button 
                              className="w-full mt-5 py-3 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98]"
                              onClick={() => {
                                onClose();
                                navigate(`/book/${car._id}`);
                              }}
                            >
                              Select Vehicle
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {specs.map((row, rowIdx) => {
                      if (row.section) {
                        return (
                          <tr key={`sec-${rowIdx}`} className="bg-slate-50 dark:bg-slate-900/50">
                            <td 
                              colSpan={cars.length + 1} 
                              className="px-6 py-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest sticky left-0 z-10"
                            >
                              {row.section}
                            </td>
                          </tr>
                        );
                      }

                      const Icon = row.icon;
                      return (
                        <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-t border-slate-100 dark:border-slate-800">
                          <td className="p-4 px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3 sticky left-0 bg-white dark:bg-[#0f1115] z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                              <Icon size={16} strokeWidth={2} />
                            </div>
                            {row.label}
                          </td>
                          {cars.map((car) => {
                            const val = getMockData(car, row.key);
                            return (
                              <td key={`${car._id}-${row.key}`} className="p-4 px-6 py-5 text-center">
                                {row.isBoolean ? (
                                  <div className="flex justify-center">
                                    {val ? (
                                      <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                        <Check size={14} className="text-emerald-500 font-bold" strokeWidth={3} />
                                      </div>
                                    ) : (
                                      <Minus size={16} className="text-slate-300 dark:text-slate-600" strokeWidth={2.5} />
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {val} <span className="text-slate-400 text-xs">{row.suffix || ''}</span>
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareModal;
