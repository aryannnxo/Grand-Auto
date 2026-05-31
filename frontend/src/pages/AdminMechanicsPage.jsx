import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, MapPin, CalendarDays, User as UserIcon, Car, FileText, 
  Search, Filter, AlertTriangle, CheckCircle2, Phone, X, AlertCircle
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const API = "http://localhost:5000";

const AdminMechanicsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Modal Form States
  const [formStatus, setFormStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [assignedMechanicName, setAssignedMechanicName] = useState("");
  const [assignedMechanicPhone, setAssignedMechanicPhone] = useState("");
  const [assignedMechanicEmail, setAssignedMechanicEmail] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const openModal = (req) => {
    setSelectedRequest(req);
    setFormStatus(req.status);
    setAdminNotes(req.adminNotes || "");
    setRejectionReason(req.rejectionReason || "");
    setCompletionNotes(req.completionNotes || "");
    setFinalCost(req.finalCost || "");
    setAssignedMechanicName(req.assignedMechanicName || req.assignedMechanic || "");
    setAssignedMechanicPhone(req.assignedMechanicPhone || "");
    setAssignedMechanicEmail(req.assignedMechanicEmail || "");
    setEstimatedCost(req.estimatedCost || "");
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Update Cost first
      if (estimatedCost || finalCost) {
        await axios.patch(`${API}/api/mechanics/admin/${selectedRequest._id}/cost`, {
          estimatedCost, finalCost
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      // If assigning mechanic
      if (assignedMechanicName && formStatus === 'assigned') {
        await axios.patch(`${API}/api/mechanics/admin/${selectedRequest._id}/assign`, {
          assignedMechanicName, assignedMechanicPhone, assignedMechanicEmail, estimatedCost, adminNotes
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Standard status update
        await axios.patch(`${API}/api/mechanics/admin/${selectedRequest._id}/status`, {
          status: formStatus, adminNotes, rejectionReason, completionNotes, finalCost
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      closeModal();
      fetchRequests();
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

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;
    const matchesSearch = search === "" || 
      (r.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    emergency: requests.filter(r => r.priority === 'emergency').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-2 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
              <Wrench className="mr-3 text-primary-500" size={24} />
              Mechanic Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage and assign professional vehicle service requests.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', count: stats.total, color: 'bg-slate-100 text-slate-700' },
            { label: 'Pending', count: stats.pending, color: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
            { label: 'Emergency', count: stats.emergency, color: 'bg-red-50 text-red-700 border border-red-200 animate-pulse' },
            { label: 'Assigned', count: stats.assigned, color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
            { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-50 text-blue-700 border border-blue-200' },
            { label: 'Completed', count: stats.completed, color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl p-4 flex flex-col justify-between ${stat.color}`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">{stat.label}</p>
              <p className="text-2xl font-black">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 mb-6">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <Input placeholder="Search by name, email, service or location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-full" />
           </div>
           <div className="flex gap-4">
             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm outline-none dark:text-white">
               <option value="all">All Statuses</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
               <option value="assigned">Assigned</option>
               <option value="in-progress">In Progress</option>
               <option value="completed">Completed</option>
               <option value="rejected">Rejected</option>
               <option value="cancelled">Cancelled</option>
             </select>
             <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm outline-none dark:text-white">
               <option value="all">All Priorities</option>
               <option value="emergency">Emergency</option>
               <option value="high">High</option>
               <option value="medium">Medium</option>
               <option value="low">Low</option>
             </select>
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
                className={`bg-white dark:bg-slate-900 rounded-lg shadow-sm border overflow-hidden relative ${req.priority === 'emergency' ? 'border-red-500 shadow-red-500/10' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {req.priority === 'emergency' && (
                   <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[30px] pointer-events-none" />
                )}
                
                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                  <div className="flex-1 flex gap-6 items-center w-full">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${req.priority === 'emergency' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {req.priority === 'emergency' ? <AlertTriangle size={24} /> : <Wrench size={24} />}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">User & Service</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{req.contactName || req.user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{req.serviceType}</p>
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Location</p>
                         <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{req.location}</p>
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Priority</p>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            req.priority === 'emergency' ? 'bg-red-50 text-red-600 border-red-200' :
                            req.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                         }`}>
                           {req.priority}
                         </span>
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Status</p>
                         <Badge variant={getStatusColor(req.status)} className="capitalize text-[10px] px-2 py-0.5">
                           {req.status.replace('-', ' ')}
                         </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-auto">
                    <Button onClick={() => openModal(req)} className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6">
                      Manage
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MANAGE REQUEST MODAL */}
        <AnimatePresence>
          {selectedRequest && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col">
                  
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-20">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Wrench size={20} className="text-primary-500" /> Manage Mechanic Request
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">ID: {selectedRequest._id}</p>
                    </div>
                    <button onClick={closeModal} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 grid md:grid-cols-2 gap-8 flex-1">
                     {/* Left: Request Info */}
                     <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Request Details</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                              <span className="text-slate-500">Service</span>
                              <span className="font-bold text-slate-900 dark:text-white">{selectedRequest.serviceType}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                              <span className="text-slate-500">Priority</span>
                              <span className={`font-bold uppercase ${selectedRequest.priority === 'emergency' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{selectedRequest.priority}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                              <span className="text-slate-500">Location</span>
                              <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px] truncate">{selectedRequest.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Contact</span>
                              <span className="font-medium text-slate-900 dark:text-white text-right">{selectedRequest.contactPhone || selectedRequest.user?.phone || 'No phone'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">User Description</p>
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap">
                            {selectedRequest.description}
                          </div>
                        </div>
                     </div>

                     {/* Right: Management Form */}
                     <div className="space-y-5">
                       <div>
                         <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Update Status</label>
                         <select 
                           className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                           value={formStatus}
                           onChange={(e) => setFormStatus(e.target.value)}
                         >
                           <option value="pending">Pending Review</option>
                           <option value="approved">Approved</option>
                           <option value="assigned">Assigned</option>
                           <option value="in-progress">In Progress</option>
                           <option value="completed">Completed</option>
                           <option value="rejected">Rejected</option>
                           <option value="cancelled">Cancelled</option>
                         </select>
                       </div>

                       {formStatus === 'rejected' && (
                         <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                           <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Rejection Reason</label>
                           <Input placeholder="Why was this rejected?" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                         </motion.div>
                       )}

                       {(formStatus === 'assigned' || formStatus === 'in-progress' || formStatus === 'completed') && (
                         <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-4 p-4 border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl">
                           <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1"><UserIcon size={14}/> Assignment Details</p>
                           <Input placeholder="Mechanic Name" value={assignedMechanicName} onChange={e => setAssignedMechanicName(e.target.value)} />
                           <Input placeholder="Mechanic Phone" value={assignedMechanicPhone} onChange={e => setAssignedMechanicPhone(e.target.value)} />
                           <Input placeholder="Estimated Cost (NPR)" type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} />
                         </motion.div>
                       )}

                       {formStatus === 'completed' && (
                         <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-4 p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl">
                           <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Completion Details</p>
                           <Input placeholder="Final Cost (NPR)" type="number" value={finalCost} onChange={e => setFinalCost(e.target.value)} />
                           <textarea placeholder="Completion notes..." rows={2} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} />
                         </motion.div>
                       )}

                       <div>
                         <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Internal Admin Notes</label>
                         <textarea placeholder="Visible to admins and users..." rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
                       </div>
                     </div>
                  </div>
                  
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 sticky bottom-0">
                    <Button variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleUpdate} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8">Save Changes</Button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default AdminMechanicsPage;
