import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Car, LayoutDashboard, Menu, X, LogOut, FileText, Wrench, Bell, CheckCircle, XCircle, AlertTriangle, RefreshCw, CreditCard } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isVerifiedOwner, setIsVerifiedOwner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

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

  useEffect(() => {
    let intervalId;
    if (isLoggedIn) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 15000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownOpen && !event.target.closest(".notif-container")) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifDropdownOpen]);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark single read error:", err);
    }
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
      case "booking_approved":
        return <CheckCircle size={16} />;
      case "booking_rejected":
        return <XCircle size={16} />;
      case "payment_successful":
        return <CreditCard size={16} />;
      case "booking_cancelled":
        return <AlertTriangle size={16} />;
      case "refund_processed":
        return <RefreshCw size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "booking_approved":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "booking_rejected":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "payment_successful":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "booking_cancelled":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "refund_processed":
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      default:
        return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedImage = localStorage.getItem("userProfileImage");
    const storedRole = localStorage.getItem("userRole");
    const storedVerified = localStorage.getItem("isVerifiedOwner") === "true";

    if (token) {
      setIsLoggedIn(true);
      setUserName(storedName || "");
      setUserEmail(storedEmail || "");
      setProfileImage(storedImage || "");
      setUserRole(storedRole || "user");
      setIsVerifiedOwner(storedVerified);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return "U";
  };

  // Nav item style based on active state
  const getNavStyle = (path) => {
    const isActive = location.pathname === path || (path === "/listings" && location.pathname.startsWith("/listings"));
    if (isActive) {
      return "bg-white text-slate-900 rounded-full px-5 py-2 font-bold text-sm tracking-wide flex items-center gap-2 shadow-sm";
    }
    return "text-slate-300 hover:text-white rounded-full px-5 py-2 font-medium text-sm tracking-wide flex items-center gap-2 transition-colors";
  };

  return (
    <nav className="bg-[#070b14] sticky top-0 z-50 w-full pt-4 pb-4">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 mr-1">
              {/* Soft glow effect behind the logo */}
              <div className="absolute inset-0 bg-white rounded-xl blur-[8px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              
              {/* Premium dark container */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b0f19] to-slate-900 border border-white/10 flex items-center justify-center z-10">
                 {/* Stylized abstract 'G' */}
                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                    <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5c2.3 0 4.4.9 6 2.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M12 12h8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                 </svg>
              </div>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              GrandAuto
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2 bg-[#1A1F2B] p-1.5 rounded-full">
            <Link to="/" className={getNavStyle("/")}>
              Home
            </Link>
            <Link to="/listings" className={getNavStyle("/listings")}>
              Fleet
            </Link>

            {isLoggedIn && !isVerifiedOwner && userRole !== "admin" && (
              <Link to="/apply-owner" className={getNavStyle("/apply-owner")}>Become a Seller</Link>
            )}
            
            {isLoggedIn && isVerifiedOwner && userRole !== "admin" && (
              <Link to="/seller/dashboard" className={getNavStyle("/seller/dashboard")}>Dashboard</Link>
            )}

            {isLoggedIn && userRole === "admin" && (
              <Link to="/admin/dashboard" className={getNavStyle("/admin/dashboard")}>
                 Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Notifications Bell */}
              <div className="relative notif-container">
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center w-9 h-9 border ${
                    notifDropdownOpen 
                      ? "bg-primary-500/20 border-primary-500/40 text-white shadow-[0_0_15px_rgba(75,107,251,0.25)]" 
                      : "bg-[#1A1F2B] border-white/5 hover:border-white/10 hover:bg-[#232A3B] text-slate-300 hover:text-white"
                  }`}
                >
                  <motion.div
                    animate={unreadCount > 0 ? {
                      rotate: [0, -15, 12, -10, 8, -4, 0],
                      transition: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2.5,
                        ease: "easeInOut",
                        repeatDelay: 2
                      }
                    } : { rotate: 0 }}
                    whileHover={{ 
                      rotate: [0, -20, 15, -15, 10, -5, 0],
                      transition: { duration: 0.5 } 
                    }}
                  >
                    <Bell size={18} />
                  </motion.div>

                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#070b14] shadow-lg shadow-rose-500/30"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#1A1F2B]/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 origin-top-right text-left"
                    >
                      {/* Header */}
                      <div className="p-5 pb-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-black text-white text-sm tracking-wide uppercase">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-wider">{unreadCount} new</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/50">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) handleMarkSingleRead(notif._id);
                              }}
                              className={`p-4 flex gap-3 hover:bg-slate-800/30 cursor-pointer transition-all duration-200 relative ${!notif.isRead ? "bg-slate-800/10" : ""}`}
                            >
                              {/* Unread dot indicator */}
                              {!notif.isRead && (
                                <div className="absolute top-5 left-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                              )}

                              {/* Icon container */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getIconStyle(notif.type)}`}>
                                {getNotificationIcon(notif.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                  <h4 className={`text-xs font-bold truncate ${!notif.isRead ? "text-white" : "text-slate-300"}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[9px] text-slate-500 font-bold shrink-0">
                                    {formatRelativeTime(notif.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-relaxed break-words ${!notif.isRead ? "text-slate-200" : "text-slate-400"}`}>
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 px-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-slate-800/30 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-800/40">
                              <Bell size={20} className="opacity-40 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-300">All caught up!</h4>
                              <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">No notifications right now. We'll update you when there's news!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/profile" className="flex items-center gap-2 bg-[#1A1F2B] pl-2 pr-4 py-1.5 rounded-full hover:bg-[#232A3B] transition-colors">
                {profileImage ? (
                  <img src={`${API}${profileImage}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials()}
                  </div>
                )}
                <span className="text-sm text-white font-medium block truncate max-w-[100px]">
                  {userName || "User"}
                </span>
                <span className="text-slate-400 ml-1 text-xs px-2 py-0.5 rounded bg-slate-800">
                  {userRole === 'admin' ? 'Admin' : isVerifiedOwner ? 'Seller' : 'User'}
                </span>
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors hidden sm:block p-2">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
             <div className="flex items-center gap-3">
               <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium px-4">
                 Login
               </button>
               <button onClick={() => navigate('/signup')} className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
                 Sign Up
               </button>
             </div>
          )}

           {/* Mobile Toggle */}
           <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
             className="lg:hidden p-2 text-slate-300 hover:text-white"
           >
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

       {/* Mobile Menu */}
       <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1A1F2B] border-t border-slate-800 mt-4 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-3 border-b border-white/5">Home</Link>
              <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-3 border-b border-white/5">Fleet</Link>
              
              {isLoggedIn ? (
                <>
                  {userRole === "admin" && (
                    <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-rose-400 font-bold py-3 border-b border-white/5">Admin Dashboard</Link>
                  )}
                  {!isVerifiedOwner && userRole !== "admin" && (
                    <Link to="/apply-owner" onClick={() => setMobileMenuOpen(false)} className="text-white font-medium py-3 border-b border-white/5">Become a Seller</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-slate-400 font-medium py-3">Log out</button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="bg-slate-800 text-white font-medium py-3 rounded-xl border border-slate-700">Login</button>
                  <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="bg-primary-500 text-white font-bold py-3 rounded-xl">Sign Up</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
