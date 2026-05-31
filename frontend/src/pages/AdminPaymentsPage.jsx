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
    <div className="w-full max-w-7xl mx-auto pt-2">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Payments Management
          </h1>
        </div>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                 <Wallet size={20} />
              </div>
              <div>
                 <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Rs. {stats.totalRevenue.toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <p className="text-xs font-medium text-slate-500 uppercase">eSewa Payments</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Rs. {stats.esewaRevenue.toLocaleString()}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                 <RefreshCw size={20} />
              </div>
              <div>
                 <p className="text-xs font-medium text-slate-500 uppercase">Pending Balances</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Rs. {stats.pendingAmount.toLocaleString()}</p>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
           <div className="flex gap-2">
             <button onClick={() => setStatusFilter("")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === "" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>All Statuses</button>
             <button onClick={() => setStatusFilter("Paid")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === "Paid" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>Paid</button>
             <button onClick={() => setStatusFilter("Pending")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === "Pending" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>Pending</button>
           </div>
           <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
           <div className="flex gap-2">
             <button onClick={() => setMethodFilter("")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${methodFilter === "" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>All Methods</button>
             <button onClick={() => setMethodFilter("eSewa")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${methodFilter === "eSewa" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>eSewa</button>
             <button onClick={() => setMethodFilter("Cash")} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${methodFilter === "Cash" ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"}`}>Cash</button>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
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
