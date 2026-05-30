import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const API = "http://localhost:5000";

const CarHero = ({ vehicle, imagesArr, setActiveImgIdx, setIsFullscreen }) => {
  const [currentIdx, setCurrentIdx] = useState(1);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] bg-slate-100 rounded-xl overflow-hidden group">
      

      {/* Main Swiper Slider */}
      {imagesArr.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            prevEl: '.car-hero-prev',
            nextEl: '.car-hero-next',
          }}
          loop={true}
          spaceBetween={0}
          className="w-full h-full"
          onSlideChange={(swiper) => {
            setActiveImgIdx(swiper.realIndex);
            setCurrentIdx(swiper.realIndex + 1);
          }}
        >
          {imagesArr.map((img, idx) => (
            <SwiperSlide key={idx} className="w-full h-full cursor-pointer" onClick={() => setIsFullscreen(true)}>
              <img 
                src={`${API}${img.url}`} 
                alt={`${vehicle.brand} ${vehicle.model} - ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
           <ImageIcon size={48} className="mb-2 opacity-20" />
           <span className="text-sm font-medium">No images available</span>
        </div>
      )}

      {/* Navigation Arrows (Custom) */}
      {imagesArr.length > 1 && (
        <>
          <button className="car-hero-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button className="car-hero-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight size={20} />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 z-20 bg-black/60 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 cursor-pointer" onClick={() => setIsFullscreen(true)}>
            <ImageIcon size={12} />
            {currentIdx} / {imagesArr.length}
          </div>
        </>
      )}
    </div>
  );
};

export default CarHero;
