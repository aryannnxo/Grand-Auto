import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Trash2, Edit3, MapPin, Users, Settings, Filter, Fuel, Calendar, CalendarDays, Activity, CarFront } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

const API = "http://localhost:5000";

const AdminCarDetailsModal = ({ isOpen, onClose, carId, refreshList }) => {
  const [car, setCar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operationalStatus, setOperationalStatus] = useState("available");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && carId) {
      fetchCarDetails();
    }
  }, [isOpen, carId]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCar(res.data.car);
      setBookings(res.data.bookings || []);
      setOperationalStatus(res.data.car.operationalStatus || "available");
    } catch (err) {
      alert("Failed to load car details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!car) return;
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/admin/cars/${carId}`, { operationalStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshList();
      onClose();
    } catch (err) {
      alert("Failed to update car status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete the ${car?.brand} ${car?.model}? This action cannot be undone.`)) return;
    
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/admin/cars/${carId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshList();
      onClose();
    } catch (err) {
      alert("Failed to delete car");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[150] flex flex-col justify-end lg:justify-center items-center p-0 lg:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-5xl lg:rounded-3xl rounded-t-3xl h-[90vh] lg:h-auto lg:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {loading || !car ? (
            <div className="flex-1 flex items-center justify-center">
               <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-sm">
                    <CarFront size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                      {car.brand} {car.model} <span className="text-slate-400 font-medium ml-1">({car.year})</span>
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      ID: {car._id.slice(-8)}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column - Details */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Image Gallery */}
                    <div className="h-64 md:h-80 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      {(car.images && car.images.length > 0) || car.image ? (
                        <img src={`${API}${car.images?.[0]?.url || car.images?.[0] || car.image}`} alt={car.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><CarFront size={64} className="opacity-20"/></div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge variant="primary" className="shadow-lg backdrop-blur-md bg-white/90 text-sm">Rs. {car.pricePerDay}/day</Badge>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div>
                      <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white mb-4 flex items-center relative z-10">
                        <Filter className="mr-2 text-primary-500" size={20} /> Specifications
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { icon: CarFront, label: "Type", value: car.type },
                          { icon: Users, label: "Seats", value: `${car.seats} Seats` },
                          { icon: Settings, label: "Transmission", value: car.transmission },
                          { icon: Fuel, label: "Fuel", value: car.fuel },
                        ].map((spec, idx) => (
                           <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                             <spec.icon size={24} className="text-primary-500 mb-2" />
                             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{spec.label}</span>
                             <span className="font-bold text-slate-800 dark:text-slate-200">{spec.value}</span>
                           </div>
                        ))}
                      </div>
                    </div>

                    {/* Booking History */}
                    <div>
                      <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white mb-4 flex items-center">
                         <CalendarDays className="mr-2 text-primary-500" size={20} /> Latest Bookings
                      </h3>
                      {bookings.length > 0 ? (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                           <table className="w-full text-left">
                             <thead className="bg-slate-50 dark:bg-slate-800">
                               <tr>
                                 <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                 <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                                 <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                 <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                               {bookings.slice(0, 3).map((b) => (
                                 <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                   <td className="p-3 text-sm font-medium text-slate-900 dark:text-white">{b.user?.name}</td>
                                   <td className="p-3 text-xs text-slate-600 dark:text-slate-400">
                                      {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                   </td>
                                   <td className="p-3">
                                     <Badge variant={b.status === 'Confirmed' ? 'success' : b.status === 'Pending' ? 'warning' : 'outline'} className="text-[10px]">
                                       {b.status}
                                     </Badge>
                                   </td>
                                   <td className="p-3 text-sm font-bold text-slate-900 dark:text-white">Rs. {b.totalPrice}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">No bookings exist for this vehicle yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Admin Panel */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white mb-4 flex items-center">
                         <Activity className="mr-2 text-primary-500" size={20} /> Management
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Operational Status</label>
                          <select 
                            value={operationalStatus} 
                            onChange={(e) => setOperationalStatus(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none font-medium"
                          >
                            <option value="available">Available (Public)</option>
                            <option value="rented">Currently Rented</option>
                            <option value="maintenance">Under Maintenance</option>
                            <option value="inactive">Inactive / Hidden</option>
                          </select>
                        </div>
                        
                        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Verifications</span>
                           <Badge variant={car.isVerified ? 'success' : 'warning'}>{car.isVerified ? 'Verified' : 'Pending'}</Badge>
                        </div>

                        <div className="pt-2">
                          <Button 
                            variant="primary" 
                            className="w-full shadow-lg" 
                            onClick={handleUpdateStatus} 
                            disabled={isUpdating || operationalStatus === car.operationalStatus}
                          >
                            {isUpdating ? "Saving..." : <><Save size={18} className="mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 flex flex-col gap-3">
                      <h4 className="font-bold text-rose-700 dark:text-rose-400 flex items-center">
                        <Trash2 size={18} className="mr-2" /> Danger Zone
                      </h4>
                      <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mb-2">
                        Permanently delete this vehicle from the database. This action cannot be undone and may affect historical bookings.
                      </p>
                      <Button variant="outline" className="text-rose-600 border-rose-300 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/30 w-full" onClick={handleDelete} disabled={isDeleting}>
                         {isDeleting ? "Deleting..." : "Delete Vehicle"}
                      </Button>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Owner Info</p>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 flex items-center justify-center font-bold">
                           {car.owner?.name?.charAt(0) || "O"}
                         </div>
                         <div>
                           <p className="font-bold text-slate-900 dark:text-white text-sm">{car.owner?.name || "System"}</p>
                           <p className="text-slate-500 text-xs">{car.owner?.email || "N/A"}</p>
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminCarDetailsModal;
