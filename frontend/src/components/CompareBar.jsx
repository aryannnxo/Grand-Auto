import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, Plus } from 'lucide-react';
import { Button } from './ui/Button';

const API = "http://localhost:5000";

const CompareBar = ({ compareList, onRemove, onCompare, onClear }) => {
  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center"
        >
          <div className="bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl rounded-2xl pointer-events-auto p-3 flex flex-col sm:flex-row items-center gap-4 max-w-4xl w-full">
            
            <div className="flex flex-1 gap-3 overflow-x-auto hide-scrollbar w-full px-1">
              {compareList.map((car) => (
                <div key={car._id} className="relative flex-shrink-0 w-36 md:w-44 bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 p-1.5 flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-black flex-shrink-0">
                    <img 
                      src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
                      alt={car.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate" title={`${car.brand} ${car.model}`}>
                      {car.brand} {car.model}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">NPR {car.pricePerDay || car.price}/d</p>
                  </div>
                  <button 
                    onClick={() => onRemove(car._id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {compareList.length < 3 && (
                <div className="flex-shrink-0 w-36 md:w-44 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl flex items-center justify-center text-slate-400 p-2 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => {/* To open car selection if possible, otherwise just a visual cue */}}>
                   <Plus size={16} />
                   <span className="text-xs font-medium">Add vehicle</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 shrink-0 px-2 sm:px-0">
              <button 
                onClick={onClear} 
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 px-2 py-2"
              >
                Clear
              </button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onCompare} 
                disabled={compareList.length < 2}
                className="px-5 py-2.5 text-sm rounded-xl font-medium shadow-sm"
              >
                <Scale className="mr-2" size={16} />
                Compare ({compareList.length})
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
