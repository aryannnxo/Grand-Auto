import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CarFront, Users, Check, X, Search, Filter, ShieldCheck, MapPin, Settings } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const AdminCarVerificationPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchVehicles(); }, [filter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API}/api/admin/vehicles?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("You are not authorized as an admin! Please ensure your database role is set to 'admin'.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/vehicles/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` }});
      fetchVehicles();
    } catch (err) { alert(err.response?.data?.msg || "Failed to approve"); }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/vehicles/${id}/reject`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${token}` }});
      setRejectingId(null); setRejectionReason(""); fetchVehicles();
    } catch (err) { alert(err.response?.data?.msg || "Failed to reject"); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Admin Workspace
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">Car Verifications</h1>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            {['pending', 'approved', 'rejected'].map(status => (
               <button 
                  key={status} onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${filter === status ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
               >
                 {status} <Badge variant={status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'outline'} className="ml-2 scale-90">{vehicles.length > 0 && filter === status ? vehicles.length : ''}</Badge>
               </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No {filter} vehicles found</h3>
            <p className="text-slate-500">There are currently no vehicles in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {vehicles.map((vehicle, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                key={vehicle._id} 
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
              >
                <div className="w-full lg:w-72 h-64 lg:h-auto rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex-shrink-0">
                  {(vehicle.images && vehicle.images.length > 0) || vehicle.image ? (
                    <img src={`${API}${vehicle.images?.[0]?.url || vehicle.images?.[0] || vehicle.image}`} alt={vehicle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-100 dark:bg-slate-800"><CarFront size={48} className="opacity-20 mb-2"/> No Image</div>
                  )}
                  <Badge className="absolute top-4 left-4 shadow-lg" variant={filter === 'approved' ? 'success' : filter === 'rejected' ? 'danger' : 'warning'}>{filter}</Badge>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white mb-1">{vehicle.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{vehicle.brand} {vehicle.model} • {vehicle.year}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-primary-600 dark:text-primary-400 block">Rs. {vehicle.pricePerDay}</span>
                       <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Per Day</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2"><CarFront size={16} className="text-primary-500"/> <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vehicle.type}</span></div>
                    <div className="flex items-center gap-2"><Users size={16} className="text-primary-500"/> <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vehicle.seats} Seats</span></div>
                    <div className="flex items-center gap-2"><Settings size={16} className="text-primary-500"/> <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vehicle.transmission}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-primary-500"/> <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{vehicle.location}</span></div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6 bg-white dark:bg-slate-900">
                     <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-lg">{vehicle.owner?.name?.charAt(0) || "O"}</div>
                     <div>
                       <p className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none">{vehicle.owner?.name}</p>
                       <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{vehicle.owner?.email}</p>
                     </div>
                  </div>

                  <div className="mt-auto">
                    {filter === "pending" && (
                      <div className="flex flex-col gap-4">
                        {rejectingId === vehicle._id ? (
                          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50">
                            <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-2">Reason for rejection</h4>
                            <textarea rows={2} placeholder="Type reason here..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-3" />
                            <div className="flex gap-3 text-sm">
                              <button onClick={() => handleReject(vehicle._id)} className="px-4 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors">Confirm Reject</button>
                              <button onClick={() => { setRejectingId(null); setRejectionReason(""); }} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="primary" className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" onClick={() => handleApprove(vehicle._id)}><Check size={18} className="mr-2" /> Approve Listing</Button>
                            <Button variant="outline" className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20" onClick={() => setRejectingId(vehicle._id)}><X size={18} className="mr-2" /> Reject Listing</Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {filter === "rejected" && (
                      <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                        <span className="font-bold block mb-1">Rejection Reason:</span>
                        {vehicle.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminCarVerificationPage;
