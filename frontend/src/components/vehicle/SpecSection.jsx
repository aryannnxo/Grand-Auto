import React from 'react';

const SpecSection = ({ vehicle }) => {
  const engineSpecs = [
    { label: 'Engine Type', value: '1.2L Revotron' },
    { label: 'Displacement', value: '1199 cc' },
    { label: 'Max Power', value: '84.48bhp@6000rpm' },
    { label: 'Max Torque', value: '113Nm@3300rpm' },
    { label: 'No. of Cylinders', value: '3' },
    { label: 'Valves Per Cylinder', value: '4' },
  ];

  const dimensionSpecs = [
    { label: 'Length', value: '3765 mm' },
    { label: 'Width', value: '1677 mm' },
    { label: 'Height', value: '1535 mm' },
    { label: 'Wheel Base', value: '2400 mm' },
    { label: 'Kerb Weight', value: '982 kg' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-black text-slate-900 mb-6">Specifications</h2>

      <div className="space-y-8">
        {/* Engine Specs */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-t-lg border border-slate-200 border-b-0">
            Engine & Transmission
          </h3>
          <div className="border border-slate-200 rounded-b-lg overflow-hidden">
            {engineSpecs.map((spec, i) => (
              <div key={i} className={`flex py-3 px-4 ${i !== engineSpecs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="w-1/2 text-[13px] text-slate-500">{spec.label}</span>
                <span className="w-1/2 text-[13px] font-medium text-slate-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Specs */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-t-lg border border-slate-200 border-b-0">
            Dimensions & Capacity
          </h3>
          <div className="border border-slate-200 rounded-b-lg overflow-hidden">
            {dimensionSpecs.map((spec, i) => (
              <div key={i} className={`flex py-3 px-4 ${i !== dimensionSpecs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="w-1/2 text-[13px] text-slate-500">{spec.label}</span>
                <span className="w-1/2 text-[13px] font-medium text-slate-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecSection;
