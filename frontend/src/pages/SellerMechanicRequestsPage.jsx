import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Wrench,
  CarFront,
  MapPin,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Settings,
  HelpCircle,
  ChevronRight,
  MessageSquare,
  ShieldAlert
} from "lucide-react";

const API = "http://localhost:5000";

const SellerMechanicRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/mechanics/owner-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch service requests.");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> Pending Admin</span>;
      case "assigned":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider"><Wrench size={12} /> Mechanic Assigned</span>;
      case "completed":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Completed</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">Maintenance Track</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">Monitor maintenance and repair requests for your fleet. Ensure your vehicles stay in peak performance condition.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center">
              <ShieldAlert size={24} />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Jobs</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{requests.filter(r => r.status !== 'completed').length}</p>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] h-60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {requests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-500/10 transition-colors" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-500 shadow-sm border border-slate-100 dark:border-slate-700">
                    <CarFront size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{request.vehicle?.brand} {request.vehicle?.model}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{request.issueType}</p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                 <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{request.problemDescription}"</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{request.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-slate-400" />
                       <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                       <User size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Request by {request.requestedBy?.name}</span>
                 </div>
                 <button onClick={() => window.location.href = `/mechanic-requests/${request._id}`} className="flex items-center gap-1 text-primary-500 font-bold text-sm hover:underline">
                    View Details <ChevronRight size={14} />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench size={48} className="text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No Service Requests</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">None of your vehicles currently require maintenance through our platform mechanic network.</p>
        </div>
      )}
    </div>
  );
};

export default SellerMechanicRequestsPage;
