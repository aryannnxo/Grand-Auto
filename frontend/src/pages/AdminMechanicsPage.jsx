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
    <div className="w-full max-w-7xl mx-auto pt-2 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
              <Wrench className="mr-3 text-primary-500" size={24} />
              Mechanic Requests
            </h1>
            <p className="text-slate-500 text-sm mt-1">Oversee and approve vehicle service requests.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            {["all", "pending", "approved", "assigned", "completed"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 text-sm rounded transition-colors capitalize ${
                  filter === s 
                    ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
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
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 border-dashed">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench size={24} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-500">No requests found</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((req, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={req._id}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative"
              >
                {req.status === 'pending' && (
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
                )}
                
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Info Section */}
                    <div className="flex-1 grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant={getStatusColor(req.status)} className="capitalize text-xs px-2">
                            {req.status}
                          </Badge>
                          <span className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                            {req.serviceType}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <UserIcon size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{req.user?.name || "Unknown User"}</p>
                              <p className="text-xs text-slate-500 mt-1">{req.user?.email}</p>
                            </div>
                          </div>
                          
                          {req.vehicle && (
                            <div className="flex items-start">
                              <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                                 <Car size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{req.vehicle.brand} {req.vehicle.model}</p>
                                <p className="text-xs text-slate-500 mt-1">{req.vehicle.name}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <MapPin size={14} />
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{req.location}</p>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mr-3">
                               <CalendarDays size={14} />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(req.requestedDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h4 className="flex items-center text-xs font-semibold text-slate-500 mb-2">
                            <FileText size={12} className="mr-1.5" /> Problem Description
                          </h4>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md text-sm text-slate-700 dark:text-slate-300 italic min-h-[100px] border border-slate-200 dark:border-slate-700">
                            {req.description}
                          </div>
                        </div>
                        
                        {req.status === 'pending' && (
                           <div className="mt-4 flex flex-col gap-2">
                              <button 
                                onClick={() => quickAction(req._id, 'approved')}
                                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-md transition-all"
                              >
                                Approve Request
                              </button>
                              <button 
                                onClick={() => quickAction(req._id, 'rejected')}
                                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 text-sm rounded-md transition-all"
                              >
                                Reject Request
                              </button>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6">
                      {editingId === req._id ? (
                        <div className="space-y-4 h-full flex flex-col">
                          <div className="flex-1 space-y-3">
                             <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                               <select 
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all dark:text-white"
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
                               <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Mechanic</label>
                               <input 
                                 type="text"
                                 placeholder="Mechanic name"
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 transition-all dark:text-white"
                                 value={editMechanic}
                                 onChange={(e) => setEditMechanic(e.target.value)}
                               />
                             </div>
                             
                             <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Admin Notes</label>
                               <textarea 
                                 placeholder="Internal notes..."
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 transition-all dark:text-white min-h-[80px]"
                                 value={editNotes}
                                 onChange={(e) => setEditNotes(e.target.value)}
                               />
                             </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <button className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-sm" onClick={() => handleSave(req._id)}>Save Changes</button>
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-sm" onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 h-full flex flex-col justify-between">
                          <div className="space-y-4">
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-200 dark:border-slate-700">
                               <p className="text-xs text-slate-500 mb-1 font-medium">Mechanic Assigned</p>
                               <p className="font-medium text-slate-900 dark:text-white text-sm">
                                 {req.assignedMechanic || <span className="text-slate-400 font-normal italic">Waiting for assignment</span>}
                               </p>
                             </div>
                             
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-slate-200 dark:border-slate-700 min-h-[80px]">
                               <p className="text-xs text-slate-500 mb-1 font-medium">Internal Notes</p>
                               <p className="text-sm text-slate-600 dark:text-slate-400">
                                 {req.adminNotes || "—"}
                               </p>
                             </div>
                          </div>
                          
                          <button 
                            className="w-full py-2.5 mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-md text-sm hover:opacity-90 transition-all"
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
