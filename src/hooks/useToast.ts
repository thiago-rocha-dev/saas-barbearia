import { useCallback } from 'react';
import type { ToastType } from '../types/toast';
import { globalToast } from '../components/ui/Toast';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

interface UseToastReturn {
  addToast: (options: ToastOptions & { type: ToastType }) => void;
  showToast: (message: string, type: ToastType, title?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToast = (): UseToastReturn => {
  const addToast = useCallback((options: ToastOptions & { type: ToastType }) => {
    globalToast.addToast(options);
  }, []);

  const showToast = useCallback((message: string, type: ToastType, title?: string) => {
    addToast({
      description: message,
      title,
      type
    });
  }, [addToast]);

  return {
    addToast,
    showToast,
    dismiss: globalToast.dismiss.bind(globalToast),
    dismissAll: globalToast.dismissAll.bind(globalToast),
  };
};

export type { ToastOptions, UseToastReturn };