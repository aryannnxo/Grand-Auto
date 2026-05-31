import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Car, Settings, Droplets, Users, MapPin, Star, Wind } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:5000";

const CompareModal = ({ isOpen, onClose, cars }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => c.pricePerDay || c.price || 0)) : 0;

  const specs = [
    { label: "Category", key: "type", icon: Car },
    { label: "Transmission", key: "transmission", icon: Settings },
    { label: "Fuel Type", key: "fuel", icon: Droplets },
    { label: "Seats", key: "seats", suffix: " Seats", icon: Users },
    { label: "Location", key: "location", icon: MapPin },
    { label: "Ratings", key: "rating", icon: Star },
    { label: "Air Conditioning", key: "ac", icon: Wind, isBoolean: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-x-24 xl:inset-x-40 z-[120] bg-white dark:bg-[#0f1115] rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#0f1115]">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  Compare Vehicles
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium rounded-md">
                    {cars.length} selected
                  </span>
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-[#0f1115] custom-scrollbar">
              <div className="min-w-[800px] p-6 md:p-8">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="w-[180px] p-4 font-medium text-slate-500 dark:text-slate-400 text-sm align-bottom">
                         Overview
                      </th>
                      {cars.map((car) => {
                        const isBestValue = (car.pricePerDay || car.price) === minPrice && minPrice > 0;
                        return (
                          <th key={car._id} className="w-[calc((100%-180px)/3)] p-4 relative align-bottom">
                            <div className="relative aspect-[16/10] mb-4 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                              <img 
                                src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-full object-cover"
                              />
                              {isBestValue && (
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur dark:bg-black/90 text-slate-900 dark:text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                  <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                  Best Value
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                              {car.brand} {car.model}
                            </h3>
                            <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                               NPR {car.pricePerDay || car.price} 
                               <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ day</span>
                            </div>
                            <Button 
                              variant="primary" 
                              className="w-full mt-4 py-2.5 text-sm font-medium rounded-lg"
                              onClick={() => {
                                onClose();
                                navigate(`/book/${car._id}`);
                              }}
                            >
                              Select Vehicle
                            </Button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {specs.map((row, rowIdx) => {
                      const Icon = row.icon;
                      return (
                        <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 py-5 text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-3">
                            <Icon size={18} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                            {row.label}
                          </td>
                          {cars.map((car) => (
                            <td key={`${car._id}-${row.key}`} className="p-4 py-5 text-center">
                              {row.isBoolean ? (
                                <div className="flex justify-center">
                                  <Check size={18} className="text-slate-700 dark:text-slate-300" strokeWidth={2} />
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                                  {row.key === 'rating' ? `${car[row.key] || '4.9'}/5` : (car[row.key] || 'N/A')} {row.suffix || ''}
                                </span>
                              )}
                            </td>
                          ))}
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
