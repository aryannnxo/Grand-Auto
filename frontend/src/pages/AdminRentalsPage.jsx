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
    <div className="w-full max-w-7xl mx-auto pt-2">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Comprehensive Fleet Logistics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Oversee every listed vehicle. Monitor assignments, availability, and return timelines.</p>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 shadow-sm border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                    <Car size={20} />
                 </div>
                 <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase">Occupied Vehicles</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
                    <Clock size={20} />
                 </div>
                 <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.dueToday}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase">Returning Today</p>
           </div>
           
           <div className={`rounded-lg p-5 shadow-sm border flex flex-col justify-between ${stats.overdue > 0 ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stats.overdue > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <ShieldAlert size={20} />
                 </div>
                 <span className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{stats.overdue}</span>
              </div>
              <p className={`text-xs font-medium uppercase ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>Overdue Returns!</p>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-lg p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                 </div>
                 <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</span>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase">New Pickup Requests</p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 bg-white dark:bg-slate-900 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-800 w-fit">
           <button onClick={() => setFilter("")} className={`px-4 py-2 rounded text-sm transition-all ${filter === "" ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Full Fleet</button>
           <button onClick={() => setFilter("Active")} className={`px-4 py-2 rounded text-sm transition-all ${filter === "Active" ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>On Roads</button>
           <button onClick={() => setFilter("Idle/Available")} className={`px-4 py-2 rounded text-sm transition-all ${filter === "Idle/Available" ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>In Inventory</button>
           <button onClick={() => setFilter("Overdue")} className={`px-4 py-2 rounded text-sm transition-all ${filter === "Overdue" ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Overdue</button>
        </div>

        {/* Data List */}
        {loading ? (
             <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-primary-500 animate-spin" /></div>
        ) : rentals.length === 0 ? (
             <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500">No vehicle records found for this selection.</div>
        ) : (
             <div className="grid grid-cols-1 gap-4">
                {rentals.map(item => (
                  <div key={item.vehicle._id} className={`bg-white dark:bg-slate-900 rounded-lg p-5 border shadow-sm transition-all flex flex-col lg:flex-row gap-5 relative overflow-hidden ${item.isActuallyOverdue ? 'border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
                     
                     {/* Visual Indicator for availability */}
                     <div className={`absolute top-0 right-0 left-0 h-1 lg:w-1 lg:h-full lg:bottom-0 lg:left-0 ${item.status === 'Idle/Available' ? 'bg-emerald-400' : item.isActuallyOverdue ? 'bg-rose-500' : 'bg-primary-500'}`} />
                     
                     {/* Car Image Handling */}
                     <div className="w-full lg:w-40 h-24 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                        {item.vehicle.images?.[0] && (
                          <img 
                            src={`${API}${item.vehicle.images[0].url || item.vehicle.images[0]}`} 
                            alt="Vehicle" 
                            className="w-full h-full object-cover" 
                          />
                        )}
                        {!item.vehicle.images?.length && <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm font-medium">No Image</div>}
                     </div>

                     <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row md:justify-between items-start mb-3 gap-3">
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-none">{item.vehicle.brand} {item.vehicle.model}</h3>
                                 {getUrgencyBadge(item)}
                              </div>
                              <p className="text-xs text-slate-500 mt-1.5">
                                 Owner: <span className="text-slate-700 dark:text-slate-300">{item.vehicle.owner?.name}</span> • 
                                 Transmission: <span className="text-slate-700 dark:text-slate-300">{item.vehicle.transmission}</span>
                              </p>
                           </div>
                           
                           {item.booking && (
                             <div className="text-left md:text-right">
                                <p className="text-xs text-slate-500 mb-0.5">Current Renter</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-white">{item.booking.user?.name}</p>
                                <p className="text-xs text-slate-500">{item.booking.user?.phone}</p>
                             </div>
                           )}
                        </div>

                        {item.booking ? (
                           <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-start gap-2">
                                <CalendarRange size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500">Rental Period</p>
                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {new Date(item.booking.startDate).toLocaleDateString()} <span className="mx-1 text-slate-400">to</span> {new Date(item.booking.endDate).toLocaleDateString()}
                                  </p>
                                </div>
                             </div>
                             <div className="flex items-start gap-2">
                                <MapPin size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500">Handover Point</p>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{item.booking.pickupLocation}</p>
                                </div>
                             </div>
                           </div>
                        ) : (
                           <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-900/30 w-fit">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 leading-none">Vehicle Idle & Available</span>
                               </div>
                           </div>
                        )}
                     </div>

                     {item.booking && (
                       <div className="flex lg:flex-col justify-end lg:justify-center items-end shrink-0 gap-3 min-w-[180px] border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-5 mt-2 lg:mt-0">
                           <div className="w-full">
                             <label className="block text-xs text-slate-500 mb-1.5">Stage Control</label>
                             <select 
                                className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md p-2 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer"
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
                                  className="w-full text-xs border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 rounded-md p-2 outline-none cursor-pointer"
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
