import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CarFront, Search, ShieldCheck, MapPin, Settings, Info, CreditCard } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import AdminCarDetailsModal from "../components/AdminCarDetailsModal";

const API = "http://localhost:5000";

const AdminCarsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    const timer = setTimeout(() => {
      fetchVehicles(); 
    }, 300);
    return () => clearTimeout(timer);
  }, [filter, searchQuery]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const params = new URLSearchParams();
      if (filter) params.append("operationalStatus", filter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await axios.get(`${API}/api/admin/cars?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        alert("You are not authorized as an admin!");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "available": return <Badge variant="success" className="shadow-sm">Available</Badge>;
      case "rented": return <Badge variant="primary" className="shadow-sm">Rented</Badge>;
      case "maintenance": return <Badge variant="warning" className="shadow-sm bg-orange-500 text-white border-orange-500">Maintenance</Badge>;
      case "inactive": return <Badge variant="danger" className="shadow-sm">Inactive</Badge>;
      default: return <Badge variant="default" className="shadow-sm">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Fleet Management</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-64">
              <Input 
                icon={Search}
                type="text" 
                placeholder="Search brand/model..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0 rounded-md"
              />
            </div>
            <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-800">
              {['', 'available', 'rented', 'maintenance', 'inactive'].map(status => (
                 <button 
                    key={status} onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded text-sm capitalize transition-all ${filter === status ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 >
                   {status === '' ? 'All Statuses' : status}
                 </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading fleet data...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No vehicles found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                key={vehicle._id} 
                className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                onClick={() => handleOpenModal(vehicle)}
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  {(vehicle.images && vehicle.images.length > 0) || vehicle.image ? (
                    <img src={`${API}${vehicle.images?.[0]?.url || vehicle.images?.[0] || vehicle.image}`} alt={vehicle.name} className="w-full h-full object-cover transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-100 dark:bg-slate-800"><CarFront size={48} className="opacity-20 mb-2"/></div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(vehicle.operationalStatus || 'available')}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-end">
                    <h3 className="text-lg font-semibold text-white truncate" title={`${vehicle.brand} ${vehicle.model}`}>{vehicle.brand} {vehicle.model}</h3>
                    <div className="text-right">
                       <span className="text-sm font-bold text-primary-400 block">${vehicle.pricePerDay}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <MapPin size={14} className="text-primary-500"/>
                       {vehicle.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <Settings size={14} className="text-primary-500"/>
                       {vehicle.transmission}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-[10px]">{vehicle.owner?.name?.charAt(0) || "O"}</div>
                       <p className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate max-w-[120px]">{vehicle.owner?.name || 'Grand Auto'}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400 px-2 h-7 text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20">
                      Manage <Info size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AdminCarDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        carId={selectedCar?._id}
        refreshList={fetchVehicles}
      />
    </>
  );
};

export default AdminCarsPage;
