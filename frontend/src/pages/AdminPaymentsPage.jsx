import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShieldCheck, CreditCard, RefreshCw, AlertTriangle, Wallet, CheckCircle, Search } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

const API = "http://localhost:5000";

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [stats, setStats] = useState({ totalRevenue: 0, esewaRevenue: 0, pendingAmount: 0 });
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (methodFilter) params.append("method", methodFilter);

      const res = await axios.get(`${API}/api/admin/payments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedPayments = res.data;
      setPayments(fetchedPayments);

      // Calculate global stats (ignores filters to show total health) automatically
      if (!statusFilter && !methodFilter) {
        let total = 0, esewa = 0, pending = 0;
        fetchedPayments.forEach(p => {
          if (p.paymentStatus === 'Paid' || p.paymentStatus === 'Partial') {
            total += (p.amountPaid || 0);
            if (p.paymentMethod === 'eSewa') esewa += (p.amountPaid || 0);
          }
          if (p.paymentStatus === 'Pending' || p.paymentStatus === 'Unpaid') {
            pending += (p.totalPrice || 0);
          }
        });
        setStats({ totalRevenue: total, esewaRevenue: esewa, pendingAmount: pending });
      }

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
    fetchPayments(); 
  }, [statusFilter, methodFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/payments/${id}/status`, { paymentStatus: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid": return <Badge variant="success" className="shadow-sm border-0 bg-emerald-100 text-emerald-700">Paid</Badge>;
      case "Pending": return <Badge variant="warning" className="shadow-sm border-0 bg-amber-100 text-amber-700">Pending</Badge>;
      case "Unpaid": return <Badge variant="danger" className="shadow-sm border-0 bg-rose-100 text-rose-700">Unpaid</Badge>;
      case "Failed": case "Cancelled": return <Badge variant="outline" className="shadow-sm bg-slate-100 text-slate-500 border-slate-300">{status}</Badge>;
      case "Refunded": return <Badge variant="outline" className="shadow-sm bg-indigo-50 text-indigo-500 border-indigo-200">Refunded</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck size={14} /> Financial Dashboard
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight leading-tight">
            Payments Management
          </h1>
        </div>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                 <Wallet size={24} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rs. {stats.totalRevenue.toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#60bb46]/10 rounded-bl-full translate-x-10 -translate-y-10" />
              <div className="w-14 h-14 rounded-full bg-[#60bb46]/20 text-[#60bb46] flex items-center justify-center relative z-10">
                 <ShieldCheck size={24} />
              </div>
              <div className="relative z-10">
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">eSewa Payments</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rs. {stats.esewaRevenue.toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                 <RefreshCw size={24} />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Balances</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rs. {stats.pendingAmount.toLocaleString()}</p>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl">
           <div className="flex gap-2">
             <button onClick={() => setStatusFilter("")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${statusFilter === "" ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>All Statuses</button>
             <button onClick={() => setStatusFilter("Paid")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${statusFilter === "Paid" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Paid</button>
             <button onClick={() => setStatusFilter("Pending")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${statusFilter === "Pending" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Pending</button>
           </div>
           <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
           <div className="flex gap-2">
             <button onClick={() => setMethodFilter("")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${methodFilter === "" ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>All Methods</button>
             <button onClick={() => setMethodFilter("eSewa")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${methodFilter === "eSewa" ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>eSewa</button>
             <button onClick={() => setMethodFilter("Cash")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${methodFilter === "Cash" ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Cash</button>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
           {loading ? (
             <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-500 animate-spin" /></div>
           ) : payments.length === 0 ? (
             <div className="text-center p-20 text-slate-500">No payment records found based on your filters.</div>
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
                            <p className="text-xs text-slate-500 mt-1">Ref: {px.transactionId || 'No TxID'}</p>
                         </td>
                         <td className="p-4">
                            <p className="text-sm font-black text-slate-900 dark:text-white">Rs. {px.totalPrice}</p>
                            <p className={`text-xs font-bold mt-1 ${px.remainingAmount > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                              Paid: Rs. {px.amountPaid}
                            </p>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               {px.paymentMethod === 'eSewa' ? (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#60bb46]/10 text-[#60bb46] border border-[#60bb46]/20">eSewa</span>
                               ) : (
                                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Cash</span>
                               )}
                            </div>
                         </td>
                         <td className="p-4">
                            {getStatusBadge(px.paymentStatus)}
                         </td>
                         <td className="p-4 px-6 text-right">
                            <select 
                               className="text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                               value={px.paymentStatus}
                               onChange={(e) => updateStatus(px._id, e.target.value)}
                            >
                               <option value="Unpaid">Mark Unpaid</option>
                               <option value="Pending" disabled={px.paymentMethod==='eSewa'}>Set Pending</option>
                               <option value="Paid">Mark Paid</option>
                               <option value="Refunded">Refund</option>
                               <option value="Failed">Failed</option>
                            </select>
                         </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>
    </div>
  );
};

export default AdminPaymentsPage;
