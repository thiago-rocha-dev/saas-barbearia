import React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'ghost' 
  | 'outline' 
  | 'cyberpunk' 
  | 'neon' 
  | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  glow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    glow = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ease-in-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg',
      'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
      'relative overflow-hidden group',
      {
        'w-full': fullWidth,
        'cursor-not-allowed': disabled || isLoading,
      }
    );
    
    const getVariantClasses = (variant: ButtonVariant): string => {
      switch (variant) {
        case 'primary':
          return cn(
            'bg-gradient-to-r from-gold-500 to-gold-600 text-black',
            'hover:from-gold-400 hover:to-gold-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]',
            'focus-visible:ring-gold-500',
            'active:scale-95'
          );
        case 'secondary':
          return cn(
            'bg-dark-card text-white border border-dark-border',
            'hover:bg-dark-hover hover:border-gray-500 hover:shadow-[0_0_15px_rgba(75,85,99,0.3)]',
            'focus-visible:ring-gray-500'
          );
        case 'outline':
          return cn(
            'border-2 border-gold-500 text-gold-500 bg-transparent',
            'hover:bg-gold-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
            'focus-visible:ring-gold-500'
          );
        case 'cyberpunk':
          return cn(
            'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
            'hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]',
            'focus-visible:ring-cyan-400',
            'border border-cyan-400/30',
            'active:scale-95'
          );
        case 'neon':
          return cn(
            'bg-transparent border-2 border-cyan-400 text-cyan-400',
            'hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_25px_rgba(0,245,255,0.6)]',
            'focus-visible:ring-cyan-400',
            'shadow-[0_0_15px_rgba(0,245,255,0.2)]'
          );
        case 'ghost':
          return cn(
            'bg-transparent text-gray-300 hover:text-white',
            'hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]',
            'focus-visible:ring-gray-400'
          );
        case 'danger':
          return cn(
            'bg-gradient-to-r from-red-500 to-red-600 text-white',
            'hover:from-red-400 hover:to-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]',
            'focus-visible:ring-red-500',
            'active:scale-95'
          );
        case 'destructive':
          return cn(
            'bg-gradient-to-r from-red-600 to-red-700 text-white',
            'hover:from-red-500 hover:to-red-600 hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]',
            'focus-visible:ring-red-600',
            'active:scale-95'
          );
        default:
          return '';
      }
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 py-2 text-base gap-2',
      lg: 'h-12 px-6 text-lg gap-2.5',
      xl: 'h-14 px-8 text-xl gap-3'
    };

    const getGlowEffect = (): string => {
      if (!glow) return '';
      
      switch (variant) {
        case 'cyberpunk':
          return 'animate-pulse-glow shadow-[0_0_40px_rgba(0,245,255,0.6)]';
        case 'primary':
          return 'animate-pulse-glow shadow-[0_0_40px_rgba(245,158,11,0.6)]';
        case 'neon':
          return 'animate-pulse-glow shadow-[0_0_40px_rgba(0,245,255,0.8)]';
        default:
          return '';
      }
    };

    const LoadingSpinner = () => (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    );

    const renderContent = () => {
      if (isLoading) {
        return (
          <>
            <LoadingSpinner />
            <span className="opacity-70">Carregando...</span>
          </>
        );
      }

      return (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      );
    };

    return (
      <button
        className={cn(
          baseClasses, 
          getVariantClasses(variant), 
          sizes[size], 
          getGlowEffect(),
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Background animation effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-inherit">
          {renderContent()}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };