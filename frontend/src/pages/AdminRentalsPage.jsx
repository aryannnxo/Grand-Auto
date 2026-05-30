import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Car, Clock, AlertTriangle, CheckCircle, MapPin, CalendarRange, ShieldAlert } from "lucide-react";
import { Badge } from "../components/ui/Badge";

const API = "http://localhost:5000";

const AdminRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [stats, setStats] = useState({ active: 0, dueToday: 0, overdue: 0, pending: 0 });
  const navigate = useNavigate();

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/rentals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { vehicles: allVehicles, bookings: allBookings } = res.data;
      
      // Calculate dynamic stats from allBookings
      let active = 0, dueToday = 0, overdue = 0, pending = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      
      allBookings.forEach(r => {
         const end = new Date(r.endDate);
         if (r.rentalStatus === 'Active' && end < today) {
             r.isActuallyOverdue = true;
             overdue++;
         } else if (r.rentalStatus === 'Overdue') {
             overdue++;
         } else if (r.rentalStatus === 'Active') {
             active++;
             if (end.toDateString() === today.toDateString()) dueToday++;
         } else if (r.rentalStatus === 'Pickup Scheduled') {
             pending++;
         }
      });
      
      setStats({ active, dueToday, overdue, pending });

      // Create a unified list: every vehicle shown once
      // with its LATEST active booking (if any)
      const mergedList = allVehicles.map(v => {
         const activeBooking = allBookings.find(b => 
            b.vehicle?._id === v._id && 
            (b.rentalStatus === 'Active' || b.rentalStatus === 'Pickup Scheduled' || b.rentalStatus === 'Overdue' || b.isActuallyOverdue)
         );
         return {
            vehicle: v,
            booking: activeBooking,
            status: activeBooking ? activeBooking.rentalStatus : 'Idle/Available',
            isActuallyOverdue: activeBooking?.isActuallyOverdue
         };
      });
      
      // Apply filters
      if (filter) {
          if (filter === 'Overdue') {
             setRentals(mergedList.filter(item => item.booking?.isActuallyOverdue || item.status === 'Overdue'));
          } else if (filter === 'Active') {
             setRentals(mergedList.filter(item => item.status === 'Active'));
          } else if (filter === 'Completed') {
              // for completed, we might need a separate view OR show vehicles that were completed
              setRentals(mergedList.filter(item => item.status === 'Completed'));
          } else {
             setRentals(mergedList.filter(item => item.status === filter));
          }
      } else {
          setRentals(mergedList);
      }
      
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRentals(); }, [filter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/admin/rentals/${id}/status`, { rentalStatus: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRentals();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const updateDeliveryStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/admin/rentals/${id}/delivery-status`, { deliveryStatus: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRentals();
    } catch (err) {
      alert("Failed to update delivery status");
    }
  };

  const getUrgencyBadge = (item) => {
     if (item.isActuallyOverdue || item.status === 'Overdue') {
        return <Badge variant="danger" className="animate-pulse shadow-rose-500/30 shadow-lg text-xs py-1"><AlertTriangle size={12} className="mr-1" /> OVERDUE</Badge>;
     }
     if (item.status === 'Active') return <Badge variant="primary" className="bg-[#10b981] text-white">Active Trip</Badge>;
     if (item.status === 'Idle/Available') return <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-50">Available</Badge>;
     if (item.status === 'Pickup Scheduled') return <Badge variant="outline" className="text-primary-600 bg-primary-50">On Boarding</Badge>;
     return <Badge variant="outline">{item.status}</Badge>;
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Car size={14} /> Fleet Availability Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight leading-tight">
            Comprehensive Fleet Logistics
          </h1>
          <p className="text-slate-500 font-medium mt-2">Oversee every listed vehicle. Monitor assignments, availability, and return timelines.</p>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border-2 border-[#10b981] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
                    <Car size={20} />
                 </div>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.active}</span>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Occupied Vehicles</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center">
                    <Clock size={20} />
                 </div>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.dueToday}</span>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Returning Today</p>
           </div>
           
           <div className={`rounded-[2rem] p-6 shadow-sm border-2 flex flex-col justify-between ${stats.overdue > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 animate-pulse-slow' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.overdue > 0 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <ShieldAlert size={20} />
                 </div>
                 <span className={`text-4xl font-black ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{stats.overdue}</span>
              </div>
              <p className={`text-sm font-bold uppercase tracking-wider ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>Overdue Returns!</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-500 flex items-center justify-center">
                    <CheckCircle size={20} />
                 </div>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.pending}</span>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">New Pickup Requests</p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
           <button onClick={() => setFilter("")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"}`}>Full Fleet</button>
           <button onClick={() => setFilter("Active")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "Active" ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"}`}>On Roads</button>
           <button onClick={() => setFilter("Idle/Available")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "Idle/Available" ? "bg-indigo-500 text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"}`}>In Inventory</button>
           <button onClick={() => setFilter("Overdue")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === "Overdue" ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"}`}>Overdue</button>
        </div>

        {/* Data List */}
        {loading ? (
             <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-500 animate-spin" /></div>
        ) : rentals.length === 0 ? (
             <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500">No vehicle records found for this selection.</div>
        ) : (
             <div className="grid grid-cols-1 gap-6">
                {rentals.map(item => (
                  <div key={item.vehicle._id} className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all flex flex-col lg:flex-row gap-6 relative overflow-hidden ${item.isActuallyOverdue ? 'border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                     
                     {/* Visual Indicator for availability */}
                     <div className={`absolute top-0 right-0 left-0 h-1 lg:w-1 lg:h-full lg:bottom-0 lg:left-0 ${item.status === 'Idle/Available' ? 'bg-emerald-400' : item.isActuallyOverdue ? 'bg-rose-500' : 'bg-primary-500'}`} />
                     
                     {/* Car Image Handling */}
                     <div className="w-full lg:w-48 h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                        {item.vehicle.images?.[0] && (
                          <img 
                            src={`${API}${item.vehicle.images[0].url || item.vehicle.images[0]}`} 
                            alt="Vehicle" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {!item.vehicle.images?.length && <div className="w-full h-full flex items-center justify-center text-slate-300 font-black italic">NO IMAGE</div>}
                     </div>

                     <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 gap-4">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white uppercase tracking-tight leading-none">{item.vehicle.brand} {item.vehicle.model}</h3>
                                 {getUrgencyBadge(item)}
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                 Owner: <span className="text-slate-600 dark:text-slate-300">{item.vehicle.owner?.name}</span> • 
                                 Transmission: <span className="text-slate-600 dark:text-slate-300">{item.vehicle.transmission}</span>
                              </p>
                           </div>
                           
                           {item.booking && (
                             <div className="text-left md:text-right">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Renter</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{item.booking.user?.name}</p>
                                <p className="text-xs text-slate-500">{item.booking.user?.phone}</p>
                             </div>
                           )}
                        </div>

                        {item.booking ? (
                           <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-start gap-3">
                                <CalendarRange size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase">Rental Period</p>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {new Date(item.booking.startDate).toLocaleDateString()} <span className="mx-1 text-slate-300 italic">to</span> {new Date(item.booking.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                             </div>
                             <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handover Point</p>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{item.booking.pickupLocation}</p>
                                </div>
                             </div>
                           </div>
                        ) : (
                           <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                               <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest leading-none">Vehicle Idle & Available for New Reservations</span>
                               </div>
                           </div>
                        )}
                     </div>

                     {item.booking && (
                       <div className="flex lg:flex-col justify-end lg:justify-center items-end shrink-0 gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 mt-2 lg:mt-0">
                           <div className="w-full">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stage Control</label>
                             <select 
                                className="w-full text-xs font-black border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer uppercase"
                                value={item.booking.rentalStatus}
                                onChange={(e) => updateStatus(item.booking._id, e.target.value)}
                             >
                                <option value="Pickup Scheduled">Pending Pickup</option>
                                <option value="Active">On Roads</option>
                                <option value="Return Pending">Return Coming</option>
                                <option value="Overdue">Overdue Flag</option>
                                <option value="Completed">Return Confirmed</option>
                                <option value="Cancelled">Cancel Job</option>
                             </select>
                           </div>
                           
                           {(item.booking.pickupMethod === 'Home Delivery' || item.booking.returnMethod === 'Different Location') && (
                             <div className="w-full mt-1">
                               <select 
                                  className="w-full text-[10px] font-black border border-cyan-100 dark:border-cyan-900/50 bg-cyan-50/30 dark:bg-cyan-900/10 text-cyan-600 dark:text-cyan-400 rounded-xl p-2.5 outline-none cursor-pointer uppercase"
                                  value={item.booking.deliveryStatus || 'Scheduled'}
                                  onChange={(e) => updateDeliveryStatus(item.booking._id, e.target.value)}
                               >
                                  <option value="Scheduled">Logistics: Scheduled</option>
                                  <option value="Dispatched">Logistics: Dispatched</option>
                                  <option value="Delivered">Logistics: Delivered</option>
                                  <option value="Returned">Logistics: Recovered</option>
                               </select>
                             </div>
                           )}
                       </div>
                     )}

                  </div>
                ))}
             </div>
        )}
    </div>
  );
};

export default AdminRentalsPage;
