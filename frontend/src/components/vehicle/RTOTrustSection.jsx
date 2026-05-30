import React from 'react';
import { FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';

const RTOTrustSection = () => {
  return (
    <div id="rto" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-[18px] font-black text-slate-900">RTO & Trust Report</h3>
          <p className="text-xs text-slate-500">140-point inspection and legal checks completed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">RC Status</p>
              <p className="text-sm font-bold text-slate-900">Valid & Active</p>
              <p className="text-[11px] text-slate-500 mt-1">No pending challans</p>
            </div>
         </div>
         <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Insurance</p>
              <p className="text-sm font-bold text-slate-900">Comprehensive</p>
              <p className="text-[11px] text-slate-500 mt-1">Valid till Oct 2026</p>
            </div>
         </div>
         <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex items-start gap-3">
            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fitness</p>
              <p className="text-sm font-bold text-slate-900">Verified</p>
              <p className="text-[11px] text-slate-500 mt-1">Engine & body intact</p>
            </div>
         </div>
      </div>

      <button className="flex items-center justify-center gap-2 w-full py-3 border border-orange-500 text-orange-500 font-bold text-sm rounded-lg hover:bg-orange-50 transition-colors">
        <FileText size={16} /> Get Full Inspection Report
      </button>
    </div>
  );
};

export default RTOTrustSection;
