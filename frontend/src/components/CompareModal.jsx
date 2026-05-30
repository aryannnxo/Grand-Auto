import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Car, Settings, Droplets, Users, MapPin, Star, Wind } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:5000";

const CompareModal = ({ isOpen, onClose, cars }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Find the cheapest car for the "Best Value" badge
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => c.pricePerDay || c.price || 0)) : 0;

  const specs = [
    { label: "Category", key: "type", icon: Car },
    { label: "Transmission", key: "transmission", icon: Settings },
    { label: "Fuel Type", key: "fuel", icon: Droplets },
    { label: "Seats", key: "seats", suffix: " Seats", icon: Users },
    { label: "Location", key: "location", icon: MapPin },
    { label: "Ratings", key: "rating", icon: Star },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-x-20 xl:inset-x-32 z-[120] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
              <div>
                <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-3">
                  Vehicle Comparison
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    {cars.length} Vehicles
                  </span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">Side-by-side spec comparison to help you choose the perfect ride.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-none flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0B1120] custom-scrollbar rounded-b-[2rem]">
              <div className="min-w-[900px] p-6 md:p-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden">
                  <table className="w-full text-left border-collapse table-fixed bg-white dark:bg-slate-900">
                    <thead>
                      <tr>
                        <th className="w-[200px] p-6 pb-8 font-bold text-slate-400 dark:text-slate-500 text-sm tracking-widest uppercase border-b border-slate-100 dark:border-slate-800 align-bottom bg-slate-50/50 dark:bg-slate-900/50">
                           Specifications
                        </th>
                        {cars.map((car) => (
                          <th key={car._id} className="w-[calc((100%-200px)/3)] p-6 pb-8 border-b border-slate-100 dark:border-slate-800 relative align-bottom bg-white dark:bg-slate-900">
                            {(car.pricePerDay || car.price) === minPrice && minPrice > 0 && (
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-b-xl shadow-md flex items-center gap-1.5">
                                <Star size={12} className="fill-white" />
                                Best Value
                              </div>
                            )}
                            <div className="h-40 mb-5 mt-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner group relative">
                              <img 
                                src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
                                alt={`${car.brand} ${car.model}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white truncate tracking-tight" title={`${car.brand} ${car.model}`}>
                              {car.brand} {car.model}
                            </h3>
                            <div className="mt-2 text-2xl md:text-3xl font-black text-primary-600 dark:text-primary-400 flex items-baseline gap-1">
                               NPR {car.pricePerDay || car.price} 
                               <span className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">/ day</span>
                            </div>
                            <Button 
                              variant="primary" 
                              className="w-full mt-6 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all py-3 font-bold text-lg rounded-xl"
                              onClick={() => {
                                onClose();
                                navigate(`/book/${car._id}`);
                              }}
                            >
                              Book Now
                            </Button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    
                    <tbody className="text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/60">
                      {specs.map((row, rowIdx) => {
                        const Icon = row.icon;
                        return (
                          <tr key={rowIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                            <td className="p-5 px-6 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50 text-sm flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors flex-shrink-0">
                                <Icon size={16} strokeWidth={2.5} />
                              </div>
                              {row.label}
                            </td>
                            {cars.map((car) => (
                              <td key={`${car._id}-${row.key}`} className="p-5 px-6 font-medium text-slate-900 dark:text-white text-center">
                                <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl font-semibold text-[15px] border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors w-full max-w-[180px]">
                                  {row.key === 'rating' ? `${car[row.key] || '4.9'}/5` : (car[row.key] || 'N/A')} {row.suffix || ''}
                                </span>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      
                      {/* Air Conditioning Check row */}
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group border-b-0">
                        <td className="p-5 px-6 font-semibold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50 text-sm flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors flex-shrink-0">
                            <Wind size={16} strokeWidth={2.5} />
                          </div>
                          Air Conditioning
                        </td>
                        {cars.map((car) => (
                          <td key={`${car._id}-ac`} className="p-5 px-6 text-center">
                            <div className="inline-flex items-center justify-center px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 w-full max-w-[180px]">
                              <Check size={20} strokeWidth={3} className="text-emerald-500 dark:text-emerald-400" />
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareModal;
