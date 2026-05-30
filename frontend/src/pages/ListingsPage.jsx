import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CarFront, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import CarCard from '../components/CarCard';
import ListingsFilter from '../components/ListingsFilter';
import LiveSearchBar from '../components/LiveSearchBar';
import Navbar from '../components/Navbar';
import CompareBar from '../components/CompareBar';
import CompareModal from '../components/CompareModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import Footer from '../components/Footer';

const ListingsPage = () => {
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Compare Feature State
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
  
  // Mobile Filter State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const initialFilters = {
    search: '',
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuel: '',
    seats: '',
    type: '',
    brand: '',
    sort: 'newest'
  };

  const getFiltersFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const urlFilters = { ...initialFilters };
    if (params.get('search')) urlFilters.search = params.get('search');
    if (params.get('type')) urlFilters.type = params.get('type');
    if (params.get('brand')) urlFilters.brand = params.get('brand');
    if (params.get('fuel')) urlFilters.fuel = params.get('fuel');
    return urlFilters;
  };

  const [filters, setFilters] = useState(getFiltersFromUrl());

  useEffect(() => {
    const newFilters = getFiltersFromUrl();
    setFilters(newFilters);
    fetchVehicles(1, newFilters);
  }, [location.search]); 

  const fetchVehicles = async (page = 1, currentFilters = filters) => {
    try {
      if (page === 1) setLoading(true);
      setError('');
      
      const params = { ...currentFilters, page, limit: 12, available: true };

      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const res = await axios.get('http://localhost:5000/api/vehicles', { params });
      
      if (page === 1) {
        setVehicles(res.data.vehicles || res.data);
      } else {
        setVehicles(prev => [...prev, ...(res.data.vehicles || res.data)]);
      }
      
      setPagination({
        page: res.data.page || 1,
        pages: res.data.pages || 1,
        total: res.data.total || (res.data.vehicles || res.data).length
      });
      
    } catch (err) {
      console.error(err);
      setError('Failed to fetch car listings. Please try again or check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchVehicles(1, filters);
  };

  const resetAndFetch = async () => {
      setFilters(initialFilters);
      await fetchVehicles(1, initialFilters);
  };

  const handleToggleCompare = (car) => {
    setCompareList(prev => {
      if (prev.find(c => c._id === car._id)) {
        return prev.filter(c => c._id !== car._id);
      }
      if (prev.length >= 3) return prev; // max 3 cars
      return [...prev, car];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body relative">
      <Navbar variant="dark" />
      
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
      

      <div className="w-full max-w-[1920px] mx-auto px-4 xl:px-12 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 z-10">
            <ListingsFilter 
              filters={filters} 
              setFilters={setFilters} 
              handleSearch={handleSearch} 
              resetFilters={resetAndFetch} 
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full min-w-0">
            <div className="mb-6">
              <LiveSearchBar 
                value={filters.search} 
                onChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
              />
            </div>

            {/* Header info */}
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white flex items-center">
                 Available Vehicles {!loading && <span className="text-slate-400 dark:text-slate-500 text-base font-medium ml-2">({pagination.total})</span>}
               </h2>
               <Button variant="outline" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                 <Filter size={18} className="mr-2" /> Filters
               </Button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6 flex flex-col items-center justify-center text-center mb-6 shadow-sm"
              >
                <AlertCircle size={40} className="text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Oops! Something went wrong</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                <Button onClick={handleSearch} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                   <RefreshCw size={16} className="mr-2" /> Try Again
                </Button>
              </motion.div>
            )}
            
            {!loading && vehicles.length === 0 && !error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 flex flex-col items-center justify-center text-center rounded-2xl"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary-500/10 animate-pulse"></div>
                  <CarFront size={40} className="relative z-10 text-primary-500/50" />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-800 dark:text-white mb-2 tracking-tight">No cars found 🚗</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                  We couldn't find any vehicles matching your current filters. Try adjusting your search criteria or removing filters.
                </p>
                <Button onClick={resetAndFetch} variant="primary" size="lg" className="w-full sm:w-auto px-8 shadow-glow">
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              <AnimatePresence mode="popLayout">
                {vehicles.map((car, idx) => (
                  <motion.div
                    key={car._id}
                    layout // Animate layout changes like grid reflow
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="h-full relative"
                  >
                    <CarCard 
                      car={car} 
                      onToggleCompare={handleToggleCompare}
                      isCompared={compareList.some(c => c._id === car._id)}
                      compareDisabled={compareList.length >= 3}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && pagination.page === 1 && (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-full">
                    <SkeletonCard />
                  </div>
                ))
              )}
            </div>

            {loading && pagination.page > 1 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                 {Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={`skeleton-more-${i}`} />
                 ))}
               </div>
            )}

            {!loading && pagination.page < pagination.pages && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="mt-16 text-center flex justify-center"
              >
                <Button 
                  onClick={() => fetchVehicles(pagination.page + 1, filters)}
                  variant="outline"
                  size="lg"
                  className="w-full md:w-auto px-16 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800"
                >
                  Load More Vehicles
                </Button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListingsPage;
