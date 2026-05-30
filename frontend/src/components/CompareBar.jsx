import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale } from 'lucide-react';
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
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-slate-900 border-t-4 border-primary-500 shadow-2xl rounded-t-2xl pointer-events-auto overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-6">
              
              <div className="flex-1 flex gap-4 w-full overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                {compareList.map((car) => (
                  <div key={car._id} className="relative flex-shrink-0 w-32 sm:w-40 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 p-2 flex flex-col gap-2 group">
                    <button 
                      onClick={() => onRemove(car._id)}
                      className="absolute top-1 right-1 z-10 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <div className="h-16 w-full rounded-lg overflow-hidden bg-slate-950">
                      <img 
                        src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} 
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-heading font-bold text-white truncate" title={`${car.brand} ${car.model}`}>
                        {car.brand} {car.model}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">NPR {car.pricePerDay || car.price}/day</p>
                    </div>
                  </div>
                ))}
                
                {compareList.length < 3 && (
                  <div className="flex-shrink-0 w-32 sm:w-40 border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-xl flex flex-col items-center justify-center text-slate-500 p-4">
                     <span className="text-2xl font-light mb-1">+</span>
                     <span className="text-xs text-center">Add another vehicle</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={onCompare} 
                  disabled={compareList.length < 2}
                  className="w-full sm:w-auto px-8 whitespace-nowrap shadow-primary-500/30"
                >
                  <Scale className="mr-2" size={18} />
                  Compare {compareList.length} Vehicle{compareList.length !== 1 ? 's' : ''}
                </Button>
                <button onClick={onClear} className="text-sm text-slate-400 hover:text-white underline whitespace-nowrap">
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
