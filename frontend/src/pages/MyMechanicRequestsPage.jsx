import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, 
  MapPin, 
  CalendarDays, 
  ChevronLeft, 
  AlertCircle,
  FileText,
  Clock,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

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

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'medium': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'high': return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'emergency': return 'bg-red-50 text-red-600 border-red-200 animate-pulse';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const MyMechanicRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await axios.get(`${API}/api/mechanics/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/mechanics/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel request");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] font-body relative pb-24">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <Navbar variant="dark" />

      <main className="max-w-5xl mx-auto px-6 pt-32 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <button 
              onClick={() => navigate("/profile")}
              className="flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-2 transition-colors"
            >
              <ChevronLeft size={16} className="mr-1" /> Back to Profile
            </button>
            <h1 className="text-3xl md:text-4xl font-black font-heading text-slate-900 dark:text-white tracking-tight flex items-center">
              <Wrench className="mr-3 text-blue-600" size={32} />
              My Mechanic Requests
            </h1>
          </div>
          
          <Button onClick={() => navigate('/mechanic/book')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2.5 shadow-lg shadow-blue-600/20">
            Book a Mechanic
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Loading requests...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <Wrench size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">No requests found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">You haven't made any requests for mechanic assistance yet.</p>
            <Button onClick={() => navigate('/mechanic/book')} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl px-8 py-3">
              Request Help Now
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {requests.map((req, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={req._id}
                  className={`bg-white dark:bg-[#111111] rounded-2xl p-6 border ${req.priority === 'emergency' ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-200 dark:border-slate-800'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden`}
                >
                  {req.priority === 'emergency' && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />
                  )}

                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant={getStatusColor(req.status)} className="uppercase text-xs font-bold tracking-wider px-3 py-1">
                          {req.status.replace('-', ' ')}
                        </Badge>
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getPriorityColor(req.priority)}`}>
                          {req.priority} Priority
                        </span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {req.serviceType}
                        </span>
                      </div>
                      
                      {req.vehicle && (
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                          {req.vehicle.brand} {req.vehicle.model}
                        </h4>
                      )}
                      
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-slate-400" /> 
                          <span className="font-medium text-slate-800 dark:text-slate-200">Location:</span> 
                          <span className="ml-2">{req.location} {req.city ? `, ${req.city}` : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays size={16} className="mr-2 text-slate-400" /> 
                          <span className="font-medium text-slate-800 dark:text-slate-200">Date:</span> 
                          <span className="ml-2">{new Date(req.requestedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2 text-slate-400" /> 
                          <span className="font-medium text-slate-800 dark:text-slate-200">Time:</span> 
                          <span className="ml-2">{req.preferredTime || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-72 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        {req.assignedMechanicName ? (
                          <div className="mb-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Assigned Expert</p>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{req.assignedMechanicName}</p>
                            {req.assignedMechanicPhone && <p className="text-xs text-slate-500 mt-1">{req.assignedMechanicPhone}</p>}
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-xl flex items-start">
                            <AlertCircle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                            Pending assignment. We'll update you shortly.
                          </div>
                        )}
                        
                        {req.estimatedCost && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Est. Cost</p>
                            <p className="font-black text-slate-900 dark:text-white">NPR {req.estimatedCost}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-6">
                        {(req.status === 'pending' || req.status === 'approved') && (
                          <button 
                            onClick={() => handleCancel(req._id)}
                            className="flex-1 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        <Button 
                          onClick={() => navigate(`/mechanic-requests/${req._id}`)}
                          className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          View Details <ArrowRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyMechanicRequestsPage;
