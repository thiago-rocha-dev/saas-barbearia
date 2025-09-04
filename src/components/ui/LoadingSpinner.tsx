import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'cyberpunk' | 'neon' | 'pulse' | 'dots' | 'bars';
  color?: 'primary' | 'secondary' | 'cyan' | 'gold' | 'white';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'cyberpunk',
  color = 'cyan',
  className,
  text
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-gold-500',
    secondary: 'border-gray-400',
    cyan: 'border-cyan-400',
    gold: 'border-gold-500',
    white: 'border-white'
  };

  const glowColors = {
    primary: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    secondary: 'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
    cyan: 'shadow-[0_0_20px_rgba(0,245,255,0.5)]',
    gold: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    white: 'shadow-[0_0_20px_rgba(255,255,255,0.3)]'
  };

  const textColors = {
    primary: 'text-gold-500',
    secondary: 'text-gray-400',
    cyan: 'text-cyan-400',
    gold: 'text-gold-500',
    white: 'text-white'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'cyberpunk':
        return (
          <div className={cn('relative', sizes[size])}>
            {/* Outer ring */}
            <div className={cn(
              'absolute inset-0 rounded-full border-2 border-transparent',
              'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600',
              'animate-spin',
              glowColors[color]
            )}>
              <div className="absolute inset-0.5 rounded-full bg-dark-bg" />
            </div>
            
            {/* Inner ring */}
            <div className={cn(
              'absolute inset-1 rounded-full border-2',
              colors[color],
              'border-t-transparent animate-spin',
              'animation-delay-150'
            )} />
            
            {/* Center dot */}
            <div className={cn(
              'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
              'w-1 h-1 rounded-full',
              colors[color].replace('border-', 'bg-'),
              'animate-pulse'
            )} />
          </div>
        );

      case 'neon':
        return (
          <div className={cn('relative', sizes[size])}>
            <div className={cn(
              'absolute inset-0 rounded-full border-2',
              colors[color],
              'border-t-transparent animate-spin',
              glowColors[color],
              'animate-pulse-glow'
            )} />
            <div className={cn(
              'absolute inset-1 rounded-full border',
              colors[color],
              'border-b-transparent animate-spin',
              'animation-direction-reverse animation-duration-700'
            )} />
          </div>
        );

      case 'pulse':
        return (
          <div className={cn('relative', sizes[size])}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'absolute inset-0 rounded-full border-2',
                  colors[color],
                  'animate-ping',
                  glowColors[color]
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
            <div className={cn(
              'absolute inset-2 rounded-full',
              colors[color].replace('border-', 'bg-')
            )} />
          </div>
        );

      case 'dots':
        return (
          <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full',
                  colors[color].replace('border-', 'bg-'),
                  'animate-bounce',
                  glowColors[color]
                )}
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 bg-gradient-to-t',
                  'from-transparent',
                  colors[color].replace('border-', 'to-'),
                  'animate-pulse',
                  glowColors[color]
                )}
                style={{
                  height: `${12 + (i % 2) * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className={cn(
            'rounded-full border-2',
            colors[color],
            'border-t-transparent animate-spin',
            sizes[size]
          )} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {renderSpinner()}
      
      {text && (
        <div className={cn(
          'text-sm font-medium animate-pulse',
          textColors[color]
        )}>
          {text}
        </div>
      )}
    </div>
  );
};

// Full screen loading overlay
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  variant?: LoadingSpinnerProps['variant'];
}> = ({ isVisible, text = 'Carregando...', variant = 'cyberpunk' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card p-8 rounded-xl border border-cyan-400/30">
        <LoadingSpinner
          size="xl"
          variant={variant}
          color="cyan"
          text={text}
          className="text-center"
        />
      </div>
    </div>
  );
};

// Skeleton loading component
export const SkeletonLoader: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}> = ({ className, variant = 'rectangular', animation = 'pulse' }) => {
  const baseClasses = cn(
    'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700',
    'bg-[length:200%_100%]',
    {
      'animate-pulse': animation === 'pulse',
      'animate-shimmer': animation === 'wave',
      'rounded-full': variant === 'circular',
      'rounded': variant === 'rectangular',
      'rounded-md h-4': variant === 'text'
    },
    className
  );

  return <div className={baseClasses} />;
};

export { LoadingSpinner };
export type { LoadingSpinnerProps };