import React from 'react';

export const Input = React.forwardRef(({ label, icon: Icon, error, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`input-glass ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
