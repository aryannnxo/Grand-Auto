import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, CheckCircle2, Clock, MapPin, AlertTriangle, Phone, Car,
  ChevronRight, ShieldCheck, RefreshCw, User, Calendar, Zap, Eye,
  PlayCircle, Flag, Package
} from "lucide-react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

// ── Status badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status, isEmergency }) => {
  const map = {
    "pending-admin-review": { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending Review" },
    "approved": { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Approved" },
    "assigned": { cls: "bg-purple-50 text-purple-700 border-purple-200", label: "Assigned to You" },
    "accepted-by-mechanic": { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Accepted" },
    "in-progress": { cls: "bg-orange-50 text-orange-700 border-orange-200", label: "In Progress" },
    "fixed": { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Fixed" },
    "completed": { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Completed" },
  };
  const cfg = map[status] || { cls: "bg-slate-100 text-slate-500 border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      {isEmergency && <AlertTriangle size={10} className="text-red-500" />}
      {cfg.label}
    </span>
  );
};

// ── Vehicle image helper ─────────────────────────────────────────────────
const VehicleImage = ({ job }) => {
  const img = job.vehicle?.images?.[0]?.url || job.vehicle?.images?.[0] || null;
  if (img) {
    return <img src={img} alt="vehicle" className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Car size={32} className="text-slate-300" />
    </div>
  );
};

// ── Job Card ─────────────────────────────────────────────────────────────
const JobCard = ({ job, onAction, actionLoading, isAvailable = false }) => {
  const isLoading = actionLoading === job._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Emergency banner */}
      {job.isEmergency && (
        <div className="bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 flex items-center gap-2">
          <AlertTriangle size={12} /> Emergency Request — Priority Service
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-0">
        {/* Vehicle image */}
        <div className="w-full lg:w-48 h-36 lg:h-auto bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
          <VehicleImage job={job} />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 lg:p-6 flex flex-col lg:flex-row gap-4">
          {/* Left info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={job.status} isEmergency={job.isEmergency} />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {job.issueType}
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              {job.vehicle?.year && `${job.vehicle.year} `}
              {job.vehicle?.brand} {job.vehicle?.model}
              {!job.vehicle?.brand && <span className="text-slate-400 font-medium">Unknown Vehicle</span>}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
              {job.problemDescription}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-blue-500" />
                  {job.location}
                </span>
              )}
              {(job.contactPhone || job.requestedBy?.phone) && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-500" />
                  {job.contactPhone || job.requestedBy?.phone}
                </span>
              )}
              {job.requestedBy?.name && (
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-purple-500" />
                  {job.requestedBy.name}
                </span>
              )}
              {job.booking?.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-orange-500" />
                  {new Date(job.booking.startDate).toLocaleDateString()} – {new Date(job.booking.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="lg:w-48 shrink-0 flex flex-col justify-center gap-2 lg:border-l lg:border-slate-100 dark:border-slate-800 lg:pl-6">
            {isAvailable && (
              <div className="text-center">
                <button
                  onClick={() => onAction(job._id, "self-assign")}
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><User size={16} /> Assign to Me</>}
                </button>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">Pick this job and assign it to yourself</p>
              </div>
            )}

            {job.status === "assigned" && (
              <button
                onClick={() => onAction(job._id, "accept")}
                disabled={isLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Accept Job</>}
              </button>
            )}

            {job.status === "accepted-by-mechanic" && (
              <button
                onClick={() => onAction(job._id, "start")}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><PlayCircle size={16} /> Start Repair</>}
              </button>
            )}

            {job.status === "in-progress" && (
              <button
                onClick={() => onAction(job._id, "fixed")}
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <><Flag size={16} /> Mark as Fixed</>}
              </button>
            )}

            {(job.status === "fixed" || job.status === "completed") && (
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-bold text-emerald-600 text-sm">Job Completed</p>
                <p className="text-[10px] text-slate-400 mt-1">Pending admin verification</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════
export default function MechanicDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [myJobs, setMyJobs] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("available"); // "available" | "my-jobs"
  const [jobFilter, setJobFilter] = useState("Assigned"); // for my-jobs tab

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [jobsRes, availRes] = await Promise.allSettled([
        axios.get(`${API}/api/mechanics/mechanic/jobs`, { headers }),
        axios.get(`${API}/api/mechanics/mechanic/available-requests`, { headers }),
      ]);

      if (jobsRes.status === "fulfilled") {
        setMyJobs(jobsRes.value.data);
      } else {
        console.error("Jobs fetch failed:", jobsRes.reason?.response?.data);
        if (jobsRes.reason?.response?.status === 403 || jobsRes.reason?.response?.status === 404) {
          navigate("/");
          return;
        }
      }

      if (availRes.status === "fulfilled") {
        setAvailableRequests(availRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (jobId, action) => {
    try {
      setActionLoading(jobId);
      const endpoints = {
        accept: `${API}/api/mechanics/mechanic/${jobId}/accept`,
        start: `${API}/api/mechanics/mechanic/${jobId}/start`,
        fixed: `${API}/api/mechanics/mechanic/${jobId}/fixed`,
        "self-assign": `${API}/api/mechanics/mechanic/${jobId}/self-assign`,
      };
      const payload = action === "fixed" ? { mechanicNotes: "Fixed by mechanic.", finalCost: 0 } : {};
      await axios.patch(endpoints[action], payload, { headers: { Authorization: `Bearer ${token}` } });
      showToast("success", `Job successfully marked as ${action === "fixed" ? "fixed" : action + "ed"}!`);
      fetchAll();
    } catch (err) {
      showToast("error", err.response?.data?.msg || `Failed to ${action} job.`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMyJobs = () => {
    if (jobFilter === "Assigned") return myJobs.filter(j => j.status === "assigned" || j.status === "accepted-by-mechanic");
    if (jobFilter === "In Progress") return myJobs.filter(j => j.status === "in-progress");
    if (jobFilter === "Completed") return myJobs.filter(j => j.status === "fixed" || j.status === "completed");
    return myJobs;
  };

  const activeJobsCount = myJobs.filter(j => ["assigned", "accepted-by-mechanic", "in-progress"].includes(j.status)).length;
  const completedCount = myJobs.filter(j => j.status === "fixed" || j.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0a] font-body">
      <Navbar variant="dark" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl font-bold text-sm ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.type === "success" ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            Mechanic <span className="text-blue-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 font-medium">View cars needing service and manage your assigned jobs.</p>
        </motion.div>

        {/* Main Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "available", label: "Cars Needing Service", icon: Car, count: availableRequests.length },
            { id: "my-jobs", label: "My Assigned Jobs", icon: Wrench, count: myJobs.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}

          <button
            onClick={fetchAll}
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* ── AVAILABLE REQUESTS TAB ── */}
        {activeTab === "available" && (
          <div className="space-y-4">
            {availableRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <Car size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Cars Needing Service</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  When customers request mechanic help or admin approves service requests, they'll appear here.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-amber-500" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                    {availableRequests.filter(r => r.isEmergency).length} emergency · {availableRequests.length} total requests awaiting a mechanic
                  </p>
                </div>
                <AnimatePresence>
                  {availableRequests.map(req => (
                    <JobCard key={req._id} job={req} isAvailable={true} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </AnimatePresence>
              </>
            )}
          </div>
        )}

        {/* ── MY JOBS TAB ── */}
        {activeTab === "my-jobs" && (
          <div>
            {/* Sub-filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {["Assigned", "In Progress", "Completed"].map(f => (
                <button
                  key={f}
                  onClick={() => setJobFilter(f)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap border ${
                    jobFilter === f
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                  }`}
                >
                  {f}
                  <span className="ml-1.5 text-[11px] opacity-70">
                    ({f === "Assigned" ? myJobs.filter(j => j.status === "assigned" || j.status === "accepted-by-mechanic").length
                      : f === "In Progress" ? myJobs.filter(j => j.status === "in-progress").length
                      : myJobs.filter(j => j.status === "fixed" || j.status === "completed").length})
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredMyJobs().length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                >
                  <Clock size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {jobFilter.toLowerCase()} jobs</h3>
                  <p className="text-slate-500 text-sm">Jobs assigned to you will appear here.</p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {filteredMyJobs().map(job => (
                    <JobCard key={job._id} job={job} isAvailable={false} actionLoading={actionLoading} onAction={handleAction} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
