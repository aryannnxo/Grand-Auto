import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  LayoutDashboard,
  ShieldCheck,
  CarFront,
  FileCheck,
  CreditCard,
  Wrench,
  Key,
  Users,
  Activity,
  ChevronRight,
  TrendingUp,
  DollarSign,
  UserPlus,
  Clock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const API = "http://localhost:5000";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        const res = await axios.get(`${API}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const stats = [
    { label: "Total Users", value: data?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
    { label: "Active Fleet", value: data?.totalVehicles || 0, icon: CarFront, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/10" },
    { label: "Active Rentals", value: data?.activeRentals || 0, icon: Activity, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/10" },
    { label: "Global Revenue", value: `Rs. ${data?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-6" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Analyzing Data...</h3>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-700">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-primary-500/20">
              <Activity size={12} className="animate-pulse" /> Live System Monitor
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight leading-none mb-2">
              Performance <span className="text-primary-500">Overview</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time analytics and platform health metrics.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:shadow-md transition-all active:scale-95">
                Download Report
             </button>
             <button className="px-6 py-3 bg-slate-900 dark:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:scale-105 transition-all active:scale-95">
                Refresh Data
             </button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary-500/10 transition-colors"></div>
             
             <div className="flex items-center gap-4 mb-5 relative z-10">
               <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={26} strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
               </div>
             </div>
             
             <div className="flex items-center justify-between relative z-10 mt-auto pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-emerald-500 text-[11px] font-black uppercase tracking-tight">
                   <TrendingUp size={14} /> <span>+12.5%</span>
                </div>
                <div className="h-6 w-16 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex items-end">
                   <div className="w-[30%] h-[40%] bg-primary-500/30 ml-0.5 rounded-t-sm"></div>
                   <div className="w-[30%] h-[60%] bg-primary-500/50 ml-0.5 rounded-t-sm"></div>
                   <div className="w-[30%] h-[80%] bg-primary-500 ml-0.5 rounded-t-sm"></div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 shadow-premium overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
             <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                   <div className="w-2 h-6 bg-primary-500 rounded-full"></div> Revenue Stream
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global scaling analytics</p>
             </div>
             <div className="flex gap-2">
                {['Daily', 'Weekly', 'Monthly'].map(t => (
                  <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Monthly' ? 'bg-slate-900 dark:bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
                    {t}
                  </button>
                ))}
             </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}}
                />
                <Tooltip 
                  cursor={{stroke: '#6366f1', strokeWidth: 2}}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff',
                    padding: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '11px', color: '#fff' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Bar Chart */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 shadow-premium">
           <div className="mb-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Demand</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Monthly Booking Velocity</p>
           </div>
           <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data?.monthlyData || []}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 12}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Bar dataKey="bookings" radius={[12, 12, 12, 12]} barSize={32}>
                    {(data?.monthlyData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === ((data?.monthlyData?.length || 0) - 1) ? '#6366f1' : '#e2e8f0'} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 shadow-premium overflow-hidden">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                 <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mr-3">
                    <Clock size={20} />
                 </div> 
                 Recent Activity
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">Automated Audit</p>
           </div>
           
           <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {data?.recentBookings?.map((booking, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/20 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-primary-500/30 transition-all cursor-pointer group group/item"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-black text-primary-500 shadow-sm group-hover/item:scale-110 transition-transform">
                         {booking.user?.name ? booking.user.name.charAt(0) : "U"}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover/item:text-primary-500 transition-colors uppercase">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                         <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">{booking.user?.email}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Rs. {booking.totalPrice?.toLocaleString()}</p>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        booking.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                   </div>
                </motion.div>
              ))}
           </div>
           
           <button className="w-full mt-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
              Audit Logs <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[3.5rem] border border-slate-200/60 dark:border-white/5 shadow-premium overflow-hidden">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-3">
                    <UserPlus size={20} />
                 </div> 
                 New Users
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">Community Metrics</p>
           </div>

           <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {data?.recentUsers?.map((user, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/20 rounded-[2rem] border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group/item"
                >
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover/item:scale-110 transition-transform">
                         <Users size={20} className="stroke-[2.5px]" />
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover/item:text-indigo-500 transition-colors">{user.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 tracking-wider mt-0.5">{user.email}</p>
                      </div>
                   </div>
                   <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      user.role === 'owner' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                   }`}>
                      {user.role}
                   </span>
                </motion.div>
              ))}
           </div>
           
           <button onClick={() => navigate('/admin/users')} className="w-full mt-8 py-5 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2 group">
              Directory Manager <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
      `}} />
    </div>
  );
};

export default AdminDashboardPage;
