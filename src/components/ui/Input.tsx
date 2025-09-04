import React, { useState, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'cyberpunk' | 'neon';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, variant = 'cyberpunk', icon, isLoading, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const baseClasses = cn(
      'w-full px-4 py-3 text-white bg-transparent border rounded-lg transition-all duration-300 ease-in-out',
      'placeholder-transparent focus:outline-none focus:ring-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Variant styles
        'border-gray-600 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,245,255,0.3)]': variant === 'cyberpunk' && !error,
        'border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.2)]': variant === 'neon' && !error,
        'border-gray-500 focus:border-gray-400': variant === 'default' && !error,
        
        // Error states
        'border-red-500 focus:border-red-400 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)]': error,
        
        // Focus states
        'animate-pulse-glow': isFocused && variant === 'cyberpunk',
      },
      className
    );

    const labelClasses = cn(
      'absolute left-4 transition-all duration-300 ease-in-out pointer-events-none',
      'text-gray-400 font-medium',
      {
        // Floating label animation
        'top-3 text-base': !isFocused && !hasValue && !props.value,
        'top-1 text-xs text-cyan-400 font-semibold': isFocused || hasValue || props.value,
        
        // Error state
        'text-red-400': error && (isFocused || hasValue || props.value),
        
        // Glow effect when focused
        'drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]': isFocused && variant === 'cyberpunk' && !error,
      }
    );

    return (
      <div className="relative w-full">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(baseClasses, {
              'pl-10': icon,
              'pr-10': isLoading,
            })}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(e.target.value.length > 0);
              props.onChange?.(e);
            }}
            {...props}
          />
          
          {label && (
            <label className={labelClasses}>
              {label}
            </label>
          )}
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-400 animate-fade-in flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="animate-pulse">{error}</span>
          </div>
        )}
        
        {/* Cyberpunk glow effect */}
        {variant === 'cyberpunk' && isFocused && !error && (
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/10 to-blue-500/10 animate-pulse pointer-events-none"></div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };