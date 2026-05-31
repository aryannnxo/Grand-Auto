import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CarFront } from 'lucide-react';

import Navbar from '../components/Navbar';
import { Button } from '../components/ui/Button';

// Marketplace Components
import CarHero from '../components/vehicle/CarHero';
import CarSummaryCard from '../components/vehicle/CarSummaryCard';
import StickyTabs from '../components/vehicle/StickyTabs';
import CarOverview from '../components/vehicle/CarOverview';
import FeatureList from '../components/vehicle/FeatureList';
import SpecSection from '../components/vehicle/SpecSection';
import RTOTrustSection from '../components/vehicle/RTOTrustSection';
import ReviewsSection from '../components/vehicle/ReviewsSection';
import RelatedCars from '../components/vehicle/RelatedCars';
import ImageGallery from '../components/vehicle/ImageGallery';
import Footer from '../components/Footer';

const API = "http://localhost:5000";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive States
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setActiveImgIdx(0);
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`${API}/api/vehicles/${id}`);
        setVehicle(res.data);
      } catch {
        setError('Failed to load vehicle details. It might have been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const imagesArr = useMemo(() => {
    if (vehicle?.images?.length > 0) {
      return vehicle.images.map(img => typeof img === 'string' ? { url: img, type: 'exterior' } : img);
    }
    return vehicle?.image ? [{ url: vehicle.image, type: 'exterior' }] : [];
  }, [vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] font-body flex items-center justify-center">
         <Navbar />
         <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Loading details...</p>
         </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
       <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center font-body">
         <Navbar />
         <div className="text-center max-w-md px-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CarFront size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">Vehicle Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">The vehicle you are looking for has been moved or is no longer available in our inventory.</p>
            <Button onClick={() => navigate('/listings')} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Return to Search</Button>
         </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-body selection:bg-orange-500/30 overflow-x-hidden pb-16">
      <Navbar />
      
      {/* Breadcrumbs (Marketplace style) */}
      <div className="w-full bg-white border-b border-slate-200 pt-20">
         <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-3 flex text-[11px] text-slate-500 font-medium">
            <span className="hover:text-orange-500 cursor-pointer">Home</span>
            <span className="mx-2">&gt;</span>
            <span className="hover:text-orange-500 cursor-pointer">Used Cars in {vehicle.location?.split(',')[0] || 'Kathmandu'}</span>
            <span className="mx-2">&gt;</span>
            <span className="text-slate-900">{vehicle.brand} {vehicle.model}</span>
         </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-0 pt-6">
        
        {/* TOP SECTION: Hero Image + Summary Card */}
        <div className="grid lg:grid-cols-[65%_35%] gap-6 mb-8">
           <CarHero 
              vehicle={vehicle} 
              imagesArr={imagesArr} 
              setActiveImgIdx={setActiveImgIdx} 
              setIsFullscreen={setIsFullscreen} 
           />
           <CarSummaryCard vehicle={vehicle} />
        </div>
        

        {/* STICKY TABS NAVIGATION */}
        <StickyTabs />

        {/* CONTENT */}
        <div className="flex flex-col pt-8">
           
           {/* Detailed Information */}
           <CarOverview vehicle={vehicle} />
           
           <div id="features" className="scroll-mt-32">
             <FeatureList />
           </div>
           
           <div id="specs" className="scroll-mt-32">
             <SpecSection vehicle={vehicle} />
           </div>
           
           <RTOTrustSection />
           
           <div id="reviews" className="scroll-mt-32">
             <ReviewsSection vehicle={vehicle} />
           </div>

        </div>
        
        {/* RELATED CARS (Carousel) */}
        <RelatedCars vehicle={vehicle} />
      </main>

      {/* FULLSCREEN GALLERY MODAL */}
      <ImageGallery 
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        imagesArr={imagesArr} 
        activeImgIdx={activeImgIdx} 
        setActiveImgIdx={setActiveImgIdx}
      />

      <Footer />
    </div>
  );
};

export default VehicleDetailsPage;
