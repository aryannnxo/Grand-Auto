import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  CarFront,
  Key,
  Wrench,
  TrendingUp,
  DollarSign,
  CreditCard,
  PlusCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from "lucide-react";

const API = "http://localhost:5000";

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    commission: 0,
    activeListings: 0,
    activeBookings: 0,
    pendingServices: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Fetch Owner's Vehicles to count active listings
        const vehiclesRes = await axios.get(`${API}/api/vehicles/owner/my-listings`, config);
        const myVehicles = vehiclesRes.data || [];
        
        // 2. Fetch Owner's Incoming Bookings
        const bookingsRes = await axios.get(`${API}/api/bookings/owner-bookings`, config);
        const myBookings = bookingsRes.data || [];

        // 3. Fetch earnings and commission for this seller
        const commissionRes = await axios.get(`${API}/api/seller/commission`, config);
        const { totalEarnings, commission } = commissionRes.data;

        setStats({
          totalEarnings,
          commission,
          activeListings: myVehicles.length,
          activeBookings: myBookings.filter(b => b.status === "Confirmed" || b.status === "In Progress").length,
          pendingServices: 0 // removed
        });
        
        setRecentBookings(myBookings.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">Track your fleet performance, earnings, and manage your vehicle business efficiently.</p>
        </div>
        <Link 
          to="/seller/add-vehicle" 
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-black/10"
        >
          <PlusCircle size={20} /> List New Car
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Earnings", value: `Rs. ${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, trend: "+12%", color: "text-emerald-500" },
          { label: "Commission (20%)", value: `Rs. ${stats.commission.toLocaleString()}`, icon: CreditCard, trend: "-20%", color: "text-yellow-500" },
          { label: "My Vehicles", value: stats.activeListings, icon: CarFront, trend: "Approved", color: "text-blue-500" },
          { label: "Active Rentals", value: stats.activeBookings, icon: Activity, trend: "In Progress", color: "text-purple-500" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
              ) : (
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              )}
              <p className={`text-[10px] font-bold ${stat.color} flex items-center gap-1 mt-2 uppercase tracking-widest`}>
                {stat.trend}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Recent Activities</h2>
            <Link to="/seller/bookings" className="text-sm font-bold text-primary-500 hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
               <div className="p-8 space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
               </div>
            ) : recentBookings.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((booking, idx) => (
                  <div key={booking._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src={`${API}${booking.vehicle?.images?.[0]?.url || ""}`} alt="car" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{booking.vehicle?.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Booked by {booking.user?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">Rs. {booking.totalPrice}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity size={32} />
                </div>
                <p className="font-bold">No bookings yet.</p>
                <p className="text-sm">List your cars and start earning!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Profile Card */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Store Performance</h2>
           <div className="bg-gradient-to-br from-primary-600 to-accent p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <Activity className="mb-4 opacity-50" size={32} />
              <h3 className="text-3xl font-black mb-2">98%</h3>
              <p className="font-bold opacity-80 text-sm">Response Rate</p>
              <div className="mt-6 flex gap-2">
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Top Rated</div>
                 <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Verified</div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payout Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Your earnings will be transferred to your connected bank account weekly.</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Next Payout</p>
                    <p className="font-bold text-slate-900 dark:text-white">Scheduled for Sunday</p>
                 </div>
              </div>
              <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm transition-colors hover:bg-slate-800 dark:hover:bg-slate-200">
                 Manage Payments
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
