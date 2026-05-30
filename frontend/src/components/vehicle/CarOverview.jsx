import React from 'react';
import { Calendar, Fuel, Compass, Activity, Settings, Users } from 'lucide-react';

const CarOverview = ({ vehicle }) => {
  const overviewItems = [
    { label: 'Registration Year', value: vehicle?.year || 'N/A', icon: Calendar },
    { label: 'Fuel Type', value: vehicle?.fuel || 'Petrol', icon: Fuel },
    { label: 'KMs Driven', value: vehicle?.mileage || '15,000 km', icon: Compass },
    { label: 'Ownership', value: '1st Owner', icon: Activity },
    { label: 'Transmission', value: vehicle?.transmission || 'Automatic', icon: Settings },
    { label: 'Seats', value: `${vehicle?.seats || 5} Seats`, icon: Users }
  ];

  return (
    <div id="overview" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-black text-slate-900 mb-6">Car Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
        {overviewItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
             <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                <item.icon size={18} />
             </div>
             <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                   {item.label}
                </p>
                <p className="text-sm font-bold text-slate-900 capitalize">
                   {item.value}
                </p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarOverview;
