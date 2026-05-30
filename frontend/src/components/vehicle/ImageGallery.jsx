import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const API = "http://localhost:5000";

const ImageGallery = ({ isFullscreen, setIsFullscreen, imagesArr, activeImgIdx, setActiveImgIdx }) => {
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') setActiveImgIdx((prev) => (prev === imagesArr.length - 1 ? 0 : prev + 1));
      if (e.key === 'ArrowLeft') setActiveImgIdx((prev) => (prev === 0 ? imagesArr.length - 1 : prev - 1));
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen, imagesArr.length, setActiveImgIdx, setIsFullscreen]);

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-3xl flex flex-col">
          <div className="flex justify-between items-center p-6 text-slate-900 dark:text-white absolute top-0 w-full z-10">
              <div className="font-bold tracking-[0.3em] uppercase text-[10px] opacity-70 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full">
                {activeImgIdx + 1} &nbsp;/&nbsp; {imagesArr.length}
              </div>
              <button onClick={() => setIsFullscreen(false)} className="p-3 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-slate-100/50 dark:bg-white/5 shadow-sm">
                <X size={20} />
              </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative px-4 md:px-16 overflow-hidden mt-12 mb-20">
              {imagesArr.length > 1 && (
                <button className="absolute left-4 md:left-8 p-4 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white backdrop-blur-md transition-all z-10 group shadow-sm" onClick={(e) => { e.stopPropagation(); setActiveImgIdx((prev) => (prev === 0 ? imagesArr.length - 1 : prev - 1)); }}>
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImgIdx} initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }} transition={{ duration: 0.4 }}
                  src={`${API}${imagesArr[activeImgIdx]?.url}`} 
                  className="w-full h-full max-h-[80vh] object-contain filter drop-shadow-xl md:drop-shadow-2xl"
                />
              </AnimatePresence>
              
              {imagesArr.length > 1 && (
                <button className="absolute right-4 md:right-8 p-4 bg-slate-100/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-full text-slate-900 dark:text-white backdrop-blur-md transition-all z-10 group shadow-sm" onClick={(e) => { e.stopPropagation(); setActiveImgIdx((prev) => (prev === imagesArr.length - 1 ? 0 : prev + 1)); }}>
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageGallery;
