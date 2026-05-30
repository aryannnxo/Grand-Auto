import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <motion.div 
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`glass-card p-6 ${hover ? 'hover:shadow-premium-hover hover:border-white/40 dark:hover:border-slate-700/80 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
