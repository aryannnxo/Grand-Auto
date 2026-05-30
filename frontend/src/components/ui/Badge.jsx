export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: "bg-primary-100/80 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50",
    success: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50",
    warning: "bg-amber-100/80 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50",
    danger: "bg-rose-100/80 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50",
    outline: "bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-300/50 dark:border-slate-600/50 backdrop-blur-sm",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
