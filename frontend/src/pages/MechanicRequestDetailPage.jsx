import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Wrench, MapPin, CalendarDays, Clock, Phone, Mail, 
  CheckCircle2, AlertTriangle, User, FileText, Banknote
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const MechanicRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await axios.get(`${API}/api/mechanics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequest(res.data);
    } catch (err) {
      console.error("Failed to fetch request detail", err);
      setError("Failed to load request details. You might not have permission to view this.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/mechanics/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequest();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080808] flex flex-col items-center justify-center font-body">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080808] font-body">
        <Navbar variant="dark" />
        <div className="flex flex-col items-center justify-center p-20 text-center max-w-lg mx-auto pt-40">
          <AlertTriangle size={48} className="text-red-500 mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{error || "Request not found"}</h3>
          <Button onClick={() => navigate('/mechanic/my-requests')} className="mt-8">Go Back</Button>
        </div>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'approved', 'assigned', 'in-progress', 'completed'];
    return statuses.indexOf(status);
  };

  const currentStep = getStatusIndex(request.status);
  const isCancelled = request.status === 'cancelled';
  const isRejected = request.status === 'rejected';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] font-body relative pb-24">
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <Navbar variant="dark" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 relative z-10">
        <button 
          onClick={() => navigate("/mechanic/my-requests")}
          className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Requests
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-heading text-slate-900 dark:text-white tracking-tight flex items-center">
              Request Details
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">ID: {request._id}</p>
          </div>
          <div className="flex gap-3">
            {request.priority === 'emergency' && (
              <Badge className="bg-red-500 text-white border-red-600 font-bold px-3 py-1 animate-pulse">EMERGENCY</Badge>
            )}
            <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-3 py-1 uppercase">{request.status}</Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden relative">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-wider text-sm">Status Tracker</h3>
          
          {isCancelled ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 text-center">
              <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-red-600 dark:text-red-400">Request Cancelled</h4>
              <p className="text-sm text-red-500/80 mt-1">You have cancelled this mechanic request.</p>
            </div>
          ) : isRejected ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 text-center">
              <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-red-600 dark:text-red-400">Request Rejected</h4>
              <p className="text-sm text-red-500/80 mt-1">Reason: {request.rejectionReason || "No reason provided"}</p>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0 overflow-hidden hidden sm:block">
                <motion.div 
                  className="h-full bg-blue-600 dark:bg-blue-500" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(Math.max(0, currentStep) / 4) * 100}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                {[
                  { label: "Submitted", desc: "Pending Review", icon: FileText, idx: 0 },
                  { label: "Approved", desc: "Request Accepted", icon: CheckCircle2, idx: 1 },
                  { label: "Assigned", desc: "Mechanic Dispatched", icon: User, idx: 2 },
                  { label: "In Progress", desc: "Fixing Vehicle", icon: Wrench, idx: 3 },
                  { label: "Completed", desc: "Service Done", icon: CheckCircle2, idx: 4 }
                ].map((step, idx) => {
                  const isActive = currentStep >= step.idx;
                  const isCurrent = currentStep === step.idx;
                  
                  return (
                    <div key={idx} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3 w-full sm:w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${
                        isActive 
                          ? 'bg-blue-600 border-white dark:border-[#111111] text-white shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-800 border-white dark:border-[#111111] text-slate-400'
                      } transition-colors duration-500 relative z-10`}>
                        <step.icon size={16} strokeWidth={isCurrent ? 3 : 2} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.label}</p>
                        <p className={`text-xs ${isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400'} hidden sm:block`}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm border-b border-slate-100 dark:border-slate-800 pb-4">Service Details</h3>
               
               <div className="grid sm:grid-cols-2 gap-6 mb-8">
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
                   <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                     <Wrench size={16} className="text-blue-500" /> {request.serviceType}
                   </p>
                 </div>
                 {request.vehicle && (
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vehicle</p>
                     <p className="font-medium text-slate-900 dark:text-white">{request.vehicle.brand} {request.vehicle.model}</p>
                   </div>
                 )}
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                   <p className="font-medium text-slate-900 dark:text-white flex flex-col">
                     <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500 shrink-0" /> {request.location}</span>
                     {request.city && <span className="text-sm text-slate-500 ml-6">{request.city}</span>}
                   </p>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Preferred Time</p>
                   <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                     <CalendarDays size={16} className="text-blue-500" /> {new Date(request.requestedDate).toLocaleDateString()}
                   </p>
                   {request.preferredTime && <p className="text-sm text-slate-500 ml-6">{request.preferredTime}</p>}
                 </div>
               </div>

               <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Issue Description</p>
                 <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                   {request.description}
                 </div>
               </div>
            </div>

            {/* Notes */}
            {(request.adminNotes || request.completionNotes) && (
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl p-6 md:p-8 border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> Provider Notes
                </h3>
                <div className="space-y-4">
                  {request.adminNotes && (
                    <div>
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-1">Admin Update</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111111] p-4 rounded-xl shadow-sm">{request.adminNotes}</p>
                    </div>
                  )}
                  {request.completionNotes && (
                    <div>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-widest mb-1">Completion Summary</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-[#111111] p-4 rounded-xl shadow-sm">{request.completionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Mechanic Card */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none" />
               <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                 <User size={16} className="text-blue-400" /> Assigned Mechanic
               </h3>
               
               {request.assignedMechanicName ? (
                 <div className="space-y-4">
                   <div>
                     <p className="text-xs text-slate-400 uppercase tracking-widest">Name</p>
                     <p className="font-bold text-white text-lg">{request.assignedMechanicName}</p>
                   </div>
                   {request.assignedMechanicPhone && (
                     <div>
                       <p className="text-xs text-slate-400 uppercase tracking-widest">Contact</p>
                       <p className="font-medium text-white flex items-center gap-2"><Phone size={14} className="text-blue-400"/> {request.assignedMechanicPhone}</p>
                     </div>
                   )}
                   {request.assignedMechanicEmail && (
                     <div>
                       <p className="font-medium text-white flex items-center gap-2"><Mail size={14} className="text-blue-400"/> {request.assignedMechanicEmail}</p>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="py-4 text-center">
                   <AlertTriangle size={24} className="text-slate-500 mx-auto mb-2" />
                   <p className="text-sm text-slate-400">No mechanic assigned yet.</p>
                 </div>
               )}
            </div>

            {/* Cost Card */}
            {(request.estimatedCost || request.finalCost) && (
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Banknote size={16} className="text-emerald-500" /> Cost Summary
                </h3>
                <div className="space-y-3 pt-2">
                  {request.estimatedCost && (
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm text-slate-500">Estimated Cost</span>
                      <span className="font-medium text-slate-900 dark:text-white">NPR {request.estimatedCost.toLocaleString()}</span>
                    </div>
                  )}
                  {request.finalCost && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Final Cost</span>
                      <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">NPR {request.finalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancel Action */}
            {(request.status === 'pending' || request.status === 'approved') && (
              <button 
                onClick={handleCancel}
                className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/30 hover:border-red-500 dark:hover:border-red-500 text-red-600 dark:text-red-400 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-sm"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MechanicRequestDetailPage;
