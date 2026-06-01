import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Car, LayoutDashboard, Menu, X, LogOut, FileText, Wrench, Bell, CheckCircle, XCircle, AlertTriangle, RefreshCw, CreditCard, Search, MessageSquare } from "lucide-react";
import axios from "axios";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";

const API = "http://localhost:5000";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isVerifiedOwner, setIsVerifiedOwner] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

  const fetchChatUnread = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API}/api/chats/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    let intervalId;
    if (isLoggedIn) {
      fetchNotifications();
      fetchChatUnread();
      
      // Connect Socket.io for real-time chat unread counts
      const userId = localStorage.getItem("userId");
      if (userId) {
        const socket = connectSocket(userId);
        if (socket) {
          socket.on("unreadCountUpdated", (data) => {
            setChatUnreadCount(data.unreadCount);
          });
        }
      }

      // Keep polling just for notifications
      intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setChatUnreadCount(0);
      disconnectSocket();
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      const socket = getSocket();
      if (socket) {
        socket.off("unreadCountUpdated");
      }
    };
  }, [isLoggedIn]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifDropdownOpen, profileDropdownOpen]);

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
      case "mechanic_approved":
        return <CheckCircle size={16} />;
      case "booking_rejected":
      case "mechanic_rejected":
        return <XCircle size={16} />;
      case "payment_successful":
        return <CreditCard size={16} />;
      case "booking_cancelled":
      case "mechanic_cancelled":
        return <AlertTriangle size={16} />;
      case "refund_processed":
        return <RefreshCw size={16} />;
      case "mechanic_assigned":
        return <User size={16} />;
      case "mechanic_in_progress":
        return <Wrench size={16} />;
      case "mechanic_completed":
        return <CheckCircle2 size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "booking_approved":
      case "mechanic_approved":
      case "mechanic_completed":
        return "bg-emerald-50 text-emerald-500 border-emerald-100";
      case "booking_rejected":
      case "mechanic_rejected":
        return "bg-rose-50 text-rose-500 border-rose-100";
      case "payment_successful":
        return "bg-emerald-50 text-emerald-500 border-emerald-100";
      case "booking_cancelled":
      case "mechanic_cancelled":
        return "bg-amber-50 text-amber-500 border-amber-100";
      case "refund_processed":
        return "bg-cyan-50 text-cyan-500 border-cyan-100";
      case "mechanic_assigned":
        return "bg-indigo-50 text-indigo-500 border-indigo-100";
      case "mechanic_in_progress":
        return "bg-blue-50 text-blue-500 border-blue-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
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
    disconnectSocket();
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
      return "text-primary-600 font-bold text-sm tracking-wide flex items-center gap-2";
    }
    return "text-slate-600 hover:text-slate-900 font-medium text-sm tracking-wide flex items-center gap-2 transition-colors";
  };

  return (
    <nav className="bg-white sticky top-0 z-50 w-full py-3 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-8 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 mr-1">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center z-10 shadow-sm">
                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                    <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5c2.3 0 4.4.9 6 2.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M12 12h8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                 </svg>
              </div>
            </div>
            <span className="text-2xl font-black font-heading text-slate-900 tracking-tight">
              GrandAuto
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {userRole === 'mechanic' ? (
              <>
                <Link to="/mechanic/dashboard" className={getNavStyle("/mechanic/dashboard")}>Dashboard</Link>
                <Link to="/mechanic/my-requests" className={getNavStyle("/mechanic/my-requests")}>Jobs</Link>
              </>
            ) : (
              <>
                <Link to="/" className={getNavStyle("/")}>Home</Link>
                <Link to="/listings" className={getNavStyle("/listings")}>Fleet</Link>
                {isLoggedIn && !isVerifiedOwner && userRole !== "admin" && (
                  <Link to="/apply-owner" className={getNavStyle("/apply-owner")}>Become a Seller</Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="w-full flex items-center bg-slate-100 rounded-full px-4 py-2.5 border border-transparent focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(75,107,251,0.1)] transition-all">
            <Search size={18} className="text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search or ask about cars" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-500 font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>
        </div>

        {/* Right Section: Auth & Profile */}
        <div className="flex items-center gap-4 shrink-0">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Messages Button */}
              <Link 
                to={userRole === "admin" ? "/admin/messages" : (isVerifiedOwner ? "/seller/messages" : "/messages")}
                className="relative p-2 rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center w-10 h-10 border bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                title="Messages"
              >
                <MessageSquare size={18} />
                <AnimatePresence>
                  {chatUnreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Notifications Bell */}
              <div className="relative notif-container">
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative p-2 rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center w-10 h-10 border ${
                    notifDropdownOpen 
                      ? "bg-primary-50 border-primary-100 text-primary-600" 
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
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
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
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
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right text-left"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider">{unreadCount} new</span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) handleMarkSingleRead(notif._id);
                              }}
                              className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-all duration-200 relative ${!notif.isRead ? "bg-primary-50/30" : ""}`}
                            >
                              {/* Unread dot indicator */}
                              {!notif.isRead && (
                                <div className="absolute top-5 left-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
                              )}

                              {/* Icon container */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getIconStyle(notif.type)}`}>
                                {getNotificationIcon(notif.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                                  <h4 className={`text-sm font-semibold truncate ${!notif.isRead ? "text-slate-900" : "text-slate-700"}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                                    {formatRelativeTime(notif.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-xs leading-relaxed break-words ${!notif.isRead ? "text-slate-600" : "text-slate-500"}`}>
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 px-6 text-center space-y-4">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                              <Bell size={20} className="opacity-40" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-slate-900">All caught up!</h4>
                              <p className="text-xs text-slate-500 max-w-[200px] mx-auto">No notifications right now. We'll update you when there's news!</p>
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
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors shadow-sm focus:outline-none"
                >
                  {profileImage ? (
                    <img src={`${API}${profileImage}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-primary-200">
                      {getInitials()}
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-sm text-slate-900 font-semibold block truncate max-w-[100px] leading-none mb-0.5">
                      {userName || "User"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-none">
                      {userRole === 'admin' ? 'Admin' : isVerifiedOwner ? 'Seller' : 'User'}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right text-left"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                        <p className="font-bold text-white text-sm truncate">{userName || "User"}</p>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{userEmail || "user@example.com"}</p>
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

                        {(userRole === 'admin' || userRole === 'mechanic' || isVerifiedOwner) && (
                          <Link 
                            to={userRole === 'admin' ? '/admin/dashboard' : userRole === 'mechanic' ? '/mechanic/dashboard' : '/seller/dashboard'} 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                        )}
                        
                        <Link 
                          to={userRole === 'admin' ? '/admin/messages' : isVerifiedOwner ? '/seller/messages' : '/messages'} 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <MessageSquare size={16} />
                          Messages
                        </Link>
                        
                        {/* Divider */}
                        <div className="h-px bg-slate-800 my-1 mx-2"></div>
                        
                        <button 
                          onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium w-full text-left"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-3">
               <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-slate-900 font-medium text-sm px-3 hidden sm:block">
                 Login
               </button>
               <button onClick={() => navigate('/signup')} className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-5 rounded-full transition-colors shadow-sm">
                 Register
               </button>
             </div>
          )}

           {/* Mobile Toggle */}
           <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
             className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
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
            className="lg:hidden bg-white border-t border-slate-200 mt-3 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <div className="mb-4">
                <div className="w-full flex items-center bg-slate-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary-500">
                  <Search size={18} className="text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search cars..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
                        setMobileMenuOpen(false);
                      }
                    }}
                  />
                </div>
              </div>

              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium py-3 border-b border-slate-100 flex items-center"><Car className="mr-3 text-slate-400" size={18} /> Home</Link>
              <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium py-3 border-b border-slate-100 flex items-center"><Car className="mr-3 text-slate-400" size={18} /> Fleet</Link>
              
              {isLoggedIn && (
                <Link 
                  to={userRole === "admin" ? "/admin/messages" : (isVerifiedOwner ? "/seller/messages" : "/dashboard?view=messages")} 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-slate-700 font-medium py-3 border-b border-slate-100 flex items-center"
                >
                  <FileText className="mr-3 text-slate-400" size={18} /> Messages
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  {!isVerifiedOwner && userRole !== "admin" && (
                    <Link to="/apply-owner" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 font-medium py-3 border-b border-slate-100 flex items-center"><Shield className="mr-3 text-slate-400" size={18} /> Become a Seller</Link>
                  )}

                  {/* Mobile Profile Card */}
                  <div className="mt-3 bg-slate-900 rounded-2xl overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-slate-800 bg-slate-800/60">
                      <p className="font-bold text-white text-sm truncate">{userName || "User"}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{userEmail || ""}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                      >
                        <User size={17} /> Profile
                      </Link>
                      <Link
                        to={userRole === "admin" ? "/admin/dashboard" : isVerifiedOwner ? "/seller/dashboard" : "/dashboard"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                      >
                        <LayoutDashboard size={17} /> Dashboard
                      </Link>
                      <div className="h-px bg-slate-800 my-1 mx-2"></div>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium w-full text-left"
                      >
                        <LogOut size={17} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="bg-slate-50 text-slate-900 font-medium py-3 rounded-xl border border-slate-200">Login</button>
                  <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="bg-slate-900 text-white font-medium py-3 rounded-xl shadow-sm">Sign Up</button>
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
