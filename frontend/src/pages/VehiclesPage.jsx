import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CarFront, MapPin, RefreshCw, Car, MoreVertical, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import LiveSearchBar from "../components/LiveSearchBar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const API = "http://localhost:5000";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyVehicles();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get(`${API}/api/vehicles/owner/my-listings?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (e) {
      setError("Failed to load your vehicles.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/api/vehicles/${id}/resubmit`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyVehicles();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to resubmit");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <Badge variant="success" className="shadow-lg">Approved</Badge>;
      case 'rejected': return <Badge variant="danger" className="shadow-lg">Rejected</Badge>;
      default: return <Badge variant="warning" className="shadow-lg">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative pb-24">
      <Navbar variant="dark" />
      
      <main className="max-w-7xl mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-3">
              <CarFront size={14} /> Owner Fleet Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">My Vehicles</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage your fleet and track verification status.</p>
          </div>
          
          <Button variant="primary" size="lg" className="shadow-glow whitespace-nowrap" onClick={() => navigate("/add-vehicle")}>
            <Plus size={20} className="mr-2" /> Add New Vehicle
          </Button>
        </div>

        <div className="mb-8">
          <LiveSearchBar 
             value={searchQuery}
             onChange={setSearchQuery}
             placeholder="Search your fleet by name, brand, model, location..."
          />
        </div>

        {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 mb-8 font-medium border border-red-100 dark:border-red-900/50">{error}</div>}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your fleet...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <Car size={40} />
            </div>
            <h3 className="text-2xl font-black font-heading text-slate-800 dark:text-white mb-2">Your fleet is empty</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">You haven't added any vehicles to the platform yet. Start earning by listing your premium cars.</p>
            <Button variant="primary" size="lg" onClick={() => navigate("/add-vehicle")}><Plus size={20} className="mr-2"/> Add Your First Vehicle</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                key={v._id} 
                className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {(v.images && v.images.length > 0) || v.image ? (
                    <img src={`${API}${v.images?.[0]?.url || v.images?.[0] || v.image}`} alt={v.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><CarFront size={48} className="opacity-20" /></div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(v.verificationStatus)}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black font-heading truncate drop-shadow-md">{v.name}</h3>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{v.brand} {v.model} • {v.year}</p>
                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1"><MapPin size={14} className="text-primary-500"/> {v.location}</p>
                  </div>
                  
                  <div className="mb-6 flex items-end gap-1">
                     <span className="text-2xl font-black text-primary-600 dark:text-primary-400 leading-none">Rs. {v.pricePerDay}</span>
                     <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/ day</span>
                  </div>
                  
                  <div className="mt-auto">
                    {v.verificationStatus === "rejected" && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl mb-4 border border-rose-100 dark:border-rose-900/50">
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">Rejection Reason</p>
                        <p className="text-sm text-rose-800 dark:text-rose-300 line-clamp-2">{v.rejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Edit</Button>
                       {v.verificationStatus === "rejected" && (
                         <Button variant="primary" className="flex-1 bg-primary-500 hover:bg-primary-600 shadow-primary-500/20" onClick={() => handleResubmit(v._id)}>
                           <RefreshCw size={16} className="mr-2" /> Resubmit
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VehiclesPage;
