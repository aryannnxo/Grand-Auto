import { motion } from 'framer-motion';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 transform active:scale-95 shadow-lg rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-accent text-white hover:shadow-glow hover:from-primary-500 hover:to-accent-light border border-transparent",
    secondary: "bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200/50 hover:bg-white dark:bg-slate-800/80 dark:text-white dark:border-slate-700/50 dark:hover:bg-slate-700",
    outline: "bg-transparent shadow-none border-2 border-primary-200 text-primary-700 hover:border-primary-500 hover:text-primary-600 hover:shadow-glow dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400",
    ghost: "bg-transparent shadow-none hover:bg-slate-100/50 text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-primary-400",
    danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg shadow-red-500/30 border border-transparent"
  };
  
  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5",
    lg: "px-8 py-3 text-lg"
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
