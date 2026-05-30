import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation } from 'swiper/modules';
import CarCard from '../CarCard';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

const API = "http://localhost:5000";

const RelatedCars = ({ vehicle }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get(`${API}/api/vehicles/similar`, {
          params: {
            price: vehicle?.pricePerDay,
            location: vehicle?.location,
            excludeId: vehicle?._id
          }
        });
        setRelated(res.data);
      } catch (err) {
        console.error("Error fetching related cars:", err);
      } finally {
        setLoading(false);
      }
    };
    if (vehicle?._id) {
      fetchRelated();
    }
  }, [vehicle]);

  if (loading || related.length === 0) return null;

  return (
    <div className="py-10 border-t border-slate-200 mt-8 mb-8 bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
         <h3 className="text-2xl font-black text-slate-900 tracking-tight">Similar Cars</h3>
         <p className="text-sm text-slate-500 mt-1">Cars that match your budget and location.</p>
      </div>
      
      <div className="w-full relative px-4 md:px-0">
        <Swiper
          style={{
            '--swiper-navigation-color': '#3b82f6',
            '--swiper-navigation-size': '20px',
          }}
          slidesPerView={1.2}
          spaceBetween={16}
          freeMode={true}
          navigation={true}
          modules={[FreeMode, Navigation]}
          breakpoints={{
            640: { slidesPerView: 2.2, spaceBetween: 20 },
            768: { slidesPerView: 3.2, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="pb-8 -mx-4 px-4 md:mx-0 md:px-0 related-cars-swiper"
        >
          {related.map(car => (
            <SwiperSlide key={car._id} className="h-auto">
              <div className="h-full transform transition-transform duration-300 hover:-translate-y-2">
                 <CarCard car={car} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RelatedCars;
