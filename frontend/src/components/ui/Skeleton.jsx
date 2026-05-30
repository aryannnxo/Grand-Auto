import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <motion.div
      className={`bg-slate-200/50 dark:bg-slate-700/50 rounded-xl overflow-hidden relative ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent z-10"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />
    </motion.div>
  );
};

export const SkeletonCard = () => (
  <div className="glass-card p-4 flex flex-col gap-4">
    <Skeleton className="h-48 w-full rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center mt-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  </div>
);
