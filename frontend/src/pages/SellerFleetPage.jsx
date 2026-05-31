import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  CarFront,
  PlusCircle,
  Edit,
  Trash2,
  Tag,
  Users,
  Fuel,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const SellerFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/vehicles/owner/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your fleet.");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> Approved</span>;
      case "pending":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> Pending Review</span>;
      case "rejected":
        return <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-wider"><AlertCircle size={12} /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">My Fleet</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">Manage your catalog of high-performance vehicles and track their verification status.</p>
        </div>
        <Link 
          to="/seller/add-vehicle" 
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-black/10"
        >
          <PlusCircle size={20} /> Add New Vehicle
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] h-80 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((car) => (
            <motion.div
              key={car._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={`${API}${car.images?.[0]?.url || car.images?.[0] || ""}`} 
                  alt={car.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(car.verificationStatus)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <Link to={`/vehicle/${car._id}`} className="flex items-center gap-2 text-white text-sm font-bold">
                      View Public Page <ExternalLink size={14} />
                   </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{car.name}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{car.brand} • {car.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">Rs. {car.pricePerDay}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">per day</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800">
                    <Users size={14} className="text-primary-500" />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{car.seats} Seats</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800">
                    <Settings size={14} className="text-primary-500" />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{car.transmission}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100 dark:border-slate-800">
                    <Fuel size={14} className="text-primary-500" />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{car.fuel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/edit-vehicle/${car._id}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[13px] hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                    <Edit size={14} /> Edit Details
                  </Link>
                  <button className="w-12 h-12 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 text-center border border-slate-200 dark:border-slate-800 border-dashed">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CarFront size={48} className="text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">No Vehicles Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">You haven't listed any vehicles yet. Start your car rental business by adding your first vehicle.</p>
          <Link to="/seller/add-vehicle" className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
            <PlusCircle size={20} /> Add Your First Car
          </Link>
        </div>
      )}
    </div>
  );
};

export default SellerFleetPage;
