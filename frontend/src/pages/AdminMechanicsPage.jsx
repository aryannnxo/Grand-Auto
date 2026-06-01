import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, MapPin, CalendarDays, User as UserIcon, Car, FileText, 
  Search, Filter, AlertTriangle, CheckCircle2, Phone, X, AlertCircle,
  Plus, Users
} from "lucide-react";

const API = "http://localhost:5000";

const AdminMechanicsPage = () => {
  const [activeTab, setActiveTab] = useState("Requests"); // "Requests" or "Mechanics"
  
  // Requests State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  
  // Mechanics State
  const [mechanics, setMechanics] = useState([]);
  const [loadingMechanics, setLoadingMechanics] = useState(true);

  // General state
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Request Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formStatus, setFormStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [selectedMechanicId, setSelectedMechanicId] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");

  // Mechanic Modal State
  const [showMechanicModal, setShowMechanicModal] = useState(false);
  const [mechanicForm, setMechanicForm] = useState({
    name: "", email: "", phone: "", specialization: "General Mechanic", location: "", experienceYears: "", password: ""
  });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [reqRes, mechRes] = await Promise.all([
        axios.get(`${API}/api/mechanics/admin`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/mechanics/admin/mechanics-list`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(reqRes.data);
      setMechanics(mechRes.data);
    } catch (err) {
      console.error("Failed to fetch admin mechanic data", err);
    } finally {
      setLoadingRequests(false);
      setLoadingMechanics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRequestModal = (req) => {
    setSelectedRequest(req);
    setFormStatus(req.status);
    setAdminNotes(req.adminNotes || "");
    setRejectionReason(req.rejectionReason || "");
    setFinalCost(req.finalCost || "");
    setSelectedMechanicId(req.assignedMechanic?._id || "");
    setEstimatedCost(req.estimatedCost || "");
  };

  const handleUpdateRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (formStatus === "assigned") {
        if (!selectedMechanicId) return showToast("error", "Please select a mechanic to assign");
        await axios.patch(`${API}/api/mechanics/admin/${selectedRequest._id}/assign`, {
          mechanicId: selectedMechanicId, estimatedCost, adminNotes
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.patch(`${API}/api/mechanics/admin/${selectedRequest._id}/status`, {
          status: formStatus, adminNotes, rejectionReason, finalCost
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      
      showToast("success", "Request updated successfully");
      setSelectedRequest(null);
      fetchData();
    } catch (err) {
      showToast("error", "Failed to update request");
    }
  };

  const handleAddMechanic = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/mechanics/admin/mechanics`, mechanicForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("success", "Mechanic added successfully");
      setShowMechanicModal(false);
      setMechanicForm({ name: "", email: "", phone: "", specialization: "General Mechanic", location: "", experienceYears: "", password: "" });
      fetchData();
    } catch (err) {
      showToast("error", err.response?.data?.msg || "Failed to add mechanic");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-2 pb-6 px-4">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-xl text-white font-bold text-sm shadow-lg ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
            <Wrench className="mr-3 text-blue-500" size={24} />
            Mechanic Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage service requests and mechanic personnel.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button onClick={() => setActiveTab("Requests")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "Requests" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          Service Requests
        </button>
        <button onClick={() => setActiveTab("Mechanics")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "Mechanics" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
          Mechanic Personnel
        </button>
      </div>

      {/* Mechanics Tab */}
      {activeTab === "Mechanics" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">All Mechanics</h2>
            <button onClick={() => setShowMechanicModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700">
              <Plus size={16} /> Add Mechanic
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map(m => (
              <div key={m._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-slate-500">{m.specialization}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2"><Phone size={14} /> {m.phone}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {m.location || "No location"}</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${(m.availabilityStatus || 'available') === 'available' ? 'bg-emerald-100 text-emerald-700' : (m.availabilityStatus || 'available') === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {m.availabilityStatus || 'available'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "Requests" && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            {requests.map(req => (
              <div key={req._id} onClick={() => openRequestModal(req)} className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {req.isEmergency && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"><AlertTriangle size={10} className="inline mr-1"/>Emergency</span>}
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">{req.status.replace(/-/g, " ")}</span>
                    <span className="text-xs font-bold text-slate-400">Source: {req.requestSource}</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{req.vehicle?.brand} {req.vehicle?.model}</h3>
                <p className="text-sm text-slate-500 font-medium mb-3">Issue: {req.issueType}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><UserIcon size={12}/> {req.requestedBy?.name}</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/> {req.location}</span>
                  {req.assignedMechanic && <span className="flex items-center gap-1 text-blue-600 font-bold"><Wrench size={12}/> {req.assignedMechanic.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Mechanic Modal */}
      {showMechanicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-xl relative">
            <button onClick={() => setShowMechanicModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-4">Add Mechanic</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={mechanicForm.name} onChange={e => setMechanicForm({...mechanicForm, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="email" placeholder="Email" value={mechanicForm.email} onChange={e => setMechanicForm({...mechanicForm, email: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="text" placeholder="Phone" value={mechanicForm.phone} onChange={e => setMechanicForm({...mechanicForm, phone: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="password" placeholder="Login Password" value={mechanicForm.password} onChange={e => setMechanicForm({...mechanicForm, password: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="text" placeholder="Location" value={mechanicForm.location} onChange={e => setMechanicForm({...mechanicForm, location: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              <button onClick={handleAddMechanic} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Create Mechanic</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <h2 className="text-xl font-bold mb-6">Update Service Request</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-xs font-bold text-slate-400 block mb-1">Vehicle</span>
                <span className="font-bold">{selectedRequest.vehicle?.brand} {selectedRequest.vehicle?.model}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border">
                <span className="text-xs font-bold text-slate-400 block mb-1">Requester</span>
                <span className="font-bold">{selectedRequest.requestedBy?.name} ({selectedRequest.requestSource})</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border col-span-2">
                <span className="text-xs font-bold text-slate-400 block mb-1">Description</span>
                <span className="font-medium">{selectedRequest.problemDescription}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Status</label>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold">
                  <option value="pending-admin-review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="assigned">Assigned</option>
                  <option value="accepted-by-mechanic">Accepted By Mechanic</option>
                  <option value="in-progress">In Progress</option>
                  <option value="fixed">Fixed</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {formStatus === "assigned" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Assign Mechanic</label>
                  <select value={selectedMechanicId} onChange={e => setSelectedMechanicId(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm">
                    <option value="">Select a mechanic...</option>
                    {mechanics.filter(m => (m.availabilityStatus || 'available') !== "busy").map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.specialization})</option>
                    ))}
                  </select>
                </div>
              )}

              {formStatus === "assigned" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Estimated Cost</label>
                  <input type="number" value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="e.g. 5000" />
                </div>
              )}

              {formStatus === "rejected" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Rejection Reason</label>
                  <input type="text" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Why is this rejected?" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Admin Notes</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-sm" placeholder="Internal notes..." rows={2} />
              </div>
            </div>

            <button onClick={handleUpdateRequest} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMechanicsPage;
