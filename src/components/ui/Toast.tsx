import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import type { ToastProps } from '../../types/toast';

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = 'info',
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const typeStyles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      border: 'border-green-400',
      icon: '✓',
      iconBg: 'bg-green-500',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
      border: 'border-red-400',
      icon: '✕',
      iconBg: 'bg-red-500',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-400',
      icon: '⚠',
      iconBg: 'bg-yellow-500',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]'
    },
    info: {
      bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
      border: 'border-cyan-400',
      icon: 'ℹ',
      iconBg: 'bg-cyan-500',
      glow: 'shadow-[0_0_25px_rgba(0,245,255,0.4)]'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm',
        'transform transition-all duration-300 ease-in-out',
        {
          'translate-x-0 opacity-100': isVisible && !isLeaving,
          'translate-x-full opacity-0': !isVisible || isLeaving,
        }
      )}
    >
      <div
        className={cn(
          'relative p-4 rounded-lg backdrop-blur-md border',
          'glass-card overflow-hidden',
          currentStyle.bg,
          currentStyle.border,
          currentStyle.glow,
          'animate-fade-in'
        )}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10 flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold',
            currentStyle.iconBg,
            'shadow-lg animate-pulse-glow'
          )}>
            {currentStyle.icon}
          </div>
          
          {/* Text content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-white font-semibold text-sm mb-1 leading-tight">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded-full',
              'flex items-center justify-center',
              'text-gray-400 hover:text-white',
              'hover:bg-white/10 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-white/20'
            )}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all ease-linear',
                currentStyle.iconBg
              )}
              style={{
                width: '100%',
                animation: `toast-progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    // Subscribe to global toast manager
    const unsubscribe = globalToast.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-3 pointer-events-none">
      {toasts && toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index
          }}
        >
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

// Global toast manager
class ToastManager {
  private listeners: Array<(toasts: ToastProps[]) => void> = [];
  private toasts: ToastProps[] = [];
  private counter = 0;

  subscribe(listener: (toasts: ToastProps[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  addToast(toast: Omit<ToastProps, 'id' | 'onClose'>) {
    const id = `global-toast-${++this.counter}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => this.dismiss(id),
    };

    this.toasts = [...this.toasts, newToast];
    this.notify();
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  dismissAll() {
    this.toasts = [];
    this.notify();
  }
}

export const globalToast = new ToastManager();

export { Toast, ToastContainer };