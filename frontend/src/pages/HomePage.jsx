import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Star, MapPin, Zap, ChevronRight, CheckCircle2 } from "lucide-react";

import Navbar from "../components/Navbar";
import RentCarSearchPanel from "../components/RentCarSearchPanel";
import CarCard from "../components/CarCard";
import CompareBar from "../components/CompareBar";
import CompareModal from "../components/CompareModal";
import { Button } from "../components/ui/Button";
import Footer from "../components/Footer";

const API = "http://localhost:5000";

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // For bookmarks / comparisons
  const [compareList, setCompareList] = useState(() => {
    try {
      const item = localStorage.getItem('compareList');
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/vehicles?limit=6&available=true`);
      const data = res.data.vehicles || res.data;
      setFeaturedCars(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (searchParams) => {
    const params = new URLSearchParams();
    if (searchParams.location) params.append('search', searchParams.location); 
    if (searchParams.carType) params.append('type', searchParams.carType);
    if (searchParams.fuelType) params.append('fuel', searchParams.fuelType);
    navigate(`/listings?${params.toString()}`);
  };

  const handleToggleBookmark = (car) => {
    setCompareList(prev => {
      if (prev.find(c => c._id === car._id)) {
        return prev.filter(c => c._id !== car._id);
      }
      if (prev.length >= 3) return prev; // max 3 cars
      return [...prev, car];
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-body flex flex-col overflow-x-hidden">
      <Navbar />

      <CompareBar 
        compareList={compareList} 
        onRemove={(id) => setCompareList(prev => prev.filter(c => c._id !== id))}
        onCompare={() => setIsCompareModalOpen(true)}
        onClear={() => setCompareList([])}
      />

      <CompareModal 
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        cars={compareList}
      />

      {/* Hero Section */}
      <section className="bg-[#0b0f19] overflow-hidden min-h-[calc(100vh-80px)] max-h-[1080px] flex flex-col relative w-full pt-4 lg:pt-8">
        {/* Background Image Container */}
        <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full z-0 opacity-80 lg:opacity-100 flex items-center justify-end">
           <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/30 to-transparent z-10 hidden lg:block"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/30 to-transparent z-10 block lg:hidden"></div>
           
           <img 
             src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1920&auto=format&fit=crop" 
             alt="Luxury Supercar on Dark Background" 
             className="w-full h-full object-cover object-[center_bottom] lg:object-[80%_bottom] relative -top-16 lg:-top-20" 
           />
        </div>

        {/* Top Split: Text & Main Hero Content */}
        <div className="relative z-20 flex-grow flex items-center w-full">
          <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-6">
            <div className="max-w-2xl px-2 lg:px-0 relative -mt-16 lg:-mt-24">
               {/* Location */}
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                 <div className="flex items-center gap-1.5 text-slate-400 text-[13px] font-bold mb-4 lg:mb-6">
                    <MapPin size={16} /> Kathmandu, Nepal
                 </div>
               </motion.div>
               
               {/* Huge Heading */}
               <motion.h1 
                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] font-medium text-white tracking-tight leading-[1.05]"
               >
                 RENT ANYWHERE<br/>
                 TRAVEL<br/>
                 EVERYWHERE
               </motion.h1>
            </div>
          </div>
        </div>
        
        <div className="relative z-30 w-full max-w-[1400px] mx-auto px-4 lg:px-6 pb-8 lg:pb-12 mt-auto">
          <motion.div 
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
             className="w-full max-w-6xl mx-auto overflow-visible"
          >
             <RentCarSearchPanel />
          </motion.div>
        </div>
      </section>

      {/* Under-Hero Stats */}
      <section className="bg-slate-50 dark:bg-slate-950 pt-52 md:pt-32 pb-8 border-b border-slate-100 dark:border-slate-900/50">
         <div className="max-w-[1400px] mx-auto px-4 lg:px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
           {['1000+ Premium Cars', 'Verified Owners', 'Comprehensive Insurance', '24/7 Roadside Support'].map((stat, i) => (
             <div key={i} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-[11px] md:text-xs uppercase tracking-wider group hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
               <CheckCircle2 size={16} className="text-primary-500 group-hover:scale-110 transition-transform" /> {stat}
             </div>
           ))}
         </div>
      </section>

      {/* How it Works section */}
      <section className="py-10 lg:py-12 bg-white dark:bg-slate-900 relative">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl lg:text-3xl font-black font-heading text-slate-900 dark:text-white mb-2 tracking-tight">How GrandAuto Works</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">Skip the rental counter. Find the perfect car, book it online, and hit the road in minutes.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { icon: MapPin, title: "1. Find Your Perfect Car", desc: "Select from hundreds of premium and classic vehicles near your location." },
              { icon: Zap, title: "2. Book Instantly & Securely", desc: "Verify your identity once. After that, book any car instantly securely." },
              { icon: ShieldCheck, title: "3. Hit The Open Road", desc: "Pick up the keys directly from the owner or have the car delivered to you." }
            ].map((step, idx) => (
               <motion.div 
                 key={idx}
                 whileHover={{ y: -3 }}
                 className="p-5 md:p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group transition-all"
               >
                 <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-primary-500 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 border border-slate-100 dark:border-slate-700">
                    <step.icon size={22} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-base font-bold font-heading text-slate-800 dark:text-white mb-2">{step.title}</h3>
                 <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Fleet */}
      <section className="py-10 lg:py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
             <div>
               <h2 className="text-xl lg:text-3xl font-black font-heading text-slate-900 dark:text-white mb-1 tracking-tight">Featured Fleet</h2>
               <p className="text-slate-500 text-sm">Hand-picked premium vehicles for your next adventure.</p>
             </div>
             <Button onClick={() => navigate('/listings')} size="sm" className="rounded-full shadow-sm group font-bold">
                Browse All <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
             </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {loading ? (
               [1, 2, 3].map(i => (
                 <div key={i} className="h-[280px] bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-100 dark:border-slate-800 p-4" />
               ))
            ) : featuredCars.length === 0 ? (
               <div className="col-span-3 text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <p className="text-slate-500 text-sm font-medium">No vehicles available at the moment.</p>
               </div>
            ) : (
               featuredCars.map(car => (
                 <CarCard 
                    key={car._id} 
                    car={car}
                    onToggleCompare={handleToggleBookmark}
                    isCompared={compareList.some(c => c._id === car._id)}
                    compareDisabled={compareList.length >= 3}
                 />
               ))
            )}
          </div>
        </div>
      </section>

      {/* CTA - Become an Owner */}
      {(!localStorage.getItem("token") || (localStorage.getItem("userRole") !== "admin" && localStorage.getItem("isVerifiedOwner") !== "true")) && (
        <section className="py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
          
          <div className="max-w-[1400px] mx-auto px-4 lg:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-white w-full max-w-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl">
               <h2 className="text-2xl lg:text-3xl font-black font-heading mb-3 leading-tight tracking-tight">Let your car work for you.</h2>
               <p className="text-slate-200 text-sm mb-6 font-medium leading-relaxed">Turn your depreciating asset into a money-making engine. Join thousands of sellers on GrandAuto and earn securely.</p>
               <ul className="flex flex-col gap-3 mb-6">
                 {['Comprehensive Insurance', 'Verified Renters', 'Manage Your Schedule'].map((item, i) => (
                   <li key={i} className="flex items-center gap-2 text-xs md:text-sm font-bold text-white tracking-wide">
                     <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/50 shrink-0">
                       <CheckCircle2 fill="currentColor" className="text-primary-400" size={12} />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
               <Button variant="primary" size="sm" className="w-full sm:w-auto bg-primary-500 text-white hover:bg-primary-400 rounded-full px-6 py-2 border-0 shadow-[0_5px_15px_rgba(75,107,251,0.3)] transition-all" onClick={() => navigate('/apply-owner')}>
                 Become A Seller
               </Button>
             </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
