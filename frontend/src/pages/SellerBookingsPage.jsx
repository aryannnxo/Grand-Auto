import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  CreditCard,
  FileCheck,
  Banknote,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const API = "http://localhost:5000";

const SellerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cash payment states
  const [confirmModal, setConfirmModal] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [toast, setToast] = useState(null);

  // Approve / Reject states
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const confirmCashPayment = async (booking) => {
    setConfirmingId(booking._id);
    setConfirmModal(null);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/bookings/${booking._id}/confirm-cash-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("success", `Cash payment confirmed for ${booking.vehicle?.name || "vehicle"}!`);
      // Refresh bookings so badge appears and button disappears
      fetchBookings();
    } catch (err) {
      showToast("error", err.response?.data?.msg || "Failed to confirm payment.");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/bookings/owner-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch incoming bookings.");
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId) => {
    setApprovingId(bookingId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/bookings/${bookingId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("success", "Booking approved! Customer has been notified.");
      fetchBookings();
    } catch (err) {
      showToast("error", err.response?.data?.msg || "Failed to approve booking.");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectBooking = async (bookingId) => {
    setRejectingId(bookingId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/bookings/${bookingId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("success", "Booking rejected. Customer has been notified.");
      fetchBookings();
    } catch (err) {
      showToast("error", err.response?.data?.msg || "Failed to reject booking.");
    } finally {
      setRejectingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending-owner-approval":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "approved-awaiting-payment":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "confirmed-awaiting-cash-payment":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled":
      case "rejected":
        return "bg-rose-100 text-rose-600 border-rose-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const humanizeStatus = (status) => {
    switch (status) {
      case "pending-owner-approval": return "Pending Approval";
      case "approved-awaiting-payment": return "Approved – Awaiting Payment";
      case "confirmed": return "Confirmed";
      case "confirmed-awaiting-cash-payment": return "Awaiting Cash Payment";
      case "active": return "Active";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const ReceiptModal = ({ booking, onClose }) => {
    if (!booking) return null;
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Receipt Header */}
          <div className="bg-slate-900 dark:bg-black p-8 text-white text-center relative">
             <div className="absolute top-4 right-8 opacity-20 transform rotate-12">
                <FileCheck size={80} />
             </div>
             <h2 className="text-2xl font-black font-heading mb-1 uppercase tracking-widest">Booking Receipt</h2>
             <p className="text-slate-400 text-xs font-bold">Transaction ID: {booking._id.slice(-12).toUpperCase()}</p>
          </div>

          <div className="p-10 space-y-8">
             {/* Main Info */}
             <div className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-800 pb-6">
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</h4>
                   <p className="font-bold text-slate-900 dark:text-white text-lg">{booking.vehicle?.name}</p>
                   <p className="text-sm text-slate-500">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                </div>
                <div className="text-right">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                   </span>
                </div>
             </div>

             {/* Renter & Date */}
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Renter</h4>
                   <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-white">{booking.user?.name}</p>
                      <p className="text-xs text-slate-500">{booking.user?.email}</p>
                      <p className="text-xs text-slate-500">{booking.user?.phone || 'N/A'}</p>
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dates</h4>
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                         From: {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">
                         To: {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                   </div>
                </div>
             </div>

             {/* Pricing Table */}
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Daily Rate</span>
                   <span className="font-bold text-slate-800 dark:text-white underline decoration-slate-300 decoration-offset-2">Rs. {booking.vehicle?.pricePerDay}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Service Fee</span>
                   <span className="font-bold text-slate-800 dark:text-white">Rs. {(booking.totalPrice * 0.05).toFixed(0)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center mt-3">
                   <span className="font-bold text-slate-900 dark:text-white">Total Paid</span>
                   <span className="text-2xl font-black text-primary-500">Rs. {booking.totalPrice.toLocaleString()}</span>
                </div>
             </div>

             <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                   Print PDF
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform"
                >
                   Close Receipt
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // ---------- Cash Confirmation Modal ----------
  const CashConfirmModal = ({ booking, onClose, onConfirm }) => {
    if (!booking) return null;
    const vehicleName = `${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}`.trim() || booking.vehicle?.name || "Vehicle";
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-6 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Banknote size={200} className="absolute -right-10 -bottom-10" />
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Banknote size={28} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Confirm Cash Payment</h2>
            <p className="text-emerald-100 text-sm mt-1">This action cannot be undone</p>
          </div>

          <div className="p-8">
            <p className="text-slate-600 dark:text-slate-300 text-sm text-center mb-6">
              You are about to confirm that you have <strong>physically received</strong> the cash payment from the renter for:
            </p>

            {/* Booking Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vehicle</span>
                <span className="font-bold text-slate-900 dark:text-white">{vehicleName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Renter</span>
                <span className="font-bold text-slate-900 dark:text-white">{booking.user?.name}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                <span className="text-slate-500">Amount to Confirm</span>
                <span className="font-black text-emerald-600 text-base">Rs. {booking.totalPrice?.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6">
              The renter will receive a payment confirmation email and in-app notification.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(booking)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                Yes, Confirm
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* ---- Toast ---- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-[80] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.type === "success" ? <ShieldCheck size={18} /> : <XCircle size={18} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Modals ---- */}
      <AnimatePresence>
        {selectedBooking && (
          <ReceiptModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmModal && (
          <CashConfirmModal
            booking={confirmModal}
            onClose={() => setConfirmModal(null)}
            onConfirm={confirmCashPayment}
          />
        )}
      </AnimatePresence>

      {/* ---- Header ---- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">Incoming Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">Track and manage reservations for your vehicles. Communicate with renters and coordinate pickups.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {bookings.filter(b => b.status === "pending-owner-approval").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {bookings.filter(b => ["confirmed", "active", "confirmed-awaiting-cash-payment"].includes(b.status)).length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Content ---- */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] h-40 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCashPending =
              booking.paymentMethod === "Cash" &&
              booking.status === "confirmed-awaiting-cash-payment" &&
              booking.paymentStatus !== "paid";
            const isCashVerified =
              booking.paymentMethod === "Cash" && booking.paymentStatus === "paid";
            const isConfirming = confirmingId === booking._id;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border p-8 flex flex-col xl:flex-row gap-8 items-start hover:shadow-lg transition-all ${
                  isCashPending
                    ? "border-amber-200 dark:border-amber-800/50"
                    : isCashVerified
                    ? "border-emerald-200 dark:border-emerald-800/50"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Car Info */}
                <div className="flex items-center gap-6 w-full xl:w-1/3">
                  <div className="w-32 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    <img src={`${API}${booking.vehicle?.images?.[0]?.url || ""}`} alt="car" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{booking.vehicle?.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Status badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                        {humanizeStatus(booking.status)}
                      </span>
                      {/* Payment status badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : booking.paymentStatus === "pending"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      }`}>
                        {booking.paymentStatus}
                      </span>
                      {/* Cash Verified badge */}
                      {isCashVerified && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500 text-white border-emerald-600 flex items-center gap-1"
                        >
                          <ShieldCheck size={10} />
                          Cash Verified
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Renter & Dates */}
                <div className="flex-1 grid md:grid-cols-2 gap-8 w-full xl:w-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Renter Details</p>
                        <p className="font-bold text-slate-800 dark:text-white">{booking.user?.name}</p>
                      </div>

                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rental Period</p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">
                          {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pickup Location</p>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{booking.pickupLocation}</p>
                      </div>

                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</p>
                        <p className="font-black text-primary-500 text-lg">Rs. {booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full xl:w-auto flex xl:flex-col gap-3">

                  {/* ✅ Approve / Reject — only for pending-owner-approval */}
                  {booking.status === "pending-owner-approval" && (
                    <>
                      <button
                        onClick={() => approveBooking(booking._id)}
                        disabled={approvingId === booking._id || rejectingId === booking._id}
                        className="flex-1 xl:w-44 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {approvingId === booking._id ? (
                          <><Loader2 size={15} className="animate-spin" /> Approving...</>
                        ) : (
                          <><CheckCircle2 size={15} /> Approve</>  
                        )}
                      </button>
                      <button
                        onClick={() => rejectBooking(booking._id)}
                        disabled={approvingId === booking._id || rejectingId === booking._id}
                        className="flex-1 xl:w-44 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {rejectingId === booking._id ? (
                          <><Loader2 size={15} className="animate-spin" /> Rejecting...</>
                        ) : (
                          <><XCircle size={15} /> Reject</>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex-1 xl:w-44 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm transition-colors hover:bg-slate-100"
                  >
                    View Details
                  </button>

                  {/* Mark as Paid — only for unverified cash bookings */}
                  {isCashPending && (
                    <button
                      onClick={() => setConfirmModal(booking)}
                      disabled={isConfirming}
                      className="flex-1 xl:w-44 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {isConfirming ? (
                        <><Loader2 size={15} className="animate-spin" /> Confirming...</>
                      ) : (
                        <><Banknote size={15} /> Mark as Paid</>
                      )}
                    </button>
                  )}

                  {/* Cash Verified indicator pill */}
                  {isCashVerified && (
                    <div className="flex-1 xl:w-44 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <ShieldCheck size={15} />
                      Cash Verified
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={48} className="text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No Reservations</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">You don't have any incoming bookings at the moment. Make sure your car details and pricing are competitive!</p>
        </div>
      )}
    </div>
  );
};

export default SellerBookingsPage;

