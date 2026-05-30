import React from 'react';
import { Settings, Fuel, Compass, Activity } from 'lucide-react';

const PerformanceHighlights = ({ vehicle }) => {
  const highlights = [
    { label: 'Transmission', value: vehicle?.transmission === 'Automatic' ? 'Auto' : vehicle?.transmission || 'Auto', icon: Settings },
    { label: 'Fuel Type', value: vehicle?.fuel || 'Petrol', icon: Fuel },
    { label: 'Mileage', value: vehicle?.mileage || 'N/A', icon: Compass },
    { label: 'Condition', value: vehicle?.condition || 'Excellent', icon: Activity }
  ];

  return (
    <div className="w-full relative z-30 -mt-10 md:-mt-12 px-4 md:px-10 mb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {highlights.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl p-4 md:p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/40 flex flex-col items-center justify-center relative group hover:-translate-y-1 transition-transform duration-300"
            >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon size={20} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-slate-400 group-hover:text-primary-500 transition-colors text-center">
                   {item.label}
                </span>
                <span className="text-sm md:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate capitalize text-center w-full">
                   {item.value}
                </span>
            </div>
          ))}
        </div>
    </div>
  );
};

export default PerformanceHighlights;
