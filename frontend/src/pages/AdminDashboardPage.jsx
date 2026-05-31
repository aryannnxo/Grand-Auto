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
    <div className="w-full max-w-7xl mx-auto pt-2 pb-10 animate-in fade-in duration-700">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Performance Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time analytics and platform health metrics.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                Download Report
             </button>
             <button className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
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
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl flex flex-col justify-between"
          >
             <div className="flex items-center justify-between mb-6">
                 <p className="text-sm text-slate-500">{stat.label}</p>
                 <stat.icon size={18} className="text-slate-300 dark:text-slate-600" />
             </div>
             
             <div>
                 <h3 className="text-2xl font-medium text-slate-900 dark:text-white">{stat.value}</h3>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
             <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Revenue Stream</h3>
                <p className="text-sm text-slate-400 mt-1">Global scaling analytics</p>
             </div>
             <div className="flex gap-4">
                {['Daily', 'Weekly', 'Monthly'].map(t => (
                  <button key={t} className={`text-sm transition-colors ${t === 'Monthly' ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 hover:text-slate-600'}`}>
                    {t}
                  </button>
                ))}
             </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl">
           <div className="mb-8">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Demand</h3>
              <p className="text-sm text-slate-400 mt-1">Monthly Booking Velocity</p>
           </div>
           <div className="h-[260px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data?.monthlyData || []}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 12}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                  />
                  <Bar dataKey="bookings" radius={[4, 4, 0, 0]} barSize={24}>
                    {(data?.monthlyData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === ((data?.monthlyData?.length || 0) - 1) ? '#94a3b8' : '#f1f5f9'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl flex flex-col">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
                 Recent Activity
              </h3>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {data?.recentBookings?.map((booking, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                   <div className="flex items-center gap-4">
                      <div>
                         <p className="text-sm font-medium text-slate-900 dark:text-white">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                         <p className="text-sm text-slate-400">{booking.user?.name || "Unknown User"}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Rs. {booking.totalPrice?.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">{booking.paymentStatus}</p>
                   </div>
                </motion.div>
              ))}
           </div>
           
           <button className="w-full mt-6 text-slate-400 font-medium text-sm hover:text-slate-900 transition-colors">
              View All Logs
           </button>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl flex flex-col">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
                 New Users
              </h3>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {data?.recentUsers?.map((user, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                   <div className="flex items-center gap-4">
                      <div>
                         <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                         <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                   </div>
                   <p className="text-sm text-slate-400 capitalize">{user.role}</p>
                </motion.div>
              ))}
           </div>
           <button onClick={() => navigate('/admin/users')} className="w-full mt-6 text-slate-400 font-medium text-sm hover:text-slate-900 transition-colors">
              Manage Users
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
