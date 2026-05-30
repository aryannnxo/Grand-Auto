import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wrench, 
  MapPin, 
  CalendarDays, 
  User as UserIcon,
  Car,
  FileText,
  Search,
  Filter
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const AdminMechanicsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Status management for individual requests
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editMechanic, setEditMechanic] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await axios.get(`${API}/api/mechanics/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch admin requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (req) => {
    setEditingId(req._id);
    setEditStatus(req.status);
    setEditMechanic(req.assignedMechanic || "");
    setEditNotes(req.adminNotes || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      // Update assigned mechanic if changed
      if (editMechanic !== undefined) {
        await axios.put(`${API}/api/mechanics/admin/${id}/assign`, {
          assignedMechanic: editMechanic
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Update status and notes
      await axios.put(`${API}/api/mechanics/admin/${id}/status`, {
        status: editStatus,
        adminNotes: editNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingId(null);
      fetchRequests(); // Refresh the list
    } catch (err) {
      alert("Failed to update request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'assigned': return 'info';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'rejected': return 'danger';
      default: return 'outline';
    }
  };

  const quickAction = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/mechanics/admin/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredRequests = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="w-full max-w-7xl mx-auto pt-8 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white flex items-center">
              <Wrench className="mr-3 text-primary-500" size={32} />
              Mechanic Requests
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Oversee and approve vehicle service requests.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {["all", "pending", "approved", "assigned", "completed"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-colors ${
                  filter === s 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 border-dashed">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench size={32} className="text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No requests found</h3>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((req, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={req._id}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative"
              >
                {req.status === 'pending' && (
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                )}
                
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Info Section */}
                    <div className="flex-1 grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <Badge variant={getStatusColor(req.status)} className="uppercase text-[10px] font-black tracking-[0.1em] px-3">
                            {req.status}
                          </Badge>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                            {req.serviceType}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <UserIcon size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{req.user?.name || "Unknown User"}</p>
                              <p className="text-xs text-slate-500 font-bold">{req.user?.email}</p>
                            </div>
                          </div>
                          
                          {req.vehicle && (
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                                 <Car size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{req.vehicle.brand} {req.vehicle.model}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.vehicle.name}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <MapPin size={14} />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{req.location}</p>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <CalendarDays size={14} />
                            </div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {new Date(req.requestedDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h4 className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                            <FileText size={12} className="mr-1.5" /> Problem Description
                          </h4>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[1.5rem] text-sm text-slate-700 dark:text-slate-300 italic min-h-[120px] leading-relaxed border border-slate-100 dark:border-slate-800">
                            {req.description}
                          </div>
                        </div>
                        
                        {req.status === 'pending' && (
                           <div className="mt-6 flex flex-col gap-2">
                              <button 
                                onClick={() => quickAction(req._id, 'approved')}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
                              >
                                Approve Request
                              </button>
                              <button 
                                onClick={() => quickAction(req._id, 'rejected')}
                                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                              >
                                Reject Request
                              </button>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                      {editingId === req._id ? (
                        <div className="space-y-4 h-full flex flex-col">
                          <div className="flex-1 space-y-4">
                             <div>
                               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Status</label>
                               <select 
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                                 value={editStatus}
                                 onChange={(e) => setEditStatus(e.target.value)}
                               >
                                 <option value="pending">Pending</option>
                                 <option value="approved">Approved</option>
                                 <option value="assigned">Assigned</option>
                                 <option value="in-progress">In Progress</option>
                                 <option value="completed">Completed</option>
                                 <option value="cancelled">Cancelled</option>
                                 <option value="rejected">Rejected</option>
                               </select>
                             </div>
                             
                             <div>
                               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Assigned Mechanic</label>
                               <input 
                                 type="text"
                                 placeholder="Mechanic name"
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                                 value={editMechanic}
                                 onChange={(e) => setEditMechanic(e.target.value)}
                               />
                             </div>
                             
                             <div>
                               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Admin Notes</label>
                               <textarea 
                                 placeholder="Internal notes..."
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white min-h-[80px]"
                                 value={editNotes}
                                 onChange={(e) => setEditNotes(e.target.value)}
                               />
                             </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <button className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs uppercase" onClick={() => handleSave(req._id)}>Save Changes</button>
                            <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs uppercase" onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 h-full flex flex-col justify-between">
                          <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                               <p className="text-[10px] text-slate-400 mb-1 uppercase font-black tracking-widest">Mechanic Assigned</p>
                               <p className="font-bold text-slate-900 dark:text-white text-sm">
                                 {req.assignedMechanic || <span className="text-slate-300 font-normal italic">Waiting for assignment</span>}
                               </p>
                             </div>
                             
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 min-h-[100px]">
                               <p className="text-[10px] text-slate-400 mb-1 uppercase font-black tracking-widest">Internal Notes</p>
                               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                 {req.adminNotes || "—"}
                               </p>
                             </div>
                          </div>
                          
                          <button 
                            className="w-full py-4 mt-6 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/5"
                            onClick={() => handleEditClick(req)}
                          >
                             Manage Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminMechanicsPage;
