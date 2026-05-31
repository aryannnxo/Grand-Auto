import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Calendar, MessageSquare, CarFront, Edit3, ArrowRight,
  ShieldCheck, Bell, LogOut, ChevronRight, Clock, CheckCircle2,
  XCircle, Car, Search
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API = "http://localhost:5000";

// ── Booking status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { color: "amber",  icon: Clock,         label: "Pending" },
    approved: { color: "emerald", icon: CheckCircle2, label: "Approved" },
    rejected: { color: "rose",   icon: XCircle,       label: "Rejected" },
    paid:     { color: "blue",   icon: CheckCircle2,  label: "Paid" },
    completed:{ color: "slate",  icon: CheckCircle2,  label: "Completed" },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  const c = cfg.color;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
      bg-${c}-50 text-${c}-600 border border-${c}-200`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ── Card container ────────────────────────────────────────────────────
const DashCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

// ── Quick action button ───────────────────────────────────────────────
const QuickBtn = ({ icon: Icon, label, to, color = "slate" }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-${color}-200 hover:bg-${color}-50 transition-all group`}
    >
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 flex items-center justify-center transition-colors`}>
        <Icon size={20} className={`text-${color}-500`} />
      </div>
      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 text-center leading-tight">{label}</span>
    </button>
  );
};

// ══════════════════════════════════════════════════════════════════════
export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ── state
  const [user, setUser]                 = useState(null);
  const [bookings, setBookings]         = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ── redirect if not logged in
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [userRes, bookingsRes, chatsRes] = await Promise.allSettled([
        axios.get(`${API}/api/users/me`,    { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/bookings/my`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/chats`,       { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (userRes.status === "fulfilled") {
        const u = userRes.value.data;
        setUser(u);
        setCurrentUserId(u._id);
        localStorage.setItem("userId", u._id || "");
        localStorage.setItem("userName", u.name || "");
        localStorage.setItem("userEmail", u.email || "");
      }
      if (bookingsRes.status === "fulfilled") {
        setBookings(bookingsRes.value.data || []);
      }
      if (chatsRes.status === "fulfilled") {
        setConversations(chatsRes.value.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userName     = user?.name  || localStorage.getItem("userName")  || "User";
  const userEmail    = user?.email || localStorage.getItem("userEmail") || "";
  const firstLetter  = userName.charAt(0).toUpperCase();
  const profileImage = user?.profileImage;
  const isVerified   = user?.isVerifiedOwner;

  // ── unread message count
  const unreadCount = conversations.filter(c =>
    c.unreadBy?.some(id => id === currentUserId || id?._id === currentUserId)
  ).length;

  // ── latest chat
  const latestChat = conversations[0];
  const getOtherUser = (conv) => {
    if (!conv || !currentUserId) return null;
    return conv.customer?._id === currentUserId ? conv.owner : conv.customer;
  };

  // ── recent bookings (last 3)
  const recentBookings = bookings.slice(0, 3);

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-16">

        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-1">My Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-base">Manage your profile, bookings and messages from one place.</p>
        </motion.div>

        {/* ── Three Main Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Card 1: Profile */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
            <DashCard className="h-full">
              {/* Colour bar */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
              <div className="p-6 flex flex-col flex-1">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative shrink-0">
                    {profileImage ? (
                      <img
                        src={`${API}${profileImage}`}
                        alt={userName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                        {firstLetter}
                      </div>
                    )}
                    {isVerified && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <ShieldCheck size={12} className="text-white" />
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-base font-black text-slate-900 truncate">{userName}</h2>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-sm rounded-xl border border-slate-200 hover:border-blue-200 transition-all"
                  >
                    <User size={16} /> View Profile
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                </div>
              </div>
            </DashCard>
          </motion.div>

          {/* Card 2: Booking History */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <DashCard className="h-full">
              <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 w-full" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <Calendar size={18} className="text-violet-500" />
                    </div>
                    <h3 className="font-black text-slate-900 text-base">Bookings</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {bookings.length} total
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 mb-4">
                  {recentBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                      <Calendar size={32} className="mb-2 opacity-30" />
                      <p className="text-xs font-medium">No bookings yet.</p>
                    </div>
                  ) : (
                    recentBookings.map((b) => (
                      <div key={b._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <Car size={15} className="text-slate-500" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {b.vehicle?.brand} {b.vehicle?.model || "Vehicle"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-600 font-bold text-sm rounded-xl border border-slate-200 hover:border-violet-200 transition-all"
                  >
                    <Calendar size={16} /> View All Bookings
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                </div>
              </div>
            </DashCard>
          </motion.div>

          {/* Card 3: Chats / Messages */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
            <DashCard className="h-full">
              <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-400 w-full" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <MessageSquare size={18} className="text-cyan-500" />
                    </div>
                    <h3 className="font-black text-slate-900 text-base">Messages</h3>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-xs font-black text-white bg-blue-500 px-2.5 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex-1 mb-4">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                      <MessageSquare size={32} className="mb-2 opacity-30" />
                      <p className="text-xs font-medium">No messages yet.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Start a chat from a vehicle page.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {conversations.slice(0, 3).map((conv) => {
                        const other = getOtherUser(conv);
                        const isUnread = conv.unreadBy?.some(id => id === currentUserId || id?._id === currentUserId);
                        return (
                          <button
                            key={conv._id}
                            onClick={() => navigate(`/messages?chatId=${conv._id}`)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {other?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className={`text-xs font-bold text-slate-800 truncate ${isUnread ? "text-slate-900" : ""}`}>
                                {other?.name || "User"}
                              </p>
                              <p className={`text-[10px] truncate ${isUnread ? "font-bold text-slate-700" : "text-slate-400"}`}>
                                {conv.lastMessage || "No messages yet"}
                              </p>
                            </div>
                            {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => navigate("/messages")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-600 font-bold text-sm rounded-xl border border-slate-200 hover:border-cyan-200 transition-all"
                  >
                    <MessageSquare size={16} /> Open Messages
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                </div>
              </div>
            </DashCard>
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickBtn icon={Search}        label="Browse Fleet"          to="/listings"  color="blue"   />
            <QuickBtn icon={Edit3}         label="Edit Profile"          to="/profile"   color="violet" />
            <QuickBtn icon={Calendar}      label="Booking History"       to="/profile"   color="purple" />
            <QuickBtn icon={MessageSquare} label="Open Messages"         to="/messages"  color="cyan"   />
          </div>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="flex justify-end"
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-all shadow-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
