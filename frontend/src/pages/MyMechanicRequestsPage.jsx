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
  FileText
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

const MyMechanicRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchRequests();
  }, [navigate]);

  const handleComplete = async (id) => {
    if (!window.confirm("Are you sure the mechanic has finished the work?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/mechanics/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list
      window.location.reload();
    } catch (err) {
      alert("Failed to complete request");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative pb-24">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px]" />
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
              <Wrench className="mr-3 text-primary-500" size={32} />
              Mechanic Requests
            </h1>
          </div>
          
          <Button variant="primary" onClick={() => navigate('/mechanic/book')}>
            Book a Mechanic
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Loading requests...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
              <Wrench size={40} className="text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">No requests found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">You haven't made any requests for mechanic assistance yet.</p>
            <Button variant="primary" size="lg" onClick={() => navigate('/mechanic/book')}>Request Help Now</Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {requests.map((req, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={req._id}
                  className="glass-card p-6 border-l-4"
                  style={{ borderLeftColor: 
                    req.status === 'completed' || req.status === 'approved' ? '#10b981' : 
                    req.status === 'in-progress' ? '#f59e0b' : 
                    req.status === 'assigned' ? '#3b82f6' : 
                    req.status === 'cancelled' || req.status === 'rejected' ? '#ef4444' : '#6366f1' 
                  }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant={getStatusColor(req.status)} className="uppercase text-xs font-bold tracking-wider">
                          {req.status}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                          {req.serviceType}
                        </span>
                      </div>
                      
                      {req.vehicle && (
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                          {req.vehicle.brand} {req.vehicle.model}
                        </h4>
                      )}
                      
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 text-primary-500" /> 
                          <span className="font-medium text-slate-800 dark:text-slate-200">Location:</span> 
                          <span className="ml-2">{req.location}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays size={16} className="mr-2 text-primary-500" /> 
                          <span className="font-medium text-slate-800 dark:text-slate-200">Needed On:</span> 
                          <span className="ml-2">{new Date(req.requestedDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-start mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <FileText size={16} className="mr-2 text-primary-500 mt-0.5" /> 
                          <p className="flex-1 italic">{req.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-64 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Service Details</h5>
                        
                        {req.assignedMechanic ? (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-1">Assigned Mechanic</p>
                            <p className="font-bold text-slate-900 dark:text-white">{req.assignedMechanic}</p>
                          </div>
                        ) : (
                          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-xl flex items-start">
                            <AlertCircle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                            Pending assignment. We'll update you shortly.
                          </div>
                        )}
                        
                        {req.adminNotes && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm">
                            <p className="text-xs text-slate-500 mb-1">Notes from Admin</p>
                            <p className="text-slate-700 dark:text-slate-300">{req.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {(req.status === 'assigned' || req.status === 'in-progress' || req.status === 'approved') && (
                        <button 
                          onClick={() => handleComplete(req._id)}
                          className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                          Mark Completed
                        </button>
                      )}
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
