import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, User, Mail, Pencil, Lock, LayoutDashboard, LogOut,
  CalendarDays, Car, ChevronRight, ShieldCheck, Sparkles,
  CheckCircle2, AlertCircle, UploadCloud, FileText
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import Footer from "../components/Footer";

const API = "http://localhost:5000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({ name: "", email: "", bio: "", profileImage: "" });

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setNameInput(res.data.name || "");
        setBioInput(res.data.bio || "");

        localStorage.setItem("userId", res.data._id || "");
        localStorage.setItem("userName", res.data.name || "");
        localStorage.setItem("userEmail", res.data.email || "");
        localStorage.setItem("userProfileImage", res.data.profileImage || "");
      } catch (err) {
        localStorage.clear();
        navigate("/login");
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchProfile();
    fetchBookings();
  }, [navigate, token]);

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) return;
    try {
      const res = await axios.put(
        `${API}/api/users/me`,
        { name: nameInput, bio: bioInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(prev => ({ ...prev, ...res.data }));
      localStorage.setItem("userName", res.data.name || "");
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      await axios.put(
        `${API}/api/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.msg || "Password update failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setImageUploading(true);
      const res = await axios.post(`${API}/api/users/upload-profile`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setUser(prev => ({ ...prev, profileImage: res.data.profileImage }));
      localStorage.setItem("userProfileImage", res.data.profileImage);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const handleCompleteTrip = async (bookingId) => {
    try {
      await axios.patch(
        `${API}/api/bookings/${bookingId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "completed" } : b));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to complete trip. Please try again.");
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => ["confirmed", "active", "completed"].includes(b.status)).length;
  const pendingBookings = bookings.filter(b => ["pending-owner-approval", "approved-awaiting-payment", "confirmed-awaiting-cash-payment"].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative pb-12 overflow-hidden">
      {/* Premium Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-primary-500/5 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <Navbar variant="dark" />

      <main className="max-w-[1400px] mx-auto px-6 pt-6 relative z-10">
        {/* Sleek Minimal Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Verified GrandAuto Profile</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello, <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent font-black">{user.name || "Driver"}</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">Manage your personal settings, security, and booking history in one sleek place.</p>
          </div>

          {/* Minimalist Numeric Stats Grid */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {[
              { label: "Bookings", value: totalBookings },
              { label: "Confirmed", value: confirmedBookings },
              { label: "Pending", value: pendingBookings }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 px-5 py-3 rounded-2xl flex flex-col justify-center min-w-[110px] shadow-sm">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
                <span className="text-xl font-bold text-slate-800 dark:text-white leading-none">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Left Column: Minimal Profile Settings Card */}
          <aside className="w-full lg:w-[380px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 p-6 sm:p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
            >
              {/* Profile Avatar Frame */}
              <div className="text-center mb-8">
                <div className="relative inline-block group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full blur-[8px] opacity-25 group-hover:opacity-45 transition-opacity" />
                  {user.profileImage ? (
                    <img
                      src={`${API}${user.profileImage}`}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-2 border-white dark:border-slate-850 shadow-md relative z-10"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white border-2 border-white dark:border-slate-850 shadow-md relative z-10">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 hover:bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border border-white dark:border-slate-800 transition-colors z-20 hover:scale-105">
                    <Camera size={12} strokeWidth={2.5} />
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
                  </label>
                </div>

                <h2 className="text-xl font-black text-slate-850 dark:text-white mt-4 tracking-tight">{user.name || "Grand Auto User"}</h2>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.email}</span>
              </div>

              {imageUploading && (
                <div className="flex items-center justify-center gap-2 p-2.5 mb-6 bg-primary-500/5 text-primary-500 text-xs font-semibold rounded-xl border border-primary-500/10">
                  <UploadCloud className="animate-pulse" size={14} /> Uploading image...
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-5 mb-8">
                <div className="space-y-1.5">
                  <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"><User size={12} className="mr-1.5" /> Full Name</label>
                  {!isEditing ? (
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name || "Not provided"}</div>
                  ) : (
                    <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Full name" className="text-xs py-2 h-10 rounded-xl bg-slate-50/30 dark:bg-slate-950/20" autoFocus />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"><Mail size={12} className="mr-1.5" /> Email Address</label>
                  <div className="p-3 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl border border-slate-200/30 dark:border-slate-800/20 text-xs font-semibold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none">{user.email || "Not provided"}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"><FileText size={12} className="mr-1.5" /> Bio</label>
                  {!isEditing ? (
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-400 min-h-[80px] whitespace-pre-wrap leading-relaxed">{user.bio || "Tell people a little about yourself."}</div>
                  ) : (
                    <textarea
                      value={bioInput} onChange={(e) => setBioInput(e.target.value)}
                      rows={3} className="w-full text-xs p-3 rounded-xl bg-slate-50/30 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/40 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 transition-colors" placeholder="Write a short bio..."
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isEditing ? (
                <div className="space-y-2">
                  <Button variant="primary" className="w-full text-xs font-bold py-2.5 h-10 rounded-xl shadow-none bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50" onClick={() => setIsEditing(true)}>
                    <Pencil size={14} className="mr-1.5" /> Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full text-xs font-bold py-2.5 h-10 rounded-xl bg-transparent border-slate-200/60 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
                    <Lock size={14} className="mr-1.5" /> Security settings
                  </Button>
                  {/* {localStorage.getItem("userRole") === "admin" || localStorage.getItem("isVerifiedOwner") === "true" ? (
                    <Button variant="outline" className="w-full text-xs font-bold py-2.5 h-10 rounded-xl bg-transparent border-slate-200/60 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300" onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard size={14} className="mr-1.5" /> Operation Dashboard
                    </Button>
                  // ): null} */}
                  <Button variant="ghost" className="w-full text-xs font-bold py-2.5 h-10 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/5 dark:hover:bg-rose-500/10" onClick={handleLogout}>
                    <LogOut size={14} className="mr-1.5" /> Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1 text-xs font-bold h-10 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-50" onClick={handleSaveProfile}>Save</Button>
                  <Button variant="outline" className="flex-1 text-xs font-bold h-10 rounded-xl bg-transparent border-slate-200/60 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-900/30" onClick={() => { setIsEditing(false); setNameInput(user.name); setBioInput(user.bio); }}>Cancel</Button>
                </div>
              )}

              {/* Password Dropdown form */}
              <AnimatePresence>
                {showPassword && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                    <h4 className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4"><Lock size={12} className="mr-2 text-primary-500" /> Update Password</h4>

                    <div className="space-y-3 mb-5">
                      <Input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="text-xs h-10 rounded-xl bg-slate-50/20" />
                      <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-xs h-10 rounded-xl bg-slate-50/20" />
                      <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-xs h-10 rounded-xl bg-slate-50/20" />
                    </div>

                    {passwordError && (
                      <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
                        <AlertCircle size={14} /> {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <CheckCircle2 size={14} /> {passwordSuccess}
                      </div>
                    )}

                    <Button variant="primary" className="w-full text-xs font-bold h-10 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950" onClick={handleChangePassword}>Change Password</Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </aside>

          {/* Right Column: Bookings & Operations */}
          <main className="flex-1 min-w-0 w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 p-6 sm:p-8 rounded-[2rem] shadow-sm min-h-[500px]"
            >
              {/* Bookings Section Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200/40 dark:border-slate-800/30">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider mb-2 border border-slate-200/30 dark:border-slate-800/20">
                    <CalendarDays size={12} /> Travel History
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Bookings</h2>
                </div>

                <Button variant="primary" className="text-xs font-bold h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm" onClick={() => navigate('/listings')}>
                  Browse Fleet <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>

              {loadingBookings ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-10 h-10 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Retrieving bookings...</h3>
                  <p className="text-xs text-slate-400">Please wait while we look up your dashboard.</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-slate-200/60 dark:border-slate-800/60 rounded-3xl">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850 text-slate-450 dark:text-slate-500 rounded-full flex items-center justify-center mb-4">
                    <Car size={26} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">No trips reserved</h3>
                  <p className="text-xs text-slate-400 max-w-xs mb-6">Explore Kathmandu's finest premium vehicles and hit the road.</p>
                  <Button variant="primary" className="text-xs font-bold h-10 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-white dark:text-slate-950" onClick={() => navigate('/listings')}>Start Booking</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {bookings.map((booking, i) => {
                      const statusLabels = {
                        "pending-owner-approval": { label: "Pending Approval", color: "bg-amber-100 text-amber-700 border-amber-200" },
                        "approved-awaiting-payment": { label: "Approved — Pay Now", color: "bg-blue-100 text-blue-700 border-blue-200" },
                        "confirmed": { label: "Confirmed", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                        "confirmed-awaiting-cash-payment": { label: "Awaiting Cash Payment", color: "bg-purple-100 text-purple-700 border-purple-200" },
                        "active": { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                        "completed": { label: "Completed", color: "bg-slate-100 text-slate-600 border-slate-200" },
                        "cancelled": { label: "Cancelled", color: "bg-rose-100 text-rose-600 border-rose-200" },
                        "rejected": { label: "Rejected", color: "bg-rose-100 text-rose-600 border-rose-200" },
                      };

                      // Safeguard: if payment is already paid, always show Confirmed
                      // regardless of what booking.status says (handles legacy/sync issues)
                      const isAlreadyPaid = (booking.paymentStatus || "").toLowerCase() === "paid";
                      const effectiveStatus = isAlreadyPaid && !["active", "completed", "cancelled", "rejected"].includes(booking.status)
                        ? "confirmed"
                        : booking.status;

                      const statusInfo = statusLabels[effectiveStatus] || { label: effectiveStatus, color: "bg-slate-100 text-slate-600 border-slate-200" };
                      const canPay = booking.status === "approved-awaiting-payment" && !isAlreadyPaid;
                      const isPending = booking.status === "pending-owner-approval" && !isAlreadyPaid;
                      const isRejected = booking.status === "rejected";

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          key={booking._id}
                          className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl bg-white dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/30 hover:border-slate-250 dark:hover:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {/* Vehicle Photo */}
                          <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden bg-slate-150 dark:bg-slate-850 flex-shrink-0 relative">
                            {(() => {
                              const imgPath = booking.vehicle?.images?.[0]?.url || booking.vehicle?.images?.[0] || booking.vehicle?.image;
                              return imgPath ? (
                                <img src={`${API}${imgPath}`} alt={booking.vehicle.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900">No Image</div>
                              );
                            })()}
                            <div className="absolute top-2 left-2">
                              <span className={`text-[9px] uppercase tracking-widest font-black py-0.5 px-2 rounded-full border shadow-sm ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 flex flex-col justify-between pt-1">
                            <div>
                              <h4 className="text-lg font-black text-slate-950 dark:text-white tracking-tight leading-none mb-1.5">
                                {booking.vehicle?.brand} {booking.vehicle?.model}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <CalendarDays size={14} />
                                <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                                <span className="text-slate-300 dark:text-slate-800">•</span>
                                <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-0.5">Total Fare</p>
                                <div className="text-base font-extrabold text-primary-500">Rs. {booking.totalPrice?.toLocaleString()}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Pay Now — only when approved */}
                                {canPay && (
                                  <Button
                                    variant="primary"
                                    className="text-xs h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
                                    onClick={() => navigate(`/pay/booking/${booking._id}`)}
                                  >
                                    Pay Now
                                  </Button>
                                )}
                                {/* Request Mechanic Help - only when not pending or rejected */}
                                {(!isPending && !isRejected && booking.status !== "cancelled") && (
                                  <Button
                                    variant="outline"
                                    className="text-xs h-9 px-3 rounded-xl border-purple-200 hover:bg-purple-50 text-purple-700 dark:border-purple-800 dark:hover:bg-purple-900/30 dark:text-purple-300"
                                    onClick={() => navigate(`/request-mechanic?bookingId=${booking._id}&vehicleId=${booking.vehicle?._id}`)}
                                  >
                                    Request Mechanic Help
                                  </Button>
                                )}
                                {/* Complete Trip Button */}
                                {["confirmed", "active"].includes(booking.status) && (
                                  <Button
                                    variant="primary"
                                    className="text-xs h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    onClick={() => handleCompleteTrip(booking._id)}
                                  >
                                    Complete Trip
                                  </Button>
                                )}
                                {/* Awaiting approval message */}
                                {isPending && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                                    Awaiting owner approval
                                  </span>
                                )}
                                {/* Rejected message */}
                                {isRejected && (
                                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                                    Booking was rejected
                                  </span>
                                )}
                                <Button variant="outline" className="text-xs h-9 px-3 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300" onClick={() => navigate(`/vehicles/${booking.vehicle?._id}`)}>
                                  Details <ChevronRight size={12} className="ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </main>

        </div>
      </main>
        {/* Review Modal */}


      <Footer />
    </div>
  );
};

export default ProfilePage;