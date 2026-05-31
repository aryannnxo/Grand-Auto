import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, ShieldCheck, CreditCard, RefreshCw, AlertTriangle, 
  Wallet, Search, X, CheckCircle2, FileText, CalendarDays
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const AdminPaymentsPage = () => {
  const navigate = useNavigate();
  
  // Data States
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    esewaPayments: 0,
    cashPayments: 0,
    pendingBalances: 0
  });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal States
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formStatus, setFormStatus] = useState("paid");
  const [paidAmount, setPaidAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Summary
  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/payments/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch Payments List
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (methodFilter) params.append("method", methodFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await axios.get(`${API}/api/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPayments(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("Not authorized");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSummary();
  }, []); // Summary fetched once on mount or after updates

  useEffect(() => { 
    fetchPayments(); 
  }, [statusFilter, methodFilter, debouncedSearch]);

  const openModal = (payment) => {
    setSelectedPayment(payment);
    setFormStatus(payment.paymentStatus || "unpaid"); // Already lowercase from DB
    setPaidAmount(payment.amountPaid || "");
    setTransactionId(payment.transactionId || "");
    setAdminNote("");
  };

  const closeModal = () => {
    setSelectedPayment(null);
  };

  const handleUpdateStatus = async () => {
    if (["refunded", "unpaid", "failed"].includes(formStatus)) {
      if (!window.confirm(`Are you sure you want to mark this as "${formStatus}"? This will impact revenue calculations.`)) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/payments/${selectedPayment._id}/status`, {
        paymentStatus: formStatus,  // already lowercase
        paidAmount: formStatus === 'paid' ? (paidAmount !== "" ? Number(paidAmount) : selectedPayment.totalPrice) : undefined,
        transactionId: formStatus === 'paid' ? transactionId : undefined,
        adminNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMsg("Payment updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      closeModal();
      fetchPayments();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update payment status.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid": return <Badge className="shadow-sm border-0 bg-emerald-100 text-emerald-700 px-3 py-1 font-bold text-xs uppercase tracking-wider">Paid</Badge>;
      case "pending": return <Badge className="shadow-sm border-0 bg-amber-100 text-amber-700 px-3 py-1 font-bold text-xs uppercase tracking-wider">Pending</Badge>;
      case "unpaid": return <Badge className="shadow-sm border-0 bg-rose-100 text-rose-700 px-3 py-1 font-bold text-xs uppercase tracking-wider">Unpaid</Badge>;
      case "failed": return <Badge className="shadow-sm bg-red-100 text-red-700 border-red-300 px-3 py-1 font-bold text-xs uppercase tracking-wider">Failed</Badge>;
      case "refunded": return <Badge className="shadow-sm bg-indigo-50 text-indigo-500 border-indigo-200 px-3 py-1 font-bold text-xs uppercase tracking-wider">Refunded</Badge>;
      default: return <Badge className="px-3 py-1 font-bold text-xs uppercase tracking-wider">{status}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-2 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Wallet size={24} className="text-emerald-500" /> Payments Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track revenue, manage transactions, and update payment statuses safely.</p>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-medium"
            >
              <CheckCircle2 size={18} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><DollarSign size={14} className="text-slate-400"/> Total Revenue</p>
              {summaryLoading ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {(stats.totalRevenue || 0).toLocaleString()}</p>
              )}
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500"/> eSewa Revenue</p>
              {summaryLoading ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {(stats.esewaPayments || 0).toLocaleString()}</p>
              )}
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-28">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><CreditCard size={14} className="text-blue-500"/> Cash Revenue</p>
              {summaryLoading ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : (
                <p className="text-2xl font-black text-slate-900 dark:text-white">Rs. {(stats.cashPayments || 0).toLocaleString()}</p>
              )}
           </div>
           <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/30 shadow-sm flex flex-col justify-between h-28">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={14} /> Pending Balances</p>
              {summaryLoading ? <div className="h-8 w-24 bg-amber-100 animate-pulse rounded" /> : (
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">Rs. {(stats.pendingBalances || 0).toLocaleString()}</p>
              )}
           </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 mb-6">
           <div className="flex-1 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <Input 
               placeholder="Search booking, user, vehicle or transaction..." 
               value={search} 
               onChange={e => setSearch(e.target.value)} 
               className="pl-10 w-full" 
             />
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value)} 
               className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm font-semibold outline-none dark:text-white min-w-[120px]"
             >
               <option value="">All Statuses</option>
               <option value="paid">Paid</option>
               <option value="pending">Pending</option>
               <option value="unpaid">Unpaid</option>
               <option value="failed">Failed</option>
               <option value="refunded">Refunded</option>
             </select>
             <select 
               value={methodFilter} 
               onChange={(e) => setMethodFilter(e.target.value)} 
               className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm font-semibold outline-none dark:text-white min-w-[120px]"
             >
               <option value="">All Methods</option>
               <option value="eSewa">eSewa</option>
               <option value="Cash">Cash</option>
             </select>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
           {loading ? (
             <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" /></div>
           ) : payments.length === 0 ? (
             <div className="text-center p-20 text-slate-500 flex flex-col items-center">
                <Wallet size={48} className="text-slate-300 mb-4" />
                <p className="font-bold">No payment records found.</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
             </div>
           ) : (
             <div className="overflow-x-auto w-full">
               <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Booking / User</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                      <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                     {payments.map(px => (
                       <tr key={px._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="p-4 px-6">
                            <p className="font-mono text-sm text-slate-900 dark:text-white font-medium">{px._id.slice(-8)}</p>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">{px.user?.name}</p>
                         </td>
                         <td className="p-4">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{px.vehicle?.brand} {px.vehicle?.model}</p>
                            <p className="text-xs text-slate-500 mt-1">Ref: {px.transactionId || 'N/A'}</p>
                         </td>
                         <td className="p-4">
                            <p className="text-sm font-black text-slate-900 dark:text-white">Rs. {px.totalPrice.toLocaleString()}</p>
                            <p className={`text-xs font-bold mt-1 ${px.remainingAmount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                              Paid: Rs. {px.amountPaid.toLocaleString()}
                            </p>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               {px.paymentMethod === 'eSewa' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#60bb46]/10 text-[#60bb46] border border-[#60bb46]/20">eSewa</span>
                               ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Cash</span>
                               )}
                            </div>
                         </td>
                         <td className="p-4">
                            {getStatusBadge(px.paymentStatus)}
                         </td>
                         <td className="p-4 px-6 text-right">
                            <Button variant="outline" size="sm" onClick={() => openModal(px)}>
                              Manage
                            </Button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>

        {/* Manage Payment Modal */}
        <AnimatePresence>
          {selectedPayment && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
              
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-20">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={20} className="text-emerald-500" /> Manage Payment
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">Booking ID: {selectedPayment._id}</p>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 grid sm:grid-cols-2 gap-8 flex-1">
                  {/* Left Column: Details */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Payment Summary</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-slate-500">Method</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedPayment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-slate-500">Total Price</span>
                          <span className="font-bold text-slate-900 dark:text-white">Rs. {selectedPayment.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                          <span className="text-slate-500">Amount Paid</span>
                          <span className="font-bold text-emerald-600">Rs. {selectedPayment.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span className="text-slate-500">Remaining</span>
                          <span className="font-bold text-amber-600">Rs. {selectedPayment.remainingAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><FileText size={14}/> User Details</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedPayment.user?.name}</p>
                      <p className="text-xs text-slate-500">{selectedPayment.user?.email}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={14}/> Dates</p>
                      <p className="text-xs text-slate-500">Created: {new Date(selectedPayment.createdAt).toLocaleDateString()}</p>
                      {selectedPayment.paidAt && <p className="text-xs text-emerald-600 font-medium">Paid: {new Date(selectedPayment.paidAt).toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Right Column: Update Actions */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Update Status</label>
                      <select 
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white cursor-pointer"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="pending" disabled={selectedPayment.paymentMethod === 'eSewa'}>Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    {formStatus === 'paid' && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="space-y-4 p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Payment Details</p>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Paid Amount (Rs.)</label>
                          <Input 
                            type="number" 
                            placeholder={selectedPayment.totalPrice.toString()} 
                            value={paidAmount} 
                            onChange={e => setPaidAmount(e.target.value)} 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Transaction Ref / ID</label>
                          <Input 
                            placeholder="e.g. eSewa TxID or Cash Receipt No" 
                            value={transactionId} 
                            onChange={e => setTransactionId(e.target.value)} 
                          />
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Admin Notes (Optional)</label>
                      <textarea 
                        placeholder="Internal notes regarding this payment..." 
                        rows={2} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={adminNote} 
                        onChange={e => setAdminNote(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 sticky bottom-0">
                  <Button variant="outline" onClick={closeModal}>Cancel</Button>
                  <Button onClick={handleUpdateStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8">Save Payment</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default AdminPaymentsPage;
