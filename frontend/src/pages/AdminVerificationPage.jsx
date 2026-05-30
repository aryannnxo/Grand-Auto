import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, FileText, Check, X, Search, ShieldCheck, Mail, Phone, MapPin, CreditCard, ExternalLink } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const AdminVerificationPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(`${API}/api/admin/owner-applications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
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
      await axios.put(`${API}/api/admin/owner-applications/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` }});
      fetchApplications();
    } catch (err) { alert(err.response?.data?.msg || "Failed to approve"); }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/owner-applications/${id}/reject`, { reason: rejectionReason }, { headers: { Authorization: `Bearer ${token}` }});
      setRejectingId(null); setRejectionReason(""); fetchApplications();
    } catch (err) { alert(err.response?.data?.msg || "Failed to reject"); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Admin Workspace
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">Owner Applications</h1>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            {['pending', 'approved', 'rejected'].map(status => (
               <button 
                  key={status} onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${filter === status ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
               >
                 {status} <Badge variant={status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'outline'} className="ml-2 scale-90">{applications.length > 0 && filter === status ? applications.length : ''}</Badge>
               </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No {filter} applications</h3>
            <p className="text-slate-500">There are currently no owner applications in this category.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                key={app._id} 
                className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 flex flex-col gap-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">{app.fullName}</h3>
                       <Badge variant={filter === 'approved' ? 'success' : filter === 'rejected' ? 'danger' : 'warning'}>{filter}</Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                       <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <Mail size={18} className="text-primary-500 mt-0.5"/>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{app.email}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <Phone size={18} className="text-primary-500 mt-0.5"/>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{app.phone}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <MapPin size={18} className="text-primary-500 mt-0.5"/>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{app.address}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <CreditCard size={18} className="text-primary-500 mt-0.5"/>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID / License</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{app.idNumber} / {app.licenseNumber}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-72 flex flex-col gap-3">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 hidden lg:block">Verification Docs</p>
                     <a href={`${API}${app.ownershipProof}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:border-primary-500 hover:text-primary-600 transition-colors group">
                        <FileText size={18} className="text-primary-500"/> View Ownership Proof <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                     </a>
                     <a href={`${API}${app.idPhoto}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:border-primary-500 hover:text-primary-600 transition-colors group">
                        <Users size={18} className="text-primary-500"/> View ID Photo <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                     </a>
                  </div>
                </div>

                {app.reason && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason to join</p>
                    <p className="italic text-slate-600 dark:text-slate-400">"{app.reason}"</p>
                  </div>
                )}

                <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {filter === "pending" && (
                    <div className="flex flex-col gap-4">
                      {rejectingId === app._id ? (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50">
                          <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-2">Reason for rejection</h4>
                          <textarea rows={2} placeholder="Type reason here..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-3" />
                          <div className="flex gap-3 text-sm">
                            <button onClick={() => handleReject(app._id)} className="px-4 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors">Confirm Reject</button>
                            <button onClick={() => { setRejectingId(null); setRejectionReason(""); }} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                          <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20" onClick={() => setRejectingId(app._id)}><X size={18} className="mr-2" /> Reject Application</Button>
                          <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" onClick={() => handleApprove(app._id)}><Check size={18} className="mr-2" /> Approve Owner</Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {filter === "rejected" && (
                    <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                      <span className="font-bold block mb-1">Rejection Reason:</span>
                      {app.rejectionReason}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminVerificationPage;
