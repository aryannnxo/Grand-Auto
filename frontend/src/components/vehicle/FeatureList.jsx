import React from 'react';
import { Check } from 'lucide-react';

const FeatureList = () => {
  // Flattened features list for denser layout
  const features = [
    "Power Steering", "Power Windows Front", "Anti Lock Braking System",
    "Air Conditioner", "Driver Airbag", "Passenger Airbag",
    "Automatic Climate Control", "Alloy Wheels", "Multi-function Steering Wheel",
    "Engine Start Stop Button", "Fog Lights - Front", "Power Adjustable Exterior Rear View Mirror"
  ];

  return (
    <div id="features" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-black text-slate-900 mb-6">Top Features</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mb-6">
        {features.map((feat, i) => (
          <div key={i} className="flex items-start gap-2">
            <Check size={16} strokeWidth={3} className="text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-[13px] font-medium text-slate-700 leading-tight">
               {feat}
            </span>
          </div>
        ))}
      </div>

      <button className="text-orange-500 font-bold text-sm hover:underline">
        View all features
      </button>
    </div>
  );
};

export default FeatureList;
