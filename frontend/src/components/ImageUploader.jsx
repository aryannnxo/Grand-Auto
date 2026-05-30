import React, { useRef, useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploader = ({ title, maxImages = 5, images, setImages }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, maxImages));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setImages(prev => [...prev, ...newFiles].slice(0, maxImages));
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title} ({images.length}/{maxImages})
        </label>
      </div>
      
      <div 
        className={`flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 transition-all duration-300 bg-white dark:bg-slate-900 border-2 border-dashed rounded-xl cursor-pointer group relative overflow-hidden ${isDragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-primary-400'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center space-y-3 z-10 pointer-events-none">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDragOver ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500'}`}>
             <UploadCloud size={24} />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Click or split-view drag & drop</span>
          <span className="text-xs font-medium text-slate-400">Upload high quality .webp, .jpg, or .png</span>
        </div>
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          accept="image/png, image/jpeg, image/jpg, image/webp" 
          className="hidden" 
          onChange={handleImageChange} 
        />
      </div>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {images.map((img, idx) => (
               <motion.div 
                 key={`${img.name}-${idx}`}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 layout
                 className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 dark:border-slate-800 shadow-sm"
               >
                 <img src={URL.createObjectURL(img)} alt={`Preview ${idx}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                 
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }}
                      className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center pointer-events-auto hover:bg-rose-600 transition-colors shadow-lg"
                    >
                      <X size={16} />
                    </button>
                 </div>
                 
                 {idx === 0 && title.includes('Exterior') && (
                   <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold tracking-widest text-white shadow-sm">
                     COVER
                   </div>
                 )}
               </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
