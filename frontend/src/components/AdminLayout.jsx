import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CarFront,
  Key,
  CreditCard,
  Wrench,
  Search,
  Settings,
  HelpCircle,
  Bell,
  Headset,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  ChevronDown,
  Shield,
  User,
  MessageSquare,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

const API = "http://localhost:5000";

const AdminLayout = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Admin";
  const userEmail = localStorage.getItem("userEmail") || "admin@grandauto.com";

  // Notifications and Profile Dropdowns State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownOpen && !event.target.closest(".notif-container")) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownOpen && !event.target.closest(".profile-container")) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifDropdownOpen, profileDropdownOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_approved": return <CheckCircle size={16} />;
      case "booking_rejected": return <XCircle size={16} />;
      case "payment_successful": return <CreditCard size={16} />;
      case "booking_cancelled": return <AlertTriangle size={16} />;
      case "refund_processed": return <RefreshCw size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "booking_approved": return "bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20";
      case "booking_rejected": return "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20";
      case "payment_successful": return "bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20";
      case "booking_cancelled": return "bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20";
      case "refund_processed": return "bg-cyan-50 text-cyan-500 border-cyan-100 dark:bg-cyan-500/10 dark:border-cyan-500/20";
      default: return "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300";
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/verification", icon: Shield, label: "Owner Approvals" },
    { path: "/admin/car-verification", icon: FileCheck, label: "Car Approvals" },
    { path: "/seller/add-vehicle", icon: PlusCircle, label: "Add Vehicle" },
    { path: "/admin/cars", icon: CarFront, label: "Fleet" },
    { path: "/admin/rentals", icon: Key, label: "Rentals" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
    { path: "/admin/mechanics", icon: Wrench, label: "Mechanics" },
    { path: "/admin/messages", icon: MessageSquare, label: "Messages" }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#070b14] font-body overflow-hidden selection:bg-primary-500/30">

      {/* Left Sidebar */}
      <aside className={`transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-white dark:bg-[#0f172a] border-r border-slate-200/60 dark:border-white/5 flex flex-col py-8 h-full shrink-0 z-30 relative ${isExpanded ? 'w-72 px-6' : 'w-24 items-center'}`}>
        
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-primary-500/20 to-transparent"></div>

        <div className={`flex items-center mb-10 ${isExpanded ? 'px-2 gap-3 cursor-pointer' : 'justify-center cursor-pointer'}`} onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg shadow-primary-500/30 ring-4 ring-primary-500/10 transition-transform hover:scale-105 active:scale-95">
            G
          </div>
          <span className={`font-heading font-black text-2xl text-slate-900 dark:text-white tracking-tight transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>
            GrandAuto
          </span>
        </div>

        <div className={`flex w-full mb-8 items-center ${isExpanded ? 'px-2 justify-between' : 'justify-center font-black uppercase tracking-widest'}`}>
          <span className={`text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ${!isExpanded && 'hidden'}`}>Management</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all border border-slate-200/50 dark:border-white/5 shadow-sm"
          >
            {isExpanded ? <ChevronLeft size={18} strokeWidth={2.5} /> : <ChevronRight size={18} strokeWidth={2.5} />}
          </button>
        </div>

        <nav className={`flex flex-col gap-2 flex-1 w-full ${!isExpanded && 'items-center'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isExpanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center transition-all duration-300 group relative ${isExpanded ? 'w-full h-12 rounded-2xl px-4 justify-start' : 'w-14 h-14 rounded-2xl justify-center'
                } ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02] active:scale-100'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="shrink-0 flex items-center justify-center">
                <item.icon size={20} className={`${isExpanded ? 'group-hover:scale-110 transition-transform' : ''} stroke-[2.2px]`} />
              </div>

              <span className={`font-bold text-[15px] whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 ml-4 translate-x-0' : 'opacity-0 w-0 overflow-hidden -translate-x-4'}`}>
                {item.label}
              </span>

              {!isExpanded && (
                <div className="absolute left-full ml-5 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all translate-x-2 group-hover:translate-x-0 shadow-xl border border-white/5">
                  {item.label}
                </div>
              )}
              
              {isExpanded && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 transition-opacity ${isExpanded ? 'group-[.active]:opacity-100' : ''}`}></div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`flex flex-col gap-4 w-full mt-auto pt-6 border-t border-slate-100 dark:border-white/5 ${!isExpanded && 'items-center'}`}>
           <div 
             onClick={handleLogout}
             title="Sign Out"
             className={`flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/50 dark:border-white/5 cursor-pointer group hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20 transition-all ${!isExpanded && 'justify-center w-14 h-14'}`}
           >
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 flex items-center justify-center shrink-0 transition-colors">
                 <User size={20} className="text-slate-500 group-hover:hidden" />
                 <LogOut size={20} className="text-rose-500 hidden group-hover:block" />
              </div>
              
              {/* Normal State */}
              <div className={`${!isExpanded && 'hidden'} overflow-hidden flex-1 group-hover:hidden`}>
                 <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{userName}</p>
                 <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Administrator</p>
              </div>

              {/* Hover State */}
              <div className={`${!isExpanded && 'hidden'} overflow-hidden flex-1 hidden group-hover:block`}>
                 <p className="text-sm font-black text-rose-600 dark:text-rose-400 truncate uppercase tracking-tight">Sign Out</p>
                 <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400/80 uppercase tracking-widest">Click to log out</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7fa] dark:bg-[#030712] relative z-10 w-full lg:rounded-l-[3rem] lg:-ml-6 shadow-[-20px_0_40px_rgba(0,0,0,0.03)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.15)] border-l border-slate-200/80 dark:border-white/5 transition-all duration-500">

        {/* Top Header */}
        <header className="h-24 lg:h-28 px-8 md:px-14 flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#030712]/50 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-heading tracking-tight dark:text-white uppercase lg:text-3xl">
              Workspace
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 hidden sm:block">Control Center</p>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
               <Search size={18} className="text-slate-400" />
               <input type="text" placeholder="Global search..." className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-400 w-32 focus:w-48 transition-all" />
            </div>

            <div className="flex items-center gap-4 pl-4 lg:pl-8 border-l border-slate-200 dark:border-white/5">
               <button onClick={() => navigate('/admin/messages')} className="relative w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors" title="Messages">
                  <MessageSquare size={22} className="stroke-[2.2px]" />
               </button>

               {/* Notifications */}
               <div className="relative notif-container">
                 <button 
                   onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                   className="relative w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-white transition-colors"
                 >
                    <Bell size={22} className="stroke-[2.2px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#030712]"></span>
                    )}
                 </button>

                 <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right text-left"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">{unreadCount} new</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) handleMarkSingleRead(notif._id);
                              }}
                              className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 relative ${!notif.isRead ? "bg-primary-50/30 dark:bg-primary-900/10" : ""}`}
                            >
                              {!notif.isRead && (
                                <div className="absolute top-5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
                              )}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getIconStyle(notif.type)}`}>
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                  <h4 className={`text-sm font-semibold truncate ${!notif.isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                                    {formatRelativeTime(notif.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-xs leading-relaxed break-words ${!notif.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-500 dark:text-slate-500"}`}>
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 px-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                              <Bell size={20} className="opacity-40" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">All caught up!</h4>
                              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">No notifications right now.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                 </AnimatePresence>
               </div>
               
               {/* Profile Dropdown */}
               <div className="relative profile-container">
                 <div 
                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                   className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 group"
                 >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                    {getInitials(userName)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5 text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {userName} <ChevronDown size={14} className="text-slate-400" />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right text-left"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                        <p className="font-bold text-white text-sm truncate">{userName}</p>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Administrator</p>
                      </div>

                      <div className="p-2 flex flex-col gap-1">
                        <Link 
                          to="/profile" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        
                        <Link 
                          to="/admin/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>

                        <Link 
                          to="/admin/messages" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <MessageSquare size={16} />
                          Messages
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto px-8 md:px-14 py-6 w-full transition-all scroll-smooth">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
